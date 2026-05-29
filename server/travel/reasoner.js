/**
 * Reasoner — AI extracts intent + actions from user message (Zod-validated).
 */
import { callOpenAiJson } from './openaiJson.js';
import { parseReasonerWithZod } from './reasonerZod.js';
import { buildReasonerFallback } from './reasonerFallback.js';

const REASONER_SYSTEM = `Sei il Reasoner di Nauta (agente viaggio). Analizza il messaggio utente e lo stato viaggio.
Rispondi SOLO con JSON valido:
{
  "intent": "stringa breve",
  "actions": [ { "type": "...", ... } ],
  "clarificationsNeeded": ["domande se servono"],
  "needsPlanner": boolean,
  "plannerTask": "generate_initial" | "recalculate" | "replacement_candidates" | null,
  "plannerContext": {}
}

Tipi action ammessi:
- update_profile { patch: { destination, durationDays, period, style, ritmo, budget, alloggi, preferenze, likes[], dislikes[] } }
- generate_initial_itinerary
- recalculate_itinerary
- propose_stop_replacement { stopId }
- confirm_stop_replacement { stopId, candidateId }
- confirm_itinerary (solo se utente conferma esplicitamente blocco itinerario)
- adjust_stop_days { stopId, days }
- remove_stop { stopId }
- add_stop { name, days, themes[] }
- none

Regole:
- Estrai preferenze implicite (es. "foglie" → periodo autunno in patch.period come stringa).
- period deve essere stringa, non oggetto.
- NON chiedere mai in chat: interessi/temi, stile, budget, preferenze — l'utente li sceglie nei PANNELLI sotto la chat (likes/dislikes/style/budget già nel profilo).
- clarificationsNeeded SOLO per: destinazione, durata (giorni), periodo/date, travelerType, ageBand. Mai per cultura/natura/cibo/stile/budget (pannelli).
- NON mettere likes/dislikes/style/budget in update_profile se già presenti nel profilo.
- Se profilo completo e nessuna tappa: generate_initial_itinerary + needsPlanner true.
- Max 3 actions per turno.
- Se l'utente indica più durate diverse (es. 90 e 30 giorni), NON scegliere: chiedi chiarimento in clarificationsNeeded.
- durationDays deve essere un numero intero.
- Dopo destinazione+giorni+periodo: chiedi travelerType (solo|couples|family|friends) e ageBand (18-25|25-35|35-50|50+) in update_profile o clarificationsNeeded.
- travelerType e ageBand vanno in patch come stringhe enum, non in likes.`;

const MAX_ATTEMPTS = 3;

/**
 * @param {string} userMessage
 * @param {import('./types.js').TravelState} state
 * @param {string} tripId
 * @param {{ confirmReplacement?: { stopId: string, candidateId: string } }} [opts]
 */
export async function runReasoner(userMessage, state, tripId, opts = {}) {
  if (opts.confirmReplacement) {
    const { stopId, candidateId } = opts.confirmReplacement;
    return {
      intent: 'confirm_replacement',
      actions: [{ type: 'confirm_stop_replacement', stopId, candidateId }],
      clarificationsNeeded: [],
      needsPlanner: false,
    };
  }

  const user = `STATO:\n${JSON.stringify(state, null, 2)}\n\nMESSAGGIO UTENTE:\n${userMessage}`;

  let lastError = '';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const retryHint =
      attempt === 0
        ? user
        : `${user}\n\nERRORE VALIDAZIONE (tentativo ${attempt + 1}/${MAX_ATTEMPTS}): ${lastError}\nRipeti SOLO JSON valido secondo schema.`;

    const { parsed } = await callOpenAiJson({
      system: REASONER_SYSTEM,
      user: retryHint,
      maxTokens: 900,
      purpose: 'TRAVEL_REASONER',
      tripId,
    });

    const validated = parseReasonerWithZod(parsed);
    if (validated) return validated;

    lastError = 'schema Reasoner non valido';
  }

  console.warn(`[reasoner] fallback dopo ${MAX_ATTEMPTS} tentativi: ${lastError}`);
  return buildReasonerFallback(userMessage, state);
}
