/**
 * Hugging Face Inference API — free-tier feature extraction for
 * vector embeddings. all-MiniLM-L6-v2 → 384-dim sentence vectors.
 */

const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;
const MAX_INPUT_CHARS = 2000;

/**
 * Generate an embedding for article text. Title + leading content is
 * enough signal for topical similarity while staying under input limits.
 * Returns a plain number[] (384 dims).
 */
export async function embedText(text) {
  if (!process.env.HF_API_KEY) throw new Error('HF_API_KEY is not set');

  const input = text.slice(0, MAX_INPUT_CHARS);

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(HF_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        body: JSON.stringify({ inputs: input }),
      });

      // 503 = model cold-starting on the free tier; wait and retry
      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        const wait = Math.min(30, Math.ceil(body.estimated_time || 15)) * 1000;
        await new Promise((r) => setTimeout(r, wait));
        throw new Error('HF model loading (503)');
      }
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 10000));
        throw new Error('HF rate limited (429)');
      }
      if (!res.ok) throw new Error(`HF HTTP ${res.status}`);

      const data = await res.json();
      // Response is either [dims] or [[dims]] depending on input shape
      const vector = Array.isArray(data[0]) ? data[0] : data;
      if (!Array.isArray(vector) || vector.length < 100 || typeof vector[0] !== 'number') {
        throw new Error('HF returned an invalid embedding');
      }
      return vector;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** Cosine similarity between two equal-length vectors. */
export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
