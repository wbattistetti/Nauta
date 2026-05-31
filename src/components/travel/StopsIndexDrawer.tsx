/**
 * Stops index — compact left drawer with schedule synoptic and stop thumbnails.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { TravelStop, UserProfile } from '../../types/travelState';
import type { TravelPhoto } from '../../lib/travel/travelPhoto';
import { photoReferrerPolicy } from '../../lib/travel/hero/photoReferrerPolicy';
import { STOPS_INDEX_DRAWER_TITLE } from '../../lib/travel/itineraryCopy';
import { stopMicroKeywords } from '../../lib/travel/stopMicroLabel';
import { buildStopIndexSchedule } from '../../lib/travel/stopIndexSchedule';
import { stopOrdinalTitle, stopThumbnailPhoto } from '../../lib/travel/stopPhotoPool';

type Props = {
  stops: TravelStop[];
  profile?: UserProfile;
  destination?: string | null;
  stopSets?: Record<string, TravelPhoto[]>;
  selectedId: string;
  onSelect: (stopId: string) => void;
  onClose: () => void;
};

export default function StopsIndexDrawer({
  stops,
  profile,
  destination = '',
  stopSets = {},
  selectedId,
  onSelect,
  onClose,
}: Props) {
  const asideRef = useRef<HTMLElement>(null);
  const [panelWidthPx, setPanelWidthPx] = useState(240);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useLayoutEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    setPanelWidthPx(el.offsetWidth);
  }, [stops, profile, selectedId]);

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label={STOPS_INDEX_DRAWER_TITLE}>
      <aside
        ref={asideRef}
        className="fixed left-0 top-0 bottom-0 z-[92] flex flex-col w-max max-w-[min(88vw,360px)] min-w-[11rem] bg-stone-950 border-r border-amber-900/40 shadow-2xl"
      >
        <header className="shrink-0 flex items-center justify-between gap-3 border-b border-amber-900/30 py-2.5 px-3">
          <h3 className="text-sm font-semibold text-amber-50 whitespace-nowrap">
            {STOPS_INDEX_DRAWER_TITLE}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="shrink-0 p-1.5 rounded-full text-amber-300/90 hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </header>
        <ul className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-amber-900/20">
          {stops.map((stop, index) => {
            const active = stop.id === selectedId;
            const { daysLabel, rangeLabel } = buildStopIndexSchedule(stop, index, stops, profile);
            const thumb = stopThumbnailPhoto(stop, stopSets, destination ?? '');
            const policy = photoReferrerPolicy(thumb.src);
            const keywords = stopMicroKeywords(stop);
            const title = stopOrdinalTitle(index, stop.name);

            return (
              <li key={stop.id}>
                <div
                  className={`flex items-start gap-2.5 py-2.5 px-3 transition-colors ${
                    active ? 'bg-amber-950/40' : 'hover:bg-stone-900/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(stop.id)}
                    aria-label={`Apri tappa ${stop.name}`}
                    className="shrink-0 w-11 h-11 rounded-md overflow-hidden bg-stone-800 ring-1 ring-amber-900/35 touch-manipulation hover:ring-amber-700/50 transition-shadow"
                  >
                    <img
                      src={thumb.src}
                      alt=""
                      {...(policy ? { referrerPolicy: policy } : {})}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect(stop.id)}
                    className="min-w-0 flex-1 text-left touch-manipulation active:opacity-90"
                  >
                    <p className="text-sm font-medium text-amber-50 leading-snug whitespace-nowrap">
                      {title}
                    </p>
                    {rangeLabel ? (
                      <p className="text-[11px] text-amber-300/90 mt-0.5 whitespace-nowrap">
                        {rangeLabel}
                      </p>
                    ) : null}
                    <p className="text-[11px] text-amber-400/80 mt-0.5 whitespace-nowrap">
                      {daysLabel}
                      {keywords ? ` · ${keywords}` : ''}
                    </p>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
      <button
        type="button"
        aria-label="Chiudi indice"
        className="fixed top-0 right-0 bottom-0 z-[91] bg-stone-950/65 backdrop-blur-[2px]"
        style={{ left: panelWidthPx }}
        onClick={onClose}
      />
    </div>,
    document.body
  );
}
