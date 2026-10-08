/**
 * Repository Intelligence & Deterministic Scoring Engine
 * Evaluates repository depth, purpose clarity, signal vs noise, and lifecycle.
 */

import { REPOSITORY_SCORE_WEIGHTS, LIFECYCLE_THRESHOLDS } from './rules.js';

const NOISE_NAME_PATTERNS = [
  /^test/i, /test$/i, /^temp/i, /^demo/i, /^sample/i, /^tutorial/i,
  /^hw[0-9_-]/i, /^homework/i, /^assignment/i, /^lab[0-9_-]/i,
  /^untitled/i, /^practice/i, /^sandbox/i, /^playground/i
];

/**
 * Evaluates a single repository and computes its composite score and classifications
 * @param {object} repo Normalized repository object
 * @param {Date} now Current timestamp
 * @returns {object} Scored repository with diagnostics
 */
export function evaluateRepository(repo, now = new Date()) {
  const name = repo.name || '';
  const description = (repo.description || '').trim();
  const sizeKb = repo.size || 0;
  const isFork = Boolean(repo.fork);
  const isArchived = Boolean(repo.archived);
  const language = repo.language || 'Unknown';
  const stars = repo.stars || 0;
  const forksCount = repo.forks || 0;
  const hasReadme = Boolean(repo.hasReadme);
  const pushedAt = repo.pushedAt ? new Date(repo.pushedAt) : null;

  // Days since last push
  const daysSincePush = pushedAt ? Math.max(0, Math.floor((now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24))) : 9999;

  // 1. Purpose Clarity (0-100)
  let purposeClarity = 0;
  const isNoiseNamed = NOISE_NAME_PATTERNS.some(p => p.test(name));
  if (!isNoiseNamed && name.length >= 3) purposeClarity += 30;
  if (description.length >= 15) {
    purposeClarity += 50;
    if (description.length >= 40) purposeClarity += 20;
  } else if (description.length > 0) {
    purposeClarity += 25;
  }

  // 2. Documentation (0-100)
  let documentation = 0;
  if (hasReadme) documentation += 70;
  if (description.length >= 25) documentation += 20;
  if (repo.homepage) documentation += 10;

  // 3. Technical Evidence (0-100)
  let technicalEvidence = 0;
  if (language && language !== 'Unknown') technicalEvidence += 30;
  if (sizeKb >= 100) technicalEvidence += 35;
  else if (sizeKb >= 25) technicalEvidence += 20;
  else if (sizeKb > 0) technicalEvidence += 10;

  if (!isFork) technicalEvidence += 20;
  // Modest cap on stars/forks so popularity doesn't artificially skew quality
  const socialBoost = Math.min(15, (stars * 3) + (forksCount * 4));
  technicalEvidence += socialBoost;

  // 4. Activity (0-100)
  let activity = 0;
  if (daysSincePush <= 30) activity = 100;
  else if (daysSincePush <= 90) activity = 80;
  else if (daysSincePush <= 180) activity = 60;
  else if (daysSincePush <= 365) activity = 35;
  else activity = 10;

  // 5. Completeness (0-100)
  let completeness = 0;
  if (sizeKb >= 50) completeness += 35;
  else if (sizeKb >= 10) completeness += 20;
  if (!isArchived) completeness += 25;
  if (repo.topics && repo.topics.length > 0) completeness += 20;
  if (repo.hasWiki || repo.hasPages || repo.license) completeness += 20;

  // 6. Portfolio Relevance (0-100)
  let portfolioRelevance = 0;
  if (!isFork) portfolioRelevance += 40;
  if (!isNoiseNamed) portfolioRelevance += 30;
  if (sizeKb >= 50 && (hasReadme || description.length >= 20)) portfolioRelevance += 30;

  // Composite calculation
  const compositeScore = Math.round(
    purposeClarity * REPOSITORY_SCORE_WEIGHTS.purposeClarity +
    documentation * REPOSITORY_SCORE_WEIGHTS.documentation +
    technicalEvidence * REPOSITORY_SCORE_WEIGHTS.technicalEvidence +
    activity * REPOSITORY_SCORE_WEIGHTS.activity +
    completeness * REPOSITORY_SCORE_WEIGHTS.completeness +
    portfolioRelevance * REPOSITORY_SCORE_WEIGHTS.portfolioRelevance
  );

  // Lifecycle classification
  let lifecycle = 'STALE';
  if (isArchived || daysSincePush > LIFECYCLE_THRESHOLDS.abandonedDays) {
    lifecycle = isArchived ? 'ARCHIVED' : 'ABANDONED';
  } else if (daysSincePush <= LIFECYCLE_THRESHOLDS.activeDays && sizeKb >= LIFECYCLE_THRESHOLDS.experimentalMaxSizeKb) {
    lifecycle = 'ACTIVE';
  } else if (daysSincePush <= 180 && (sizeKb < LIFECYCLE_THRESHOLDS.experimentalMaxSizeKb || isNoiseNamed)) {
    lifecycle = 'EXPERIMENTAL';
  } else {
    lifecycle = 'STALE';
  }

  // Signal vs Noise classification
  let signalCategory = 'MEDIUM SIGNAL';
  if (isNoiseNamed && sizeKb < 40 && stars === 0) {
    signalCategory = 'NOISE / EXPERIMENTAL';
  } else if (compositeScore >= 68 && !isFork && (hasReadme || description.length >= 20)) {
    signalCategory = 'HIGH SIGNAL';
  } else if (compositeScore >= 45) {
    signalCategory = 'MEDIUM SIGNAL';
  } else {
    signalCategory = isNoiseNamed ? 'NOISE / EXPERIMENTAL' : 'LOW SIGNAL';
  }

  // Strengths & Concerns
  const strengths = [];
  const concerns = [];
  const recommendations = [];

  if (hasReadme) strengths.push('Has dedicated README documentation');
  else {
    concerns.push('Missing README file');
    recommendations.push('Add an introductory README covering installation and architecture');
  }

  if (description.length >= 20) strengths.push('Clear project summary in repository metadata');
  else {
    concerns.push('Vague or missing repository description');
    recommendations.push('Write a concise 1-2 sentence description explaining the repository purpose');
  }

  if (daysSincePush <= 90) strengths.push('Active maintenance in the last quarter');
  else if (daysSincePush > 365) concerns.push(`No updates in over a year (${daysSincePush} days stale)`);

  if (isFork) concerns.push('Forked repository (does not demonstrate original authorship)');

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.fullName,
    description: repo.description || '',
    htmlUrl: repo.htmlUrl,
    language,
    sizeKb,
    stars,
    forks: forksCount,
    isFork,
    isArchived,
    hasReadme,
    pushedAt: repo.pushedAt,
    daysSincePush,
    lifecycle,
    signalCategory,
    score: Math.min(100, Math.max(0, compositeScore)),
    dimensions: {
      purposeClarity: Math.min(100, purposeClarity),
      documentation: Math.min(100, documentation),
      technicalEvidence: Math.min(100, technicalEvidence),
      activity: Math.min(100, activity),
      completeness: Math.min(100, completeness),
      portfolioRelevance: Math.min(100, portfolioRelevance),
    },
    strengths,
    concerns,
    recommendations,
  };
}

/**
 * Analyzes collection of normalized repositories, ranks them, and aggregates signal counts
 * @param {Array<object>} repositories
 * @returns {object} Ranked repositories and summary stats
 */
export function analyzeRepositories(repositories) {
  const now = new Date();
  const scored = repositories.map(r => evaluateRepository(r, now));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const signalCounts = {
    'HIGH SIGNAL': 0,
    'MEDIUM SIGNAL': 0,
    'LOW SIGNAL': 0,
    'NOISE / EXPERIMENTAL': 0,
  };

  const lifecycleCounts = {
    'ACTIVE': 0,
    'EXPERIMENTAL': 0,
    'STALE': 0,
    'ABANDONED': 0,
    'ARCHIVED': 0,
  };

  for (const item of scored) {
    if (signalCounts[item.signalCategory] !== undefined) {
      signalCounts[item.signalCategory]++;
    }
    if (lifecycleCounts[item.lifecycle] !== undefined) {
      lifecycleCounts[item.lifecycle]++;
    }
  }

  return {
    total: scored.length,
    ranked: scored,
    signalSummary: signalCounts,
    lifecycleSummary: lifecycleCounts,
    topRepositories: scored.slice(0, 5),
  };
}
