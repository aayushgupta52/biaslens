import { Router } from 'express';
import ClickEvent from '../models/ClickEvent.js';
import Article from '../models/Article.js';

const router = Router();

/**
 * POST /api/analytics/click — log an article-detail open. Anonymous and
 * fire-and-forget from the client. Denormalizes source/category/bias off
 * the article so aggregate queries don't need a join.
 */
router.post('/click', async (req, res) => {
  try {
    const { articleId } = req.body || {};
    if (!articleId) return res.status(400).json({ error: 'articleId required' });

    const article = await Article.findById(articleId).select('source category biasLabel');
    if (!article) return res.status(404).json({ error: 'Article not found' });

    await ClickEvent.create({
      article: article._id,
      source: article.source,
      category: article.category,
      biasLabel: article.biasLabel ?? null,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Click log error:', err);
    res.status(500).json({ error: 'Failed to log click' });
  }
});

/**
 * GET /api/analytics/summary — aggregate engagement stats. Key-guarded
 * like the other internal routes (dashboard/ops use, not public UI).
 */
router.get('/summary', async (req, res) => {
  const key = req.headers['x-scrape-key'] || req.query.key;
  if (process.env.SCRAPE_KEY && key !== process.env.SCRAPE_KEY) {
    return res.status(403).json({ error: 'Invalid key' });
  }
  try {
    const [total, topArticles, bySource, byBias] = await Promise.all([
      ClickEvent.countDocuments(),
      ClickEvent.aggregate([
        { $group: { _id: '$article', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'articles',
            localField: '_id',
            foreignField: '_id',
            as: 'article',
          },
        },
        { $unwind: '$article' },
        { $project: { _id: 0, articleId: '$_id', clicks: 1, title: '$article.title', source: '$article.source' } },
      ]),
      ClickEvent.aggregate([
        { $group: { _id: '$source', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
      ]),
      ClickEvent.aggregate([{ $group: { _id: '$biasLabel', clicks: { $sum: 1 } } }]),
    ]);
    res.json({ total, topArticles, bySource, byBias });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Failed to build summary' });
  }
});

export default router;
