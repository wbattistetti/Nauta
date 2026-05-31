/**
 * Derive legacy TripDraft view from canonical travel_state + DB columns.
 */

export type DraftLike = Record<string, unknown>;

export type TravelStateLike = {
  version?: number;
  travel_phase?: string;
  profile?: Record<string, unknown>;
};

export type RowLike = {
  draft?: DraftLike;
  itinerary?: unknown;
  current_day?: number | null;
};

/** Build draft for API responses — travel_state is source of truth when version === 1. */
export function deriveDraftFromTravelState(
  travelState: TravelStateLike | null | undefined,
  row: RowLike
): DraftLike {
  const stored = { ...(row.draft ?? {}) };

  if (!travelState?.version) {
    return stored;
  }

  const profile = travelState.profile ?? {};
  const itinerary = row.itinerary ?? stored.itinerary ?? null;
  const phase4WithDays =
    travelState.travel_phase === 'phase4' &&
    itinerary &&
    typeof itinerary === 'object' &&
    Array.isArray((itinerary as { days?: unknown[] }).days) &&
    ((itinerary as { days: unknown[] }).days.length ?? 0) > 0;

  return {
    ...stored,
    destinationNormalized: profile.destination ?? stored.destinationNormalized,
    durationDays: profile.durationDays ?? stored.durationDays,
    periodNormalized: profile.period ?? stored.periodNormalized,
    periodStart: profile.periodStart ?? stored.periodStart,
    periodEnd: profile.periodEnd ?? stored.periodEnd,
    style: profile.style ?? stored.style,
    ritmo: profile.ritmo ?? stored.ritmo,
    budget: profile.budget ?? stored.budget,
    alloggi: profile.alloggi ?? stored.alloggi,
    preferenze: profile.preferenze ?? stored.preferenze,
    itinerary,
    currentDay: row.current_day ?? (phase4WithDays ? 1 : stored.currentDay),
  };
}
