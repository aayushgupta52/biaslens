import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: d, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

const steps = [
  {
    n: '01',
    title: 'Discover',
    body: 'Every hour, Skew reads the public RSS feeds of its tracked sources and pulls the full text of new stories. Pure sports and celebrity-gossip coverage is skipped — a bias score on a match report is meaningless.',
  },
  {
    n: '02',
    title: 'Score',
    body: 'A large language model reads each article and scores its political slant from −1 (left) to +1 (right), judging framing, sourcing, and word choice — never the topic itself. It also writes a neutral summary and measures overall tone. Output is validated against a strict schema before anything is saved.',
  },
  {
    n: '03',
    title: 'Connect',
    body: 'Each story is converted into a vector embedding, letting Skew surface related coverage of the same event across the spectrum — so you can read the same news from the other side.',
  },
];

/** About — how Skew measures slant. */
export default function About() {
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
          How we measure slant.
        </motion.h1>
      </div>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.25}
        className="font-display text-[19px] italic font-light leading-relaxed text-ink-soft"
      >
        Every outlet has a vantage point. Skew doesn't hide it — it measures it, story
        by story, so you always know where you're standing.
      </motion.p>

      <div className="mt-12 space-y-10">
        {steps.map((s, i) => (
          <motion.section
            key={s.n}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.4 + i * 0.12}
            className="flex gap-5"
          >
            <span className="font-mono text-[12px] text-ink-faint pt-1.5 shrink-0">{s.n}</span>
            <div>
              <h2 className="font-display text-[24px] font-semibold tracking-tight">{s.title}</h2>
              <p className="mt-2 text-[15px] leading-[1.8] text-ink-soft">{s.body}</p>
            </div>
          </motion.section>
        ))}
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.85} className="rule my-12" />

      {/* Two kinds of labels */}
      <motion.section variants={fadeUp} initial="hidden" animate="show" custom={0.9}>
        <h2 className="font-display text-[24px] font-semibold tracking-tight">
          Two kinds of labels — don't confuse them.
        </h2>
        <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-ink-soft">
          <p>
            <strong className="text-ink">Article scores</strong> (the needle on every story)
            are generated fresh by AI for each individual article. A center outlet can
            publish a slanted story; a partisan outlet can publish a straight one.
          </p>
          <p>
            <strong className="text-ink">Source lean labels</strong> (the tags on the{' '}
            <Link to="/sources" className="underline underline-offset-2 hover:text-ink transition-colors">
              Sources
            </Link>{' '}
            page and sidebar) are static, manually-curated metadata. They are approximate
            and informed by third-party media bias trackers such as Media Bias/Fact Check
            and AllSides — <em>not</em> an in-house editorial judgment, and never decided
            by the AI.
          </p>
          <p>
            No bias measurement is objective truth. Treat every score as a lens,
            not a verdict — and read across the spectrum.
          </p>
        </div>
      </motion.section>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1.0}
        className="card-press mt-12 bg-paper-warm p-6"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-2">
          The stack
        </p>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Skew is built entirely on open tooling: articles are scored by Llama 3.3 70B with
          strict JSON-schema output, related coverage is matched with MiniLM sentence
          embeddings, and everything is stored in MongoDB. No paid APIs, no trackers.
        </p>
      </motion.div>
    </motion.main>
  );
}
