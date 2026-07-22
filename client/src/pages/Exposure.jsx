import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { leanDot } from '../lib/leans.js';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Display order + tone for the label bars
const LABELS = ['Left', 'Leans Left', 'Center', 'Leans Right', 'Right', 'Unscored'];
const labelBar = {
  Left: 'bg-left',
  'Leans Left': 'bg-left/70',
  Center: 'bg-center',
  'Leans Right': 'bg-right/70',
  Right: 'bg-right',
  Unscored: 'bg-paper-deep',
};

/**
 * My Bias Exposure — the signed-in user's reading history aggregated on
 * the same Left↔Right spectrum used everywhere else in Skew.
 */
export default function Exposure() {
  const { user, token, loading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .getExposure(token)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  const breakdown = data
    ? LABELS.map((label) => data.breakdown.find((b) => b.label === label) || { label, count: 0, pct: 0 }).filter(
        (b) => b.count > 0 || ['Left', 'Center', 'Right'].includes(b.label)
      )
    : [];

  // Needle position for average bias: -1..1 → 0..100
  const avgPct = data?.avgBias !== null && data?.avgBias !== undefined ? ((data.avgBias + 1) / 2) * 100 : null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="mx-auto max-w-3xl px-5 sm:px-8 pb-24"
    >
      <div className="overflow-hidden pt-10 pb-4">
        <motion.h1
          initial={{ y: '105%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-semibold leading-[1.02] tracking-tight"
        >
          My bias exposure.
        </motion.h1>
      </div>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.25}
        className="max-w-2xl text-[15px] leading-relaxed text-ink-soft"
      >
        Where your reading has taken you across the spectrum, {user.name.split(' ')[0]}.
        Only you can see this.
      </motion.p>

      {error && (
        <p className="mt-10 text-[14px] text-right">{error}</p>
      )}

      {data && data.total === 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.4}
          className="card-press mt-12 bg-paper-warm p-8 text-center"
        >
          <p className="font-display text-[20px] font-semibold">Nothing logged yet.</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-faint">
            Open any story and it will start counting. Come back after a few reads to see
            your spread across the spectrum.
          </p>
        </motion.div>
      )}

      {data && data.total > 0 && (
        <>
          {/* Headline numbers */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.35}
            className="mt-12 flex flex-wrap gap-8"
          >
            <div>
              <p className="font-display text-[44px] font-semibold leading-none">{data.total}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                Articles read
              </p>
            </div>
            <div>
              <p className="font-display text-[44px] font-semibold leading-none">
                {data.avgBias > 0 ? '+' : ''}
                {data.avgBias ?? '—'}
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                Average slant
              </p>
            </div>
            <div>
              <p className="font-display text-[44px] font-semibold leading-none">{data.bySource.length}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                Sources
              </p>
            </div>
          </motion.div>

          {/* Aggregate spectrum — same visual language as the BiasMeter */}
          {avgPct !== null && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.45} className="mt-12">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint mb-2">
                Your center of gravity
              </p>
              <div className="relative h-2.5 rounded-full bg-paper-deep">
                <div
                  className="absolute inset-0 rounded-full opacity-45"
                  style={{
                    background:
                      'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
                  }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-ink/25" />
                <motion.div
                  initial={{ left: '50%', scale: 0 }}
                  animate={{ left: `${avgPct}%`, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="size-5 rounded-full border-2 border-paper bg-ink shadow-lift" />
                </motion.div>
              </div>
              <div className="flex justify-between mt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
              </div>
            </motion.div>
          )}

          {/* Breakdown bars */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.55} className="mt-12 space-y-3.5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
              Breakdown by label
            </p>
            {breakdown.map((b, i) => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium text-ink-soft">{b.label}</span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {b.count} · {b.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-paper-deep overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ delay: 0.65 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${labelBar[b.label] || 'bg-ink'}`}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Sources read */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.7} className="mt-12">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint mb-3">
              Sources you've read
            </p>
            <div className="flex flex-wrap gap-2">
              {data.bySource.map((s) => (
                <span
                  key={s.source}
                  className="tag-square bg-paper-warm px-3 py-1.5 font-mono text-[11px] text-ink-soft"
                >
                  {s.source} <span className="text-ink-faint">×{s.count}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.main>
  );
}
