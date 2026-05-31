/**
 * Trip title — inline in chat or chip overlay on the destination photo hero.
 * Chip variant can embed planning icons (eye / puzzle) when planning UI is active.
 */
import { Eye, Puzzle } from 'lucide-react';
import {
  ITINERARY_ACCORDION_TITLE_ACTION,
  PREFERENCES_ACCORDION_TITLE_ACTION,
} from '../../lib/travel/itineraryCopy';
import ItineraryRecalculateIcon from './ItineraryRecalculateIcon';
import HeroChipTutor from './HeroChipTutor';

export type HeroPlanningActions = {
  itineraryActive: boolean;
  preferencesActive: boolean;
  itineraryDisabled?: boolean;
  onItinerary: () => void;
  onPreferences: () => void;
};

type Props = {
  title: string;
  subtitle?: string | null;
  /** Stop line under period subtitle — e.g. "Siena: Piazza del Campo". */
  stopSubtitle?: string | null;
  itineraryStale?: boolean;
  onRecalculate?: () => void;
  recalculateLoading?: boolean;
  recalculateDisabled?: boolean;
  /** chip = rounded overlay on hero photo */
  variant?: 'inline' | 'chip';
  /** When set, eye + puzzle render inside the hero chip (planning phase only). */
  planningActions?: HeroPlanningActions | null;
  /** First-visit chip tutor block */
  showChipTutor?: boolean;
  chipTutorExpanded?: boolean;
  onChipTutorExpand?: () => void;
  onChipTutorDismiss?: () => void;
  chipTutorHasStops?: boolean;
};

function planningIconClass(active: boolean, disabled?: boolean): string {
  return `shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border touch-manipulation transition-colors ${
    disabled
      ? 'opacity-35 cursor-not-allowed border-amber-900/25 text-amber-200/50'
      : active
        ? 'bg-amber-900/50 border-amber-600/55 text-amber-50'
        : 'border-amber-900/35 text-amber-200/95 hover:bg-stone-900/80 hover:border-amber-800/50'
  }`;
}

export default function TripChatHeader({
  title,
  subtitle,
  stopSubtitle,
  itineraryStale,
  onRecalculate,
  recalculateLoading,
  recalculateDisabled,
  variant = 'inline',
  planningActions,
  showChipTutor = false,
  chipTutorExpanded = false,
  onChipTutorExpand,
  onChipTutorDismiss,
  chipTutorHasStops = false,
}: Props) {
  const chip = variant === 'chip';
  const showPlanningIcons = chip && Boolean(planningActions);

  const titleBlock = (
    <>
      <div className="flex items-center justify-center gap-1.5">
        <h2
          className={`font-semibold text-amber-50 tracking-wide leading-snug ${
            chip ? 'text-sm sm:text-[15px] line-clamp-2' : 'text-sm sm:text-base'
          }`}
        >
          {title}
        </h2>
        {onRecalculate ? (
          <ItineraryRecalculateIcon
            stale={Boolean(itineraryStale)}
            onRecalculate={onRecalculate}
            disabled={recalculateDisabled}
            loading={recalculateLoading}
          />
        ) : null}
      </div>
      {subtitle ? (
        <p
          className={`text-amber-300/95 mt-0.5 tabular-nums ${
            chip ? 'text-[11px] line-clamp-1' : 'text-[11px] text-amber-400/90'
          }`}
        >
          {subtitle}
        </p>
      ) : null}
      {stopSubtitle ? (
        <p
          className={`text-amber-200/90 mt-0.5 ${
            chip ? 'text-[11px] line-clamp-2 leading-snug' : 'text-[11px]'
          }`}
        >
          {stopSubtitle}
        </p>
      ) : null}
    </>
  );

  if (chip) {
    return (
      <div
        className={`w-full mx-auto rounded-2xl border border-amber-900/35 bg-stone-950/[0.94] shadow-xl shadow-black/50 ${
          showPlanningIcons ? 'max-w-[min(100%,28rem)] px-2 py-2' : 'max-w-md px-4 py-2.5 text-center'
        }`}
        role="group"
        aria-label={title}
      >
        {showPlanningIcons && planningActions ? (
          <>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={planningActions.onItinerary}
                disabled={planningActions.itineraryDisabled}
                aria-label={`${ITINERARY_ACCORDION_TITLE_ACTION} l'itinerario`}
                aria-pressed={planningActions.itineraryActive}
                className={planningIconClass(
                  planningActions.itineraryActive,
                  planningActions.itineraryDisabled
                )}
              >
                <Eye size={18} strokeWidth={1.75} aria-hidden />
              </button>

              <div className="flex-1 min-w-0 text-center px-0.5">{titleBlock}</div>

              <button
                type="button"
                onClick={planningActions.onPreferences}
                aria-label={`${PREFERENCES_ACCORDION_TITLE_ACTION} i tuoi gusti`}
                aria-pressed={planningActions.preferencesActive}
                className={planningIconClass(planningActions.preferencesActive)}
              >
                <Puzzle size={18} strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            {showChipTutor && onChipTutorExpand && onChipTutorDismiss ? (
              <HeroChipTutor
                hasStops={chipTutorHasStops}
                expanded={chipTutorExpanded}
                onExpand={onChipTutorExpand}
                onDismiss={onChipTutorDismiss}
              />
            ) : null}
          </>
        ) : (
          titleBlock
        )}
      </div>
    );
  }

  return <div className="text-center py-1 px-1">{titleBlock}</div>;
}
