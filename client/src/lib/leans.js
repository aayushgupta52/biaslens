/**
 * Shared source-lean helpers. Labels themselves come from the server's
 * single source of truth (GET /api/sources → server/src/scraper/sources.js
 * LEANS map) — this module only maps a label to its display treatment.
 */
export const leanDot = {
  Left: 'bg-left',
  'Left-Center': 'bg-left',
  'Leans Left': 'bg-left',
  Center: 'bg-center',
  'Leans Right': 'bg-right',
  Right: 'bg-right',
};

/** Position of a lean label on the 0–100 Left→Right spectrum. */
export const leanPosition = {
  Left: 8,
  'Left-Center': 26,
  'Leans Left': 32,
  Center: 50,
  'Leans Right': 68,
  Right: 92,
};
