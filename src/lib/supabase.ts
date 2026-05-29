import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DayNote = {
  id: string;
  day_number: number;
  content: string;
  updated_at: string;
};

export type DayPhoto = {
  id: string;
  day_number: number;
  storage_path: string;
  caption: string;
  created_at: string;
};

export type TripRow = {
  id: string;
  destination: string | null;
  destination_raw: string | null;
  destination_normalized: string | null;
  duration_days: number | null;
  duration_raw: string | null;
  period_raw: string | null;
  status: 'onboarding' | 'complete' | 'planning';
  created_at: string;
  updated_at: string;
};
