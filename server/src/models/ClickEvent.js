import mongoose from 'mongoose';

/**
 * ClickEvent — one row per article-detail open (custom analytics,
 * replacing PostHog). Anonymous: no user linkage, just which article
 * was read, its source/category/bias and when. Powers aggregate
 * popularity/engagement stats only.
 */
const clickEventSchema = new mongoose.Schema(
  {
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    source: { type: String },
    category: { type: String },
    biasLabel: {
      type: String,
      enum: ['Left', 'Leans Left', 'Center', 'Leans Right', 'Right', null],
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ClickEvent', clickEventSchema);
