/**
 * Short index labels for itinerary stops (2 keywords for sidebar rows).
 */
import type { TravelStop } from '../../types/travelState';
import { ALL_THEME_OPTIONS } from './preferenceOptions';

const themeLabel = new Map(ALL_THEME_OPTIONS.map((o) => [o.id, o.label]));

/** Two-word-style caption for stop index rows. */
export function stopMicroKeywords(stop: TravelStop, maxWords = 2): string {
  const themes = stop.themes?.length
    ? stop.themes
    : stop.primaryTheme
      ? [stop.primaryTheme]
      : [];

  const labels = themes
    .map((t) => themeLabel.get(t) ?? t)
    .filter(Boolean)
    .slice(0, maxWords);

  if (labels.length >= 2) return labels.join(' · ');
  if (labels.length === 1 && stop.region) return `${labels[0]} · ${stop.region.split(/[\s,]/)[0]}`;
  if (labels.length === 1) return labels[0];
  if (stop.region) return stop.region;
  return `${stop.days} ${stop.days === 1 ? 'giorno' : 'giorni'}`;
}
