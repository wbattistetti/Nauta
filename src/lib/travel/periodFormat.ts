/**
 * Format travel period for UI chips and calendar confirm payloads.
 */

export type PeriodTolerance = {
  periodStartToleranceDays?: number;
  periodEndToleranceDays?: number;
};

function parseIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isoToDisplay(iso: string): string {
  const d = parseIso(iso);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Parse dd/mm or dd/mm/yyyy against a reference year. */
export function parseDisplayDate(text: string, fallbackYear: number): string | null {
  const t = text.trim();
  const m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(t);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = m[3] ? Number(m[3]) : fallbackYear;
  if (month < 0 || month > 11 || day < 1) return null;
  const dim = new Date(year, month + 1, 0).getDate();
  if (day > dim) return null;
  return toIsoDate(year, month, day);
}

function toleranceSuffix(tol?: PeriodTolerance): string {
  const parts: string[] = [];
  if (tol?.periodStartToleranceDays && tol.periodStartToleranceDays > 0) {
    parts.push(`±${tol.periodStartToleranceDays}g inizio`);
  }
  if (tol?.periodEndToleranceDays && tol.periodEndToleranceDays > 0) {
    parts.push(`±${tol.periodEndToleranceDays}g fine`);
  }
  return parts.length ? ` (${parts.join(', ')})` : '';
}

/** Short Italian label from ISO dates. */
export function formatPeriodRangeLabel(
  periodStart: string,
  periodEnd: string,
  flexible = false,
  tolerance?: PeriodTolerance
): string {
  const start = parseIso(periodStart);
  const end = parseIso(periodEnd);
  if (!start || !end) return `${periodStart} – ${periodEnd}`;

  const prefix = flexible ? 'circa ' : '';
  const startPart = `${start.getDate()} ${MONTHS[start.getMonth()]}`;
  const endPart = `${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  const core =
    start.getTime() === end.getTime()
      ? `${prefix}${start.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`
      : `${prefix}${startPart} – ${endPart}`;
  return `${core}${toleranceSuffix(tolerance)}`;
}

/** Best label for profile chip — prefers normalized short period. */
export function profilePeriodLabel(
  profile: {
    period?: string;
    periodStart?: string;
    periodEnd?: string;
    periodFlexible?: boolean;
    periodStartToleranceDays?: number;
    periodEndToleranceDays?: number;
  } | null | undefined
): string | null {
  if (!profile) return null;
  if (profile.period?.trim() && !profile.periodStart) {
    return profile.period.trim();
  }
  if (profile.periodStart && profile.periodEnd) {
    return formatPeriodRangeLabel(
      profile.periodStart,
      profile.periodEnd,
      profile.periodFlexible,
      {
        periodStartToleranceDays: profile.periodStartToleranceDays,
        periodEndToleranceDays: profile.periodEndToleranceDays,
      }
    );
  }
  const raw = profile.period?.trim();
  return raw || null;
}

/** True when destination/duration set but concrete dates missing. */
export function needsPeriodSelection(profile: {
  destination?: string;
  durationDays?: number | null;
  periodStart?: string;
  periodEnd?: string;
} | null | undefined): boolean {
  if (!profile?.destination?.trim() || !profile.durationDays || profile.durationDays <= 0) {
    return false;
  }
  return !profile.periodStart?.trim() || !profile.periodEnd?.trim();
}

export type PeriodConfirmPayload = {
  periodStart: string;
  periodEnd: string;
  period: string;
  periodFlexible: boolean;
  periodStartToleranceDays?: number;
  periodEndToleranceDays?: number;
};

export function buildPeriodConfirmPayload(
  periodStart: string,
  periodEnd: string,
  startTol: number,
  endTol: number
): PeriodConfirmPayload {
  const periodStartToleranceDays = startTol > 0 ? startTol : undefined;
  const periodEndToleranceDays = endTol > 0 ? endTol : undefined;
  const periodFlexible = startTol > 0 || endTol > 0;
  return {
    periodStart,
    periodEnd,
    periodFlexible,
    periodStartToleranceDays,
    periodEndToleranceDays,
    period: formatPeriodRangeLabel(periodStart, periodEnd, periodFlexible, {
      periodStartToleranceDays,
      periodEndToleranceDays,
    }),
  };
}
