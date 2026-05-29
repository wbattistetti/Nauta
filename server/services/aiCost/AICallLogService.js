/**
 * Log rolling delle chiamate AI con costi stimati.
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, '../../data/ai_call_log.json');
const MAX_RECORDS = 500;

/** @type {import('./types.js').AiCallRecord[]} */
let records = [];

function loadLog() {
  try {
    if (!fs.existsSync(LOG_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    records = Array.isArray(raw?.records) ? raw.records : [];
  } catch {
    records = [];
  }
}

function persistLog() {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify({ records }, null, 2));
}

/**
 * @param {Omit<import('./types.js').AiCallRecord, 'id' | 'ts'> & { id?: string, ts?: string }}
 */
export function appendCall(partial) {
  const record = {
    id: partial.id ?? randomUUID(),
    ts: partial.ts ?? new Date().toISOString(),
    providerId: partial.providerId,
    modelId: partial.modelId,
    purpose: partial.purpose ?? 'unknown',
    inputTokens: partial.inputTokens ?? 0,
    outputTokens: partial.outputTokens ?? 0,
    totalTokens: partial.totalTokens ?? 0,
    costUsd: partial.costUsd ?? 0,
    costEur: partial.costEur ?? 0,
    durationMs: partial.durationMs ?? 0,
    pricingFound: Boolean(partial.pricingFound),
    taskId: partial.taskId,
    taskLabel: partial.taskLabel,
    error: partial.error,
  };
  records.unshift(record);
  if (records.length > MAX_RECORDS) records.length = MAX_RECORDS;
  persistLog();
  return record;
}

export function listCalls(limit) {
  const n = limit != null ? Math.min(Number(limit) || 500, MAX_RECORDS) : records.length;
  return records.slice(0, n);
}

export function clearCalls() {
  records = [];
  persistLog();
}

export function getTotals(calls = records) {
  return calls.reduce(
    (acc, c) => ({
      costUsd: acc.costUsd + (c.costUsd ?? 0),
      costEur: acc.costEur + (c.costEur ?? 0),
      inputTokens: acc.inputTokens + (c.inputTokens ?? 0),
      outputTokens: acc.outputTokens + (c.outputTokens ?? 0),
      totalTokens: acc.totalTokens + (c.totalTokens ?? 0),
      count: acc.count + 1,
    }),
    { costUsd: 0, costEur: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, count: 0 }
  );
}

loadLog();
