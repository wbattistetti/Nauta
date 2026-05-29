/**
 * Placeholder photo sets per stop — emotional preview until a real media API exists.
 */

export type StopPhoto = {
  id: string;
  alt: string;
  /** Unsplash CDN path segment (w=400). */
  src: string;
};

const BY_CITY: Record<string, StopPhoto[]> = {
  venezia: [
    { id: '1', alt: 'Canale e palazzi', src: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400&q=80' },
    { id: '2', alt: 'Gondole al tramonto', src: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&q=80' },
  ],
  cinque_terre: [
    { id: '1', alt: 'Colori sul mare', src: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&q=80' },
    { id: '2', alt: 'Sentiero panoramico', src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80' },
  ],
  firenze: [
    { id: '1', alt: 'Duomo e tetti', src: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&q=80' },
    { id: '2', alt: 'Arno al tramonto', src: 'https://images.unsplash.com/photo-1543429775-27835a09f066?w=400&q=80' },
  ],
  roma: [
    { id: '1', alt: 'Rovine e luce dorata', src: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80' },
    { id: '2', alt: 'Scorci storici', src: 'https://images.unsplash.com/photo-1529260830193-1a1c889dce5f?w=400&q=80' },
  ],
  default: [
    { id: '1', alt: 'Scorcio del viaggio', src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80' },
    { id: '2', alt: 'Atmosfera locale', src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80' },
  ],
};

function cityKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Photos for a stop name (best-effort city match). */
export function photosForStop(stopName: string): StopPhoto[] {
  const key = cityKey(stopName);
  for (const [k, photos] of Object.entries(BY_CITY)) {
    if (k !== 'default' && (key.includes(k) || k.includes(key))) return photos;
  }
  return BY_CITY.default;
}
