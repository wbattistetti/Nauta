/**
 * Dynamic hero chip titles — trip overview + stop subtitle under period line.
 */
import { isGenericPlaceholderPhoto } from './genericTravelPhotos.ts';
import type { TravelPhoto } from './travelPhoto';
import type { TravelStop } from '../../types/travelState';

const GENERIC_CAPTION_RE =
  /^(partenza|valigia|viaggio|in evidenza|scorcio|atmosfera|destinazione)/i;

/** Strip generic journey placeholder alts — not valid stop photo captions. */
export function sanitizeStopPhotoCaption(
  photo: TravelPhoto | null | undefined,
  stopName: string
): string {
  if (!photo || isGenericPlaceholderPhoto(photo)) return 'in evidenza';

  let caption = photo.alt.trim();
  if (!caption || GENERIC_CAPTION_RE.test(caption)) return 'in evidenza';

  const stop = stopName.trim();
  if (stop) {
    const prefix = new RegExp(`^${stop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[·:\\-–—]\\s*`, 'i');
    caption = caption.replace(prefix, '').trim();
  }

  return caption || 'in evidenza';
}

/** Second chip line when a stop is focused — e.g. "Siena: Campo e torre del Mangia". */
export function buildStopFocusChipSubtitle(stopName: string, photoCaption: string): string {
  const name = stopName.trim() || 'Tappa';
  const caption = photoCaption.trim() || 'in evidenza';
  return `${name}: ${caption}`;
}

/** @deprecated Use buildStopFocusChipSubtitle under trip title + period subtitle */
export function buildStopFocusChipTitle(
  destination: string | undefined,
  stopName: string,
  photoCaption: string
): string {
  const dest = destination?.trim() || 'Viaggio';
  const caption = photoCaption.trim() || 'in evidenza';
  return `${dest}: ${stopName} – ${caption}`;
}

/** Caption overlay at bottom of hero photo band (stop focus). */
export function buildHeroPhotoCaption(stopName: string, photoCaption: string): string {
  return `${stopName} · ${photoCaption.trim() || 'in evidenza'}`;
}

/** Caption for trip-level destination carousel slides. */
export function buildDestinationPhotoCaption(
  destination: string | undefined,
  photoCaption: string
): string {
  const dest = destination?.trim() || 'Destinazione';
  let caption = photoCaption.trim();
  if (!caption) return `${dest} · in evidenza`;

  const prefix = new RegExp(`^${dest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[·\\-–—]\\s*`, 'i');
  caption = caption.replace(prefix, '').trim();

  if (!caption || caption.toLowerCase() === dest.toLowerCase()) {
    return `${dest} · in evidenza`;
  }
  return `${dest} · ${caption}`;
}

export function findStopById(stops: TravelStop[], id: string | null): TravelStop | null {
  if (!id) return null;
  return stops.find((s) => s.id === id) ?? null;
}

export type ExplorerHeroContext = {
  mode: 'trip' | 'stop';
  stop: TravelStop | null;
};
