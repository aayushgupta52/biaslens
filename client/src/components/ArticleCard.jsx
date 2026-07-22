import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BiasMeter from './BiasMeter.jsx';
import { formatDate } from '../data/articles.js';

const sentimentGlyph = (s) => (s > 0.15 ? '▲' : s < -0.15 ? '▼' : '◆');
const sentimentClass = (s) =>
  s > 0.15 ? 'text-accent' : s < -0.15 ? 'text-right' : 'text-ink-faint';

/** Lead image with graceful fallback — a spectrum-tinted monogram plate. */
function CardImage({ article, featured }) {
  const [failed, setFailed] = useState(false);
  const showImage = article.imageUrl && !failed;

  return (
    <div
      className={`relative overflow-hidden bg-paper-deep ${
        featured ? 'aspect-[21/9]' : 'aspect-[16/9]'
      }`}
      style={{ borderBottom: '1px solid var(--color-ink)' }}
    >
      {showImage ? (
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        /* Placeholder: source monogram on the paper spectrum */
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              background:
                'linear-gradient(115deg, var(--color-left), var(--color-center) 50%, var(--color-right))',
            }}
          />
          <span className="relative font-display text-[clamp(3rem,8vw,5rem)] font-semibold italic text-ink/15 select-none">
            {article.source?.[0] || 'S'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * ArticleCard — editorial card with the BiasMeter as its anchor element.
 * `featured` renders the large hero variant used for the lead story.
 */
export default function ArticleCard({ article, index = 0, featured = false }) {
  const a = article;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        to={`/article/${a.id}`}
        className="card-press card-press-hover flex h-full flex-col overflow-hidden bg-paper-warm"
      >
        <CardImage article={a} featured={featured} />

        <div className={`flex flex-1 flex-col ${featured ? 'p-7 sm:p-9' : 'p-5.5'}`}>
          {/* Meta row */}
          <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            <span className="tag-kicker text-ink-soft">{a.source}</span>
            <span className="size-0.75 rounded-full bg-line" />
            <span>{a.category}</span>
            <span className="size-0.75 rounded-full bg-line" />
            <span>{formatDate(a.publishedAt)}</span>
          </div>

          {/* Title */}
          <h2
            className={`font-display font-semibold tracking-tight text-ink mt-3 transition-colors duration-300 group-hover:text-ink-soft ${
              featured
                ? 'text-[30px] sm:text-[40px] leading-[1.05]'
                : 'text-[20px] leading-[1.16]'
            }`}
          >
            {a.title}
          </h2>

          {/* Dek */}
          <p
            className={`mt-3 text-ink-faint leading-relaxed ${
              featured ? 'text-[15.5px] max-w-2xl' : 'text-[13px] line-clamp-2'
            }`}
          >
            {a.dek}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-5 flex items-end justify-between gap-4">
            <BiasMeter bias={a.bias} delay={0.2 + index * 0.08} />
            <div className="flex flex-col items-end gap-1 shrink-0">
              {a.sentiment !== null && a.sentiment !== undefined && (
                <span className={`font-mono text-[10px] ${sentimentClass(a.sentiment)}`}>
                  {sentimentGlyph(a.sentiment)} {a.sentiment > 0 ? '+' : ''}
                  {a.sentiment.toFixed(2)}
                </span>
              )}
              <span className="font-mono text-[10px] text-ink-faint">{a.readMins} min</span>
            </div>
          </div>

          {/* Read cue — slides in on hover */}
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5 pt-3 text-[12px] font-semibold text-ink translate-y-6 opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              Read analysis
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
