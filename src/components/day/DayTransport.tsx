import type { ReactNode } from 'react';
import type { TransportData } from '../../types/dayPage';
import { formatDuration } from '../../lib/utils';
import DaySection from './DaySection';
import { Navigation2, Map, X, Car, Bus, Plane, CarTaxiFront } from 'lucide-react';

type Props = {
  transport: TransportData;
  mapOpen: boolean;
  onToggleMap: () => void;
  open: boolean;
  onToggle: () => void;
};

/** Transport section — layout adapts to mode from data. */
export default function DayTransport({ transport, mapOpen, onToggleMap, open, onToggle }: Props) {
  const icon =
    transport.mode === 'flight' ? (
      <Plane size={20} className="text-sky-600" strokeWidth={2} />
    ) : transport.mode === 'public' ? (
      <Bus size={20} className="text-indigo-600" strokeWidth={2} />
    ) : transport.mode === 'taxi' ? (
      <CarTaxiFront size={20} className="text-amber-600" strokeWidth={2} />
    ) : (
      <Navigation2 size={20} className="text-teal-600" strokeWidth={2} />
    );

  let summary = 'Spostamenti';
  if (transport.mode === 'camper' || transport.mode === 'car') {
    summary = `${transport.km} km · ${formatDuration(transport.durationMin)}`;
  } else if (transport.mode === 'flight') {
    summary = transport.departureTime;
  } else if (transport.mode === 'public') {
    summary = transport.durationLabel;
  } else if (transport.mode === 'taxi') {
    summary = transport.durationLabel;
  }

  return (
    <DaySection
      title="Come ti muoverai"
      icon={icon}
      iconBg="linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)"
      summary={summary}
      open={open}
      onToggle={onToggle}
    >
      {(transport.mode === 'camper' || transport.mode === 'car') && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Km" value={`${transport.km}`} />
            <Stat label="Guida" value={formatDuration(transport.durationMin)} />
            <Stat label="Partenza" value={transport.departureTime} />
            <Stat label="Arrivo" value={transport.arrivalTime} />
          </div>
          {transport.suggestedStops.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Soste consigliate
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {transport.suggestedStops.map((s) => (
                  <li key={s} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {transport.notes.map((n, i) => (
            <Note key={i} text={n} icon={<Car size={14} className="text-teal-500 shrink-0 mt-0.5" />} />
          ))}
          <MapToggle mapOpen={mapOpen} onToggleMap={onToggleMap} />
        </div>
      )}

      {transport.mode === 'public' && (
        <div className="space-y-4">
          <Stat label="Durata" value={transport.durationLabel} wide />
          {transport.schedule.length > 0 && <ListBlock title="Orari" items={transport.schedule} />}
          {transport.ticketsPurchased.length > 0 && (
            <ListBlock title="Biglietti acquistati" items={transport.ticketsPurchased} variant="ok" />
          )}
          {transport.ticketsToBuy.length > 0 && (
            <ListBlock title="Biglietti da acquistare" items={transport.ticketsToBuy} variant="warn" />
          )}
          {transport.reservationsNeeded.length > 0 && (
            <ListBlock title="Prenotazioni necessarie" items={transport.reservationsNeeded} />
          )}
          {transport.warnings.map((w, i) => (
            <Note key={i} text={w} variant="warn" />
          ))}
        </div>
      )}

      {transport.mode === 'taxi' && (
        <div className="space-y-3">
          <Stat label="Durata" value={transport.durationLabel} wide />
          {transport.estimatedCost && <Stat label="Costo stimato" value={transport.estimatedCost} wide />}
          {transport.notes.map((n, i) => (
            <Note key={i} text={n} icon={<CarTaxiFront size={14} className="text-amber-500 shrink-0 mt-0.5" />} />
          ))}
        </div>
      )}

      {transport.mode === 'flight' && (
        <div className="space-y-3">
          <Stat label="Orario" value={transport.departureTime} wide />
          {transport.terminal && <Stat label="Terminal / punto" value={transport.terminal} wide />}
          {transport.notes.map((n, i) => (
            <Note key={i} text={n} icon={<Plane size={14} className="text-sky-500 shrink-0 mt-0.5" />} />
          ))}
        </div>
      )}

      {transport.mode === 'none' && (
        <p className="text-sm text-stone-500 leading-relaxed italic">{transport.message}</p>
      )}
    </DaySection>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`bg-stone-50 rounded-xl px-3 py-3 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-stone-800 leading-tight">{value}</p>
    </div>
  );
}

function ListBlock({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: 'ok' | 'warn';
}) {
  const bg = variant === 'ok' ? 'bg-emerald-50 border-emerald-100' : variant === 'warn' ? 'bg-amber-50 border-amber-100' : 'bg-stone-50 border-stone-100';
  return (
    <div className={`rounded-xl border px-4 py-3 ${bg}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm text-stone-700 leading-snug">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Note({
  text,
  icon,
  variant,
}: {
  text: string;
  icon?: ReactNode;
  variant?: 'warn';
}) {
  const cls =
    variant === 'warn'
      ? 'bg-amber-50 border-amber-100 text-amber-900'
      : 'bg-sky-50 border-sky-100 text-sky-900';
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

function MapToggle({ mapOpen, onToggleMap }: { mapOpen: boolean; onToggleMap: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggleMap}
      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all border ${
        mapOpen
          ? 'bg-sky-100 text-sky-800 border-sky-300'
          : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
      }`}
    >
      {mapOpen ? <X size={16} /> : <Map size={16} />}
      {mapOpen ? 'Chiudi mappa' : 'Apri mappa del percorso'}
    </button>
  );
}
