/**
 * Hero chip tutor — short captions with inline icons, expand on No, dismiss on Sì.
 */
import type { ReactNode } from 'react';
import { Eye, Puzzle } from 'lucide-react';
import {
  PLANNING_TUTOR_CLEAR_PROMPT,
  PLANNING_TUTOR_EYE_DETAIL,
  PLANNING_TUTOR_EYE_LINE,
  PLANNING_TUTOR_NO,
  PLANNING_TUTOR_PUZZLE_DETAIL,
  PLANNING_TUTOR_PUZZLE_LINE,
  PLANNING_TUTOR_YES,
} from '../../lib/travel/itineraryCopy';

type Props = {
  hasStops: boolean;
  expanded: boolean;
  onExpand: () => void;
  onDismiss: () => void;
};

function InlineIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex align-middle mx-0.5 -translate-y-px text-amber-100/90">
      {children}
    </span>
  );
}

export default function HeroChipTutor({ hasStops, expanded, onExpand, onDismiss }: Props) {
  return (
    <div
      className="mt-2 pt-2 border-t border-amber-900/30 px-1"
      role="region"
      aria-label="Guida alle icone del viaggio"
    >
      <div className="space-y-1 text-left">
        {hasStops ? (
          <p className="text-[10px] leading-snug text-amber-200/80">
            Premi
            <InlineIcon>
              <Eye size={12} strokeWidth={1.75} aria-hidden />
            </InlineIcon>
            {PLANNING_TUTOR_EYE_LINE}
          </p>
        ) : null}
        <p className="text-[10px] leading-snug text-amber-200/80">
          Premi
          <InlineIcon>
            <Puzzle size={12} strokeWidth={1.75} aria-hidden />
          </InlineIcon>
          {PLANNING_TUTOR_PUZZLE_LINE}
        </p>
      </div>

      {expanded ? (
        <div className="mt-2 space-y-1.5 text-left">
          {hasStops ? (
            <p className="text-[10px] leading-snug text-amber-200/65">{PLANNING_TUTOR_EYE_DETAIL}</p>
          ) : null}
          <p className="text-[10px] leading-snug text-amber-200/65">{PLANNING_TUTOR_PUZZLE_DETAIL}</p>
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-amber-200/75">
        <span>{PLANNING_TUTOR_CLEAR_PROMPT}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="font-semibold text-teal-300/95 hover:text-teal-200 underline underline-offset-2 decoration-teal-600/50 touch-manipulation"
        >
          {PLANNING_TUTOR_YES}
        </button>
        <span aria-hidden>/</span>
        <button
          type="button"
          onClick={onExpand}
          disabled={expanded}
          className="font-semibold text-amber-300/95 hover:text-amber-200 underline underline-offset-2 decoration-amber-600/50 touch-manipulation disabled:opacity-45 disabled:no-underline disabled:cursor-default"
        >
          {PLANNING_TUTOR_NO}
        </button>
      </div>
    </div>
  );
}
