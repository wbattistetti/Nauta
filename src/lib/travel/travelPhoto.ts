/**
 * Shared travel photo type for hero carousels.
 */
export type TravelPhoto = {
  id: string;
  alt: string;
  src: string;
  photographer?: string;
  photographerUrl?: string;
};

/** Stable cache key for a stop (must match server photoQuery.stopCacheKey). */
export function stopPhotoKey(stopName: string, region?: string | null): string {
  return normalizePlaceKey(`${stopName}|${region ?? ''}`);
}

export function normalizePlaceKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
