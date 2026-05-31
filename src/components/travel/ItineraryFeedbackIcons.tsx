/**
 * Thumbs up/down — itinerary approval without chat (opens revision panel on down).
 */
import { ThumbsDown, ThumbsUp } from 'lucide-react';

export type ItineraryFeedback = 'none' | 'liked' | 'disliked';

type Props = {
  value: ItineraryFeedback;
  disabled?: boolean;
  onLike: () => void;
  onDislike: () => void;
};

export default function ItineraryFeedbackIcons({ value, disabled, onLike, onDislike }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
        aria-label="Mi piace l'itinerario"
        aria-pressed={value === 'liked'}
        className={`p-1.5 rounded-full border transition-colors touch-manipulation disabled:opacity-40 ${
          value === 'liked'
            ? 'bg-emerald-900/70 border-emerald-600/60 text-emerald-200'
            : 'bg-stone-900/60 border-amber-900/40 text-amber-300/80 hover:bg-emerald-950/40 hover:border-emerald-800/50'
        }`}
      >
        <ThumbsUp size={15} className={value === 'liked' ? 'text-emerald-300' : undefined} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onDislike();
        }}
        aria-label="Non mi piace, modifica preferenze"
        aria-pressed={value === 'disliked'}
        className={`p-1.5 rounded-full border transition-colors touch-manipulation disabled:opacity-40 ${
          value === 'disliked'
            ? 'bg-red-950/70 border-red-700/60 text-red-200'
            : 'bg-stone-900/60 border-amber-900/40 text-amber-300/80 hover:bg-red-950/40 hover:border-red-800/50'
        }`}
      >
        <ThumbsDown size={15} className={value === 'disliked' ? 'text-red-300' : undefined} />
      </button>
    </div>
  );
}
