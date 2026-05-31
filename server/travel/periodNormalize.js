/**
 * Normalize vague Italian travel periods into ISO dates and short labels.
 */

const MONTHS = {
  gennaio: 0,
  febbraio: 1,
  marzo: 2,
  aprile: 3,
  maggio: 4,
  giugno: 5,
  luglio: 6,
  agosto: 7,
  settembre: 8,
  ottobre: 9,
  novembre: 10,
  dicembre: 11,
};

const MONTH_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

const WORD_NUM = {
  uno: 1,
  una: 1,
  due: 2,
  tre: 3,
  quattro: 4,
  cinque: 5,
};

/** @param {string} value */
function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** @param {string} token */
function parseMonthToken(token) {
  const key = normalizeText(token);
  return MONTHS[key] ?? null;
}

/** @param {string} token */
function parseCount(token) {
  const t = normalizeText(token);
  if (/^\d+$/.test(t)) return Number(t);
  return WORD_NUM[t] ?? null;
}

/** @param {number} year @param {number} monthIndex */
function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** @param {Date} date */
function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** @param {string} iso */
function parseIsoDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? '').trim());
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** @param {number} monthIndex @param {Date} ref */
function inferYear(monthIndex, ref) {
  const year = ref.getFullYear();
  if (monthIndex < ref.getMonth() - 1) return year + 1;
  return year;
}

/**
 * @param {number} monthIndex
 * @param {number} dayStart
 * @param {number} dayEnd
 * @param {Date} ref
 */
function rangeInMonth(monthIndex, dayStart, dayEnd, ref) {
  const year = inferYear(monthIndex, ref);
  const dim = daysInMonth(year, monthIndex);
  const start = Math.max(1, Math.min(dayStart, dim));
  const end = Math.max(start, Math.min(dayEnd, dim));
  return {
    start: new Date(year, monthIndex, start),
    end: new Date(year, monthIndex, end),
  };
}

/**
 * @param {string} segment
 * @param {Date} ref
 * @returns {{ start: Date, end: Date } | null}
 */
function parseSegment(segment, ref) {
  const text = normalizeText(segment);
  if (!text) return null;

  let match = text.match(/ultim[ae]\s+settimana\s+(?:di\s+)?([a-z]+)/);
  if (match) {
    const month = parseMonthToken(match[1]);
    if (month == null) return null;
    const dim = daysInMonth(inferYear(month, ref), month);
    return rangeInMonth(month, dim - 6, dim, ref);
  }

  match = text.match(/prim[ae]\s+settimana\s+(?:di\s+)?([a-z]+)/);
  if (match) {
    const month = parseMonthToken(match[1]);
    if (month == null) return null;
    return rangeInMonth(month, 1, 7, ref);
  }

  match = text.match(/prime?\s+(\w+)\s+settimane?\s+(?:di\s+)?([a-z]+)/);
  if (match) {
    const count = parseCount(match[1]);
    const month = parseMonthToken(match[2]);
    if (month == null || !count) return null;
    return rangeInMonth(month, 1, count * 7, ref);
  }

  match = text.match(/ultim[ae]\s+(\w+)\s+settimane?\s+(?:di\s+)?([a-z]+)/);
  if (match) {
    const count = parseCount(match[1]);
    const month = parseMonthToken(match[2]);
    if (month == null || !count) return null;
    const year = inferYear(month, ref);
    const dim = daysInMonth(year, month);
    const start = Math.max(1, dim - count * 7 + 1);
    return rangeInMonth(month, start, dim, ref);
  }

  match = text.match(/(\d{1,2})\s+([a-z]+)\s*(?:-|–|a|al)\s*(\d{1,2})\s+([a-z]+)/);
  if (match) {
    const monthStart = parseMonthToken(match[2]);
    const monthEnd = parseMonthToken(match[4]);
    if (monthStart == null) return null;
    const monthEndIdx = monthEnd ?? monthStart;
    const yearStart = inferYear(monthStart, ref);
    const yearEnd = monthEndIdx < monthStart ? yearStart + 1 : inferYear(monthEndIdx, ref);
    const start = new Date(yearStart, monthStart, Number(match[1]));
    const end = new Date(yearEnd, monthEndIdx, Number(match[3]));
    if (end < start) return null;
    return { start, end };
  }

  match = text.match(/(?:dal?\s+)?(\d{1,2})\s+([a-z]+)\s+(?:al?\s+)?(\d{1,2})\s+([a-z]+)/);
  if (match) {
    return parseSegment(`${match[1]} ${match[2]} - ${match[3]} ${match[4]}`, ref);
  }

  return null;
}

