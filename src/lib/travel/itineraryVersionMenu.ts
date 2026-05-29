/**
 * Itinerary version labels, payoff lines, and menu entries for trip burger menu.
 */
import type {
  ItineraryVersion,
  ItineraryVersionProfileSnapshot,
  TravelState,
  UserProfile,
} from '../../types/travelState';
import {
  ALL_THEME_OPTIONS,
  STYLE_OPTIONS,
} from './preferenceOptions';

export const CURRENT_ITINERARY_VERSION_ID = '__current__';

export type ItineraryMenuEntry = {
  id: string;
  label: string;
  payoffSummary: string;
  isActive: boolean;
};

const themeLabel = new Map(ALL_THEME_OPTIONS.map((o) => [o.id, o.label]));

export function itineraryVersionDisplayLabel(index: number): string {
  return `Itinerario ${index}`;
}

/** Normalize legacy "Proposta N" labels to Itinerario N. */
export function normalizeStoredVersionLabel(label: string, index: number): string {
  if (/^(Proposta|Itinerario)\s+\d+$/i.test(label.trim())) {
    return itineraryVersionDisplayLabel(index);
  }
  return label;
}

export function buildItineraryVersionPayoff(
  profile: Pick<UserProfile, 'likes' | 'style' | 'ritmo' | 'budget' | 'durationDays'>,
  stopCount: number,
  maxThemes = 2
): string {
  const labels: string[] = [];
  for (const opt of ALL_THEME_OPTIONS) {
    if ((profile.likes ?? []).includes(opt.id)) labels.push(opt.label);
    if (labels.length >= maxThemes) break;
  }

  const styleId = (profile.style ?? profile.ritmo)?.toLowerCase();
  const paceLabel = STYLE_OPTIONS.find((o) => o.id === styleId)?.label;

  const parts: string[] = [];
  if (labels.length > 0) {
    parts.push(labels.join(' + '));
  } else if (paceLabel) {
    parts.push(paceLabel);
  }

  if (stopCount > 0) {
    parts.push(stopCount === 1 ? '1 tappa' : `${stopCount} tappe`);
  }
  if (profile.durationDays && profile.durationDays > 0) {
    parts.push(`${profile.durationDays} giorni`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Itinerario in preparazione';
}

export function profileSnapshotFromProfile(profile: UserProfile): ItineraryVersionProfileSnapshot {
  return {
    likes: [...(profile.likes ?? [])],
    durationDays: profile.durationDays ?? null,
    style: profile.style,
    ritmo: profile.ritmo,
    budget: profile.budget,
  };
}

function payoffForVersion(version: ItineraryVersion, index: number, fallbackProfile: UserProfile): string {
  const stopCount = version.stops?.length ?? 0;
  if (version.payoffSummary?.trim()) return version.payoffSummary;
  const snap = version.profileSnapshot;
  if (snap) {
    return buildItineraryVersionPayoff(
      {
        likes: snap.likes,
        style: snap.style,
        ritmo: snap.ritmo,
        budget: snap.budget,
        durationDays: snap.durationDays ?? undefined,
      },
      stopCount
    );
  }
  return buildItineraryVersionPayoff(fallbackProfile, stopCount);
}

/** Ordered menu rows: saved versions + live current when not viewing a snapshot. */
export function buildItineraryMenuEntries(state: TravelState | null | undefined): ItineraryMenuEntry[] {
  if (!state?.itinerary || !Array.isArray(state.itinerary.stops)) return [];

  const history = state.itineraryHistory ?? [];
  const entries: ItineraryMenuEntry[] = [];

  history.forEach((v, i) => {
    const index = i + 1;
    entries.push({
      id: v.id,
      label: normalizeStoredVersionLabel(v.label, index),
      payoffSummary: payoffForVersion(v, index, state.profile),
      isActive: state.activeItineraryVersionId === v.id,
    });
  });

  const stopCount = state.itinerary.stops.length;
  if (stopCount > 0 && !state.activeItineraryVersionId) {
    const index = history.length + 1;
    entries.push({
      id: CURRENT_ITINERARY_VERSION_ID,
      label: itineraryVersionDisplayLabel(index),
      payoffSummary: buildItineraryVersionPayoff(state.profile, stopCount),
      isActive: true,
    });
  }

  return entries;
}

/** Active trip + itinerary version for chat header context (e.g. "Viaggio in Sicilia · Itinerario 2"). */
export function buildTripItineraryContextLine(state: TravelState | null | undefined): string | null {
  const dest = state?.profile?.destination?.trim();
  if (!dest) return null;

  const entries = buildItineraryMenuEntries(state);
  if (entries.length === 0) return `Viaggio in ${dest}`;

  const active = entries.find((e) => e.isActive) ?? entries[entries.length - 1];
  return `Viaggio in ${dest} · ${active.label}`;
}

/** Coerce trip row travel_state JSON into TravelState when possible. */
export function travelStateFromTripRecord(
  trip: { travel_state?: Record<string, unknown> }
): TravelState | null {
  const raw = trip.travel_state;
  if (!raw || typeof raw !== 'object') return null;
  const ts = raw as TravelState;
  if (!ts.profile || !ts.itinerary) return null;
  return ts;
}
