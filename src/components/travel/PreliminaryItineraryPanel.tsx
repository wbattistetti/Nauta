/**
 * Itinerary stop list — embedded in planning accordion (no duplicate outer chrome).
 */
import type { PendingReplacement, TravelStop, TravelPhase } from '../../types/travelState';
import StopPhotosAccordion from './StopPhotosAccordion';

const BADGE: Record<string, { label: string; className: string }> = {
  salvabile: { label: 'Ok', className: 'bg-emerald-900/60 text-emerald-200' },
  borderline: { label: 'Attenzione', className: 'bg-amber-900/60 text-amber-200' },
  incompatibile: { label: 'Conflitto', className: 'bg-red-900/60 text-red-200' },
};

type Props = {
  stops: TravelStop[];
  travelPhase: TravelPhase;
  locked?: boolean;
  pendingReplacement?: PendingReplacement | null;
  onConfirm?: () => void;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
};

export default function PreliminaryItineraryPanel({
  stops,
  locked,
  pendingReplacement,
  onConfirm,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
}: Props) {
  if (!stops.length) return null;

  const conflicts = stops.filter(
    (s) => s.compatibility === 'borderline' || s.compatibility === 'incompatibile'
  );

  return (
    <div className="space-y-3">
      {!locked && onConfirm ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs px-3 py-1.5 rounded-full bg-teal-800 text-amber-50 font-medium"
          >
            Conferma itinerario
          </button>
        </div>
      ) : null}

      {conflicts.length > 0 ? (
        <p className="text-xs font-normal text-amber-500/85 py-1.5">
          {conflicts.length === 1
            ? '1 tappa richiede attenzione: valuta una sostituzione.'
            : `${conflicts.length} tappe richiedono attenzione.`}
        </p>
      ) : null}

      <ul className="divide-y divide-amber-900/20 max-h-[50vh] overflow-y-auto -mx-1">
        {stops.map((stop, index) => {
          const badge = stop.compatibility ? BADGE[stop.compatibility] : null;
          const isPending = pendingReplacement?.stopId === stop.id;

          return (
            <li
              key={stop.id}
              className={`py-3 first:pt-0 ${isPending ? 'bg-red-950/15 -mx-1 px-1' : ''}`}
            >
              <div className="flex gap-2 items-start">
                <span className="text-[10px] text-amber-600/80 font-mono w-4 pt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal text-amber-50/95 truncate">{stop.name}</p>
                  <p className="text-xs font-normal text-amber-500/75">
                    {stop.days} {stop.days === 1 ? 'giorno' : 'giorni'}
                    {stop.region ? ` · ${stop.region}` : ''}
                  </p>
                  {stop.notes ? (
                    <p className="text-[10px] text-amber-600/70 mt-0.5 line-clamp-2">{stop.notes}</p>
                  ) : null}
                  {stop.themes?.length ? (
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {stop.themes.slice(0, 4).join(' · ')}
                    </p>
                  ) : null}
                  <StopPhotosAccordion stopName={stop.name} />
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {badge ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  ) : null}
                  {!locked &&
                  onRequestReplace &&
                  (stop.compatibility === 'borderline' ||
                    stop.compatibility === 'incompatibile') ? (
                    <button
                      type="button"
                      onClick={() => onRequestReplace(stop.id)}
                      className="text-[10px] text-amber-400 underline"
                    >
                      Sostituisci
                    </button>
                  ) : null}
                </div>
              </div>

              {isPending && pendingReplacement && onPickReplacement ? (
                <div className="mt-2 pt-2 space-y-1.5">
                  <p className="text-[10px] font-normal text-amber-400/80">Scegli un&apos;alternativa:</p>
                  {pendingReplacement.candidates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onPickReplacement(pendingReplacement.stopId, c.id)}
                      className="w-full text-left text-xs font-normal py-1.5 text-amber-100/90 hover:text-teal-200"
                    >
                      {c.name}
                      {c.region ? ` · ${c.region}` : ''}
                    </button>
                  ))}
                  {onCancelReplacement ? (
                    <button
                      type="button"
                      onClick={onCancelReplacement}
                      className="text-[10px] text-stone-500 underline"
                    >
                      Annulla
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
