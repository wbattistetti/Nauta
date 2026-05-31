/**
 * Travel Agent UI helpers — travel_phase is the single source of truth.
 */
import type { TravelPhase, TravelState, UserProfile } from '../../types/travelState';
import {
  isTravelFactsComplete,
  isTravelerProfileComplete,
  isPanelProfileComplete,
  isPanelsReviewed,
  isReadyForItineraryGeneration,
} from '@nauta/shared/profileGates';
import {
  shouldShowItineraryPanel as shouldShowStopsPanel,
  shouldShowDayPanels,
  shouldShowTripPlanningUI,
  syncUiFromTravelState as sharedSyncUiFromTravelState,
} from '@nauta/shared/travelUiFlags';
import { TRAVEL_OPENER } from '@nauta/shared/constants';

export { TRAVEL_OPENER };

export {
  TRAVEL_PLAN_PROPOSAL_MESSAGE,
  PREFERENCE_PANELS_HINT_MESSAGE,
  ITINERARY_PROPOSAL_CHAT_MESSAGE,
  ITINERARY_PROPOSAL_CHAT_SHORT,
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_PAYOFF,
  PREFERENCE_PANELS_CHAT_MESSAGE,
  formatUserEchoAbovePanels,
} from './travelerPresets';

export {
  isTravelFactsComplete,
  isTravelerProfileComplete,
  isPanelProfileComplete,
  isPanelsReviewed,
};

export function travelPhaseFromState(ts: TravelState | null | undefined): TravelPhase {
  return ts?.travel_phase ?? 'phase1';
}

export function isProfileCompleteForTravel(profile: UserProfile | undefined): boolean {
  return isReadyForItineraryGeneration(profile);
}

/** Phase label shown above chat (replaces 4/6 intake). */
export function travelPhaseLabel(phase: TravelPhase, profile?: UserProfile): string {
  switch (phase) {
    case 'phase1':
      if (!isTravelFactsComplete(profile)) return 'Dove, quanti giorni e quando';
      if (!isTravelerProfileComplete(profile)) return 'Chi viaggia e fascia d’età';
      return 'Itinerario e preferenze — scorri sotto la chat';
    case 'phase2':
      return 'Itinerario e preferenze — modifica o conferma';
    case 'phase3':
      return 'Revisione itinerario — modifica o conferma';
    case 'phase4':
      return 'Dettaglio giorno per giorno';
    default:
      return 'Assistente viaggio';
  }
}

export function chatInputPlaceholder(profile?: UserProfile): string {
  if (!isTravelFactsComplete(profile)) return 'Destinazione, giorni, periodo…';
  if (!isTravelerProfileComplete(profile)) {
    return 'Solo, coppia, famiglia, amici · fascia d’età…';
  }
  return 'Scrivi un messaggio…';
}

export function shouldShowStopsPanelFromState(ts: TravelState | null): boolean {
  return shouldShowStopsPanel(ts);
}

export { shouldShowDayPanels, shouldShowTripPlanningUI };

/** @deprecated Use shouldShowTripPlanningUI */
export function shouldShowProfilePanels(
  ts: TravelState | null,
  _showItineraryPanel = false
): boolean {
  return shouldShowTripPlanningUI(ts);
}

export function syncUiFromTravelState(ts: TravelState | null) {
  const ui = sharedSyncUiFromTravelState(ts);
  return {
    ...ui,
    travelState: ui.travelState as TravelState | null,
  };
}

export { shouldShowStopsPanel as shouldShowItineraryPanel };
