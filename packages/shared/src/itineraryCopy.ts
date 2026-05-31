/**
 * Itinerary UI copy — canonical strings for chat and accordions.
 */

export const ITINERARY_PROPOSAL_CHAT_SHORT =
  'Ho pensato ad un itinerario, bilanciando vari fattori. Guarda se ti piace!';

export const ITINERARY_ACCORDION_TITLE_ACTION = 'Scopri';
export const ITINERARY_ACCORDION_TITLE_REST = " l'itinerario che ho creato…";

/** @deprecated Use ITINERARY_ACCORDION_TITLE_ACTION + REST */
export const ITINERARY_ACCORDION_TITLE = "Scopri l'itinerario";

export const PREFERENCES_ACCORDION_TITLE_ACTION = 'Controlla';
export const PREFERENCES_ACCORDION_TITLE_REST = ' se ho interpretato bene i tuoi gusti…';

/** @deprecated Use PREFERENCES_ACCORDION_TITLE_ACTION + REST */
export const PREFERENCES_ACCORDION_TITLE = 'Vedi se ho azzeccato i tuoi gusti';

export const PREFERENCES_ACCORDION_PAYOFF =
  'Ho cercato di bilanciare vari fattori. Puoi però modificarli come preferisci e rivedere l\'itinerario.';

export const PREFERENCE_PANELS_CHAT_MESSAGE =
  'Nei pannelli qui sotto trovi interessi, ritmo e budget già impostati per voi: modificate tutto ciò che volete, poi andate avanti.';

export const PREFERENCE_PANELS_HINT_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;

export const ITINERARY_PROPOSAL_CHAT_MESSAGE = ITINERARY_PROPOSAL_CHAT_SHORT;

export const DISCOVER_ITINERARY_LABEL = ITINERARY_ACCORDION_TITLE;

export function formatUserEchoAbovePanels(userMessage: string | null | undefined): string {
  return String(userMessage ?? '').trim();
}
