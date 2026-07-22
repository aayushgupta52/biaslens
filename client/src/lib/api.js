const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: (token) => request('/auth/me', { token }),

  listArticles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/articles${qs ? `?${qs}` : ''}`);
  },
  getArticle: (id) => request(`/articles/${id}`),
  getRelated: (id) => request(`/articles/${id}/related`),
  search: (q, limit = 20) =>
    request(`/articles?q=${encodeURIComponent(q)}&limit=${limit}`),
  listSources: () => request('/sources'),

  logRead: (articleId, token) =>
    request('/history/read', { method: 'POST', body: { articleId }, token }),
  getExposure: (token) => request('/history/exposure', { token }),

  logClick: (articleId) =>
    request('/analytics/click', { method: 'POST', body: { articleId } }),
};

/**
 * Normalize a MongoDB article document into the shape the UI components
 * consume (same shape as the Phase 1 dummy data). bias/sentiment stay
 * null until the AI pipeline has analyzed the article.
 */
export function normalizeArticle(doc) {
  const content = doc.content || '';
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);

  // Some sites put a URL in their author meta tag — not a real byline
  const rawAuthor = doc.author || '';
  const author = rawAuthor && !/^https?:\/\//i.test(rawAuthor) ? rawAuthor : doc.source || 'Staff';

  // Read time from real word count (words/200 wpm, rounded up, min 1).
  // wordCount is stored server-side; fall back to counting content words
  // for docs fetched with full content.
  const words = doc.wordCount || content.split(/\s+/).filter(Boolean).length;

  return {
    id: doc._id,
    live: true,
    category: doc.category || 'General',
    source: doc.source,
    author,
    publishedAt: doc.publishedAt,
    readMins: Math.max(1, Math.ceil(words / 200)),
    title: doc.title,
    dek: doc.summary || paragraphs[0]?.slice(0, 200) || '',
    bias: doc.bias ?? null,
    sentiment: doc.sentiment ?? null,
    biasLabel: doc.biasLabel ?? null,
    summary: doc.summary || '',
    analyzed: Boolean(doc.analyzed),
    body: paragraphs,
    tags: [doc.category, doc.source].filter(Boolean),
    url: doc.url || '',
    imageUrl: doc.imageUrl || '',
  };
}
