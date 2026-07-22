import { Router } from 'express';
import { runScraper } from '../scraper/engine.js';
import Article from '../models/Article.js';
import { isPipelineRunning } from '../jobs/scheduler.js';

const router = Router();

let running = false;

/**
 * POST /api/scrape/run — internal route to trigger the pipeline.
 * Guarded by SCRAPE_KEY so it can't be hit publicly; never called on UI load.
 */
router.post('/run', async (req, res) => {
  const key = req.headers['x-scrape-key'] || req.query.key;
  if (process.env.SCRAPE_KEY && key !== process.env.SCRAPE_KEY) {
    return res.status(403).json({ error: 'Invalid scrape key' });
  }
  // Shared lock with the hourly cron so runs never overlap
  if (running || isPipelineRunning()) {
    return res.status(409).json({ error: 'Scrape already in progress' });
  }

  running = true;
  console.log('🕸  Scrape started…');
  try {
    const report = await runScraper();
    console.log(
      `🕸  Scrape done — ${report.scraped} new, ${report.skipped} skipped, ${report.failed} failed`
    );
    res.json({ ok: true, ...report });
  } catch (err) {
    console.error('Scrape run failed:', err);
    res.status(500).json({ error: 'Scrape failed' });
  } finally {
    running = false;
  }
});

// GET /api/scrape/status
router.get('/status', async (req, res) => {
  const total = await Article.countDocuments();
  const latest = await Article.findOne().sort({ createdAt: -1 }).select('title source createdAt');
  res.json({ running, totalArticles: total, latest });
});

export default router;
