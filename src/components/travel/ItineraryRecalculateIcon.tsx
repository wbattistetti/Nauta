/**
 * Compact refresh control on the itinerary accordion — pulses when stale.
 */
import { RefreshCw } from 'lucide-react';
import { RECALCULATE_ITINERARY_ARIA_LABEL } from '../../lib/travel/itineraryCopy';

type Props = {
  onRecalculate: () => void;
  stale: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export default function ItineraryRecalculateIcon({
  onRecalculate,
  stale,
  disabled,
  loading,
}: Props) {
  if (!stale) return null;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={(e) => {
        e.stopPropagation();
        onRecalculate();
      }}
      aria-label={RECALCULATE_ITINERARY_ARIA_LABEL}
      title={RECALCULATE_ITINERARY_ARIA_LABEL}
      className="shrink-0 p-1 rounded-full text-amber-300/95 hover:bg-amber-950/50 hover:text-amber-100 disabled:opacity-50 transition-colors touch-manipulation"
    >
      <RefreshCw
        size={17}
        strokeWidth={2.25}
        className={loading ? 'animate-spin' : stale ? 'nauta-recalc-pulse' : undefined}
        aria-hidden
      />
    </button>
  );
}
