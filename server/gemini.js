/**
 * Server-side Gemini AI Personality Layer
 * Constrained AI writer: receives deterministic facts and writes witty roast lines.
 * Strictly adheres to schema and falls back cleanly if unavailable.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS || '12000', 10);

/**
 * Calls Gemini with structured JSON output schema to generate roast lines
 * @param {object} analysisContext Constrained deterministic summary
 * @param {'gentle' | 'medium' | 'spicy'} tone
 * @returns {Promise<{ roast: string[], bio: string, source: 'gemini' } | null>}
 */
export async function generateGeminiRoast(analysisContext, tone = 'medium') {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const toneHint = tone === 'spicy'
    ? 'brutally witty, punchy, honest dev comedy, roast hygiene/docs'
    : tone === 'gentle'
    ? 'encouraging, playful, constructive dev feedback'
    : 'sharp, witty, clever dev portfolio observations';

  // Ultra-compact prompt to minimize token input usage
  const compactBio = (analysisContext.profile.bio || '').slice(0, 80);
  const topFindings = analysisContext.findings.slice(0, 3).map(f => f.title).join('; ');

  const prompt = `GitGlucose ("Roast the Git. Rescue with Glucose."). Output valid JSON {"roast":["..."],"bio":"..."}.
Rules: Roast code/repo hygiene/docs ONLY; NEVER personal traits; do not invent repos; 3-4 witty lines (<=220 chars); 1 bio (<=160 chars). Tone: ${toneHint}.
Profile: @${analysisContext.profile.login} | Score: ${analysisContext.scores.overall}/100 (${analysisContext.verdict.label}) | Lang: ${analysisContext.stats.primaryLanguage || 'Unknown'} | Repos: ${analysisContext.stats.totalRepos} (${analysisContext.stats.reposWithoutDescription} no desc, ${analysisContext.stats.reposWithoutReadme} no readme) | Bio: "${compactBio || 'blank'}" | Key findings: ${topFindings}`.trim();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 280, // Enforce ultra-low token output
          temperature: tone === 'spicy' ? 0.8 : 0.6,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Gemini] API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed.roast) || parsed.roast.length === 0) return null;

    // Sanitize and constrain output lengths
    const cleanRoast = parsed.roast
      .filter(line => typeof line === 'string' && line.trim().length > 0)
      .slice(0, 4)
      .map(line => line.trim().slice(0, 300));

    const cleanBio = (typeof parsed.bio === 'string' ? parsed.bio.trim() : '').slice(0, 200);

    return {
      roast: cleanRoast,
      bio: cleanBio,
      source: 'gemini',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[Gemini] Failed to generate AI roast (falling back to deterministic engine):`, err.message);
    return null;
  }
}
