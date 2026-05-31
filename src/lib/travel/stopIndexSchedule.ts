/**
 * Per-stop schedule lines for the itinerary index drawer.
 */
import type { TravelStop, UserProfile } from '../../types/travelState';
import { formatShortItalianDate } from './stopDetailHeadline';

function parseTripStart(profile: UserProfile | undefined): Date | null {
  const raw = profile?.periodStart?.trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayOffsetBefore(allStops: TravelStop[], stopIndex: number): number {
  return allStops
    .slice(0, stopIndex)
    .reduce((sum, s) => sum + Math.max(1, s.days || 1), 0);
}

export type StopIndexSchedule = {
  daysLabel: string;
  rangeLabel: string | null;
};

/** Days count + optional "dal … al …" when trip start is known. */
export function buildStopIndexSchedule(
  stop: TravelStop,
  stopIndex: number,
  allStops: TravelStop[],
  profile?: UserProfile
): StopIndexSchedule {
  const days = Math.max(1, stop.days || 1);
  const daysLabel = `${days} ${days === 1 ? 'giorno' : 'giorni'}`;

  const tripStart = parseTripStart(profile);
  if (!tripStart) {
    return { daysLabel, rangeLabel: null };
  }

  const stopStart = new Date(tripStart);
  stopStart.setDate(stopStart.getDate() + dayOffsetBefore(allStops, stopIndex));

  const stopEnd = new Date(stopStart);
  stopEnd.setDate(stopEnd.getDate() + Math.max(0, days - 1));

  return {
    daysLabel,
    rangeLabel: `dal ${formatShortItalianDate(stopStart)} al ${formatShortItalianDate(stopEnd)}`,
  };
}
