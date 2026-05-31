/**
 * Curated destination photo sets — instant client fallback while live photos load.
 */

export type DestinationPhoto = {
  id: string;
  alt: string;
  src: string;
};

const W = (id: string, alt: string, src?: string) => ({
  id,
  alt,
  src: src ?? `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`,
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
  cina: [
    W(
      'china-great-wall-unsplash',
      'Grande Muraglia',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'china-great-wall-wiki',
      'Grande Muraglia a Jinshanling',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg'
    ),
    W(
      'china-shanghai',
      'Skyline di Shanghai',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg'
    ),
    W(
      'china-forbidden-city',
      'Città Proibita, Pechino',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Hong_Forbidden_City_picture.jpg/1280px-Hong_Forbidden_City_picture.jpg'
    ),
    W(
      'china-forbidden-meridian',
      'Porta Meridiana, Città Proibita',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/The_Meridian_Gate%2C_the_Forbidden_City%2C_Beijing_%2850589333988%29.jpg/1280px-The_Meridian_Gate%2C_the_Forbidden_City%2C_Beijing_%2850589333988%29.jpg'
    ),
  ],
  china: [
    W(
      'china-great-wall-unsplash',
      'Grande Muraglia',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'china-great-wall-wiki',
      'Grande Muraglia a Jinshanling',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg'
    ),
    W(
      'china-shanghai',
      'Skyline di Shanghai',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg'
    ),
    W(
      'china-forbidden-city',
      'Città Proibita, Pechino',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Hong_Forbidden_City_picture.jpg/1280px-Hong_Forbidden_City_picture.jpg'
    ),
    W(
      'china-forbidden-meridian',
      'Porta Meridiana, Città Proibita',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/The_Meridian_Gate%2C_the_Forbidden_City%2C_Beijing_%2850589333988%29.jpg/1280px-The_Meridian_Gate%2C_the_Forbidden_City%2C_Beijing_%2850589333988%29.jpg'
    ),
  ],
  giappone: [
    W(
      'japan-fuji-unsplash',
      'Monte Fuji',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'japan-kyoto-unsplash',
      'Tempio a Kyoto',
      'https://images.unsplash.com/photo-1493976040374-85c8e9126439?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'japan-tokyo-unsplash',
      'Tokyo di notte',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'japan-torii-unsplash',
      'Torii sul lago',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80&auto=format&fit=crop'
    ),
  ],
  japan: [
    W(
      'japan-fuji-unsplash',
      'Monte Fuji',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'japan-kyoto-unsplash',
      'Tempio a Kyoto',
      'https://images.unsplash.com/photo-1493976040374-85c8e9126439?w=1200&q=80&auto=format&fit=crop'
    ),
    W(
      'japan-tokyo-unsplash',
      'Tokyo di notte',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&auto=format&fit=crop'
    ),
  ],
  alaska: [
    W(
      'alaska-denali',
      'Denali e picchi innevati',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Denali_Mt_Mckinley.jpg/1280px-Denali_Mt_Mckinley.jpg'
    ),
    W(
      'alaska-glacier',
      'Ghiacciaio in Alaska',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mendenhall_Glacier_%28Alaska%29.jpg/1280px-Mendenhall_Glacier_%28Alaska%29.jpg'
    ),
    W(
      'alaska-fjord',
      'Fiordo e montagne',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tracy_Arm_Fjord%2C_Alaska_%282%29.jpg/1280px-Tracy_Arm_Fjord%2C_Alaska_%282%29.jpg'
    ),
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

/** Photos for a trip destination (region or country name). Known regions only — others load via API. */
export function photosForDestination(destination: string | null | undefined): DestinationPhoto[] {
  if (!destination?.trim()) return [];
  const key = destinationKey(destination);
  for (const [k, photos] of Object.entries(BY_DESTINATION)) {
    if (k === 'default') continue;
    if (key.includes(k) || k.includes(key)) return photos;
  }
  return [];
}
