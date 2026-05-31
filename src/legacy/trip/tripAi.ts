/**
 * Calls Nauta API ÔÇö AI dialog manager on every turn.
 */
import { apiUrl, useLocalApi } from '../apiClient';
import { buildIntakeContext } from './dialogOrchestrator';
import { isIntakePhaseStep } from './dialogOrchestrator';
import { fallbackAiResult, parseAiTripResponse } from './tripValidate';
import type { AiTripResult, ChatMessage, TripDraft, TripPhase, TripStep } from '../../types/trip';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type TripAiCallOptions = {
  pageContent?: string;
  generateItinerary?: boolean;
  /** Session resume: AI greets and asks the next missing field. */
  resuming?: boolean;
};

function mapResponse(json: Record<string, unknown>): AiTripResult {
  const parsed = parseAiTripResponse(json);
  if (!parsed) return fallbackAiResult();
  if (json.itinerary) parsed.itinerary = json.itinerary as AiTripResult['itinerary'];
  return parsed;
}

export async function callTripAi(
  phase: TripPhase,
  step: TripStep,
  draft: TripDraft,
  history: ChatMessage[],
  userText: string,
  options: TripAiCallOptions = {}
): Promise<{ ok: true; data: AiTripResult } | { ok: false; error: string }> {
  const messages = [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userText },
  ];

  const body: Record<string, unknown> = {
    mode: 'trip',
    phase,
    step,
    draft,
    messages,
    pageContent: options.pageContent,
    generateItinerary: options.generateItinerary ?? step === 'F3_generate',
  };

  if (options.resuming) {
    body.resuming = true;
  }

  if (isIntakePhaseStep(step)) {
    body.intakeMode = true;
    body.intakeContext = buildIntakeContext(draft);
  }

  try {
    if (useLocalApi()) {
      const res = await fetch(apiUrl('/api/ai-chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error ?? `HTTP ${res.status}` };
      return { ok: true, data: mapResponse(json) };
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { ok: false, error: 'API non configurata. Imposta VITE_USE_LOCAL_API=true.' };
    }

    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    return { ok: true, data: mapResponse(json) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
