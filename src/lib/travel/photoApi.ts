/**
 * Client for dynamic travel hero photos (Unsplash via Nauta API).
 */
import { apiJson } from '../apiJson';
import type { TravelPhoto } from './travelPhoto';

export type PhotoResolveResult = {
  destinationPool: TravelPhoto[];
  tripHero: TravelPhoto[];
  stops: Record<string, TravelPhoto[]>;
  source: 'live' | 'fallback';
};

export type PhotoSetResult = {
  photos: TravelPhoto[];
  source: 'live' | 'fallback';
};

export async function fetchTripPhotos(
  destination: string | null | undefined,
  stops: { name: string; region?: string }[]
): Promise<PhotoResolveResult> {
  return apiJson<PhotoResolveResult>('/api/photos/resolve', {
    method: 'POST',
    body: JSON.stringify({
      destination: destination ?? '',
      stops: stops.map((s) => ({ name: s.name, region: s.region })),
    }),
  });
}

export async function fetchDestinationPhotos(place: string): Promise<PhotoSetResult> {
  const q = encodeURIComponent(place);
  return apiJson<PhotoSetResult>(`/api/photos/destination?place=${q}`);
}

export async function fetchStopPhotos(
  name: string,
  opts?: { region?: string; destination?: string }
): Promise<PhotoSetResult> {
  const params = new URLSearchParams({ name });
  if (opts?.region) params.set('region', opts.region);
  if (opts?.destination) params.set('destination', opts.destination);
  return apiJson<PhotoSetResult>(`/api/photos/stop?${params}`);
}
