/**
 * Loads and resolves hero photo pools (trip destination or focused stop).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TravelStop } from '../../../types/travelState';
import { photosForDestination } from '../destinationPhotos';
import { genericTravelPlaceholder, hasLiveDestinationPhoto } from '../genericTravelPhotos';
import { fetchTripPhotos } from '../photoApi';
import { photosForStop } from '../stopPhotos';
import type { TravelPhoto } from '../travelPhoto';
import { resolveStopPhotoPool } from '../stopPhotoPool';
import {
  getCachedHeroPhotoPool,
  heroPhotoCacheKey,
  setCachedHeroPhotoPool,
} from './heroPhotoCache';
import {
  heroPoolFingerprint,
  pickApiTripPool,
  resolveHeroPhotoPool,
} from './resolveHeroPhotoPool';

type StopInput = Pick<TravelStop, 'name' | 'region'>;

type Args = {
  destination?: string | null;
  stops: StopInput[];
  stopFocus: boolean;
  stopName?: string | null;
  stopRegion?: string | null;
  enabled?: boolean;
  onDestinationPhotosReady?: () => void;
};

function stopsSignature(stops: StopInput[]): string {
  return stops.map((s) => `${s.name}|${s.region ?? ''}`).join(';');
}

function staticTripPool(destination: string | null | undefined): TravelPhoto[] {
  return photosForDestination(destination);
}

function tripFallback(destination: string): TravelPhoto[] {
  const curated = staticTripPool(destination || null);
  return curated.length ? curated : genericTravelPlaceholder();
}

function stopFallback(stopName: string, destination: string): TravelPhoto[] {
  const curated = photosForStop(stopName);
  return curated.length ? curated : tripFallback(destination);
}

export function useHeroPhotoPool({
  destination,
  stops,
  stopFocus,
  stopName,
  stopRegion,
  enabled = true,
  onDestinationPhotosReady,
}: Args) {
  const [tripPool, setTripPool] = useState<TravelPhoto[]>(() => genericTravelPlaceholder());
  const [stopSets, setStopSets] = useState<Record<string, TravelPhoto[]>>({});
  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);
  const photosReadyFired = useRef(false);
  const stopSig = stopsSignature(stops);
  const dest = destination?.trim() ?? '';

  useEffect(() => {
    if (!enabled) {
      setStopSets({});
      setLoading(false);
      return;
    }

    const reqId = ++requestId.current;
    photosReadyFired.current = false;

    if (!dest && stops.length === 0) {
      setTripPool(genericTravelPlaceholder());
      setLoading(false);
      return;
    }

    const cacheKey = heroPhotoCacheKey(dest, stopSig);
    const cached = getCachedHeroPhotoPool(cacheKey);

    if (cached?.length) {
      setTripPool(cached);
      setLoading(false);
    } else {
      const instant = staticTripPool(dest || null);
      setTripPool(instant.length ? instant : genericTravelPlaceholder());
      setLoading(true);
    }

    void fetchTripPhotos(dest || null, stops)
      .then((result) => {
        if (requestId.current !== reqId) return;
        setStopSets(result.stops);

        const staticPool = staticTripPool(dest || null);
        const apiPool = pickApiTripPool(result.tripHero, result.destinationPool, staticPool);
        const resolved = resolveHeroPhotoPool({
          apiPool,
          staticPool,
          genericPool: genericTravelPlaceholder(),
        });
        const final = resolved.length ? resolved : tripFallback(dest);

        setCachedHeroPhotoPool(cacheKey, final);
        setTripPool(final);
        setLoading(false);
      })
      .catch(() => {
        if (requestId.current !== reqId) return;
        const pool = getCachedHeroPhotoPool(cacheKey) ?? tripFallback(dest);
        setTripPool(pool);
        setLoading(false);
      });
  }, [destination, stopSig, enabled, dest, stops.length]);

  const photos = useMemo((): TravelPhoto[] => {
    if (!enabled) return genericTravelPlaceholder();

    if (stopFocus && stopName) {
      return resolveStopPhotoPool(
        { name: stopName, region: stopRegion },
        stopSets,
        dest
      );
    }

    return tripPool;
  }, [enabled, stopFocus, stopName, stopRegion, stopSets, tripPool, dest]);

  const poolKey = useMemo(() => {
    const mode =
      stopFocus && stopName
        ? `stop:${stopName}|${stopRegion ?? ''}`
        : 'trip';
    return `${mode}|${dest}|${heroPoolFingerprint(photos)}`;
  }, [stopFocus, stopName, stopRegion, dest, photos]);

  useEffect(() => {
    if (!enabled || stopFocus) return;
    if (!dest || photosReadyFired.current) return;

    const live = hasLiveDestinationPhoto(photos);
    const settled = !loading;

    if (live || settled) {
      photosReadyFired.current = true;
      onDestinationPhotosReady?.();
    }
  }, [photos, loading, enabled, stopFocus, dest, onDestinationPhotosReady]);

  return {
    photos,
    stopSets,
    loading,
    poolKey,
    hasLivePhoto: hasLiveDestinationPhoto(photos),
  };
}
