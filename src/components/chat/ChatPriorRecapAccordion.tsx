/**
 * Full-bleed recap row — prior chat ("Fin qui ci siamo detti…").
 */
import { ChevronDown } from 'lucide-react';
import { CHAT_PRIOR_RECAP_TITLE } from '../../lib/travel/itineraryCopy';
import { PLANNING_ROW_X } from '../travel/PlanningAccordion';

type Props = {
  recapBody: string;
  open: boolean;
  onToggle: () => void;
};

export default function ChatPriorRecapAccordion({ recapBody, open, onToggle }: Props) {
  return (
    <div className="w-full border-b border-amber-900/30 bg-stone-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full flex items-center gap-2 text-left py-3 ${PLANNING_ROW_X} hover:bg-stone-800/80 transition-colors touch-manipulation`}
      >
        <ChevronDown
          size={16}
          className={`shrink-0 text-amber-500/80 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
        <span className="text-xs font-medium text-amber-100/95 truncate">{CHAT_PRIOR_RECAP_TITLE}</span>
      </button>
      {open ? (
        <div className={`${PLANNING_ROW_X} pb-3 pt-0 border-t border-amber-900/25`}>
          <p className="text-[11px] font-normal text-amber-200/90 leading-relaxed whitespace-pre-wrap">
            {recapBody}
          </p>
        </div>
      ) : null}
    </div>
  );
}
