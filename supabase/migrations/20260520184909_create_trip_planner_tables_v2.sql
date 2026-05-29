/*
  # Alaska Trip Planner – tabelle note e foto (idempotente)
  Crea le tabelle day_notes e day_photos se non esistono ancora,
  abilita RLS e aggiunge le policy necessarie per uso personale (anon + authenticated).
*/

CREATE TABLE IF NOT EXISTS day_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS day_notes_day_number_idx ON day_notes (day_number);

CREATE TABLE IF NOT EXISTS day_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL,
  storage_path text NOT NULL,
  caption text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE day_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_notes' AND policyname='Allow select day_notes') THEN
    CREATE POLICY "Allow select day_notes" ON day_notes FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_notes' AND policyname='Allow insert day_notes') THEN
    CREATE POLICY "Allow insert day_notes" ON day_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_notes' AND policyname='Allow update day_notes') THEN
    CREATE POLICY "Allow update day_notes" ON day_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_notes' AND policyname='Allow delete day_notes') THEN
    CREATE POLICY "Allow delete day_notes" ON day_notes FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_photos' AND policyname='Allow select day_photos') THEN
    CREATE POLICY "Allow select day_photos" ON day_photos FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_photos' AND policyname='Allow insert day_photos') THEN
    CREATE POLICY "Allow insert day_photos" ON day_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_photos' AND policyname='Allow update day_photos') THEN
    CREATE POLICY "Allow update day_photos" ON day_photos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='day_photos' AND policyname='Allow delete day_photos') THEN
    CREATE POLICY "Allow delete day_photos" ON day_photos FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;
