/**
 * Curated iconic destination photos — verified URLs (Wikimedia + Unsplash).
 */
import { normalizePlaceKey } from '@nauta/shared/normalizePlaceKey';
import { resolvePlaceForSearch } from './placeAliases.js';

/**
 * @param {string} id
 * @param {string} alt
 * @param {string} src
 */
function curated(id, alt, src) {
  return { id, alt, src };
}

/** @type {Record<string, import('./photoService.js').TravelPhoto[]>} */
const ICONIC_BY_KEY = {
  cina: [
    curated(
      'china-great-wall-unsplash',
      'Grande Muraglia',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80&auto=format&fit=crop'
    ),
    curated(
      'china-great-wall-wiki',
      'Grande Muraglia a Jinshanling',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg'
    ),
    curated(
      'china-shanghai',
      'Skyline di Shanghai',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Pudong_Shanghai_November_2017_panorama.jpg/1280px-Pudong_Shanghai_November_2017_panorama.jpg'
    ),
    curated(
      'china-forbidden-city',
      'Città Proibita, Pechino',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Hong_Forbidden_City_picture.jpg/1280px-Hong_Forbidden_City_picture.jpg'
    ),
    curated(
      'china-forbidden-meridian',
      'Porta Meridiana, Città Proibita',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/The_Meridian_Gate%2C_the_Forbidden_City%2C_Beijing_%2850589333988%29.jpg/1280px-The_Meridian_Gate%2C_the_Forbidden_City%2C_Beijing_%2850589333988%29.jpg'
    ),
  ],
  china: [],
  alaska: [
    curated(
      'alaska-denali',
      'Denali e picchi innevati',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Denali_Mt_Mckinley.jpg/1280px-Denali_Mt_Mckinley.jpg'
    ),
    curated(
      'alaska-glacier',
      'Ghiacciaio in Alaska',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mendenhall_Glacier_%28Alaska%29.jpg/1280px-Mendenhall_Glacier_%28Alaska%29.jpg'
    ),
    curated(
      'alaska-fjord',
      'Fiordo e montagne',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tracy_Arm_Fjord%2C_Alaska_%282%29.jpg/1280px-Tracy_Arm_Fjord%2C_Alaska_%282%29.jpg'
    ),
  ],
  giappone: [
    curated(
      'japan-fuji-unsplash',
      'Monte Fuji',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80&auto=format&fit=crop'
    ),
    curated(
      'japan-kyoto-unsplash',
      'Tempio a Kyoto',
      'https://images.unsplash.com/photo-1493976040374-85c8e9126439?w=1200&q=80&auto=format&fit=crop'
    ),
    curated(
      'japan-tokyo-unsplash',
      'Tokyo di notte',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&auto=format&fit=crop'
    ),
    curated(
      'japan-torii-unsplash',
      'Torii sul lago',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80&auto=format&fit=crop'
    ),
  ],
  japan: [],
  francia: [
    curated(
      'france-eiffel',
      'Torre Eiffel, Parigi',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg'
    ),
    curated(
      'france-paris-seine',
      'Parigi e Senna',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1280px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg'
    ),
  ],
  france: [],
  parigi: [],
  paris: [],
  egitto: [
    curated(
      'egypt-pyramids',
      'Piramidi di Giza',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/1280px-All_Gizah_Pyramids.jpg'
    ),
  ],
  egypt: [],
  peru: [
    curated(
      'peru-machu',
      'Machu Picchu',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1280px-Machu_Picchu%2C_Peru.jpg'
    ),
  ],
  perù: [],
};

ICONIC_BY_KEY.china = ICONIC_BY_KEY.cina;
ICONIC_BY_KEY.japan = ICONIC_BY_KEY.giappone;
ICONIC_BY_KEY.france = ICONIC_BY_KEY.francia;
ICONIC_BY_KEY.paris = ICONIC_BY_KEY.parigi = ICONIC_BY_KEY.francia;
ICONIC_BY_KEY.egypt = ICONIC_BY_KEY.egitto;
ICONIC_BY_KEY.perù = ICONIC_BY_KEY.peru;

/** Extra Unsplash search terms per destination (iconic places). */
/** @type {Record<string, string[]>} */
export const ICONIC_SEARCH_TERMS = {
  cina: ['Great Wall', 'Forbidden City Beijing', 'Shanghai skyline', 'Zhangjiajie'],
  china: ['Great Wall', 'Forbidden City Beijing', 'Shanghai skyline', 'Zhangjiajie'],
  alaska: ['Denali national park', 'Alaska glacier', 'Northern lights Alaska'],
  giappone: ['Mount Fuji', 'Kyoto temple', 'Tokyo skyline'],
  japan: ['Mount Fuji', 'Kyoto temple', 'Tokyo skyline'],
  francia: ['Eiffel Tower Paris', 'Louvre Paris'],
  france: ['Eiffel Tower Paris', 'Louvre Paris'],
  parigi: ['Eiffel Tower', 'Notre Dame Paris'],
  paris: ['Eiffel Tower', 'Notre Dame Paris'],
};

/**
 * @param {string} place
 * @returns {import('./photoService.js').TravelPhoto[]}
 */
export function curatedDestinationPhotos(place) {
  const trimmed = String(place ?? '').trim();
  if (!trimmed) return [];

  const keys = [
    normalizePlaceKey(trimmed),
    normalizePlaceKey(resolvePlaceForSearch(trimmed)),
  ];

  for (const key of keys) {
    if (ICONIC_BY_KEY[key]?.length) return [...ICONIC_BY_KEY[key]];
  }

  for (const [key, photos] of Object.entries(ICONIC_BY_KEY)) {
    if (keys.some((k) => k.includes(key) || key.includes(k))) return [...photos];
  }

  return [];
}

/**
 * @param {string} place
 * @returns {string[]}
 */
export function iconicSearchQueries(place) {
  const trimmed = String(place ?? '').trim();
  if (!trimmed) return ['famous travel landmark scenic'];

  const searchPlace = resolvePlaceForSearch(trimmed);
  const key = normalizePlaceKey(trimmed);
  const englishKey = normalizePlaceKey(searchPlace);

  const terms =
    ICONIC_SEARCH_TERMS[key] ??
    ICONIC_SEARCH_TERMS[englishKey] ??
    ['famous landmark', 'iconic places tourism'];

  const queries = terms.map((term) => `${searchPlace} ${term}`);
  queries.push(`${searchPlace} iconic landmark tourism`);
  return queries;
}
