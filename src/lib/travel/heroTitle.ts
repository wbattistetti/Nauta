/**
 * Dynamic hero chip titles — trip overview vs focused stop.
 */
import type { TravelStop } from '../../types/travelState';

/** Slim chip when browsing a stop (e.g. "Sicilia: Palermo – Mercato e vicoli"). */
export function buildStopFocusChipTitle(
  destination: string | undefined,
  stopName: string,
  photoCaption: string
): string {
  const dest = destination?.trim() || 'Viaggio';
  const caption = photoCaption.trim() || 'in evidenza';
  return `${dest}: ${stopName} – ${caption}`;
}

/** Caption overlay at bottom of hero photo band. */
export function buildHeroPhotoCaption(stopName: string, photoCaption: string): string {
  return `${stopName} · ${photoCaption.trim() || 'in evidenza'}`;
}

export function findStopById(stops: TravelStop[], id: string | null): TravelStop | null {
  if (!id) return null;
  return stops.find((s) => s.id === id) ?? null;
}

export type ExplorerHeroContext = {
  mode: 'trip' | 'stop';
  stop: TravelStop | null;
  photoIndex: number;
};
