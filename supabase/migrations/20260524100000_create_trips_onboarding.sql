/*
  # Trips table for new-trip onboarding (Fase 1)
  Stores minimal intake: destination, duration, period.
*/

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text,
  duration_days integer,
  duration_raw text,
  period_raw text,
  status text NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'complete', 'planning')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Allow select trips') THEN
    CREATE POLICY "Allow select trips" ON trips FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Allow insert trips') THEN
    CREATE POLICY "Allow insert trips" ON trips FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Allow update trips') THEN
    CREATE POLICY "Allow update trips" ON trips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Allow delete trips') THEN
    CREATE POLICY "Allow delete trips" ON trips FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;
