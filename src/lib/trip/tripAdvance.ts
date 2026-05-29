/**
 * Applies AI output for post-intake phases (F3–F7). Intake uses intakeDialogApply.ts.
 */
import type { AiTripResult, TripDraft, TripItinerary, TripStep } from '../../types/trip';
import { canAdvancePostIntake } from './tripValidate';

export { expectedAdvanceTo } from './tripAdvanceCore';

export type ApplyTurnResult = {
  draft: TripDraft;
  step: TripStep;
  advanced: boolean;
  itinerary?: TripItinerary;
};

function parseItinerary(raw: unknown): TripItinerary | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as TripItinerary;
  if (!Array.isArray(o.days) || o.days.length === 0) return null;
  return o;
}

function mergeNormalized(draft: TripDraft, n: AiTripResult['normalized']): TripDraft {
  return {
    ...draft,
    ...(n.destination != null ? { destinationNormalized: n.destination } : {}),
    ...(n.duration != null ? { durationNormalized: n.duration } : {}),
    ...(n.durationDays != null ? { durationDays: n.durationDays } : {}),
    ...(n.period != null ? { periodNormalized: n.period } : {}),
    ...(n.periodStart != null ? { periodStart: n.periodStart } : {}),
    ...(n.periodEnd != null ? { periodEnd: n.periodEnd } : {}),
    ...(n.criteriaExplanation != null ? { criteriaExplanation: n.criteriaExplanation } : {}),
    ...(n.currentDay != null ? { currentDay: n.currentDay } : {}),
    ...(n.analysis != null ? { lastPageAnalysis: n.analysis } : {}),
  };
}

/** Applies AI output for F3–F7 steps. */
export function applyTripTurn(
  step: TripStep,
  userText: string,
  draft: TripDraft,
  ai: AiTripResult
): ApplyTurnResult {
  if (step === 'F7_complete' || step === 'intake_dialog' || step === 'intake_review') {
    return { draft, step, advanced: false };
  }

  let nextDraft = {
    ...mergeNormalized(draft, ai.normalized),
    lastIntent: ai.intent,
    lastAmbiguities: ai.ambiguities.length > 0 ? ai.ambiguities : undefined,
  };

  if (!canAdvancePostIntake(step, ai)) {
    return { draft: nextDraft, step, advanced: false };
  }

  if (step === 'F3_generate') {
    const itin = parseItinerary(ai.itinerary ?? ai.extracted.itinerary);
    if (!itin) return { draft: nextDraft, step, advanced: false };
    nextDraft.itinerary = itin;
    return { draft: nextDraft, step: 'F3_explain', advanced: true, itinerary: itin };
  }

  if (step === 'F3_explain') {
    return { draft: nextDraft, step: 'F3_complete', advanced: true };
  }

  if (step === 'F4_review_1') return { draft: nextDraft, step: 'F4_review_2', advanced: true };
  if (step === 'F4_review_2') return { draft: nextDraft, step: 'F4_review_3', advanced: true };
  if (step === 'F4_review_3') return { draft: nextDraft, step: 'F4_complete', advanced: true };

  if (step === 'F5_render' && ai.intent === 'continue') {
    return { draft: nextDraft, step: 'F5_complete', advanced: true };
  }

  if (step === 'F6_prenotazioni') {
    if (Array.isArray(ai.extracted.bookings)) {
      nextDraft.bookings = ai.extracted.bookings as TripDraft['bookings'];
    }
    if (ai.intent === 'continue') return { draft: nextDraft, step: 'F6_complete', advanced: true };
  }

  if (step === 'F7_page_analysis') {
    return { draft: nextDraft, step: 'F7_complete', advanced: true };
  }

  return { draft: nextDraft, step, advanced: false };
}
