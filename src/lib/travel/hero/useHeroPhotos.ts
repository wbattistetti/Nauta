/**
 * Public hero photos API — pool loading + carousel navigation.
 */
import { useHeroCarousel } from './useHeroCarousel';
import { useHeroPhotoPool } from './useHeroPhotoPool';

type StopInput = { name: string; region?: string };

type Args = {
  destination?: string | null;
  stops: StopInput[];
  stopFocus: boolean;
  stopName?: string | null;
  stopRegion?: string | null;
  enabled?: boolean;
  navPaused?: boolean;
  onDestinationPhotosReady?: () => void;
};

export function useHeroPhotos({
  stopFocus,
  navPaused = false,
  ...poolArgs
}: Args) {
  const pool = useHeroPhotoPool({ ...poolArgs, stopFocus });
  const carousel = useHeroCarousel({
    photos: pool.photos,
    poolKey: pool.poolKey,
    autoAdvance: !stopFocus,
    navPaused,
  });

  return {
    photos: carousel.visiblePhotos,
    photoIndex: carousel.photoIndex,
    setPhotoIndex: carousel.setPhotoIndex,
    currentPhoto: carousel.currentPhoto,
    markPhotoBroken: carousel.markPhotoBroken,
    stopSets: pool.stopSets,
    poolKey: pool.poolKey,
    loading: pool.loading,
    hasLivePhoto: pool.hasLivePhoto,
  };
}
