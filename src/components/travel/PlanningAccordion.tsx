/**
 * Flat planning accordions — full-width divider headers, no nested boxes.
 */
import type { ReactNode } from 'react';
import { Check, ChevronDown, ThumbsDown } from 'lucide-react';

/** Full-bleed on mobile; card frame from md up. */
export const PLANNING_PANEL_SHELL =
  'w-full border-y border-amber-900/30 overflow-hidden bg-stone-900 md:rounded-xl md:border md:border-amber-900/40 md:shadow-md md:shadow-black/20';

export const PLANNING_PANEL_DIVIDE = 'divide-y divide-amber-900/25';

/** Horizontal padding inside rows (not on viewport edges). */
export const PLANNING_ROW_X = 'px-4 md:px-3';

export function PlanningPanelBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${PLANNING_ROW_X} ${className}`.trim()}>{children}</div>;
}

export function PlanningAccordionSection({
  children,
  highlighted,
  tone,
  sectionRef,
}: {
  children: ReactNode;
  highlighted?: boolean;
  tone?: 'liked' | 'disliked';
  sectionRef?: (el: HTMLElement | null) => void;
}) {
  const toneClass =
    tone === 'liked'
      ? 'bg-emerald-950/25'
      : tone === 'disliked'
        ? 'bg-red-950/20'
        : highlighted
          ? 'bg-emerald-950/15'
          : undefined;

  return (
    <section ref={sectionRef} className={`transition-colors duration-300 ${toneClass ?? ''}`.trim()}>
      {children}
    </section>
  );
}

export function PlanningAccordionHeader({
  title,
  titleNode,
  subtitle,
  open,
  onToggle,
  disabled,
  badge,
  actionLabel,
  onAction,
  titleAction,
  trailingAction,
  feedbackTone,
}: {
  title: string;
  /** Rich title (overrides plain title when set). */
  titleNode?: ReactNode;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Icon or control beside the title (e.g. recalculate). */
  titleAction?: ReactNode;
  /** Extra control on header row (e.g. Conferma itinerario). */
  trailingAction?: ReactNode;
  /** Visual state after thumbs up/down on itinerary row. */
  feedbackTone?: 'liked' | 'disliked';
}) {
  const toggleToneClass =
    feedbackTone === 'liked'
      ? 'bg-emerald-950/45 hover:bg-emerald-950/55 ring-1 ring-inset ring-emerald-700/50'
      : feedbackTone === 'disliked'
        ? 'bg-red-950/40 hover:bg-red-950/50 ring-1 ring-inset ring-red-800/45'
        : 'bg-transparent hover:bg-amber-950/25';

  const feedbackIcon =
    feedbackTone === 'liked' ? (
      <Check size={16} strokeWidth={2.5} className="shrink-0 text-emerald-400" aria-hidden />
    ) : feedbackTone === 'disliked' ? (
      <ThumbsDown size={16} strokeWidth={2.5} className="shrink-0 text-red-400" aria-hidden />
    ) : null;

  return (
    <div className="flex w-full items-stretch min-h-[2.75rem]">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={open}
        className={`flex-1 min-w-0 flex items-center justify-between gap-2 ${PLANNING_ROW_X} py-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${toggleToneClass}`}
      >
        <span className="min-w-0 flex-1 pr-2">
          <span className="flex items-center gap-1.5">
            {feedbackIcon}
            {titleNode ?? (
              <span className="text-sm font-medium text-amber-50 leading-snug">{title}</span>
            )}
            {titleAction}
          </span>
          {subtitle ? (
            <span className="text-[11px] font-normal text-amber-500/75 mt-1 block leading-relaxed">
              {subtitle}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-2 shrink-0 self-center">
          {badge ? (
            <span className="text-[10px] font-medium text-teal-400/90 tabular-nums">{badge}</span>
          ) : null}
          <ChevronDown
            size={17}
            strokeWidth={2}
            className={`text-amber-500/70 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </span>
      </button>
      {trailingAction ? (
        <div
          className={`shrink-0 self-stretch flex items-center pr-2 border-l pl-2 transition-colors ${
            feedbackTone === 'liked'
              ? 'border-emerald-800/40 bg-emerald-950/45'
              : feedbackTone === 'disliked'
                ? 'border-red-800/40 bg-red-950/40'
                : 'border-amber-900/25 self-center'
          }`}
        >
          {trailingAction}
        </div>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="shrink-0 self-center text-xs font-normal text-amber-500/85 hover:text-amber-300 lowercase pr-4 pl-3 md:px-3 border-l border-amber-900/25 disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function PlanningAccordionBody({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <div className={`${PLANNING_ROW_X} pb-4 pt-0`}>{children}</div>;
}
