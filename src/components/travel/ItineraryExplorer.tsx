/**
 * Master-detail itinerary — drives hero stop focus; no duplicate photo band.
 */
import { useEffect, useRef, useState } from 'react';
import type { PendingReplacement, TravelStop, UserProfile } from '../../types/travelState';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import StopDetailView from './StopDetailView';
import StopsIndexDrawer from './StopsIndexDrawer';
import StopsIndexTab from './StopsIndexTab';

type Props = {
  stops: TravelStop[];
  profile?: UserProfile;
  visible?: boolean;
  locked?: boolean;
  pendingReplacement?: PendingReplacement | null;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  onHeroContextChange?: (ctx: ExplorerHeroContext) => void;
};

export default function ItineraryExplorer({
  stops,
  profile,
  visible,
  locked,
  pendingReplacement,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
  onHeroContextChange,
}: Props) {
  const [selectedId, setSelectedId] = useState(stops[0]?.id ?? '');
  const [indexOpen, setIndexOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stops.length && !stops.some((s) => s.id === selectedId)) {
      setSelectedId(stops[0].id);
    }
  }, [stops, selectedId]);

  const selectedIndex = stops.findIndex((s) => s.id === selectedId);
  const selectedStop = selectedIndex >= 0 ? stops[selectedIndex] : stops[0];

  useEffect(() => {
    if (!visible) {
      setIndexOpen(false);
      onHeroContextChange?.({ mode: 'trip', stop: null, photoIndex: 0 });
      return;
    }
    const el = rootRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [visible, onHeroContextChange]);

  useEffect(() => {
    if (!visible || !selectedStop) {
      onHeroContextChange?.({ mode: 'trip', stop: null, photoIndex: 0 });
      return;
    }
    if (indexOpen) {
      onHeroContextChange?.({ mode: 'trip', stop: null, photoIndex: 0 });
    } else {
      onHeroContextChange?.({ mode: 'stop', stop: selectedStop, photoIndex: 0 });
    }
  }, [visible, indexOpen, selectedStop, onHeroContextChange]);

  if (!selectedStop) return null;

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < stops.length - 1;

  function selectStop(id: string) {
    setSelectedId(id);
    setIndexOpen(false);
  }

  function goPrev() {
    if (hasPrev) setSelectedId(stops[selectedIndex - 1].id);
  }

  function goNext() {
    if (hasNext) setSelectedId(stops[selectedIndex + 1].id);
  }

  const showTab = visible && !indexOpen;

  return (
    <>
      {showTab ? <StopsIndexTab onClick={() => setIndexOpen(true)} /> : null}

      {indexOpen ? (
        <StopsIndexDrawer
          stops={stops}
          selectedId={selectedId}
          onSelect={selectStop}
          onClose={() => setIndexOpen(false)}
        />
      ) : null}

      <div ref={rootRef} className="relative -mx-4 md:-mx-3 scroll-mt-2">
        <StopDetailView
          stop={selectedStop}
          index={selectedIndex >= 0 ? selectedIndex : 0}
          stops={stops}
          profile={profile}
          locked={locked}
          pendingReplacement={pendingReplacement}
          onRequestReplace={onRequestReplace}
          onPickReplacement={onPickReplacement}
          onCancelReplacement={onCancelReplacement}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </>
  );
}
