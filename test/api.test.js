import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { requestHandler } from '../server/index.js';

describe('HTTP API Endpoints', () => {
  let testServer;
  let testPort;

  before(async () => {
    testServer = http.createServer(requestHandler);
    await new Promise((resolve) => {
      testServer.listen(0, '127.0.0.1', () => {
        testPort = testServer.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => testServer.close(resolve));
  });

  it('serves /healthz with 200 and security headers', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/healthz`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.status, 'healthy');

    // Security headers verification
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    assert.ok(res.headers.get('content-security-policy'));
  });

  it('rejects invalid GitHub username with 400 Bad Request', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/roast?user=invalid/user/path`);
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.ok, false);
    assert.ok(body.error);
  });

  it('rejects compare endpoint with missing parameters', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/compare?userA=&userB=validuser`);
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.ok, false);
  });

  it('accepts full GitHub URL in /api/roast endpoint and normalizes username', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/roast?user=https://github.com/octocat`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.analysis.username, 'octocat');
  });
});
