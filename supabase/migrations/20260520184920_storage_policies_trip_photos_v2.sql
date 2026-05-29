/*
  # Storage RLS policies per bucket trip-photos
*/
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Allow public read trip-photos' AND tablename='objects') THEN
    CREATE POLICY "Allow public read trip-photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'trip-photos');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Allow public insert trip-photos' AND tablename='objects') THEN
    CREATE POLICY "Allow public insert trip-photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'trip-photos');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Allow public delete trip-photos' AND tablename='objects') THEN
    CREATE POLICY "Allow public delete trip-photos" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'trip-photos');
  END IF;
END $$;
