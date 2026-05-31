/**
 * Travel hero photo resolver — Unsplash search with cache and generic fallback.
 */
import { cacheGet, cacheSet } from './photoCache.js';
import { buildTripHeroPhotos } from './photoMix.js';
import {
  destinationSearchQuery,
  normalizePlaceKey,
  stopCacheKey,
  stopSearchQuery,
} from './photoQuery.js';
import { searchUnsplashPhotos } from './unsplashClient.js';
import { searchWikimediaPhotos } from './wikimediaClient.js';

/** @typedef {{ id: string, alt: string, src: string, photographer?: string, photographerUrl?: string }} TravelPhoto */

const CACHE_VERSION = 'v2';

const DESTINATION_COUNT = 10;
const STOP_COUNT = 8;

/** Generic fallback when API is unavailable or returns no results. */
const GENERIC_FALLBACK = [
  {
    id: 'generic-1',
    alt: 'Paesaggio di viaggio',
    src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'generic-2',
    alt: 'Strada panoramica',
    src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'generic-3',
    alt: 'Mare e cielo',
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop',
  },
  {
    id: 'generic-4',
    alt: 'Montagna e luce',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop',
  },
];

/**
 * @param {string} placeLabel
 * @param {number} count
 * @returns {TravelPhoto[]}
 */
function genericFallback(placeLabel, count) {
  const label = placeLabel.trim() || 'Viaggio';
  return GENERIC_FALLBACK.slice(0, count).map((photo, i) => ({
    ...photo,
    id: `${normalizePlaceKey(label)}-fallback-${i + 1}`,
    alt: `${label} · ${photo.alt}`,
  }));
}

/**
 * @param {string} cacheKey
 * @param {string} query
 * @param {string} placeLabel
 * @param {number} count
 * @returns {Promise<{ photos: TravelPhoto[], source: 'live' | 'fallback' }>}
 */
async function fetchPhotoSet(cacheKey, query, placeLabel, count) {
  const fullKey = `${CACHE_VERSION}:${cacheKey}`;
  const cached = cacheGet(fullKey);
  if (cached) return /** @type {{ photos: TravelPhoto[], source: 'live' | 'fallback' }} */ (cached);

  let photos = [];
  let source = /** @type {'live' | 'fallback'} */ ('fallback');

  if (process.env.UNSPLASH_ACCESS_KEY?.trim()) {
    try {
      const result = await searchUnsplashPhotos(query, count);
      if (result.photos.length) {
        photos = result.photos.slice(0, count);
        source = 'live';
      }
    } catch (err) {
      console.warn('[photos] unsplash', query, err instanceof Error ? err.message : err);
    }
  }

  if (!photos.length) {
    try {
      const wiki = await searchWikimediaPhotos(query, count);
      if (wiki.photos.length) {
        photos = wiki.photos.slice(0, count);
        source = 'live';
      }
    } catch (err) {
      console.warn('[photos] wikimedia', query, err instanceof Error ? err.message : err);
    }
  }

  if (!photos.length) {
    photos = genericFallback(placeLabel, count);
    source = 'fallback';
  }

  const payload = { photos, source };
  cacheSet(fullKey, payload);
  return payload;
}

/**
 * Regional / country hero pool (before or alongside itinerary).
 * @param {string} destination
 */
export async function resolveDestinationPhotos(destination) {
  const place = String(destination ?? '').trim();
  if (!place) {
    return { photos: genericFallback('Viaggio', DESTINATION_COUNT), source: 'fallback' };
  }

  const cacheKey = `dest:${normalizePlaceKey(place)}`;
  const query = destinationSearchQuery(place);
  return fetchPhotoSet(cacheKey, query, place, DESTINATION_COUNT);
}

/**
 * Stop-specific photo pool (any city / region worldwide).
 * @param {string} stopName
 * @param {string} [region]
 * @param {string} [destination]
 */
export async function resolveStopPhotos(stopName, region, destination) {
  const name = String(stopName ?? '').trim();
  if (!name) {
    return { photos: genericFallback('Tappa', STOP_COUNT), source: 'fallback' };
  }

  const cacheKey = `stop:${stopCacheKey(name, region)}`;
  const query = stopSearchQuery(name, region, destination);
  return fetchPhotoSet(cacheKey, query, name, STOP_COUNT);
}

/**
 * Resolve destination pool, all stop pools, and the personalized trip hero mix.
 * @param {string} destination
 * @param {{ name: string, region?: string }[]} stops
 */
export async function resolveTripPhotos(destination, stops) {
  const destResult = await resolveDestinationPhotos(destination);
  const stopList = Array.isArray(stops) ? stops : [];

  /** @type {Record<string, TravelPhoto[]>} */
  const stopSets = {};
  /** @type {string[]} */
  const stopOrder = [];

  const resolvedStops = await Promise.all(
    stopList.map(async (stop) => {
      const name = String(stop?.name ?? '').trim();
      if (!name) return null;
      const key = stopCacheKey(name, stop.region);
      const result = await resolveStopPhotos(name, stop.region, destination);
      return { key, photos: result.photos };
    })
  );

  for (const entry of resolvedStops) {
    if (!entry) continue;
    stopOrder.push(entry.key);
    stopSets[entry.key] = entry.photos;
  }

  const tripHero = buildTripHeroPhotos({
    destinationPool: destResult.photos,
    stopSets,
    stopOrder,
  });

  return {
    destinationPool: destResult.photos,
    tripHero,
    stops: stopSets,
    source: destResult.source,
  };
}
