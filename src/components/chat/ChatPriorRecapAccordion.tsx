/**
 * Compact accordion — prior chat recap ("Fin qui ci siamo detti…").
 */
import { ChevronDown } from 'lucide-react';
import { CHAT_PRIOR_RECAP_TITLE } from '../../lib/travel/itineraryCopy';

type Props = {
  previewLine: string;
  recapBody: string;
  open: boolean;
  onToggle: () => void;
};

export default function ChatPriorRecapAccordion({ previewLine, recapBody, open, onToggle }: Props) {
  return (
    <div className="border-b border-amber-900/30 pb-2 mb-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-2 text-left py-1.5 px-0.5 hover:bg-amber-950/20 rounded-md transition-colors touch-manipulation"
      >
        <ChevronDown
          size={16}
          className={`shrink-0 text-amber-500/80 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
        <span className="flex-1 min-w-0">
          <span className="text-xs font-medium text-amber-100/90 block truncate">
            {CHAT_PRIOR_RECAP_TITLE}
          </span>
          {!open ? (
            <span className="text-[10px] font-normal text-amber-500/70 block truncate mt-0.5">
              {previewLine}
            </span>
          ) : null}
        </span>
      </button>
      {open ? (
        <div className="pl-6 pr-1 pb-1 pt-1">
          <p className="text-[11px] font-normal text-amber-200/85 leading-relaxed whitespace-pre-wrap">
            {recapBody}
          </p>
        </div>
      ) : null}
    </div>
  );
}
