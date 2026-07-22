import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true, index: true },
    author: { type: String, default: 'Staff' },
    category: { type: String, default: 'General', index: true },
    publishedAt: { type: Date, default: Date.now },
    content: { type: String, required: true },
    // Word count of content — set at save time so list endpoints (which
    // exclude the content body) can still derive an accurate read time
    wordCount: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    // ISO code detected at scrape time ('en', 'hi', …) — lets the AI
    // pipeline handle non-English sources like The Lallantop correctly
    language: { type: String, default: 'en' },

    // ── AI analysis (populated in Phase 4) ────────────────────
    summary: { type: String, default: '' },
    // -1 (negative) … +1 (positive)
    sentiment: { type: Number, min: -1, max: 1, default: null },
    // -1 (left) … 0 (center) … +1 (right)
    bias: { type: Number, min: -1, max: 1, default: null },
    biasLabel: {
      type: String,
      enum: ['Left', 'Leans Left', 'Center', 'Leans Right', 'Right', null],
      default: null,
    },
    analyzed: { type: Boolean, default: false, index: true },
    // Pure sports/celebrity content flagged by the AI relevance check —
    // kept in DB (so the URL isn't re-scraped) but hidden from all lists
    excluded: { type: Boolean, default: false, index: true },

    // ── Vector embedding for semantic matching (Phase 4) ──────
    embedding: { type: [Number], default: undefined, select: false },
  },
  { timestamps: true }
);

articleSchema.index({ publishedAt: -1 });

export default mongoose.model('Article', articleSchema);
