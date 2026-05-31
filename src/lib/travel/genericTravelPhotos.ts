/**
 * Generic travel mood — shown while destination photos load from API.
 */
import type { TravelPhoto } from './travelPhoto';

const W = (id: string, alt: string): TravelPhoto => ({
  id,
  alt,
  src: `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`,
});

/** Neutral “journey” hero — not tied to a specific country. */
export const GENERIC_TRAVEL_PLACEHOLDER: TravelPhoto[] = [
  W('photo-1436491865332-7a61a109cc05', 'Partenza — valigia e viaggio'),
];

export function genericTravelPlaceholder(): TravelPhoto[] {
  return GENERIC_TRAVEL_PLACEHOLDER;
}

const GENERIC_IDS = new Set(GENERIC_TRAVEL_PLACEHOLDER.map((p) => p.id));

/** True while the hero still shows the neutral journey placeholder. */
export function isGenericPlaceholderPhoto(photo: TravelPhoto | null | undefined): boolean {
  if (!photo) return true;
  return GENERIC_IDS.has(photo.id);
}

export function hasLiveDestinationPhoto(photos: TravelPhoto[]): boolean {
  return photos.some((p) => !isGenericPlaceholderPhoto(p));
}
