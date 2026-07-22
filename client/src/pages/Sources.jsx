import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { leanDot, leanPosition } from '../lib/leans.js';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/** Sources — full listing of every tracked outlet with its curated lean. */
export default function Sources() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    api
      .listSources()
      .then(({ sources }) => setSources(sources || []))
      .catch(() => {});
  }, []);

  const order = (s) => leanPosition[s.lean] ?? 50;
  const sorted = [...sources].sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));

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
          Tracked sources.
        </motion.h1>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl text-[15px] leading-relaxed text-ink-soft"
      >
        {sources.length} outlets scraped and scored, ordered left to right. Each card shows
        the source's curated lean — a fixed starting point, not a verdict on any article.
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {sorted.map((s) => {
          const pos = leanPosition[s.lean] ?? 50;
          return (
            <motion.div
              key={s.name}
              variants={item}
              whileHover={{ y: -4 }}
              className="card-press card-press-hover bg-paper-warm p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-[19px] font-semibold tracking-tight leading-tight">
                  {s.name}
                </h2>
                <span
                  className={`mt-1 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-faint shrink-0`}
                >
                  <span className={`size-1.5 rounded-full ${leanDot[s.lean] || 'bg-center'}`} />
                  {s.lean}
                </span>
              </div>

              {/* Mini spectrum with the source's position */}
              <div className="relative mt-5 h-1.5 rounded-full bg-paper-deep">
                <div
                  className="absolute inset-0 rounded-full opacity-45"
                  style={{
                    background:
                      'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
                  }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-ink/25" />
                <div
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink shadow-lift"
                  style={{ left: `${pos}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                <span>L</span>
                <span>C</span>
                <span>R</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 max-w-xl font-mono text-[10px] leading-relaxed text-ink-faint/80"
      >
        Source lean labels are approximate, informed by third-party media bias trackers
        (Media Bias/Fact Check, AllSides) — not an in-house editorial judgment. Per-article
        bias is measured independently by AI.
      </motion.p>
    </motion.main>
  );
}
