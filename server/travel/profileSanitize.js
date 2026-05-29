/**
 * Coerce UserProfile fields from AI/DB — avoids .trim() on non-strings.
 */
import { normalizeThemeList } from './themes.js';

/** @param {unknown} value */
export function asOptionalString(value) {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t || undefined;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    const o = /** @type {Record<string, unknown>} */ (value);
    if (o.start != null || o.end != null) {
      const start = asOptionalString(o.start);
      const end = asOptionalString(o.end);
      if (start && end) return `${start} – ${end}`;
      return start ?? end;
    }
    if (typeof o.label === 'string') return asOptionalString(o.label);
    if (typeof o.text === 'string') return asOptionalString(o.text);
  }
  return undefined;
}

/** @param {unknown} value */
export function asDurationDays(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

/** Expand period object in patch into flat fields. */
export function expandPeriodInPatch(patch) {
  if (!patch || typeof patch !== 'object') return patch;
  const out = { ...patch };
  const period = patch.period;
  if (period && typeof period === 'object') {
    const o = /** @type {Record<string, unknown>} */ (period);
    if (o.start != null) out.periodStart = o.start;
    if (o.end != null) out.periodEnd = o.end;
    out.period = asOptionalString(period);
  }
  return out;
}

/** @param {unknown} v */
function normalizeTravelerType(v) {
  const s = asOptionalString(v)?.toLowerCase();
  if (s === 'solo' || s === 'couples' || s === 'family' || s === 'friends') return s;
  if (s === 'coppia' || s === 'coppie') return 'couples';
  if (s === 'famiglia') return 'family';
  if (s === 'amici') return 'friends';
  return undefined;
}

/** @param {unknown} v */
function normalizeAgeBand(v) {
  const s = asOptionalString(v);
  if (!s) return undefined;
  const compact = s.replace(/\s/g, '');
  if (['18-25', '25-35', '35-50', '50+'].includes(compact)) return compact;
  if (/50\+|oltre50|over50/i.test(s)) return '50+';
  if (/35.?50|35-50/i.test(s)) return '35-50';
  if (/25.?35|25-35/i.test(s)) return '25-35';
  if (/18.?25|18-25/i.test(s)) return '18-25';
  return undefined;
}

/** @param {import('./types.js').UserProfile|Record<string, unknown>} profile */
export function sanitizeUserProfile(profile) {
  const p = profile ?? {};
  let period = asOptionalString(p.period);
  const periodStart = asOptionalString(p.periodStart);
  const periodEnd = asOptionalString(p.periodEnd);
  if (!period && periodStart && periodEnd) {
    period = `${periodStart} – ${periodEnd}`;
  }

  const travelerType = normalizeTravelerType(p.travelerType);
  const ageBand = normalizeAgeBand(p.ageBand);

  return {
    destination: asOptionalString(p.destination),
    durationDays: asDurationDays(p.durationDays),
    period,
    periodStart,
    periodEnd,
    travelerType,
    ageBand,
    preferencesPresetId: asOptionalString(p.preferencesPresetId),
    panelsReviewed: p.panelsReviewed === true,
    style: asOptionalString(p.style),
    ritmo: asOptionalString(p.ritmo),
    budget: asOptionalString(p.budget),
    alloggi: asOptionalString(p.alloggi),
    preferenze: asOptionalString(p.preferenze),
    likes: normalizeThemeList(p.likes ?? []),
    dislikes: normalizeThemeList(p.dislikes ?? []),
  };
}

/** @param {import('./types.js').TravelState} state */
export function sanitizeTravelState(state) {
  if (!state) return state;
  state.profile = sanitizeUserProfile(state.profile);
  if (state.profile.durationDays == null && state.profile.durationDays !== 0) {
    /* keep null */
  }
  return state;
}
