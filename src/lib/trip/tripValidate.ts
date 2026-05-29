/**
 * Parses and validates AI dialog-manager JSON responses.
 */
import type { AiIntent, AiNormalized, AiTripResult, PendingConfirmation, TripStep } from '../../types/trip';
import { expectedAdvanceTo } from './tripAdvanceCore';
import { getMissingFields } from './dialogOrchestrator';

const INTENTS: AiIntent[] = [
  'provide_destination',
  'provide_duration',
  'provide_period',
  'provide_style',
  'provide_ritmo',
  'provide_budget',
  'provide_alloggi',
  'provide_preferenze',
  'confirm',
  'reject',
  'clarify',
  'unsure',
  'continue',
  'review',
  'explore_day',
  'bookings',
  'page_analysis',
  'collect',
  'other',
];

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function asNumber(v: unknown): number | null | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return undefined;
}

function parseNormalized(raw: Record<string, unknown>): AiNormalized {
  return {
    destination: asString(raw.destination),
    duration: asString(raw.duration),
    durationDays: asNumber(raw.durationDays) ?? null,
    period: asString(raw.period),
    periodStart: asString(raw.periodStart),
    periodEnd: asString(raw.periodEnd),
    style: asString(raw.style),
    ritmo: asString(raw.ritmo),
    budget: asString(raw.budget),
    alloggi: asString(raw.alloggi),
    preferenze: asString(raw.preferenze),
    criteriaExplanation: asString(raw.criteriaExplanation),
    currentDay: asNumber(raw.currentDay) ?? undefined,
    analysis: asString(raw.analysis),
  };
}

function parsePending(raw: unknown): PendingConfirmation | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const field = asString(o.field);
  const value = asString(o.value);
  if (!field || !value) return null;
  return { field, value };
}

/** Parses raw API JSON into AiTripResult or null if invalid. */
export function parseAiTripResponse(raw: Record<string, unknown>): AiTripResult | null {
  if (typeof raw.reply !== 'string') return null;

  const intentRaw = asString(raw.intent) ?? 'collect';
  const intent = INTENTS.includes(intentRaw as AiIntent) ? (intentRaw as AiIntent) : 'collect';

  const normalized = parseNormalized((raw.normalized ?? {}) as Record<string, unknown>);
  const deduced = parseNormalized((raw.deduced ?? {}) as Record<string, unknown>);

  const missing = Array.isArray(raw.missing)
    ? raw.missing.filter((m): m is string => typeof m === 'string')
    : [];

  const suggestions = Array.isArray(raw.suggestions)
    ? raw.suggestions.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : [];

  const ambiguities = Array.isArray(raw.ambiguities)
    ? raw.ambiguities.filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
    : [];

  const advanceTo = typeof raw.advanceTo === 'string' ? (raw.advanceTo as TripStep) : null;

  return {
    reply: raw.reply,
    intent,
    normalized,
    deduced,
    missing,
    suggestions,
    ambiguities,
    pendingConfirmation: parsePending(raw.pendingConfirmation),
    intakeComplete: Boolean(raw.intakeComplete),
    extracted: (raw.extracted as Record<string, unknown>) ?? {},
    advanceTo,
    itinerary: raw.itinerary as AiTripResult['itinerary'],
  };
}

export function fallbackAiResult(message?: string): AiTripResult {
  return {
    reply:
      message ??
      'Raccontami pure il viaggio che hai in mente: dove, quanto tempo, quando, che stile cerchi e il budget.',
    intent: 'collect',
    normalized: {},
    deduced: {},
    missing: ['destination', 'duration', 'period', 'style', 'budget', 'preferenze'],
    suggestions: [],
    ambiguities: [],
    pendingConfirmation: null,
    intakeComplete: false,
    extracted: {},
    advanceTo: null,
  };
}

/** Post-intake phases (F3+): legacy step advancement rules. */
export function canAdvancePostIntake(step: TripStep, ai: AiTripResult): boolean {
  if (ai.intent === 'unsure' || ai.intent === 'clarify') return false;
  if (step.endsWith('_complete') && step !== 'F7_complete') return false;

  const expected = expectedAdvanceTo(step);
  if (ai.advanceTo !== expected) return false;

  if (step === 'F3_generate') return Boolean(ai.itinerary);
  if (step.startsWith('F4_review')) return true;
  if (step === 'F6_prenotazioni') return ai.intent === 'continue' || ai.intent === 'bookings';
  if (step === 'F5_render') return Boolean(ai.normalized.currentDay) || ai.intent === 'continue';
  if (step === 'F7_page_analysis') return Boolean(ai.normalized.analysis);

  return Boolean(ai.advanceTo);
}

export { getMissingFields };
