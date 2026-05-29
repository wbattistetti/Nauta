/**
 * User messages when correcting a field from the intake summary card.
 */
import type { TripDraft } from '../../types/trip';

export type EditableField =
  | 'destination'
  | 'duration'
  | 'period'
  | 'style'
  | 'budget'
  | 'preferenze';

const FIELD_LABELS: Record<EditableField, string> = {
  destination: 'destinazione',
  duration: 'durata del viaggio',
  period: 'periodo di permanenza',
  style: 'stile di viaggio',
  budget: 'budget',
  preferenze: 'preferenze',
};

function currentValue(draft: TripDraft, field: EditableField): string {
  switch (field) {
    case 'destination':
      return draft.destinationNormalized ?? '—';
    case 'duration':
      return draft.durationNormalized ?? (draft.durationDays ? `${draft.durationDays} giorni` : '—');
    case 'period':
      return draft.periodNormalized ?? '—';
    case 'style':
      return draft.style ?? '—';
    case 'budget':
      return draft.budget ?? '—';
    case 'preferenze':
      return draft.preferenze ?? '—';
  }
}

/** Message sent to the dialog manager to start a correction flow. */
export function correctionUserMessage(draft: TripDraft, field: EditableField): string {
  const label = FIELD_LABELS[field];
  const dest = draft.destinationNormalized ? ` in ${draft.destinationNormalized}` : '';
  const val = currentValue(draft, field);
  return `Voglio correggere ${label}${dest}. Valore attuale: «${val}». Cosa mi chiedi per aggiornarlo?`;
}

export function correctionAssistantOpener(field: EditableField): string {
  const label = FIELD_LABELS[field];
  return `Certo — cosa vuoi modificare del ${label}?`;
}
