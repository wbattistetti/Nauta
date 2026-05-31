/**
 * Hero photo band — destination carousel or focused stop photos (single top slot).
 */
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TravelPhoto } from '../../lib/travel/travelPhoto';
import heroPortrait from '../../assets/splash-hero.jpg';
import heroFallback from '../../assets/splash-hero.png';

type Props = {
  photos: TravelPhoto[];
  photoIndex?: number;
  onPhotoIndexChange?: (index: number) => void;
  interactive?: boolean;
  stopFocus?: boolean;
};

const SLIDE_MS = 7000;

export default function ChatTripBackground({
  photos,
  photoIndex: controlledIndex,
  onPhotoIndexChange,
  interactive = false,
  stopFocus = false,
}: Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [fallback, setFallback] = useState(false);
  const controlled = controlledIndex !== undefined;
  const index = controlled ? controlledIndex : internalIndex;

  const setIndex = useCallback(
    (next: number | ((prev: number) => number)) => {
      const resolved = typeof next === 'function' ? next(index) : next;
      const safe = photos.length ? ((resolved % photos.length) + photos.length) % photos.length : 0;
      onPhotoIndexChange?.(safe);
      if (!controlled) setInternalIndex(safe);
    },
    [controlled, index, onPhotoIndexChange, photos.length]
  );

  useEffect(() => {
    setIndex(0);
    setFallback(false);
  }, [photos, setIndex]);

  useEffect(() => {
    if (fallback || photos.length <= 1 || stopFocus || interactive) return;
    const id = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [photos.length, fallback, stopFocus, interactive, setIndex]);

  const scrim = (
    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-stone-950/10 pointer-events-none" />
  );

  const hasMany = photos.length > 1 && interactive;

  if (fallback || !photos.length) {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={heroPortrait}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = heroFallback;
          }}
        />
        {scrim}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={!interactive}>
      {photos.map((photo, i) => (
        <img
          key={`${photo.id}-${i}`}
          src={photo.src}
          alt=""
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[900ms] ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          onError={() => {
            if (i === 0) setFallback(true);
          }}
        />
      ))}
      {scrim}

      {hasMany ? (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Foto precedente"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-stone-950/75 border border-stone-700/60 flex items-center justify-center text-amber-100 hover:bg-stone-900/90 pointer-events-auto"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            aria-label="Foto successiva"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-stone-950/75 border border-stone-700/60 flex items-center justify-center text-amber-100 hover:bg-stone-900/90 pointer-events-auto"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-10 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-auto">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Foto ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-amber-200' : 'bg-stone-500/80'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
