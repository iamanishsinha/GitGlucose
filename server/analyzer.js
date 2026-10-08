/**
 * Master Deterministic Analysis Engine
 * The canonical single source of truth for all GitGlucose profile audits.
 * Produces the complete AnalysisResult object.
 */

import { randomUUID } from 'node:crypto';
import { SCORE_WEIGHTS, CONSISTENCY_WEIGHTS, IMPACT_WEIGHTS, EFFORT_WEIGHTS, getVerdict } from './rules.js';
import { analyzeRepositories } from './repositories.js';
import { analyzeTechnologies } from './technology.js';
import { analyzeActivity } from './activity.js';
import { evaluateCareerPositioning } from './positioning.js';
import { generateGeminiRoast } from './gemini.js';
import { generateFallbackRoast } from './fallback.js';

/**
 * Analyzes normalized GitHub data and returns the canonical AnalysisResult
 * @param {object} normalizedData
 * @param {'gentle' | 'medium' | 'spicy'} tone
 * @param {string} targetRole
 * @returns {Promise<object>}
 */
export async function analyzeProfile(normalizedData, tone = 'medium', targetRole = 'full-stack') {
  const { profile, repositories, snapshot } = normalizedData;
  const analysisId = randomUUID();

  // 1. Analyze Core Repositories
  const repoAnalysis = analyzeRepositories(repositories);
  const totalRepos = repositories.length;

  // 2. Analyze Technologies & Breadth
  const techAnalysis = analyzeTechnologies(repositories);

  // 3. Analyze Activity
  const activityAnalysis = analyzeActivity(repositories);

  // 4. Compute First Impression Score (0-100)
  let firstImpression = 20;
  if (profile.bio && profile.bio.trim().length > 0) {
    firstImpression += 35;
    if (profile.bio.length >= 25) firstImpression += 15;
  }
  if (profile.hasProfileReadme) {
    firstImpression += 30;
  }
  if (profile.name && profile.name !== profile.login) {
    firstImpression += 10;
  }
  if (profile.blog || profile.twitterUsername || profile.location) {
    firstImpression += 10;
  }
  firstImpression = Math.min(100, Math.max(15, firstImpression));

  // 5. Compute Repository Hygiene Score (0-100)
  let repoHygiene = 35;
  let reposWithDesc = 0;
  let reposWithReadme = 0;
  let nonNoiseRepos = 0;

  for (const r of repoAnalysis.ranked) {
    if (r.description && r.description.length >= 15) reposWithDesc++;
    if (r.hasReadme) reposWithReadme++;
    if (r.signalCategory !== 'NOISE / EXPERIMENTAL') nonNoiseRepos++;
  }

  if (totalRepos > 0) {
    const descRatio = reposWithDesc / totalRepos;
    const readmeRatio = reposWithReadme / totalRepos;
    const noiseRatio = nonNoiseRepos / totalRepos;
    repoHygiene = Math.round((descRatio * 40) + (readmeRatio * 35) + (noiseRatio * 25));
  } else {
    repoHygiene = 20;
  }
  repoHygiene = Math.min(100, Math.max(15, repoHygiene));

  // 6. Compute Substance Score (0-100)
  let substance = 25;
  if (totalRepos > 0) {
    const nonForks = repositories.filter(r => !r.fork).length;
    const substantial = repositories.filter(r => r.size >= 50).length;
    const highSignal = repoAnalysis.signalSummary['HIGH SIGNAL'] || 0;

    const nonForkRatio = nonForks / totalRepos;
    const substantialRatio = Math.min(1, substantial / Math.max(1, Math.min(totalRepos, 5)));
    const starsTotal = repositories.reduce((acc, r) => acc + (r.stars || 0), 0);
    const starPoints = Math.min(15, starsTotal * 2);

    substance = Math.round((nonForkRatio * 35) + (substantialRatio * 35) + (Math.min(1, highSignal / 3) * 15) + starPoints);
  }
  substance = Math.min(100, Math.max(15, substance));

  // 7. Activity & Range scores
  const activityScore = activityAnalysis.score;
  const rangeScore = techAnalysis.breadthScore;

  // 8. Overall Composite Score (Deterministic)
  const rawOverall = (
    firstImpression * SCORE_WEIGHTS.firstImpression +
    repoHygiene * SCORE_WEIGHTS.repositoryHygiene +
    substance * SCORE_WEIGHTS.substance +
    activityScore * SCORE_WEIGHTS.activity +
    rangeScore * SCORE_WEIGHTS.range
  );
  const overallScore = Math.min(100, Math.max(10, Math.round(rawOverall)));
  const verdict = getVerdict(overallScore);

  // 9. Consistency Analysis (Section 35)
  const namingRatio = totalRepos > 0 ? (nonNoiseRepos / totalRepos) : 0.5;
  const descRatio = totalRepos > 0 ? (reposWithDesc / totalRepos) : 0.5;
  const readmeRatio = totalRepos > 0 ? (reposWithReadme / totalRepos) : 0.5;

  const namingConsistency = Math.round(namingRatio * 100);
  const descriptionConsistency = Math.round(descRatio * 100);
  const documentationConsistency = Math.round(readmeRatio * 100);
  const presentationConsistency = Math.round((firstImpression + repoHygiene) / 2);
  const technicalIdentity = Math.round(techAnalysis.languages[0]?.percentage || 50);

  const consistencyScore = Math.round(
    namingConsistency * CONSISTENCY_WEIGHTS.namingConsistency +
    descriptionConsistency * CONSISTENCY_WEIGHTS.descriptionConsistency +
    documentationConsistency * CONSISTENCY_WEIGHTS.documentationConsistency +
    presentationConsistency * CONSISTENCY_WEIGHTS.presentationConsistency +
    technicalIdentity * CONSISTENCY_WEIGHTS.technicalIdentity
  );

  // 10. Strengths Identification
  const strengths = [];
  if (profile.bio && profile.bio.length >= 20) {
    strengths.push({
      title: 'Clear Profile Bio',
      description: 'Your bio immediately introduces your identity to incoming visitors.',
    });
  }
  if (profile.hasProfileReadme) {
    strengths.push({
      title: 'Active Profile README',
      description: 'Your profile README provides a front door and structured overview of your work.',
    });
  }
  if (repoAnalysis.signalSummary['HIGH SIGNAL'] >= 2) {
    strengths.push({
      title: 'Identifiable Anchor Projects',
      description: `Detected ${repoAnalysis.signalSummary['HIGH SIGNAL']} high-signal repositories with clear substance and documentation.`,
    });
  }
  if (activityAnalysis.buckets.last30Days >= 1) {
    strengths.push({
      title: 'Active Recent Momentum',
      description: 'Public pushes recorded within the last 30 days demonstrate ongoing engineering activity.',
    });
  }
  if (techAnalysis.distinctCount >= 3) {
    strengths.push({
      title: 'Multi-Language Versatility',
      description: `Demonstrated technical breadth across ${techAnalysis.distinctCount} distinct languages (${techAnalysis.languages.slice(0, 3).map(l => l.name).join(', ')}).`,
    });
  }
  if (strengths.length === 0) {
    strengths.push({
      title: 'Public Repository Presence',
      description: `Public GitHub footprint established with ${totalRepos} visible repositories.`,
    });
  }

  // 11. Findings Engine (Section 21, 22, 23)
  const findings = [];

  // Finding: Missing Bio
  if (!profile.bio || profile.bio.trim().length === 0) {
    findings.push({
      id: 'missing-bio',
      category: 'first_impression',
      severity: 'high',
      title: 'Blank Profile Bio',
      fact: 'Your public profile bio contains no text.',
      evidence: ['GitHub profile bio is currently empty.'],
      inference: 'Recruiters and collaborators must spend extra time guessing your engineering focus.',
      recommendation: 'Add a concise 1-2 sentence bio stating your core technologies and current engineering interests.',
      impact: 'high',
      effort: 'low',
      confidence: 1.0,
      priorityScore: Number(((IMPACT_WEIGHTS.high / EFFORT_WEIGHTS.low) * 1.0).toFixed(1)),
    });
  }

  // Finding: Missing Profile README
  if (!profile.hasProfileReadme) {
    findings.push({
      id: 'missing-profile-readme',
      category: 'first_impression',
      severity: 'medium',
      title: 'No Profile README Detected',
      fact: `Special repository "${profile.login}/${profile.login}" was not found or is empty.`,
      evidence: ['No profile README repository found on GitHub.'],
      inference: 'Your GitHub landing page misses the opportunity to guide visitors to your best work.',
      recommendation: `Create a repository named "${profile.login}" and add a README highlighting your top 3 projects.`,
      impact: 'high',
      effort: 'medium',
      confidence: 0.95,
      priorityScore: Number(((IMPACT_WEIGHTS.high / EFFORT_WEIGHTS.medium) * 0.95).toFixed(1)),
    });
  }

  // Finding: Missing Descriptions
  const noDescCount = totalRepos - reposWithDesc;
  if (noDescCount > 0 && totalRepos > 0) {
    const ratio = Math.round((noDescCount / totalRepos) * 100);
    findings.push({
      id: 'missing-descriptions',
      category: 'repository_hygiene',
      severity: ratio > 40 ? 'high' : 'medium',
      title: `${noDescCount} Repositories Missing Descriptions`,
      fact: `${noDescCount} out of ${totalRepos} public repositories (${ratio}%) have no summary description.`,
      evidence: repoAnalysis.ranked.filter(r => !r.description).slice(0, 3).map(r => `Repo "${r.name}" has no description`),
      inference: 'Visitors browsing your repository list cannot evaluate project purpose at a glance.',
      recommendation: 'Add a crisp 1-sentence description and relevant topic tags to each public repository.',
      impact: 'high',
      effort: 'low',
      confidence: 1.0,
      priorityScore: Number(((IMPACT_WEIGHTS.high / EFFORT_WEIGHTS.low) * 1.0).toFixed(1)),
    });
  }

  // Finding: Missing Documentation / READMEs
  const noReadmeCount = totalRepos - reposWithReadme;
  if (noReadmeCount > 0 && totalRepos > 0) {
    findings.push({
      id: 'missing-readmes',
      category: 'substance',
      severity: 'high',
      title: `${noReadmeCount} Repositories Lack Complete READMEs`,
      fact: `${noReadmeCount} repositories lack introductory documentation or architecture notes.`,
      evidence: repoAnalysis.ranked.filter(r => !r.hasReadme).slice(0, 3).map(r => `Repo "${r.name}" lacks README documentation`),
      inference: 'Without instructions, reviewers cannot run, test, or understand your codebase architecture.',
      recommendation: 'Write a standard README containing project overview, setup steps, and screenshot/demo for your top repositories.',
      impact: 'high',
      effort: 'medium',
      confidence: 0.9,
      priorityScore: Number(((IMPACT_WEIGHTS.high / EFFORT_WEIGHTS.medium) * 0.9).toFixed(1)),
    });
  }

  // Finding: High Noise or Stale Ratio
  const noiseCount = repoAnalysis.signalSummary['NOISE / EXPERIMENTAL'] || 0;
  if (noiseCount >= 2) {
    findings.push({
      id: 'repository-noise',
      category: 'repository_hygiene',
      severity: 'medium',
      title: `${noiseCount} Low-Signal / Experimental Repositories`,
      fact: `${noiseCount} repositories detected with test-like names or minimal code volume.`,
      evidence: repoAnalysis.ranked.filter(r => r.signalCategory === 'NOISE / EXPERIMENTAL').slice(0, 3).map(r => `"${r.name}" categorized as noise/experimental`),
      inference: 'Experimental or tutorial clutter dilutes the visibility of your high-impact projects.',
      recommendation: 'Archive or make private throwaway school assignments or tutorial experiments.',
      impact: 'medium',
      effort: 'low',
      confidence: 0.85,
      priorityScore: Number(((IMPACT_WEIGHTS.medium / EFFORT_WEIGHTS.low) * 0.85).toFixed(1)),
    });
  }

  // Finding: Activity Dormancy
  if (activityAnalysis.buckets.last90Days === 0 && totalRepos > 0) {
    findings.push({
      id: 'stale-activity',
      category: 'activity',
      severity: 'high',
      title: 'No Public Pushes in Last 90 Days',
      fact: 'The most recent public repository push was more than 3 months ago.',
      evidence: activityAnalysis.mostRecentPush ? [`Last push detected on ${activityAnalysis.mostRecentPush.name} (${activityAnalysis.mostRecentPush.daysAgo} days ago)`] : ['No recent pushes recorded'],
      inference: 'Recruiters may assume engineering activity is dormant or paused.',
      recommendation: 'Commit updates, bug fixes, or new feature branches to show active learning momentum.',
      impact: 'high',
      effort: 'medium',
      confidence: 0.9,
      priorityScore: Number(((IMPACT_WEIGHTS.high / EFFORT_WEIGHTS.medium) * 0.9).toFixed(1)),
    });
  }

  // Sort findings descending by priorityScore
  findings.sort((a, b) => b.priorityScore - a.priorityScore);

  // Helper metrics for dynamic recruiter timeline
  const starsTotal = repositories.reduce((acc, r) => acc + (r.stars || 0), 0);
  const nonForks = repositories.filter(r => !r.fork).length;
  const reposWithLiveDemo = repositories.filter(r => Boolean(r.homepage && r.homepage.trim().length > 0));
  const substantialCount = repositories.filter(r => r.size >= 50).length;
  const topRepo = repoAnalysis.topRepositories[0] || null;
  const topRepoName = topRepo ? topRepo.name : (repositories[0]?.name || 'None');
  const topRepoLang = topRepo ? topRepo.language : (repositories[0]?.language || 'Plain');
  const topRepoStars = topRepo ? topRepo.stars : 0;
  const topRepoHasReadme = topRepo ? topRepo.hasReadme : false;

  // Profile completeness score (0-100)
  let profileCompleteness = 20;
  if (profile.name && profile.name !== profile.login) profileCompleteness += 20;
  if (profile.bio && profile.bio.trim().length > 0) profileCompleteness += 25;
  if (profile.hasProfileReadme) profileCompleteness += 20;
  if (profile.avatarUrl && !profile.avatarUrl.includes('identicon')) profileCompleteness += 15;
  if (profile.location || profile.blog || profile.twitterUsername) profileCompleteness += 20;
  profileCompleteness = Math.min(100, profileCompleteness);

  // Shortlist Simulation (Section 28)
  let shortlistStatus = 'PASS';
  let shortlistReasoning = '';

  if (overallScore >= 75 && substance >= 65 && firstImpression >= 60) {
    shortlistStatus = 'SHORTLIST';
    shortlistReasoning = 'Solid technical substance, active projects, and clear profile identity meet initial recruiter screen criteria.';
  } else if (overallScore >= 55 || (substance >= 68 && firstImpression < 60)) {
    shortlistStatus = 'MAYBE';
    shortlistReasoning = 'Clear project potential detected, but presentation gaps or missing descriptions dilute portfolio punch.';
  } else {
    shortlistStatus = 'PASS';
    shortlistReasoning = 'Sparse documentation, blank profile context, or dormant activity will cause recruiters to pass within 30 seconds.';
  }

  // Derive strongest positive asset & primary bottleneck
  let strongestAsset = 'Original project volume';
  if (starsTotal >= 10) strongestAsset = `${starsTotal} GitHub stars showing peer validation`;
  else if (activityAnalysis.daysSinceLastPush <= 14) strongestAsset = 'Active and consistent recent push momentum';
  else if (profile.hasProfileReadme) strongestAsset = 'Polished profile README front door';
  else if (repoAnalysis.signalSummary['HIGH SIGNAL'] > 0) strongestAsset = `${repoAnalysis.signalSummary['HIGH SIGNAL']} high-signal flagship repositories`;
  else if (techAnalysis.distinctCount >= 3) strongestAsset = `Multi-language stack breadth (${techAnalysis.distinctCount} languages)`;

  let primaryBottleneck = 'Add descriptions to repositories';
  if (!profile.bio || profile.bio.trim().length === 0) primaryBottleneck = 'Missing developer bio';
  else if (reposWithLiveDemo.length === 0) primaryBottleneck = 'Lack of live deployment URLs';
  else if (activityAnalysis.daysSinceLastPush > 60) primaryBottleneck = 'Commit dormancy over past 2 months';
  else if (noDescCount > 0) primaryBottleneck = `${noDescCount} repositories lack descriptions`;
  else if (!profile.hasProfileReadme) primaryBottleneck = 'Missing curated profile README';

  // 12. Recruiter Attention Timeline & Shortlist Simulation (Section 27, 28)
  const recruiterTimeline = [
    {
      window: '0–5 SEC',
      label: 'Identity & First Impression',
      focus: 'Profile Identity & Completeness',
      observation: profile.bio && profile.bio.trim().length > 0
        ? `Candidate presents a recognizable identity with display name "${profile.name || profile.login}" and bio: "${profile.bio.slice(0, 100)}". Profile completeness sits at ${profileCompleteness}%. Recruiters instantly understand candidate direction.`
        : `Recruiter encounters a sparse profile with no developer bio or stated focus. Profile completeness is ${profileCompleteness}%. Without an introductory hook, recruiters must deduce candidate specialty manually.`,
      signal: profile.bio ? 'Bio present and informative' : 'Missing bio requires detective work',
      strength: profile.bio ? 'Quickly communicates candidate direction' : null,
      concern: !profile.bio ? 'No instant professional hook' : null,
      evidence: profile.bio ? `Bio: "${profile.bio.slice(0, 60)}..."` : 'Bio field is empty',
      signals: [
        profile.name && profile.name !== profile.login ? `Display name: "${profile.name}"` : 'Display name: Unset (shows username)',
        profile.bio ? `Bio: "${profile.bio.slice(0, 45)}..."` : 'Bio: Not configured',
        profile.hasProfileReadme ? 'Profile README: Active portfolio anchor' : 'Profile README: Missing (standard grid view)',
      ],
    },
    {
      window: '5–10 SEC',
      label: 'Profile Landing & Context',
      focus: 'Flagship Projects & Initial Credibility',
      observation: totalRepos > 0
        ? `Scanning top projects: Lead repository "${topRepoName}" (${topRepoLang}, ${topRepoStars}★) ${topRepoHasReadme ? 'anchors the profile with visible README documentation' : 'lacks an immediate README walkthrough'}. Primary visible stack: ${techAnalysis.primaryLanguage || 'General'}. ${profile.hasProfileReadme ? 'A curated profile README guides visitor attention to key accomplishments.' : 'Without a profile README, project discovery relies on raw alphabetical/push order.'}`
        : 'No public repositories found; recruiters have no visible code samples to evaluate candidate technical capabilities.',
      signal: profile.hasProfileReadme ? 'Profile README anchors the visit' : 'Standard bare grid view',
      strength: profile.hasProfileReadme ? 'Curated portfolio showcase visible' : null,
      concern: !profile.hasProfileReadme ? 'Visitors forced to browse raw repo list' : null,
      evidence: profile.hasProfileReadme ? 'Profile README exists' : 'No profile README detected',
      signals: [
        `Lead project: "${topRepoName}" (${topRepoLang || 'Plain'})`,
        `README quality: ${topRepoHasReadme ? 'Verified in lead project' : 'Missing lead README'}`,
        `Primary stack: ${techAnalysis.primaryLanguage || 'Undetermined'}`,
      ],
    },
    {
      window: '10–20 SEC',
      label: 'Project Selection & Depth',
      focus: 'Repository Quality, Substance & Documentation',
      observation: totalRepos > 0
        ? `Deep dive across ${totalRepos} public repositories: ${nonForks} are original builds (${Math.round((nonForks / Math.max(1, totalRepos)) * 100)}% original work). README coverage is ${Math.round((reposWithReadme / Math.max(1, totalRepos)) * 100)}%, and description hygiene is ${Math.round((reposWithDesc / Math.max(1, totalRepos)) * 100)}%. Total stars accumulated: ${starsTotal}. ${substantialCount > 0 ? `${substantialCount} projects show meaningful codebase size (>50 KB).` : 'Projects are predominantly small or script-sized.'}`
        : 'Zero repository depth available for inspection.',
      signal: `${repoAnalysis.signalSummary['HIGH SIGNAL']} high-signal projects identified`,
      strength: repoAnalysis.topRepositories[0]?.hasReadme ? `Top project "${repoAnalysis.topRepositories[0]?.name}" is documented` : null,
      concern: noDescCount > 0 ? `${noDescCount} repositories lack descriptions` : null,
      evidence: `Top repo: "${repoAnalysis.topRepositories[0]?.name || 'None'}" (Score: ${repoAnalysis.topRepositories[0]?.score || 0}/100)`,
      signals: [
        `Original codebases: ${nonForks} / ${totalRepos} (${Math.round((nonForks / Math.max(1, totalRepos)) * 100)}%)`,
        `README documentation: ${reposWithReadme} / ${totalRepos} (${Math.round((reposWithReadme / Math.max(1, totalRepos)) * 100)}%)`,
        `Substantial depth: ${substantialCount} repo(s) over 50 KB`,
      ],
    },
    {
      window: '20–25 SEC',
      label: 'Technology Stack Clarity',
      focus: 'Live Deployments, Consistency & Credibility',
      observation: reposWithLiveDemo.length > 0
        ? `${reposWithLiveDemo.length} repository(s) include live demo links (e.g. "${reposWithLiveDemo[0].name}"), giving recruiters instant proof of working software. Push momentum is ${(activityAnalysis?.level || 'dormant').toLowerCase()} (last commit ${activityAnalysis?.daysSinceLastPush ?? 'N/A'} days ago). Overall repository consistency score is ${consistencyScore}/100.`
        : `No live demo URLs or deployment links found in repository headers; recruiters cannot test running applications. Push momentum is ${(activityAnalysis?.level || 'dormant').toLowerCase()} (last commit ${activityAnalysis?.daysSinceLastPush ?? 'N/A'} days ago). Overall repository consistency score is ${consistencyScore}/100.`,
      signal: `Primary focus: ${techAnalysis.primaryLanguage} (${techAnalysis.languages[0]?.percentage || 0}% of repos)`,
      strength: techAnalysis.distinctCount >= 3 ? `${techAnalysis.distinctCount} languages detected` : null,
      concern: techAnalysis.distinctCount <= 1 ? 'Limited language breadth detected' : null,
      evidence: techAnalysis.languages.slice(0, 3).map(l => `${l.name} (${l.repoCount})`).join(', ') || 'No languages detected',
      signals: [
        `Live deployment links: ${reposWithLiveDemo.length > 0 ? `${reposWithLiveDemo.length} found` : 'None detected'}`,
        `Push momentum: ${activityAnalysis?.level || 'Dormant'} (${activityAnalysis?.daysSinceLastPush ?? '?'}d ago)`,
        `Consistency rating: ${consistencyScore} / 100`,
      ],
    },
    {
      window: '25–30 SEC',
      label: 'Recent Activity & Commitment',
      focus: 'Recruiter Shortlist Decision & Final Verdict',
      observation: `30-second verdict: ${shortlistStatus}. ${shortlistReasoning} Strongest candidate asset: ${strongestAsset}. Primary portfolio bottleneck: ${primaryBottleneck}.`,
      signal: activityAnalysis?.concentrationLabel || 'No push activity',
      strength: (activityAnalysis?.buckets?.last30Days || 0) > 0 ? `${activityAnalysis.buckets.last30Days} projects updated this month` : null,
      concern: (activityAnalysis?.buckets?.last90Days || 0) === 0 ? 'No public activity in last 90 days' : null,
      evidence: activityAnalysis.mostRecentPush ? `Last active: ${activityAnalysis.mostRecentPush.daysAgo} days ago` : 'No push data',
      signals: [
        `Screening verdict: ${shortlistStatus}`,
        `Leading strength: ${strongestAsset}`,
        `Recommended fix: ${primaryBottleneck}`,
      ],
    },
  ];

  // 13. Before vs After Simulation (Section 37)
  let simulatedGain = 0;
  const assumptions = [];

  if (!profile.bio || profile.bio.length < 20) {
    simulatedGain += 6;
    assumptions.push('Add an impactful 2-sentence bio (+6 pts)');
  }
  if (!profile.hasProfileReadme) {
    simulatedGain += 7;
    assumptions.push('Publish a curated profile README with pinned highlights (+7 pts)');
  }
  if (noDescCount > 0) {
    const descGain = Math.min(8, Math.round((noDescCount / Math.max(1, totalRepos)) * 10));
    simulatedGain += descGain;
    assumptions.push(`Add clear descriptions to all ${noDescCount} repositories (+${descGain} pts)`);
  }
  if (noReadmeCount > 0) {
    const readmeGain = Math.min(6, Math.round((noReadmeCount / Math.max(1, totalRepos)) * 8));
    simulatedGain += readmeGain;
    assumptions.push(`Write comprehensive READMEs for top repositories (+${readmeGain} pts)`);
  }
  if (noiseCount >= 2) {
    simulatedGain += 4;
    assumptions.push(`Archive ${noiseCount} playground / noise repositories (+4 pts)`);
  }

  // Realistic bounds
  const potentialImprovement = Math.min(22, Math.max(6, simulatedGain));
  const potentialScore = Math.min(96, overallScore + potentialImprovement);

  // 14. Career Positioning for all roles (precomputed for instant switching)
  const allPositionings = {};
  for (const rKey of ['full-stack', 'backend', 'frontend', 'ai-ml', 'devops', 'software-engineer']) {
    allPositionings[rKey] = evaluateCareerPositioning(repositories, techAnalysis, rKey);
  }
  const positioning = allPositionings[targetRole] || allPositionings['full-stack'];

  // 15. AI-Assistance Signal (Section 44)
  const aiKeywords = ['copilot', 'chatgpt', 'openai', 'llm', 'anthropic', 'prompt', 'gemini', 'claude'];
  let aiHits = 0;
  const aiEvidence = [];

  for (const repo of repositories) {
    const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    for (const kw of aiKeywords) {
      if (text.includes(kw)) {
        aiHits++;
        aiEvidence.push(`Repository "${repo.name}" references "${kw}" in metadata`);
        break;
      }
    }
  }

  let aiSignal = 'LOW SIGNAL';
  let aiConfidence = 'moderate';
  if (aiHits >= 3) {
    aiSignal = 'HIGH SIGNAL';
    aiConfidence = 'high';
  } else if (aiHits >= 1) {
    aiSignal = 'MEDIUM SIGNAL';
    aiConfidence = 'moderate';
  } else {
    aiSignal = 'LOW SIGNAL';
    aiConfidence = 'low';
    aiEvidence.push('No obvious AI-assisted project keywords detected in public repository names or topics.');
  }

  // 16. Rescue System: 30-Minute & 7-Day Action Plans (Section 38)
  const rescueQuick30 = [
    {
      step: 1,
      window: '0–5 min',
      title: 'Craft a Definitive Profile Bio',
      why: 'Recruiters spend their first 5 seconds looking for technical identity.',
      action: 'Set your GitHub bio to: "[Specialty] Engineer | Building with [Core Stack] | Interested in [Area]"',
      impact: 'high',
      effort: 'low',
    },
    {
      step: 2,
      window: '5–10 min',
      title: 'Prune Obvious Noise Repositories',
      why: 'Throwaway tutorial and homework repos clutter your portfolio signal.',
      action: 'Archive or turn private at least 2 experimental or duplicate repos.',
      impact: 'medium',
      effort: 'low',
    },
    {
      step: 3,
      window: '10–20 min',
      title: 'Add Descriptions to Top 3 Repositories',
      why: 'Repos without descriptions look abandoned or careless at a glance.',
      action: 'Write a concise 1-sentence summary for your 3 highest-starred or most substantial projects.',
      impact: 'high',
      effort: 'low',
    },
    {
      step: 4,
      window: '20–27 min',
      title: 'Polish the Lead README',
      why: 'A recruiter who clicks into a repo needs to see what it is, why it exists, and how to run it.',
      action: 'Add a project overview, tech stack badges, and setup/run instructions to your flagship repository.',
      impact: 'high',
      effort: 'medium',
    },
    {
      step: 5,
      window: '27–30 min',
      title: 'Verify Profile Hygiene & Links',
      why: 'Broken websites or dead demo links instantly erode credibility.',
      action: 'Confirm your location, LinkedIn/portfolio link, and email/twitter are accurate.',
      impact: 'medium',
      effort: 'low',
    },
  ];

  const rescueFull7Day = [
    { day: 1, focus: 'Identity & First Impression', task: 'Write a crisp bio and publish your username/username Profile README with a brief intro and top 3 pinned repositories.' },
    { day: 2, focus: 'Repository Cleanup & Curation', task: 'Audit all public repositories. Archive stale experiments, add missing descriptions, and tag each with 3-5 relevant topics.' },
    { day: 3, focus: 'Flagship Documentation', task: 'Revamp the README of your primary project. Add an architecture diagram, setup steps, environment variables, and live demo link.' },
    { day: 4, focus: 'Technical Portfolio Depth', task: 'Identify your second strongest project. Refactor code smells, remove committed temporary files, and write comprehensive API or usage docs.' },
    { day: 5, focus: 'Activity Momentum & Testing', task: 'Add unit tests (e.g. node:test or pytest) and configure a lightweight GitHub Actions CI workflow to show professional engineering rigor.' },
    { day: 6, focus: 'Visual Proof & Demos', task: 'Add architecture screenshots, GIFs, or live deployment URLs (e.g. Cloud Run, Vercel) directly into project documentation.' },
    { day: 7, focus: 'Recruiter Audit & Benchmark', task: 'Re-run GitGlucose audit. Compare your new health score against your day 1 baseline and verify your Shortlist simulation.' },
  ];

  // 17. Generate Roast (Gemini with Fallback)
  const analysisContext = {
    profile,
    scores: {
      overall: overallScore,
      firstImpression,
      repositoryHygiene: repoHygiene,
      substance,
      activity: activityScore,
      range: rangeScore,
    },
    verdict,
    stats: {
      totalRepos,
      reposWithoutDescription: noDescCount,
      reposWithoutReadme: noReadmeCount,
      hasProfileReadme: profile.hasProfileReadme,
      activeRepos: activityAnalysis.buckets.last90Days,
      noiseCount,
      primaryLanguage: techAnalysis.primaryLanguage,
    },
    technologies: techAnalysis,
    findings,
  };

  let roastPayload = await generateGeminiRoast(analysisContext, tone);
  if (!roastPayload || !Array.isArray(roastPayload.roast) || roastPayload.roast.length === 0) {
    roastPayload = generateFallbackRoast(analysisContext, tone);
  }

  // Canonical AnalysisResult (Section 49)
  return {
    analysisId,
    username: profile.login,
    snapshot,
    profile,
    scores: {
      overall: overallScore,
      firstImpression,
      repositoryHygiene: repoHygiene,
      substance,
      activity: activityScore,
      range: rangeScore,
    },
    verdict,
    strengths,
    findings,
    priorities: findings.slice(0, 4),
    repositories: {
      total: repoAnalysis.total,
      ranked: repoAnalysis.ranked,
      signalSummary: repoAnalysis.signalSummary,
      lifecycleSummary: repoAnalysis.lifecycleSummary,
      topRepositories: repoAnalysis.topRepositories,
    },
    technologies: techAnalysis,
    activity: activityAnalysis,
    consistency: {
      score: consistencyScore,
      dimensions: {
        namingConsistency,
        descriptionConsistency,
        documentationConsistency,
        presentationConsistency,
        technicalIdentity,
      },
    },
    recruiter: {
      attentionTimeline: recruiterTimeline,
      shortlistSimulation: {
        status: shortlistStatus,
        reasoning: shortlistReasoning,
        badge: shortlistStatus === 'SHORTLIST' ? '🟢 SHORTLIST' : shortlistStatus === 'MAYBE' ? '🟡 MAYBE' : '🔴 PASS',
      },
      strengths: recruiterTimeline.map(t => t.strength).filter(Boolean),
      concerns: recruiterTimeline.map(t => t.concern).filter(Boolean),
    },
    positioning,
    allPositionings,
    beforeAfter: {
      currentScore: overallScore,
      potentialScore,
      improvement: potentialImprovement,
      assumptions,
      disclaimer: 'Potential score is a simulated projection based on addressable findings; it is not an absolute guarantee.',
    },
    rescue: {
      quick30: rescueQuick30,
      full7Day: rescueFull7Day,
    },
    aiAssistance: {
      signal: aiSignal,
      confidence: aiConfidence,
      evidence: aiEvidence,
      disclaimer: 'Inference heuristic based on public repository naming and metadata; not a measurement of source code authorship percentage.',
    },
    roast: {
      tone,
      lines: roastPayload.roast,
      bioSuggestion: roastPayload.bio,
      source: roastPayload.source,
    },
    limitations: [
      'Analysis is strictly derived from publicly available GitHub API endpoints.',
      'Private repositories and commits are not visible or factored into scoring.',
      'Repository push dates (pushed_at) are utilized as an activity proxy.',
      'Recruiter Shortlist and Before/After projections are analytical simulations.',
    ],
  };
}
