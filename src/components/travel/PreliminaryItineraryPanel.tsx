/**
 * Itinerary panel — explorer only (confirm + warnings live on accordion header).
 */
import type { PendingReplacement, TravelStop, TravelPhase, UserProfile } from '../../types/travelState';
import type { TravelPhoto } from '../../lib/travel/travelPhoto';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import ItineraryExplorer from './ItineraryExplorer';

type Props = {
  stops: TravelStop[];
  profile?: UserProfile;
  destination?: string | null;
  stopSets?: Record<string, TravelPhoto[]>;
  travelPhase: TravelPhase;
  visible?: boolean;
  locked?: boolean;
  pendingReplacement?: PendingReplacement | null;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  onHeroContextChange?: (ctx: ExplorerHeroContext) => void;
  onStopPhotoPreview?: (stop: TravelStop) => void;
  /** Hide mid-screen tab — use bottom dock instead. */
  useDock?: boolean;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
};

export default function PreliminaryItineraryPanel({
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
  useDock,
  sidebarOpen,
  onSidebarOpenChange,
}: Props) {
  if (!stops.length) return null;

  return (
    <ItineraryExplorer
      stops={stops}
      profile={profile}
      destination={destination}
      stopSets={stopSets}
      visible={visible}
      locked={locked}
      pendingReplacement={pendingReplacement}
      onRequestReplace={onRequestReplace}
      onPickReplacement={onPickReplacement}
      onCancelReplacement={onCancelReplacement}
      onHeroContextChange={onHeroContextChange}
      onStopPhotoPreview={onStopPhotoPreview}
      useDock={useDock}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={onSidebarOpenChange}
    />
  );
}
