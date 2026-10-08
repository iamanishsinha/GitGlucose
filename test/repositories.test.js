import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRepository, analyzeRepositories } from '../server/repositories.js';

describe('Repository Intelligence Module', () => {
  const baseDate = new Date('2026-10-08T12:00:00Z');

  it('correctly scores high-signal documented repository', () => {
    const repo = {
      id: 1,
      name: 'quantum-compiler',
      fullName: 'user/quantum-compiler',
      description: 'Production-ready optimizing quantum circuit compiler written in Rust.',
      htmlUrl: 'https://github.com/user/quantum-compiler',
      language: 'Rust',
      size: 1200,
      stars: 45,
      forks: 12,
      fork: false,
      archived: false,
      hasReadme: true,
      pushedAt: '2026-10-01T12:00:00Z', // 7 days ago
      topics: ['quantum', 'compiler', 'rust'],
    };

    const evaluated = evaluateRepository(repo, baseDate);
    assert.ok(evaluated.score >= 75, `Expected score >= 75, got ${evaluated.score}`);
    assert.equal(evaluated.signalCategory, 'HIGH SIGNAL');
    assert.equal(evaluated.lifecycle, 'ACTIVE');
    assert.ok(evaluated.strengths.length > 0);
  });

  it('classifies throwaway test repository as noise', () => {
    const repo = {
      id: 2,
      name: 'test-repo',
      fullName: 'user/test-repo',
      description: '',
      htmlUrl: 'https://github.com/user/test-repo',
      language: 'JavaScript',
      size: 5,
      stars: 0,
      forks: 0,
      fork: false,
      archived: false,
      hasReadme: false,
      pushedAt: '2025-01-01T12:00:00Z',
      topics: [],
    };

    const evaluated = evaluateRepository(repo, baseDate);
    assert.equal(evaluated.signalCategory, 'NOISE / EXPERIMENTAL');
    assert.equal(evaluated.lifecycle, 'ABANDONED');
    assert.ok(evaluated.concerns.length > 0);
  });

  it('ranks repositories in descending score order', () => {
    const repos = [
      { id: 1, name: 'junk', size: 1, fork: false, pushedAt: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'flagship', description: 'Major web application with complete tests and full documentation.', size: 800, hasReadme: true, language: 'TypeScript', fork: false, pushedAt: '2026-10-05T00:00:00Z' },
    ];

    const result = analyzeRepositories(repos);
    assert.equal(result.ranked[0].name, 'flagship');
    assert.equal(result.ranked[1].name, 'junk');
    assert.equal(result.total, 2);
  });
});
