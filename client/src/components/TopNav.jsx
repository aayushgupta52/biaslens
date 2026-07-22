import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { leanDot } from '../lib/leans.js';
import AuthModal from './AuthModal.jsx';
import SearchOverlay from './SearchOverlay.jsx';

const links = [
  { label: 'Today', to: '/' },
  { label: 'Spectrum', to: '/spectrum' },
  { label: 'Sources', to: '/sources' },
  { label: 'About', to: '/about' },
];

function SkewMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--color-ink)" />
      <path d="M8 22 L24 10" stroke="var(--color-paper)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="10" r="3.4" fill="var(--color-right)" />
      <circle cx="8" cy="22" r="3.4" fill="var(--color-left)" />
    </svg>
  );
}

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // desktop user dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const [searchOpen, setSearchOpen] = useState(false);
  const [sources, setSources] = useState([]);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  // ⌘K / Ctrl-K opens search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // hover underline state
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setHovered(null);
    setMobileOpen(false);
  }, [location.pathname]);

  // Tracked sources for the mobile drawer (sidebar is hidden < lg)
  useEffect(() => {
    api
      .listSources()
      .then(({ sources }) => setSources(sources || []))
      .catch(() => {});
  }, []);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-paper/85 backdrop-blur-md shadow-lift' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div
          className={`flex items-center justify-between border-b border-line/70 transition-all duration-500 ${
            scrolled ? 'py-3' : 'py-5'
          }`}
        >
          {/* Wordmark */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div whileHover={{ rotate: -8, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <SkewMark />
            </motion.div>
            <div className="leading-none">
              <span className="font-display text-[22px] sm:text-[26px] font-semibold tracking-tight">
                Skew
                <span className="text-right">.</span>
              </span>
              <span className="hidden sm:block font-mono text-[9px] uppercase tracking-[0.28em] text-ink-faint mt-1">
                See the slant
              </span>
            </div>
          </Link>

          {/* Links (desktop) */}
          <nav className="hidden md:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
            {links.map((l, i) => (
              <Link
                key={l.label}
                to={l.to}
                onMouseEnter={() => setHovered(i)}
                className="relative px-4 py-2 text-[13px] font-medium tracking-wide text-ink-soft hover:text-ink transition-colors"
              >
                {hovered === i && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-paper-deep"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="btn-press hidden sm:inline-flex items-center gap-2 bg-paper-warm px-4 py-2 text-[13px] font-medium text-ink cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              Search
            </motion.button>
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="btn-press flex items-center gap-2.5 bg-paper-warm py-1.5 pl-1.5 pr-2.5 sm:pr-4 cursor-pointer"
                >
                  <span className="flex size-7.5 items-center justify-center rounded-full bg-ink font-display text-[13px] font-semibold text-paper">
                    {user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-[13px] font-semibold text-ink-soft max-w-28 truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="card-press absolute right-0 top-full z-20 mt-2 w-56 bg-paper p-2"
                      >
                        <div className="px-3 py-2.5">
                          <p className="text-[13.5px] font-semibold truncate">{user.name}</p>
                          <p className="font-mono text-[10px] text-ink-faint truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <div className="rule my-1" />
                        <Link
                          to="/exposure"
                          onClick={() => setMenuOpen(false)}
                          className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-ink-soft hover:bg-paper-warm transition-colors"
                        >
                          My Bias Exposure
                        </Link>
                        <div className="rule my-1" />
                        <button
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                          }}
                          className="w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-right hover:bg-right-soft transition-colors cursor-pointer"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => setAuthOpen(true)}
                className="btn-press bg-ink px-4 sm:px-5 py-2 text-[13px] font-semibold text-paper cursor-pointer"
              >
                Sign in
              </motion.button>
            )}

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
              className="btn-press md:hidden flex size-9.5 items-center justify-center bg-paper-warm cursor-pointer"
            >
              <div className="relative flex w-4.5 flex-col items-stretch gap-[5px]">
                <span
                  className={`h-[2px] bg-ink transition-transform duration-300 ${
                    mobileOpen ? 'translate-y-[7px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`h-[2px] bg-ink transition-opacity duration-200 ${
                    mobileOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`h-[2px] bg-ink transition-transform duration-300 ${
                    mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-[57px] z-40 bg-ink/35 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-60px)] overflow-y-auto border-b border-ink bg-paper px-5 pb-7 pt-4 md:hidden"
            >
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="btn-press mb-3 flex w-full items-center gap-2.5 bg-paper-warm px-4 py-3 text-[15px] font-medium text-ink cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                Search stories
              </button>
              <nav className="space-y-0.5">
                {[...links, ...(user ? [{ label: 'My Bias Exposure', to: '/exposure' }] : [])].map((l, i) => (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 font-display text-[22px] font-semibold tracking-tight text-ink"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {sources.length > 0 && (
                <>
                  <div className="rule my-4" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-2.5">
                    Tracked Sources
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {sources.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-2 min-w-0">
                        <span className="truncate text-[12.5px] text-ink-soft">{s.name}</span>
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${leanDot[s.lean] || 'bg-center'}`}
                          title={s.lean}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3.5 font-mono text-[9px] leading-relaxed text-ink-faint/80">
                    Source lean labels are approximate, informed by third-party media bias trackers
                    (Media Bias/Fact Check, AllSides) — not an in-house editorial judgment.
                  </p>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
