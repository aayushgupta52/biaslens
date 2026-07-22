import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FREE_ARTICLES_PER_DAY } from '../lib/meter.js';

/**
 * Soft paywall — shown in place of the article body when an anonymous
 * reader has used their free views for the day. Purely a sign-in nudge;
 * no payment, and browsing headlines stays unrestricted.
 */
export default function Paywall({ onSignIn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-xl py-16"
    >
      <div className="card-press bg-paper-warm p-8 sm:p-10 text-center">
        {/* Mark */}
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-ink">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M8 22 L24 10" stroke="var(--color-paper)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="24" cy="10" r="4.5" fill="var(--color-right)" />
            <circle cx="8" cy="22" r="4.5" fill="var(--color-left)" />
          </svg>
        </span>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          Daily limit reached
        </p>
        <h2 className="mt-2.5 font-display text-[clamp(1.6rem,4vw,2.2rem)] font-semibold leading-[1.08] tracking-tight">
          You've read your {FREE_ARTICLES_PER_DAY} free articles today.
        </h2>
        <p className="mx-auto mt-3.5 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
          Sign in to keep reading — unlimited stories, every source scored, and your
          personal bias-exposure tracker. Free, always.
        </p>

        {/* Spectrum rule */}
        <div
          className="mx-auto mt-7 h-1 w-24 rounded-full"
          style={{
            background:
              'linear-gradient(to right, var(--color-left), var(--color-center) 50%, var(--color-right))',
          }}
        />

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onSignIn}
            className="btn-press w-full sm:w-auto bg-ink px-7 py-3 text-[14px] font-semibold text-paper cursor-pointer"
          >
            Sign in to keep reading
          </button>
          <button
            onClick={onSignIn}
            className="btn-press w-full sm:w-auto bg-paper-warm px-7 py-3 text-[14px] font-semibold text-ink cursor-pointer"
          >
            Create a free account
          </button>
        </div>

        <p className="mt-6 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
          Your count resets at midnight
        </p>
      </div>

      <p className="mt-6 text-center">
        <Link
          to="/"
          className="text-[13px] font-medium text-ink-faint hover:text-ink transition-colors"
        >
          ← Keep browsing headlines instead
        </Link>
      </p>
    </motion.div>
  );
}
