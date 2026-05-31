/**
 * Resolve stop photo pools for sidebar thumbnails and hero (API + static fallback).
 */
import { genericTravelPlaceholder } from './genericTravelPhotos';
import { photosForDestination } from './destinationPhotos';
import { photosForStop } from './stopPhotos';
import { stopPhotoKey, type TravelPhoto } from './travelPhoto';
import { resolveHeroPhotoPool } from './hero/resolveHeroPhotoPool';
import { sanitizePhotoSrc } from './hero/sanitizePhotoSrc';

type StopLike = { name: string; region?: string | null };

function tripFallback(destination: string): TravelPhoto[] {
  const curated = photosForDestination(destination || null);
  return curated.length ? curated : genericTravelPlaceholder();
}

function stopFallback(stopName: string, destination: string): TravelPhoto[] {
  const curated = photosForStop(stopName);
  return curated.length ? curated : tripFallback(destination);
}

/** Full resolved pool for one itinerary stop. */
export function resolveStopPhotoPool(
  stop: StopLike,
  stopSets: Record<string, TravelPhoto[]>,
  destination: string
): TravelPhoto[] {
  const key = stopPhotoKey(stop.name, stop.region);
  const apiPool = stopSets[key] ?? [];
  const staticPool = photosForStop(stop.name);
  // Verified static curated sets win over API cache (may contain stale/broken URLs).
  const primaryPool = staticPool.length ? staticPool : apiPool;
  const resolved = resolveHeroPhotoPool({
    apiPool: primaryPool,
    staticPool,
    genericPool: stopFallback(stop.name, destination),
  });
  return resolved.length ? resolved : stopFallback(stop.name, destination);
}

/** First iconic thumbnail for sidebar rows. */
export function stopThumbnailPhoto(
  stop: StopLike,
  stopSets: Record<string, TravelPhoto[]>,
  destination: string
): TravelPhoto {
  const staticFirst = photosForStop(stop.name)[0];
  if (staticFirst) {
    return { ...staticFirst, src: sanitizePhotoSrc(staticFirst.src) };
  }
  const thumb = resolveStopPhotoPool(stop, stopSets, destination)[0];
  if (thumb) return thumb;
  return stopFallback(stop.name, destination)[0] ?? genericTravelPlaceholder()[0];
}

/** Ordinal label for sidebar rows (e.g. "1° Sydney"). */
export function stopOrdinalTitle(index: number, stopName: string): string {
  return `${index + 1}° ${stopName.trim() || 'Tappa'}`;
}
