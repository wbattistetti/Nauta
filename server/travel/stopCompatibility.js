/**
 * Deterministic stop vs user profile compatibility (primaryTheme + residual themes).
 */
import { normalizeThemeList } from './themes.js';

/** @typedef {'salvabile'|'borderline'|'incompatibile'} StopCompatibility */

/**
 * @param {{ primaryTheme?: string, themes?: string[] }} stop
 * @param {{ dislikes?: string[] }} userProfile
 * @returns {StopCompatibility}
 */
export function evaluateStopCompatibility(stop, userProfile) {
  const dislikes = normalizeThemeList(userProfile?.dislikes ?? []);
  const themes = normalizeThemeList(stop.themes ?? []);
  const primary = stop.primaryTheme ?? themes[0] ?? null;

  if (primary && dislikes.includes(primary)) {
    return 'borderline';
  }

  const residual = themes.filter((t) => !dislikes.includes(t));
  if (residual.length >= 3) return 'salvabile';
  if (residual.length >= 1) return 'borderline';
  return 'incompatibile';
}

/**
 * @param {import('./types.js').TravelStop[]} stops
 * @param {import('./types.js').UserProfile} profile
 */
export function annotateStopsCompatibility(stops, profile) {
  return stops.map((s) => ({
    ...s,
    compatibility: evaluateStopCompatibility(s, profile),
  }));
}
