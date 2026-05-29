/*
  # Create route polylines cache table

  ## Purpose
  Cache OSRM-fetched route polylines per day so the routing API is called
  only once per day segment and subsequent loads are instant.

  ## New Tables
  - `route_polylines`
    - `id` (uuid, primary key)
    - `day_number` (integer, unique) — which day this segment belongs to
    - `coordinates` (jsonb) — array of [lat, lng] pairs from OSRM
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - SELECT policy: all authenticated users can read (shared trip data)
  - INSERT policy: authenticated users can insert (first load triggers fetch)
  - No UPDATE/DELETE: cache is write-once
*/

CREATE TABLE IF NOT EXISTS route_polylines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer UNIQUE NOT NULL,
  coordinates jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE route_polylines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read route polylines"
  ON route_polylines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert route polylines"
  ON route_polylines FOR INSERT
  TO authenticated
  WITH CHECK (true);
