/**
 * Planner — AI generates or recalculates stop-based itinerary.
 */
import { randomUUID } from 'crypto';
import { callOpenAiJson } from './openaiJson.js';
import { normalizeThemeList, THEME_IDS } from './themes.js';
import { postProcessStopsWithMeta } from './itineraryPostProcess.js';

const PLANNER_SYSTEM = `Sei il Planner di Nauta. Genera tappe (stops) per un viaggio.
Rispondi SOLO JSON:
{
  "stops": [
    { "name": "...", "region": "...", "days": number, "themes": ["nature","museums",...], "primaryTheme": "...", "notes": "..." }
  ],
  "summary": "1 frase",
  "candidates": [{ "id": "...", "name": "...", "region": "...", "themes": [] }]
}

Temi ammessi (tassonomia universale): ${THEME_IDS.join(', ')}.
Usa primaryTheme coerente con i themes della tappa. Evita etichette vaghe — preferisci museums, art_ancient, historic_sites, archaeology, local_food, ecc.
La somma di days deve essere uguale a durationDays del profilo.
NON menzionare nel summary fascia d'età, "coppia", "over 50", tipo viaggio o logistica ("ordinato per ridurre spostamenti").
Per replacement_candidates: 2-3 candidates alternative alla tappa indicata, stops vuoto.`;

/**
 * @param {'generate_initial'|'recalculate'|'replacement_candidates'} task
 * @param {import('./types.js').TravelState} state
 * @param {Record<string, unknown>} [context]
 * @param {string} tripId
 */
export async function runPlanner(task, state, context, tripId) {
  const user = `TASK: ${task}\nCONTEXT: ${JSON.stringify(context ?? {})}\nSTATO:\n${JSON.stringify(state, null, 2)}`;

  const { parsed } = await callOpenAiJson({
    system: PLANNER_SYSTEM,
    user,
    maxTokens: task === 'replacement_candidates' ? 800 : 2500,
    purpose: `TRAVEL_PLANNER_${task.toUpperCase()}`,
    tripId,
  });

  if (task === 'replacement_candidates') {
    const candidates = Array.isArray(parsed?.candidates)
      ? parsed.candidates.map((c) => ({
          id: String(c.id ?? randomUUID()),
          name: String(c.name ?? ''),
          region: c.region ? String(c.region) : undefined,
          themes: normalizeThemeList(c.themes ?? []),
        }))
      : [];
    return { candidates, stops: null, summary: null };
  }

  const rawStops = Array.isArray(parsed?.stops) ? parsed.stops : [];
  const stops = rawStops.map((s) => {
    const themes = normalizeThemeList(s.themes ?? []);
    const primaryTheme = themes[0] ?? 'museums';
    return {
      id: randomUUID(),
      name: String(s.name ?? 'Tappa'),
      region: s.region ? String(s.region) : undefined,
      days: Math.max(1, Number(s.days) || 1),
      themes: themes.length ? themes : [primaryTheme],
      primaryTheme,
      notes: s.notes ? String(s.notes) : undefined,
    };
  });

  const optimized = postProcessStopsWithMeta(stops, state.profile);

  return {
    stops: optimized.stops,
    summary: undefined,
    optimization: {
      score: optimized.score,
      alternatives: optimized.alternatives,
    },
    candidates: null,
  };
}
