/**
 * Hero photo band — cross-fade carousel (presentation only; state from useHeroPhotos).
 */
import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { photoReferrerPolicy } from '../../lib/travel/hero/photoReferrerPolicy';
import type { TravelPhoto } from '../../lib/travel/travelPhoto';

type Props = {
  photos: TravelPhoto[];
  photoIndex: number;
  onPhotoIndexChange: (index: number) => void;
  onPhotoError?: (photoId: string) => void;
  onNavPauseChange?: (paused: boolean) => void;
  interactive?: boolean;
  stopFocus?: boolean;
};

export default function ChatTripBackground({
  photos,
  photoIndex,
  onPhotoIndexChange,
  onPhotoError,
  onNavPauseChange,
  interactive = false,
  stopFocus = false,
}: Props) {
  const [navVisible, setNavVisible] = useState(false);

  const toggleNav = useCallback(() => {
    setNavVisible((v) => {
      const next = !v;
      onNavPauseChange?.(next);
      return next;
    });
  }, [onNavPauseChange]);

  const canNavigate = photos.length > 1;
  const safeIndex = photos.length
    ? ((photoIndex % photos.length) + photos.length) % photos.length
    : 0;

  const goTo = useCallback(
    (next: number | ((prev: number) => number)) => {
      if (!photos.length) return;
      const resolved = typeof next === 'function' ? next(safeIndex) : next;
      const wrapped = ((resolved % photos.length) + photos.length) % photos.length;
      onPhotoIndexChange(wrapped);
    },
    [photos.length, safeIndex, onPhotoIndexChange]
  );

  const scrim = (
    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-stone-950/10 pointer-events-none" />
  );

  if (!photos.length) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-stone-900" aria-hidden>
        {scrim}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={!canNavigate && !interactive}>
      {photos.map((photo, i) => {
        const policy = photoReferrerPolicy(photo.src);
        return (
          <img
            key={photo.id}
            src={photo.src}
            alt=""
            {...(policy ? { referrerPolicy: policy } : {})}
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[900ms] ease-in-out ${
              i === safeIndex ? 'opacity-100' : 'opacity-0'
            }`}
            onError={() => onPhotoError?.(photo.id)}
          />
        );
      })}
      {scrim}

      {canNavigate ? (
        <button
          type="button"
          className="absolute inset-0 z-[4] cursor-default bg-transparent"
          aria-label={navVisible ? 'Nascondi controlli carosello' : 'Mostra controlli carosello'}
          onClick={toggleNav}
        />
      ) : null}

      {canNavigate && navVisible ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo((i) => i - 1);
            }}
            aria-label="Foto precedente"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-stone-950/75 border border-stone-700/60 flex items-center justify-center text-amber-100 hover:bg-stone-900/90 pointer-events-auto"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo((i) => i + 1);
            }}
            aria-label="Foto successiva"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-stone-950/75 border border-stone-700/60 flex items-center justify-center text-amber-100 hover:bg-stone-900/90 pointer-events-auto"
          >
            <ChevronRight size={18} />
          </button>
        </>
      ) : null}
    </div>
  );
}
