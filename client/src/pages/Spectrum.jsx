import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { leanDot, leanPosition } from '../lib/leans.js';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * Spectrum — every tracked source plotted on the Left ↔ Right axis by its
 * static curated lean label. Sources sharing a position stack vertically.
 */
export default function Spectrum() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    api
      .listSources()
      .then(({ sources }) => setSources(sources || []))
      .catch(() => {});
  }, []);

  // Group sources by spectrum position so they stack instead of overlap.
  // Positions closer than 10 points (e.g. Left-Center at 26 vs Leans Left
  // at 32) are merged into one stack so flags never collide horizontally.
  const raw = {};
  for (const s of sources) {
    const pos = leanPosition[s.lean] ?? 50;
    (raw[pos] ||= []).push(s);
  }
  const groups = {};
  let cluster = null;
  for (const pos of Object.keys(raw).map(Number).sort((a, b) => a - b)) {
    if (cluster !== null && pos - cluster < 10) {
      groups[cluster].push(...raw[pos]);
    } else {
      cluster = pos;
      groups[cluster] = [...raw[pos]];
    }
  }
  const positions = Object.keys(groups).map(Number).sort((a, b) => a - b);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="mx-auto max-w-5xl px-5 sm:px-8 pb-24"
    >
      <div className="overflow-hidden pt-10 pb-4">
        <motion.h1
          initial={{ y: '105%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-semibold leading-[1.02] tracking-tight"
        >
          The Spectrum.
        </motion.h1>
      </div>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.25}
        className="max-w-2xl text-[15px] leading-relaxed text-ink-soft"
      >
        Every source Skew tracks, plotted by its curated lean. These positions are
        static editorial metadata informed by third-party bias trackers — the AI
        scores each <em>article</em> independently, and stories regularly land far
        from their outlet's home position.
      </motion.p>

      {/* Axis */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.4} className="mt-14">
        <div className="relative">
          {/* Track */}
          <div
            className="h-2.5 rounded-full"
            style={{
              background:
                'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
            }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-px bg-ink/40" />

          {/* Stacked source flags above the axis */}
          <div className="relative mt-1" style={{ minHeight: '1px' }}>
            {positions.map((pos) => (
              <div
                key={pos}
                className="absolute flex flex-col items-center gap-1.5 -translate-x-1/2 pt-4"
                style={{ left: `${pos}%` }}
              >
                {groups[pos].map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3 }}
                    className="card-press flex items-center gap-1.5 bg-paper-warm px-2.5 py-1.5 whitespace-nowrap"
                  >
                    <span className={`size-1.5 rounded-full ${leanDot[s.lean] || 'bg-center'}`} />
                    <span className="text-[11.5px] font-semibold text-ink">{s.name}</span>
                  </motion.div>
                ))}
              </div>
            ))}
            {/* Spacer tall enough for the deepest stack */}
            <div style={{ height: `${Math.max(...positions.map((p) => groups[p].length), 1) * 38 + 30}px` }} />
          </div>
        </div>

        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          <span>← Left</span>
          <span>Center</span>
          <span>Right →</span>
        </div>
      </motion.div>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.7}
        className="mt-12 max-w-xl font-mono text-[10px] leading-relaxed text-ink-faint/80"
      >
        Source lean labels are approximate, informed by third-party media bias trackers
        (Media Bias/Fact Check, AllSides) — not an in-house editorial judgment.
      </motion.p>
    </motion.main>
  );
}
