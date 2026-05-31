/**
 * Compact stop headline for itinerary detail (e.g. "4°: Catania, 3 giorni – dal 28/5 al 30/5").
 */
import type { TravelStop, UserProfile } from '../../types/travelState';

function parseTripStart(profile: UserProfile | undefined): Date | null {
  const raw = profile?.periodStart?.trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

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
  const daysLabel = `${stop.days} ${stop.days === 1 ? 'giorno' : 'giorni'}`;
  const place = stop.name.trim() || 'Tappa';

  const tripStart = parseTripStart(profile);
  if (!tripStart) {
    return `${ordinal}°: ${place}, ${daysLabel}`;
  }

  const dayOffset = allStops
    .slice(0, stopIndex)
    .reduce((sum, s) => sum + Math.max(1, s.days || 1), 0);

  const stopStart = new Date(tripStart);
  stopStart.setDate(stopStart.getDate() + dayOffset);

  const stopEnd = new Date(stopStart);
  stopEnd.setDate(stopEnd.getDate() + Math.max(0, (stop.days || 1) - 1));

  return `${ordinal}°: ${place}, ${daysLabel} – dal ${formatShortItalianDate(stopStart)} al ${formatShortItalianDate(stopEnd)}`;
}
