import cron from 'node-cron';
import { runScraper } from '../scraper/engine.js';
import { runAnalysis } from '../ai/pipeline.js';

// Single in-process lock shared by the cron job and manual triggers so a
// scheduled run never overlaps one already in progress.
let pipelineRunning = false;

export function isPipelineRunning() {
  return pipelineRunning;
}

/**
 * Run the full pipeline once: scrape new articles, then analyze whatever
 * is unanalyzed. Analysis already throttles Groq calls (delay-based
 * batching in pipeline.js) to stay under the free-tier rate limit.
 */
export async function runPipelineOnce(trigger = 'manual') {
  if (pipelineRunning) {
    console.log(`⏳ Pipeline already running — ${trigger} trigger skipped`);
    return { skipped: true };
  }
  pipelineRunning = true;
  const started = new Date();
  console.log(`🔄 [${trigger}] pipeline started at ${started.toISOString()}`);
  try {
    const scrape = await runScraper();
    console.log(`🕸  scrape — ${scrape.scraped} new, ${scrape.skipped} skipped, ${scrape.failed} failed`);

    const analysis = await runAnalysis();
    console.log(`🧠 analyze — ${analysis.analyzed} analyzed, ${analysis.failed} failed, ${analysis.remaining} remaining`);

    return { ok: true, scrape, analysis };
  } catch (err) {
    console.error('Pipeline run failed:', err);
    return { ok: false, error: err.message };
  } finally {
    pipelineRunning = false;
  }
}

/**
 * Register the hourly cron job. Fires at :17 past every hour (off the
 * :00 mark so it doesn't collide with other scheduled work) once
 * ENABLE_CRON is set — kept opt-in so local dev doesn't burn free-tier
 * API quota unintentionally.
 */
export function startScheduler() {
  if (process.env.ENABLE_CRON !== 'true') {
    console.log('⏰ Hourly pipeline disabled (set ENABLE_CRON=true to enable)');
    return;
  }
  cron.schedule('17 * * * *', () => {
    runPipelineOnce('cron');
  });
  console.log('⏰ Hourly pipeline scheduled (:17 past each hour)');
}

// Render free tier sleeps after 15 min of inactivity, killing node-cron.
// Self-ping every 10 min keeps the process alive so the scheduler never stops.
export function startKeepAlive() {
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (!renderUrl) return; // not on Render — skip

  setInterval(async () => {
    try {
      await fetch(`${renderUrl}/api/health`);
    } catch (e) {
      console.warn('⚠️  keep-alive ping failed:', e.message);
    }
  }, 10 * 60 * 1000);

  console.log(`💓 Keep-alive pinger active → ${renderUrl}/api/health`);
}
