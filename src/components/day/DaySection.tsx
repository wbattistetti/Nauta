import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  title: string;
  icon: ReactNode;
  iconBg: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/** Collapsible section card for the day page. */
export default function DaySection({
  title,
  icon,
  iconBg,
  summary,
  open,
  onToggle,
  children,
}: Props) {
  return (
    <section className="rounded-2xl overflow-hidden border border-stone-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors group ${
          open ? 'bg-stone-50/50' : 'hover:bg-stone-50/80'
        }`}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[15px] font-semibold text-stone-800 leading-tight block tracking-tight">
            {title}
          </span>
          {summary && !open && (
            <span className="text-xs text-stone-400 mt-0.5 block line-clamp-2 leading-snug">{summary}</span>
          )}
        </div>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            open ? 'bg-stone-800 text-white rotate-180' : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200'
          }`}
        >
          <ChevronDown size={15} strokeWidth={2.5} />
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-stone-100 px-5 py-5">{children}</div>
      </div>
    </section>
  );
}
