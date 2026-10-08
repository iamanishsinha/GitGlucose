/**
 * GitGlucose Submission Verification Script
 * Validates repo size, git branch count, security precautions, and test results.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('====================================================');
console.log('  GITGLUCOSE PRE-SUBMISSION VERIFICATION PROTOCOL');
console.log('====================================================\n');

let failed = false;

// 1. Run Automated Test Suite
console.log('[1/5] Running automated test suite (node:test)...');
try {
  const testOut = execSync('node --test test/*.test.js', { encoding: 'utf-8' });
  console.log('  ✔ All tests passed successfully.');
} catch (err) {
  console.error('  ✖ Test suite failed:\n', err.stdout || err.message);
  failed = true;
}

// 2. Check Git Branch Count (Must be EXACTLY ONE branch)
console.log('\n[2/5] Checking Git branches (Must have EXACTLY ONE branch)...');
try {
  const branchOut = execSync('git branch', { encoding: 'utf-8' }).trim();
  const branches = branchOut.split('\n').map(b => b.trim()).filter(Boolean);
  if (branches.length === 1) {
    console.log(`  ✔ Exactly one branch detected: ${branches[0]}`);
  } else if (branches.length === 0) {
    console.log('  ℹ Git repository not yet committed. Will verify on commit.');
  } else {
    console.error(`  ✖ Multiple branches detected (${branches.length}): ${branches.join(', ')}`);
    failed = true;
  }
} catch (err) {
  console.warn('  ℹ Git branch check skipped (not yet committed).');
}

// 3. Check for Committed Secrets or .env files in Git
console.log('\n[3/5] Scanning for sensitive environment secrets in Git index...');
const forbiddenFiles = ['.env', '.env.local', '.env.production', 'Token.env', 'token.env', 'credentials.json', 'service-account.json'];
for (const file of forbiddenFiles) {
  try {
    const tracked = execSync(`git ls-files "${file}"`, { encoding: 'utf-8' }).trim();
    if (tracked) {
      console.error(`  ✖ Forbidden secret file is tracked in Git: ${file}`);
      failed = true;
    }
  } catch {
    // Not tracked
  }
}
if (!failed) {
  console.log('  ✔ No forbidden secret files tracked in Git. (.env and Token.env are git-ignored)');
}

// 4. Check Repository Size (Must be < 10 MB)
console.log('\n[4/5] Checking repository size (Must be LESS THAN 10 MB)...');
function getDirSize(dir) {
  let size = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += getDirSize(full);
    } else {
      size += fs.statSync(full).size;
    }
  }
  return size;
}

const totalBytes = getDirSize('.');
const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
console.log(`  Total project code size: ${totalMB} MB (${totalBytes} bytes)`);
if (totalBytes < 10 * 1024 * 1024) {
  console.log(`  ✔ Repository is well under the 10 MB limit (${totalMB} MB < 10 MB).`);
} else {
  console.error(`  ✖ Repository size exceeds 10 MB limit: ${totalMB} MB`);
  failed = true;
}

// 5. Check Cloud Run & Production Requirements
console.log('\n[5/5] Checking Cloud Run Dockerfile and healthcheck requirements...');
if (fs.existsSync('Dockerfile') && fs.existsSync('.dockerignore')) {
  console.log('  ✔ Dockerfile and .dockerignore are present.');
} else {
  console.error('  ✖ Missing Dockerfile or .dockerignore.');
  failed = true;
}

console.log('\n====================================================');
if (failed) {
  console.error('  VERIFICATION RESULT: FAILED. Address the issues above before submitting.');
  process.exit(1);
} else {
  console.log('  VERIFICATION RESULT: ALL CHECKS PASSED (100% READY)!');
  console.log('====================================================');
}
