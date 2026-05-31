/**
 * Search query builders for worldwide destination and stop photo lookup.
 */
import { resolvePlaceForSearch } from './placeAliases.js';

/** Normalize a place name into a stable cache key. */
export function normalizePlaceKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Unsplash query for a region or country (generic mood). */
export function destinationSearchQuery(place) {
  const trimmed = String(place ?? '').trim();
  if (!trimmed) return 'travel landscape';
  const searchPlace = resolvePlaceForSearch(trimmed);
  return `${searchPlace} travel landscape`;
}

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

  parts.push('travel');
  return parts.join(' ');
}

/** Cache key for a stop's photo set. */
export function stopCacheKey(stopName, region) {
  return normalizePlaceKey(`${stopName}|${region ?? ''}`);
}
