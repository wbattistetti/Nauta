/**
 * Deterministic post-processing after AI Planner (rules A, B, C).
 */
import { randomUUID } from 'crypto';
import {
  CULTURAL_CAPITALS,
  distanceKm,
  isItalyDestination,
  lookupItalyCity,
  macroSortKey,
  ITALY_CITIES,
} from './geoCatalog.js';
import { normalizeStopDayTotals } from './orchestrator.js';
import { hasCulturalInterest } from './themeTaxonomy.js';
import { optimizeItinerary } from './itineraryEngine/optimize.js';

const MAX_LEG_KM = 150;
const CULTURAL_CAPITAL_NAMES = {
  roma: 'Roma',
  firenze: 'Firenze',
  venezia: 'Venezia',
};

/**
 * @param {import('./types.js').TravelStop[]} stops
 * @param {import('./types.js').UserProfile} profile
 */
export function postProcessStops(stops, profile) {
  if (!stops?.length) return stops;

  const totalDays = profile.durationDays ?? stops.reduce((a, s) => a + (s.days || 1), 0);
  let processed = stops.map((s) => enrichStopGeo(s));

  if (isItalyDestination(profile.destination)) {
    processed = applyDensityRules(processed, totalDays);
    processed = ensureCulturalCapital(processed, profile, totalDays);
    processed = normalizeStopDayTotals(processed, totalDays);
    const optimized = optimizeItinerary(processed, profile);
    return optimized.stops;
  }

  return normalizeStopDayTotals(processed, totalDays);
}

/**
 * Post-process + optimizer metadata (motivation, score, alternatives).
 * @param {import('./types.js').TravelStop[]} stops
 * @param {import('./types.js').UserProfile} profile
 */
export function postProcessStopsWithMeta(stops, profile) {
  if (!stops?.length) {
    return {
      stops: [],
      motivation: '',
      score: 0,
      alternatives: undefined,
    };
  }

  const totalDays = profile.durationDays ?? stops.reduce((a, s) => a + (s.days || 1), 0);
  let processed = stops.map((s) => enrichStopGeo(s));

  if (isItalyDestination(profile.destination)) {
    processed = applyDensityRules(processed, totalDays);
    processed = ensureCulturalCapital(processed, profile, totalDays);
    processed = normalizeStopDayTotals(processed, totalDays);
    return optimizeItinerary(processed, profile);
  }

  return {
    stops: normalizeStopDayTotals(processed, totalDays),
    motivation: 'Itinerario organizzato in base alle tue preferenze.',
    score: 0,
    alternatives: undefined,
    scoring: {},
  };
}

/** @param {import('./types.js').TravelStop} stop */
function enrichStopGeo(stop) {
  const city = lookupItalyCity(stop.name);
  if (!city) return stop;
  return {
    ...stop,
    region: stop.region ?? city.region,
    themes: stop.themes?.length ? stop.themes : city.themes,
    primaryTheme: stop.primaryTheme ?? city.themes[0],
    _geo: { lat: city.lat, lng: city.lng, macro: city.macro },
  };
}

/** Rule C — min/max stops from duration. */
function applyDensityRules(stops, totalDays) {
  const minStops = Math.max(1, Math.floor(totalDays / 3));
  const maxStops = Math.max(minStops, Math.ceil(totalDays / 2));

  if (stops.length > maxStops) {
    return mergeSmallestStops(stops, maxStops);
  }
  if (stops.length < minStops) {
    return splitLargestStops(stops, minStops, totalDays);
  }
  return stops;
}

function mergeSmallestStops(stops, target) {
  const list = [...stops];
  while (list.length > target) {
    let minIdx = 0;
    for (let i = 1; i < list.length; i++) {
      if ((list[i].days || 1) < (list[minIdx].days || 1)) minIdx = i;
    }
    const removeIdx = minIdx === 0 ? 1 : minIdx - 1;
    list[removeIdx] = {
      ...list[removeIdx],
      days: (list[removeIdx].days || 1) + (list[minIdx].days || 1),
      notes: [list[removeIdx].notes, list[minIdx].notes].filter(Boolean).join(' · '),
    };
    list.splice(minIdx, 1);
  }
  return list;
}

