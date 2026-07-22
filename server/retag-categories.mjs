// One-off: re-apply refined category tagging to already-saved articles.
// Run: node retag-categories.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from './src/models/Article.js';
import { refineCategory } from './src/scraper/engine.js';

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const articles = await Article.find().select('title url category');
let changed = 0;
for (const a of articles) {
  const next = refineCategory(a.category, a.url, a.title);
  if (next !== a.category) {
    console.log(`  ${a.category} → ${next}: ${a.title.slice(0, 60)}`);
    a.category = next;
    await a.save();
    changed += 1;
  }
}
console.log(`Retagged ${changed}/${articles.length} articles`);
await mongoose.disconnect();
