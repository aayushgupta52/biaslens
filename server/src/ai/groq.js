/**
 * Groq API client — Llama 3.3 70B with JSON-mode output.
 * Every response is forced through a strict schema validation so
 * downstream saves never break on malformed AI output.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_CONTENT_CHARS = 6000;

const SYSTEM_PROMPT = `You are a media-bias analyst for a news platform. Analyze the article and respond ONLY with a JSON object matching exactly this schema:
{
  "summary": string,      // 2-3 sentence neutral summary of the article, ALWAYS in English (even if the article is in Hindi or another language)
  "sentiment": number,    // overall tone from -1 (very negative) to 1 (very positive)
  "bias": number,         // political slant from -1 (far left) to 1 (far right), 0 = center
  "civic": boolean        // false ONLY if this is pure sports coverage (game results, player injuries, athlete stunts) or celebrity/entertainment gossip (feuds, personal life) with NO political, economic, policy, or civic relevance; true otherwise. Tech-business, tech-policy, sports-politics (e.g. stadium funding, athlete activism controversies) and entertainment-industry-policy stories ARE civic.
}
The article may be in any language (e.g. Hindi); analyze it in its own language but always write the summary in English. Judge bias from framing, sourcing, and word choice — not from the topic itself. Respond with the JSON object only, no other text.`;

/** Clamp a number into [min, max]; returns null if not a finite number. */
function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.min(max, Math.max(min, x));
}

/** Map a -1..1 bias score to its display label (mirrors the client scale). */
export function biasToLabel(bias) {
  if (bias <= -0.6) return 'Left';
  if (bias <= -0.2) return 'Leans Left';
  if (bias < 0.2) return 'Center';
  if (bias < 0.6) return 'Leans Right';
  return 'Right';
}

/**
 * Validate the parsed AI output against the strict schema.
 * Throws if any field is missing or out of range — callers treat that
 * as a failed analysis rather than saving garbage.
 */
function validateAnalysis(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('AI output is not an object');

  const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
  const sentiment = clamp(raw.sentiment, -1, 1);
  const bias = clamp(raw.bias, -1, 1);

  if (summary.length < 20) throw new Error('AI summary missing or too short');
  if (sentiment === null) throw new Error('AI sentiment is not a valid number');
  if (bias === null) throw new Error('AI bias is not a valid number');

  // civic defaults to true if the model omits it — exclusion must be explicit
  const civic = raw.civic !== false;

  return { summary, sentiment, bias, biasLabel: biasToLabel(bias), civic };
}

/**
 * Analyze one article with Groq. Returns { summary, sentiment, bias, biasLabel }.
 * Retries once on malformed output before giving up.
 */
export async function analyzeArticle({ title, source, content }) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');

  const userPrompt = `Title: ${title}\nSource: ${source}\n\nArticle:\n${content.slice(
    0,
    MAX_CONTENT_CHARS
  )}`;

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          max_tokens: 400,
          // JSON mode — Groq guarantees syntactically valid JSON output
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (res.status === 429) {
        // Rate limited — respect Retry-After if present, then retry once
        const wait = (parseInt(res.headers.get('retry-after')) || 10) * 1000;
        await new Promise((r) => setTimeout(r, wait));
        throw new Error('Groq rate limited (429)');
      }
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      return validateAnalysis(JSON.parse(text));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
