import type { TripDraft } from '../../types/trip';
import type { EditableField } from '../../lib/trip/correctionPrompts';

type Props = {
  draft: TripDraft;
  onRestart: () => void;
  onContinue?: () => void;
  onEditField?: (field: EditableField) => void;
  dark?: boolean;
  showCorrectionHint?: boolean;
};

function displayPeriod(draft: TripDraft): string {
  if (draft.periodNormalized?.trim()) return draft.periodNormalized.trim();
  if (draft.periodStart && draft.periodEnd) {
    return `${draft.periodStart} – ${draft.periodEnd}`;
  }
  return '—';
}

function displayDuration(draft: TripDraft): string {
  if (draft.durationNormalized?.trim()) {
    const days =
      draft.durationDays != null ? ` (${draft.durationDays} giorni)` : '';
    return `${draft.durationNormalized.trim()}${days}`;
  }
  if (draft.durationDays != null) return `${draft.durationDays} giorni`;
  return '—';
}

type RowProps = {
  field: EditableField;
  label: string;
  value: string;
  onEdit?: (field: EditableField) => void;
  labelClass: string;
  valueClass: string;
  buttonClass: string;
};

function SummaryRow({ field, label, value, onEdit, labelClass, valueClass, buttonClass }: RowProps) {
  if (!onEdit) {
    return (
      <div>
        <dt className={labelClass}>{label}</dt>
        <dd className={valueClass}>{value}</dd>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onEdit(field)}
      className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${buttonClass}`}
    >
      <dt className={labelClass}>{label}</dt>
      <dd className={valueClass}>{value}</dd>
      <span className="text-[10px] text-teal-500/80 mt-1 block">Tocca per correggere</span>
    </button>
  );
}

/** Riepilogo intake — campi cliccabili per correzione. */
export default function TripSummaryCard({
  draft,
  onRestart,
  onContinue,
  onEditField,
  dark,
  showCorrectionHint = true,
}: Props) {
  const card = dark
    ? 'rounded-2xl border border-amber-900/40 bg-stone-900/90 backdrop-blur-md p-5 space-y-4'
    : 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4';
  const title = dark ? 'text-lg font-semibold text-amber-100' : 'text-lg font-semibold text-stone-800';
  const label = dark
    ? 'text-amber-600/70 text-xs font-semibold uppercase tracking-wider'
    : 'text-stone-400 text-xs font-semibold uppercase tracking-wider';
  const value = dark ? 'text-amber-100/90 mt-0.5' : 'text-stone-800 mt-0.5';
  const rowBtn = dark
    ? 'hover:bg-amber-900/25 border border-transparent hover:border-amber-800/30'
    : 'hover:bg-stone-50 border border-transparent hover:border-stone-200';

  return (
    <div className={card}>
      <h2 className={title}>Il tuo viaggio in sintesi</h2>
      {showCorrectionHint && onEditField && (
        <p className={`text-sm ${dark ? 'text-amber-200/70' : 'text-stone-600'}`}>
          Controlla i dati e <strong>clicca su cosa vuoi correggere</strong>.
        </p>
      )}
      <dl className="space-y-2 text-sm">
        <SummaryRow
          field="destination"
          label="Destinazione"
          value={draft.destinationNormalized || '—'}
          onEdit={onEditField}
          labelClass={label}
          valueClass={value}
          buttonClass={rowBtn}
        />
        <SummaryRow
          field="duration"
          label="Durata"
          value={displayDuration(draft)}
          onEdit={onEditField}
          labelClass={label}
          valueClass={value}
          buttonClass={rowBtn}
        />
        <SummaryRow
          field="period"
          label="Periodo"
          value={displayPeriod(draft)}
          onEdit={onEditField}
          labelClass={label}
          valueClass={value}
          buttonClass={rowBtn}
        />
        <SummaryRow
          field="style"
          label="Stile"
          value={draft.style || '—'}
          onEdit={onEditField}
          labelClass={label}
          valueClass={value}
          buttonClass={rowBtn}
        />
        <SummaryRow
          field="budget"
          label="Budget"
          value={draft.budget || '—'}
          onEdit={onEditField}
          labelClass={label}
          valueClass={value}
          buttonClass={rowBtn}
        />
        <SummaryRow
          field="preferenze"
          label="Preferenze"
          value={draft.preferenze || '—'}
          onEdit={onEditField}
          labelClass={label}
          valueClass={value}
          buttonClass={rowBtn}
        />
      </dl>

      <div className="flex flex-wrap gap-2 pt-2">
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="px-5 py-2.5 rounded-full bg-teal-900 hover:bg-teal-800 text-amber-50 text-sm font-semibold"
          >
            Conferma e continua
          </button>
        )}
        <button
          type="button"
          onClick={onRestart}
          className={
            dark
              ? 'px-5 py-2.5 rounded-full border border-amber-800/40 text-amber-200/70 hover:bg-amber-900/20 text-sm font-medium'
              : 'px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium'
          }
        >
          Ricomincia
        </button>
      </div>
    </div>
  );
}
