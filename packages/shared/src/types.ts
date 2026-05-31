/**
 * Minimal travel profile/state types shared between client and server.
 */

export type TravelPhase = 'phase1' | 'phase2' | 'phase3' | 'phase4';

export type UserProfile = {
  destination?: string;
  durationDays?: number | null;
  period?: string;
  periodStart?: string;
  periodEnd?: string;
  periodFlexible?: boolean;
  periodStartToleranceDays?: number;
  periodEndToleranceDays?: number;
  style?: string;
  ritmo?: string;
  budget?: string;
  alloggi?: string;
  preferenze?: string;
  travelerType?: string;
  ageBand?: string;
  preferencesPresetId?: string;
  panelsReviewed?: boolean;
  likes?: string[];
  dislikes?: string[];
};

export type TravelStop = {
  id: string;
  name: string;
  region?: string;
  days: number;
};

export type TravelState = {
  version?: number;
  travel_phase: TravelPhase;
  profile: UserProfile;
  itinerary: {
    stops: TravelStop[];
    days: unknown[];
    summary?: string;
  };
  locked: boolean;
  pendingReplacement?: unknown | null;
  itineraryStale?: boolean;
  itineraryHistory?: unknown[];
  lastReasonerIntent?: string;
};
