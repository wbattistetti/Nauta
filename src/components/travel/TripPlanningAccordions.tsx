/**
 * Planning UI — itinerary + preferences accordions only (no ribbon chips).
 */
import { useState } from 'react';
import type {
  TravelPhase,
  TravelState,
  UserProfile,
  PendingReplacement,
  TravelStop,
} from '../../types/travelState';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import { isPanelsReviewed } from '../../lib/travel/travelUi';
import {
  ITINERARY_ACCORDION_TITLE_ACTION,
  ITINERARY_ACCORDION_TITLE_REST,
  PREFERENCES_ACCORDION_TITLE_ACTION,
  PREFERENCES_ACCORDION_TITLE_REST,
  PREFERENCES_ACCORDION_PAYOFF_LONG,
  PREFERENCES_ACCORDION_PAYOFF_SHORT,
  PREFERENCES_REVISION_WRITE_PAYOFF,
  PREFERENCES_REVISION_PANELS_PAYOFF,
  PREFERENCES_REVISION_INPUT_PLACEHOLDER,
  ITINERARY_PROCEED_LABEL,
} from '../../lib/travel/itineraryCopy';
import AccordionActionTitle from './AccordionActionTitle';
import ItineraryFeedbackIcons, { type ItineraryFeedback } from './ItineraryFeedbackIcons';
import PreliminaryItineraryPanel from './PreliminaryItineraryPanel';
import ProfileChoicePanels from './ProfileChoicePanels';
import {
  PlanningAccordionBody,
  PlanningAccordionHeader,
  PlanningAccordionSection,
  PLANNING_PANEL_DIVIDE,
  PLANNING_PANEL_SHELL,
} from './PlanningAccordion';

type Props = {
  travelState: TravelState;
  travelPhase: TravelPhase;
  panelMicroFeedback?: string | null;
  profilePatchError?: string | null;
  onProfileChange: (patch: Partial<UserProfile>) => void;
  profileDisabled?: boolean;
  onConfirmItinerary?: () => void;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  onHeroContextChange?: (ctx: ExplorerHeroContext) => void;
};

