/**
 * Master-detail itinerary — sidebar list vs stop detail; drives hero context.
 */
import { useEffect, useRef, useState } from 'react';
import type { PendingReplacement, TravelStop, UserProfile } from '../../types/travelState';
import type { TravelPhoto } from '../../lib/travel/travelPhoto';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import StopDetailView from './StopDetailView';
import StopsIndexDrawer from './StopsIndexDrawer';
import StopsIndexTab from './StopsIndexTab';

type Props = {
  stops: TravelStop[];
  profile?: UserProfile;
  destination?: string | null;
  stopSets?: Record<string, TravelPhoto[]>;
  visible?: boolean;
  locked?: boolean;
  pendingReplacement?: PendingReplacement | null;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  onHeroContextChange?: (ctx: ExplorerHeroContext) => void;
  onStopPhotoPreview?: (stop: TravelStop) => void;
  /** Bottom dock replaces mid-screen TAPPE tab. */
  useDock?: boolean;
  /** Controlled sidebar — when open, hero stays trip-level; when closed, stop detail + stop hero. */
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
};

export default function ItineraryExplorer({
  stops,
  profile,
  destination,
  stopSets,
  visible,
  locked,
  pendingReplacement,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
  onHeroContextChange,
  onStopPhotoPreview,
  useDock = false,
  sidebarOpen: sidebarOpenProp,
  onSidebarOpenChange,
}: Props) {
  const [selectedId, setSelectedId] = useState(stops[0]?.id ?? '');
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const sidebarControlled = sidebarOpenProp !== undefined;
  const sidebarOpen = sidebarControlled ? sidebarOpenProp : internalSidebarOpen;

  function setSidebarOpen(open: boolean) {
    onSidebarOpenChange?.(open);
    if (!sidebarControlled) setInternalSidebarOpen(open);
  }

  useEffect(() => {
    if (stops.length && !stops.some((s) => s.id === selectedId)) {
      setSelectedId(stops[0].id);
    }
  }, [stops, selectedId]);

  const selectedIndex = stops.findIndex((s) => s.id === selectedId);
  const selectedStop = selectedIndex >= 0 ? stops[selectedIndex] : stops[0];

  useEffect(() => {
    if (!visible) {
      if (!sidebarControlled) setInternalSidebarOpen(false);
      onHeroContextChange?.({ mode: 'trip', stop: null });
      return;
    }
    const el = rootRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [visible, onHeroContextChange, sidebarControlled]);

  useEffect(() => {
    if (!visible) return;

    if (sidebarOpen) {
      onHeroContextChange?.({ mode: 'trip', stop: null });
      return;
    }

    if (selectedStop) {
      onHeroContextChange?.({ mode: 'stop', stop: selectedStop });
      onStopPhotoPreview?.(selectedStop);
    }
  }, [visible, sidebarOpen, selectedStop?.id, onHeroContextChange, onStopPhotoPreview]);

  if (!selectedStop) return null;

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < stops.length - 1;
  const showStopDetail = Boolean(visible && !sidebarOpen);

  function focusHeroOnStop(stop: TravelStop) {
    onHeroContextChange?.({ mode: 'stop', stop });
    onStopPhotoPreview?.(stop);
  }

  function selectStop(id: string) {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;
    setSelectedId(id);
    setSidebarOpen(false);
    focusHeroOnStop(stop);
  }

  function closeDrawer() {
    setSidebarOpen(false);
    if (selectedStop) focusHeroOnStop(selectedStop);
  }

  function goPrev() {
    if (!hasPrev) return;
    const stop = stops[selectedIndex - 1];
    setSelectedId(stop.id);
    focusHeroOnStop(stop);
  }

  function goNext() {
    if (!hasNext) return;
    const stop = stops[selectedIndex + 1];
    setSelectedId(stop.id);
    focusHeroOnStop(stop);
  }

  const showTab = visible && !sidebarOpen && !useDock;

  return (
    <>
      {showTab ? <StopsIndexTab onClick={() => setSidebarOpen(true)} /> : null}

      {visible && sidebarOpen ? (
        <StopsIndexDrawer
          stops={stops}
          profile={profile}
          destination={destination}
          stopSets={stopSets}
          selectedId={selectedId}
          onSelect={selectStop}
          onClose={closeDrawer}
        />
      ) : null}

      {showStopDetail ? (
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
      ) : (
        <div ref={rootRef} className="sr-only" aria-hidden />
      )}
    </>
  );
}
