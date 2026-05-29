/**
 * Canonical travel theme IDs — mirrors server/travel/themeTaxonomy.js
 */
export const THEME_IDS = [
  'nature',
  'mountains',
  'beach',
  'wildlife',
  'nature_photo',
  'parks',
  'art_ancient',
  'art_modern',
  'museums',
  'architecture',
  'archaeology',
  'history_eras',
  'historic_sites',
  'traditions',
  'crafts',
  'festivals',
  'local_food',
  'street_food',
  'tastings',
  'food_markets',
  'nightlife',
  'shopping',
  'cafes',
  'design_fashion',
  'relax',
  'wellness',
  'trekking',
  'outdoor_sports',
  'adrenaline',
  'exploration',
  'family',
  'solo',
  'couples',
  'friends',
] as const;

export type TravelThemeId = (typeof THEME_IDS)[number];

/** @deprecated IDs still accepted from older trips / AI output */
export type LegacyTravelThemeId =
  | 'culture'
  | 'history'
  | 'food'
  | 'adventure'
  | 'photography';

export type AnyTravelThemeId = TravelThemeId | LegacyTravelThemeId;
