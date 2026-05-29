/**
 * After itinerary lock: expand stops into day rows (deterministic).
 */

/**
 * @param {{ id: string, name: string, days: number, themes?: string[], notes?: string }[]} stops
 * @returns {{ day: number, stopId: string, stopName: string, title: string, themes: string[], notes?: string }[]}
 */
export function expandStopsToDays(stops) {
  const days = [];
  let dayNum = 1;
  for (const stop of stops) {
    const n = Math.max(1, Math.floor(Number(stop.days) || 1));
    for (let d = 0; d < n; d++) {
      const suffix = n > 1 ? ` — giorno ${d + 1}/${n}` : '';
      days.push({
        day: dayNum,
        stopId: stop.id,
        stopName: stop.name,
        title: `${stop.name}${suffix}`,
        themes: stop.themes ?? [],
        notes: stop.notes,
      });
      dayNum += 1;
    }
  }
  return days;
}
