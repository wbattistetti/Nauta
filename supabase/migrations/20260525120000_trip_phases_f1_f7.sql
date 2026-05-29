/*
  # Trip planner phases F1–F7
  Extends trips with phase, step, draft jsonb, itinerary, chat_messages.
*/

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'F1',
  ADD COLUMN IF NOT EXISTS step text NOT NULL DEFAULT 'F1_destination',
  ADD COLUMN IF NOT EXISTS draft jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS itinerary jsonb,
  ADD COLUMN IF NOT EXISTS chat_messages jsonb NOT NULL DEFAULT '[]';

-- Widen status check (keep legacy values + new)
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE trips
  ADD CONSTRAINT trips_status_check
  CHECK (status IN ('onboarding', 'complete', 'planning', 'in_progress', 'completed'));

UPDATE trips SET status = 'in_progress' WHERE status = 'onboarding';
UPDATE trips SET status = 'completed' WHERE status = 'complete' AND step IS NULL;
UPDATE trips SET step = 'F1_destination' WHERE step IS NULL OR step = '';
UPDATE trips SET phase = 'F1' WHERE phase IS NULL OR phase = '';
