/**
 * Blurred splash hero behind the chat overlay.
 */
import { useState } from 'react';
import heroPortrait from '../../assets/splash-hero.jpg';
import heroFallback from '../../assets/splash-hero.png';

export default function ChatTripBackground() {
  const [imgSrc, setImgSrc] = useState(heroPortrait);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <img
        src={imgSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center scale-110 blur-2xl opacity-50"
        draggable={false}
        onError={() => setImgSrc(heroFallback)}
      />
      <div className="absolute inset-0 bg-stone-950/75" />
    </div>
  );
}
