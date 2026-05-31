/**
 * Personalized destination acknowledgment by tourist appeal tier.
 * In-memory cache with rotating variants — no AI needed for repeat destinations.
 */

const MAJOR_COUNTRIES = new Set([
  'cina',
  'china',
  'giappone',
  'japan',
  'francia',
  'france',
  'spagna',
  'spain',
  'germania',
  'germany',
  'egitto',
  'egypt',
  'thailandia',
  'thailand',
  'india',
  'australia',
  'brasile',
  'brazil',
  'messico',
  'mexico',
  'canada',
  'marocco',
  'morocco',
  'turchia',
  'turkey',
  'grecia',
  'greece',
  'portogallo',
  'portugal',
  'islanda',
  'iceland',
  'norvegia',
  'norway',
  'svezia',
  'sweden',
  'stati uniti',
  'usa',
  'peru',
  'perù',
  'nepal',
  'vietnam',
  'indonesia',
  'corea',
  'korea',
  'argentina',
  'cile',
  'chile',
  'colombia',
  'kenya',
  'tanzania',
  'sudafrica',
  'south africa',
]);

const MAJOR_CITIES = new Set([
  'parigi',
  'paris',
  'londra',
  'london',
  'new york',
  'tokyo',
  'tokio',
  'roma',
  'rome',
  'barcellona',
  'barcelona',
  'amsterdam',
  'dubai',
  'singapore',
  'singapore',
  'bangkok',
  'istanbul',
  'praga',
  'prague',
  'vienna',
  'wien',
  'lisbona',
  'lisbon',
  'marrakech',
  'venezia',
  'venice',
  'firenze',
  'florence',
  'milano',
  'milan',
  'napoli',
  'naples',
  'sydney',
  'melbourne',
  'los angeles',
  'san francisco',
  'hong kong',
  'pechino',
  'beijing',
  'shanghai',
  'mumbai',
  'delhi',
  'copenhagen',
  'copenhagen',
  'oslo',
  'stockholm',
  'stoccolma',
]);

const MAJOR_REGIONS = new Set([
  'sicilia',
  'sardegna',
  'toscana',
  'campania',
  'puglia',
  'lombardia',
  'veneto',
  'provenza',
  'bali',
  'toscana',
  'amalfi',
  'costa amalfitana',
]);

const LANDMARK_PATTERN =
  /machu picchu|colosseo|torre eiffel|grande muraglia|pyramids|angkor|petra|santorini|himalaya|everest/i;

export const DURATION_FOLLOW_UP = 'Quanti giorni vuoi dedicare al viaggio?';

/** @type {Map<string, { variants: string[], index: number }>} */
const ackCache = new Map();

/** @param {string} destination */
export function normalizeDestinationKey(destination) {
  return String(destination ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * @param {string} destination
 * @returns {'major'|'minor'}
 */
export function classifyDestinationAppeal(destination) {
  const raw = String(destination ?? '').trim();
  if (!raw) return 'minor';

  if (LANDMARK_PATTERN.test(raw)) return 'major';

  const key = normalizeDestinationKey(raw);

  if (MAJOR_COUNTRIES.has(key)) return 'major';
  if (MAJOR_CITIES.has(key)) return 'major';

  for (const region of MAJOR_REGIONS) {
    if (key.includes(region) || region.includes(key)) return 'major';
  }

  return 'minor';
}

/** @param {string} destination */
function formatDestinationLabel(destination) {
  const trimmed = destination.trim();
  const key = normalizeDestinationKey(trimmed);

  if (MAJOR_CITIES.has(key)) return trimmed;

  const feminine = new Set([
    'cina',
    'china',
    'francia',
    'france',
    'spagna',
    'spain',
    'italia',
    'italy',
    'grecia',
    'greece',
    'turchia',
    'turkey',
    'thailandia',
    'thailand',
    'india',
    'australia',
    'indonesia',
    'argentina',
    'colombia',
    'alaska',
    'sicilia',
    'sardegna',
    'toscana',
    'campania',
    'norvegia',
    'norway',
    'svezia',
    'sweden',
  ]);

  const elision = new Set(['egitto', 'egypt', 'islanda', 'iceland', 'iran', 'iraq', 'uganda']);

  if (key === 'stati uniti' || key === 'usa') return 'gli Stati Uniti';
  if (elision.has(key)) return `l'${trimmed}`;
  if (feminine.has(key)) return `la ${trimmed}`;
  if (MAJOR_COUNTRIES.has(key)) return `il ${trimmed}`;

  return trimmed;
}

/** Capitalize first letter for sentence-start labels (l'Egitto → L'Egitto). */
function sentenceLabel(label) {
  if (!label) return label;
  if (label.startsWith('l\'')) return `L'${label.slice(2)}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * All deterministic ack variants for a destination (no AI).
 * @param {string} destination
 * @returns {string[]}
 */
export function buildDestinationAckVariants(destination) {
  const trimmed = String(destination ?? '').trim();
  if (!trimmed) return ['Dove vorresti andare?'];

  const label = sentenceLabel(formatDestinationLabel(trimmed));
  const appeal = classifyDestinationAppeal(trimmed);

  if (appeal === 'major') {
    return [
      `${label} — che meta! Cerco subito qualche foto da mostrarti…`,
      `Ottima scelta. Ti preparo qualche immagine, un attimo…`,
      `${label}: ti faccio vedere qualche scatto iconico…`,
    ];
  }

  return [
    `Ok, raccolgo qualche immagine di ${trimmed} per farti un'idea del posto…`,
    `Perfetto — ti faccio vedere qualche foto di ${trimmed}…`,
    `Capito. Un attimo e ti mostro qualche scatto di ${trimmed}…`,
  ];
}

/**
 * Cached ack — rotates variants on each call for the same destination key.
 * @param {string} destination
 */
export function resolveDestinationAckMessage(destination) {
  const trimmed = String(destination ?? '').trim();
  if (!trimmed) return buildDestinationAckVariants('')[0];

  const key = normalizeDestinationKey(trimmed);
  let entry = ackCache.get(key);
  if (!entry) {
    entry = { variants: buildDestinationAckVariants(trimmed), index: 0 };
    ackCache.set(key, entry);
  }

  const message = entry.variants[entry.index % entry.variants.length];
  entry.index = (entry.index + 1) % entry.variants.length;
  return message;
}

/** First variant only — stable for tests and previews. */
export function buildDestinationAckMessage(destination) {
  return buildDestinationAckVariants(destination)[0];
}

/** @param {string} [destination] — clear one key, or all if omitted */
export function clearDestinationAckCache(destination) {
  if (destination === undefined) {
    ackCache.clear();
    return;
  }
  ackCache.delete(normalizeDestinationKey(destination));
}

/**
 * @param {import('./types.js').TravelState} state
 * @param {import('./types.js').TravelState} previousState
 */
export function destinationJustSet(state, previousState) {
  const next = state.profile?.destination?.trim() ?? '';
  const prev = previousState?.profile?.destination?.trim() ?? '';
  return Boolean(next && next !== prev);
}

/**
 * @param {import('./types.js').TravelState} state
 * @param {boolean} justSet
 */
export function followUpAfterDestinationPhotos(state, justSet) {
  if (!justSet) return null;
  if (!state.profile.destination?.trim()) return null;
  if (state.profile.durationDays) return null;
  return DURATION_FOLLOW_UP;
}
