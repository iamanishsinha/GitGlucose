import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getGitHubHeaders, createRateLimitResponse } from '../server/github.js';

describe('GitHub Token Usage Control & Auth Modes', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env before each test
    delete process.env.GITHUB_AUTH_MODE;
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('Public Mode (Default)', () => {
    it('does NOT include Authorization header when GITHUB_AUTH_MODE is unset', () => {
      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, undefined);
      assert.equal(headers.Accept, 'application/vnd.github.v3+json');
      assert.equal(headers['User-Agent'], 'GitGlucose-Portfolio-Auditor/1.0');
    });

    it('does NOT include Authorization header when GITHUB_AUTH_MODE=public', () => {
      process.env.GITHUB_AUTH_MODE = 'public';
      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, undefined);
    });

    it('HARD RULE: TOKEN PRESENT != TOKEN AUTHORIZED FOR USE (public mode ignores token)', () => {
      process.env.GITHUB_AUTH_MODE = 'public';
      process.env.GITHUB_TOKEN = 'mock_fake_token_never_authorized';

      const headers = getGitHubHeaders();
      // Even though token exists, Authorization header MUST be absent in public mode
      assert.equal(headers.Authorization, undefined, 'Authorization header must NOT be present in public mode');
    });

    it('ignores token if GITHUB_AUTH_MODE is unset even if token is in environment', () => {
      delete process.env.GITHUB_AUTH_MODE;
      process.env.GITHUB_TOKEN = 'mock_fake_token_present_in_env';

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, undefined, 'Authorization header must not be set when mode is not authenticated');
    });
  });

  describe('Authenticated Mode', () => {
    it('includes Authorization header ONLY when explicitly configured as authenticated', () => {
      process.env.GITHUB_AUTH_MODE = 'authenticated';
      process.env.GITHUB_TOKEN = 'mock_fake_test_token_999';

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, 'Bearer mock_fake_test_token_999');
    });

    it('handles case-insensitivity and extra whitespace in GITHUB_AUTH_MODE', () => {
      process.env.GITHUB_AUTH_MODE = '  AUTHENTICATED  ';
      process.env.GITHUB_TOKEN = 'mock_fake_test_token_case';

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, 'Bearer mock_fake_test_token_case');
    });

    it('does not set Authorization header if authenticated mode is set but token is empty', () => {
      process.env.GITHUB_AUTH_MODE = 'authenticated';
      delete process.env.GITHUB_TOKEN;

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, undefined);
    });

    it('formats Classic Personal Access Tokens (ghp_...) with Bearer', () => {
      process.env.GITHUB_AUTH_MODE = 'authenticated';
      process.env.GITHUB_TOKEN = 'ghp_fakeMockClassicPAT1234567890';

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, 'Bearer ghp_fakeMockClassicPAT1234567890');
    });

    it('formats Fine-Grained Personal Access Tokens (github_pat_...) with Bearer', () => {
      process.env.GITHUB_AUTH_MODE = 'authenticated';
      process.env.GITHUB_TOKEN = 'github_pat_fakeMockFineGrainedPAT_abcdef123';

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, 'Bearer github_pat_fakeMockFineGrainedPAT_abcdef123');
    });

    it('handles pre-prefixed tokens without duplicating Bearer prefix', () => {
      process.env.GITHUB_AUTH_MODE = 'authenticated';
      process.env.GITHUB_TOKEN = 'Bearer ghp_alreadyPrefixed';

      const headers = getGitHubHeaders();
      assert.equal(headers.Authorization, 'Bearer ghp_alreadyPrefixed');
    });
  });

  describe('Rate Limit Response Structure', () => {
    it('returns structured 429 response with GITHUB_RATE_LIMITED code and friendly message', () => {
      const response = createRateLimitResponse();

      assert.equal(response.ok, false);
      assert.equal(response.status, 429);
      assert.equal(response.code, 'GITHUB_RATE_LIMITED');
      assert.ok(response.error.includes("public API request limit"));
      assert.ok(response.message.includes("taking a breather"));
      assert.equal(response.authenticatedModeAvailable, true);
    });
  });

  describe('Zero Real Token Local Server Mock Test', () => {
    it('verifies headers received by HTTP mock server in both modes without querying GitHub', async () => {
      let receivedHeaders = {};

      const mockServer = http.createServer((req, res) => {
        receivedHeaders = req.headers;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mock: true }));
      });

      await new Promise((resolve) => mockServer.listen(0, '127.0.0.1', resolve));
      const port = mockServer.address().port;

      try {
        // Test 1: Public mode sends no Authorization header over the wire
        process.env.GITHUB_AUTH_MODE = 'public';
        process.env.GITHUB_TOKEN = 'fake_mock_token_do_not_send';
        let headers = getGitHubHeaders();

        await fetch(`http://127.0.0.1:${port}/test`, { headers });
        assert.equal(receivedHeaders.authorization, undefined, 'Mock server must not receive authorization header');

        // Test 2: Authenticated mode sends Bearer header over the wire
        process.env.GITHUB_AUTH_MODE = 'authenticated';
        process.env.GITHUB_TOKEN = 'fake_mock_token_authorized_for_test';
        headers = getGitHubHeaders();

        await fetch(`http://127.0.0.1:${port}/test`, { headers });
        assert.equal(receivedHeaders.authorization, 'Bearer fake_mock_token_authorized_for_test');
      } finally {
        await new Promise((resolve) => mockServer.close(resolve));
      }
    });
  });
});
