/**
 * Build legacy TripItinerary (days with stops/sleep) from TravelState for F5 UI.
 */

/**
 * @param {import('./types.js').TravelState} state
 */
export function buildTripItineraryFromTravelState(state) {
  const destination = state.profile.destination ?? '';
  const days = [];

  // Days in DB/UI only after lock (phase4) — never fake-expand stops early.
  if (state.locked && state.itinerary.days?.length) {
    for (const d of state.itinerary.days) {
      const stop = state.itinerary.stops.find((s) => s.id === d.stopId);
      days.push({
        day: d.day,
        title: d.title,
        stops: [{ name: d.stopName, time: '09:00' }],
        sleep: stop?.name ?? d.stopName,
        notes: d.notes,
      });
    }
  }

  return {
    destination,
    summary: state.itinerary.summary,
    days,
    stopsOnly: !state.locked && (state.itinerary.stops?.length ?? 0) > 0,
  };
}
