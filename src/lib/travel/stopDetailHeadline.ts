/**
 * Compact stop headline for itinerary detail (e.g. "4°: Catania, 3 giorni – dal 28/5 al 30/5").
 */
import type { TravelStop, UserProfile } from '../../types/travelState';
import { buildStopIndexSchedule } from './stopIndexSchedule';

/** Day/month without year (Italian locale style). */
export function formatShortItalianDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/** One-line stop summary for detail panel. */
export function buildStopDetailHeadline(
  stop: TravelStop,
  stopIndex: number,
  allStops: TravelStop[],
  profile?: UserProfile
): string {
  const ordinal = stopIndex + 1;
  const place = stop.name.trim() || 'Tappa';
  const { daysLabel, rangeLabel } = buildStopIndexSchedule(stop, stopIndex, allStops, profile);

  if (!rangeLabel) {
    return `${ordinal}°: ${place}, ${daysLabel}`;
  }

  return `${ordinal}°: ${place}, ${daysLabel} – ${rangeLabel}`;
}
