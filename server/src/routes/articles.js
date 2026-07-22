import { Router } from 'express';
import Article from '../models/Article.js';
import { cosineSimilarity } from '../ai/embeddings.js';

const router = Router();

// GET /api/articles?category=Politics&page=1&limit=20
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(150, Math.max(1, parseInt(req.query.limit) || 20));
    const filter = { excluded: { $ne: true } };
    if (req.query.category && req.query.category !== 'All Stories') {
      filter.category = req.query.category;
    }
    if (req.query.source) filter.source = req.query.source;

    // Free-text search across title / summary / source. Escaped so user
    // input can't inject regex metacharacters (ReDoS / unintended matches).
    const q = (req.query.q || '').trim();
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ title: rx }, { summary: rx }, { source: rx }];
    }

    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-content'),
      Article.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('List articles error:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ article });
  } catch {
    res.status(404).json({ error: 'Article not found' });
  }
});

/**
 * GET /api/articles/:id/related — semantic matches via vector similarity.
 * Ranks other analyzed articles by cosine similarity of their embeddings.
 */
router.get('/:id/related', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('+embedding');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    if (!article.embedding?.length) return res.json({ items: [] });

    const candidates = await Article.find({
      _id: { $ne: article._id },
      analyzed: true,
      excluded: { $ne: true },
      embedding: { $exists: true },
    }).select('+embedding title source category publishedAt bias biasLabel sentiment summary imageUrl');

    const items = candidates
      .map((c) => ({
        similarity: cosineSimilarity(article.embedding, c.embedding),
        article: c,
      }))
      .filter((r) => r.similarity > 0.35) // drop unrelated noise
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
      .map(({ similarity, article: c }) => ({
        _id: c._id,
        title: c.title,
        source: c.source,
        category: c.category,
        publishedAt: c.publishedAt,
        bias: c.bias,
        biasLabel: c.biasLabel,
        sentiment: c.sentiment,
        similarity: Math.round(similarity * 100) / 100,
      }));

    res.json({ items });
  } catch (err) {
    console.error('Related articles error:', err);
    res.status(500).json({ error: 'Failed to fetch related articles' });
  }
});

export default router;
