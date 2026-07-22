import { motion } from 'framer-motion';
import { biasLabel, biasTone } from '../data/articles.js';

const toneStyles = {
  left: { dot: 'bg-left', chip: 'bg-left-soft text-left', track: 'var(--color-left)' },
  center: { dot: 'bg-center', chip: 'bg-center-soft text-ink-soft', track: 'var(--color-center)' },
  right: { dot: 'bg-right', chip: 'bg-right-soft text-right', track: 'var(--color-right)' },
};

/**
 * BiasMeter — the signature element of Skew.
 * A horizontal spectrum (Left ◀── Center ──▶ Right) with an animated
 * needle that slides to the article's measured bias position.
 *
 * size: "sm" (cards) | "lg" (detail page)
 */
export default function BiasMeter({ bias, size = 'sm', delay = 0 }) {
  const lg = size === 'lg';

  // Article not yet analyzed by the AI pipeline — show a pending state
  if (bias === null || bias === undefined) {
    return (
      <div className={lg ? 'w-full' : 'w-full max-w-55'}>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`font-mono uppercase tracking-widest text-ink-faint ${lg ? 'text-[11px]' : 'text-[9px]'}`}
          >
            Bias
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-wider bg-paper-deep text-ink-faint ${
              lg ? 'text-[11px] px-2.5 py-1' : 'text-[9px] px-2 py-0.5'
            }`}
          >
            <span className="inline-block size-1.5 rounded-full bg-ink-faint/50 animate-pulse" />
            Analyzing
          </span>
        </div>
        <div className={`relative rounded-full bg-paper-deep ${lg ? 'h-2' : 'h-1.5'}`}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-ink/25" />
        </div>
        {lg && (
          <div className="flex justify-between mt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
        )}
      </div>
    );
  }

  const tone = biasTone(bias);
  const label = biasLabel(bias);
  const pct = ((bias + 1) / 2) * 100; // -1..1 → 0..100

  return (
    <div className={lg ? 'w-full' : 'w-full max-w-55'}>
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`font-mono uppercase tracking-widest text-ink-faint ${lg ? 'text-[11px]' : 'text-[9px]'}`}
        >
          Bias
        </span>
        <motion.span
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.45, duration: 0.35 }}
          className={`inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-wider ${toneStyles[tone].chip} ${
            lg ? 'text-[11px] px-2.5 py-1' : 'text-[9px] px-2 py-0.5'
          }`}
        >
          <span className={`inline-block size-1.5 rounded-full ${toneStyles[tone].dot}`} />
          {label}
        </motion.span>
      </div>

      {/* Track */}
      <div className={`relative rounded-full bg-paper-deep ${lg ? 'h-2' : 'h-1.5'}`}>
        {/* subtle spectrum wash under the track */}
        <div
          className="absolute inset-0 rounded-full opacity-45"
          style={{
            background:
              'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
          }}
        />
        {/* center tick */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-ink/25" />

        {/* Needle */}
        <motion.div
          initial={{ left: '50%', scale: 0 }}
          animate={{ left: `${pct}%`, scale: 1 }}
          transition={{ delay: delay + 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pct}%` }}
        >
          <div
            className={`rounded-full border-2 border-paper shadow-lift ${lg ? 'size-4.5' : 'size-3.5'}`}
            style={{ background: toneStyles[tone].track }}
          />
        </motion.div>
      </div>

      {lg && (
        <div className="flex justify-between mt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      )}
    </div>
  );
}
