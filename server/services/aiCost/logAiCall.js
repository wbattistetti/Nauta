/**
 * Registra costo stimato dopo ogni chiamata LLM OK o fallita.
 */
import { computeCallCost } from './AICostCalculator.js';
import { appendCall } from './AICallLogService.js';
import { getExchangeRateSnapshot } from './exchangeRateSync.js';
import { lookupPricing } from './pricingSync.js';

/**
 * @param {{
 *   providerId: string,
 *   modelId: string,
 *   purpose: string,
 *   response?: unknown,
 *   durationMs: number,
 *   taskId?: string,
 *   taskLabel?: string,
 *   error?: string,
 * }} params
 */
export function logAiCall(params) {
  const { providerId, modelId, purpose, response, durationMs, taskId, taskLabel, error } =
    params;

  if (error || !response) {
    return appendCall({
      providerId,
      modelId,
      purpose,
      durationMs,
      taskId,
      taskLabel,
      error,
      pricingFound: false,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      costEur: 0,
    });
  }

  const cost = computeCallCost({
    providerId,
    modelId,
    response,
    lookupPricing,
    getUsdToEur: () => getExchangeRateSnapshot()?.usdToEur ?? null,
  });

  return appendCall({
    providerId,
    modelId,
    purpose,
    durationMs,
    taskId,
    taskLabel,
    ...cost,
  });
}
