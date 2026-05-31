/**
 * Applies AI dialog-manager output during intake — merges deduced values, confirmations, never blocks flow.
 */
import type { AiNormalized, AiTripResult, TripDraft } from '../../types/trip';
import type { IntakeField } from './dialogOrchestrator';
import {
  getMissingFields,
  isIntakeComplete,
  INTAKE_FIELD_ORDER,
} from './dialogOrchestrator';
import { parseDurationDays } from '../../lib/onboardingStateMachine';

export type IntakeApplyResult = {
  draft: TripDraft;
  intakeComplete: boolean;
  advanced: boolean;
  nextStep: 'intake_dialog' | 'intake_review' | 'F3_generate';
};

function isConfirmText(text: string): boolean {
  return /^(sì|si|ok|va bene|perfetto|confermo|d'accordo|yes|yep)\b/i.test(text.trim());
}

function isRejectText(text: string): boolean {
  return /^(no|non|niente|altro|cambia)\b/i.test(text.trim());
}

function mergeNormalizedIntoDraft(draft: TripDraft, n: AiNormalized): TripDraft {
  const next = { ...draft };
  if (n.destination) next.destinationNormalized = n.destination;
  if (n.duration) next.durationNormalized = n.duration;
  if (n.durationDays != null && n.durationDays > 0) next.durationDays = n.durationDays;
  if (n.period) next.periodNormalized = n.period;
  if (n.periodStart) next.periodStart = n.periodStart;
  if (n.periodEnd) next.periodEnd = n.periodEnd;
  if (!next.periodNormalized && n.periodStart && n.periodEnd) {
    next.periodNormalized = `${n.periodStart} – ${n.periodEnd}`;
  }
  if (n.style) next.style = n.style;
  if (n.ritmo) next.ritmo = n.ritmo;
  if (n.budget) next.budget = n.budget;
  if (n.alloggi) next.alloggi = n.alloggi;
  if (n.preferenze) next.preferenze = n.preferenze;
  return next;
}

function applyPendingConfirmation(draft: TripDraft): TripDraft {
  const p = draft.pendingConfirmation;
  if (!p?.field || !p.value) return draft;
  const n: AiNormalized = {};
  const field = p.field as IntakeField;
  if (INTAKE_FIELD_ORDER.includes(field)) {
    if (field === 'destination') n.destination = p.value;
    if (field === 'duration') n.duration = p.value;
    if (field === 'period') n.period = p.value;
    if (field === 'style') n.style = p.value;
    if (field === 'budget') n.budget = p.value;
    if (field === 'preferenze') n.preferenze = p.value;
  }
  return {
    ...mergeNormalizedIntoDraft(draft, n),
    pendingConfirmation: null,
  };
}

/** Applies one intake turn; conversation continues until all required fields are filled. */
export function applyIntakeTurn(
  userText: string,
  draft: TripDraft,
  ai: AiTripResult
): IntakeApplyResult {
  let next: TripDraft = {
    ...draft,
    lastIntent: ai.intent,
    lastAmbiguities: ai.ambiguities.length > 0 ? ai.ambiguities : undefined,
  };

  if ((ai.intent === 'confirm' || isConfirmText(userText)) && next.pendingConfirmation) {
    next = applyPendingConfirmation(next);
  } else if (isRejectText(userText)) {
    next = { ...next, pendingConfirmation: null };
  }

  next = mergeNormalizedIntoDraft(next, ai.normalized);

  if (ai.pendingConfirmation?.field && ai.pendingConfirmation?.value) {
    next.pendingConfirmation = ai.pendingConfirmation;
  } else if (!next.pendingConfirmation) {
    next = mergeNormalizedIntoDraft(next, ai.deduced);
  }

  if (next.durationNormalized && !next.durationDays) {
    next.durationDays = parseDurationDays(next.durationNormalized);
  }

  const complete = isIntakeComplete(next);

  if (complete) {
    next.pendingConfirmation = null;
    return {
      draft: next,
      intakeComplete: true,
      advanced: true,
      nextStep: 'intake_review',
    };
  }

  return {
    draft: next,
    intakeComplete: false,
    advanced: false,
    nextStep: 'intake_dialog',
  };
}

export function intakeProgressLabel(draft: TripDraft): string {
  const missing = getMissingFields(draft);
  const done = INTAKE_FIELD_ORDER.length - missing.length;
  return `${done}/${INTAKE_FIELD_ORDER.length} informazioni raccolte`;
}
