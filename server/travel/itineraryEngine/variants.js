/**
 * Generate itinerary candidate variants (order, day splits, crowd micro-shifts).
 */
import { randomUUID } from 'crypto';
import {
  enrichStopGeo,
  sortMonodirectional,
  swapGeographicDeviationKm,
} from './geography.js';
import { computeStopCrowdScore } from './crowd.js';
import { allowCrowdSwap, resolveOptimizationWeights } from './weights.js';
import { normalizeStopDayTotals } from '../orchestrator.js';

const DEFAULT_CANDIDATE_COUNT = 15;
const MAX_CANDIDATES = 20;

/**
 * @param {import('../types.js').TravelStop[]} stops
 */
function cloneStops(stops) {
  return stops.map((s) => ({ ...s, themes: [...(s.themes ?? [])] }));
}

/**
 * @param {import('./geography.js').GeoStop[]} geoOrdered
 * @param {import('../types.js').TravelStop[]} template
 */
function mapGeoOrderToStops(geoOrdered, template) {
  const byId = new Map(template.map((s) => [s.id, s]));
  const byName = new Map(template.map((s) => [s.name.toLowerCase(), s]));

  return geoOrdered.map((g) => {
    const raw = byId.get(g.id) ?? byName.get(g.name.toLowerCase());
    return raw
      ? { ...raw, days: g.days }
      : {
          ...template[0],
          id: randomUUID(),
          name: g.name,
          days: g.days,
          themes: g.themes ?? ['museums'],
          primaryTheme: g.primaryTheme ?? 'museums',
        };
  });
}

/**
 * Vary day allocation ±1 between adjacent stops (keeps total).
 * @param {import('../types.js').TravelStop[]} stops
 * @param {number} totalDays
 */
function* daySplitVariants(stops, totalDays) {
  const list = cloneStops(stops);
  for (let i = 0; i < list.length - 1; i++) {
    if ((list[i].days || 1) >= 2) {
      const v = cloneStops(list);
      v[i].days = (v[i].days || 1) - 1;
      v[i + 1].days = (v[i + 1].days || 1) + 1;
      yield normalizeStopDayTotals(v, totalDays);
    }
    if ((list[i + 1].days || 1) >= 2) {
      const v = cloneStops(list);
      v[i].days = (v[i].days || 1) + 1;
      v[i + 1].days = (v[i + 1].days || 1) - 1;
      yield normalizeStopDayTotals(v, totalDays);
    }
  }
}

/**
 * Swap adjacent stops when crowd improves and geographic deviation is small.
 * @param {import('../types.js').TravelStop[]} stops
 * @param {import('../types.js').UserProfile} profile
 */
function* crowdMicroShiftVariants(stops, profile) {
  const weights = resolveOptimizationWeights(profile);
  let dayCursor = 0;
  const list = cloneStops(stops);

  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    const geoA = enrichStopGeo(a);
    const geoB = enrichStopGeo(b);
    if (!geoA || !geoB) {
      dayCursor += a.days || 1;
      continue;
    }

    const crowdA = computeStopCrowdScore(a.name, profile, dayCursor, a.days || 1);
    const crowdB = computeStopCrowdScore(
      b.name,
      profile,
      dayCursor + (a.days || 1),
      b.days || 1
    );
    const deviation = swapGeographicDeviationKm(
      geoA,
      geoB,
      i > 0 ? enrichStopGeo(list[i - 1]) : undefined,
      i < list.length - 2 ? enrichStopGeo(list[i + 2]) : undefined
    );

    if (crowdB < crowdA && allowCrowdSwap(deviation, weights.crowdDominates)) {
      const v = cloneStops(list);
      [v[i], v[i + 1]] = [v[i + 1], v[i]];
      yield v;
    }
    dayCursor += a.days || 1;
  }
}

/**
 * Build 10–20 candidate itineraries from a base stop list.
 * @param {import('../types.js').TravelStop[]} baseStops
 * @param {import('../types.js').UserProfile} profile
 * @param {number} [targetCount]
 */
export function generateItineraryCandidates(baseStops, profile, targetCount = DEFAULT_CANDIDATE_COUNT) {
  const totalDays =
    profile.durationDays ?? baseStops.reduce((a, s) => a + (s.days || 1), 0);
  const seen = new Set();
  /** @type {import('../types.js').TravelStop[][]} */
  const candidates = [];

  function add(stops) {
    const key = stops.map((s) => `${s.name}:${s.days}`).join('|');
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(normalizeStopDayTotals(cloneStops(stops), totalDays));
  }

  const geo = baseStops.map(enrichStopGeo).filter(Boolean);
  if (geo.length) {
    add(mapGeoOrderToStops(sortMonodirectional(geo), baseStops));
  }
  add(baseStops);

  for (let i = 0; i < baseStops.length - 1; i++) {
    const v = cloneStops(baseStops);
    [v[i], v[i + 1]] = [v[i + 1], v[i]];
    add(v);
  }

  for (const v of daySplitVariants(baseStops, totalDays)) {
    add(v);
    if (candidates.length >= MAX_CANDIDATES) break;
  }
  for (const v of crowdMicroShiftVariants(baseStops, profile)) {
    add(v);
    if (candidates.length >= MAX_CANDIDATES) break;
  }

  let rotate = 0;
  while (candidates.length < Math.min(targetCount, MAX_CANDIDATES)) {
    const base = candidates[rotate % candidates.length] ?? baseStops;
    if (base.length < 2) break;
    const i = candidates.length % (base.length - 1);
    const v = cloneStops(base);
    [v[i], v[i + 1]] = [v[i + 1], v[i]];
    add(v);
    rotate += 1;
    if (rotate > MAX_CANDIDATES * 2) break;
  }

  return candidates.slice(0, MAX_CANDIDATES);
}
