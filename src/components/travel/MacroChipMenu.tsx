/**
 * Popover menu for selected macro tiles (exclude / more details).
 */
import { useEffect, useRef } from 'react';

export type MacroMenuAction = 'exclude' | 'details';

type Props = {
  open: boolean;
  detailsActive: boolean;
  showDetailsOption: boolean;
  onAction: (action: MacroMenuAction) => void;
  onClose: () => void;
};

export default function MacroChipMenu({
  open,
  detailsActive,
  showDetailsOption,
  onAction,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-8 right-0 z-50 min-w-[10.5rem] rounded-lg border border-amber-900/45 bg-stone-950 shadow-xl shadow-black/50 py-1"
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => onAction('exclude')}
        className="w-full text-left px-3 py-2 text-[11px] text-red-300/95 hover:bg-red-950/40 transition-colors"
      >
        Escludi proprio
      </button>
      {showDetailsOption ? (
        <button
          type="button"
          role="menuitem"
          onClick={() => onAction('details')}
          className={[
            'w-full text-left px-3 py-2 text-[11px] transition-colors',
            detailsActive
              ? 'text-teal-200 bg-teal-950/35'
              : 'text-amber-100/90 hover:bg-amber-950/40',
          ].join(' ')}
        >
          {detailsActive ? 'Meno dettagli…' : 'Più dettagli…'}
        </button>
      ) : null}
    </div>
  );
}
