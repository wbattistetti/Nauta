/**
 * Geographic ordering — macro clusters, monotonic latitude, zig-zag penalties.
 */
import {
  distanceKm,
  lookupItalyCity,
  subMacroSortKey,
} from '../geoCatalog.js';

const ZIGZAG_PENALTY_PER_INVERSION = 50;

/**
 * @typedef {Object} GeoStop
 * @property {string} id
 * @property {string} name
 * @property {number} days
 * @property {number} lat
 * @property {number} lng
 * @property {string} subMacro
 * @property {string} [region]
 * @property {string[]} [themes]
 * @property {string} [primaryTheme]
 * @property {string} [notes]
 */

/**
 * Enrich a travel stop with coordinates and sub-macro area.
 * @param {import('../types.js').TravelStop} stop
 * @returns {GeoStop|null}
 */
export function enrichStopGeo(stop) {
  const city = lookupItalyCity(stop.name);
  if (!city) return null;
  return {
    id: stop.id,
    name: stop.name,
    days: stop.days || 1,
    lat: city.lat,
    lng: city.lng,
    subMacro: city.subMacro ?? city.macro,
    region: stop.region ?? city.region,
    themes: stop.themes,
    primaryTheme: stop.primaryTheme,
    notes: stop.notes,
  };
}

/**
 * Group stops by sub-macro area preserving first-seen cluster order.
 * @param {GeoStop[]} geoStops
 */
export function clusterBySubMacro(geoStops) {
  /** @type {Map<string, GeoStop[]>} */
  const clusters = new Map();
  /** @type {string[]} */
  const order = [];

  for (const s of geoStops) {
    if (!clusters.has(s.subMacro)) {
      clusters.set(s.subMacro, []);
      order.push(s.subMacro);
    }
    clusters.get(s.subMacro).push(s);
  }

  return order.map((key) => ({
    subMacro: key,
    stops: clusters.get(key) ?? [],
  }));
}

/**
 * Nearest-neighbor order within a cluster (minimize leg distance).
 * @param {GeoStop[]} stops
 */
export function orderClusterByDistance(stops) {
  if (stops.length <= 2) return [...stops];

  const remaining = [...stops];
  const ordered = [remaining.shift()];
  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceKm(last, remaining[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return ordered;
}

/**
 * Sort clusters north→south (subMacro order), order inside each cluster.
 * @param {GeoStop[]} geoStops
 */
export function sortMonodirectional(geoStops) {
  const clusters = clusterBySubMacro(geoStops);
  clusters.sort((a, b) => subMacroSortKey(a.subMacro) - subMacroSortKey(b.subMacro));
  return clusters.flatMap((c) => orderClusterByDistance(c.stops));
}

/**
 * Count macro/latitude inversions against chosen direction (+1 = north→south).
 * @param {GeoStop[]} ordered
 * @param {1|-1} direction
 */
export function countDirectionInversions(ordered, direction) {
  if (ordered.length < 2) return 0;
  let inversions = 0;

  for (let i = 1; i < ordered.length; i++) {
    const prevMacro = subMacroSortKey(ordered[i - 1].subMacro);
    const currMacro = subMacroSortKey(ordered[i].subMacro);
    if (direction > 0 && currMacro < prevMacro) inversions += 1;
    if (direction < 0 && currMacro > prevMacro) inversions += 1;

    const prevLat = ordered[i - 1].lat;
    const currLat = ordered[i].lat;
    if (direction > 0 && currLat > prevLat + 0.15) inversions += 1;
    if (direction < 0 && currLat < prevLat - 0.15) inversions += 1;
  }

  return inversions;
}

/**
 * Pick monotonic direction from first/last cluster latitude.
 * @param {GeoStop[]} ordered
 * @returns {1|-1}
 */
export function resolveTravelDirection(ordered) {
  if (ordered.length < 2) return 1;
  return ordered[0].lat >= ordered[ordered.length - 1].lat ? 1 : -1;
}

/**
 * @param {GeoStop[]} ordered
 */
export function totalRouteDistanceKm(ordered) {
  let total = 0;
  for (let i = 1; i < ordered.length; i++) {
    total += distanceKm(ordered[i - 1], ordered[i]);
  }
  return total;
}

/**
 * Zig-zag penalty: 50 × number of direction inversions.
 * @param {GeoStop[]} ordered
 */
export function computeZigzagPenalty(ordered) {
  const direction = resolveTravelDirection(ordered);
  const inversions = countDirectionInversions(ordered, direction);
  return {
    penalty: ZIGZAG_PENALTY_PER_INVERSION * inversions,
    inversions,
    direction,
  };
}

/**
 * Deviation km if two adjacent stops were swapped (geographic cost of inversion).
 * @param {GeoStop} a
 * @param {GeoStop} b
 * @param {GeoStop} [neighborBefore]
 * @param {GeoStop} [neighborAfter]
 */
export function swapGeographicDeviationKm(a, b, neighborBefore, neighborAfter) {
  const before =
    (neighborBefore ? distanceKm(neighborBefore, a) : 0) +
    distanceKm(a, b) +
    (neighborAfter ? distanceKm(b, neighborAfter) : 0);
  const after =
    (neighborBefore ? distanceKm(neighborBefore, b) : 0) +
    distanceKm(b, a) +
    (neighborAfter ? distanceKm(a, neighborAfter) : 0);
  return Math.max(0, after - before);
}

/**
 * @param {GeoStop} ordered
 * @param {import('../types.js').TravelStop} raw
 */
export function geoStopToTravelStop(geo, raw) {
  return {
    ...raw,
    id: geo.id,
    name: geo.name,
    days: geo.days,
    region: geo.region ?? raw.region,
    themes: geo.themes ?? raw.themes,
    primaryTheme: geo.primaryTheme ?? raw.primaryTheme,
    notes: geo.notes ?? raw.notes,
  };
}
