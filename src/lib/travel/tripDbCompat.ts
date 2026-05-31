/**
 * Minimal F1–F7 step helpers for trip DB compatibility (Travel Agent path).
 */
import type { TripPhase, TripStep } from '../../types/trip';

export function initialStep(): TripStep {
  return 'intake_dialog';
}

export function phaseFromStep(step: TripStep): TripPhase {
  if (step === 'intake_dialog' || step === 'intake_review') return 'F1';
  return step.slice(0, 2) as TripPhase;
}
