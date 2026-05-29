/** Types for the rebuilt “Giorno X” page — all UI data comes from DayPageData. */

export type TransportMode = 'camper' | 'car' | 'public' | 'taxi' | 'flight' | 'none';

export type TimelineStopKind =
  | 'departure'
  | 'waypoint'
  | 'arrival'
  | 'activity'
  | 'logistics'
  | 'tour'
  | 'overnight';

export type AccommodationType =
  | 'hotel'
  | 'camper'
  | 'tent'
  | 'pullout'
  | 'lodge'
  | 'campground'
  | 'other';

export type BookingStatus = 'booked' | 'to_book' | 'reminder';

export type WhatYouSeeItem = {
  text: string;
  emoji: string;
};

export type TimelineStop = {
  id: string;
  kind: TimelineStopKind;
  title: string;
  description?: string;
  time?: string;
  timeLabel?: string;
  emoji: string;
};

export type OvernightAmenities = {
  services?: string[];
  parking?: string;
  safety?: string;
  noise?: string;
  signal?: string;
  alternatives?: string[];
  smartNotes?: string[];
};

export type OvernightData = {
  accommodationType: AccommodationType;
  placeName: string;
  bookingStatus: BookingStatus;
  bookingMessage?: string;
  amenities: OvernightAmenities;
};

export type DriveTransport = {
  mode: 'camper' | 'car';
  km: number;
  durationMin: number;
  departureTime: string;
  arrivalTime: string;
  suggestedStops: string[];
  notes: string[];
};

export type PublicTransport = {
  mode: 'public';
  durationLabel: string;
  schedule: string[];
  ticketsPurchased: string[];
  ticketsToBuy: string[];
  reservationsNeeded: string[];
  warnings: string[];
};

export type TaxiTransport = {
  mode: 'taxi';
  durationLabel: string;
  estimatedCost?: string;
  notes: string[];
};

export type FlightTransport = {
  mode: 'flight';
  departureTime: string;
  terminal?: string;
  notes: string[];
};

export type NoTransport = {
  mode: 'none';
  message: string;
};

export type TransportData =
  | DriveTransport
  | PublicTransport
  | TaxiTransport
  | FlightTransport
  | NoTransport;

export type WeatherSectionData = {
  locationLabel: string;
  dateLabel: string;
  timeWindow?: string;
  tempC: number | null;
  windKmh: number | null;
  precipitationLabel: string | null;
  description: string | null;
  detailUrl: string;
  loading: boolean;
  unavailable: boolean;
};

export type InternetCoverage = 'good' | 'medium' | 'absent';

export type InternetSectionData = {
  coverage: InternetCoverage;
  coverageLabel: string;
  deadZones: string[];
  wifiHotspots: string[];
  tips: string[];
};

export type LogisticsData = {
  shopping: string[];
  fuelNotes: string[];
  checkInNotes: string[];
  permits: string[];
  warnings: string[];
  operationalNotes: string[];
};

/** Optional per-day overrides on itinerary entries. */
export type DayPageOverrides = {
  transportMode?: TransportMode;
  whatYouSee?: { text: string; emoji?: string }[];
  timeline?: (Omit<TimelineStop, 'id'> & { id?: string })[];
  overnight?: OvernightData;
  transport?: TransportData;
  internet?: InternetSectionData;
  logistics?: LogisticsData;
};

export type DayPageData = {
  dayNumber: number;
  isReturnDay: boolean;
  heroTitle: string;
  heroPhoto: string;
  whatYouSee: WhatYouSeeItem[];
  timeline: TimelineStop[];
  overnight: OvernightData;
  transport: TransportData;
  weatherPlace: string;
  internet: InternetSectionData;
  logistics: LogisticsData;
};
