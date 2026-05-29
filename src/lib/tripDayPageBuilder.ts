/**
 * Builds DayPageData from trip itinerary JSON (F5).
 */
import type { TripItineraryDay } from '../types/trip';
import type {
  DayPageData,
  InternetSectionData,
  LogisticsData,
  TimelineStop,
  TransportData,
  WhatYouSeeItem,
} from '../types/dayPage';

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80';

function emojiForName(name: string): string {
  if (/temple|tempio|shrine/i.test(name)) return '⛩️';
  if (/museum|museo/i.test(name)) return '🏛️';
  if (/park|parco|garden/i.test(name)) return '🌳';
  if (/beach|spiaggia/i.test(name)) return '🏖️';
  if (/market|mercato/i.test(name)) return '🛍️';
  if (/food|ristor|eat/i.test(name)) return '🍜';
  return '📍';
}

function buildTimeline(day: TripItineraryDay): TimelineStop[] {
  const stops: TimelineStop[] = day.stops.map((s, i) => ({
    id: `stop-${day.day}-${i}`,
    kind: 'activity' as const,
    title: s.name,
    time: s.time,
    timeLabel: s.time ? 'Durata' : undefined,
    emoji: emojiForName(s.name),
  }));

  stops.push({
    id: `overnight-${day.day}`,
    kind: 'overnight',
    title: `Pernotto: ${day.sleep}`,
    emoji: '🛏️',
  });

  return stops;
}

function buildTransport(day: TripItineraryDay): TransportData {
  if (day.stops.length <= 1) {
    return {
      mode: 'none',
      message: 'Giornata sul posto — spostamenti minimi o a piedi.',
    };
  }
  return {
    mode: 'public',
    durationLabel: 'Spostamenti tra le tappe della giornata',
    schedule: day.stops.map((s) => s.name),
    ticketsPurchased: [],
    ticketsToBuy: ['Verifica biglietti e orari sul posto'],
    reservationsNeeded: [],
    warnings: day.notes ? [day.notes] : [],
  };
}

function buildInternet(): InternetSectionData {
  return {
    coverage: 'medium',
    coverageLabel: 'Media',
    deadZones: [],
    wifiHotspots: ['Hotel e caffè in centro'],
    tips: ['Scarica mappe offline per la giornata.'],
  };
}

function buildLogistics(day: TripItineraryDay): LogisticsData {
  return {
    shopping: [],
    fuelNotes: [],
    checkInNotes: day.sleep ? [`Pernotto: ${day.sleep}`] : [],
    permits: [],
    warnings: [],
    operationalNotes: day.notes ? [day.notes] : [],
  };
}

/** Assembles DayPageData for a single day from structured trip itinerary. */
export function buildDayPageFromTripDay(
  day: TripItineraryDay,
  totalDays: number
): DayPageData {
  const whatYouSee: WhatYouSeeItem[] = day.stops.map((s) => ({
    text: s.name,
    emoji: emojiForName(s.name),
  }));

  if (whatYouSee.length === 0 && day.title) {
    whatYouSee.push({ text: day.title, emoji: '🗺️' });
  }

  const location = day.title.includes('—')
    ? day.title.split('—').pop()!.trim()
    : day.title;

  return {
    dayNumber: day.day,
    isReturnDay: day.day === totalDays,
    heroTitle: `Giorno ${day.day} — ${location}`,
    heroPhoto: DEFAULT_HERO,
    whatYouSee,
    timeline: buildTimeline(day),
    overnight: {
      accommodationType: 'hotel',
      placeName: day.sleep,
      bookingStatus: 'to_book',
      bookingMessage: 'Verifica disponibilità e orari',
      amenities: {
        services: [],
        smartNotes: day.notes ? [day.notes] : [],
      },
    },
    transport: buildTransport(day),
    weatherPlace: location,
    internet: buildInternet(),
    logistics: buildLogistics(day),
  };
}
