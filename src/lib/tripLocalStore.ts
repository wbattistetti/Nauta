/**
 * localStorage fallback when Supabase trips table is unavailable.
 */
import type { TripDraft, TripItinerary, TripPhase, TripRecord, TripStatus, TripStep } from '../types/trip';
import { initialStep } from './travel/tripDbCompat';

const STORE_KEY = 'nauta_trips_local_v2';

function readAll(): Record<string, TripRecord> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TripRecord>;
    return migrateRecords(parsed);
  } catch {
    return {};
  }
}

/** Migrates v1-shaped records if present in same store. */
function migrateRecords(records: Record<string, TripRecord>): Record<string, TripRecord> {
  const out: Record<string, TripRecord> = {};
  for (const [id, r] of Object.entries(records)) {
    out[id] = normalizeRecord(r);
  }
  return out;
}

function normalizeRecord(raw: Partial<TripRecord> & { id: string }): TripRecord {
  const draft: TripDraft = {
    ...(raw.draft ?? {}),
    destinationRaw: raw.draft?.destinationRaw ?? raw.destination_raw ?? undefined,
    destinationNormalized:
      raw.draft?.destinationNormalized ??
      raw.destination_normalized ??
      raw.destination ??
      undefined,
    durationRaw: raw.draft?.durationRaw ?? raw.duration_raw ?? undefined,
    durationDays: raw.draft?.durationDays ?? raw.duration_days ?? undefined,
    periodRaw: raw.draft?.periodRaw ?? raw.period_raw ?? undefined,
    periodNormalized: raw.draft?.periodNormalized ?? undefined,
    durationNormalized: raw.draft?.durationNormalized ?? undefined,
    itinerary: raw.draft?.itinerary ?? raw.itinerary ?? undefined,
  };

  return {
    id: raw.id,
    phase: (raw.phase as TripPhase) ?? 'F1',
    step: (raw.step as TripStep) ?? initialStep(),
    status: (raw.status as TripStatus) ?? 'in_progress',
    draft,
    itinerary: raw.itinerary ?? draft.itinerary ?? null,
    chat_messages: raw.chat_messages ?? [],
    destination: draft.destinationNormalized ?? null,
    destination_raw: draft.destinationRaw ?? null,
    destination_normalized: draft.destinationNormalized ?? null,
    duration_days: draft.durationDays ?? null,
    duration_raw: draft.durationRaw ?? null,
    period_raw: draft.periodRaw ?? null,
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? new Date().toISOString(),
  };
}

function writeAll(trips: Record<string, TripRecord>): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(trips));
}

export function localSaveTrip(record: TripRecord): void {
  const all = readAll();
  all[record.id] = record;
  writeAll(all);
}

export function localGetTrip(id: string): TripRecord | null {
  return readAll()[id] ?? null;
}

export function localListTrips(): TripRecord[] {
  return Object.values(readAll()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function recordFromDraft(
  id: string,
  draft: TripDraft,
  phase: TripPhase,
  step: TripStep,
  status: TripStatus,
  existing?: TripRecord | null
): TripRecord {
  const now = new Date().toISOString();
  const normalized = draft.destinationNormalized ?? null;
  return {
    id,
    phase,
    step,
    status,
    draft,
    itinerary: draft.itinerary ?? existing?.itinerary ?? null,
    chat_messages: existing?.chat_messages ?? [],
    destination: normalized,
    destination_raw: draft.destinationRaw ?? null,
    destination_normalized: normalized,
    duration_days: draft.durationDays ?? null,
    duration_raw: draft.durationRaw ?? null,
    period_raw: draft.periodRaw ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

export function isTripsTableMissingError(message: string): boolean {
  return (
    message.includes('trips') &&
    (message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('Could not find'))
  );
}
