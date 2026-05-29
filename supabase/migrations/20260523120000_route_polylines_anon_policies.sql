/*
  Allow anon read/write on route_polylines (personal trip app, no login).
  Matches day_notes / day_photos policies.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'route_polylines' AND policyname = 'Allow select route_polylines'
  ) THEN
    CREATE POLICY "Allow select route_polylines"
      ON route_polylines FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'route_polylines' AND policyname = 'Allow insert route_polylines'
  ) THEN
    CREATE POLICY "Allow insert route_polylines"
      ON route_polylines FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;
