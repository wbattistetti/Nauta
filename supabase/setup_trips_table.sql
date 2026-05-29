-- Run manually in Supabase SQL Editor if migrations are not applied.

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase text NOT NULL DEFAULT 'F1',
  step text NOT NULL DEFAULT 'F1_destination',
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('onboarding', 'complete', 'planning', 'in_progress', 'completed')),
  draft jsonb NOT NULL DEFAULT '{}',
  itinerary jsonb,
  chat_messages jsonb NOT NULL DEFAULT '[]',
  destination text,
  destination_raw text,
  destination_normalized text,
  duration_days integer,
  duration_raw text,
  period_raw text,
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
