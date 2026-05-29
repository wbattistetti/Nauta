/**
 * Lightweight idempotent schema patches at startup.
 */
import { pool } from './db.js';

export async function runTravelStateMigration() {
  await pool.query(`
    ALTER TABLE trips
      ADD COLUMN IF NOT EXISTS travel_state JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);
  await pool.query(`
    ALTER TABLE trips
      ADD COLUMN IF NOT EXISTS itinerary_status TEXT NOT NULL DEFAULT 'draft';
  `);
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE trips ADD CONSTRAINT trips_itinerary_status_check
        CHECK (itinerary_status IN ('draft', 'confirmed', 'logistics_ready'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}
