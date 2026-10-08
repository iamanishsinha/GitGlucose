import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { compareProfiles } from '../server/comparison.js';

describe('Profile Comparison Module', () => {
  const profileA = {
    username: 'dev_alpha',
    scores: { overall: 82, firstImpression: 80, repositoryHygiene: 75, substance: 85, activity: 90, range: 80 },
    verdict: { label: 'STRONG', description: 'Strong portfolio' },
    technologies: { primaryLanguage: 'TypeScript' },
    repositories: {
      lifecycleSummary: { ACTIVE: 3 },
      signalSummary: { 'HIGH SIGNAL': 3 },
    },
  };

  const profileB = {
    username: 'dev_beta',
    scores: { overall: 65, firstImpression: 60, repositoryHygiene: 55, substance: 70, activity: 65, range: 75 },
    verdict: { label: 'DEVELOPING', description: 'Developing portfolio' },
    technologies: { primaryLanguage: 'Python' },
    repositories: {
      lifecycleSummary: { ACTIVE: 1 },
      signalSummary: { 'HIGH SIGNAL': 1 },
    },
  };

  it('computes differentials and generates objective observations', () => {
    const comparison = compareProfiles(profileA, profileB);

    assert.equal(comparison.diffs.overall, 17);
    assert.equal(comparison.diffs.activity, 25);
    assert.ok(comparison.observations.length > 0);

    // Guardrail test: should NEVER say "Person A is better" or "Person B is worse"
    for (const obs of comparison.observations) {
      assert.ok(!obs.includes('is better'));
      assert.ok(!obs.includes('is worse'));
    }

    assert.ok(comparison.disclaimer);
  });
});
