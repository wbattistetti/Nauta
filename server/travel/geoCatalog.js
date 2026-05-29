/**
 * Italian stop catalog for deterministic geographic post-processing.
 */

/**
 * @typedef {'Nord-Ovest'|'Nord-Est'|'Centro'|'Sud'|'Isole'} ItalySubMacro
 */

/** @type {Record<string, { lat: number, lng: number, region: string, macro: string, subMacro: ItalySubMacro, crowdBase: number, themes: string[] }>} */
export const ITALY_CITIES = {
  torino: {
    lat: 45.07,
    lng: 7.69,
    region: 'Piemonte',
    macro: 'Nord',
    subMacro: 'Nord-Ovest',
    crowdBase: 0.55,
    themes: ['museums', 'local_food'],
  },
  milano: {
    lat: 45.46,
    lng: 9.19,
    region: 'Lombardia',
    macro: 'Nord',
    subMacro: 'Nord-Ovest',
    crowdBase: 0.7,
    themes: ['museums', 'shopping'],
  },
  venezia: {
    lat: 45.44,
    lng: 12.32,
    region: 'Veneto',
    macro: 'Nord',
    subMacro: 'Nord-Est',
    crowdBase: 0.95,
    themes: ['museums', 'historic_sites'],
  },
  verona: {
    lat: 45.44,
    lng: 10.99,
    region: 'Veneto',
    macro: 'Nord',
    subMacro: 'Nord-Est',
    crowdBase: 0.65,
    themes: ['museums', 'historic_sites'],
  },
  bologna: {
    lat: 44.49,
    lng: 11.34,
    region: 'Emilia-Romagna',
    macro: 'Nord',
    subMacro: 'Nord-Est',
    crowdBase: 0.6,
    themes: ['local_food', 'museums'],
  },
  genova: {
    lat: 44.41,
    lng: 8.93,
    region: 'Liguria',
    macro: 'Nord',
    subMacro: 'Nord-Ovest',
    crowdBase: 0.5,
    themes: ['local_food', 'nature'],
  },
  firenze: {
    lat: 43.77,
    lng: 11.25,
    region: 'Toscana',
    macro: 'Centro',
    subMacro: 'Centro',
    crowdBase: 0.85,
    themes: ['museums', 'historic_sites'],
  },
  pisa: {
    lat: 43.72,
    lng: 10.4,
    region: 'Toscana',
    macro: 'Centro',
    subMacro: 'Centro',
    crowdBase: 0.7,
    themes: ['museums', 'historic_sites'],
  },
  siena: {
    lat: 43.32,
    lng: 11.33,
    region: 'Toscana',
    macro: 'Centro',
    subMacro: 'Centro',
    crowdBase: 0.65,
    themes: ['museums', 'historic_sites'],
  },
  roma: {
    lat: 41.9,
    lng: 12.5,
    region: 'Lazio',
    macro: 'Centro',
    subMacro: 'Centro',
    crowdBase: 0.8,
    themes: ['museums', 'historic_sites'],
  },
  napoli: {
    lat: 40.85,
    lng: 14.27,
    region: 'Campania',
    macro: 'Sud',
    subMacro: 'Sud',
    crowdBase: 0.65,
    themes: ['local_food', 'museums'],
  },
  palermo: {
    lat: 38.12,
    lng: 13.36,
    region: 'Sicilia',
    macro: 'Isole',
    subMacro: 'Isole',
    crowdBase: 0.6,
    themes: ['museums', 'local_food'],
  },
  catania: {
    lat: 37.5,
    lng: 15.09,
    region: 'Sicilia',
    macro: 'Isole',
    subMacro: 'Isole',
    crowdBase: 0.55,
    themes: ['museums', 'nature'],
  },
  cagliari: {
    lat: 39.22,
    lng: 9.12,
    region: 'Sardegna',
    macro: 'Isole',
    subMacro: 'Isole',
    crowdBase: 0.45,
    themes: ['beach', 'nature'],
  },
  bari: {
    lat: 41.12,
    lng: 16.87,
    region: 'Puglia',
    macro: 'Sud',
    subMacro: 'Sud',
    crowdBase: 0.5,
    themes: ['local_food', 'museums'],
  },
  lecce: {
    lat: 40.35,
    lng: 18.17,
    region: 'Puglia',
    macro: 'Sud',
    subMacro: 'Sud',
    crowdBase: 0.45,
    themes: ['museums', 'historic_sites'],
  },
  matera: {
    lat: 40.67,
    lng: 16.6,
    region: 'Basilicata',
    macro: 'Sud',
    subMacro: 'Sud',
    crowdBase: 0.55,
    themes: ['historic_sites', 'museums'],
  },
  amalfi: {
    lat: 40.63,
    lng: 14.6,
    region: 'Campania',
    macro: 'Sud',
    subMacro: 'Sud',
    crowdBase: 0.88,
    themes: ['nature', 'relax'],
  },
  costiera_amalfitana: {
    lat: 40.65,
    lng: 14.6,
    region: 'Campania',
    macro: 'Sud',
    subMacro: 'Sud',
    crowdBase: 0.9,
    themes: ['nature', 'relax'],
  },
  cinque_terre: {
    lat: 44.12,
    lng: 9.72,
    region: 'Liguria',
    macro: 'Nord',
    subMacro: 'Nord-Ovest',
    crowdBase: 0.92,
    themes: ['nature', 'nature_photo'],
  },
};

export const CULTURAL_CAPITALS = ['roma', 'firenze', 'venezia'];

const MACRO_ORDER = { Nord: 0, Centro: 1, Sud: 2, Isole: 3 };

/** Monodirectional macro-area order (north-west → islands). */
export const SUB_MACRO_ORDER = {
  'Nord-Ovest': 0,
  'Nord-Est': 1,
  Centro: 2,
  Sud: 3,
  Isole: 4,
};

export function subMacroSortKey(subMacro) {
  return SUB_MACRO_ORDER[subMacro] ?? 9;
}

/** @param {string} name */
export function normalizeCityKey(name) {
  return String(name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** @param {string} name */
export function lookupItalyCity(name) {
  const key = normalizeCityKey(name);
  if (ITALY_CITIES[key]) return { key, ...ITALY_CITIES[key] };
  for (const [k, v] of Object.entries(ITALY_CITIES)) {
    if (key.includes(k) || k.includes(key)) return { key: k, ...v };
  }
  return null;
}

/** @param {string} dest */
export function isItalyDestination(dest) {
  const d = String(dest ?? '').toLowerCase();
  return /italia|italy|it\b/.test(d) || lookupItalyCity(d) !== null;
}

/** Haversine km between two points. */
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function macroSortKey(macro) {
  return MACRO_ORDER[macro] ?? 9;
}
