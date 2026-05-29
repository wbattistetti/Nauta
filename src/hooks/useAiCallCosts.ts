/**
 * Poll log costi AI ogni 5s — ultima chiamata + totale sessione (purpose trip).
 */
import { useEffect, useState, useCallback } from 'react';
import { fetchAiCalls, type AiCallRecord, type AiCallsTotals } from '../services/aiCallsApi';
import { useLocalApi } from '../lib/apiClient';

const POLL_MS = 5000;
const TRIP_PURPOSE_PREFIX = 'TRIP_';

const emptyTotals: AiCallsTotals = {
  costUsd: 0,
  costEur: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  count: 0,
};

export type AiCostDisplay = {
  lastCall: AiCallRecord | null;
  totals: AiCallsTotals;
  loading: boolean;
  refresh: () => void;
};

export function useAiCallCosts(enabled: boolean): AiCostDisplay {
  const [lastCall, setLastCall] = useState<AiCallRecord | null>(null);
  const [totals, setTotals] = useState<AiCallsTotals>(emptyTotals);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!useLocalApi()) return;
    try {
      setLoading(true);
      const data = await fetchAiCalls(100);
      const tripCalls = data.calls.filter((c) => c.purpose.startsWith(TRIP_PURPOSE_PREFIX));
      setLastCall(tripCalls[0] ?? null);
      setTotals(
        tripCalls.reduce(
          (acc, c) => ({
            costUsd: acc.costUsd + c.costUsd,
            costEur: acc.costEur + c.costEur,
            inputTokens: acc.inputTokens + c.inputTokens,
            outputTokens: acc.outputTokens + c.outputTokens,
            totalTokens: acc.totalTokens + c.totalTokens,
            count: acc.count + 1,
          }),
          { ...emptyTotals }
        )
      );
    } catch {
      /* server offline */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !useLocalApi()) return;
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  return { lastCall, totals, loading, refresh };
}
