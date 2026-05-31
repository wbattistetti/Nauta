/**
 * Initial TravelState and migration from legacy draft.
 */
import {
  isPanelProfileComplete as sharedIsPanelProfileComplete,
  isTravelFactsComplete as sharedIsTravelFactsComplete,
  isTravelerProfileComplete as sharedIsTravelerProfileComplete,
  isPanelsReviewed as sharedIsPanelsReviewed,
  isReadyForItineraryGeneration as sharedIsReadyForItineraryGeneration,
  isProfileComplete as sharedIsProfileComplete,
  shouldShowPreferencePanels as sharedShouldShowPreferencePanels,
} from '@nauta/shared/profileGates';
import {
  shouldShowItineraryPanel as sharedShouldShowItineraryPanel,
} from '@nauta/shared/travelUiFlags';
import { themesFromPreferenze } from './themes.js';
import { sanitizeUserProfile } from './profileSanitize.js';

/** @returns {import('./types.js').TravelState} */
export function createInitialTravelState() {
  return {
    version: 1,
    travel_phase: 'phase1',
    profile: {
      likes: [],
      dislikes: [],
    },
    itinerary: { stops: [], days: [] },
    locked: false,
    pendingReplacement: null,
    itineraryHistory: [],
    itineraryStale: false,
  };
}

/** @param {Record<string, unknown>} draft */
export function migrateDraftToTravelState(draft) {
  const base = createInitialTravelState();
  const { likes, dislikes } = themesFromPreferenze(
    typeof draft.preferenze === 'string' ? draft.preferenze : ''
  );

  base.profile = sanitizeUserProfile({
    destination: draft.destinationNormalized ?? draft.destination,
    durationDays: draft.durationDays,
    period: draft.periodNormalized ?? draft.periodRaw,
    periodStart: draft.periodStart,
    periodEnd: draft.periodEnd,
    style: draft.style,
    ritmo: draft.ritmo,
    budget: draft.budget,
    alloggi: draft.alloggi,
    preferenze: draft.preferenze,
    likes,
    dislikes,
  });

  const hasProfile = Boolean(base.profile.destination && base.profile.durationDays);
  if (hasProfile && draft.style) {
    base.travel_phase = 'phase2';
  }

  return base;
}

/** @param {import('./types.js').UserProfile} profile */
export function isPanelProfileComplete(profile) {
  return sharedIsPanelProfileComplete(sanitizeUserProfile(profile));
}

/** @param {import('./types.js').UserProfile} profile */
export function isTravelerProfileComplete(profile) {
  return sharedIsTravelerProfileComplete(sanitizeUserProfile(profile));
}

/** @param {import('./types.js').UserProfile} profile */
export function shouldShowPreferencePanels(profile) {
  return sharedShouldShowPreferencePanels(sanitizeUserProfile(profile));
}

/** @param {import('./types.js').TravelState} state */
export function shouldShowItineraryPanel(state) {
  return sharedShouldShowItineraryPanel(state);
}

/** @param {import('./types.js').UserProfile} profile */
export function isTravelFactsComplete(profile) {
  return sharedIsTravelFactsComplete(sanitizeUserProfile(profile));
}

/** @param {import('./types.js').UserProfile} profile */
export function isPanelsReviewed(profile) {
  return sharedIsPanelsReviewed(sanitizeUserProfile(profile));
}

/** @param {import('./types.js').UserProfile} profile */
export function isReadyForItineraryGeneration(profile) {
  return sharedIsReadyForItineraryGeneration(sanitizeUserProfile(profile));
}

/** @param {import('./types.js').UserProfile} profile */
export function isProfileComplete(profile) {
  return sharedIsProfileComplete(sanitizeUserProfile(profile));
}
