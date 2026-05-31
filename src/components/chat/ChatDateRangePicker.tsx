/**
 * Inline chat date-range picker — year toggle, month strip, compact day grid, tolerance bands.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DateEdgeField from './DateEdgeField';
import {
  buildPeriodConfirmPayload,
  isoToDisplay,
  parseDisplayDate,
  type PeriodConfirmPayload,
} from '../../lib/travel/periodFormat';

type Props = {
  durationDays?: number | null;
  disabled?: boolean;
  onConfirm: (payload: PeriodConfirmPayload) => void;
};

type YearMode = 'current' | 'next';
type ActiveEdge = 'start' | 'end';
type DragEdge = ActiveEdge | null;

const MONTHS_FULL = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic',
];

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const DEFAULT_TOL = 3;

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function mondayOffset(year: number, month: number): number {
  const dow = new Date(year, month, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
}

function addDays(iso: string, delta: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + delta);
  return toIso(d.getFullYear(), d.getMonth(), d.getDate());
}

type DayVisual = 'none' | 'core' | 'tol-start' | 'tol-end' | 'start' | 'end';

function dayVisual(
  iso: string,
  startIso: string | null,
  endIso: string | null,
  startTolBefore: number,
  startTolAfter: number,
  endTolBefore: number,
  endTolAfter: number
): DayVisual {
  if (!startIso && !endIso) return 'none';
  if (!startIso && endIso) return iso === endIso ? 'end' : 'none';
  if (startIso && !endIso) return iso === startIso ? 'start' : 'none';

  const end = endIso!;
  const t = parseIso(iso).getTime();
  const s = parseIso(startIso!).getTime();
  const e = parseIso(end).getTime();
  if (iso === startIso) return 'start';
  if (iso === end) return 'end';
  if (
    startTolBefore > 0 &&
    t >= parseIso(addDays(startIso!, -startTolBefore)).getTime() &&
    t < s
  ) {
    return 'tol-start';
  }
  if (
    startTolAfter > 0 &&
    t > s &&
    t <= parseIso(addDays(startIso!, startTolAfter)).getTime()
  ) {
    return 'tol-start';
  }
  if (endTolBefore > 0 && t >= parseIso(addDays(end, -endTolBefore)).getTime() && t < e) {
    return 'tol-end';
  }
  if (t >= s && t <= e) return 'core';
  if (endTolAfter > 0 && t > e && t <= parseIso(addDays(end, endTolAfter)).getTime()) {
    return 'tol-end';
  }
  return 'none';
}

const visualClass: Record<DayVisual, string> = {
  none: 'text-stone-300 hover:bg-stone-800',
  core: 'bg-teal-900/80 text-amber-100',
  'tol-start': 'bg-teal-950/50 text-teal-200/70',
  'tol-end': 'bg-teal-950/50 text-teal-200/70',
  start: 'bg-teal-600 text-amber-50 ring-2 ring-amber-400/80',
  end: 'bg-teal-600 text-amber-50 ring-2 ring-amber-400/80',
};

function monthButtonClass(selected: boolean, disabled: boolean): string {
  if (disabled) {
    return 'py-1 rounded-md text-[11px] font-medium bg-stone-900/60 text-stone-600 cursor-not-allowed opacity-50';
  }
  if (selected) {
    return 'py-1 rounded-md text-[11px] font-semibold bg-amber-500/90 text-stone-950';
  }
  return 'py-1 rounded-md text-[11px] font-medium bg-stone-800/80 text-stone-300 hover:bg-stone-700/80';
}

export default function ChatDateRangePicker({ durationDays, disabled, onConfirm }: Props) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const nextYear = currentYear + 1;

  const [yearMode, setYearMode] = useState<YearMode>('current');
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startIso, setStartIso] = useState<string | null>(null);
  const [endIso, setEndIso] = useState<string | null>(null);
  const [startTolEnabled, setStartTolEnabled] = useState(false);
  const [endTolEnabled, setEndTolEnabled] = useState(false);
  const [startTolBefore, setStartTolBefore] = useState(DEFAULT_TOL);
  const [startTolAfter, setStartTolAfter] = useState(DEFAULT_TOL);
  const [endTolBefore, setEndTolBefore] = useState(DEFAULT_TOL);
  const [endTolAfter, setEndTolAfter] = useState(DEFAULT_TOL);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [activeEdge, setActiveEdge] = useState<ActiveEdge>('start');
  const [dragEdge, setDragEdge] = useState<DragEdge>(null);
  const dayPanelRef = useRef<HTMLDivElement>(null);

  const viewYear = yearMode === 'current' ? currentYear : nextYear;

  /** Update start only; auto-focus Fine while range is incomplete. */
  function applyStart(iso: string) {
    if (endIso && parseIso(iso) > parseIso(endIso)) {
      setStartIso(iso);
      setEndIso(null);
      setActiveEdge('end');
      return;
    }
    setStartIso(iso);
    if (!endIso) {
      setActiveEdge('end');
    }
  }

  /** Update end only; auto-focus Inizio only when start was cleared by invalid range. */
  function applyEnd(iso: string) {
    if (startIso && parseIso(iso) < parseIso(startIso)) {
      setEndIso(iso);
      setStartIso(null);
      setActiveEdge('start');
      return;
    }
    setEndIso(iso);
  }

  const syncInputs = useCallback((start: string | null, end: string | null) => {
    setStartInput(start ? isoToDisplay(start) : '');
    setEndInput(end ? isoToDisplay(end) : '');
  }, []);

  useEffect(() => {
    syncInputs(startIso, endIso);
  }, [startIso, endIso, syncInputs]);

  /** Guide focus while building the range; both set → manual focus only. */
  useEffect(() => {
    if (!startIso) setActiveEdge('start');
    else if (!endIso) setActiveEdge('end');
  }, [startIso, endIso]);

  function isMonthDisabled(month: number): boolean {
    if (yearMode === 'next') return false;
    return month < today.getMonth();
  }

  function scrollToIso(iso: string) {
    const d = parseIso(iso);
    const y = d.getFullYear();
    if (y === currentYear) {
      setYearMode('current');
      setViewMonth(d.getMonth());
    } else if (y === nextYear) {
      setYearMode('next');
      setViewMonth(d.getMonth());
    }
    dayPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleDaySelect(iso: string) {
    if (disabled || dragEdge) return;
    if (activeEdge === 'start') {
      applyStart(iso);
    } else {
      applyEnd(iso);
    }
  }

  function applyInput(field: ActiveEdge, text: string) {
    const iso = parseDisplayDate(text, viewYear);
    if (!iso) return;
    scrollToIso(iso);
    setActiveEdge(field);
    if (field === 'start') {
      applyStart(iso);
    } else {
      applyEnd(iso);
    }
  }

  function handlePointerDay(iso: string, edge: Exclude<DragEdge, null>) {
    if (disabled) return;
    if (edge === 'start') {
      applyStart(iso);
    } else {
      applyEnd(iso);
    }
  }

  const cells = useMemo(() => {
    const offset = mondayOffset(viewYear, viewMonth);
    const dim = daysInMonth(viewYear, viewMonth);
    const slots: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < offset; i += 1) slots.push({ day: null, iso: null });
    for (let d = 1; d <= dim; d += 1) {
      slots.push({ day: d, iso: toIso(viewYear, viewMonth, d) });
    }
    return slots;
  }, [viewYear, viewMonth]);

  const startTol = startTolEnabled ? startTolBefore : 0;
  const endTol = endTolEnabled ? endTolAfter : 0;
  const startTolBeforeVis = startTolEnabled ? startTolBefore : 0;
  const startTolAfterVis = startTolEnabled ? startTolAfter : 0;
  const endTolBeforeVis = endTolEnabled ? endTolBefore : 0;
  const endTolAfterVis = endTolEnabled ? endTolAfter : 0;

  const focusHint =
    activeEdge === 'start'
      ? startIso
        ? 'Modifica il giorno d’inizio'
        : 'Seleziona il giorno d’inizio'
      : endIso
        ? 'Modifica il giorno di fine'
        : 'Seleziona il giorno di fine';

  const calendarDays =
    startIso && endIso
      ? Math.round((parseIso(endIso).getTime() - parseIso(startIso).getTime()) / 86400000) + 1
      : null;

  const reserveFlexSlots = startTolEnabled || endTolEnabled;

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-stone-700/60 bg-stone-900/95 p-3 shadow-lg">
      {/* Title + year toggle on one row */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <p className="text-sm font-medium text-amber-100 shrink-0">Scegli il periodo</p>
        <div className="flex gap-1 shrink-0">
          {(['current', 'next'] as YearMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={disabled}
              onClick={() => {
                setYearMode(mode);
                if (mode === 'current' && viewMonth < today.getMonth()) {
                  setViewMonth(today.getMonth());
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                yearMode === mode
                  ? 'bg-teal-800 text-amber-50'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-750'
              }`}
            >
              {mode === 'current' ? "Quest'anno" : 'Prossimo anno'}
            </button>
          ))}
        </div>
      </div>

      {/* Month strip in faded panel */}
      <div className="rounded-lg bg-stone-800/25 px-2 py-2 mb-3">
        <div className="grid grid-cols-6 gap-1">
          {MONTHS_FULL.map((label, i) => {
            const off = isMonthDisabled(i);
            return (
              <button
                key={label}
                type="button"
                disabled={disabled || off}
                onClick={() => setViewMonth(i)}
                className={monthButtonClass(viewMonth === i && !off, disabled || off)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inizio + Fine — self-contained edge fields */}
      <div className="flex items-start justify-center gap-6 mb-2 px-1">
        <DateEdgeField
          label="Inizio"
          input={startInput}
          active={activeEdge === 'start'}
          flexible={startTolEnabled}
          reserveFlexSlots={reserveFlexSlots}
          daysBefore={startTolBefore}
          daysAfter={startTolAfter}
          disabled={disabled}
          onInputChange={setStartInput}
          onInputApply={() => applyInput('start', startInput)}
          onFlexibleChange={setStartTolEnabled}
          onDaysBeforeChange={setStartTolBefore}
          onDaysAfterChange={setStartTolAfter}
          onActivate={() => {
            setActiveEdge('start');
            if (startIso) scrollToIso(startIso);
          }}
        />
        <DateEdgeField
          label="Fine"
          input={endInput}
          active={activeEdge === 'end'}
          flexible={endTolEnabled}
          reserveFlexSlots={reserveFlexSlots}
          daysBefore={endTolBefore}
          daysAfter={endTolAfter}
          disabled={disabled}
          onInputChange={setEndInput}
          onInputApply={() => applyInput('end', endInput)}
          onFlexibleChange={setEndTolEnabled}
          onDaysBeforeChange={setEndTolBefore}
          onDaysAfterChange={setEndTolAfter}
          onActivate={() => {
            setActiveEdge('end');
            if (endIso) scrollToIso(endIso);
          }}
        />
      </div>

      {/* Hint — always follows active edge focus */}
      <p className="text-[11px] text-amber-200/80 mb-1.5 px-1">{focusHint}</p>
      {startIso && endIso ? (
        <p className="text-[10px] text-stone-400 mb-1.5 px-1">
          {buildPeriodConfirmPayload(startIso, endIso, startTol, endTol).period}
        </p>
      ) : null}

      {/* Compact day panel */}
      <div ref={dayPanelRef}>
        <div className="grid grid-cols-7 gap-px mb-0.5">
          {WEEKDAYS.map((w, i) => (
            <div key={`${w}-${i}`} className="text-center text-[9px] font-medium text-stone-500 py-0.5">
              {w}
            </div>
          ))}
        </div>
        <div
          className="grid grid-cols-7 gap-px select-none"
          onPointerUp={() => setDragEdge(null)}
          onPointerLeave={() => setDragEdge(null)}
        >
          {cells.map((cell, i) => {
            if (!cell.day || !cell.iso) {
              return <div key={`e-${i}`} className="h-7" />;
            }
            const vis = dayVisual(
              cell.iso,
              startIso,
              endIso,
              startTolBeforeVis,
              startTolAfterVis,
              endTolBeforeVis,
              endTolAfterVis
            );
            const isStart = cell.iso === startIso;
            const isEnd = cell.iso === endIso;
            return (
              <button
                key={cell.iso}
                type="button"
                disabled={disabled}
                onClick={() => handleDaySelect(cell.iso!)}
                onPointerDown={(e) => {
                  if (isStart) {
                    setActiveEdge('start');
                    setDragEdge('start');
                  } else if (isEnd) {
                    setActiveEdge('end');
                    setDragEdge('end');
                  }
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerEnter={() => {
                  if (dragEdge) handlePointerDay(cell.iso!, dragEdge);
                }}
                className={`h-7 rounded-sm text-[11px] font-medium transition-colors ${visualClass[vis]}`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      {durationDays && calendarDays != null && calendarDays !== durationDays ? (
        <p className="mt-2 text-[10px] text-amber-500/90 px-1">
          {calendarDays} giorni di calendario · viaggio {durationDays} giorni
        </p>
      ) : null}

      {(startTol > 0 || endTol > 0) && startIso && endIso ? (
        <p className="mt-1 text-[10px] text-stone-400 px-1">
          Core: {isoToDisplay(startIso)} – {isoToDisplay(endIso)}
          {startTol > 0 ? ` · ±${startTol}g prima` : ''}
          {endTol > 0 ? ` · ±${endTol}g dopo` : ''}
        </p>
      ) : null}

      <button
        type="button"
        disabled={disabled || !startIso || !endIso}
        onClick={() => {
          if (!startIso || !endIso) return;
          onConfirm(buildPeriodConfirmPayload(startIso, endIso, startTol, endTol));
        }}
        className="mt-3 w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-amber-50 text-sm font-semibold disabled:opacity-40"
      >
        Conferma periodo
      </button>
    </div>
  );
}