/**
 * @param {string} text
 * @param {Date} ref
 * @returns {{ start: Date, end: Date } | null}
 */
export function parseItalianPeriodText(text, ref = new Date()) {
  const raw = String(text ?? '').trim();
  if (!raw) return null;

  const isoPair = raw.match(/(\d{4}-\d{2}-\d{2})\s*(?:-|–|a|al)\s*(\d{4}-\d{2}-\d{2})/);
  if (isoPair) {
    const start = parseIsoDate(isoPair[1]);
    const end = parseIsoDate(isoPair[2]);
    if (start && end && end >= start) return { start, end };
  }

  const parts = raw
    .split(/\s*,\s*|\s+e\s+|\s*&\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);

  /** @type {{ start: Date, end: Date }[]} */
  const ranges = [];
  for (const part of parts.length ? parts : [raw]) {
    const r = parseSegment(part, ref);
    if (r) ranges.push(r);
  }

  if (!ranges.length) {
    const single = parseSegment(raw, ref);
    if (single) ranges.push(single);
  }

  if (!ranges.length) return null;

  const start = ranges.reduce((min, r) => (r.start < min ? r.start : min), ranges[0].start);
  const end = ranges.reduce((max, r) => (r.end > max ? r.end : max), ranges[0].end);
  return { start, end };
}

/**
 * @param {Date} start
 * @param {Date} end
 * @param {boolean} [flexible]
 */
export function formatPeriodLabel(start, end, flexible = false) {
  const prefix = flexible ? 'circa ' : '';
  const sameYear = start.getFullYear() === end.getFullYear();
  const startPart = `${start.getDate()} ${MONTH_SHORT[start.getMonth()]}`;
  const endPart = sameYear
    ? `${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`
    : `${end.getDate()} ${MONTH_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  if (sameYear && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) {
    return `${prefix}${start.getDate()} ${MONTH_SHORT[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${prefix}${startPart} – ${endPart}`;
}

/**
 * @param {string} startIso
 * @param {string} endIso
 * @param {boolean} [flexible]
 */
export function formatPeriodFromIso(startIso, endIso, flexible = false) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (!start || !end) return '';
  return formatPeriodLabel(start, end, flexible);
}

/**
 * @param {string} startIso
 * @param {string} endIso
 * @param {boolean} [flexible]
 * @param {{ startTol?: number, endTol?: number }} [tol]
 */
export function formatPeriodFromIsoWithTolerance(startIso, endIso, flexible = false, tol = {}) {
  let label = formatPeriodFromIso(startIso, endIso, flexible);
  const parts = [];
  if (tol.startTol && tol.startTol > 0) parts.push(`±${tol.startTol}g inizio`);
  if (tol.endTol && tol.endTol > 0) parts.push(`±${tol.endTol}g fine`);
  if (parts.length) label += ` (${parts.join(', ')})`;
  return label;
}

/**
 * @param {object} input
 * @param {string} [input.period]
 * @param {string} [input.periodStart]
 * @param {string} [input.periodEnd]
 * @param {boolean} [input.periodFlexible]
 * @param {Date} [input.referenceDate]
 */
export function normalizeTravelPeriod(input) {
  const ref = input.referenceDate instanceof Date ? input.referenceDate : new Date();
  let start = parseIsoDate(input.periodStart);
  let end = parseIsoDate(input.periodEnd);
  const flexible = input.periodFlexible === true;

  if (!start || !end || end < start) {
    const parsed = parseItalianPeriodText(input.period ?? '', ref);
    if (parsed) {
      start = parsed.start;
      end = parsed.end;
    }
  }

  if (!start || !end) {
    return {
      period: input.period?.trim() || undefined,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      periodFlexible: flexible || undefined,
    };
  }

  const periodStart = toIsoDate(start);
  const periodEnd = toIsoDate(end);
  const period = formatPeriodLabel(start, end, flexible);

  return { period, periodStart, periodEnd, periodFlexible: flexible || undefined };
}
