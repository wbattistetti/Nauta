/**
 * Planning UI below chat — flat accordions inside a single outer border.
 */
import { useState } from 'react';
import type {
  TravelPhase,
  TravelState,
  UserProfile,
  PendingReplacement,
  TravelStop,
} from '../../types/travelState';
import { buildPlanningRibbonChips, travelPeriodSummary } from '../../lib/travel/planningSummary';
import {
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_EDIT_HEADLINE,
  PREFERENCES_MODIFY_LABEL,
  PREFERENCES_BACK_TO_PROPOSAL_LABEL,
  PREFERENCES_PROPOSAL_HEADLINE,
} from '../../lib/travel/itineraryCopy';
import PreliminaryItineraryPanel from './PreliminaryItineraryPanel';
import ProfileChoicePanels from './ProfileChoicePanels';
import ItineraryStaleBanner from './ItineraryStaleBanner';
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
  onRecalculateItinerary?: () => void;
  recalculateLoading?: boolean;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
};

export default function TripPlanningAccordions({
  travelState,
  travelPhase,
  panelMicroFeedback,
  profilePatchError,
  onProfileChange,
  profileDisabled,
  onConfirmItinerary,
  onRecalculateItinerary,
  recalculateLoading,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
}: Props) {
  const hasStops = travelState.itinerary.stops.length > 0;
  const itineraryStale = Boolean(travelState.itineraryStale) && !travelState.locked;
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [choicesOpen, setChoicesOpen] = useState(false);
  const [preferencesEditMode, setPreferencesEditMode] = useState(false);

  const chips = buildPlanningRibbonChips(travelState);
  const periodLine = travelPeriodSummary(travelState.profile);
  const stops: TravelStop[] = travelState.itinerary.stops;
  const pendingReplacement: PendingReplacement | null | undefined =
    travelState.pendingReplacement;

  const preferencesAccordionTitle = preferencesEditMode
    ? PREFERENCES_EDIT_HEADLINE
    : PREFERENCES_PROPOSAL_HEADLINE;

  function handleConfirm() {
    setItineraryOpen(false);
    onConfirmItinerary?.();
  }

  function handlePreferencesEditModeChange(edit: boolean) {
    setPreferencesEditMode(edit);
    if (edit) setChoicesOpen(true);
  }

  function handlePreferencesAction() {
    if (preferencesEditMode) {
      handlePreferencesEditModeChange(false);
    } else {
      handlePreferencesEditModeChange(true);
    }
  }

  return (
    <div className="space-y-2 w-full">
      {periodLine ? (
        <p className="text-[11px] font-normal text-amber-500/70 text-center px-1">{periodLine}</p>
      ) : null}

      {itineraryStale && onRecalculateItinerary ? (
        <ItineraryStaleBanner
          onRecalculate={onRecalculateItinerary}
          disabled={profileDisabled}
          loading={recalculateLoading}
        />
      ) : null}

      <div className={`w-full ${PLANNING_PANEL_SHELL}`}>
        <div className={PLANNING_PANEL_DIVIDE}>
          <PlanningAccordionSection>
            <PlanningAccordionHeader
              title={ITINERARY_ACCORDION_TITLE}
              open={itineraryOpen}
              onToggle={() => hasStops && setItineraryOpen((v) => !v)}
              disabled={!hasStops}
              badge={hasStops ? `${stops.length} tappe` : 'in preparazione'}
            />
            <PlanningAccordionBody open={itineraryOpen}>
              {hasStops ? (
                <PreliminaryItineraryPanel
                  stops={stops}
                  travelPhase={travelPhase}
                  locked={travelState.locked}
                  pendingReplacement={pendingReplacement}
                  onConfirm={handleConfirm}
                  onRecalculate={onRecalculateItinerary}
                  recalculateLoading={recalculateLoading}
                  onRequestReplace={onRequestReplace}
                  onPickReplacement={onPickReplacement}
                  onCancelReplacement={onCancelReplacement}
                />
              ) : (
                <p className="text-xs font-normal text-amber-500/80 py-2">
                  Sto preparando le tappe…
                </p>
              )}
            </PlanningAccordionBody>
          </PlanningAccordionSection>

          <PlanningAccordionSection>
            <PlanningAccordionHeader
              title={preferencesAccordionTitle}
              open={choicesOpen}
              onToggle={() => setChoicesOpen((v) => !v)}
              actionLabel={
                preferencesEditMode ? PREFERENCES_BACK_TO_PROPOSAL_LABEL : PREFERENCES_MODIFY_LABEL
              }
              onAction={handlePreferencesAction}
            />
            <PlanningAccordionBody open={choicesOpen}>
              {panelMicroFeedback ? (
                <p className="text-[11px] font-normal text-teal-400/90 pb-2">{panelMicroFeedback}</p>
              ) : null}
              {profilePatchError ? (
                <p className="text-xs font-normal text-red-400/90 pb-2">{profilePatchError}</p>
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

      {chips.length > 0 ? (
        <div className="pt-1 px-0.5">
          <p className="text-[10px] font-normal text-amber-500/65 mb-1.5 uppercase tracking-wide">
            Riepilogo
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {chips.map((chip) => (
              <span
                key={chip.id}
                className={`shrink-0 text-[11px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap ${
                  chip.kind === 'stop'
                    ? 'bg-teal-950/50 text-teal-100/90'
                    : 'bg-amber-950/40 text-amber-200/85'
                }`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
