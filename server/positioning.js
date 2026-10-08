/**
 * Career Positioning Intelligence
 * Maps GitHub technical evidence against role requirements matrices.
 */

import { ROLE_MATRICES } from './rules.js';

/**
 * Evaluates profile alignment with a specified target career role
 * @param {Array<object>} repositories
 * @param {object} techAnalysis
 * @param {string} targetRoleKey
 * @returns {object} Career positioning alignment report
 */
export function evaluateCareerPositioning(repositories, techAnalysis, targetRoleKey = 'full-stack') {
  const roleConfig = ROLE_MATRICES[targetRoleKey] || ROLE_MATRICES['full-stack'];
  const title = roleConfig.title;

  // Flatten detected keywords from all repos
  const repoCorpus = repositories.map(r =>
    `${r.name} ${r.language || ''} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase()
  );

  const matchedEvidence = [];
  const missingGaps = [];

  let totalSignalMatches = 0;
  let categoryCount = 0;

  for (const [category, markers] of Object.entries(roleConfig.techMarkers)) {
    categoryCount++;
    const foundMarkers = new Set();

    for (const marker of markers) {
      for (const text of repoCorpus) {
        if (text.includes(marker)) {
          foundMarkers.add(marker);
        }
      }
    }

    if (foundMarkers.size > 0) {
      totalSignalMatches++;
      matchedEvidence.push({
        category,
        evidence: Array.from(foundMarkers).slice(0, 4).join(', '),
        count: foundMarkers.size,
      });
    } else {
      missingGaps.push(`No public repositories exhibiting ${category} markers`);
    }
  }

  // Calculate alignment score (0-100)
  const categoryRatio = categoryCount > 0 ? (totalSignalMatches / categoryCount) : 0;
  const rawScore = Math.round(categoryRatio * 75 + (repositories.length > 2 ? 15 : 5) + Math.min(10, techAnalysis.breadthScore * 0.1));
  const alignmentScore = Math.min(100, Math.max(20, rawScore));

  // Determine signal label
  let alignmentLabel = 'LOW SIGNAL';
  if (alignmentScore >= 75) alignmentLabel = 'STRONG SIGNAL';
  else if (alignmentScore >= 55) alignmentLabel = 'MODERATE SIGNAL';

  return {
    targetRole: title,
    targetRoleKey,
    score: alignmentScore,
    alignmentLabel,
    statement: `Your current GitHub shows ${alignmentLabel.toLowerCase()}s for ${title} roles based on public repository markers.`,
    matchedEvidence,
    missingGaps: missingGaps.length > 0 ? missingGaps : roleConfig.missingGaps,
    recommendations: [
      `Anchor your top repository around explicit ${title.toLowerCase()} documentation and architecture diagrams.`,
      `Pin 2-3 repositories that demonstrate end-to-end depth in ${title.toLowerCase()} tooling.`,
    ],
    availableRoles: Object.entries(ROLE_MATRICES).map(([key, conf]) => ({
      key,
      title: conf.title,
    })),
  };
}
