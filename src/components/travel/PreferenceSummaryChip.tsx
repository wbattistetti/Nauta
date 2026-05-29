/**
 * Full-size read-only preference chip — proposal browse (included / excluded).
 */
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  macroSynopticIncludedClasses,
  macroSynopticIncludedIconClass,
} from '../../lib/travel/macroAccent';
import type { MacroPreferenceId } from '../../lib/travel/macroPreferences';
import { PREFERENCE_GRID_COLS } from '../../lib/travel/preferenceUi';

export type SummaryChipState = 'included' | 'excluded';

type Props = {
  label: string;
  Icon: LucideIcon;
  state: SummaryChipState;
  /** Thematic family color when included (macro synoptic). */
  macroId?: MacroPreferenceId;
  /** @deprecated Heart removed — kept for API compat. */
  showHeart?: boolean;
  /** Narrow chip for horizontal synoptic row. */
  compact?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function stateClasses(state: SummaryChipState, macroId?: MacroPreferenceId): string {
  if (state === 'excluded') {
    return 'border-red-600/80 bg-red-950/35 text-red-100/90';
  }
  if (macroId) return macroSynopticIncludedClasses(macroId);
  return 'border-emerald-600/75 bg-emerald-950/45 text-emerald-50 shadow-[0_0_12px_rgba(52,211,153,0.18)]';
}

function iconColor(state: SummaryChipState, macroId?: MacroPreferenceId): string {
  if (state === 'excluded') return 'text-red-300/80';
  if (macroId) return macroSynopticIncludedIconClass(macroId);
  return 'text-emerald-300';
}

export function PreferenceSummaryGrid({ children }: { children: ReactNode }) {
  return <div className={`grid gap-2 w-full ${PREFERENCE_GRID_COLS}`}>{children}</div>;
}

/** Single-row horizontal scroll (like Riepilogo tappe). */
export function PreferenceSummaryScrollRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-0.5 px-0.5">{children}</div>
  );
}

export default function PreferenceSummaryChip({
  label,
  Icon,
  state,
  macroId,
  showHeart = false,
  compact = false,
  disabled,
  onClick,
}: Props) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        'relative flex flex-col items-center justify-center rounded-xl border transition-all',
        compact
          ? 'shrink-0 w-[4.75rem] gap-1 px-1.5 py-2'
          : 'w-full min-w-0 gap-1.5 px-1.5 py-2.5',
        stateClasses(state, macroId),
        onClick ? 'touch-manipulation hover:brightness-110 active:scale-[0.98]' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
      aria-label={state === 'excluded' ? `${label}, esclusa` : `${label}, inclusa`}
    >
      <Icon
        size={compact ? 20 : 22}
        strokeWidth={1.75}
        className={iconColor(state, macroId)}
        aria-hidden
      />
      <span
        className={[
          'font-medium leading-tight text-center',
          compact ? 'text-[9px] line-clamp-2 w-full' : 'text-[10px] line-clamp-2',
        ].join(' ')}
      >
        {label}
      </span>
    </Tag>
  );
}