function splitLargestStops(stops, target, totalDays) {
  const list = [...stops];
  while (list.length < target && list.some((s) => (s.days || 1) >= 2)) {
    const idx = list.reduce((best, s, i) => ((s.days || 1) > (list[best].days || 1) ? i : best), 0);
    const s = list[idx];
    const half = Math.floor((s.days || 1) / 2);
    if (half < 1) break;
    list[idx] = { ...s, days: (s.days || 1) - half };
    list.splice(idx + 1, 0, {
      ...s,
      id: randomUUID(),
      name: `${s.name} (zona vicina)`,
      days: half,
      notes: 'Tappa aggiunta per densità minima del percorso',
    });
  }
  return normalizeStopDayTotals(list, totalDays);
}

/** Rule B — cultural capital if >10 days and likes culture. */
function ensureCulturalCapital(stops, profile, totalDays) {
  if (totalDays <= 10) return stops;
  const likes = profile.likes ?? [];
  if (!hasCulturalInterest(likes)) return stops;

  const hasCapital = stops.some((s) => {
    const key = lookupItalyCity(s.name)?.key;
    return key && CULTURAL_CAPITALS.includes(key);
  });
  if (hasCapital) return stops;

  const missing = CULTURAL_CAPITALS.find(
    (k) => !stops.some((s) => lookupItalyCity(s.name)?.key === k)
  );
  if (!missing) return stops;

  const meta = ITALY_CITIES[missing];
  const days = Math.max(2, Math.min(4, Math.floor(totalDays / 5)));
  return [
    {
      id: randomUUID(),
      name: CULTURAL_CAPITAL_NAMES[missing] ?? missing,
      region: meta.region,
      days,
      themes: meta.themes,
      primaryTheme: 'museums',
      notes: 'Capitale culturale consigliata per il tuo profilo',
      _geo: { lat: meta.lat, lng: meta.lng, macro: meta.macro },
    },
    ...stops,
  ];
}

/** Rule A — sort by macro-region then latitude (north → south). */
function sortByGeography(stops) {
  return [...stops].sort((a, b) => {
    const ga = a._geo ?? lookupItalyCity(a.name);
    const gb = b._geo ?? lookupItalyCity(b.name);
    if (ga && gb) {
      const macroDiff = macroSortKey(ga.macro) - macroSortKey(gb.macro);
      if (macroDiff !== 0) return macroDiff;
      return gb.lat - ga.lat;
    }
    if (ga) return -1;
    if (gb) return 1;
    return 0;
  });
}

/** Rule A — flag / reorder legs with zig-zag > 150 km (move outlier after neighbor). */
function reduceZigZag(stops) {
  const list = stops.map((s) => {
    const g = s._geo ?? lookupItalyCity(s.name);
    return { ...s, _geo: g ? { lat: g.lat, lng: g.lng, macro: g.macro } : s._geo };
  });

  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (let i = 1; i < list.length - 1; i++) {
      const prev = list[i - 1]._geo;
      const curr = list[i]._geo;
      const next = list[i + 1]._geo;
      if (!prev || !curr || !next) continue;

      const legIn = distanceKm(prev, curr);
      const legOut = distanceKm(curr, next);
      const skip = distanceKm(prev, next);

      if (legIn > MAX_LEG_KM && legOut > MAX_LEG_KM && skip < Math.min(legIn, legOut)) {
        const [outlier] = list.splice(i, 1);
        outlier.notes = [outlier.notes, `Spostata: evitato zig-zag > ${MAX_LEG_KM} km`]
          .filter(Boolean)
          .join(' · ');
        list.splice(i + 1, 0, outlier);
        moved = true;
        break;
      }
    }
    if (!moved) break;
  }

  return list.map(({ _geo, ...s }) => s);
}
