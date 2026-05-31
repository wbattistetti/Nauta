/**
 * F5 day view — renders day/* components from trip itinerary JSON.
 */
import { useMemo, useState } from 'react';
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
  /** In chat flow — no second hero image (single top band only). */
  embedded?: boolean;
};

type SectionKey = 'whatYouSee' | 'timeline' | 'transport' | 'internet' | 'logistics';

const DEFAULT_OPEN: Record<SectionKey, boolean> = {
  whatYouSee: true,
  timeline: false,
  transport: false,
  internet: false,
  logistics: false,
};

export default function TripDayPanel({ draft, dayNumber, embedded = false }: Props) {
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN);
  const [mapOpen, setMapOpen] = useState(false);

  const page = useMemo(() => {
    const days = draft.itinerary?.days ?? [];
    const day = days.find((d) => d.day === dayNumber);
    if (!day) return null;
    return buildDayPageFromTripDay(day, days.length);
  }, [draft.itinerary, dayNumber]);

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!page) {
    return (
      <p className="text-sm text-amber-200/70 text-center py-4">
        Giorno {dayNumber} non trovato nell&apos;itinerario.
      </p>
    );
  }

  const timelineStops = page.timeline.filter((stop) => stop.kind !== 'overnight');

  return (
    <div
      className={
        embedded
          ? 'space-y-2'
          : 'space-y-3 rounded-2xl border border-amber-900/40 bg-stone-900/80 p-4'
      }
    >
      {embedded ? (
        <h2 className="text-sm font-semibold text-amber-50/95 px-1">{page.heroTitle}</h2>
      ) : (
        <DayHero title={page.heroTitle} photo={page.heroPhoto} photoAlt={page.heroTitle} />
      )}
      <DayWhatYouSee
        items={page.whatYouSee}
        open={openSections.whatYouSee}
        onToggle={() => toggleSection('whatYouSee')}
      />
      <DayTimeline
        stops={timelineStops}
        overnight={page.overnight}
        open={openSections.timeline}
        onToggle={() => toggleSection('timeline')}
      />
      <DayTransport
        transport={page.transport}
        mapOpen={mapOpen}
        onToggleMap={() => setMapOpen((v) => !v)}
        open={openSections.transport}
        onToggle={() => toggleSection('transport')}
      />
      <DayInternetSection
        data={page.internet}
        open={openSections.internet}
        onToggle={() => toggleSection('internet')}
      />
      <DayLogistics
        data={page.logistics}
        open={openSections.logistics}
        onToggle={() => toggleSection('logistics')}
      />
    </div>
  );
}
