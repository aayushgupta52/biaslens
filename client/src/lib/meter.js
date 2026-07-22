/**
 * Anonymous metering — 2 free article-detail views per day, tracked in
 * localStorage with a date field so the count resets daily. Logged-in
 * users never touch this (unlimited). Only gates the detail page.
 */
const KEY = 'skew_meter';
export const FREE_ARTICLES_PER_DAY = 2;

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    // Stale (yesterday's) meter resets automatically
    if (raw && raw.date === today() && Array.isArray(raw.ids)) return raw;
  } catch {
    /* corrupted → fresh meter */
  }
  return { date: today(), ids: [] };
}

function save(meter) {
  try {
    localStorage.setItem(KEY, JSON.stringify(meter));
  } catch {
    /* storage full/blocked — fail open */
  }
}

/**
 * Register a view of `articleId` and report whether it's allowed.
 * Re-reading an article already counted today is always free.
 */
export function consumeView(articleId) {
  const meter = load();
  if (meter.ids.includes(articleId)) return { allowed: true, used: meter.ids.length };
  if (meter.ids.length >= FREE_ARTICLES_PER_DAY) {
    return { allowed: false, used: meter.ids.length };
  }
  meter.ids.push(articleId);
  save(meter);
  return { allowed: true, used: meter.ids.length };
}
