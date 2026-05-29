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
import {
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_EDIT_HEADLINE,
  PREFERENCES_MODIFY_LABEL,
  PREFERENCES_BACK_TO_PROPOSAL_LABEL,
  PREFERENCES_PROPOSAL_HEADLINE,
} from '../../lib/travel/itineraryCopy';
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
}: Props) {
  const hasStops = travelState.itinerary.stops.length > 0;
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [choicesOpen, setChoicesOpen] = useState(false);
  const [preferencesEditMode, setPreferencesEditMode] = useState(false);

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
    <div className={`w-full ${PLANNING_PANEL_SHELL}`}>
      <div className={PLANNING_PANEL_DIVIDE}>
        <PlanningAccordionSection>
          <PlanningAccordionHeader
            title={ITINERARY_ACCORDION_TITLE}
            open={itineraryOpen}
            onToggle={() => hasStops && setItineraryOpen((v) => !v)}
            disabled={!hasStops}
            badge={hasStops ? `${stops.length} tappe` : '…'}
          />
          <PlanningAccordionBody open={itineraryOpen}>
            {hasStops ? (
              <PreliminaryItineraryPanel
                stops={stops}
                travelPhase={travelPhase}
                locked={travelState.locked}
                pendingReplacement={pendingReplacement}
                onConfirm={handleConfirm}
                onRequestReplace={onRequestReplace}
                onPickReplacement={onPickReplacement}
                onCancelReplacement={onCancelReplacement}
              />
            ) : (
              <p className="text-xs text-amber-400/85 py-2">In preparazione…</p>
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
