// One-off: flag existing pure-sports/celebrity articles as excluded,
// using the same URL/title rules the scraper now applies.
// Run: node cleanup-noncivic.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from './src/models/Article.js';
import { isExcludedTopic } from './src/scraper/engine.js';

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const articles = await Article.find({ excluded: { $ne: true } }).select('title url source');
let flagged = 0;
for (const a of articles) {
  if (isExcludedTopic(a.url, a.title)) {
    console.log(`  ⊘ [${a.source}] ${a.title.slice(0, 70)}`);
    a.excluded = true;
    await a.save();
    flagged += 1;
  }
}
console.log(`Excluded ${flagged}/${articles.length} existing articles`);
await mongoose.disconnect();
