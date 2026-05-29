/**
 * Universal travel preference taxonomy — stable IDs, locale-adaptive content in UI/planner.
 */

/** @type {readonly string[]} */
export const THEME_IDS = [
  // 1 Paesaggi & Natura
  'nature',
  'mountains',
  'beach',
  'wildlife',
  'nature_photo',
  'parks',
  // 2 Arte & Patrimonio
  'art_ancient',
  'art_modern',
  'museums',
  'architecture',
  'archaeology',
  // 3 Storia & Tradizioni
  'history_eras',
  'historic_sites',
  'traditions',
  'crafts',
  'festivals',
  // 4 Cibo
  'local_food',
  'street_food',
  'tastings',
  'food_markets',
  // 5 Vita & Lifestyle
  'nightlife',
  'shopping',
  'cafes',
  'design_fashion',
  // 6 Ritmo & Benessere (themes; pace = profile.style)
  'relax',
  'wellness',
  // 7 Avventura
  'trekking',
  'outdoor_sports',
  'adrenaline',
  'exploration',
  // 8 Target
  'family',
  'solo',
  'couples',
  'friends',
];

/** Map deprecated / vague IDs to canonical taxonomy. */
export const LEGACY_THEME_MAP = {
  culture: 'museums',
  history: 'historic_sites',
  food: 'local_food',
  adventure: 'exploration',
  photography: 'nature_photo',
};

/** Likes that trigger cultural-capital rule (Italy). */
export const CULTURAL_INTEREST_IDS = new Set([
  'museums',
  'art_ancient',
  'art_modern',
  'architecture',
  'archaeology',
  'historic_sites',
  'history_eras',
  'traditions',
  'crafts',
  'festivals',
  'culture',
  'history',
]);

export function hasCulturalInterest(likes) {
  return (likes ?? []).some((id) => CULTURAL_INTEREST_IDS.has(id));
}
