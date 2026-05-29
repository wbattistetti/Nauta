/**
 * Crowd / affluence scoring — season, weekday, place type, events, user tolerance.
 */
import { lookupItalyCity } from '../geoCatalog.js';

const MONTH_PEAK = {
  6: 1.15,
  7: 1.25,
  8: 1.2,
  4: 1.05,
  5: 1.08,
  9: 1.05,
  12: 1.1,
};

const MONTH_LOW = {
  1: 0.75,
  2: 0.78,
  3: 0.85,
  11: 0.88,
};

/**
 * Parse approximate trip start month (1–12) from profile period fields.
 * @param {import('../types.js').UserProfile} profile
 * @returns {number|null}
 */
export function parseTripStartMonth(profile) {
  const iso = profile.periodStart;
  if (iso && /^\d{4}-\d{2}/.test(iso)) {
    return Number(iso.slice(5, 7));
  }

  const text = [profile.period, profile.periodStart, profile.periodEnd]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const monthMap = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  for (const [name, m] of Object.entries(monthMap)) {
    if (text.includes(name)) return m;
  }
  if (/estate|agosto|luglio/.test(text)) return 7;
  if (/primavera|aprile|maggio/.test(text)) return 5;
  if (/autunno|ottobre|novembre/.test(text)) return 10;
  if (/inverno|dicembre|gennaio/.test(text)) return 12;
  return null;
}

/**
 * Season multiplier from month.
 * @param {number|null} month
 */
export function seasonCrowdMultiplier(month) {
  if (!month) return 1;
  if (MONTH_PEAK[month]) return MONTH_PEAK[month];
  if (MONTH_LOW[month]) return MONTH_LOW[month];
  return 1;
}

/**
 * Weekend multiplier when stop overlaps Sat/Sun in simulated calendar.
 * @param {number} dayIndex 0-based day offset from trip start
 * @param {number} stopDays
 */
export function weekendCrowdMultiplier(dayIndex, stopDays) {
  let max = 1;
  for (let d = 0; d < stopDays; d++) {
    const weekday = (dayIndex + d) % 7;
    if (weekday === 5 || weekday === 6) max = Math.max(max, 1.18);
  }
  return max;
}

/**
 * Local events bump (heuristic from period text + place).
 * @param {string} stopName
 * @param {import('../types.js').UserProfile} profile
 */
export function localEventsCrowdBump(stopName, profile) {
  const text = [profile.period, profile.preferenze].filter(Boolean).join(' ').toLowerCase();
  const city = lookupItalyCity(stopName);
  if (!city) return 0;

  if (/carnevale|venezia/.test(text) && city.key === 'venezia') return 0.25;
  if (/ferragosto|agosto/.test(text) && ['amalfi', 'costiera_amalfitana', 'cinque_terre'].includes(city.key)) {
    return 0.2;
  }
  if (/pasqua|natale/.test(text) && city.key === 'roma') return 0.15;
  return 0;
}

/**
 * Crowd score for one stop at a given trip day offset (0–1 scale).
 * @param {string} stopName
 * @param {import('../types.js').UserProfile} profile
 * @param {number} dayIndex
 * @param {number} stopDays
 */
export function computeStopCrowdScore(stopName, profile, dayIndex = 0, stopDays = 1) {
  const city = lookupItalyCity(stopName);
  const base = city?.crowdBase ?? 0.5;
  const month = parseTripStartMonth(profile);
  const season = seasonCrowdMultiplier(month);
  const weekend = weekendCrowdMultiplier(dayIndex, stopDays);
  const events = localEventsCrowdBump(stopName, profile);

  const raw = base * season * weekend + events;
  return Math.min(1, Math.max(0, raw));
}

/**
 * Sum crowd penalty across ordered stops (weighted by days).
 * @param {{ name: string, days: number }[]} ordered
 * @param {import('../types.js').UserProfile} profile
 */
export function computeRouteCrowdPenalty(ordered, profile) {
  let dayCursor = 0;
  let weightedSum = 0;
  let totalDays = 0;

  for (const stop of ordered) {
    const days = stop.days || 1;
    const score = computeStopCrowdScore(stop.name, profile, dayCursor, days);
    weightedSum += score * days;
    totalDays += days;
    dayCursor += days;
  }

  const avgScore = totalDays ? weightedSum / totalDays : 0;
  return { penalty: weightedSum, avgScore, totalDays };
}
