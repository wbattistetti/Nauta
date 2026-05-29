-- =============================================================================
-- NAUTA — Schema PostgreSQL completo (14+)
-- Locale (nauta_dev) / Neon produzione
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- trips — tabella principale
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  phase TEXT NOT NULL DEFAULT 'F1'
    CHECK (phase IN ('F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7')),
  step TEXT NOT NULL DEFAULT 'intake_dialog'
    CHECK (step IN (
      'intake_dialog', 'intake_review',
      'F1_destination', 'F1_duration', 'F1_period', 'F1_complete',
      'F2_style', 'F2_ritmo', 'F2_budget', 'F2_alloggi', 'F2_preferenze', 'F2_complete',
      'F3_generate', 'F3_explain', 'F3_complete',
      'F4_review_1', 'F4_review_2', 'F4_review_3', 'F4_complete',
      'F5_render', 'F5_complete',
      'F6_prenotazioni', 'F6_complete',
      'F7_page_analysis', 'F7_complete'
    )),
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'onboarding', 'complete', 'planning')),
  current_day INTEGER CHECK (current_day IS NULL OR current_day > 0),
  review_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  bookings JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_page_analysis TEXT,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  travel_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  itinerary_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (itinerary_status IN ('draft', 'confirmed', 'logistics_ready')),
  itinerary JSONB,
  chat_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  destination TEXT,
  destination_raw TEXT,
  destination_normalized TEXT,
  duration_days INTEGER,
  duration_raw TEXT,
  period_raw TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE trips IS 'Viaggio Nauta: stato fase/step + payload JSON';

CREATE INDEX IF NOT EXISTS idx_trips_phase ON trips (phase);
CREATE INDEX IF NOT EXISTS idx_trips_step ON trips (step);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips (status);
CREATE INDEX IF NOT EXISTS idx_trips_updated_at ON trips (updated_at DESC);

-- -----------------------------------------------------------------------------
-- trip_onboarding — Fase 1
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_onboarding (
  trip_id UUID PRIMARY KEY REFERENCES trips (id) ON DELETE CASCADE,
  destination_raw TEXT,
  destination_normalized TEXT,
  duration_raw TEXT,
  duration_days INTEGER,
  period_raw TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- trip_preferences — Fase 2
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_preferences (
  trip_id UUID PRIMARY KEY REFERENCES trips (id) ON DELETE CASCADE,
  style TEXT,
  ritmo TEXT,
  budget TEXT,
  alloggi TEXT,
  preferenze TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- trip_itinerary — Fase 3
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_itinerary (
  trip_id UUID PRIMARY KEY REFERENCES trips (id) ON DELETE CASCADE,
  itinerary JSONB NOT NULL DEFAULT '{"days":[]}'::jsonb,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- trip_days — Fase 5
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number > 0),
  title TEXT NOT NULL,
  sleep TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_trip_days_day_number ON trip_days (day_number);
CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days (trip_id);

-- -----------------------------------------------------------------------------
-- trip_stops
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_day_id UUID NOT NULL REFERENCES trip_days (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_day_id ON trip_stops (trip_day_id);

-- -----------------------------------------------------------------------------
-- trip_messages — chat per viaggio
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_messages_trip_id_created_at
  ON trip_messages (trip_id, created_at);
