/**
 * Closed theme vocabulary + synonym normalization (universal taxonomy).
 */
import { CULTURAL_INTEREST_IDS, LEGACY_THEME_MAP, THEME_IDS } from './themeTaxonomy.js';

export { CULTURAL_INTEREST_IDS, hasCulturalInterest, LEGACY_THEME_MAP, THEME_IDS } from './themeTaxonomy.js';

const SYNONYMS = {
  natura: 'nature',
  paesaggio: 'nature',
  montagna: 'mountains',
  montagne: 'mountains',
  mare: 'beach',
  spiaggia: 'beach',
  fauna: 'wildlife',
  animali: 'wildlife',
  foto: 'nature_photo',
  fotografia: 'nature_photo',
  parchi: 'parks',
  riserve: 'parks',
  cultura: 'museums',
  arte: 'art_ancient',
  musei: 'museums',
  gallerie: 'museums',
  architettura: 'architecture',
  archeologia: 'archaeology',
  siti: 'historic_sites',
  storia: 'historic_sites',
  storico: 'historic_sites',
  tradizioni: 'traditions',
  folklore: 'traditions',
  artigianato: 'crafts',
  festival: 'festivals',
  cibo: 'local_food',
  gastronomia: 'local_food',
  cucina: 'local_food',
  streetfood: 'street_food',
  degustazioni: 'tastings',
  mercati: 'food_markets',
  notte: 'nightlife',
  locali: 'nightlife',
  shopping: 'shopping',
  acquisti: 'shopping',
  caffe: 'cafes',
  bar: 'cafes',
  moda: 'design_fashion',
  design: 'design_fashion',
  relax: 'relax',
  riposo: 'relax',
  benessere: 'wellness',
  spa: 'wellness',
  terme: 'wellness',
  trekking: 'trekking',
  hiking: 'trekking',
  escursioni: 'trekking',
  sport: 'outdoor_sports',
  outdoor: 'outdoor_sports',
  adrenalina: 'adrenaline',
  esplorazione: 'exploration',
  avventura: 'exploration',
  famiglia: 'family',
  bambini: 'family',
  solo: 'solo',
  coppia: 'couples',
  coppie: 'couples',
  amici: 'friends',
  gruppo: 'friends',
};

/** @param {string} raw */
export function normalizeTheme(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  if (LEGACY_THEME_MAP[key]) return LEGACY_THEME_MAP[key];
  if (THEME_IDS.includes(key)) return key;
  if (SYNONYMS[key]) return SYNONYMS[key];
  for (const [it, en] of Object.entries(SYNONYMS)) {
    if (key.includes(it)) return en;
  }
  return null;
}

/** @param {unknown} list */
export function normalizeThemeList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const item of list) {
    const id = normalizeTheme(String(item));
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

/** Infer likes/dislikes from free-text preferenze. */
export function themesFromPreferenze(text) {
  if (!text || typeof text !== 'string') return { likes: [], dislikes: [] };
  const lower = text.toLowerCase();
  const likes = [];
  const dislikes = [];
  const dislikeMarkers = /(non|niente|evit|odio|detesto|mai)\s+([\wàèéìòù]+)/gi;
  let m;
  while ((m = dislikeMarkers.exec(lower)) !== null) {
    const t = normalizeTheme(m[2]);
    if (t) dislikes.push(t);
  }
  for (const id of THEME_IDS) {
    if (lower.includes(id.replace(/_/g, ' ')) || lower.includes(id)) {
      if (!dislikes.includes(id)) likes.push(id);
    }
  }
  for (const [it, en] of Object.entries(SYNONYMS)) {
    if (lower.includes(it.replace('_', ' ')) && !dislikes.includes(en) && !likes.includes(en)) {
      likes.push(en);
    }
  }
  return { likes: [...new Set(likes)], dislikes: [...new Set(dislikes)] };
}
