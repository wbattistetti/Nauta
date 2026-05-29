/**
 * Client per log costi AI (GET /api/ai-calls).
 */
import { apiUrl } from '../lib/apiClient';

export type AiCallRecord = {
  id: string;
  ts: string;
  providerId: string;
  modelId: string;
  purpose: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  costEur: number;
  durationMs: number;
  pricingFound: boolean;
  taskId?: string;
  taskLabel?: string;
  error?: string;
};

export type AiCallsTotals = {
  costUsd: number;
  costEur: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  count: number;
};

export type AiCallsResponse = {
  calls: AiCallRecord[];
  totals: AiCallsTotals;
};

export async function fetchAiCalls(limit?: number, purpose?: string): Promise<AiCallsResponse> {
  const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (purpose) params.set('purpose', purpose);
  const q = params.toString();
  const res = await fetch(apiUrl(`/api/ai-calls${q ? `?${q}` : ''}`));
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json as AiCallsResponse;
}
