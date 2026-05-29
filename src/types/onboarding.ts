/** @deprecated Import from types/trip — kept for backward compatibility. */
export type {
  TripPhase,
  TripStep,
  TripDraft,
  TripRecord,
  TripStatus,
  ChatMessage,
  ChatMode,
  TripItinerary,
  TripItineraryDay,
} from './trip';

/** Legacy F1 step names. */
export type OnboardingStep = 'destination' | 'duration' | 'period' | 'complete';

export type TripStatusLegacy = 'onboarding' | 'complete' | 'planning';
