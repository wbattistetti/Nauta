/**
 * F5 day view — renders day/* components from trip itinerary JSON.
 */
import { useMemo } from 'react';
import type { TripDraft } from '../../types/trip';
import { buildDayPageFromTripDay } from '../../lib/tripDayPageBuilder';
import {
  DayHero,
  DayWhatYouSee,
  DayTimeline,
  DayTransport,
  DayInternetSection,
  DayLogistics,
} from '../day';

type Props = {
  draft: TripDraft;
  dayNumber: number;
};

export default function TripDayPanel({ draft, dayNumber }: Props) {
  const page = useMemo(() => {
    const days = draft.itinerary?.days ?? [];
    const day = days.find((d) => d.day === dayNumber);
    if (!day) return null;
    return buildDayPageFromTripDay(day, days.length);
  }, [draft.itinerary, dayNumber]);

  if (!page) {
    return (
      <p className="text-sm text-amber-200/70 text-center py-4">
        Giorno {dayNumber} non trovato nell&apos;itinerario.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-amber-900/40 bg-stone-900/80 p-4">
      <DayHero title={page.heroTitle} photo={page.heroPhoto} photoAlt={page.heroTitle} />
      <DayWhatYouSee items={page.whatYouSee} />
      <DayTimeline stops={page.timeline} />
      <DayTransport data={page.transport} />
      <DayInternetSection data={page.internet} />
      <DayLogistics data={page.logistics} />
    </div>
  );
}
