/** @deprecated Use lib/trip/tripAdvance.ts */
import type { OnboardingStep } from '../types/onboarding';
import type { AiTripResult, TripDraft } from '../types/trip';
import { applyTripTurn } from './trip/tripAdvance';
import { legacyOnboardingToStep } from './trip/stepUtils';

export type AiOnboardingResult = AiTripResult;
export type AdvanceToStep = 'destination' | 'duration' | 'period';
export { expectedAdvanceTo } from './trip/tripAdvanceCore';

export function applyOnboardingTurn(
  step: OnboardingStep,
  userText: string,
  draft: TripDraft,
  ai: AiOnboardingResult
) {
  const tripStep =
    step === 'complete' ? 'F1_complete' : legacyOnboardingToStep(step);
  const result = applyTripTurn(tripStep, userText, draft, ai);
  const legacyStep: OnboardingStep =
    result.step === 'F1_destination'
      ? 'destination'
      : result.step === 'F1_duration'
      ? 'duration'
      : result.step === 'F1_period'
      ? 'period'
      : 'complete';
  return { ...result, step: legacyStep };
}
