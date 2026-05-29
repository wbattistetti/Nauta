/**
 * Destination photo carousel — hero band (sharp) or full-bleed with scrim.
 */
import { useEffect, useMemo, useState } from 'react';
import { photosForDestination } from '../../lib/travel/destinationPhotos';
import heroPortrait from '../../assets/splash-hero.jpg';
import heroFallback from '../../assets/splash-hero.png';

type Props = {
  destination?: string | null;
  /** hero = top photo strip; fullscreen = behind entire view (legacy) */
  variant?: 'hero' | 'fullscreen';
};

const SLIDE_MS = 7000;

export default function ChatTripBackground({ destination, variant = 'hero' }: Props) {
  const photos = useMemo(() => photosForDestination(destination), [destination]);
  const [index, setIndex] = useState(0);
  const [fallback, setFallback] = useState(false);
  const fullscreen = variant === 'fullscreen';

  useEffect(() => {
    setIndex(0);
    setFallback(false);
  }, [destination]);

  useEffect(() => {
    if (fallback || photos.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [photos.length, fallback]);

  const scrim = fullscreen ? (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/65 to-stone-950/92" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950 to-transparent" />
    </>
  ) : (
    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/15 to-stone-950/5" />
  );

  if (fallback) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {photos.map((photo, i) => (
        <img
          key={photo.id}
          src={photo.src}
          alt=""
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1400ms] ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          onError={() => {
            if (i === 0) setFallback(true);
          }}
        />
      ))}
      {scrim}
    </div>
  );
}
