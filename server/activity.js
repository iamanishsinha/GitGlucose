/**
 * Activity Analytics Engine
 * Evaluates repository update timelines, push recency, and activity consistency.
 */

/**
 * Analyzes activity metrics from normalized repositories
 * @param {Array<object>} repositories
 * @param {Date} now
 * @returns {object} Activity diagnostics and timeline
 */
export function analyzeActivity(repositories, now = new Date()) {
  const buckets = {
    last30Days: 0,
    last90Days: 0,
    last180Days: 0,
    last365Days: 0,
    olderThanYear: 0,
  };

  const dates = [];

  for (const repo of repositories) {
    if (!repo.pushedAt) {
      buckets.olderThanYear++;
      continue;
    }

    const pushed = new Date(repo.pushedAt);
    const diffMs = now.getTime() - pushed.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    dates.push({
      name: repo.name,
      pushedAt: repo.pushedAt,
      daysAgo: diffDays,
    });

    if (diffDays <= 30) buckets.last30Days++;
    else if (diffDays <= 90) buckets.last90Days++;
    else if (diffDays <= 180) buckets.last180Days++;
    else if (diffDays <= 365) buckets.last365Days++;
    else buckets.olderThanYear++;
  }

  // Sort dates descending (most recent first)
  dates.sort((a, b) => a.daysAgo - b.daysAgo);

  // Compute Activity Score (0-100)
  let activityScore = 30;
  if (repositories.length === 0) {
    activityScore = 20;
  } else {
    const activeRecently = buckets.last30Days;
    const activeQuarter = buckets.last90Days;

    if (activeRecently >= 3) activityScore = 95;
    else if (activeRecently >= 1) activityScore = 85;
    else if (activeQuarter >= 2) activityScore = 75;
    else if (activeQuarter >= 1) activityScore = 65;
    else if (buckets.last180Days >= 1) activityScore = 50;
    else if (buckets.last365Days >= 1) activityScore = 38;
    else activityScore = 25;
  }

  // Activity concentration: are pushes spread out or in a single repo?
  const totalRepos = repositories.length;
  const activeCount = buckets.last30Days + buckets.last90Days;
  const concentrationLabel = activeCount >= 3
    ? 'Distributed across multiple repositories'
    : activeCount === 1
    ? 'Concentrated in a single active project'
    : 'Infrequent or dormant activity';

  return {
    score: Math.min(100, Math.max(0, activityScore)),
    buckets,
    totalRepos,
    mostRecentPush: dates[0] || null,
    concentrationLabel,
    timeline: dates.slice(0, 10), // 10 most recently updated repos
    disclaimer: 'Public repository push dates are used as an activity proxy; private contributions are not included.',
  };
}
