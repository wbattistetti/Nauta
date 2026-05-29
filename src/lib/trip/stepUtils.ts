/**
 * TripPhase / TripStep navigation helpers.
 */
import type { TripPhase, TripStep } from '../../types/trip';
import { isIntakeComplete } from './dialogOrchestrator';

const STEP_ORDER: TripStep[] = [
  'intake_dialog',
  'intake_review',
  'F3_generate',
  'F3_explain',
  'F3_complete',
  'F4_review_1',
  'F4_review_2',
  'F4_review_3',
  'F4_complete',
  'F5_render',
  'F5_complete',
  'F6_prenotazioni',
  'F6_complete',
  'F7_page_analysis',
  'F7_complete',
];

export function phaseFromStep(step: TripStep): TripPhase {
  if (step === 'intake_dialog' || step === 'intake_review') return 'F1';
  return step.slice(0, 2) as TripPhase;
}

export function nextStepAfter(step: TripStep): TripStep | null {
  const i = STEP_ORDER.indexOf(step);
  if (i < 0 || i >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[i + 1];
}

export function isTerminalStep(step: TripStep): boolean {
  return step === 'F7_complete';
}

export function initialStep(): TripStep {
  return 'intake_dialog';
}

export function legacyOnboardingToStep(
  legacy: 'destination' | 'duration' | 'period' | 'complete'
): TripStep {
  return 'intake_dialog';
}

export function inferStepFromDraft(draft: Parameters<typeof isIntakeComplete>[0]): TripStep {
  if (!isIntakeComplete(draft)) return 'intake_dialog';
  if (!draft.itinerary?.days?.length) return 'intake_review';
  if (!draft.criteriaExplanation) return 'F3_explain';
  return 'F3_complete';
}
