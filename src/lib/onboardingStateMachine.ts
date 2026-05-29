/**
 * Shared helpers for Fase 1 (duration parsing). Chat logic is AI-driven in onboardingAdvance.ts.
 */

/** Parses duration into days when possible. */
export function parseDurationDays(raw: string): number | null {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return Number.isFinite(n) ? n : null;
  }

  const lower = trimmed.toLowerCase();
  const weekMatch = lower.match(/(\d+)\s*settiman/);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7;

  if (/due\s+settiman|2\s+settiman/.test(lower)) return 14;
  if (/una\s+settimana|1\s+settimana/.test(lower)) return 7;
  if (/tre\s+settiman|3\s+settiman/.test(lower)) return 21;

  const dayMatch = lower.match(/(\d+)\s*giorn/);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  return null;
}
