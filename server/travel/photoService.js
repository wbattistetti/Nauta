/**
 * Travel hero photo resolver — iconic curated sets + Unsplash/Wikimedia search.
 */
import { cacheGet, cacheSet } from './photoCache.js';
import { buildTripHeroPhotos } from './photoMix.js';
import { curatedDestinationPhotos } from './iconicDestinationPhotos.js';
import { curatedStopPhotos } from './iconicStopPhotos.js';
import {
  destinationSearchQueries,
  normalizePlaceKey,
  stopCacheKey,
  stopSearchQuery,
} from './photoQuery.js';
import { searchUnsplashPhotos } from './unsplashClient.js';
import { searchWikimediaPhotos } from './wikimediaClient.js';

/** @typedef {{ id: string, alt: string, src: string, photographer?: string, photographerUrl?: string }} TravelPhoto */

const CACHE_VERSION = 'v8';

const DESTINATION_COUNT = 10;
const STOP_COUNT = 8;

/**
 * @param {TravelPhoto[]} photos
 * @param {TravelPhoto} photo
 */
function pushUnique(photos, photo) {
  if (!photo?.id || photos.some((p) => p.id === photo.id)) return;
  photos.push(photo);
}

/**
 * @param {string} cacheKey
 * @param {string} placeLabel
 * @param {number} count
 * @param {string[]} searchQueries
 * @param {import('./photoService.js').TravelPhoto[]} [seedCurated]
 * @returns {Promise<{ photos: TravelPhoto[], source: 'live' | 'curated' | 'fallback' }>}
 */
async function fetchPhotoSet(cacheKey, placeLabel, count, searchQueries, seedCurated = []) {
  const fullKey = `${CACHE_VERSION}:${cacheKey}`;
  const cached = cacheGet(fullKey);
  if (cached) return /** @type {{ photos: TravelPhoto[], source: 'live' | 'curated' | 'fallback' }} */ (cached);

  /** @type {TravelPhoto[]} */
  let photos = [];
  let source = /** @type {'live' | 'curated' | 'fallback'} */ ('fallback');

  for (const curated of seedCurated) {
    pushUnique(photos, curated);
    if (photos.length >= count) break;
  }
  if (photos.length) source = 'curated';

  for (const curated of curatedDestinationPhotos(placeLabel)) {
    pushUnique(photos, curated);
    if (photos.length >= count) break;
  }
  if (photos.length) source = 'curated';

  if (process.env.UNSPLASH_ACCESS_KEY?.trim() && photos.length < count) {
    for (const query of searchQueries) {
      if (photos.length >= count) break;
      try {
        const result = await searchUnsplashPhotos(query, count - photos.length);
        for (const photo of result.photos) {
          pushUnique(photos, photo);
          if (photos.length >= count) break;
        }
        if (result.photos.length) source = 'live';
      } catch (err) {
        console.warn('[photos] unsplash', query, err instanceof Error ? err.message : err);
      }
    }
  }

  if (photos.length < count) {
    for (const query of searchQueries) {
      if (photos.length >= count) break;
      try {
        const wiki = await searchWikimediaPhotos(query, count - photos.length);
        for (const photo of wiki.photos) {
          pushUnique(photos, photo);
          if (photos.length >= count) break;
        }
        if (wiki.photos.length) source = 'live';
      } catch (err) {
        console.warn('[photos] wikimedia', query, err instanceof Error ? err.message : err);
      }
    }
  }

  const payload = { photos: photos.slice(0, count), source };
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
    return { photos: [], source: 'fallback' };
  }

  const cacheKey = `dest:${normalizePlaceKey(place)}`;
  const queries = destinationSearchQueries(place);
  return fetchPhotoSet(cacheKey, place, DESTINATION_COUNT, queries);
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
    return { photos: [], source: 'fallback' };
  }

  const cacheKey = `stop:${stopCacheKey(name, region)}`;
  const query = stopSearchQuery(name, region, destination);
  const seed = curatedStopPhotos(name, region, destination);
  return fetchPhotoSet(cacheKey, name, STOP_COUNT, [query, `${query} landmark`], seed);
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
