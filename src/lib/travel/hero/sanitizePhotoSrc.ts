/**
 * Normalize hero image URLs — encode stray spaces that break Wikimedia paths.
 */
export function sanitizePhotoSrc(src: string): string {
  if (!src.includes(' ')) return src;
  try {
    const url = new URL(src);
    url.pathname = url.pathname.replace(/ /g, '%20');
    return url.toString();
  } catch {
    return src.replace(/ /g, '%20');
  }
}

/** Apply src sanitization to a photo copy. */
export function sanitizePhoto<T extends { src: string }>(photo: T): T {
  return { ...photo, src: sanitizePhotoSrc(photo.src) };
}
