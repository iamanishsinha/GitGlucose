import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeProfile } from '../server/analyzer.js';

describe('Master Profile Analyzer Module', () => {
  const mockNormalizedData = {
    profile: {
      login: 'alicecoder',
      name: 'Alice Coder',
      bio: 'Full stack web developer passionate about cloud native architectures.',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
      htmlUrl: 'https://github.com/alicecoder',
      publicRepos: 3,
      followers: 25,
      following: 10,
      hasProfileReadme: true,
    },
    repositories: [
      {
        id: 101,
        name: 'task-flow',
        fullName: 'alicecoder/task-flow',
        description: 'Collaborative task planner with real-time websocket synchronization.',
        htmlUrl: 'https://github.com/alicecoder/task-flow',
        language: 'TypeScript',
        stars: 18,
        forks: 4,
        size: 450,
        fork: false,
        archived: false,
        hasReadme: true,
        pushedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        topics: ['typescript', 'react', 'nodejs'],
      },
      {
        id: 102,
        name: 'api-gateway',
        fullName: 'alicecoder/api-gateway',
        description: 'Lightweight reverse proxy and rate limiting gateway.',
        htmlUrl: 'https://github.com/alicecoder/api-gateway',
        language: 'Go',
        stars: 12,
        forks: 2,
        size: 320,
        fork: false,
        archived: false,
        hasReadme: true,
        pushedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        topics: ['go', 'proxy', 'backend'],
      },
      {
        id: 103,
        name: 'algo-lab',
        fullName: 'alicecoder/algo-lab',
        description: 'Data structures and graph algorithms practice.',
        htmlUrl: 'https://github.com/alicecoder/algo-lab',
        language: 'Python',
        stars: 2,
        forks: 0,
        size: 80,
        fork: false,
        archived: false,
        hasReadme: true,
        pushedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        topics: ['python', 'algorithms'],
      },
    ],
    snapshot: {
      timestamp: new Date().toISOString(),
      formattedDate: 'Oct 8, 2026',
      source: 'test-mock',
    },
  };

  it('computes deterministic scores and produces valid AnalysisResult structure', async () => {
    const result = await analyzeProfile(mockNormalizedData, 'medium', 'full-stack');

    assert.ok(result.analysisId);
    assert.equal(result.username, 'alicecoder');
    assert.ok(result.scores.overall >= 70, `Expected overall score >= 70, got ${result.scores.overall}`);
    assert.ok(result.scores.firstImpression >= 75);
    assert.ok(result.verdict.label);

    // Repositories summary
    assert.equal(result.repositories.total, 3);
    assert.ok(result.repositories.ranked.length === 3);

    // Recruiter timeline
    assert.equal(result.recruiter.attentionTimeline.length, 5);
    assert.ok(['SHORTLIST', 'MAYBE'].includes(result.recruiter.shortlistSimulation.status));

    // Before/After simulation
    assert.ok(result.beforeAfter.potentialScore >= result.beforeAfter.currentScore);
    assert.ok(result.beforeAfter.improvement >= 0);

    // Rescue plans
    assert.equal(result.rescue.quick30.length, 5);
    assert.equal(result.rescue.full7Day.length, 7);

    // Roast payload
    assert.ok(Array.isArray(result.roast.lines));
    assert.ok(result.roast.lines.length >= 2);
  });

  it('flags missing bio and readme findings when profile is sparse', async () => {
    const sparseData = {
      profile: { login: 'sparseguy', bio: '', hasProfileReadme: false },
      repositories: [
        { id: 1, name: 'temp1', description: '', size: 2, fork: false, pushedAt: '2024-01-01T00:00:00Z' },
      ],
      snapshot: { timestamp: new Date().toISOString() },
    };

    const result = await analyzeProfile(sparseData, 'medium');
    const findingIds = result.findings.map(f => f.id);

    assert.ok(findingIds.includes('missing-bio'));
    assert.ok(findingIds.includes('missing-profile-readme'));
    assert.ok(findingIds.includes('missing-descriptions'));
    assert.equal(result.recruiter.shortlistSimulation.status, 'PASS');
  });
});
