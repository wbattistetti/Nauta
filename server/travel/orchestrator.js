/**
 * Deterministic TravelState updates from Reasoner actions + phase transitions.
 */
import { randomUUID } from 'crypto';
import { expandStopsToDays } from './expandStopsToDays.js';
import { annotateStopsCompatibility } from './stopCompatibility.js';
import { normalizeTheme, normalizeThemeList } from './themes.js';
import { isProfileComplete } from './defaultState.js';
import { applyTravelerPresetIfNeeded } from './travelerPresets.js';
import { expandPeriodInPatch, sanitizeTravelState, sanitizeUserProfile } from './profileSanitize.js';

/**
 * @param {import('./types.js').TravelState} state
 * @param {import('./reasonerSchema.js').parseReasonerJson extends Function ? ReturnType<import('./reasonerSchema.js').parseReasonerJson> : never} reasoner
 * @param {{ stops?: import('./types.js').TravelStop[], summary?: string }} [plannerResult]
 */
export function applyOrchestrator(state, reasoner, plannerResult) {
  let next = structuredClone(state);
  let needsPlanner = reasoner.needsPlanner;
  let plannerTask = reasoner.plannerTask;

  for (const action of reasoner.actions) {
    const r = applyAction(next, action, plannerResult);
    next = r.state;
    if (r.needsPlanner) {
      needsPlanner = true;
      plannerTask = r.plannerTask ?? plannerTask;
    }
  }

  if (plannerResult?.stops?.length) {
    next.itinerary.stops = annotateStopsCompatibility(plannerResult.stops, next.profile);
    if (plannerResult.summary) next.itinerary.summary = plannerResult.summary;
    if (next.travel_phase === 'phase1' && isProfileComplete(next.profile)) {
      next.travel_phase = 'phase2';
    }
  }

  next.itinerary.stops = annotateStopsCompatibility(next.itinerary.stops, next.profile);
  next.lastReasonerIntent = reasoner.intent;
  evaluatePhases(next);
  sanitizeTravelState(next);

  return { state: next, needsPlanner, plannerTask };
}

/**
 * @param {import('./types.js').TravelState} state
 * @param {object} action
 * @param {{ stops?: import('./types.js').TravelStop[] }} [plannerResult]
 */
function applyAction(state, action, plannerResult) {
  switch (action.type) {
    case 'update_profile': {
      mergeProfile(state.profile, action.patch);
      applyTravelerPresetIfNeeded(state);
      if (isProfileComplete(state.profile) && state.travel_phase === 'phase1') {
        state.travel_phase = 'phase2';
      }
      return { state };
    }
    case 'generate_initial_itinerary':
      return { state, needsPlanner: true, plannerTask: 'generate_initial' };
    case 'recalculate_itinerary':
      return { state, needsPlanner: true, plannerTask: 'recalculate' };
    case 'propose_stop_replacement':
      return { state, needsPlanner: true, plannerTask: 'replacement_candidates' };
    case 'confirm_stop_replacement': {
      const pending = state.pendingReplacement;
      if (pending && pending.stopId === action.stopId) {
        const cand = pending.candidates.find((c) => c.id === action.candidateId);
        if (cand) {
          const idx = state.itinerary.stops.findIndex((s) => s.id === action.stopId);
          if (idx >= 0) {
            const old = state.itinerary.stops[idx];
            state.itinerary.stops[idx] = {
              id: old.id,
              name: cand.name,
              region: cand.region,
              days: old.days,
              themes: cand.themes,
              primaryTheme: cand.themes[0] ?? old.primaryTheme,
              notes: old.notes,
            };
          }
        }
        state.pendingReplacement = null;
      }
      return { state };
    }
    case 'confirm_itinerary': {
      if (state.itinerary.stops.length > 0 && !state.locked) {
        state.locked = true;
        state.itinerary.days = expandStopsToDays(state.itinerary.stops);
        state.travel_phase = 'phase4';
      }
      return { state };
    }
    case 'adjust_stop_days': {
      const s = state.itinerary.stops.find((x) => x.id === action.stopId);
      if (s) s.days = action.days;
      return { state };
    }
    case 'remove_stop': {
      state.itinerary.stops = state.itinerary.stops.filter((s) => s.id !== action.stopId);
      return { state };
    }
    case 'add_stop': {
      const themes = normalizeThemeList(action.themes ?? []);
      const primary = themes[0] ?? 'museums';
      state.itinerary.stops.push({
        id: randomUUID(),
        name: action.name,
        days: action.days,
        themes: themes.length ? themes : [primary],
        primaryTheme: primary,
      });
      if (state.travel_phase === 'phase1') state.travel_phase = 'phase2';
      return { state };
    }
    case 'none':
    default:
      return { state };
  }
}

/** @param {import('./types.js').TravelState} state */
function evaluatePhases(state) {
  if (state.locked) {
    state.travel_phase = 'phase4';
    return;
  }
  if (state.itinerary.stops.length > 0 && isProfileComplete(state.profile)) {
    if (state.travel_phase === 'phase1') {
      state.travel_phase = 'phase2';
    }
  }
}

/** @param {import('./types.js').UserProfile} profile @param {Record<string, unknown>} patch */
function mergeProfile(profile, patch) {
  const expanded = expandPeriodInPatch(patch);
  const merged = sanitizeUserProfile({ ...profile, ...expanded });
  Object.assign(profile, merged);
}

/**
 * @param {import('./types.js').TravelStop[]} stops
 * @param {number} totalDays
 */
export function normalizeStopDayTotals(stops, totalDays) {
  if (!stops.length || !totalDays) return stops;
  const sum = stops.reduce((a, s) => a + (s.days || 1), 0);
  if (sum === totalDays) return stops;

  const result = stops.map((s) => ({
    ...s,
    days: Math.max(1, Math.round(((s.days || 1) / sum) * totalDays)),
  }));
  let newSum = result.reduce((a, s) => a + s.days, 0);
  while (newSum > totalDays) {
    const i = result.findIndex((s) => s.days > 1);
    if (i < 0) break;
    result[i].days -= 1;
    newSum -= 1;
  }
  while (newSum < totalDays) {
    result[result.length - 1].days += 1;
    newSum += 1;
  }
  return result;
}
