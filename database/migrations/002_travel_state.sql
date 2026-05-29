-- Travel Agent: stato strutturato + stato itinerario
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS travel_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS itinerary_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (itinerary_status IN ('draft', 'confirmed', 'logistics_ready'));

COMMENT ON COLUMN trips.travel_state IS 'TravelState JSON — fonte di verità agente viaggio';
COMMENT ON COLUMN trips.itinerary_status IS 'draft | confirmed | logistics_ready';

CREATE INDEX IF NOT EXISTS idx_trips_itinerary_status ON trips (itinerary_status);
