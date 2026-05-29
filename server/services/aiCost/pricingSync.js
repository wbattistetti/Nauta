/**
 * Catalogo prezzi modelli da OpenRouter (USD per 1M token), cache su disco.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '../../data/ia_pricing_cache.json');
const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

/** @type {Map<string, { inputUsdPer1M: number, outputUsdPer1M: number, openRouterId: string }>} */
let index = new Map();

const PROVIDER_PREFIX = {
  openai: 'openai',
  groq: 'groq',
  anthropic: 'anthropic',
  google: 'google',
};

function cacheKey(providerId, modelId) {
  return `${providerId}::${modelId}`;
}

function parseUsdPer1M(perToken) {
  const n = Number(perToken);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n * 1_000_000;
}

function loadCacheFromDisk() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (!raw?.entries || typeof raw.entries !== 'object') return;
    index = new Map(Object.entries(raw.entries));
  } catch (e) {
    console.warn('[pricingSync] cache read failed:', e.message);
  }
}

function saveCacheToDisk() {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    CACHE_PATH,
    JSON.stringify({ updatedAt: new Date().toISOString(), entries: Object.fromEntries(index) }, null, 2)
  );
}

/**
 * @param {Array<{ id: string, pricing?: { prompt?: string, completion?: string } }>} models
 */
function ingestOpenRouterModels(models) {
  for (const m of models) {
    if (!m?.id || !m.pricing) continue;
    const slash = m.id.indexOf('/');
    if (slash < 0) continue;
    const providerSlug = m.id.slice(0, slash);
    const modelSlug = m.id.slice(slash + 1);

    let providerId = null;
    for (const [pid, prefix] of Object.entries(PROVIDER_PREFIX)) {
      if (providerSlug === prefix || providerSlug.startsWith(prefix)) {
        providerId = pid;
        break;
      }
    }
    if (!providerId) continue;

    const inputUsdPer1M = parseUsdPer1M(m.pricing.prompt);
    const outputUsdPer1M = parseUsdPer1M(m.pricing.completion);
    index.set(cacheKey(providerId, modelSlug), {
      inputUsdPer1M,
      outputUsdPer1M,
      openRouterId: m.id,
    });
    index.set(cacheKey(providerId, m.id), {
      inputUsdPer1M,
      outputUsdPer1M,
      openRouterId: m.id,
    });
  }
}

export async function syncPricingFromOpenRouter() {
  const res = await fetch(OPENROUTER_MODELS_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`OpenRouter models HTTP ${res.status}`);
  const data = await res.json();
  const models = data?.data ?? data ?? [];
  if (!Array.isArray(models)) throw new Error('OpenRouter models: formato inatteso');
  ingestOpenRouterModels(models);
  saveCacheToDisk();
  console.log(`[pricingSync] ${index.size} voci in cache`);
  return { count: index.size, updatedAt: new Date().toISOString() };
}

export function lookupPricing(providerId, modelId) {
  return (
    index.get(cacheKey(providerId, modelId)) ??
    index.get(cacheKey(providerId, `${providerId}/${modelId}`)) ??
    null
  );
}

export function getPricingSnapshot() {
  return {
    updatedAt: fs.existsSync(CACHE_PATH)
      ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')).updatedAt
      : null,
    count: index.size,
    entries: Object.fromEntries(index),
  };
}

loadCacheFromDisk();
