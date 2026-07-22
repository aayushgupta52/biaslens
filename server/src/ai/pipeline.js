import Article from '../models/Article.js';
import { analyzeArticle } from './groq.js';
import { embedText } from './embeddings.js';

// Gentle pacing between articles keeps us inside free-tier rate limits
const DELAY_BETWEEN_ARTICLES_MS = 3000;
const BATCH_LIMIT = 15;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


export async function runAnalysis({ limit = BATCH_LIMIT } = {}) {
  const report = { analyzed: 0, excluded: 0, failed: 0, remaining: 0 };

  const pending = await Article.find({ analyzed: false })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('+embedding');

  for (const article of pending) {
    try {
      const analysis = await analyzeArticle({
        title: article.title,
        source: article.source,
        content: article.content,
      });

      // AI relevance check (second safety net after URL filtering):
      // pure sports/celebrity content gets no bias score and is hidden
      if (!analysis.civic) {
        article.excluded = true;
        article.analyzed = true;
        await article.save();
        report.excluded += 1;
        console.log(`  ⊘ [AI] excluded (non-civic): ${article.title.slice(0, 60)}`);
        await sleep(DELAY_BETWEEN_ARTICLES_MS);
        continue;
      }

      // MiniLM embeddings are English-centric: for non-English articles
      // (e.g. Hindi from The Lallantop) embed the English AI summary so
      // vector similarity still works across languages
      const embedInput =
        article.language && article.language !== 'en'
          ? `${article.title}\n\n${analysis.summary}`
          : `${article.title}\n\n${article.content}`;
      const embedding = await embedText(embedInput);

      article.summary = analysis.summary;
      article.sentiment = analysis.sentiment;
      article.bias = analysis.bias;
      article.biasLabel = analysis.biasLabel;
      article.embedding = embedding;
      article.analyzed = true;
      await article.save();

      report.analyzed += 1;
      console.log(`  ✓ [AI] ${article.title.slice(0, 60)} → ${analysis.biasLabel}`);
    } catch (err) {
      report.failed += 1;
      console.error(`  ✗ [AI] ${article.title.slice(0, 60)}: ${err.message}`);
    }

    await sleep(DELAY_BETWEEN_ARTICLES_MS);
  }

  report.remaining = await Article.countDocuments({ analyzed: false });
  return report;
}
