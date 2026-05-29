import type { OvernightData, TimelineStop } from '../../types/dayPage';
import DaySection from './DaySection';
import { Clock3, Moon } from 'lucide-react';

type Props = {
  stops: TimelineStop[];
  overnight: OvernightData;
  open: boolean;
  onToggle: () => void;
};

const KIND_LABEL: Record<string, string> = {
  departure: 'Partenza',
  waypoint: 'Tappa',
  arrival: 'Arrivo',
  activity: 'Attività',
  logistics: 'Logistica',
  tour: 'Tour',
};

function bookingLabel(status: OvernightData['bookingStatus'], message?: string): string {
  if (status === 'booked') return 'Prenotato';
  if (status === 'reminder') return message ?? 'Ricordati di prenotare';
  return message ?? 'Da prenotare';
}

function accLabel(type: OvernightData['accommodationType']): string {
  const map: Record<OvernightData['accommodationType'], string> = {
    hotel: 'Hotel',
    camper: 'Camper',
    tent: 'Tenda',
    pullout: 'Pullout',
    lodge: 'Lodge',
    campground: 'Campeggio',
    other: 'Alloggio',
  };
  return map[type];
}

/** Ordered timeline with overnight as the final stop. */
export default function DayTimeline({ stops, overnight, open, onToggle }: Props) {
  return (
    <DaySection
      title="Timeline della giornata"
      icon={<Clock3 size={20} className="text-violet-600" strokeWidth={2} />}
      iconBg="linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)"
      summary={`${stops.length} tappe · Pernotto in chiusura`}
      open={open}
      onToggle={onToggle}
    >
      <ol className="relative border-l-2 border-violet-200 space-y-6 ml-2">
        {stops.map((stop) => (
          <li key={stop.id} className="pl-5 relative">
            <span className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-violet-400 flex items-center justify-center text-xs">
              {stop.emoji}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500/90">
              {KIND_LABEL[stop.kind] ?? 'Tappa'}
            </p>
            <p className="text-sm font-semibold text-stone-800 leading-snug mt-0.5">{stop.title}</p>
            {stop.time && (
              <p className="text-xs text-stone-500 mt-1">
                {stop.timeLabel ? `${stop.timeLabel}: ` : ''}
                <span className="font-medium text-stone-700">{stop.time}</span>
              </p>
            )}
            {stop.description && (
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{stop.description}</p>
            )}
          </li>
        ))}

        {/* Pernottamento — sempre ultima tappa */}
        <li className="pl-5 relative">
          <span className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <Moon size={11} className="text-white" />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Pernottamento</p>
          <p className="text-xs text-stone-500 mt-0.5">{accLabel(overnight.accommodationType)}</p>
          <p className="text-sm font-semibold text-stone-800 leading-snug mt-1">{overnight.placeName}</p>
          <p className="inline-flex mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            {bookingLabel(overnight.bookingStatus, overnight.bookingMessage)}
          </p>

          <div className="mt-3 space-y-2 text-xs text-stone-600">
            {overnight.amenities.services?.map((s) => (
              <p key={s}><span className="font-medium text-stone-500">Servizi: </span>{s}</p>
            ))}
            {overnight.amenities.parking && (
              <p><span className="font-medium text-stone-500">Parcheggio: </span>{overnight.amenities.parking}</p>
            )}
            {overnight.amenities.safety && (
              <p><span className="font-medium text-stone-500">Sicurezza: </span>{overnight.amenities.safety}</p>
            )}
            {overnight.amenities.noise && (
              <p><span className="font-medium text-stone-500">Rumore: </span>{overnight.amenities.noise}</p>
            )}
            {overnight.amenities.signal && (
              <p><span className="font-medium text-stone-500">Segnale: </span>{overnight.amenities.signal}</p>
            )}
            {overnight.amenities.alternatives?.map((a) => (
              <p key={a}><span className="font-medium text-stone-500">Alternativa: </span>{a}</p>
            ))}
            {overnight.amenities.smartNotes?.map((n) => (
              <p key={n} className="text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                💡 {n}
              </p>
            ))}
          </div>
        </li>
      </ol>
    </DaySection>
  );
}