export default function TripPlanningAccordions({
  travelState,
  travelPhase,
  panelMicroFeedback,
  profilePatchError,
  onProfileChange,
  profileDisabled,
  onConfirmItinerary,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
  onHeroContextChange,
}: Props) {
  const hasStops = travelState.itinerary.stops.length > 0;
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [choicesOpen, setChoicesOpen] = useState(false);
  const [preferencesEditMode, setPreferencesEditMode] = useState(false);
  const [itineraryFeedback, setItineraryFeedback] = useState<ItineraryFeedback>('none');
  const [revisionNote, setRevisionNote] = useState('');

  const stops: TravelStop[] = travelState.itinerary.stops;
  const pendingReplacement: PendingReplacement | null | undefined =
    travelState.pendingReplacement;

  const panelsReviewed = isPanelsReviewed(travelState.profile);
  const showRevisionPayoff = itineraryFeedback === 'disliked';

  function handleLike() {
    setItineraryFeedback('liked');
    setChoicesOpen(false);
  }

  function handleDislike() {
    setItineraryFeedback('disliked');
    setChoicesOpen(true);
  }

  function handleProceed() {
    setItineraryOpen(false);
    onConfirmItinerary?.();
  }

  function handlePreferencesEditModeChange(edit: boolean) {
    setPreferencesEditMode(edit);
    if (edit) setChoicesOpen(true);
  }

  const preferencesPayoff = panelsReviewed
    ? PREFERENCES_ACCORDION_PAYOFF_SHORT
    : PREFERENCES_ACCORDION_PAYOFF_LONG;

  const itineraryFeedbackTone =
    itineraryFeedback === 'liked' || itineraryFeedback === 'disliked'
      ? itineraryFeedback
      : undefined;

  return (
    <div className={`w-full ${PLANNING_PANEL_SHELL}`}>
      <div className={PLANNING_PANEL_DIVIDE}>
        <PlanningAccordionSection tone={itineraryFeedbackTone}>
          <PlanningAccordionHeader
            title=""
            titleNode={
              <AccordionActionTitle
                actionWord={ITINERARY_ACCORDION_TITLE_ACTION}
                rest={ITINERARY_ACCORDION_TITLE_REST}
              />
            }
            feedbackTone={itineraryFeedbackTone}
            open={itineraryOpen}
            onToggle={() => hasStops && setItineraryOpen((v) => !v)}
            disabled={!hasStops}
            badge={hasStops ? `${stops.length} tappe` : '…'}
            trailingAction={
              !travelState.locked && hasStops ? (
                <div className="flex items-center gap-1.5">
                  {onConfirmItinerary ? (
                    <ItineraryFeedbackIcons
                      value={itineraryFeedback}
                      onLike={handleLike}
                      onDislike={handleDislike}
                    />
                  ) : null}
                  {itineraryFeedback === 'liked' && onConfirmItinerary ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProceed();
                      }}
                      className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full bg-emerald-800 text-emerald-50 font-medium whitespace-nowrap hover:bg-emerald-700 transition-colors touch-manipulation"
                    >
                      {ITINERARY_PROCEED_LABEL}
                    </button>
                  ) : null}
                </div>
              ) : null
            }
          />
          <PlanningAccordionBody open={itineraryOpen}>
            {hasStops ? (
              <PreliminaryItineraryPanel
                stops={stops}
                profile={travelState.profile}
                travelPhase={travelPhase}
                visible={itineraryOpen}
                locked={travelState.locked}
                pendingReplacement={pendingReplacement}
                onRequestReplace={onRequestReplace}
                onPickReplacement={onPickReplacement}
                onCancelReplacement={onCancelReplacement}
                onHeroContextChange={onHeroContextChange}
              />
            ) : (
              <p className="text-xs text-amber-400/85 py-2">In preparazione…</p>
            )}
          </PlanningAccordionBody>
        </PlanningAccordionSection>

        <PlanningAccordionSection>
          <PlanningAccordionHeader
            title=""
            titleNode={
              <AccordionActionTitle
                actionWord={PREFERENCES_ACCORDION_TITLE_ACTION}
                rest={PREFERENCES_ACCORDION_TITLE_REST}
              />
            }
            open={choicesOpen}
            onToggle={() => setChoicesOpen((v) => !v)}
          />
          <PlanningAccordionBody open={choicesOpen}>
            {showRevisionPayoff ? (
              <>
                <p className="text-xs text-amber-200/90 leading-relaxed pb-2">
                  {PREFERENCES_REVISION_WRITE_PAYOFF}
                </p>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder={PREFERENCES_REVISION_INPUT_PLACEHOLDER}
                  rows={3}
                  className="w-full mb-3 rounded-lg border border-amber-900/40 bg-stone-950/80 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-600/60 focus:outline-none focus:ring-1 focus:ring-teal-600/50 resize-y min-h-[4.5rem]"
                />
                <p className="text-xs text-amber-200/90 leading-relaxed pb-3">
                  {PREFERENCES_REVISION_PANELS_PAYOFF}
                </p>
              </>
            ) : (
              <p className="text-xs text-amber-200/90 leading-relaxed pb-3">{preferencesPayoff}</p>
            )}
            {panelMicroFeedback ? (
              <p className="text-[11px] text-teal-400/90 pb-2">{panelMicroFeedback}</p>
            ) : null}
            {profilePatchError ? (
              <p className="text-xs text-red-400/90 pb-2">{profilePatchError}</p>
            ) : null}
            <ProfileChoicePanels
              profile={travelState.profile}
              onChange={onProfileChange}
              disabled={profileDisabled}
              editMode={preferencesEditMode}
              onEditModeChange={handlePreferencesEditModeChange}
            />
          </PlanningAccordionBody>
        </PlanningAccordionSection>
      </div>
    </div>
  );
}
