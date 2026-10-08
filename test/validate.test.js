import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateUsername, validateTone, escapeHtml, extractGitHubUsername } from '../server/validate.js';

describe('Validation Module', () => {
  it('accepts valid GitHub usernames and handles leading @', () => {
    const validNames = ['torvalds', 'octocat', 'john-doe', 'a-b-c-1', 'x', '@iamanishsinha'];
    for (const name of validNames) {
      const res = validateUsername(name);
      assert.equal(res.valid, true, `Expected "${name}" to be valid`);
      const expectedClean = name.startsWith('@') ? name.slice(1) : name;
      assert.equal(res.sanitized, expectedClean);
    }
  });

  it('accepts full GitHub profile URLs and extracts the username cleanly', () => {
    const urlCases = [
      { input: 'https://github.com/iamanishsinha', expected: 'iamanishsinha' },
      { input: 'https://github.com/iamanishsinha/', expected: 'iamanishsinha' },
      { input: 'http://github.com/iamanishsinha', expected: 'iamanishsinha' },
      { input: 'https://www.github.com/iamanishsinha', expected: 'iamanishsinha' },
      { input: 'github.com/iamanishsinha', expected: 'iamanishsinha' },
      { input: 'github.com/iamanishsinha/', expected: 'iamanishsinha' },
      { input: 'https://github.com/iamanishsinha?tab=repositories', expected: 'iamanishsinha' },
      { input: 'https://github.com/iamanishsinha#overview', expected: 'iamanishsinha' },
    ];

    for (const { input, expected } of urlCases) {
      const extracted = extractGitHubUsername(input);
      assert.equal(extracted, expected, `extractGitHubUsername failed for "${input}"`);

      const res = validateUsername(input);
      assert.equal(res.valid, true, `Expected URL "${input}" to be valid`);
      assert.equal(res.sanitized, expected);
    }
  });

  it('rejects invalid or malicious GitHub usernames', () => {
    const invalidNames = [
      '',
      '   ',
      'user/repo',
      'user?query=1',
      'user#hash',
      '<script>alert(1)</script>',
      'user@domain.com',
      '-leading-hyphen',
      'trailing-hyphen-',
      'a'.repeat(40), // > 39 chars
    ];

    for (const name of invalidNames) {
      const res = validateUsername(name);
      assert.equal(res.valid, false, `Expected "${name}" to be rejected`);
      assert.ok(res.error);
    }
  });

  it('validates roast tones with fallback to medium', () => {
    assert.equal(validateTone('gentle'), 'gentle');
    assert.equal(validateTone('medium'), 'medium');
    assert.equal(validateTone('spicy'), 'spicy');
    assert.equal(validateTone('SPICY'), 'spicy');
    assert.equal(validateTone('unknown'), 'medium');
    assert.equal(validateTone(null), 'medium');
  });

  it('escapes dangerous HTML characters', () => {
    const raw = '<img src=x onerror="alert(\'xss\')">&';
    const escaped = escapeHtml(raw);
    assert.ok(!escaped.includes('<img'));
    assert.ok(escaped.includes('&lt;img'));
    assert.ok(escaped.includes('&amp;'));
  });
});
