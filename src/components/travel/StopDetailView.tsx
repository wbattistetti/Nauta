/**
 * Single stop detail — text and actions only (photos live in top hero band).
 */
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PendingReplacement, TravelStop, UserProfile } from '../../types/travelState';
import { buildStopDetailHeadline } from '../../lib/travel/stopDetailHeadline';
import { STOP_NAV_NEXT_LABEL, STOP_NAV_PREV_LABEL } from '../../lib/travel/itineraryCopy';
import { PLANNING_ROW_X } from './PlanningAccordion';
import StopNotesBody from './StopNotesBody';
import WikipediaPlaceSheet from './WikipediaPlaceSheet';
import type { WikipediaPlaceTarget } from '../../lib/travel/wikipediaSummary';

const BADGE: Record<string, { label: string; className: string }> = {
  salvabile: { label: 'Ok', className: 'bg-emerald-900/60 text-emerald-200' },
  borderline: { label: 'Attenzione', className: 'bg-amber-900/60 text-amber-200' },
  incompatibile: { label: 'Conflitto', className: 'bg-red-900/60 text-red-200' },
};

type Props = {
  stop: TravelStop;
  index: number;
  stops: TravelStop[];
  profile?: UserProfile;
  locked?: boolean;
  pendingReplacement?: PendingReplacement | null;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function StopDetailView({
  stop,
  index,
  stops,
  profile,
  locked,
  pendingReplacement,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const badge = stop.compatibility ? BADGE[stop.compatibility] : null;
  const isPending = pendingReplacement?.stopId === stop.id;
  const showNav = Boolean(onPrev && onNext && (hasPrev || hasNext));
  const [wikiTarget, setWikiTarget] = useState<WikipediaPlaceTarget | null>(null);

  const handlePlaceLinkClick = useCallback((target: WikipediaPlaceTarget) => {
    setWikiTarget(target);
  }, []);

  useEffect(() => {
    setWikiTarget(null);
  }, [stop.id]);

  const headline = buildStopDetailHeadline(stop, index, stops, profile);

  return (
    <article className="pb-4">
      <div className={`${PLANNING_ROW_X} pt-3 space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 pl-6 text-sm font-medium text-amber-50/95 leading-snug">
            {headline}
          </p>
          {badge ? (
            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          ) : null}
        </div>

        {stop.notes ? (
          <StopNotesBody
            notes={stop.notes}
            placeLinks={stop.placeLinks}
            onPlaceLinkClick={handlePlaceLinkClick}
          />
        ) : (
          <p className="text-sm text-amber-500/75 leading-relaxed pl-6 italic">
            Tappa in bilanciamento con le tue preferenze e i tempi di viaggio.
          </p>
        )}

        {!locked &&
        onRequestReplace &&
        (stop.compatibility === 'borderline' || stop.compatibility === 'incompatibile') ? (
          <div className="pl-6">
            <button
              type="button"
              onClick={() => onRequestReplace(stop.id)}
              className="text-xs px-3 py-1.5 rounded-full border border-amber-700/50 text-amber-200 hover:bg-amber-950/50"
            >
              Sostituisci
            </button>
          </div>
        ) : null}

        {isPending && pendingReplacement && onPickReplacement ? (
          <div className="pl-6 pt-2 space-y-1.5 border-t border-amber-900/25">
            <p className="text-[11px] text-amber-400/85">Scegli un&apos;alternativa:</p>
            {pendingReplacement.candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPickReplacement(pendingReplacement.stopId, c.id)}
                className="block w-full text-left text-sm py-1.5 text-amber-100/90 hover:text-teal-200"
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

        {showNav ? (
          <div className="flex gap-2 pt-2 pl-6 pr-0 border-t border-amber-900/25 mt-2">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={onPrev}
              className="flex-1 flex items-center justify-center gap-1 text-xs py-2.5 rounded-lg border border-amber-900/40 text-amber-200/95 hover:bg-amber-950/40 disabled:opacity-35 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={14} aria-hidden />
              {STOP_NAV_PREV_LABEL}
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-1 text-xs py-2.5 rounded-lg border border-amber-900/40 text-amber-200/95 hover:bg-amber-950/40 disabled:opacity-35 disabled:pointer-events-none transition-colors"
            >
              {STOP_NAV_NEXT_LABEL}
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <WikipediaPlaceSheet
        open={wikiTarget !== null}
        target={wikiTarget}
        onClose={() => setWikiTarget(null)}
      />
    </article>
  );
}
