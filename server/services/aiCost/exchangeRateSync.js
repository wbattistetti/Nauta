/**
 * Cambio USD→EUR da Frankfurter (ECB), cache 24h.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, '../../data/exchange_rate_cache.json');
const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** @type {{ usdToEur: number, updatedAt: string } | null} */
let memory = null;

function loadCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return;
    memory = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    memory = null;
  }
}

function saveCache(usdToEur) {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  memory = { usdToEur, updatedAt: new Date().toISOString() };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(memory, null, 2));
}

function isStale() {
  if (!memory?.updatedAt) return true;
  return Date.now() - new Date(memory.updatedAt).getTime() > MAX_AGE_MS;
}

export async function refreshUsdToEur() {
  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.EUR;
  if (typeof rate !== 'number' || rate <= 0) throw new Error('Frankfurter: EUR mancante');
  saveCache(rate);
  console.log(`[exchangeRate] USD→EUR = ${rate}`);
  return { usdToEur: rate, updatedAt: memory.updatedAt };
}

export async function getUsdToEur() {
  if (!memory) loadCache();
  if (isStale()) {
    try {
      await refreshUsdToEur();
    } catch (e) {
      console.warn('[exchangeRate] refresh failed, using cache:', e.message);
    }
  }
  return memory?.usdToEur ?? null;
}

export function getExchangeRateSnapshot() {
  return memory ?? { usdToEur: null, updatedAt: null };
}

loadCache();
