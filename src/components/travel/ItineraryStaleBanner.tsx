/**
 * Warning chip when preferences diverged from the current itinerary.
 */
import { RECALCULATE_TRIP_CHIP_LABEL } from '../../lib/travel/itineraryCopy';

type Props = {
  onRecalculate: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function ItineraryStaleBanner({ onRecalculate, disabled, loading }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onRecalculate}
      className="w-full flex items-center justify-center gap-1.5 text-xs font-normal px-3 py-2.5 rounded-lg border border-amber-900/35 bg-amber-950/30 text-amber-200/90 hover:bg-amber-950/45 transition-colors disabled:opacity-50"
    >
      {loading ? 'Ricalcolo in corso…' : RECALCULATE_TRIP_CHIP_LABEL}
    </button>
  );
}
