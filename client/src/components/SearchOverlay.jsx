import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, normalizeArticle } from '../lib/api.js';
import { leanDot } from '../lib/leans.js';

// Site-wide search overlay. Debounced query against /api/articles?q=,
// keyboard-navigable, matches the editorial aesthetic (card-press, mono
// labels, Fraunces). Excluded sports/celebrity articles never surface
// because the backend filter already drops them.
export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus the field on open; reset everything on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQ('');
      setResults([]);
      setStatus('idle');
    }
  }, [open]);

  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Debounced search — 250ms after the user stops typing
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    let cancelled = false;
    const t = setTimeout(() => {
      api
        .search(term, 12)
        .then(({ items }) => {
          if (cancelled) return;
          setResults((items || []).map(normalizeArticle));
          setStatus('done');
        })
        .catch(() => {
          if (!cancelled) setStatus('done');
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const go = (id) => {
    onClose();
    navigate(`/article/${id}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-[12vh] z-[61] mx-auto max-w-2xl"
          >
            <div className="card-press overflow-hidden bg-paper">
              {/* Input row */}
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-ink-faint">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search stories, sources, topics…"
                  className="w-full bg-transparent font-display text-[19px] text-ink placeholder:text-ink-faint focus:outline-none"
                />
                <button
                  onClick={onClose}
                  className="btn-press shrink-0 bg-paper-warm px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft cursor-pointer"
                >
                  Esc
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[52vh] overflow-y-auto">
                {status === 'loading' && (
                  <p className="px-5 py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                    Searching…
                  </p>
                )}
                {status === 'done' && results.length === 0 && (
                  <p className="px-5 py-8 text-center text-[14px] text-ink-soft">
                    No stories match “{q.trim()}”.
                  </p>
                )}
                {status === 'idle' && q.trim().length < 2 && (
                  <p className="px-5 py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                    Type at least 2 characters
                  </p>
                )}
                <ul>
                  {results.map((a, i) => (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                    >
                      <button
                        onClick={() => go(a.id)}
                        className="flex w-full items-start gap-3 border-b border-line/60 px-5 py-3.5 text-left hover:bg-paper-warm transition-colors cursor-pointer"
                      >
                        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${leanDot[a.biasLabel] || 'bg-center'}`} />
                        <span className="min-w-0">
                          <span className="block font-display text-[15px] font-semibold leading-snug text-ink line-clamp-2">
                            {a.title}
                          </span>
                          <span className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                            <span>{a.source}</span>
                            <span>·</span>
                            <span>{a.category}</span>
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
