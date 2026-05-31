/**
 * Unsplash Search API client for travel hero photos.
 */
import { isRejectedTravelPhotoText } from './photoQuery.js';

const UNSPLASH_SEARCH = 'https://api.unsplash.com/search/photos';

/**
 * @typedef {object} UnsplashSearchResult
 * @property {import('./photoService.js').TravelPhoto[]} photos
 * @property {boolean} live
 */

/**
 * @param {object} photo
 * @returns {import('./photoService.js').TravelPhoto | null}
 */
function mapPhoto(photo) {
  if (!photo?.id || !photo?.urls?.regular) return null;
  const alt =
    (typeof photo.alt_description === 'string' && photo.alt_description.trim()) ||
    (typeof photo.description === 'string' && photo.description.trim()) ||
    'Travel photo';

  if (isRejectedTravelPhotoText(alt)) return null;

  return {
    id: String(photo.id),
    alt,
    src: `${photo.urls.regular}&w=1200&q=80&auto=format&fit=crop`,
    photographer: photo.user?.name ? String(photo.user.name) : undefined,
    photographerUrl: photo.user?.links?.html ? String(photo.user.links.html) : undefined,
  };
}

/**
 * Search Unsplash for landscape travel photos.
 * @param {string} query
 * @param {number} [perPage]
 * @returns {Promise<UnsplashSearchResult>}
 */
export async function searchUnsplashPhotos(query, perPage = 8) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) {
    return { photos: [], live: false };
  }

  const url = new URL(UNSPLASH_SEARCH);
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(Math.min(Math.max(perPage + 4, 1), 15)));
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('order_by', 'relevant');
  url.searchParams.set('content_filter', 'high');

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Unsplash ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  const photos = results.map(mapPhoto).filter(Boolean).slice(0, perPage);

  return { photos, live: true };
}
