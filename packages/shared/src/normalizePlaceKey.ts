/**
 * Stable cache key for place names (photos, search dedup).
 */
export function normalizePlaceKey(value: string | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function stopPhotoKey(stopName: string, region?: string | null): string {
  return normalizePlaceKey(`${stopName}|${region ?? ''}`);
}
