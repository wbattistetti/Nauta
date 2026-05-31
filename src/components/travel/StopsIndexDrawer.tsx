/**
 * Stops index — fixed viewport overlay (option A: full height, covers chat input).
 * Header fixed; only the list scrolls.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { TravelStop } from '../../types/travelState';
import { stopMicroKeywords } from '../../lib/travel/stopMicroLabel';
import { STOPS_INDEX_DRAWER_TITLE } from '../../lib/travel/itineraryCopy';

type Props = {
  stops: TravelStop[];
  selectedId: string;
  onSelect: (stopId: string) => void;
  onClose: () => void;
};

const PANEL_W = 'min(88vw, 300px)';

export default function StopsIndexDrawer({ stops, selectedId, onSelect, onClose }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label={STOPS_INDEX_DRAWER_TITLE}>
      <aside
        className="fixed left-0 top-0 bottom-0 z-[92] flex flex-col bg-stone-950 border-r border-amber-900/40 shadow-2xl"
        style={{ width: PANEL_W }}
      >
        <header className="shrink-0 flex items-center justify-between border-b border-amber-900/30 py-3 px-4">
          <h3 className="text-sm font-semibold text-amber-50">{STOPS_INDEX_DRAWER_TITLE}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 rounded-full text-amber-300/90 hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </header>
        <ul className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-amber-900/20">
          {stops.map((stop, index) => {
            const active = stop.id === selectedId;
            return (
              <li key={stop.id}>
                <button
                  type="button"
                  onClick={() => onSelect(stop.id)}
                  className={`w-full text-left py-3.5 px-4 transition-colors touch-manipulation ${
                    active ? 'bg-amber-950/40' : 'hover:bg-stone-900/80 active:bg-stone-800'
                  }`}
                >
                  <span className="text-[10px] text-amber-600/80 font-mono tabular-nums block">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-amber-50 leading-snug">{stop.name}</p>
                  <p className="text-[11px] text-amber-400/85 mt-0.5">{stopMicroKeywords(stop)}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <button
        type="button"
        aria-label="Chiudi indice"
        className="fixed top-0 right-0 bottom-0 z-[91] bg-stone-950/65 backdrop-blur-[2px]"
        style={{ left: PANEL_W }}
        onClick={onClose}
      />
    </div>,
    document.body
  );
}
