/**
 * GitGlucose Production HTTP Server
 * Fast, secure, lightweight Node.js server with caching, rate limiting, and security headers.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import { fileURLToPath } from 'node:url';
import { validateUsername, validateTone } from './validate.js';
import { fetchGitHubData } from './github.js';
import { analyzeProfile } from './analyzer.js';
import { compareProfiles } from './comparison.js';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// Auto-load local .env, .env.local, or Token.env file if present (native zero-dependency loader)
// Guarded so automated test runs always maintain clean mock/isolated environments
const isTestMode = process.env.NODE_ENV === 'test' ||
  process.execArgv.includes('--test') ||
  process.argv.some(a => typeof a === 'string' && a.includes('test'));

if (!isTestMode) {
  for (const envFileName of ['.env', '.env.local', 'Token.env', 'token.env']) {
    const envFile = path.resolve(__dirname, `../${envFileName}`);
    if (fs.existsSync(envFile)) {
      try {
        const raw = fs.readFileSync(envFile, 'utf8');
        for (const line of raw.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const k = trimmed.slice(0, eqIdx).trim();
            const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (process.env[k] === undefined || process.env[k] === '') {
              process.env[k] = v;
            }
          }
        }
      } catch {
        // Non-fatal if env file cannot be read
      }
    }
  }
}

const PORT = parseInt(process.env.PORT || '8080', 10);
const CACHE_TTL_MS = parseInt(process.env.GITHUB_CACHE_TTL_MS || '600000', 10); // 10 minutes
const CACHE_MAX = parseInt(process.env.GITHUB_CACHE_MAX || '200', 10);
const RATE_LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '30', 10);

// --- In-Memory LRU/TTL Cache ---
class AnalysisCache {
  constructor(maxSize, ttlMs) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}

const analysisCache = new AnalysisCache(CACHE_MAX, CACHE_TTL_MS);

// --- In-Memory Rate Limiter (Per IP) ---
const ipRateMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRateMap.get(ip);
  if (!record || now > record.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= RATE_LIMIT_PER_MIN) {
    return false;
  }
  record.count++;
  return true;
}

// Prune stale rate-limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateMap.entries()) {
    if (now > record.resetAt) ipRateMap.delete(ip);
  }
}, 300000).unref();

// MIME Types map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Standard Security Headers
 */
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://avatars.githubusercontent.com data:; connect-src 'self';"
  );
}

/**
 * Sends a clean JSON response
 */
function sendJson(res, statusCode, data) {
  setSecurityHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Static file handler
 */
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal attacks
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { ok: false, error: 'Access forbidden' });
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendJson(res, 404, { ok: false, error: 'Resource not found' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    setSecurityHeaders(res);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      sendJson(res, 500, { ok: false, error: 'Internal file read error' });
    });
    stream.pipe(res);
  });
}

/**
 * HTTP Request Handler
 */
export async function requestHandler(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

  // 1. Healthcheck Endpoint (Required by Cloud Run)
  if (pathname === '/healthz') {
    setSecurityHeaders(res);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, status: 'healthy', version: '1.0.0' }));
    return;
  }

  // 2. Profile Roast API Endpoint
  if (pathname === '/api/roast' && req.method === 'GET') {
    if (!checkRateLimit(ip)) {
      sendJson(res, 429, {
        ok: false,
        error: 'Rate limit exceeded. Please wait a minute before running another audit.',
      });
      return;
    }

    const rawUser = urlObj.searchParams.get('user') || '';
    const userVal = validateUsername(rawUser);
    if (!userVal.valid) {
      sendJson(res, 400, { ok: false, error: userVal.error });
      return;
    }

    const username = userVal.sanitized;
    const tone = validateTone(urlObj.searchParams.get('tone') || 'medium');
    const role = (urlObj.searchParams.get('role') || 'full-stack').toLowerCase().trim();

    const cacheKey = `user:${username.toLowerCase()}:tone:${tone}:role:${role}`;
    const cached = analysisCache.get(cacheKey);
    if (cached) {
      sendJson(res, 200, { ok: true, cached: true, analysis: cached });
      return;
    }

    const ghResult = await fetchGitHubData(username);
    if (!ghResult.ok) {
      sendJson(res, ghResult.status || 500, {
        ok: false,
        code: ghResult.code,
        error: ghResult.error,
        message: ghResult.message,
        authenticatedModeAvailable: ghResult.authenticatedModeAvailable,
      });
      return;
    }

    try {
      const analysis = await analyzeProfile(ghResult.data, tone, role);
      analysisCache.set(cacheKey, analysis);
      sendJson(res, 200, { ok: true, cached: false, analysis });
    } catch (err) {
      console.error('[Analyzer Error]:', err);
      sendJson(res, 500, { ok: false, error: 'Failed to complete profile analysis.' });
    }
    return;
  }

  // 3. Comparison API Endpoint
  if (pathname === '/api/compare' && req.method === 'GET') {
    if (!checkRateLimit(ip)) {
      sendJson(res, 429, { ok: false, error: 'Rate limit exceeded.' });
      return;
    }

    const userAVal = validateUsername(urlObj.searchParams.get('userA') || '');
    const userBVal = validateUsername(urlObj.searchParams.get('userB') || '');

    if (!userAVal.valid) {
      sendJson(res, 400, { ok: false, error: `User A error: ${userAVal.error}` });
      return;
    }
    if (!userBVal.valid) {
      sendJson(res, 400, { ok: false, error: `User B error: ${userBVal.error}` });
      return;
    }

    const tone = validateTone(urlObj.searchParams.get('tone') || 'medium');

    try {
      const [ghA, ghB] = await Promise.all([
        fetchGitHubData(userAVal.sanitized),
        fetchGitHubData(userBVal.sanitized),
      ]);

      if (!ghA.ok) {
        sendJson(res, ghA.status || 404, {
          ok: false,
          code: ghA.code,
          error: `Profile A (@${userAVal.sanitized}): ${ghA.error}`,
          message: ghA.message,
          authenticatedModeAvailable: ghA.authenticatedModeAvailable,
        });
        return;
      }
      if (!ghB.ok) {
        sendJson(res, ghB.status || 404, {
          ok: false,
          code: ghB.code,
          error: `Profile B (@${userBVal.sanitized}): ${ghB.error}`,
          message: ghB.message,
          authenticatedModeAvailable: ghB.authenticatedModeAvailable,
        });
        return;
      }

      const [analysisA, analysisB] = await Promise.all([
        analyzeProfile(ghA.data, tone),
        analyzeProfile(ghB.data, tone),
      ]);

      const comparison = compareProfiles(analysisA, analysisB);
      sendJson(res, 200, { ok: true, comparison });
    } catch (err) {
      console.error('[Compare Error]:', err);
      sendJson(res, 500, { ok: false, error: 'Failed to compare profiles.' });
    }
    return;
  }

  // 4. Static Asset Requests
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStaticFile(req, res, pathname);
    return;
  }

  // Method not allowed
  sendJson(res, 405, { ok: false, error: 'Method not allowed' });
}

// Server Lifecycle
export const server = http.createServer(requestHandler);

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule && process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  [GitGlucose] Production Server Running!`);
    console.log(`  Click to open: http://localhost:${PORT}`);
    console.log(`  Local IP:      http://127.0.0.1:${PORT}`);
    console.log(`======================================================\n`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[GitGlucose] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[GitGlucose] HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    console.error('[GitGlucose] Uncaught Exception:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[GitGlucose] Unhandled Rejection at:', promise, 'reason:', reason);
  });
}
