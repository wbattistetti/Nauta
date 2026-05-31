/**
 * In-session memory cache for resolved trip hero photo pools.
 */
import type { TravelPhoto } from '../travelPhoto';

const CACHE_VERSION = 'v5';
const pools = new Map<string, TravelPhoto[]>();

/** Stable key for destination + itinerary stops. */
export function heroPhotoCacheKey(destination: string, stopsSignature: string): string {
  const dest = destination.trim().toLowerCase();
  return `${CACHE_VERSION}|${dest}|${stopsSignature}`;
}

export function getCachedHeroPhotoPool(key: string): TravelPhoto[] | null {
  const hit = pools.get(key);
  return hit?.length ? hit.map((p) => ({ ...p })) : null;
}

export function setCachedHeroPhotoPool(key: string, photos: TravelPhoto[]): void {
  if (!photos.length) return;
  pools.set(key, photos.map((p) => ({ ...p })));
}

export function clearHeroPhotoPoolCache(): void {
  pools.clear();
}
