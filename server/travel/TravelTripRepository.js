/**
 * Trip persistence helpers — load/save travel_state without duplicating route boilerplate.
 */
import { pool, rowToTrip } from '../db.js';
import {
  createInitialTravelState,
  migrateDraftToTravelState,
  isProfileComplete,
  isPanelProfileComplete,
  shouldShowPreferencePanels,
  shouldShowItineraryPanel,
} from './defaultState.js';
import { sanitizeTravelState } from './profileSanitize.js';

/**
 * Load a trip row by id.
 * @param {string} tripId
 */
export async function loadTripRow(tripId) {
  const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
  return rows[0] ?? null;
}

/**
 * Resolve canonical TravelState from a DB row (migrate legacy draft when needed).
 * @param {object} row
 */
export function resolveTravelStateFromRow(row) {
  let travelState = row.travel_state;
  if (!travelState || Object.keys(travelState).length === 0) {
    travelState = migrateDraftToTravelState(row.draft ?? {});
  }
  if (!travelState.version) {
    travelState = createInitialTravelState();
  }
  sanitizeTravelState(travelState);
  return travelState;
}

/**
 * @param {string} tripId
 */
export async function loadTravelState(tripId) {
  const row = await loadTripRow(tripId);
  if (!row) return { row: null, travelState: null };
  return { row, travelState: resolveTravelStateFromRow(row) };
}

/**
 * Persist travel_state only (no legacy draft dual-write).
 * @param {string} tripId
 * @param {object} travelState
 * @param {object} [extra] Additional SET columns: { itinerary_status, phase, step, ... }
 */
export async function saveTravelState(tripId, travelState, extra = {}) {
  const sets = ['travel_state = $2::jsonb', 'updated_at = NOW()'];
  const values = [tripId, JSON.stringify(travelState)];
  let idx = 3;

  const columnMap = {
    itinerary_status: 'text',
    phase: 'text',
    step: 'text',
    itinerary: 'jsonb',
    chat_messages: 'jsonb',
    destination: 'text',
    destination_normalized: 'text',
    duration_days: 'integer',
    period_raw: 'text',
    current_day: 'integer',
    draft: 'jsonb',
  };

  for (const [key, type] of Object.entries(columnMap)) {
    if (!(key in extra)) continue;
    const value = extra[key];
    if (value === undefined) continue;
    sets.push(`${key} = $${idx}::${type}`);
    values.push(type === 'jsonb' && value !== null ? JSON.stringify(value) : value);
    idx += 1;
  }

  if ('destination' in extra && !('destination_normalized' in extra)) {
    sets.push(`destination_normalized = $${idx}`);
    values.push(extra.destination);
    idx += 1;
  }

  const { rows } = await pool.query(
    `UPDATE trips SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  return rowToTrip(rows[0]);
}

/**
 * Build travel API response flags from state.
 * @param {object} travelState
 */
export function buildTravelUiFlags(travelState) {
  return {
    travel_phase: travelState.travel_phase,
    profileComplete: isProfileComplete(travelState.profile),
    panelProfileComplete: isPanelProfileComplete(travelState.profile),
    showItineraryPanel: shouldShowItineraryPanel(travelState),
    showProfilePanels: shouldShowPreferencePanels(travelState.profile),
    itineraryStale: Boolean(travelState.itineraryStale),
  };
}
