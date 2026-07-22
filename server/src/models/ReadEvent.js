import mongoose from 'mongoose';

/**
 * ReadEvent — one row per article view by a logged-in user.
 * Powers the "My Bias Exposure" breakdown; nothing else.
 */
const readEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    source: { type: String, required: true },
    biasLabel: {
      type: String,
      enum: ['Left', 'Leans Left', 'Center', 'Leans Right', 'Right', null],
      default: null,
    },
    bias: { type: Number, min: -1, max: 1, default: null },
  },
  { timestamps: true }
);

// One event per user per article per day — repeat opens don't inflate exposure
readEventSchema.index(
  { user: 1, article: 1, createdAt: 1 },
  { unique: false }
);

export default mongoose.model('ReadEvent', readEventSchema);
