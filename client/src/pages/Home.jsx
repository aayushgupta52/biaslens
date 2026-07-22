import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import { articles as dummyArticles } from '../data/articles.js';
import { api, normalizeArticle } from '../lib/api.js';

export default function Home() {
  const [category, setCategory] = useState('All Stories');
  const [liveArticles, setLiveArticles] = useState(null); // null = loading / unavailable

  // Fetch scraped + AI-analyzed articles; fall back to dummy data if the
  // API is unreachable or the database is still empty.
  useEffect(() => {
    let cancelled = false;
    api
      .listArticles({ limit: 150 })
      .then(({ items }) => {
        if (!cancelled && items?.length) setLiveArticles(items.map(normalizeArticle));
      })
      .catch(() => {}); // keep dummy data
    return () => {
      cancelled = true;
    };
  }, []);

  const articles = liveArticles || dummyArticles;

  // Category counts derived from whichever article set is showing.
  // Canonical sections always appear (even at 0); extras from live data
  // (e.g. India) slot in after them.
  const categories = useMemo(() => {
    const CANONICAL = ['Politics', 'Elections', 'Opinion', 'World', 'Economy', 'Business', 'Technology'];
    const counts = {};
    for (const a of articles) counts[a.category] = (counts[a.category] || 0) + 1;
    const extras = Object.keys(counts)
      .filter((c) => !CANONICAL.includes(c))
      .sort((x, y) => counts[y] - counts[x]);
    return [
      { name: 'All Stories', count: articles.length },
      ...[...CANONICAL, ...extras].map((name) => ({ name, count: counts[name] || 0 })),
    ];
  }, [articles]);

  const filtered = useMemo(
    () => (category === 'All Stories' ? articles : articles.filter((a) => a.category === category)),
    [category, articles]
  );

  const [lead, ...rest] = filtered;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="mx-auto max-w-7xl px-5 sm:px-8 pb-24"
    >
      {/* Masthead strip */}
      <div className="flex items-center justify-between py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden sm:flex items-center gap-2"
        >
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          {liveArticles
            ? `${articles.filter((a) => a.analyzed).length} of ${articles.length} stories analyzed`
            : `${articles.length} stories analyzed`}
        </motion.span>
      </div>

      {/* Headline banner */}
      <div className="overflow-hidden pb-8 pt-2">
        <motion.h1
          initial={{ y: '105%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-display text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-tight"
        >
          Read the news.
          <br />
          <span className="italic font-light">
            See the{' '}
            <span className="relative inline-block not-italic font-semibold -rotate-2">
              slant
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 h-[5px] w-full origin-left rounded-full"
                style={{
                  background:
                    'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
                }}
              />
            </span>
            .
          </span>
        </motion.h1>
      </div>

      <div className="flex gap-10">
        <Sidebar active={category} onSelect={setCategory} categories={categories} />

        <div className="min-w-0 flex-1">
          {/* Mobile category chips */}
          <div className="lg:hidden -mx-5 px-5 mb-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map(({ name: c }) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                    category === c
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line bg-paper-warm text-ink-soft'
                  }`}
                >
                  {c}
                </button>
              ))}
          </div>

          {lead ? (
            <div key={category + (liveArticles ? '-live' : '-dummy')}>
              {/* Lead story */}
              <ArticleCard article={lead} index={0} featured />

              {/* Grid */}
              {rest.length > 0 && (
                <>
                  <div className="flex items-center gap-4 mt-10 mb-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint shrink-0">
                      Latest analysis
                    </span>
                    <div className="rule flex-1" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {rest.map((a, i) => (
                      <ArticleCard key={a.id} article={a} index={i + 1} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center font-display text-xl text-ink-faint italic"
            >
              No stories in this section yet.
            </motion.p>
          )}
        </div>
      </div>
    </motion.main>
  );
}
