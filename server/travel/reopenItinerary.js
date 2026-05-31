/**
 * Unlock itinerary — return from phase4 day detail to planning accordions.
 */

/**
 * @param {import('./types.js').TravelState} state
 * @returns {import('./types.js').TravelState}
 */
export function reopenItinerary(state) {
  if (!state.locked) return state;

  state.locked = false;
  state.itinerary.days = [];
  state.travel_phase =
    state.itinerary.stops.length > 0 && state.profile?.destination ? 'phase3' : 'phase2';
  return state;
}
