/**
 * Input validation & sanitization routines
 * Enforces strict GitHub username conventions and query constraints.
 */

// GitHub allows alphanumeric characters and single hyphens, 1-39 chars, no leading/trailing hyphens.
const GITHUB_USERNAME_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

const VALID_TONES = new Set(['gentle', 'medium', 'spicy']);

/**
 * Extracts a candidate GitHub username from a handle, leading @, or full GitHub URL.
 * Supports:
 *   - 'iamanishsinha'
 *   - '@iamanishsinha'
 *   - 'https://github.com/iamanishsinha'
 *   - 'http://github.com/iamanishsinha/'
 *   - 'https://www.github.com/iamanishsinha'
 *   - 'github.com/iamanishsinha'
 *   - 'https://github.com/iamanishsinha?tab=repositories'
 * @param {string} input
 * @returns {string}
 */
export function extractGitHubUsername(input) {
  if (typeof input !== 'string') return '';
  let cleaned = input.trim();
  if (!cleaned) return '';

  // Strip leading @
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.slice(1).trim();
  }

  // Handle GitHub URLs
  if (cleaned.toLowerCase().includes('github.com')) {
    try {
      const urlString = cleaned.startsWith('http://') || cleaned.startsWith('https://')
        ? cleaned
        : `https://${cleaned}`;
      const parsed = new URL(urlString);
      if (parsed.hostname.toLowerCase().includes('github.com')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length > 0) {
          cleaned = parts[0];
        }
      }
    } catch {
      const match = cleaned.match(/github\.com\/([^/?#\s]+)/i);
      if (match) {
        cleaned = match[1];
      }
    }
    // Remove query params or fragments if any remain
    cleaned = cleaned.replace(/[/?#].*$/g, '').trim();
  }

  return cleaned;
}

/**
 * Validates a GitHub username or GitHub profile URL
 * @param {string} usernameOrUrl
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateUsername(usernameOrUrl) {
  if (typeof usernameOrUrl !== 'string') {
    return { valid: false, error: 'Username must be a string' };
  }

  const raw = usernameOrUrl.trim();
  if (!raw) {
    return { valid: false, error: 'GitHub username or profile URL is required' };
  }

  const candidate = extractGitHubUsername(raw);
  if (!candidate) {
    return { valid: false, error: 'Could not extract a valid GitHub username from input' };
  }

  if (candidate.length > 39) {
    return { valid: false, error: 'GitHub username cannot exceed 39 characters' };
  }

  // Reject invalid characters, directory traversal, null bytes
  if (/[/?#\\<>'"\s\0]/.test(candidate)) {
    return { valid: false, error: 'Username contains invalid characters or paths' };
  }

  if (!GITHUB_USERNAME_REGEX.test(candidate)) {
    return { valid: false, error: 'Invalid GitHub username format. Use letters, numbers, and single hyphens.' };
  }

  return { valid: true, sanitized: candidate };
}

/**
 * Validates and normalizes roast tone
 * @param {string} tone
 * @returns {'gentle' | 'medium' | 'spicy'}
 */
export function validateTone(tone) {
  if (typeof tone !== 'string') return 'medium';
  const lower = tone.toLowerCase().trim();
  return VALID_TONES.has(lower) ? lower : 'medium';
}

/**
 * Safely escape text for HTML display if ever inserted into markup
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
