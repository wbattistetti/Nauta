-- Allow intake_dialog step on existing databases
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_step_check;
ALTER TABLE trips ADD CONSTRAINT trips_step_check CHECK (step IN (
  'intake_dialog',
  'F1_destination', 'F1_duration', 'F1_period', 'F1_complete',
  'F2_style', 'F2_ritmo', 'F2_budget', 'F2_alloggi', 'F2_preferenze', 'F2_complete',
  'F3_generate', 'F3_explain', 'F3_complete',
  'F4_review_1', 'F4_review_2', 'F4_review_3', 'F4_complete',
  'F5_render', 'F5_complete',
  'F6_prenotazioni', 'F6_complete',
  'F7_page_analysis', 'F7_complete'
));
ALTER TABLE trips ALTER COLUMN step SET DEFAULT 'intake_dialog';
