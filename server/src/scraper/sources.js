/**
 * Source registry — public news sources scraped via their RSS feeds.
 * RSS gives us stable link discovery; full text is then scraped from
 * each article page with Cheerio using the per-source content selector.
 */

/**
 * SINGLE SOURCE OF TRUTH for source-level bias labels.
 * STATIC, manually-curated metadata informed by third-party media bias
 * trackers (Media Bias/Fact Check, AllSides). Never AI-generated —
 * only per-article bias scores come from AI. Everything (API, sidebar,
 * mobile drawer, Spectrum/Sources pages) reads from this one map.
 */
export const LEANS = {
  'BBC News': 'Center',
  NPR: 'Leans Left',
  'The Guardian': 'Leans Left',
  'Fox News': 'Leans Right',
  'Al Jazeera': 'Leans Left',
  'The Hindu': 'Center',
  'Indian Express': 'Center',
  'Hindustan Times': 'Center',
  NDTV: 'Leans Left',
  'The Wire': 'Left',
  'Scroll.in': 'Left',
  'Times of India': 'Center',
  'Republic World': 'Leans Right',
  OpIndia: 'Right',
  Swarajya: 'Right',
  'The Lallantop': 'Left-Center',
};

export const sources = [
  {
    name: 'BBC News',
    feed: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'World',
    // CSS selectors tried in order to find article body text
    contentSelectors: ['article [data-component="text-block"] p', 'article p'],
  },
  {
    name: 'NPR',
    feed: 'https://feeds.npr.org/1001/rss.xml',
    category: 'Politics',
    contentSelectors: ['#storytext p', 'article p'],
  },
  {
    name: 'The Guardian',
    feed: 'https://www.theguardian.com/world/rss',
    category: 'World',
    contentSelectors: ['#maincontent p', 'article p'],
  },
  {
    name: 'Fox News',
    feed: 'https://moxie.foxnews.com/google-publisher/latest.xml',
    category: 'Politics',
    contentSelectors: ['.article-body p', 'article p'],
  },
  {
    name: 'Al Jazeera',
    feed: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'World',
    contentSelectors: ['.wysiwyg p', 'main p'],
  },
  {
    name: 'BBC News',
    feed: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology',
    contentSelectors: ['article [data-component="text-block"] p', 'article p'],
  },
  {
    name: 'The Guardian',
    feed: 'https://www.theguardian.com/uk/technology/rss',
    category: 'Technology',
    contentSelectors: ['#maincontent p', 'article p'],
  },
  {
    name: 'BBC News',
    feed: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Economy',
    contentSelectors: ['article [data-component="text-block"] p', 'article p'],
  },
  {
    name: 'The Guardian',
    feed: 'https://www.theguardian.com/uk/business/rss',
    category: 'Economy',
    contentSelectors: ['#maincontent p', 'article p'],
  },

  // ── Business (corporate/markets — Economy stays macro) ────────
  {
    name: 'Hindustan Times',
    feed: 'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml',
    category: 'Business',
    contentSelectors: ['.storyDetails p', '.detail p', 'article p'],
  },
  {
    name: 'The Hindu',
    feed: 'https://www.thehindu.com/business/feeder/default.rss',
    category: 'Business',
    contentSelectors: ['[itemprop="articleBody"] p', '.articlebodycontent p', 'article p'],
  },

  // ── Opinion / Editorial ───────────────────────────────────────
  {
    name: 'The Guardian',
    feed: 'https://www.theguardian.com/uk/commentisfree/rss',
    category: 'Opinion',
    contentSelectors: ['#maincontent p', 'article p'],
  },
  {
    name: 'Fox News',
    feed: 'https://moxie.foxnews.com/google-publisher/opinion.xml',
    category: 'Opinion',
    contentSelectors: ['.article-body p', 'article p'],
  },
  {
    name: 'The Hindu',
    feed: 'https://www.thehindu.com/opinion/feeder/default.rss',
    category: 'Opinion',
    contentSelectors: ['[itemprop="articleBody"] p', '.articlebodycontent p', 'article p'],
  },

  // ── India ─────────────────────────────────────────────────────
  {
    name: 'The Hindu',
    feed: 'https://www.thehindu.com/news/national/feeder/default.rss',
    category: 'India',
    contentSelectors: ['[itemprop="articleBody"] p', '.articlebodycontent p', 'article p'],
  },
  {
    name: 'Indian Express',
    feed: 'https://indianexpress.com/section/india/feed/',
    category: 'India',
    contentSelectors: ['#pcl-full-content p', '.story_details p', 'article p'],
  },
  {
    name: 'Hindustan Times',
    feed: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    category: 'India',
    contentSelectors: ['.storyDetails p', '.detail p', 'article p'],
  },
  {
    name: 'NDTV',
    feed: 'https://feeds.feedburner.com/ndtvnews-india-news',
    category: 'India',
    contentSelectors: ['.sp-cn p', '#ins_storybody p', 'article p'],
  },
  {
    name: 'The Wire',
    feed: 'https://cms.thewire.in/rss',
    category: 'India',
    contentSelectors: ['article p', 'main p', '.content p'],
  },
  {
    name: 'Scroll.in',
    feed: 'https://feeds.feedburner.com/ScrollinArticles.rss',
    category: 'India',
    contentSelectors: ['article p', '.article-body p', 'main p'],
  },
  {
    name: 'Times of India',
    feed: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
    category: 'India',
    // TOI renders body in an unclassed-para div; whole-div selector works
    // because extractContent takes the text of whatever elements match
    contentSelectors: ['div._s30J', '.js_article_body p', 'article p'],
  },
  {
    name: 'Republic World',
    feed: 'https://www.republicworld.com/rss/latest-news.xml',
    category: 'India',
    contentSelectors: ['.story-content p', 'article p', 'main p'],
  },
  {
    name: 'OpIndia',
    feed: 'https://www.opindia.com/feed/',
    category: 'India',
    contentSelectors: ['.td-post-content p', '.entry-content p', 'article p'],
  },
  {
    name: 'Swarajya',
    // Feed currently serves an empty channel to non-browser clients;
    // parseFeed handles that gracefully (0 items, no failure)
    feed: 'https://swarajyamag.com/feed',
    category: 'India',
    contentSelectors: ['.story-element-text p', 'article p', 'main p'],
  },
  {
    name: 'The Lallantop',
    // Primarily Hindi-language — engine tags these articles language:'hi'
    // and the AI pipeline handles them (English summaries, summary-based
    // embeddings). Feed is bot-gated; harmless empty parse when blocked.
    feed: 'https://www.thelallantop.com/rss.xml',
    category: 'India',
    contentSelectors: ['.story-element-text p', 'article p', 'main p'],
  },
];

/**
 * Deduped source-level metadata for the UI ("Tracked Sources" rail,
 * Spectrum/Sources pages). Lean always comes from the LEANS map above.
 */
export const sourceMeta = [
  ...new Map(
    sources.map((s) => [s.name, { name: s.name, lean: LEANS[s.name] || 'Center' }])
  ).values(),
];
