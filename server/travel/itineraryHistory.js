/**
 * Itinerary version history & profile/itinerary sync (manual recalculate only).
 */
import { createHash, randomUUID } from 'crypto';
import { sanitizeUserProfile } from './profileSanitize.js';
import {
  buildItineraryVersionPayoff,
  profileSnapshotFromProfile,
} from './itineraryVersionPayoff.js';

const MAX_VERSIONS = 20;

/**
 * Stable fingerprint of fields that affect planner output.
 * @param {import('./types.js').UserProfile} profile
 */
export function profilePlannerFingerprint(profile) {
  const p = sanitizeUserProfile(profile);
  const payload = JSON.stringify({
    destination: p.destination ?? '',
    durationDays: p.durationDays ?? null,
    likes: [...(p.likes ?? [])].sort(),
    dislikes: [...(p.dislikes ?? [])].sort(),
    style: (p.style ?? p.ritmo ?? '').toLowerCase(),
    budget: (p.budget ?? '').toLowerCase(),
  });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

/**
 * @param {import('./types.js').TravelState} state
 */
export function ensureItineraryHistoryFields(state) {
  if (!Array.isArray(state.itineraryHistory)) state.itineraryHistory = [];
  if (state.itineraryStale !== true && state.itineraryStale !== false) {
    state.itineraryStale = false;
  }
}

/**
 * After profile patch: flag stale when stops exist and fingerprint changed.
 * @param {import('./types.js').TravelState} state
 */
export function markItineraryStaleAfterProfileChange(state) {
  ensureItineraryHistoryFields(state);
  if (state.locked || state.itinerary.stops.length === 0) {
    state.itineraryStale = false;
    return;
  }
  const fp = profilePlannerFingerprint(state.profile);
  if (!state.profilePlannerFingerprint) {
    state.profilePlannerFingerprint = fp;
    state.itineraryStale = false;
    return;
  }
  state.itineraryStale = fp !== state.profilePlannerFingerprint;
}

/**
 * @param {import('./types.js').TravelState} state
 */
export function clearItineraryStale(state) {
  ensureItineraryHistoryFields(state);
  state.itineraryStale = false;
  state.profilePlannerFingerprint = profilePlannerFingerprint(state.profile);
}

/**
 * @param {import('./types.js').TravelState} state
 * @returns {import('./types.js').ItineraryVersion|null}
 */
export function buildVersionFromCurrent(state) {
  if (!state.itinerary.stops?.length) return null;
  ensureItineraryHistoryFields(state);
  const n = state.itineraryHistory.length + 1;
  const profile = sanitizeUserProfile(state.profile);
  const stopCount = state.itinerary.stops.length;
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    label: `Itinerario ${n}`,
    stops: structuredClone(state.itinerary.stops),
    summary: state.itinerary.summary,
    profileFingerprint: state.profilePlannerFingerprint ?? profilePlannerFingerprint(profile),
    profileSnapshot: profileSnapshotFromProfile(profile),
    payoffSummary: buildItineraryVersionPayoff(profile, stopCount),
  };
}

/**
 * Save current itinerary to history before replacing it.
 * @param {import('./types.js').TravelState} state
 */
export function pushCurrentItineraryToHistory(state) {
  const version = buildVersionFromCurrent(state);
  if (!version) return;
  ensureItineraryHistoryFields(state);
  state.itineraryHistory = [...state.itineraryHistory, version].slice(-MAX_VERSIONS);
}

/**
 * @param {import('./types.js').TravelState} state
 * @param {string} versionId
 * @returns {boolean}
 */
export function restoreItineraryVersion(state, versionId) {
  ensureItineraryHistoryFields(state);
  const version = state.itineraryHistory.find((v) => v.id === versionId);
  if (!version) return false;

  state.itinerary.stops = structuredClone(version.stops);
  if (version.summary != null) state.itinerary.summary = version.summary;
  state.activeItineraryVersionId = versionId;

  const fp = profilePlannerFingerprint(state.profile);
  state.itineraryStale = fp !== version.profileFingerprint;
  return true;
}

/**
 * First planner success — baseline fingerprint, not stale.
 * @param {import('./types.js').TravelState} state
 */
export function onItineraryGenerated(state) {
  ensureItineraryHistoryFields(state);
  state.profilePlannerFingerprint = profilePlannerFingerprint(state.profile);
  state.itineraryStale = false;
  state.activeItineraryVersionId = undefined;
}
