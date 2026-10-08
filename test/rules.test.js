import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SCORE_WEIGHTS, VERDICT_TIERS, getVerdict, ROLE_MATRICES } from '../server/rules.js';

describe('Rules & Constants Module', () => {
  it('score weights must sum exactly to 1.0', () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((acc, w) => acc + w, 0);
    assert.equal(Math.round(sum * 100) / 100, 1.0);
  });

  it('maps scores to correct verdict tiers', () => {
    assert.equal(getVerdict(95).label, 'EXCEPTIONAL');
    assert.equal(getVerdict(90).label, 'EXCEPTIONAL');
    assert.equal(getVerdict(85).label, 'STRONG');
    assert.equal(getVerdict(75).label, 'STRONG');
    assert.equal(getVerdict(70).label, 'DEVELOPING');
    assert.equal(getVerdict(60).label, 'DEVELOPING');
    assert.equal(getVerdict(50).label, 'MESSY / NEEDS WORK');
    assert.equal(getVerdict(40).label, 'MESSY / NEEDS WORK');
    assert.equal(getVerdict(25).label, 'BLANK / VERY WEAK SIGNAL');
    assert.equal(getVerdict(0).label, 'BLANK / VERY WEAK SIGNAL');
  });

  it('contains valid role configuration matrices', () => {
    assert.ok(ROLE_MATRICES['full-stack']);
    assert.ok(ROLE_MATRICES['backend']);
    assert.ok(ROLE_MATRICES['frontend']);
    assert.ok(ROLE_MATRICES['ai-ml']);
    assert.ok(ROLE_MATRICES['devops']);

    for (const [key, conf] of Object.entries(ROLE_MATRICES)) {
      assert.ok(conf.title, `Role ${key} missing title`);
      assert.ok(conf.techMarkers, `Role ${key} missing techMarkers`);
    }
  });
});
