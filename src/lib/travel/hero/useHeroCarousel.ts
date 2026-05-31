/**
 * Hero carousel navigation — index, visible slides, broken-image handling.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TravelPhoto } from '../travelPhoto';

const SLIDE_MS = 7000;

type Args = {
  photos: TravelPhoto[];
  /** Changes when the underlying pool changes (resets index and broken set). */
  poolKey: string;
  autoAdvance?: boolean;
  /** Pause auto-advance while the user shows manual nav controls. */
  navPaused?: boolean;
};

export function useHeroCarousel({
  photos,
  poolKey,
  autoAdvance = true,
  navPaused = false,
}: Args) {
  const [index, setIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setIndex(0);
    setBrokenIds(new Set());
  }, [poolKey]);

  const visiblePhotos = useMemo(() => {
    const filtered = photos.filter((p) => !brokenIds.has(p.id));
    return filtered.length ? filtered : photos;
  }, [photos, brokenIds]);

  const safeIndex = visiblePhotos.length
    ? ((index % visiblePhotos.length) + visiblePhotos.length) % visiblePhotos.length
    : 0;

  const currentPhoto = visiblePhotos[safeIndex] ?? visiblePhotos[0] ?? null;

  const goTo = useCallback(
    (next: number | ((prev: number) => number)) => {
      if (!visiblePhotos.length) return;
      const resolved = typeof next === 'function' ? next(safeIndex) : next;
      const wrapped =
        ((resolved % visiblePhotos.length) + visiblePhotos.length) % visiblePhotos.length;
      setIndex(wrapped);
    },
    [safeIndex, visiblePhotos.length]
  );

  const markPhotoBroken = useCallback(
    (photoId: string) => {
      setBrokenIds((prev) => {
        if (prev.has(photoId)) return prev;
        const next = new Set(prev);
        const remaining = photos.filter((p) => !next.has(p.id) && p.id !== photoId);
        if (remaining.length === 0) return prev;
        next.add(photoId);
        return next;
      });

      const current = visiblePhotos[safeIndex];
      if (current?.id === photoId) {
        goTo((i) => i + 1);
      }
    },
    [photos, visiblePhotos, safeIndex, goTo]
  );

  useEffect(() => {
    if (!autoAdvance || navPaused || visiblePhotos.length <= 1) return;
    const id = window.setInterval(() => goTo((i) => i + 1), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [autoAdvance, navPaused, visiblePhotos.length, goTo]);

  return {
    visiblePhotos,
    photoIndex: safeIndex,
    setPhotoIndex: goTo,
    currentPhoto,
    markPhotoBroken,
  };
}
