/**
 * Unified trip planner types: TripPhase + TripStep across DB, edge, and UI.
 */

export type TripPhase = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7';

export type TripStep =
  | 'intake_dialog'
  | 'intake_review'
  | 'F1_destination'
  | 'F1_duration'
  | 'F1_period'
  | 'F1_complete'
  | 'F2_style'
  | 'F2_ritmo'
  | 'F2_budget'
  | 'F2_alloggi'
  | 'F2_preferenze'
  | 'F2_complete'
  | 'F3_generate'
  | 'F3_explain'
  | 'F3_complete'
  | 'F4_review_1'
  | 'F4_review_2'
  | 'F4_review_3'
  | 'F4_complete'
  | 'F5_render'
  | 'F5_complete'
  | 'F6_prenotazioni'
  | 'F6_complete'
  | 'F7_page_analysis'
  | 'F7_complete';

export type TripStatus = 'in_progress' | 'completed';

export type AiIntent =
  | 'provide_destination'
  | 'provide_duration'
  | 'provide_period'
  | 'provide_style'
  | 'provide_ritmo'
  | 'provide_budget'
  | 'provide_alloggi'
  | 'provide_preferenze'
  | 'confirm'
  | 'reject'
  | 'clarify'
  | 'unsure'
  | 'continue'
  | 'review'
  | 'explore_day'
  | 'bookings'
  | 'page_analysis'
  | 'collect'
  | 'other';

export type AiNormalized = {
  destination?: string;
  duration?: string;
  durationDays?: number | null;
  period?: string;
  periodStart?: string;
  periodEnd?: string;
  style?: string;
  ritmo?: string;
  budget?: string;
  alloggi?: string;
  preferenze?: string;
  criteriaExplanation?: string;
  currentDay?: number;
  analysis?: string;
};

export type PendingConfirmation = {
  field: string;
  value: string;
};

export type TripItineraryStop = {
  name: string;
  time?: string;
};

export type TripItineraryDay = {
  day: number;
  title: string;
  stops: TripItineraryStop[];
  sleep: string;
  notes?: string;
};

export type TripItinerary = {
  days: TripItineraryDay[];
  destination?: string;
  summary?: string;
};

export type TripBookingItem = {
  name: string;
  type: string;
  url?: string;
  notes?: string;
};

export type TripDraft = {
  destinationRaw?: string;
  durationRaw?: string;
  periodRaw?: string;
  destinationNormalized?: string;
  durationNormalized?: string;
  durationDays?: number | null;
  periodNormalized?: string;
  periodStart?: string;
  periodEnd?: string;
  style?: string;
  ritmo?: string;
  budget?: string;
  alloggi?: string;
  preferenze?: string;
  criteriaExplanation?: string;
  itinerary?: TripItinerary;
  reviewNotes?: string[];
  currentDay?: number;
  bookings?: TripBookingItem[];
  lastPageAnalysis?: string;
  lastIntent?: AiIntent;
  lastAmbiguities?: string[];
  pendingConfirmation?: PendingConfirmation | null;
};

export type TripRecord = {
  id: string;
  phase: TripPhase;
  step: TripStep;
  status: TripStatus;
  draft: TripDraft;
  travel_state?: Record<string, unknown>;
  itinerary_status?: 'draft' | 'confirmed' | 'logistics_ready';
  itinerary: TripItinerary | null;
  chat_messages: ChatMessage[];
  destination: string | null;
  destination_raw: string | null;
  destination_normalized: string | null;
  duration_days: number | null;
  duration_raw: string | null;
  period_raw: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatMode = 'trip';

/** AI-first dialog manager response (every user turn during intake). */
export type AiTripResult = {
  reply: string;
  intent: AiIntent;
  normalized: AiNormalized;
  deduced: AiNormalized;
  missing: string[];
  suggestions: string[];
  ambiguities: string[];
  pendingConfirmation: PendingConfirmation | null;
  intakeComplete: boolean;
  extracted: Record<string, unknown>;
  advanceTo: TripStep | null;
  itinerary?: TripItinerary;
};
