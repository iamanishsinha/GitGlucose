import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateFallbackRoast } from '../server/fallback.js';

describe('Fallback Roast Module', () => {
  const dummyContext = {
    profile: { login: 'devjane', bio: '' },
    scores: { overall: 52, firstImpression: 30, repositoryHygiene: 40, substance: 60, activity: 50, range: 60 },
    findings: [],
    stats: {
      totalRepos: 12,
      reposWithoutDescription: 8,
      reposWithoutReadme: 6,
      hasProfileReadme: false,
      activeRepos: 1,
      noiseCount: 3,
    },
    technologies: { primaryLanguage: 'TypeScript' },
  };

  it('generates non-empty fallback roast conforming to constraints', () => {
    for (const tone of ['gentle', 'medium', 'spicy']) {
      const res = generateFallbackRoast(dummyContext, tone);
      assert.equal(res.source, 'fallback');
      assert.ok(Array.isArray(res.roast));
      assert.ok(res.roast.length >= 2 && res.roast.length <= 4);
      for (const line of res.roast) {
        assert.ok(line.length <= 300, `Roast line exceeded 300 chars: "${line}"`);
      }
      assert.ok(res.bio.length <= 200, `Bio exceeded 200 chars: "${res.bio}"`);
    }
  });

  it('adapts roast lines to detected findings', () => {
    const res = generateFallbackRoast(dummyContext, 'medium');
    const combined = res.roast.join(' ');
    // Bio is blank in context -> should mention bio or ghost town
    assert.ok(combined.includes('bio') || combined.includes('description') || combined.includes('README'));
  });
});
