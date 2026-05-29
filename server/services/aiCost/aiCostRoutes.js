/**
 * REST API per log costi AI e refresh catalogo/cambio.
 */
import { Router } from 'express';
import { appendCall, clearCalls, getTotals, listCalls } from './AICallLogService.js';
import { getExchangeRateSnapshot, getUsdToEur, refreshUsdToEur } from './exchangeRateSync.js';
import { getPricingSnapshot, lookupPricing, syncPricingFromOpenRouter } from './pricingSync.js';
import { computeCallCost } from './AICostCalculator.js';

export const aiCostRouter = Router();

aiCostRouter.get('/', (req, res) => {
  const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
  const purpose = typeof req.query.purpose === 'string' ? req.query.purpose : undefined;
  let calls = listCalls(limit);
  if (purpose) calls = calls.filter((c) => c.purpose === purpose);
  const totals = getTotals(calls);
  res.json({ calls, totals });
});

aiCostRouter.delete('/', (_req, res) => {
  clearCalls();
  res.json({ ok: true });
});

aiCostRouter.get('/pricing', (_req, res) => {
  res.json(getPricingSnapshot());
});

aiCostRouter.post('/pricing/refresh', async (_req, res) => {
  try {
    const result = await syncPricingFromOpenRouter();
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: String(e.message) });
  }
});

aiCostRouter.get('/exchange-rate', (_req, res) => {
  res.json(getExchangeRateSnapshot());
});

aiCostRouter.post('/exchange-rate/refresh', async (_req, res) => {
  try {
    const result = await refreshUsdToEur();
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: String(e.message) });
  }
});

/** Lookup prezzo per provider/model (debug). */
aiCostRouter.get('/lookup', (req, res) => {
  const providerId = String(req.query.provider ?? 'openai');
  const modelId = String(req.query.model ?? '');
  const p = lookupPricing(providerId, modelId);
  res.json({ found: Boolean(p), pricing: p });
});

export { appendCall, computeCallCost, getUsdToEur, lookupPricing };
