import * as cheerio from 'cheerio';
import Article from '../models/Article.js';
import { sources } from './sources.js';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const MAX_ARTICLES_PER_SOURCE = 5;
const FETCH_TIMEOUT_MS = 15000;
const MIN_CONTENT_CHARS = 400;

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xml,*/*' },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Parse an RSS feed into { title, url, publishedAt, imageUrl, feedHtml } items. */
function parseFeed(xml) {
  const $ = cheerio.load(xml, { xml: true });
  const items = [];
  $('item').each((_, el) => {
    const $el = $(el);
    const title = $el.find('title').first().text().trim();
    const url = $el.find('link').first().text().trim();
    const pub = $el.find('pubDate').first().text().trim();
    const imageUrl =
      $el.find('media\\:thumbnail, media\\:content, enclosure').first().attr('url') || '';
    // Some feeds (e.g. The Wire) ship the full article body in the feed
    // itself — keep it as a fallback when page scraping fails
    const feedHtml = $el.find('content\\:encoded').first().text() || '';
    if (title && url.startsWith('http')) {
      items.push({
        title,
        url,
        publishedAt: pub ? new Date(pub) : new Date(),
        imageUrl,
        feedHtml,
      });
    }
  });
  return items;
}

/** Scrape full article text from a page using the source's selectors. */
function extractContent(html, contentSelectors) {
  const $ = cheerio.load(html);
  $('script, style, noscript, figure, aside, nav, footer, header').remove();

  for (const selector of contentSelectors) {
    const paragraphs = $(selector)
      .map((_, p) => $(p).text().trim())
      .get()
      .filter((t) => t.length > 40); // drop bylines/captions/cruft
    const text = paragraphs.join('\n\n');
    if (text.length >= MIN_CONTENT_CHARS) return text;
  }

  // Density fallback for sites with rotating hashed classes (e.g. TOI):
  // pick the densest text container on the page
  let best = '';
  $('div, section, article').each((_, el) => {
    const own = $(el).clone().children('div,section,ul,form').remove().end().text().trim();
    if (own.length > best.length) best = own;
  });
  if (best.length >= MIN_CONTENT_CHARS) {
    return best.replace(/\s{3,}/g, '\n\n').slice(0, 20000);
  }
  return null;
}

/**
 * Fallback: extract text from HTML shipped inside the RSS item itself
 * (content:encoded), for sources whose pages block or obfuscate scraping.
 */
function extractFromFeedHtml(feedHtml) {
  if (!feedHtml || feedHtml.length < 200) return null;
  const $ = cheerio.load(feedHtml);
  $('script, style, figure, img').remove();
  const paragraphs = $('p')
    .map((_, p) => $(p).text().trim())
    .get()
    .filter((t) => t.length > 40);
  const text = paragraphs.length ? paragraphs.join('\n\n') : $.root().text().trim();
  return text.length >= MIN_CONTENT_CHARS ? text : null;
}

function extractAuthor(html) {
  const $ = cheerio.load(html);
  return (
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    'Staff'
  );
}

/**
 * Extract a lead image from the article page when the RSS item had none.
 * Order: og:image / twitter:image meta → first content <img>, handling
 * data-src / data-srcset lazy-load attributes.
 */
