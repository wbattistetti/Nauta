/**
 * Travel Agent UI helpers — travel_phase is the single source of truth.
 */
import type { TravelPhase, TravelState, UserProfile } from '../../types/travelState';

export const TRAVEL_OPENER =
  'Ciao! Dimmi dove vorresti andare, per quanti giorni e in che periodo.';

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

export function travelPhaseFromState(ts: TravelState | null | undefined): TravelPhase {
  return ts?.travel_phase ?? 'phase1';
}

export function isTravelFactsComplete(profile: UserProfile | undefined): boolean {
  if (!profile) return false;
  const hasPeriod = Boolean(profile.period || (profile.periodStart && profile.periodEnd));
  return Boolean(
    profile.destination?.trim() &&
      profile.durationDays &&
      profile.durationDays > 0 &&
      hasPeriod
  );
}

export function isTravelerProfileComplete(profile: UserProfile | undefined): boolean {
  if (!profile) return false;
  return Boolean(profile.travelerType && profile.ageBand);
}

export function isPanelProfileComplete(profile: UserProfile | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    (profile.likes?.length ?? 0) >= 1 && profile.style?.trim() && profile.budget?.trim()
  );
}

export function isPanelsReviewed(profile: UserProfile | undefined): boolean {
  return profile?.panelsReviewed === true;
}

export function isProfileCompleteForTravel(profile: UserProfile | undefined): boolean {
  return (
    isTravelFactsComplete(profile) &&
    isTravelerProfileComplete(profile) &&
    isPanelProfileComplete(profile)
  );
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

export function shouldShowStopsPanel(ts: TravelState | null): boolean {
  if (!ts || ts.locked || ts.travel_phase === 'phase4') return false;
  return ts.itinerary.stops.length > 0;
}

export function shouldShowDayPanels(ts: TravelState | null): boolean {
  if (!ts) return false;
  return ts.travel_phase === 'phase4' && ts.locked && ts.itinerary.days.length > 0;
}

/** Planning accordions: after facts + traveler (preset may fill panels). */
export function shouldShowTripPlanningUI(ts: TravelState | null): boolean {
  if (!ts || ts.locked || ts.travel_phase === 'phase4') return false;
  return isTravelFactsComplete(ts.profile) && isTravelerProfileComplete(ts.profile);
}

/** @deprecated Use shouldShowTripPlanningUI */
export function shouldShowProfilePanels(
  ts: TravelState | null,
  _showItineraryPanel = false
): boolean {
  return shouldShowTripPlanningUI(ts);
}

export function syncUiFromTravelState(ts: TravelState | null) {
  const showItineraryPanel = shouldShowStopsPanel(ts);
  return {
    travelState: ts,
    showItineraryPanel,
    showDayPanels: shouldShowDayPanels(ts),
    showProfilePanels: shouldShowTripPlanningUI(ts),
    showTripPlanningUI: shouldShowTripPlanningUI(ts),
  };
}
