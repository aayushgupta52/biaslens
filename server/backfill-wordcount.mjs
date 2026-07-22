// One-off: backfill wordCount + report category/source distribution.
// Run: node backfill-wordcount.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.db.collection('articles');

// Backfill wordCount for existing articles
const cur = col.find({ $or: [{ wordCount: { $exists: false } }, { wordCount: 0 }] });
let n = 0;
for await (const a of cur) {
  const wc = (a.content || '').split(/\s+/).filter(Boolean).length;
  await col.updateOne({ _id: a._id }, { $set: { wordCount: wc } });
  n++;
}
console.log('backfilled wordCount for', n, 'articles');

// Imbalance investigation: articles per category per source
const agg = await col
  .aggregate([
    { $match: { excluded: { $ne: true } } },
    { $group: { _id: { c: '$category', s: '$source' }, n: { $sum: 1 } } },
    { $sort: { '_id.c': 1, n: -1 } },
  ])
  .toArray();
const byCat = {};
for (const r of agg) (byCat[r._id.c] ||= []).push(`${r._id.s}:${r.n}`);
for (const [c, arr] of Object.entries(byCat)) console.log(c, '→', arr.join(', '));

await mongoose.disconnect();
