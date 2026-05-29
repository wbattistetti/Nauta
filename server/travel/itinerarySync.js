/**
 * Sync itinerary with profile — initial generation or manual recalculate.
 */
import { isReadyForItineraryGeneration } from './defaultState.js';
import { runPlanner } from './planner.js';
import { annotateStopsCompatibility } from './stopCompatibility.js';
import { sanitizeTravelState } from './profileSanitize.js';
import { applyOrchestrator } from './orchestrator.js';
import {
  clearItineraryStale,
  onItineraryGenerated,
  pushCurrentItineraryToHistory,
} from './itineraryHistory.js';

/**
 * @param {import('./types.js').TravelState} state
 * @param {string} tripId
 * @returns {Promise<import('./types.js').TravelState>}
 */
export async function maybeAutoGenerateStops(state, tripId) {
  if (
    !isReadyForItineraryGeneration(state.profile) ||
    state.itinerary.stops.length > 0 ||
    state.locked
  ) {
    return state;
  }

  try {
    const plannerResult = await runPlanner('generate_initial', state, {}, tripId);
    if (plannerResult.stops?.length) {
      state.itinerary.stops = annotateStopsCompatibility(plannerResult.stops, state.profile);
      if (plannerResult.summary) state.itinerary.summary = plannerResult.summary;
      if (state.travel_phase === 'phase1') state.travel_phase = 'phase2';
      onItineraryGenerated(state);
      sanitizeTravelState(state);
    }
  } catch (e) {
    console.warn('[maybeAutoGenerateStops]', e.message);
  }
  return state;
}

/**
 * @param {import('./types.js').TravelState} state
 * @param {string} tripId
 * @returns {Promise<import('./types.js').TravelState>}
 */
/**
 * Manual recalculate — saves previous itinerary to history, then runs planner.
 * @param {import('./types.js').TravelState} state
 * @param {string} tripId
 * @returns {Promise<{ state: import('./types.js').TravelState, ok: boolean, error?: string }>}
 */
export async function recalculateItineraryWithHistory(state, tripId) {
  if (!isReadyForItineraryGeneration(state.profile)) {
    return { state, ok: false, error: 'Profilo incompleto per rigenerare l\'itinerario' };
  }
  if (state.locked) {
    return { state, ok: false, error: 'Itinerario già confermato' };
  }

  if (state.itinerary.stops.length === 0) {
    const next = await maybeAutoGenerateStops(state, tripId);
    return { state: next, ok: next.itinerary.stops.length > 0 };
  }

  try {
    pushCurrentItineraryToHistory(state);
    const plannerResult = await runPlanner('recalculate', state, {}, tripId);
    if (plannerResult.stops?.length) {
      const noopReasoner = {
        intent: 'profile_recalculate',
        actions: [{ type: 'none' }],
        clarificationsNeeded: [],
        needsPlanner: false,
        plannerTask: null,
        plannerContext: {},
      };
      const { state: next } = applyOrchestrator(state, noopReasoner, plannerResult);
      Object.assign(state, next);
      clearItineraryStale(state);
      state.activeItineraryVersionId = undefined;
      sanitizeTravelState(state);
      return { state, ok: true };
    }
    return { state, ok: false, error: 'Nessuna tappa generata' };
  } catch (e) {
    console.warn('[recalculateItineraryWithHistory]', e.message);
    return { state, ok: false, error: e.message };
  }
}

/** @deprecated Use recalculateItineraryWithHistory — no auto recalc on profile patch. */
export async function maybeRecalculateItinerary(state, tripId) {
  return (await recalculateItineraryWithHistory(state, tripId)).state;
}
