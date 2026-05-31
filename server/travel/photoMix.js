/**
 * Build the trip-level hero carousel from destination and stop photo pools.
 */

const PHOTOS_PER_STOP_ROUND = 3;
const MAX_TRIP_HERO = 12;

/**
 * Mix stop-specific photos (round-robin) then fill from the regional pool.
 * @param {object} opts
 * @param {import('./photoService.js').TravelPhoto[]} opts.destinationPool
 * @param {Record<string, import('./photoService.js').TravelPhoto[]>} opts.stopSets
 * @param {string[]} opts.stopOrder
 * @returns {import('./photoService.js').TravelPhoto[]}
 */
export function buildTripHeroPhotos({ destinationPool, stopSets, stopOrder }) {
  const regional = Array.isArray(destinationPool) ? destinationPool : [];
  const order = Array.isArray(stopOrder) ? stopOrder : [];

  if (!order.length) {
    return regional.slice(0, MAX_TRIP_HERO);
  }

  const sets = order.map((key) => stopSets[key] ?? []);
  /** @type {import('./photoService.js').TravelPhoto[]} */
  const picked = [];
  const seen = new Set();

  for (let round = 0; round < PHOTOS_PER_STOP_ROUND; round += 1) {
    let addedThisRound = false;
    for (const set of sets) {
      const photo = set[round];
      if (!photo || seen.has(photo.id)) continue;
      seen.add(photo.id);
      picked.push(photo);
      addedThisRound = true;
      if (picked.length >= MAX_TRIP_HERO) return picked;
    }
    if (!addedThisRound) break;
  }

  for (const photo of regional) {
    if (picked.length >= MAX_TRIP_HERO) break;
    if (seen.has(photo.id)) continue;
    seen.add(photo.id);
    picked.push(photo);
  }

  return picked;
}
