/**
 * Curated destination photo sets for the trip chat background carousel.
 */

export type DestinationPhoto = {
  id: string;
  alt: string;
  src: string;
};

const W = (id: string, alt: string) => ({
  id,
  alt,
  src: `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`,
});

const BY_DESTINATION: Record<string, DestinationPhoto[]> = {
  sicilia: [
    W('photo-1523906834658-6e24ef2386f9', 'Mare e costa siciliana'),
    W('photo-1469854523086-cc02fe5d8800', 'Borghi e panorami'),
    W('photo-1488646953014-85cb44e25828', 'Viaggio in Sicilia'),
    W('photo-1514890547357-a9ee288728e0', 'Scorci mediterranei'),
    W('photo-1552832230-c0197dd311b5', 'Storia e luce dorata'),
    W('photo-1543429775-27835a09f066', 'Tramonto sul mare'),
    W('photo-1506905925346-21bda4d32df4', 'Paesaggio e cielo'),
  ],
  sardegna: [
    W('photo-1507525428034-b723cf961d3e', 'Costa sarda'),
    W('photo-1469854523086-cc02fe5d8800', 'Spiaggia e calette'),
    W('photo-1506905925346-21bda4d32df4', 'Paesaggio mediterraneo'),
  ],
  campania: [
    W('photo-1523906834658-6e24ef2386f9', 'Costiera'),
    W('photo-1514890547357-a9ee288728e0', 'Veduta sul mare'),
    W('photo-1552832230-c0197dd311b5', 'Centro storico'),
  ],
  toscana: [
    W('photo-1523906834658-6e24ef2386f9', 'Colline toscane'),
    W('photo-1543429775-27835a09f066', 'Firenze al tramonto'),
    W('photo-1469854523086-cc02fe5d8800', 'Campagna'),
  ],
  default: [
    W('photo-1488646953014-85cb44e25828', 'Viaggio in Italia'),
    W('photo-1469854523086-cc02fe5d8800', 'Strada panoramica'),
    W('photo-1523906834658-6e24ef2386f9', 'Mare e cielo'),
    W('photo-1506905925346-21bda4d32df4', 'Montagna e luce'),
  ],
};

function destinationKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Photos for a trip destination (region or country name). */
export function photosForDestination(destination: string | null | undefined): DestinationPhoto[] {
  if (!destination?.trim()) return BY_DESTINATION.default;
  const key = destinationKey(destination);
  for (const [k, photos] of Object.entries(BY_DESTINATION)) {
    if (k === 'default') continue;
    if (key.includes(k) || k.includes(key)) return photos;
  }
  return BY_DESTINATION.default;
}
