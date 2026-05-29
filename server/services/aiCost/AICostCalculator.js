/**
 * Stima costo post-chiamata da token usage + catalogo prezzi (USD/1M) + cambio EUR.
 */

/**
 * @param {unknown} response - Risposta OpenAI-compatible (usage in response.usage)
 * @returns {{ inputTokens: number, outputTokens: number, totalTokens: number }}
 */
export function extractTokenUsage(response) {
  const usage = response?.usage ?? {};
  const inputTokens = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0) || 0;
  const outputTokens = Number(usage.completion_tokens ?? usage.output_tokens ?? 0) || 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

/**
 * @param {{ providerId: string, modelId: string, response: unknown, lookupPricing: (p: string, m: string) => object | null, getUsdToEur: () => number | null }}
 */
export function computeCallCost({ providerId, modelId, response, lookupPricing, getUsdToEur }) {
  const { inputTokens, outputTokens, totalTokens } = extractTokenUsage(response);
  const pricing = lookupPricing(providerId, modelId);

  if (!pricing) {
    return {
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd: 0,
      costEur: 0,
      pricingFound: false,
    };
  }

  const costUsd =
    (inputTokens * pricing.inputUsdPer1M + outputTokens * pricing.outputUsdPer1M) / 1_000_000;
  const usdToEur = getUsdToEur();
  const costEur = usdToEur != null ? costUsd * usdToEur : 0;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    costUsd,
    costEur,
    pricingFound: true,
  };
}
