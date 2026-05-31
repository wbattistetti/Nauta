/**
 * UI visibility flags derived from TravelState — shared client/server.
 */
import { isTravelFactsComplete, isTravelerProfileComplete } from './profileGates.js';
import type { TravelState } from './types.js';

/** Itinerary accordion visible when stops exist and trip not locked. */
export function shouldShowItineraryPanel(state: TravelState | null | undefined): boolean {
  if (!state || state.locked || state.travel_phase === 'phase4') return false;
  return state.itinerary.stops.length > 0;
}

export function shouldShowDayPanels(state: TravelState | null | undefined): boolean {
  if (!state) return false;
  return state.travel_phase === 'phase4' && state.locked && state.itinerary.days.length > 0;
}

/** Planning accordions: after facts + traveler (preset may fill panels). */
export function shouldShowTripPlanningUI(state: TravelState | null | undefined): boolean {
  if (!state || state.locked || state.travel_phase === 'phase4') return false;
  return isTravelFactsComplete(state.profile) && isTravelerProfileComplete(state.profile);
}

export function syncUiFromTravelState(state: TravelState | null | undefined) {
  const showItineraryPanel = shouldShowItineraryPanel(state);
  return {
    travelState: state ?? null,
    showItineraryPanel,
    showDayPanels: shouldShowDayPanels(state),
    showProfilePanels: shouldShowTripPlanningUI(state),
    showTripPlanningUI: shouldShowTripPlanningUI(state),
  };
}
