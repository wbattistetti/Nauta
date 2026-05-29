/**
 * Itinerary UI copy — chat/panel messages (no React components).
 */

export function formatUserEchoAbovePanels(userMessage) {
  const trimmed = String(userMessage ?? '').trim();
  if (!trimmed) return '';
  return trimmed;
}

export const ITINERARY_PROPOSAL_CHAT_SHORT =
  'Ho pensato ad un itinerario, bilanciando vari fattori. Guarda se ti piace!';

export const ITINERARY_ACCORDION_TITLE = 'Scopri l\'itinerario';

export const PREFERENCES_ACCORDION_TITLE = 'Vedi se ho azzeccato i tuoi gusti';

export const PREFERENCES_ACCORDION_PAYOFF =
  'Ho cercato di bilanciare vari fattori. Puoi però modificarli come preferisci e rivedere l\'itinerario.';

export const STOP_PHOTOS_ACCORDION_LABEL = 'Ecco alcune foto…';

export const PREFERENCE_PANELS_CHAT_MESSAGE =
  'Nei pannelli qui sotto trovi interessi, ritmo e budget già impostati per voi: modificate tutto ciò che volete, poi andate avanti.';

export const PREFERENCE_PANELS_HINT_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;

export const ITINERARY_PROPOSAL_CHAT_MESSAGE = ITINERARY_PROPOSAL_CHAT_SHORT;

export const ITINERARY_PANEL_CAPTION = '';

export const DISCOVER_ITINERARY_LABEL = ITINERARY_ACCORDION_TITLE;

export const ITINERARY_BELOW_PANELS_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;

export const TRAVEL_PLAN_PROPOSAL_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;

export function buildItineraryMotivation() {
  return '';
}
