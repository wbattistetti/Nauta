/**
 * Search query builders for worldwide destination and stop photo lookup.
 */
import { resolvePlaceForSearch } from './placeAliases.js';
import { iconicSearchQueries } from './iconicDestinationPhotos.js';

import { normalizePlaceKey } from '@nauta/shared/normalizePlaceKey';

/** Normalize a place name into a stable cache key. */
export { normalizePlaceKey };

/** First iconic query for a destination (compat). */
export function destinationSearchQuery(place) {
  return iconicSearchQueries(place)[0] ?? 'famous travel landmark scenic';
}

export { iconicSearchQueries as destinationSearchQueries };

/**
 * Alt/description patterns that are not destination hero photos (atlases, maps, etc.).
 * @param {string} text
 */
export function isRejectedTravelPhotoText(text) {
  const t = String(text ?? '').trim();
  if (!t) return false;
  return REJECTED_PHOTO_ALT.test(t);
}

const REJECTED_PHOTO_ALT =
  /\b(atlas|atlante|atlante geografico|geography book|map book|old map|vintage map|cartography|textbook|encyclopedia|dictionary|globe collection|mappa del mondo|world map|libro di geografia)\b/i;

/**
 * Unsplash query for a specific stop anywhere in the world.
 * @param {string} stopName
 * @param {string} [region]
 * @param {string} [destination]
 */
export function stopSearchQuery(stopName, region, destination) {
  const name = String(stopName ?? '').trim();
  if (!name) return 'travel destination';

  const searchName = resolvePlaceForSearch(name);
  const parts = [searchName];
  const regionTrim = String(region ?? '').trim();
  const destTrim = String(destination ?? '').trim();

  if (regionTrim && regionTrim.toLowerCase() !== name.toLowerCase()) {
    parts.push(resolvePlaceForSearch(regionTrim));
  } else if (destTrim && destTrim.toLowerCase() !== name.toLowerCase()) {
    parts.push(resolvePlaceForSearch(destTrim));
  }

  parts.push('landmark iconic tourism');
  return parts.join(' ');
}

/** Cache key for a stop's photo set. */
export function stopCacheKey(stopName, region) {
  return normalizePlaceKey(`${stopName}|${region ?? ''}`);
}