function extractImage(html) {
  const $ = cheerio.load(html);

  const meta =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[property="og:image:url"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');
  if (meta && meta.startsWith('http')) return meta;

  let found = '';
  $('article img, main img, img').each((_, el) => {
    if (found) return;
    const $img = $(el);
    const src =
      $img.attr('src') ||
      $img.attr('data-src') ||
      $img.attr('data-lazy-src') ||
      ($img.attr('data-srcset') || $img.attr('srcset') || '').split(/\s+/)[0];
    // Skip tracking pixels, icons, svg logos
    if (src && src.startsWith('http') && !/\.svg|logo|icon|pixel|1x1/i.test(src)) {
      found = src;
    }
  });
  return found;
}

/**
 * Cheap script-based language detection — enough to distinguish the
 * Hindi-language sources (Devanagari script) from English ones.
 */
function detectLanguage(text) {
  const sample = text.slice(0, 1500);
  let devanagari = 0;
  let letters = 0;
  for (const ch of sample) {
    const code = ch.codePointAt(0);
    if (code >= 0x0900 && code <= 0x097f) {
      devanagari += 1;
      letters += 1;
    } else if (/[a-zA-Z]/.test(ch)) {
      letters += 1;
    }
  }
  return letters > 0 && devanagari / letters > 0.3 ? 'hi' : 'en';
}

/**
 * Sports + celebrity/gossip exclusion — first safety net (URL/title).
 * Pure sports and celebrity-personal-life content has no political
 * framing; a bias score would be meaningless. Technology, tech-business
 * and tech-policy stories are NOT excluded and score normally.
 */
const EXCLUDE_URL_RE =
  /\/(sport|sports|cricket|football|soccer|tennis|nba|nfl|mlb|nhl|ipl|wwe|olympics|athletics|motorsport|f1|golf|rugby|badminton|hockey|entertainment|celebrity|celebrities|bollywood|hollywood|tollywood|gossip|showbiz|television|tv-shows|web-series|movies|film-?review|music-news|lifestyle\/(?:fashion|beauty))(\/|-|\.|$)/i;
const EXCLUDE_TITLE_RE =
  /\b(world cup (?:final|match|squad|qualifier)|test match|t20|odi|ipl \d{4}|premier league|champions league|super bowl|grand slam|wimbledon|box.?office|red carpet|paparazzi|breakup rumors?|dating rumors?|wags?\b)\b/i;

export function isExcludedTopic(url = '', title = '') {
  return EXCLUDE_URL_RE.test(url) || EXCLUDE_TITLE_RE.test(title);
}

/**
 * Refine a source's base category per-article.
 * - Opinion: source marks it via URL path (/opinion/, /comment/, …)
 * - Elections: election coverage anywhere (most bias-prone category)
 * - Business: corporate/markets stories split out of Economy, which
 *   stays macro (inflation, GDP, policy)
 */
const OPINION_PATH_RE =
  /\/(opinion|opinions|editorial|editorials|comment|commentisfree|op-?ed|voices|columns?|blogs?)(\/|\.|$)/i;
const ELECTION_RE =
  /\b(elections?|electoral|ballot|voters?|voting|by-?election|exit poll|opinion poll|lok sabha polls?|assembly polls?|midterms?|primar(?:y|ies)|re-?elect(?:ed|ion)?|poll(?:ing)? (?:booth|station|day|body))\b/i;
const ELECTION_URL_RE = /\/(elections?|polls?)(\/|-)/i;
const BUSINESS_RE =
  /\b(stocks?|shares?|ipo|earnings|quarterly (?:results|profits?)|mergers?|acquisitions?|startups?|start-ups?|ceo|cfo|revenue|valuation|sensex|nifty|nasdaq|dow jones|s&p 500|wall street|market cap|shareholders?|dividends?|bankruptcy)\b/i;

export function refineCategory(baseCategory, url = '', title = '') {
  if (baseCategory === 'Opinion' || OPINION_PATH_RE.test(url)) return 'Opinion';
  if (ELECTION_RE.test(title) || ELECTION_URL_RE.test(url)) return 'Elections';
  if (baseCategory === 'Economy' && BUSINESS_RE.test(title)) return 'Business';
  if (/\/(business\/(companies|markets)|markets)\//i.test(url)) return 'Business';
  return baseCategory;
}

/**
 * Run the full pipeline: for each source, discover links via RSS,
 * skip URLs already in MongoDB, scrape new articles, save them.
 * Never scrapes on UI load — only invoked via the internal API route
 * (and the hourly cron in Phase 5).
 */
export async function runScraper() {
  const report = { scraped: 0, skipped: 0, failed: 0, bySource: {} };

  for (const source of sources) {
    const stats = { scraped: 0, skipped: 0, failed: 0 };
    report.bySource[source.name] = stats;

    let items;
    try {
      items = parseFeed(await fetchText(source.feed));
    } catch (err) {
      console.error(`  ✗ [${source.name}] feed failed: ${err.message}`);
      stats.failed += 1;
      report.failed += 1;
      continue;
    }

    for (const item of items.slice(0, source.maxItems || MAX_ARTICLES_PER_SOURCE)) {
      // Skip pure sports / celebrity-gossip content — no civic relevance
      if (isExcludedTopic(item.url, item.title)) {
        stats.skipped += 1;
        report.skipped += 1;
        continue;
      }

      // Skip already-saved URLs
      if (await Article.exists({ url: item.url })) {
        stats.skipped += 1;
        report.skipped += 1;
        continue;
      }

      try {
        const html = await fetchText(item.url);
        const content =
          extractContent(html, source.contentSelectors) || extractFromFeedHtml(item.feedHtml);
        if (!content) {
          stats.failed += 1;
          report.failed += 1;
          continue;
        }

        await Article.create({
          title: item.title,
          url: item.url,
          source: source.name,
          author: extractAuthor(html),
          category: refineCategory(source.category, item.url, item.title),
          publishedAt: item.publishedAt,
          imageUrl: item.imageUrl || extractImage(html),
          language: detectLanguage(content),
          wordCount: content.split(/\s+/).filter(Boolean).length,
          content,
        });
        stats.scraped += 1;
        report.scraped += 1;
        console.log(`  ✓ [${source.name}] ${item.title.slice(0, 70)}`);
      } catch (err) {
        // Duplicate key = raced with another run; count as skip
        if (err.code === 11000) {
          stats.skipped += 1;
          report.skipped += 1;
        } else {
          console.error(`  ✗ [${source.name}] ${item.url}: ${err.message}`);
          stats.failed += 1;
          report.failed += 1;
        }
      }
    }
  }

  return report;
}
