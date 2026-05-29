import type { WhatYouSeeItem } from '../../types/dayPage';
import DaySection from './DaySection';
import { Eye } from 'lucide-react';

type Props = {
  items: WhatYouSeeItem[];
  open: boolean;
  onToggle: () => void;
};

/** Emotional preview of what the traveller will experience today. */
export default function DayWhatYouSee({ items, open, onToggle }: Props) {
  const summary = items.map((i) => i.text).slice(0, 2).join(' · ');

  return (
    <DaySection
      title="Cosa vedrai oggi"
      icon={<Eye size={20} className="text-sky-600" strokeWidth={2} />}
      iconBg="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
      summary={summary}
      open={open}
      onToggle={onToggle}
    >
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-2xl leading-none shrink-0 w-8 text-center" aria-hidden>
              {item.emoji}
            </span>
            <p className="text-sm text-stone-700 leading-relaxed font-medium">{item.text}</p>
          </li>
        ))}
      </ul>
    </DaySection>
  );
}
