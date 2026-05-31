/**
 * Itinerary UI copy — chat bubble, accordion titles, in-panel payoff.
 */
export {
  ITINERARY_PROPOSAL_CHAT_SHORT,
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_PAYOFF,
  PREFERENCE_PANELS_HINT_MESSAGE,
  ITINERARY_PROPOSAL_CHAT_MESSAGE,
  DISCOVER_ITINERARY_LABEL,
} from '@nauta/shared/itineraryCopy';

/** First accordion header — action word "Scopri" is underlined in UI. */
export const ITINERARY_ACCORDION_TITLE_ACTION = 'Scopri';
export const ITINERARY_ACCORDION_TITLE_REST = " l'itinerario che ho creato…";

/** Second accordion header — action word "Controlla" is underlined in UI. */
export const PREFERENCES_ACCORDION_TITLE_ACTION = 'Controlla';
export const PREFERENCES_ACCORDION_TITLE_REST = ' se ho interpretato bene i tuoi gusti…';

/** Payoff when preferences accordion opens (first visits). */
export const PREFERENCES_ACCORDION_PAYOFF_LONG =
  'Ho selezionato queste voci; puoi modificarle a piacere e aggiustiamo l\'itinerario di conseguenza.';

/** Shorter payoff for returning users. */
export const PREFERENCES_ACCORDION_PAYOFF_SHORT =
  'Modifica pure la composizione del tuo itinerario.';
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

/** Planning tutor — hero chip, first visit only */
export const PLANNING_TUTOR_EYE_LINE = 'per vedere le tappe del tuo viaggio';
export const PLANNING_TUTOR_PUZZLE_LINE = 'per modificarlo';
export const PLANNING_TUTOR_EYE_DETAIL =
  'Apri l’itinerario a schermo intero: scorri le tappe con date e foto, seleziona una tappa per esplorarla nel dettaglio.';
export const PLANNING_TUTOR_PUZZLE_DETAIL =
  'Controlla e modifica i tuoi gusti — ritmo, interessi, budget — e aggiustiamo l’itinerario di conseguenza.';
export const PLANNING_TUTOR_CLEAR_PROMPT = 'Tutto chiaro?';
export const PLANNING_TUTOR_YES = 'Sì';
export const PLANNING_TUTOR_NO = 'No';

/** @deprecated Use PLANNING_TUTOR_EYE_LINE + inline icon */
export const PLANNING_TUTOR_EYE =
  'Premi l’icona occhio per vedere le tappe del tuo viaggio.';
/** @deprecated Use PLANNING_TUTOR_PUZZLE_LINE + inline icon */
export const PLANNING_TUTOR_PUZZLE =
  'Premi l’icona puzzle per vedere la composizione del viaggio.';

/** Contextual chat disambiguation when a stop is focused */
export const CHAT_SCOPE_PROMPT =
  'Vuoi informazioni su questa tappa o sull’itinerario in generale?';
export const CHAT_SCOPE_STOP_LABEL = 'Questa tappa';
export const CHAT_SCOPE_ITINERARY_LABEL = 'Itinerario generale';

export const CHAT_SHEET_TITLE = 'Conversazione';
export const CHAT_SHEET_CLOSE_LABEL = 'Chiudi chat';

/** In-app Wikipedia place sheet */
export const WIKI_SHEET_CLOSE_LABEL = 'Chiudi';
export const WIKI_SHEET_BACK_LABEL = 'Indietro';
export const WIKI_SHEET_LOADING = 'Caricamento…';
export const WIKI_SHEET_ARTICLE_LOADING = 'Caricamento articolo…';
export const WIKI_SHEET_ERROR =
  'Non ho trovato una voce Wikipedia per questo luogo.';
export const WIKI_SHEET_OPEN_FULL = 'Leggi l\'articolo completo';
export const WIKI_SHEET_ATTRIBUTION = 'Testo da Wikipedia';
export const WIKI_SHEET_CONTEXT_LABEL = 'In questa scheda:';

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
