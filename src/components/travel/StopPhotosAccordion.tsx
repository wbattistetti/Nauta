/**
 * Nested accordion — sample photos for a stop ("Ecco alcune foto…").
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { photosForStop } from '../../lib/travel/stopPhotos';
import { STOP_PHOTOS_ACCORDION_LABEL } from '../../lib/travel/itineraryCopy';

type Props = {
  stopName: string;
};

export default function StopPhotosAccordion({ stopName }: Props) {
  const [open, setOpen] = useState(false);
  const photos = photosForStop(stopName);

  return (
    <div className="mt-2 border-t border-amber-900/30 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left py-1"
        aria-expanded={open}
      >
        <span className="text-[11px] font-medium text-amber-300/90">{STOP_PHOTOS_ACCORDION_LABEL}</span>
        <ChevronDown
          size={14}
          className={`text-amber-500/70 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-2">
          {photos.map((p) => (
            <figure key={p.id} className="shrink-0 w-28">
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="w-28 h-20 object-cover rounded-lg border border-amber-900/40"
              />
              <figcaption className="text-[9px] text-amber-600/80 mt-0.5 line-clamp-1">
                {p.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}
