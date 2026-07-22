import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } },
};

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-line bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-ink-faint/60 outline-none transition-all duration-300 focus:border-ink/40 focus:shadow-lift"
      />
    </label>
  );
}

export default function AuthModal({ open, onClose }) {
  const { signup, login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      onClose();
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 backdrop-blur-sm px-5"
        >
          <motion.div
            variants={panelVariants}
            onClick={(e) => e.stopPropagation()}
            className="card-press w-full max-w-md bg-paper p-8"
          >
            {/* Header */}
            <div className="mb-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-2">
                {mode === 'login' ? 'Welcome back' : 'Join Skew'}
              </p>
              <h2 className="font-display text-[28px] font-semibold tracking-tight leading-tight">
                {mode === 'login' ? 'Sign in to continue.' : 'Create your account.'}
              </h2>
            </div>

            {/* Mode toggle */}
            <div className="relative mb-6 grid grid-cols-2 border border-ink bg-paper-warm p-1" style={{ borderRadius: '3px' }}>
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="relative py-2 text-[13px] font-semibold cursor-pointer"
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-toggle"
                      className="absolute inset-0 bg-ink"
                      style={{ borderRadius: '2px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span
                    className={`relative transition-colors duration-200 ${
                      mode === m ? 'text-paper' : 'text-ink-faint'
                    }`}
                  >
                    {m === 'login' ? 'Sign in' : 'Sign up'}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <Field
                      label="Name"
                      type="text"
                      placeholder="Ada Lovelace"
                      value={form.name}
                      onChange={set('name')}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
              <Field
                label="Password"
                type="password"
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                value={form.password}
                onChange={set('password')}
                required
                minLength={mode === 'signup' ? 8 : undefined}
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-right-soft px-4 py-2.5 text-[13px] font-medium text-right"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                disabled={busy}
                type="submit"
                className="btn-press w-full bg-ink py-3.5 text-[14px] font-semibold text-paper disabled:opacity-60 cursor-pointer"
              >
                {busy
                  ? 'One moment…'
                  : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
              </motion.button>
            </form>

            <p className="mt-5 text-center font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
              Secured with JWT · Passwords hashed with bcrypt
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
