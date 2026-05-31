/**
 * Travel Agent state — phases 1–4, stops-first itinerary, logistics after lock.
 */

export type TravelPhase = 'phase1' | 'phase2' | 'phase3' | 'phase4';

export type ItineraryStatus = 'draft' | 'confirmed' | 'logistics_ready';

export type StopCompatibility = 'salvabile' | 'borderline' | 'incompatibile';

/** Named place in stop notes — links to Italian Wikipedia (server-validated). */
export type StopPlaceLink = {
  label: string;
  wikiTitle: string;
  /** Verified Wikipedia section anchor — optional. */
  wikiSection?: string;
  /** Human section title from Wikipedia — optional. */
  sectionTitle?: string;
};

/** Universal taxonomy (8 sections). Legacy IDs normalized on the server. */
export type TravelThemeId =
  | 'nature'
  | 'mountains'
  | 'beach'
  | 'wildlife'
  | 'nature_photo'
  | 'parks'
  // 2 Arte & Patrimonio
  | 'art_ancient'
  | 'art_modern'
  | 'museums'
  | 'architecture'
  | 'archaeology'
  // 3 Storia & Tradizioni
  | 'history_eras'
  | 'historic_sites'
  | 'traditions'
  | 'crafts'
  | 'festivals'
  // 4 Cibo
  | 'local_food'
  | 'street_food'
  | 'tastings'
  | 'food_markets'
  // 5 Vita & Lifestyle
  | 'nightlife'
  | 'shopping'
  | 'cafes'
  | 'design_fashion'
  // 6 Ritmo & Benessere
  | 'relax'
  | 'wellness'
  // 7 Avventura
  | 'trekking'
  | 'outdoor_sports'
  | 'adrenaline'
  | 'exploration'
  // 8 Target
  | 'family'
  | 'solo'
  | 'couples'
  | 'friends'
  // Legacy (migrated server-side)
  | 'culture'
  | 'history'
  | 'food'
  | 'adventure'
  | 'photography';

export type TravelStop = {
  id: string;
  name: string;
  region?: string;
  days: number;
  themes: TravelThemeId[];
  primaryTheme: TravelThemeId;
  notes?: string;
  placeLinks?: StopPlaceLink[];
  compatibility?: StopCompatibility;
};

export type TravelDay = {
  day: number;
  stopId: string;
  stopName: string;
  title: string;
  themes: TravelThemeId[];
  notes?: string;
};

export type TravelerType = 'solo' | 'couples' | 'family' | 'friends';

export type AgeBand = '18-25' | '25-35' | '35-50' | '50+';

export type UserProfile = {
  destination?: string;
  durationDays?: number | null;
  period?: string;
  periodStart?: string;
  periodEnd?: string;
  /** Approximate window vs fixed departure dates. */
  periodFlexible?: boolean;
  /** Extra days allowed before periodStart. */
  periodStartToleranceDays?: number;
  /** Extra days allowed after periodEnd. */
  periodEndToleranceDays?: number;
  /** Who travels — used for panel presets (distinct from theme `family`/`solo` chips). */
  travelerType?: TravelerType;
  ageBand?: AgeBand;
  preferencesPresetId?: string;
  panelsReviewed?: boolean;
  style?: string;
  ritmo?: string;
  budget?: string;
  alloggi?: string;
  preferenze?: string;
  likes: TravelThemeId[];
  dislikes: TravelThemeId[];
};

export type TravelItinerary = {
  stops: TravelStop[];
  days: TravelDay[];
  summary?: string;
};

/** Saved itinerary proposal — for compare / restore. */
export type ItineraryVersionProfileSnapshot = {
  likes?: TravelThemeId[];
  durationDays?: number | null;
  style?: string;
  ritmo?: string;
  budget?: string;
};

export type ItineraryVersion = {
  id: string;
  createdAt: string;
  label: string;
  stops: TravelStop[];
  summary?: string;
  profileFingerprint: string;
  /** Profile at save time — used for payoff if itinerary changes later. */
  profileSnapshot?: ItineraryVersionProfileSnapshot;
  /** e.g. "Musei + Cucina tipica · 7 tappe · 20 giorni" */
  payoffSummary?: string;
};

export type PendingReplacement = {
  stopId: string;
  stopName: string;
  candidates: { id: string; name: string; region?: string; themes: TravelThemeId[] }[];
};

export type TravelState = {
  version: 1;
  travel_phase: TravelPhase;
  profile: UserProfile;
  itinerary: TravelItinerary;
  locked: boolean;
  pendingReplacement: PendingReplacement | null;
  lastReasonerIntent?: string;
  /** Profile hash when itinerary was last aligned (planner). */
  profilePlannerFingerprint?: string;
  /** Preferences changed since last planner run. */
  itineraryStale?: boolean;
  /** Previous proposals (newest last). */
  itineraryHistory?: ItineraryVersion[];
  /** When viewing a restored snapshot from history. */
  activeItineraryVersionId?: string;
};

export type ReasonerAction =
  | { type: 'update_profile'; patch: Partial<UserProfile> }
  | { type: 'generate_initial_itinerary' }
  | { type: 'recalculate_itinerary' }
  | { type: 'propose_stop_replacement'; stopId: string }
  | { type: 'confirm_stop_replacement'; stopId: string; candidateId: string }
  | { type: 'confirm_itinerary' }
  | { type: 'adjust_stop_days'; stopId: string; days: number }
  | { type: 'remove_stop'; stopId: string }
  | { type: 'add_stop'; name: string; days: number; themes?: TravelThemeId[] }
  | { type: 'none' };

export type ReasonerOutput = {
  intent: string;
  actions: ReasonerAction[];
  clarificationsNeeded: string[];
  needsPlanner: boolean;
  plannerTask?: 'generate_initial' | 'recalculate' | 'replacement_candidates';
  plannerContext?: Record<string, unknown>;
};

export type TravelMessageResponse = {
  reply: string;
  /** Deferred chat line — client shows after first destination photo loads. */
  followUpAfterPhotos?: string | null;
  travel_state: TravelState;
  travel_phase: TravelPhase;
  itinerary_status: ItineraryStatus;
  /** DB compat only — UI must use travel_phase */
  step: string;
  phase: string;
  showItineraryPanel: boolean;
  showDayPanels: boolean;
  profileComplete: boolean;
  pendingReplacement: PendingReplacement | null;
};
