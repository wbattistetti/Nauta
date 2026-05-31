/**
 * Curated iconic photos per itinerary stop — verified Unsplash URLs.
 */
import { normalizePlaceKey } from '@nauta/shared/normalizePlaceKey';

/**
 * @param {string} id
 * @param {string} alt
 * @param {string} src
 */
function curated(id, alt, src) {
  return { id, alt, src };
}

const U = (photoId, alt) =>
  curated(
    photoId,
    alt,
    `https://images.unsplash.com/${photoId}?w=1200&q=80&auto=format&fit=crop`
  );

/** @type {Record<string, import('./photoService.js').TravelPhoto[]>} */
const BY_KEY = {
  sydney: [
    U('photo-1506973035872-a4ec16b8e8d9', 'Opera House di Sydney'),
    U('photo-1528072164453-f4e8ef0d475a', 'Opera House e porto'),
  ],
  blue_mountains: [
    U('photo-1506905925346-21bda4d32df4', 'Paesaggio montano, Blue Mountains'),
    U('photo-1582034675520-cee402a9087c', 'Sentieri tra le montagne'),
  ],
  canberra: [
    U('photo-1514395462725-fb4566210144', 'Parliament House, Canberra'),
    U('photo-1548013146-72479768bada', 'Canberra e architettura'),
  ],
  melbourne: [
    U('photo-1719458137808-8c8a97db1165', 'Skyline di Melbourne'),
    U('photo-1545044846-351ba102b6d5', 'Yarra River e centro'),
  ],
  great_ocean_road: [
    U('photo-1557978557-57231f2dbc36', 'Scogliere e mare'),
    U('photo-1542384214-72b27a893e2f', 'Great Ocean Road'),
  ],
  adelaide: [
    U('photo-1507692049790-de58290a4334', 'Adelaide e Hills'),
    U('photo-1553141553-bb95c13efc43', 'Centro di Adelaide'),
  ],
  kangaroo_island: [
    U('photo-1504280390367-361c6d9f38f4', 'Natura e fauna selvaggia'),
    U('photo-1470071459604-3b5ec3a7fe05', 'Paesaggio costiero'),
  ],
  cairns: [
    U('photo-1638580591001-8c07e6f54097', 'Barriera corallina'),
    U('photo-1745917784380-6f423e4bea8e', 'Reef e mare tropicale'),
  ],
  cairns_daintree: [
    U('photo-1638580591001-8c07e6f54097', 'Cairns e barriera corallina'),
    U('photo-1470071459604-3b5ec3a7fe05', 'Foresta pluviale Daintree'),
  ],
  roma: [
    U('photo-1552832230-c0197dd311b5', 'Colosseo e centro storico'),
    U('photo-1529260830193-1a1c889dce5f', 'Roma antica'),
  ],
  firenze: [
    U('photo-1543429775-27835a09f066', 'Duomo di Firenze'),
  ],
  venezia: [
    U('photo-1514890547357-a9ee288728e0', 'Canali di Venezia'),
  ],
  palermo: [
    U('photo-1488646953014-85cb44e25828', 'Centro storico di Palermo'),
  ],
  parigi: [
    U('photo-1502602898657-3e91760cbb34', 'Torre Eiffel'),
  ],
  paris: [
    U('photo-1502602898657-3e91760cbb34', 'Eiffel Tower'),
  ],
  tokyo: [
    U('photo-1540959733332-eab4deabeeaf', 'Tokyo di notte'),
  ],
  kyoto: [
    U('photo-1493976040374-85c8e9126439', 'Tempio a Kyoto'),
  ],
};

/**
 * @param {string} stopName
 * @param {string} [region]
 * @param {string} [destination]
 * @returns {import('./photoService.js').TravelPhoto[]}
 */
export function curatedStopPhotos(stopName, region, destination) {
  const name = String(stopName ?? '').trim();
  if (!name) return [];

  const keys = [
    normalizePlaceKey(name),
    normalizePlaceKey(String(region ?? '')),
    normalizePlaceKey(String(destination ?? '')),
  ].filter(Boolean);

  for (const key of keys) {
    if (BY_KEY[key]?.length) return [...BY_KEY[key]];
  }

  for (const [key, photos] of Object.entries(BY_KEY)) {
    if (keys.some((k) => k.includes(key) || key.includes(k))) return [...photos];
  }

  return [];
}
