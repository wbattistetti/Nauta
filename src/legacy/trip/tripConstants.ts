/**
 * Copy for trip planner UI.
 */
import type { TripDraft, TripPhase, TripStep } from '../../types/trip';
import { travelPhaseLabel } from '../travel/travelUi';
import type { TravelPhase } from '../../types/travelState';

export { TRAVEL_OPENER as INTAKE_OPENER } from '../travel/travelUi';

export const AI_ERROR_MESSAGE =
  'Non riesco a contattare l\'assistente. Avvia il server (cartella server) e imposta OPENAI_API_KEY in server/.env.';

export const PHASE_LABELS: Record<TripPhase, string> = {
  F1: 'Raccolta informazioni ÔÇö dialogo guidato',
  F2: 'Fase 2 ÔÇö il tuo stile',
  F3: 'Fase 3 ÔÇö itinerario',
  F4: 'Fase 4 ÔÇö revisione',
  F5: 'Fase 5 ÔÇö giorno per giorno',
  F6: 'Fase 6 ÔÇö prenotazioni',
  F7: 'Fase 7 ÔÇö analisi pagina',
};

export function headerSubtitle(_step: TripStep, _draft: TripDraft, travelPhase?: TravelPhase): string {
  return travelPhaseLabel(travelPhase ?? 'phase1');
}

export function resumeQuestion(): string {
  return 'Riprendiamo: cosa vuoi aggiungere o modificare?';
}
