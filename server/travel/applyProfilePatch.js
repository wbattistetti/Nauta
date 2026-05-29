/**
 * Apply profile panel selections to TravelState (no AI).
 */
import { sanitizeTravelState, sanitizeUserProfile } from './profileSanitize.js';
import { isProfileComplete } from './defaultState.js';
import { annotateStopsCompatibility } from './stopCompatibility.js';
import { applyTravelerPresetIfNeeded } from './travelerPresets.js';

/**
 * @param {import('./types.js').TravelState} state
 * @param {Partial<import('./types.js').UserProfile>} patch
 */
export function applyProfilePatch(state, patch) {
  const merged = sanitizeUserProfile({
    ...state.profile,
    ...patch,
    likes: patch.likes ?? state.profile.likes,
    dislikes: patch.dislikes ?? state.profile.dislikes,
  });

  state.profile = merged;
  applyTravelerPresetIfNeeded(state);

  if (state.itinerary.stops.length) {
    state.itinerary.stops = annotateStopsCompatibility(state.itinerary.stops, state.profile);
  }

  if (state.itinerary.stops.length > 0 && state.travel_phase === 'phase1') {
    state.travel_phase = 'phase2';
  }

  sanitizeTravelState(state);
  return state;
}
