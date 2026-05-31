/**
 * Italian / common travel names → English search terms for photo APIs.
 */

/** @type {Record<string, string>} */
const SEARCH_ALIASES = {
  birmania: 'Myanmar',
  birma: 'Myanmar',
  burma: 'Myanmar',
  thailandia: 'Thailand',
  giappone: 'Japan',
  cina: 'China',
  corea: 'Korea',
  indonesia: 'Indonesia',
  filippine: 'Philippines',
  vietnam: 'Vietnam',
  cambogia: 'Cambodia',
  laos: 'Laos',
  nepal: 'Nepal',
  india: 'India',
  sri_lanka: 'Sri Lanka',
  malesia: 'Malaysia',
  singapore: 'Singapore',
  australia: 'Australia',
  nuova_zelanda: 'New Zealand',
  alaska: 'Alaska',
  canada: 'Canada',
  messico: 'Mexico',
  brasil: 'Brazil',
  argentina: 'Argentina',
  peru: 'Peru',
  cile: 'Chile',
  marocco: 'Morocco',
  egitto: 'Egypt',
  kenya: 'Kenya',
  tanzania: 'Tanzania',
  sudafrica: 'South Africa',
  islanda: 'Iceland',
  norvegia: 'Norway',
  svezia: 'Sweden',
  finlandia: 'Finland',
  grecia: 'Greece',
  turchia: 'Turkey',
  croazia: 'Croatia',
  spagna: 'Spain',
  portogallo: 'Portugal',
  francia: 'France',
  germania: 'Germany',
  austria: 'Austria',
  svizzera: 'Switzerland',
  belgio: 'Belgium',
  olanda: 'Netherlands',
  irlanda: 'Ireland',
  scozia: 'Scotland',
  inghilterra: 'England',
  galles: 'Wales',
  usa: 'United States',
  stati_uniti: 'United States',
  america: 'United States',
};

function normalizePlaceKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Best-effort place name for image search (keeps unknown names as-is).
 * @param {string} place
 */
export function resolvePlaceForSearch(place) {
  const trimmed = String(place ?? '').trim();
  if (!trimmed) return trimmed;
  const alias = SEARCH_ALIASES[normalizePlaceKey(trimmed)];
  return alias ?? trimmed;
}
