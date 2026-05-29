/**
 * Vertical itinerary version list for trip burger menu (under destination).
 */
import { Check } from 'lucide-react';
import type { ItineraryMenuEntry } from '../../lib/travel/itineraryVersionMenu';

type Props = {
  entries: ItineraryMenuEntry[];
  disabled?: boolean;
  onSelect: (versionId: string) => void;
};

export default function TripItineraryVersionMenu({ entries, disabled, onSelect }: Props) {
  if (entries.length === 0) return null;

  return (
    <ul className="list-none m-0 p-0 border-t border-amber-900/25 mt-1 pt-1 space-y-0">
      {entries.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(entry.id);
            }}
            className={[
              'w-full text-left pl-3 pr-3 py-2 transition-colors disabled:opacity-50',
              entry.isActive
                ? 'bg-teal-950/35 border-l-2 border-teal-500/80'
                : 'border-l-2 border-transparent hover:bg-amber-950/25',
            ].join(' ')}
          >
            <div className="flex items-start gap-2 min-w-0">
              <span className="flex-1 min-w-0">
                <span
                  className={`text-xs font-medium block truncate ${
                    entry.isActive ? 'text-teal-100/95' : 'text-amber-100/90'
                  }`}
                >
                  {entry.label}
                </span>
                <span className="text-[10px] font-normal text-amber-500/75 leading-snug block mt-0.5 line-clamp-2">
                  {entry.payoffSummary}
                </span>
              </span>
              {entry.isActive ? (
                <Check
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-teal-400 mt-0.5"
                  aria-hidden
                />
              ) : null}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
