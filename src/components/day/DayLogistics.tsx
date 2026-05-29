import type { LogisticsData } from '../../types/dayPage';
import DaySection from './DaySection';
import { ShoppingBag } from 'lucide-react';

type Props = {
  data: LogisticsData;
  open: boolean;
  onToggle: () => void;
};

/** Shopping, fuel, check-in, permits and operational notes. */
export default function DayLogistics({ data, open, onToggle }: Props) {
  const hasContent =
    data.shopping.length > 0 ||
    data.fuelNotes.length > 0 ||
    data.checkInNotes.length > 0 ||
    data.permits.length > 0 ||
    data.warnings.length > 0 ||
    data.operationalNotes.length > 0;

  const summary =
    data.shopping[0] ?? data.checkInNotes[0] ?? (hasContent ? 'Note operative' : 'Nessuna attività');

  return (
    <DaySection
      title="Spesa & Logistica"
      icon={<ShoppingBag size={20} className="text-emerald-600" strokeWidth={2} />}
      iconBg="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
      summary={summary}
      open={open}
      onToggle={onToggle}
    >
      {!hasContent ? (
        <p className="text-sm text-stone-400 italic">Nessuna spesa o logistica particolare oggi.</p>
      ) : (
        <div className="space-y-4">
          {data.shopping.length > 0 && <Block title="Spesa prevista" items={data.shopping} />}
          {data.fuelNotes.length > 0 && <Block title="Benzina / carburante" items={data.fuelNotes} />}
          {data.checkInNotes.length > 0 && <Block title="Check-in / camper" items={data.checkInNotes} />}
          {data.permits.length > 0 && <Block title="Permessi" items={data.permits} />}
          {data.warnings.length > 0 && (
            <Block title="Attenzione" items={data.warnings} variant="warn" />
          )}
          {data.operationalNotes.length > 0 && (
            <Block title="Note operative" items={data.operationalNotes} />
          )}
        </div>
      )}
    </DaySection>
  );
}

function Block({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: 'warn';
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className={`text-sm leading-relaxed flex items-start gap-2 ${
              variant === 'warn' ? 'text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2' : 'text-stone-700'
            }`}
          >
            {variant !== 'warn' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
