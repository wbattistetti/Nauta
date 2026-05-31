/**
 * Pure hero photo pool resolution — merge API, static, and generic fallbacks.
 */
import type { TravelPhoto } from '../travelPhoto';
import { sanitizePhoto } from './sanitizePhotoSrc';

function photoKey(photo: TravelPhoto): string {
  return photo.id || photo.src;
}

/** Dedupe by id/src, preserving first occurrence order. */
export function dedupePhotos(photos: TravelPhoto[]): TravelPhoto[] {
  const seen = new Set<string>();
  return photos.filter((photo) => {
    const key = photoKey(photo);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Pick the primary API pool from a resolve response. */
export function pickApiTripPool(
  tripHero: TravelPhoto[],
  destinationPool: TravelPhoto[],
  staticPool: TravelPhoto[]
): TravelPhoto[] {
  if (tripHero.length) return tripHero;
  if (destinationPool.length) return destinationPool;
  return staticPool;
}

type ResolveArgs = {
  apiPool: TravelPhoto[];
  staticPool: TravelPhoto[];
  genericPool: TravelPhoto[];
};

/**
 * Build the carousel pool. Prefers API photos, merges static when needed for variety,
 * and never returns empty when any fallback exists.
 */
export function resolveHeroPhotoPool({ apiPool, staticPool, genericPool }: ResolveArgs): TravelPhoto[] {
  const sanitize = (list: TravelPhoto[]) => list.map((p) => sanitizePhoto(p));
  const api = dedupePhotos(sanitize(apiPool));
  if (api.length >= 2) return api;

  const merged = dedupePhotos(sanitize([...apiPool, ...staticPool]));
  if (merged.length >= 2) return merged;
  if (merged.length >= 1) return merged;

  return genericPool.length ? dedupePhotos(sanitize(genericPool)) : [];
}

/** Fingerprint for carousel reset when the visible pool changes. */
export function heroPoolFingerprint(photos: TravelPhoto[]): string {
  return photos.map((p) => p.id).join('|');
}
