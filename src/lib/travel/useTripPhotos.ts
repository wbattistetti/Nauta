/**
 * Loads dynamic hero photos for trip overview and focused stops.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TravelStop } from '../../types/travelState';
import { photosForDestination } from './destinationPhotos';
import { fetchTripPhotos } from './photoApi';
import { photosForStop } from './stopPhotos';
import { stopPhotoKey, type TravelPhoto } from './travelPhoto';

type StopInput = Pick<TravelStop, 'name' | 'region'>;

type Args = {
  destination?: string | null;
  stops: StopInput[];
  stopFocus: boolean;
  stopName?: string | null;
  stopRegion?: string | null;
  enabled?: boolean;
};

type PhotoState = {
  tripHero: TravelPhoto[];
  stopSets: Record<string, TravelPhoto[]>;
  loading: boolean;
};

function staticTripPhotos(destination: string | null | undefined): TravelPhoto[] {
  return photosForDestination(destination);
}

function staticStopPhotos(stopName: string): TravelPhoto[] {
  return photosForStop(stopName);
}

function stopsSignature(stops: StopInput[]): string {
  return stops.map((s) => `${s.name}|${s.region ?? ''}`).join(';');
}

export function useTripPhotos({
  destination,
  stops,
  stopFocus,
  stopName,
  stopRegion,
  enabled = true,
}: Args) {
  const [state, setState] = useState<PhotoState>(() => ({
    tripHero: staticTripPhotos(destination),
    stopSets: {},
    loading: false,
  }));

  const requestId = useRef(0);
  const stopSig = stopsSignature(stops);

  useEffect(() => {
    if (!enabled) return;

    const dest = destination?.trim() ?? '';
    const id = ++requestId.current;

    if (!dest && stops.length === 0) {
      setState({ tripHero: staticTripPhotos(null), stopSets: {}, loading: false });
      return;
    }

    setState({
      tripHero: staticTripPhotos(dest || null),
      stopSets: {},
      loading: true,
    });

    void fetchTripPhotos(dest || null, stops)
      .then((result) => {
        if (requestId.current !== id) return;
        setState({
          tripHero: result.tripHero.length ? result.tripHero : result.destinationPool,
          stopSets: result.stops,
          loading: false,
        });
      })
      .catch(() => {
        if (requestId.current !== id) return;
        setState({
          tripHero: staticTripPhotos(dest || null),
          stopSets: {},
          loading: false,
        });
      });
  }, [destination, stopSig, enabled]);

  const carouselPhotos = useMemo((): TravelPhoto[] => {
    if (stopFocus && stopName) {
      const key = stopPhotoKey(stopName, stopRegion);
      const live = state.stopSets[key];
      if (live?.length) return live;
      return staticStopPhotos(stopName);
    }
    return state.tripHero.length ? state.tripHero : staticTripPhotos(destination);
  }, [stopFocus, stopName, stopRegion, state.stopSets, state.tripHero, destination]);

  const photoAt = useMemo(
    () =>
      (index: number): TravelPhoto | null =>
        carouselPhotos[index] ?? carouselPhotos[0] ?? null,
    [carouselPhotos]
  );

  return { carouselPhotos, photoAt, loading: state.loading };
}
