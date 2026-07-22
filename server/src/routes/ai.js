import { Router } from 'express';
import { runAnalysis } from '../ai/pipeline.js';
import Article from '../models/Article.js';
import { isPipelineRunning } from '../jobs/scheduler.js';

const router = Router();

let running = false;

/**
 * POST /api/ai/analyze — internal route to run AI analysis on unanalyzed
 * articles. Guarded by SCRAPE_KEY like the scrape route; never hit on UI load.
 */
router.post('/analyze', async (req, res) => {
  const key = req.headers['x-scrape-key'] || req.query.key;
  if (process.env.SCRAPE_KEY && key !== process.env.SCRAPE_KEY) {
    return res.status(403).json({ error: 'Invalid key' });
  }
  // Shared lock with the hourly cron so Groq calls never double up
  if (running || isPipelineRunning()) {
    return res.status(409).json({ error: 'Analysis already in progress' });
  }

  running = true;
  console.log('🧠 AI analysis started…');
  try {
    const report = await runAnalysis();
    console.log(
      `🧠 AI analysis done — ${report.analyzed} analyzed, ${report.failed} failed, ${report.remaining} remaining`
    );
    res.json({ ok: true, ...report });
  } catch (err) {
    console.error('AI analysis failed:', err);
    res.status(500).json({ error: 'Analysis failed' });
  } finally {
    running = false;
  }
});

// GET /api/ai/status
router.get('/status', async (req, res) => {
  const [analyzed, pending] = await Promise.all([
    Article.countDocuments({ analyzed: true }),
    Article.countDocuments({ analyzed: false }),
  ]);
  res.json({ running, analyzed, pending });
});

export default router;
