/**
 * Itinerary UI copy — chat bubble, accordion titles, in-panel payoff.
 */

/** Assistant bubble when itinerary is ready (accordions stay closed). */
export const ITINERARY_PROPOSAL_CHAT_SHORT =
  'Ho pensato ad un itinerario, bilanciando vari fattori. Guarda se ti piace!';

/** First accordion header — action word "Scopri" is underlined in UI. */
export const ITINERARY_ACCORDION_TITLE_ACTION = 'Scopri';
export const ITINERARY_ACCORDION_TITLE_REST = " l'itinerario che ho creato…";

/** @deprecated Use ITINERARY_ACCORDION_TITLE_ACTION + REST */
export const ITINERARY_ACCORDION_TITLE = 'Scopri l\'itinerario';

/** Second accordion header — action word "Controlla" is underlined in UI. */
export const PREFERENCES_ACCORDION_TITLE_ACTION = 'Controlla';
export const PREFERENCES_ACCORDION_TITLE_REST = ' se ho interpretato bene i tuoi gusti…';

/** @deprecated Use PREFERENCES_ACCORDION_TITLE_ACTION + REST */
export const PREFERENCES_ACCORDION_TITLE = 'Vedi se ho azzeccato i tuoi gusti';

/** Payoff when preferences accordion opens (first visits). */
export const PREFERENCES_ACCORDION_PAYOFF_LONG =
  'Ho selezionato queste voci; puoi modificarle a piacere e aggiustiamo l\'itinerario di conseguenza.';

/** Shorter payoff for returning users. */
export const PREFERENCES_ACCORDION_PAYOFF_SHORT =
  'Modifica pure la composizione del tuo itinerario.';

/** @deprecated Use PREFERENCES_ACCORDION_PAYOFF_LONG */
export const PREFERENCES_ACCORDION_PAYOFF = PREFERENCES_ACCORDION_PAYOFF_LONG;

/** Thumbs-down — intro above textarea (write first). */
export const PREFERENCES_REVISION_WRITE_PAYOFF =
  "Ho visto che l'itinerario non ti ha convinto! Scrivi cosa non ti convince dell'itinerario che ti ho proposto.";

export const PREFERENCES_REVISION_INPUT_PLACEHOLDER = 'Scrivi che cosa vorresti di diverso';

/** Explicit confirm after 👍 — separate from thumb tap to avoid mis-clicks. */
export const ITINERARY_PROCEED_LABEL = 'Procedi';

/** Return from day-detail (phase4) to planning accordions. */
export const ITINERARY_REOPEN_LABEL = 'Modifica itinerario';

/** Thumbs-down — intro above preference panels (panels second). */
export const PREFERENCES_REVISION_PANELS_PAYOFF =
  'Oppure cambia qui sotto le aree che ti interessano — aggiustiamo l\'itinerario di conseguenza.';

/** @deprecated Use PREFERENCES_REVISION_WRITE_PAYOFF + PREFERENCES_REVISION_PANELS_PAYOFF */
export const PREFERENCES_REVISION_PAYOFF =
  `${PREFERENCES_REVISION_WRITE_PAYOFF} ${PREFERENCES_REVISION_PANELS_PAYOFF}`;

/** @deprecated */
export const PREFERENCES_PROPOSAL_HEADLINE = 'Ho pensato che possano interessarti:';

/** Discrete link — opens detailed panels (top-right). */
export const PREFERENCES_MODIFY_LABEL = 'modifica';

/** After user taps modifica — panels open below. */
export const PREFERENCES_EDIT_HEADLINE =
  'Personalizzalo tu, scegliendo le opzioni che ti interessano.';

/** Link to leave edit mode. */
export const PREFERENCES_BACK_TO_PROPOSAL_LABEL = 'indietro';

export const STOP_PHOTOS_ACCORDION_LABEL = 'Ecco alcune foto…';

/** Vertical tab to reopen stops index */
export const STOPS_INDEX_TAB_LABEL = 'Tappe';

/** Stops index drawer title */
export const STOPS_INDEX_DRAWER_TITLE = 'Tappe';

export const STOP_NAV_PREV_LABEL = 'Tappa precedente';
export const STOP_NAV_NEXT_LABEL = 'Prossima tappa';

/** @deprecated Use icon on itinerary accordion */
export const RECALCULATE_TRIP_CHIP_LABEL = '⚠️ Ricalcola il viaggio';

/** @deprecated Use icon on itinerary accordion */
export const RECALCULATE_TRIP_BUTTON_LABEL = 'Ricalcola il viaggio';

/** Screen reader label for itinerary refresh icon */
export const RECALCULATE_ITINERARY_ARIA_LABEL = 'Ricalcola itinerario';

export const ITINERARY_HISTORY_LABEL = 'Versioni precedenti';

/** Prior chat recap accordion (compact, one row collapsed). */
export const CHAT_PRIOR_RECAP_TITLE = 'Fin qui ci siamo detti…';

/** @deprecated */
export const DISCOVER_ITINERARY_LABEL = ITINERARY_ACCORDION_TITLE;

/** @deprecated */
export const ITINERARY_PANEL_CAPTION = '';

/** @deprecated */
export const ITINERARY_PROPOSAL_CHAT_MESSAGE = ITINERARY_PROPOSAL_CHAT_SHORT;

/** @deprecated Use PREFERENCES_ACCORDION_PAYOFF */
export const PREFERENCE_PANELS_HINT_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;
