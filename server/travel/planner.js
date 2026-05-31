/**
 * Planner — AI generates or recalculates stop-based itinerary.
 */
import { randomUUID } from 'crypto';
import { callOpenAiJson } from './openaiJson.js';
import { normalizeThemeList, THEME_IDS } from './themes.js';
import { postProcessStopsWithMeta } from './itineraryPostProcess.js';
import { validatePlaceLinksForStop } from './wikipediaPlaceLinks.js';

const NOTES_GUIDE = `NOTES (campo obbligatorio per ogni tappa):
- Scrivi in italiano una mini scheda informativa di 6–10 frasi (circa 120–220 parole).
- Stile: guida di viaggio concreta, non slogan. Niente frasi vuote tipo "scopri la bellezza del luogo".
- In ogni notes includi, quando pertinente:
  1) cosa si vede e perché vale la pena;
  2) luoghi, parchi, quartieri o siti specifici (nomi reali);
  3) fauna, paesaggi, musei, cibo, bevande tipiche o esperienze/attività turistiche — con esempi nominativi (rafting, trekking, safari, pesca, snorkeling, mercati, festival…);
  4) cosa fare con i giorni previsti (ritmo coerente con il profilo);
  5) un suggerimento pratico (es. escursione, mercato, tramonto, snorkeling).
- Allinea il tono ai themes/primaryTheme della tappa e alle preferenze del profilo (likes, style, ritmo).
- Separa le frasi con spazi normali; puoi usare due paragrafi brevi separati da "\\n\\n" se utile.

PLACE_LINKS (campo obbligatorio per ogni tappa):
- placeLinks: array di 5–10 voci da approfondire su Wikipedia, tutte citate in notes.
- Obiettivo: linkare tutto ciò che ha senso turistico per quella tappa — ciò che un viaggiatore vorrebbe approfondire.
- Tipi ammessi (scegli ciò che compare davvero in notes):
  1) luoghi e territori (città, frazioni, parchi, siti UNESCO, valli, isole);
  2) cibo e bevande tipiche (pici, pecorino, sake, Brunello, birra belga, caffè turco);
  3) patrimonio culturale (musei, chiese, centri storici, quartieri, monumenti, siti archeologici);
  4) natura e fauna (glaciari, fiordi, savana, barriera corallina, specie iconiche citate nel testo);
  5) attività ed esperienze turistiche (terme, mercati, festival, trail, vía ferrata);
  6) sport e outdoor (rafting, kayak, trekking, sci, surf, immersioni, pesca sportiva, safari, dog sledding);
  7) eventi o istituzioni nominati (biennale, parco nazionale Denali, Serengeti se citato nel contesto della tappa).
- Esempi di mapping label → wikiTitle:
  - "rafting" in Alaska → wikiTitle "Rafting" o fiume/parco locale citato in notes;
  - "safari" in Tanzania → wikiTitle del parco o area citata (es. "Serengeti"), non un articolo generico;
  - "pesca" in Lofoten → luogo o tipo di pesca locale se esiste voce pertinente;
  - "piscine di acqua calda" → wikiTitle del borgo (es. "Bagno Vignoni"), non concetto generico.
- Ogni voce: { "label": "testo ESATTO come compare in notes", "wikiTitle": "titolo voce it.wikipedia.org", "wikiSection": "anchor sezione opzionale" }.
- label: sottostringa identica di notes (stessa grafia).
- wikiTitle: voce Wikipedia italiana plausibile e specifica per la tappa. Se label è descrittivo/generico, wikiTitle = luogo, sito, parco, piatto, attività o museo locale citato nel contesto.
- wikiSection: solo se conosci un titolo di sezione plausibile; altrimenti ometti.
- Non linkare aggettivi vuoti (bello, famoso) né parole troppo vaghe da sole (cibo, viaggio, natura).
- Preferisci link concreti e utili: ciò che rende quella tappa unica per chi legge.`;

const PLANNER_SYSTEM = `Sei il Planner di Nauta. Genera tappe (stops) per un viaggio.
Rispondi SOLO JSON:
{
  "stops": [
    {
      "name": "...",
      "region": "...",
      "days": number,
      "themes": ["nature","museums",...],
      "primaryTheme": "...",
      "notes": "...",
      "placeLinks": [
        { "label": "Pienza", "wikiTitle": "Pienza" },
        { "label": "piscine di acqua calda", "wikiTitle": "Bagno Vignoni" },
        { "label": "pici", "wikiTitle": "Pici" }
      ]
    }
  ],
  "summary": "1 frase",
  "candidates": [{ "id": "...", "name": "...", "region": "...", "themes": [] }]
}

${NOTES_GUIDE}

Temi ammessi (tassonomia universale): ${THEME_IDS.join(', ')}.
Usa primaryTheme coerente con i themes della tappa. Evita etichette vaghe — preferisci museums, art_ancient, historic_sites, archaeology, local_food, ecc.
La somma di days deve essere uguale a durationDays del profilo.
NON menzionare nel summary fascia d'età, "coppia", "over 50", tipo viaggio o logistica ("ordinato per ridurre spostamenti").
Per replacement_candidates: 2-3 candidates alternative alla tappa indicata, stops vuoto.`;

/** Trim and normalize stop notes from the model. */
export function normalizeStopNotes(raw) {
  if (raw == null || raw === '') return undefined;
  const text = String(raw)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text || undefined;
}

/** Normalize Wikipedia place links from planner JSON. */
export function normalizePlaceLinks(raw) {
  if (!Array.isArray(raw)) return undefined;
  const seen = new Set();
  const links = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const label = String(item.label ?? item.name ?? '').trim();
    const wikiTitle = String(item.wikiTitle ?? item.wikipedia ?? label).trim();
    const wikiSection = String(item.wikiSection ?? item.section ?? '').trim();
    if (label.length < 2 || wikiTitle.length < 2) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const link = { label, wikiTitle };
    if (wikiSection) link.wikiSection = wikiSection;
    links.push(link);
    if (links.length >= 12) break;
  }
  return links.length ? links : undefined;
}

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
    maxTokens: task === 'replacement_candidates' ? 800 : 4500,
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
  const mappedStops = rawStops.map((s) => {
    const themes = normalizeThemeList(s.themes ?? []);
    const primaryTheme = themes[0] ?? 'museums';
    return {
      id: randomUUID(),
      name: String(s.name ?? 'Tappa'),
      region: s.region ? String(s.region) : undefined,
      days: Math.max(1, Number(s.days) || 1),
      themes: themes.length ? themes : [primaryTheme],
      primaryTheme,
      notes: normalizeStopNotes(s.notes),
      placeLinks: normalizePlaceLinks(s.placeLinks),
    };
  });

  const stops = await Promise.all(
    mappedStops.map(async (stop) => ({
      ...stop,
      placeLinks: await validatePlaceLinksForStop(stop.placeLinks, stop.notes, stop.name),
    }))
  );

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
