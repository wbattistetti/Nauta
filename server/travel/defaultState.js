/**
 * Initial TravelState and migration from legacy draft.
 */
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
/** Themes + style + budget from panels (not chat). */
export function isPanelProfileComplete(profile) {
  const p = sanitizeUserProfile(profile);
  return Boolean(p.likes?.length >= 1 && p.style?.trim() && p.budget?.trim());
}

/** Chat: companion + age band (after travel facts). */
export function isTravelerProfileComplete(profile) {
  const p = sanitizeUserProfile(profile);
  return Boolean(p.travelerType && p.ageBand);
}

/** Show preference panels after facts + traveler profile (even if itinerary exists). */
export function shouldShowPreferencePanels(profile) {
  return isTravelFactsComplete(profile) && isTravelerProfileComplete(profile);
}

/** Itinerary accordion visible when stops exist and trip not locked. */
export function shouldShowItineraryPanel(state) {
  if (!state || state.locked || state.travel_phase === 'phase4') return false;
  return state.itinerary.stops.length > 0;
}

/** Chat: destination, days, period. */
export function isTravelFactsComplete(profile) {
  const p = sanitizeUserProfile(profile);
  const hasPeriod = Boolean(p.period || (p.periodStart && p.periodEnd));
  return Boolean(p.destination && p.durationDays && p.durationDays > 0 && hasPeriod);
}

/** Optional UX flag — not required for itinerary generation. */
export function isPanelsReviewed(profile) {
  return sanitizeUserProfile(profile).panelsReviewed === true;
}

/** Preset-filled profile ready for planner (facts + traveler + panel fields). */
export function isReadyForItineraryGeneration(profile) {
  return (
    isTravelFactsComplete(profile) &&
    isTravelerProfileComplete(profile) &&
    isPanelProfileComplete(profile)
  );
}

export function isProfileComplete(profile) {
  return isReadyForItineraryGeneration(profile);
}
