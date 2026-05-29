/**
 * Dialog orchestration: what is missing, when intake is complete, context for AI.
 */
import type { TripDraft } from '../../types/trip';

export type IntakeField =
  | 'destination'
  | 'duration'
  | 'period'
  | 'style'
  | 'budget'
  | 'preferenze';

export const INTAKE_FIELD_ORDER: IntakeField[] = [
  'destination',
  'duration',
  'period',
  'style',
  'budget',
  'preferenze',
];

const FIELD_LABELS: Record<IntakeField, string> = {
  destination: 'destinazione',
  duration: 'durata del viaggio',
  period: 'periodo / date di viaggio',
  style: 'stile di viaggio',
  budget: 'budget indicativo',
  preferenze: 'preferenze o cose da evitare',
};

export function isFieldFilled(draft: TripDraft, field: IntakeField): boolean {
  switch (field) {
    case 'destination':
      return Boolean(draft.destinationNormalized?.trim());
    case 'duration':
      return (
        Boolean(draft.durationNormalized?.trim()) ||
        (draft.durationDays != null && draft.durationDays > 0)
      );
    case 'period':
      return Boolean(
        draft.periodNormalized?.trim() ||
          (draft.periodStart && draft.periodEnd)
      );
    case 'style':
      return Boolean(draft.style?.trim());
    case 'budget':
      return Boolean(draft.budget?.trim());
    case 'preferenze':
      return Boolean(draft.preferenze?.trim());
    default:
      return false;
  }
}

export function getMissingFields(draft: TripDraft): IntakeField[] {
  return INTAKE_FIELD_ORDER.filter((f) => !isFieldFilled(draft, f));
}

export function isIntakeComplete(draft: TripDraft): boolean {
  return getMissingFields(draft).length === 0;
}

export function nextMissingField(draft: TripDraft): IntakeField | null {
  return getMissingFields(draft)[0] ?? null;
}

export function labelForField(field: IntakeField): string {
  return FIELD_LABELS[field];
}

/** Context blob sent to the AI each turn during intake. */
export function buildIntakeContext(draft: TripDraft): Record<string, unknown> {
  const missing = getMissingFields(draft);
  return {
    mode: 'intake_dialog',
    missing,
    missingLabels: missing.map(labelForField),
    nextFocus: missing[0] ?? null,
    collected: {
      destination: draft.destinationNormalized ?? null,
      duration: draft.durationNormalized ?? null,
      durationDays: draft.durationDays ?? null,
      period: draft.periodNormalized ?? null,
      periodStart: draft.periodStart ?? null,
      periodEnd: draft.periodEnd ?? null,
      style: draft.style ?? null,
      budget: draft.budget ?? null,
      preferenze: draft.preferenze ?? null,
    },
    pendingConfirmation: draft.pendingConfirmation ?? null,
  };
}

export function isIntakePhaseStep(step: string): boolean {
  return (
    step === 'intake_dialog' ||
    step.startsWith('F1_') ||
    step.startsWith('F2_')
  );
}
