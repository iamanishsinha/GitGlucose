/**
 * Technology Intelligence Module
 * Analyzes language breakdown, technical breadth, and detected vs inferred frameworks.
 */

/**
 * Aggregates technology and language distribution from normalized repositories
 * @param {Array<object>} repositories
 * @returns {object} Technology intelligence breakdown
 */
export function analyzeTechnologies(repositories) {
  const languageCounts = {};
  const topicCounts = {};
  let totalWithLanguage = 0;

  for (const repo of repositories) {
    const lang = repo.language;
    if (lang && lang !== 'Unknown') {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      totalWithLanguage++;
    }

    if (Array.isArray(repo.topics)) {
      for (const t of repo.topics) {
        const lower = t.toLowerCase().trim();
        if (lower) {
          topicCounts[lower] = (topicCounts[lower] || 0) + 1;
        }
      }
    }
  }

  // Sorted language list with percentages
  const languages = Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      repoCount: count,
      percentage: totalWithLanguage > 0 ? Math.round((count / totalWithLanguage) * 100) : 0,
      detectedIn: `${count} ${count === 1 ? 'repository' : 'repositories'}`,
    }))
    .sort((a, b) => b.repoCount - a.repoCount);

  // Compute Technical Breadth / Range Score (0-100)
  const distinctCount = languages.length;
  let breadthScore = 40;

  if (distinctCount === 0) {
    breadthScore = 30;
  } else if (distinctCount === 1) {
    breadthScore = 55;
  } else if (distinctCount === 2) {
    breadthScore = 70;
  } else if (distinctCount >= 3 && distinctCount <= 5) {
    breadthScore = 85;
  } else if (distinctCount >= 6) {
    breadthScore = 95;
  }

  // Penalty if primary language accounts for >90% of repos despite claiming multiple tiny files
  if (languages.length > 1 && languages[0].percentage > 90) {
    breadthScore = Math.max(50, breadthScore - 15);
  }

  // Inferred ecosystem tags from topics and descriptions
  const inferredEcosystems = [];
  const knownKeywords = [
    { tag: 'React', patterns: ['react', 'nextjs', 'reactjs'] },
    { tag: 'Vue', patterns: ['vue', 'nuxtjs'] },
    { tag: 'Node.js', patterns: ['nodejs', 'express', 'nest'] },
    { tag: 'Docker / Containers', patterns: ['docker', 'container', 'kubernetes', 'k8s'] },
    { tag: 'Machine Learning', patterns: ['pytorch', 'tensorflow', 'scikit', 'ml', 'ai', 'deep-learning'] },
    { tag: 'FastAPI / Django', patterns: ['fastapi', 'django', 'flask'] },
    { tag: 'Database / SQL', patterns: ['postgres', 'postgresql', 'mysql', 'mongodb', 'prisma', 'sqlite'] },
    { tag: 'Cloud / AWS', patterns: ['aws', 'cloud', 'gcp', 'azure', 'serverless'] },
  ];

  for (const item of knownKeywords) {
    let hits = 0;
    for (const repo of repositories) {
      const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
      if (item.patterns.some(p => text.includes(p))) {
        hits++;
      }
    }
    if (hits > 0) {
      inferredEcosystems.push({
        framework: item.tag,
        confidence: hits >= 3 ? 'high' : 'moderate',
        repoHits: hits,
        evidence: `Detected markers across ${hits} ${hits === 1 ? 'repository' : 'repositories'}`,
      });
    }
  }

  return {
    languages,
    distinctCount,
    breadthScore: Math.min(100, Math.max(0, breadthScore)),
    primaryLanguage: languages[0]?.name || 'Not detected',
    inferredEcosystems,
    topics: Object.entries(topicCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}
