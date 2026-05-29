import { useState } from 'react';
import { APP_STICKY_HEADER_PX } from '../../lib/layout';
import heroPortrait from '../../assets/splash-hero.jpg';
import heroFallback from '../../assets/splash-hero.png';

type Props = {
  pendingDestination?: string | null;
  onResume?: () => void;
  onStartNew: () => void;
};

/**
 * Splash: blurred hero + CTA to resume in-progress trip or start new.
 */
export default function NewTripSplashHero({
  pendingDestination,
  onResume,
  onStartNew,
}: Props) {
  const [imgSrc, setImgSrc] = useState(heroPortrait);
  const canResume = Boolean(pendingDestination && onResume);
  const viewportHeight = `calc(100dvh - ${APP_STICKY_HEADER_PX}px)`;

  return (
    <section
      className="relative w-full overflow-hidden bg-stone-900"
      style={{
        height: viewportHeight,
        minHeight: viewportHeight,
        backgroundImage: `url(${imgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <img
        src={imgSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
        onError={() => setImgSrc(heroFallback)}
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 gap-3">
        {canResume && (
          <button
            type="button"
            onClick={onResume}
            className="w-full max-w-sm px-8 py-3.5 rounded-full bg-amber-800/95 hover:bg-amber-700 text-amber-50 font-semibold text-sm sm:text-base tracking-wide shadow-lg shadow-black/40 border border-amber-600/50 transition-colors text-center"
          >
            Riprendi il tuo viaggio in {pendingDestination}
          </button>
        )}
        <button
          type="button"
          onClick={onStartNew}
          className={`w-full max-w-sm px-10 py-3.5 rounded-full font-semibold text-sm sm:text-base tracking-wide shadow-lg shadow-black/40 border transition-colors ${
            canResume
              ? 'bg-stone-900/80 hover:bg-stone-800/90 text-amber-100 border-stone-600/50'
              : 'bg-teal-900 hover:bg-teal-800 text-white border-teal-800/60'
          }`}
        >
          Organizza il tuo viaggio
        </button>
      </div>
    </section>
  );
}
