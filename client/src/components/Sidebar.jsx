import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { categories as dummyCategories } from '../data/articles.js';
import { api } from '../lib/api.js';
import { leanDot } from '../lib/leans.js';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
};

const item = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Sidebar({ active, onSelect, categories = dummyCategories }) {
  const [hovered, setHovered] = useState(null);
  const [sources, setSources] = useState([]);
  const asideRef = useRef(null);
  const [stickyTop, setStickyTop] = useState(96); // 6rem default

  // Source-level lean labels are static config from the server —
  // manually curated (informed by MBFC/AllSides), never AI-derived
  useEffect(() => {
    let cancelled = false;
    api
      .listSources()
      .then(({ sources }) => {
        if (!cancelled && sources?.length) setSources(sources);
      })
      .catch(() => {}); // rail stays empty if API is down
    return () => {
      cancelled = true;
    };
  }, []);

  // Tall-sticky fix: when the rail is taller than the viewport, use a
  // negative sticky top so the WHOLE sidebar scrolls with the page and
  // pins once its bottom edge is in view. No inner scrollbar → page
  // scroll is never trapped by a nested scroller.
  useEffect(() => {
    const update = () => {
      const h = asideRef.current?.offsetHeight || 0;
      setStickyTop(Math.min(96, window.innerHeight - h - 24));
    };
    update();
    window.addEventListener('resize', update);
    // Re-measure once content (sources fetch, fonts) has settled
    const t = setTimeout(update, 600);
    return () => {
      window.removeEventListener('resize', update);
      clearTimeout(t);
    };
  }, [sources, categories]);

  return (
    <motion.aside
      ref={asideRef}
      variants={container}
      initial="hidden"
      animate="show"
      style={{ top: `${stickyTop}px` }}
      className="sticky hidden lg:block w-60 shrink-0 self-start pb-2"
    >
      {/* Sections */}
      <motion.p variants={item} className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-3 px-3">
        Sections
      </motion.p>
      <nav className="space-y-0.5" onMouseLeave={() => setHovered(null)}>
        {categories.map((c) => {
          const isActive = active === c.name;
          return (
            <motion.button
              key={c.name}
              variants={item}
              onClick={() => onSelect(c.name)}
              onMouseEnter={() => setHovered(c.name)}
              className="relative w-full flex items-center justify-between rounded-xl px-3 py-2 text-left cursor-pointer"
            >
              {(isActive || hovered === c.name) && (
                <motion.span
                  layoutId="sidebar-active"
                  className={`absolute inset-0 rounded-xl ${isActive ? 'bg-ink' : 'bg-paper-deep'}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative text-[13.5px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-paper' : 'text-ink-soft'
                }`}
              >
                {c.name}
              </span>
              <span
                className={`relative font-mono text-[10px] transition-colors duration-200 ${
                  isActive ? 'text-paper/60' : 'text-ink-faint'
                }`}
              >
                {c.count}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <motion.div variants={item} className="rule my-6" />

      {/* Tracked sources */}
      <motion.p variants={item} className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-3 px-3">
        Tracked Sources
      </motion.p>
      <div className="space-y-1">
        {sources.map((s) => (
          <motion.div
            key={s.name}
            variants={item}
            whileHover={{ x: 3 }}
            className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-paper-warm transition-colors"
          >
            <span className="text-[13px] text-ink-soft">{s.name}</span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-faint shrink-0">
              <span className={`size-1.5 rounded-full ${leanDot[s.lean] || 'bg-center'}`} />
              {s.lean}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Transparency note: labels come from third-party trackers, not us */}
      <motion.p
        variants={item}
        className="mt-3 px-3 font-mono text-[9px] leading-relaxed text-ink-faint/80"
      >
        Source lean labels are approximate, informed by third-party media bias
        trackers (Media Bias/Fact Check, AllSides) — not an in-house editorial
        judgment. Per-article scores are measured independently by AI.
      </motion.p>

      <motion.div variants={item} className="rule my-6" />

      {/* Spectrum legend card */}
      <motion.div
        variants={item}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="card-press bg-paper-warm p-4"
      >
        <p className="font-display text-[15px] font-semibold mb-1.5">How we measure slant</p>
        <p className="text-[12px] leading-relaxed text-ink-faint mb-3">
          Every story is scored by AI on a Left–Right spectrum, alongside tone and framing.
        </p>
        <div
          className="h-1.5 rounded-full"
          style={{
            background:
              'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
          }}
        />
        <div className="flex justify-between mt-1.5 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
          <span>L</span>
          <span>C</span>
          <span>R</span>
        </div>
      </motion.div>
    </motion.aside>
  );
}
