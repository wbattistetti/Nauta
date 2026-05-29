/*
  # Trip onboarding — destination raw + normalized
*/

ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination_raw text;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination_normalized text;

UPDATE trips
SET destination_normalized = destination
WHERE destination IS NOT NULL
  AND destination_normalized IS NULL;
