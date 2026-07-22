import { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import BiasMeter from '../components/BiasMeter.jsx';
import Paywall from '../components/Paywall.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { articles as dummyArticles, formatDate, biasLabel } from '../data/articles.js';
import { api, normalizeArticle } from '../lib/api.js';
import { consumeView } from '../lib/meter.js';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

/** Compact related-article row shown in the analysis rail. */
function RelatedCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <Link
        to={`/article/${item._id}`}
        className="card-press card-press-hover group block bg-paper p-3.5"
      >
        <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
          <span className="truncate">{item.source}</span>
          {typeof item.similarity === 'number' && (
            <span className="shrink-0 text-accent">{Math.round(item.similarity * 100)}% match</span>
          )}
        </div>
        <p className="mt-1.5 font-display text-[14px] font-semibold leading-snug text-ink group-hover:text-ink-soft transition-colors line-clamp-2">
          {item.title}
        </p>
        <div className="mt-2.5">
          <BiasMeter bias={item.bias} delay={0.2 + index * 0.09} />
        </div>
      </Link>
    </motion.div>
  );
}

export default function ArticleDetail() {
  const { id } = useParams();
  const { token, user, loading: authLoading } = useAuth();

  const dummy = dummyArticles.find((a) => a.id === id) || null;
  const [article, setArticle] = useState(dummy);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState(dummy ? 'ready' : 'loading');

  // Anonymous metering: 2 free detail views/day, unlimited when signed in.
  // null = undecided (auth still restoring); gates only this page.
  const [gated, setGated] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setGated(false);
      return;
    }
    // consumeView is idempotent per article id, so StrictMode double-runs
    // and re-renders never burn extra credits
    setGated(!consumeView(id).allowed);
  }, [id, user, authLoading]);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  // Fetch the live article + its semantic matches (Mongo ids only —
  // dummy ids like "a1" will 404 and keep the local fallback).
  useEffect(() => {
    let cancelled = false;
    if (!dummy) setStatus('loading');

    api
      .getArticle(id)
      .then(({ article: doc }) => {
        if (cancelled) return;
        setArticle(normalizeArticle(doc));
        setStatus('ready');
        // Log the view for signed-in users (powers My Bias Exposure)
        if (token) api.logRead(id, token).catch(() => {});
        return api.getRelated(id).then(({ items }) => {
          if (!cancelled) setRelated(items || []);
        });
      })
      .catch(() => {
        if (!cancelled) setStatus(dummy ? 'ready' : 'missing');
      });

    return () => {
      cancelled = true;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Anonymous click analytics (replaces PostHog): log one event per article
  // open that actually renders — never for a gated/paywalled view. Guarded
  // by a ref so a re-render can't double-count the same open.
  const clickLogged = useRef(false);
  useEffect(() => {
    clickLogged.current = false;
  }, [id]);
  useEffect(() => {
    if (gated === false && status === 'ready' && article?.live && !clickLogged.current) {
      clickLogged.current = true;
      api.logClick(id).catch(() => {});
    }
  }, [gated, status, article, id]);

  if (status === 'missing') return <Navigate to="/" replace />;
  if (status === 'loading' || !article || gated === null) {
    return (
      <div className="flex items-center justify-center py-40">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-faint"
        >
          Loading story…
        </motion.span>
      </div>
    );
  }

  // Soft paywall: anonymous reader out of free views — show the nudge
  // instead of the article. Headlines/homepage stay unrestricted.
  if (gated) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        className="mx-auto max-w-7xl px-5 sm:px-8 pb-24"
      >
        <Paywall onSignIn={() => setAuthOpen(true)} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </motion.main>
    );
  }

  const a = article;
  const analyzed = a.bias !== null && a.bias !== undefined;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative"
    >
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[70] h-[3px] origin-left"
        style={{
          scaleX: progress,
          background:
            'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        {/* Back link */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="py-5">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-ink-faint hover:text-ink transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              <path d="M19 12H5" />
              <path d="m11 18-6-6 6-6" />
            </svg>
            All stories
          </Link>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* ── Article column ─────────────────────────────── */}
          <article className="min-w-0 max-w-3xl">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.05}>
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                <span className="tag-square bg-ink px-2.5 py-1 text-paper tracking-wider">
                  {a.category}
                </span>
                <span>{a.source}</span>
                <span className="size-0.75 rounded-full bg-line" />
                <span>{formatDate(a.publishedAt)}</span>
                <span className="size-0.75 rounded-full bg-line" />
                <span>{a.readMins} min read</span>
              </div>
            </motion.div>

            <div className="overflow-hidden mt-5">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.04] tracking-tight"
              >
                {a.title}
              </motion.h1>
            </div>

            {a.dek && (
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.3}
                className="mt-5 font-display text-[19px] italic font-light leading-relaxed text-ink-soft"
              >
                {a.dek}
              </motion.p>
            )}

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.4}
              className="mt-6 flex items-center gap-3"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-ink font-display text-[15px] font-semibold text-paper">
                {a.author
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="leading-tight">
                <p className="text-[13.5px] font-semibold">{a.author}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mt-0.5">
                  {a.source}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5} className="rule my-8" />

            {/* Lead image */}
            {a.imageUrl && (
              <motion.figure
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.55}
                className="card-press mb-8 overflow-hidden bg-paper-deep"
              >
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="w-full max-h-[440px] object-cover"
                  onError={(e) => (e.currentTarget.parentElement.style.display = 'none')}
                />
                <figcaption className="border-t border-ink px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
                  {a.source}
                </figcaption>
              </motion.figure>
            )}

            {/* Body */}
            <div className="space-y-6">
              {a.body.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`text-[16.5px] leading-[1.85] text-ink-soft ${i === 0 ? 'dropcap' : ''}`}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* Original source link for scraped stories */}
            {a.url && (
              <motion.a
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 inline-flex items-center gap-2 text-[13px] font-semibold text-ink hover:text-ink-soft transition-colors"
              >
                Read the original at {a.source}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </motion.a>
            )}

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {a.tags.map((t) => (
                <motion.span
                  key={t}
                  whileHover={{ y: -2 }}
                  className="tag-square bg-paper-warm px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint hover:border-ink/40 hover:text-ink transition-colors"
                >
                  {t}
                </motion.span>
              ))}
            </motion.div>
          </article>

          {/* ── Analysis rail ──────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 self-start space-y-5">
            {/* AI analysis card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.45}
              className="card-press bg-paper-warm p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-ink">
                  <svg width="14" height="14" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M8 22 L24 10" stroke="var(--color-paper)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="24" cy="10" r="4.5" fill="var(--color-right)" />
                    <circle cx="8" cy="22" r="4.5" fill="var(--color-left)" />
                  </svg>
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                  Skew Analysis
                </p>
              </div>

              <BiasMeter bias={a.bias} size="lg" delay={0.5} />

              <div className="rule my-5" />

              {/* Sentiment */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                  Sentiment
                </span>
                <span className="font-mono text-[11px] text-ink-soft">
                  {analyzed
                    ? `${a.sentiment > 0 ? '+' : ''}${a.sentiment.toFixed(2)}`
                    : '—'}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-paper-deep">
                {analyzed && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.abs(a.sentiment) * 50}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute top-0 h-full ${
                      a.sentiment >= 0
                        ? 'left-1/2 rounded-r-full bg-accent'
                        : 'right-1/2 rounded-l-full bg-right'
                    }`}
                  />
                )}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-ink/25" />
              </div>
              <div className="flex justify-between mt-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                <span>Negative</span>
                <span>Positive</span>
              </div>

              <div className="rule my-5" />

              {/* Summary */}
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-faint mb-2.5">
                AI Summary
              </p>
              <p className="text-[13.5px] leading-relaxed text-ink-soft">
                {a.summary || 'This story is queued for AI analysis. The summary, sentiment, and bias scores will appear once the next pipeline run completes.'}
              </p>

              {analyzed && (
                <p className="mt-5 font-mono text-[9.5px] leading-relaxed text-ink-faint/80">
                  Scored {biasLabel(a.bias).toLowerCase()} by Skew’s language model from framing,
                  sourcing, and word choice.
                </p>
              )}
            </motion.div>

            {/* Related coverage — vector-similarity matches */}
            {related.length > 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.6}
                className="card-press bg-paper-warm p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-1">
                  Related coverage
                </p>
                <p className="text-[11.5px] leading-relaxed text-ink-faint mb-4">
                  Semantic matches across the spectrum, ranked by vector similarity.
                </p>
                <div className="space-y-2.5">
                  {related.map((r, i) => (
                    <RelatedCard key={r._id} item={r} index={i} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.6}
                className="rounded-card border border-dashed border-line p-6 text-center"
              >
                <p className="font-display text-[15px] font-semibold text-ink-soft">Related coverage</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
                  {a.live
                    ? 'No strong semantic matches yet — more appear as new stories are analyzed.'
                    : 'Semantic matches across the spectrum will appear here once vector search is live.'}
                </p>
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </motion.main>
  );
}
