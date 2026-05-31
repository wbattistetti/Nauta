/**
 * Itinerary panel — explorer only (confirm + warnings live on accordion header).
 */
import type { PendingReplacement, TravelStop, TravelPhase, UserProfile } from '../../types/travelState';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import ItineraryExplorer from './ItineraryExplorer';

type Props = {
  stops: TravelStop[];
  profile?: UserProfile;
  travelPhase: TravelPhase;
  visible?: boolean;
  locked?: boolean;
  pendingReplacement?: PendingReplacement | null;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  onHeroContextChange?: (ctx: ExplorerHeroContext) => void;
};

export default function PreliminaryItineraryPanel({
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
  if (!stops.length) return null;

  return (
    <ItineraryExplorer
      stops={stops}
      profile={profile}
      visible={visible}
      locked={locked}
      pendingReplacement={pendingReplacement}
      onRequestReplace={onRequestReplace}
      onPickReplacement={onPickReplacement}
      onCancelReplacement={onCancelReplacement}
      onHeroContextChange={onHeroContextChange}
    />
  );
}
