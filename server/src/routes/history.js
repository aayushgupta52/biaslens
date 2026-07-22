import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import ReadEvent from '../models/ReadEvent.js';
import Article from '../models/Article.js';

const router = Router();

// All history routes require a valid JWT
router.use(requireAuth);

/**
 * POST /api/history/read  { articleId }
 * Log an article view for the signed-in user. Deduped per user+article
 * within 12h so refreshes don't inflate exposure numbers.
 */
router.post('/read', async (req, res) => {
  try {
    const { articleId } = req.body || {};
    if (!articleId) return res.status(400).json({ error: 'articleId is required' });

    const article = await Article.findById(articleId).select('source bias biasLabel');
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const recent = await ReadEvent.exists({
      user: req.user._id,
      article: article._id,
      createdAt: { $gte: since },
    });
    if (!recent) {
      await ReadEvent.create({
        user: req.user._id,
        article: article._id,
        source: article.source,
        bias: article.bias,
        biasLabel: article.biasLabel,
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Log read error:', err);
    res.status(500).json({ error: 'Failed to log read' });
  }
});

/**
 * GET /api/history/exposure
 * The signed-in user's read count and percentage breakdown by bias label,
 * plus per-source counts and average bias of everything they've read.
 */
router.get('/exposure', async (req, res) => {
  try {
    const events = await ReadEvent.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('source bias biasLabel createdAt');

    const total = events.length;
    const byLabel = {};
    const bySource = {};
    let biasSum = 0;
    let biasN = 0;

    for (const e of events) {
      const label = e.biasLabel || 'Unscored';
      byLabel[label] = (byLabel[label] || 0) + 1;
      bySource[e.source] = (bySource[e.source] || 0) + 1;
      if (typeof e.bias === 'number') {
        biasSum += e.bias;
        biasN += 1;
      }
    }

    const breakdown = Object.entries(byLabel).map(([label, count]) => ({
      label,
      count,
      pct: total ? Math.round((count / total) * 1000) / 10 : 0,
    }));

    res.json({
      total,
      breakdown,
      bySource: Object.entries(bySource)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      avgBias: biasN ? Math.round((biasSum / biasN) * 100) / 100 : null,
      lastRead: events[0]?.createdAt || null,
    });
  } catch (err) {
    console.error('Exposure error:', err);
    res.status(500).json({ error: 'Failed to fetch exposure' });
  }
});

export default router;
