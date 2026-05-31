/**
 * Single date edge (Inizio / Fine) with optional flexible tolerance rows
 * stacked above and below the date textbox.
 */
import type { MouseEvent } from 'react';

function dateInputClass(active: boolean): string {
  const base =
    'w-[4.75rem] shrink-0 px-1.5 py-1 rounded-md bg-stone-800 text-xs text-amber-100 text-center tabular-nums transition-colors';
  return active
    ? `${base} border-2 border-amber-400 ring-2 ring-amber-400/35 shadow-sm shadow-amber-500/25`
    : `${base} border border-stone-600`;
}

const FLEX_DAYS_INPUT_CLASS =
  'w-8 px-0.5 py-0.5 rounded bg-stone-800 border border-stone-600 text-[11px] text-amber-100 text-center tabular-nums';

function clampTol(n: number): number {
  return Math.min(14, Math.max(1, Math.floor(n) || 1));
}

type FlexToleranceLineProps = {
  direction: 'before' | 'after';
  value: number;
  disabled?: boolean;
  onChange: (n: number) => void;
  onInputClick: (e: MouseEvent) => void;
};

function FlexToleranceLine({
  direction,
  value,
  disabled,
  onChange,
  onInputClick,
}: FlexToleranceLineProps) {
  const suffix = direction === 'before' ? 'giorni prima' : 'giorni dopo';
  return (
    <p className="flex items-center justify-start gap-1 text-[10px] text-amber-200/75 leading-tight whitespace-nowrap">
      <span>fino a</span>
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(clampTol(Number(e.target.value)))}
        onClick={onInputClick}
        aria-label={`Giorni ${direction === 'before' ? 'prima' : 'dopo'}`}
        className={FLEX_DAYS_INPUT_CLASS}
      />
      <span>{suffix}</span>
    </p>
  );
}

export type DateEdgeFieldProps = {
  label: string;
  input: string;
  active: boolean;
  flexible: boolean;
  /** Reserve vertical slots so date inputs stay aligned when only one edge is flexible. */
  reserveFlexSlots: boolean;
  daysBefore: number;
  daysAfter: number;
  disabled?: boolean;
  onInputChange: (text: string) => void;
  onInputApply: () => void;
  onFlexibleChange: (enabled: boolean) => void;
  onDaysBeforeChange: (n: number) => void;
  onDaysAfterChange: (n: number) => void;
  onActivate: () => void;
};

export default function DateEdgeField({
  label,
  input,
  active,
  flexible,
  reserveFlexSlots,
  daysBefore,
  daysAfter,
  disabled,
  onInputChange,
  onInputApply,
  onFlexibleChange,
  onDaysBeforeChange,
  onDaysAfterChange,
  onActivate,
}: DateEdgeFieldProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();

  const showBefore = flexible;
  const showAfter = flexible;
  const slotBefore = reserveFlexSlots || flexible;
  const slotAfter = reserveFlexSlots || flexible;

  return (
    <div
      className="grid grid-cols-[2.75rem_1fr] gap-x-1.5 gap-y-0.5 items-center"
      role="group"
      aria-label={label}
      onClick={onActivate}
    >
      {slotBefore ? (
        <>
          <span aria-hidden className="select-none" />
          <div className="min-h-[1.125rem] flex items-center">
            {showBefore ? (
              <FlexToleranceLine
                direction="before"
                value={daysBefore}
                disabled={disabled}
                onChange={onDaysBeforeChange}
                onInputClick={stop}
              />
            ) : null}
          </div>
        </>
      ) : null}

      <span
        className={`text-[10px] uppercase tracking-wide ${
          active ? 'text-amber-300 font-semibold' : 'text-stone-500'
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          type="text"
          inputMode="numeric"
          placeholder="gg/mm"
          maxLength={10}
          disabled={disabled}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onBlur={onInputApply}
          onKeyDown={(e) => e.key === 'Enter' && onInputApply()}
          onFocus={onActivate}
          onClick={stop}
          className={dateInputClass(active)}
        />
        <label className="flex items-center gap-1 shrink-0 cursor-pointer" onClick={stop}>
          <input
            type="checkbox"
            checked={flexible}
            onChange={(e) => onFlexibleChange(e.target.checked)}
            disabled={disabled}
            className="rounded border-stone-600 w-3 h-3"
          />
          <span className="text-[10px] text-stone-400 whitespace-nowrap">Flessibile</span>
        </label>
      </div>

      {slotAfter ? (
        <>
          <span aria-hidden className="select-none" />
          <div className="min-h-[1.125rem] flex items-center">
            {showAfter ? (
              <FlexToleranceLine
                direction="after"
                value={daysAfter}
                disabled={disabled}
                onChange={onDaysAfterChange}
                onInputClick={stop}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
