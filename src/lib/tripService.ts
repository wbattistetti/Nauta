/**
 * Trip persistence — Postgres via API when VITE_USE_LOCAL_API=true (no localStorage).
 */
import type { ChatMessage, TripDraft, TripRecord, TripStatus, TripStep } from '../types/trip';
import { initialStep, phaseFromStep } from './trip/stepUtils';
import { apiUrl, useLocalApi } from './apiClient';
import { apiJson, readApiJson } from './apiJson';
import { recordFromDraft } from './tripLocalStore';

function bodyFromRecord(record: TripRecord) {
  return {
    phase: record.phase,
    step: record.step,
    status: record.status,
    draft: record.draft,
    itinerary: record.itinerary ?? record.draft.itinerary ?? null,
    chat_messages: record.chat_messages,
  };
}

function requireApi(): void {
  if (!useLocalApi()) {
    throw new Error('VITE_USE_LOCAL_API=true richiesto. I viaggi sono salvati solo su Postgres.');
  }
}

/** Label for trip menu when several trips share the same destination name. */
export function tripMenuLabel(trip: TripRecord, allTrips: TripRecord[]): string {
  const base = tripDisplayLabel(trip);
  const duplicates = allTrips.filter((t) => tripDisplayLabel(t) === base);
  if (duplicates.length <= 1) return base;
  const d = new Date(trip.updated_at);
  const when = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  return `${base} · ${when}`;
}

function isEmptyTripStub(trip: TripRecord): boolean {
  const hasDest =
    trip.destination_normalized?.trim() ||
    trip.draft.destinationNormalized?.trim() ||
    trip.destination?.trim() ||
    trip.travel_state?.profile?.destination?.trim();
  const msgCount = trip.chat_messages?.length ?? 0;
  return trip.status === 'in_progress' && !hasDest && msgCount <= 1;
}

/** Clears travel_state, chat and draft — fresh phase1 (panels hidden until facts in chat). */
export async function resetTripOnboarding(tripId: string): Promise<TripRecord> {
  requireApi();
  return apiJson<TripRecord>(`/api/trips/${tripId}/reset-onboarding`, { method: 'POST' });
}

/** Creates a new trip in Postgres. Reuses an empty in-progress stub when present. */
export async function createTrip(): Promise<string> {
  requireApi();
  const existing = await listTrips();
  const stub = existing.find(isEmptyTripStub);
  if (stub) return stub.id;

  const id = crypto.randomUUID();
  const created = await apiJson<TripRecord>('/api/trips', {
    method: 'POST',
    body: JSON.stringify({
      id,
      phase: 'F1',
      step: initialStep(),
      status: 'in_progress',
      draft: {},
    }),
  });
  return created.id;
}

/** All trips from DB (newest by creation first). */
export async function listTrips(): Promise<TripRecord[]> {
  requireApi();
  return apiJson<TripRecord[]>('/api/trips');
}

/** Trips with a real name — excludes empty "Viaggio senza nome" stubs from menus. */
export function filterTripsForMenu(trips: TripRecord[]): TripRecord[] {
  return trips.filter((t) => tripDisplayLabel(t) !== 'Viaggio senza nome');
}

/** Named trips for burger menu (newest first). */
export async function listTripsForMenu(): Promise<TripRecord[]> {
  const trips = await listTrips();
  return filterTripsForMenu(trips);
}

/** Most recent in-progress named trip, if any. */
export async function fetchLatestInProgressTrip(): Promise<TripRecord | null> {
  const trips = filterTripsForMenu(await listTrips());
  return trips.find((t) => t.status === 'in_progress') ?? null;
}

export function tripDisplayLabel(trip: TripRecord): string {
  const dest =
    trip.destination_normalized?.trim() ||
    trip.destination_raw?.trim() ||
    trip.destination?.trim() ||
    trip.draft.destinationNormalized?.trim();
  if (dest) return dest;
  if (trip.draft.periodNormalized?.trim()) return trip.draft.periodNormalized.trim();
  if (trip.period_raw?.trim()) return trip.period_raw.trim();
  if (trip.duration_raw?.trim()) return trip.duration_raw.trim();
  return 'Viaggio senza nome';
}

/** Permanently deletes a trip and related rows (CASCADE). */
export async function deleteTrip(id: string): Promise<void> {
  requireApi();
  const res = await fetch(apiUrl(`/api/trips/${id}`), { method: 'DELETE' });
  if (res.status === 204) return;
  const json = await readApiJson<{ error?: string }>(res).catch(() => ({ error: undefined }));
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
}

export async function fetchTrip(id: string): Promise<TripRecord | null> {
  requireApi();
  try {
    return await apiJson<TripRecord>(`/api/trips/${id}`);
  } catch {
    return null;
  }
}

export async function updateTrip(
  id: string,
  draft: TripDraft,
  step: TripStep,
  status: TripStatus,
  chatMessages?: ChatMessage[],
  existing?: TripRecord | null
): Promise<void> {
  requireApi();
  const phase = phaseFromStep(step);
  const record = recordFromDraft(id, draft, phase, step, status, existing ?? null);
  if (chatMessages) record.chat_messages = chatMessages.slice(-40);
  if (draft.itinerary) record.itinerary = draft.itinerary;

  await apiJson<TripRecord>(`/api/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bodyFromRecord(record)),
  });
}

export function tripRecordToDraft(record: TripRecord): TripDraft {
  return {
    ...record.draft,
    destinationRaw: record.draft.destinationRaw ?? record.destination_raw ?? undefined,
    destinationNormalized:
      record.draft.destinationNormalized ??
      record.destination_normalized ??
      record.destination ??
      undefined,
    durationRaw: record.draft.durationRaw ?? record.duration_raw ?? undefined,
    durationDays: record.draft.durationDays ?? record.duration_days ?? undefined,
    periodRaw: record.draft.periodRaw ?? record.period_raw ?? undefined,
    periodNormalized: record.draft.periodNormalized ?? undefined,
    durationNormalized: record.draft.durationNormalized ?? undefined,
    itinerary: record.draft.itinerary ?? record.itinerary ?? undefined,
  };
}

export function inferStepFromRecord(record: TripRecord): TripStep {
  const ts = record.travel_state;
  if (ts && typeof ts === 'object' && (ts as { travel_phase?: string }).travel_phase) {
    const phase = (ts as { travel_phase: string }).travel_phase;
    if (phase === 'phase4') return 'F5_render';
    if (phase === 'phase2' || phase === 'phase3') return 'F3_explain';
    return 'intake_dialog';
  }
  if (record.itinerary_status === 'logistics_ready') return 'F5_render';
  return record.step ?? 'intake_dialog';
}

/** Normalizes chat messages loaded from DB. */
export function chatMessagesFromRecord(record: TripRecord): ChatMessage[] {
  const raw = record.chat_messages ?? [];
  return raw
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      id: m.id ?? crypto.randomUUID(),
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content.trim(),
    }));
}
