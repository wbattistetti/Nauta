/**
 * Wikimedia Commons image search — free, no API key, worldwide places.
 */
import { isRejectedTravelPhotoText } from './photoQuery.js';

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';

/**
 * @param {object} page
 * @returns {import('./photoService.js').TravelPhoto | null}
 */
function mapPage(page) {
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl && !info?.url) return null;

  const width = Number(info.thumbwidth ?? info.width ?? 0);
  const height = Number(info.thumbheight ?? info.height ?? 0);
  if (width > 0 && height > 0 && width <= height) return null;

  const src = info.thumburl || info.url;
  const objectName = info.extmetadata?.ObjectName?.value;
  const imageDescription = info.extmetadata?.ImageDescription?.value;
  const artist = info.extmetadata?.Artist?.value;

  const altRaw =
    stripHtml(objectName) ||
    stripHtml(imageDescription) ||
    stripHtml(page.title?.replace(/^File:/, '')) ||
    'Travel photo';

  const alt = altRaw.length > 120 ? `${altRaw.slice(0, 117)}…` : altRaw;

  if (isRejectedTravelPhotoText(alt)) return null;

  return {
    id: `wiki-${page.pageid}`,
    alt,
    src,
    photographer: artist ? stripHtml(artist) : 'Wikimedia Commons',
    photographerUrl: info.descriptionurl ? String(info.descriptionurl) : undefined,
  };
}

/** @param {string} html */
function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} query
 * @param {number} [perPage]
 * @returns {Promise<{ photos: import('./photoService.js').TravelPhoto[] }>}
 */
export async function searchWikimediaPhotos(query, perPage = 8) {
  /** @type {import('./photoService.js').TravelPhoto[]} */
  const photos = [];
  const target = Math.min(Math.max(perPage, 1), 15);
  let offset = 0;
  const batchSize = Math.min(target * 3, 25);

  while (photos.length < target && offset < 50) {
    const url = new URL(WIKIMEDIA_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    url.searchParams.set('generator', 'search');
    url.searchParams.set('gsrsearch', query);
    url.searchParams.set('gsrnamespace', '6');
    url.searchParams.set('gsrlimit', String(batchSize));
    url.searchParams.set('gsroffset', String(offset));
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set('iiprop', 'url|extmetadata|size');
    url.searchParams.set('iiurlwidth', '1200');

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Wikimedia ${res.status}`);
    }

    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages || typeof pages !== 'object') break;

    for (const page of Object.values(pages)) {
      const mapped = mapPage(page);
      if (!mapped) continue;
      if (photos.some((p) => p.id === mapped.id)) continue;
      photos.push(mapped);
      if (photos.length >= target) break;
    }

    if (!data.continue?.gsroffset) break;
    offset = Number(data.continue.gsroffset);
  }

  return { photos };
}
