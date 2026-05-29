/**
 * Step transition expectations (deterministic flow map).
 */
import type { TripStep } from '../../types/trip';
import { nextStepAfter } from './stepUtils';

/** Expected advanceTo for a successful turn at this step. */
export function expectedAdvanceTo(step: TripStep): TripStep | null {
  if (step.endsWith('_complete')) {
    return nextStepAfter(step);
  }
  const fieldSteps: Partial<Record<TripStep, TripStep>> = {
    F1_destination: 'F1_duration',
    F1_duration: 'F1_period',
    F1_period: 'F1_complete',
    F2_style: 'F2_ritmo',
    F2_ritmo: 'F2_budget',
    F2_budget: 'F2_alloggi',
    F2_alloggi: 'F2_preferenze',
    F2_preferenze: 'F2_complete',
    F3_explain: 'F3_complete',
    F4_review_1: 'F4_review_2',
    F4_review_2: 'F4_review_3',
    F4_review_3: 'F4_complete',
    F5_render: 'F5_complete',
    F6_prenotazioni: 'F6_complete',
    F7_page_analysis: 'F7_complete',
  };
  return fieldSteps[step] ?? null;
}
