/**
 * Fixed viewport tab — reopens stops index (portal, does not scroll with content).
 */
import { createPortal } from 'react-dom';
import { List } from 'lucide-react';
import { STOPS_INDEX_TAB_LABEL } from '../../lib/travel/itineraryCopy';

type Props = {
  onClick: () => void;
};

export default function StopsIndexTab({ onClick }: Props) {
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={STOPS_INDEX_TAB_LABEL}
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[85] flex flex-col items-center gap-0.5 py-3 pl-1 pr-2 rounded-r-lg border border-l-0 border-amber-900/45 bg-stone-950/[0.94] text-amber-200/95 shadow-lg shadow-black/40 hover:bg-stone-900 transition-colors touch-manipulation"
    >
      <List size={14} className="text-amber-400/90" aria-hidden />
      <span
        className="text-[10px] font-semibold tracking-wide uppercase"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        {STOPS_INDEX_TAB_LABEL}
      </span>
    </button>,
    document.body
  );
}
