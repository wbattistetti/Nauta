/** PostgreSQL pool for Nauta. */
import pg from 'pg';
import dotenv from 'dotenv';
import { sanitizeTravelState } from './travel/profileSanitize.js';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL mancante — usa server/.env');
}

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://postgres:nauta@localhost:5432/nauta_dev',
});

export async function checkDb() {
  const r = await pool.query('SELECT 1 AS ok');
  return r.rows[0]?.ok === 1;
}

/** Maps DB row → API TripRecord shape. */
export function rowToTrip(row) {
  const draft = row.draft ?? {};
  let travelState = row.travel_state ?? {};
  if (travelState?.version === 1 && travelState.profile) {
    travelState = structuredClone(travelState);
    sanitizeTravelState(travelState);
  }
  return {
    id: row.id,
    phase: row.phase,
    step: row.step,
    status: row.status,
    draft,
    travel_state: travelState,
    itinerary_status: row.itinerary_status ?? 'draft',
    itinerary: row.itinerary ?? draft.itinerary ?? null,
    chat_messages: row.chat_messages ?? [],
    destination: row.destination,
    destination_raw: row.destination_raw,
    destination_normalized: row.destination_normalized,
    duration_days: row.duration_days,
    duration_raw: row.duration_raw,
    period_raw: row.period_raw,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
