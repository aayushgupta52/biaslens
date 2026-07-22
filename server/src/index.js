import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import scrapeRoutes from './routes/scrape.js';
import aiRoutes from './routes/ai.js';
import historyRoutes from './routes/history.js';
import analyticsRoutes from './routes/analytics.js';
import { sourceMeta } from './scraper/sources.js';
import { startScheduler, startKeepAlive } from './jobs/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'skew-api', time: new Date().toISOString() });
});

// Static source-level metadata (name + manually-curated lean label).
// Lean labels are editorial config informed by third-party bias trackers
// (MBFC, AllSides) — never AI-generated.
app.get('/api/sources', (req, res) => {
  res.json({ sources: sourceMeta });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/analytics', analyticsRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`⚡ Skew API running on http://localhost:${PORT}`);
    startScheduler();
    startKeepAlive();
  });
});
