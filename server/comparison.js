/**
 * Profile Comparison Engine
 * Computes neutral, evidence-based side-by-side differentials between two public profiles.
 */

/**
 * Compares two analyzed profiles
 * @param {object} profileA Full AnalysisResult for profile A
 * @param {object} profileB Full AnalysisResult for profile B
 * @returns {object} Structured comparative breakdown
 */
export function compareProfiles(profileA, profileB) {
  const diffs = {
    overall: profileA.scores.overall - profileB.scores.overall,
    firstImpression: profileA.scores.firstImpression - profileB.scores.firstImpression,
    repositoryHygiene: profileA.scores.repositoryHygiene - profileB.scores.repositoryHygiene,
    substance: profileA.scores.substance - profileB.scores.substance,
    activity: profileA.scores.activity - profileB.scores.activity,
    range: profileA.scores.range - profileB.scores.range,
  };

  const observations = [];

  // Descriptive neutral observations without declaring who is "better"
  if (Math.abs(diffs.firstImpression) >= 10) {
    const leader = diffs.firstImpression > 0 ? profileA.username : profileB.username;
    observations.push(`@${leader} exhibits more comprehensive profile presentation and bio documentation.`);
  }

  if (Math.abs(diffs.repositoryHygiene) >= 10) {
    const leader = diffs.repositoryHygiene > 0 ? profileA.username : profileB.username;
    observations.push(`@${leader} demonstrates higher repository hygiene and README coverage.`);
  }

  if (Math.abs(diffs.substance) >= 10) {
    const leader = diffs.substance > 0 ? profileA.username : profileB.username;
    observations.push(`@${leader} shows greater repository size and standalone project substance.`);
  }

  if (Math.abs(diffs.activity) >= 10) {
    const leader = diffs.activity > 0 ? profileA.username : profileB.username;
    observations.push(`@${leader} exhibits more frequent recent commit and push activity.`);
  }

  if (Math.abs(diffs.range) >= 10) {
    const leader = diffs.range > 0 ? profileA.username : profileB.username;
    observations.push(`@${leader} displays broader multi-language diversity across public repositories.`);
  }

  if (observations.length === 0) {
    observations.push('Both profiles display remarkably comparable overall portfolio health and signal depth.');
  }

  const starsA = profileA.repositories?.ranked?.reduce((sum, r) => sum + (r.stars || 0), 0) || 0;
  const starsB = profileB.repositories?.ranked?.reduce((sum, r) => sum + (r.stars || 0), 0) || 0;
  const liveDemosA = (profileA.repositories?.ranked || []).filter(r => Boolean(r.homepage && r.homepage.trim().length > 0)).length;
  const liveDemosB = (profileB.repositories?.ranked || []).filter(r => Boolean(r.homepage && r.homepage.trim().length > 0)).length;
  const reposCountA = profileA.profile?.publicRepos || profileA.repositories?.ranked?.length || 0;
  const reposCountB = profileB.profile?.publicRepos || profileB.repositories?.ranked?.length || 0;
  const followersA = profileA.profile?.followers || 0;
  const followersB = profileB.profile?.followers || 0;

  // Determine overall winner
  let overallWinner = 'TIE';
  let winnerStatement = 'Both profiles are tied with equivalent composite portfolio health scores.';
  if (diffs.overall > 0) {
    overallWinner = profileA.username;
    winnerStatement = `@${profileA.username} demonstrates a stronger overall portfolio signal (+${diffs.overall} pts)`;
  } else if (diffs.overall < 0) {
    overallWinner = profileB.username;
    winnerStatement = `@${profileB.username} demonstrates a stronger overall portfolio signal (+${Math.abs(diffs.overall)} pts)`;
  }

  // Determine category winners
  const categoryWinners = [
    { key: 'overall', category: 'Overall Health', winner: overallWinner, aVal: profileA.scores.overall, bVal: profileB.scores.overall, unit: '/100' },
    { key: 'hygiene', category: 'Code Hygiene & Docs', winner: diffs.repositoryHygiene > 0 ? profileA.username : diffs.repositoryHygiene < 0 ? profileB.username : 'TIE', aVal: profileA.scores.repositoryHygiene, bVal: profileB.scores.repositoryHygiene, unit: '/100' },
    { key: 'substance', category: 'Code Substance & Depth', winner: diffs.substance > 0 ? profileA.username : diffs.substance < 0 ? profileB.username : 'TIE', aVal: profileA.scores.substance, bVal: profileB.scores.substance, unit: '/100' },
    { key: 'activity', category: 'Push Momentum & Recency', winner: diffs.activity > 0 ? profileA.username : diffs.activity < 0 ? profileB.username : 'TIE', aVal: profileA.scores.activity, bVal: profileB.scores.activity, unit: '/100' },
    { key: 'range', category: 'Language Stack Diversity', winner: diffs.range > 0 ? profileA.username : diffs.range < 0 ? profileB.username : 'TIE', aVal: profileA.scores.range, bVal: profileB.scores.range, unit: '/100' },
    { key: 'stars', category: 'Community Stars', winner: starsA > starsB ? profileA.username : starsA < starsB ? profileB.username : 'TIE', aVal: starsA, bVal: starsB, unit: '★' },
    { key: 'repos', category: 'Public Repositories', winner: reposCountA > reposCountB ? profileA.username : reposCountA < reposCountB ? profileB.username : 'TIE', aVal: reposCountA, bVal: reposCountB, unit: 'repos' },
    { key: 'followers', category: 'Followers Base', winner: followersA > followersB ? profileA.username : followersA < followersB ? profileB.username : 'TIE', aVal: followersA, bVal: followersB, unit: 'users' },
    { key: 'demos', category: 'Live Deployment Links', winner: liveDemosA > liveDemosB ? profileA.username : liveDemosA < liveDemosB ? profileB.username : 'TIE', aVal: liveDemosA, bVal: liveDemosB, unit: 'live links' },
  ];

  // Specific Strengths for Profile A
  const strengthsA = [];
  if (diffs.overall > 0) strengthsA.push(`Higher composite portfolio health score (+${diffs.overall} points).`);
  if (starsA > starsB) strengthsA.push(`Greater community traction with ${starsA} stars vs ${starsB}.`);
  if (diffs.substance > 0) strengthsA.push(`Stronger original code depth and standalone build substance (+${diffs.substance} pts).`);
  if (diffs.activity > 0) strengthsA.push(`More active commit and push momentum (+${diffs.activity} pts).`);
  if (diffs.repositoryHygiene > 0) strengthsA.push(`Higher percentage of repositories with documentation and README coverage.`);
  if (diffs.range > 0) strengthsA.push(`Broader multi-language technology diversity.`);
  if (liveDemosA > liveDemosB) strengthsA.push(`More verified live deployment/demo links in repository headers (${liveDemosA} vs ${liveDemosB}).`);
  if (strengthsA.length === 0) strengthsA.push(`Balanced profile with solid foundations across primary stack (${profileA.technologies?.primaryLanguage || 'General'}).`);

  // Specific Strengths for Profile B
  const strengthsB = [];
  if (diffs.overall < 0) strengthsB.push(`Higher composite portfolio health score (+${Math.abs(diffs.overall)} points).`);
  if (starsB > starsA) strengthsB.push(`Greater community traction with ${starsB} stars vs ${starsA}.`);
  if (diffs.substance < 0) strengthsB.push(`Stronger original code depth and standalone build substance (+${Math.abs(diffs.substance)} pts).`);
  if (diffs.activity < 0) strengthsB.push(`More active commit and push momentum (+${Math.abs(diffs.activity)} pts).`);
  if (diffs.repositoryHygiene < 0) strengthsB.push(`Higher percentage of repositories with documentation and README coverage.`);
  if (diffs.range < 0) strengthsB.push(`Broader multi-language technology diversity.`);
  if (liveDemosB > liveDemosA) strengthsB.push(`More verified live deployment/demo links in repository headers (${liveDemosB} vs ${liveDemosA}).`);
  if (strengthsB.length === 0) strengthsB.push(`Balanced profile with solid foundations across primary stack (${profileB.technologies?.primaryLanguage || 'General'}).`);

  // Actionable Areas where Profile A can improve
  const improvementsA = [];
  if (diffs.repositoryHygiene < 0) improvementsA.push(`Add READMEs and descriptive summaries to undocumented repositories to match @${profileB.username}.`);
  if (diffs.activity < 0) improvementsA.push(`Increase public push frequency to match the momentum of @${profileB.username}.`);
  if (liveDemosA < liveDemosB) improvementsA.push(`Add live demo and deployment URLs to top repositories.`);
  if (starsA < starsB) improvementsA.push(`Promote and polish flagship repositories to build community star recognition.`);
  if (diffs.range < 0) improvementsA.push(`Expand portfolio evidence into additional languages and frameworks.`);
  if (improvementsA.length === 0) improvementsA.push(`Maintain current high documentation and commit momentum.`);

  // Actionable Areas where Profile B can improve
  const improvementsB = [];
  if (diffs.repositoryHygiene > 0) improvementsB.push(`Add READMEs and descriptive summaries to undocumented repositories to match @${profileA.username}.`);
  if (diffs.activity > 0) improvementsB.push(`Increase public push frequency to match the momentum of @${profileA.username}.`);
  if (liveDemosB < liveDemosA) improvementsB.push(`Add live demo and deployment URLs to top repositories.`);
  if (starsB < starsA) improvementsB.push(`Promote and polish flagship repositories to build community star recognition.`);
  if (diffs.range > 0) improvementsB.push(`Expand portfolio evidence into additional languages and frameworks.`);
  if (improvementsB.length === 0) improvementsB.push(`Maintain current high documentation and commit momentum.`);

  return {
    profileA: {
      username: profileA.username,
      name: profileA.profile?.name || profileA.username,
      avatarUrl: profileA.profile?.avatarUrl || '',
      bio: profileA.profile?.bio || '',
      followers: followersA,
      publicRepos: reposCountA,
      totalStars: starsA,
      scores: profileA.scores,
      verdict: profileA.verdict,
      topLanguage: profileA.technologies?.primaryLanguage || 'Unknown',
      languages: profileA.technologies?.languages?.slice(0, 5) || [],
      activeRepos: profileA.repositories?.lifecycleSummary?.ACTIVE || 0,
      highSignalRepos: profileA.repositories?.signalSummary?.['HIGH SIGNAL'] || 0,
      liveDemos: liveDemosA,
      topRepos: (profileA.repositories?.ranked || []).slice(0, 3).map(r => ({
        name: r.name,
        stars: r.stars,
        language: r.language,
        score: r.score,
        description: r.description,
        htmlUrl: r.htmlUrl,
      })),
    },
    profileB: {
      username: profileB.username,
      name: profileB.profile?.name || profileB.username,
      avatarUrl: profileB.profile?.avatarUrl || '',
      bio: profileB.profile?.bio || '',
      followers: followersB,
      publicRepos: reposCountB,
      totalStars: starsB,
      scores: profileB.scores,
      verdict: profileB.verdict,
      topLanguage: profileB.technologies?.primaryLanguage || 'Unknown',
      languages: profileB.technologies?.languages?.slice(0, 5) || [],
      activeRepos: profileB.repositories?.lifecycleSummary?.ACTIVE || 0,
      highSignalRepos: profileB.repositories?.signalSummary?.['HIGH SIGNAL'] || 0,
      liveDemos: liveDemosB,
      topRepos: (profileB.repositories?.ranked || []).slice(0, 3).map(r => ({
        name: r.name,
        stars: r.stars,
        language: r.language,
        score: r.score,
        description: r.description,
        htmlUrl: r.htmlUrl,
      })),
    },
    diffs,
    winner: {
      username: overallWinner,
      leadPoints: Math.abs(diffs.overall),
      statement: winnerStatement,
    },
    categoryWinners,
    strengthsA,
    strengthsB,
    improvementsA,
    improvementsB,
    observations,
    metrics: [
      { key: 'overall', label: 'Overall Portfolio Health', a: profileA.scores.overall, b: profileB.scores.overall, max: 100, unit: 'pts' },
      { key: 'hygiene', label: 'Repository Hygiene & Docs', a: profileA.scores.repositoryHygiene, b: profileB.scores.repositoryHygiene, max: 100, unit: 'pts' },
      { key: 'substance', label: 'Code Substance & Depth', a: profileA.scores.substance, b: profileB.scores.substance, max: 100, unit: 'pts' },
      { key: 'activity', label: 'Push Momentum & Recency', a: profileA.scores.activity, b: profileB.scores.activity, max: 100, unit: 'pts' },
      { key: 'range', label: 'Language Range Diversity', a: profileA.scores.range, b: profileB.scores.range, max: 100, unit: 'pts' },
      { key: 'stars', label: 'Total Repository Stars', a: starsA, b: starsB, max: Math.max(10, starsA, starsB), unit: 'stars' },
      { key: 'repos', label: 'Public Repositories', a: reposCountA, b: reposCountB, max: Math.max(10, reposCountA, reposCountB), unit: 'repos' },
      { key: 'followers', label: 'Followers Count', a: followersA, b: followersB, max: Math.max(10, followersA, followersB), unit: 'users' },
      { key: 'demos', label: 'Live Deployments / Demos', a: liveDemosA, b: liveDemosB, max: Math.max(5, liveDemosA, liveDemosB), unit: 'links' },
    ],
    disclaimer: 'Comparison is based only on publicly available GitHub signals and does not represent an absolute evaluation of developer talent.',
  };
}
