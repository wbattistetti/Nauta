/**
 * Flat planning accordions — full-width divider headers, no nested boxes.
 */
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** Single outer frame for the whole planning block below chat. */
export const PLANNING_PANEL_SHELL =
  'rounded-lg border border-amber-900/35 overflow-hidden bg-stone-950/20';

export const PLANNING_PANEL_DIVIDE = 'divide-y divide-amber-900/25';

export function PlanningPanelBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-3 ${className}`.trim()}>{children}</div>;
}

export function PlanningAccordionSection({
  children,
  highlighted,
  sectionRef,
}: {
  children: ReactNode;
  highlighted?: boolean;
  sectionRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <section
      ref={sectionRef}
      className={highlighted ? 'bg-emerald-950/15 transition-colors duration-300' : undefined}
    >
      {children}
    </section>
  );
}

export function PlanningAccordionHeader({
  title,
  subtitle,
  open,
  onToggle,
  disabled,
  badge,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex w-full items-stretch min-h-[2.75rem]">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={open}
        className="flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-3 text-left bg-transparent hover:bg-amber-950/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="min-w-0 flex-1 pr-2">
          <span className="text-sm font-normal text-amber-100/95 leading-snug block">{title}</span>
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
      {actionLabel && onAction ? (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="shrink-0 self-center text-xs font-normal text-amber-500/85 hover:text-amber-300 lowercase px-3 border-l border-amber-900/25 disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function PlanningAccordionBody({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <div className="px-3 pb-4 pt-0">{children}</div>;
}
