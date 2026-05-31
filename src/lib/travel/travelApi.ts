/**
 * Travel Agent API client.
 */
import type {
  TravelMessageResponse,
  TravelPhase,
  TravelState,
  UserProfile,
} from '../../types/travelState';
import type { TripRecord } from '../../types/trip';
import { useLocalApi } from '../apiClient';
import { apiJson } from '../apiJson';

export type TravelMessageResult = TravelMessageResponse & {
  trip: TripRecord;
  chat_messages: TripRecord['chat_messages'];
};

export function useTravelAgent(): boolean {
  return useLocalApi();
}

export async function sendTravelMessage(
  tripId: string,
  message: string,
  opts?: { resuming?: boolean; confirmReplacement?: { stopId: string; candidateId: string } }
): Promise<TravelMessageResult> {
  if (!useTravelAgent()) {
    throw new Error('Travel Agent richiede VITE_USE_LOCAL_API=true');
  }
  return apiJson<TravelMessageResult>(`/api/travel/${tripId}/message`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      resuming: opts?.resuming ?? false,
      confirmReplacement: opts?.confirmReplacement,
    }),
  });
}

export function travelStateFromRecord(record: TripRecord): TravelState | null {
  const ts = record.travel_state;
  if (ts && typeof ts === 'object' && 'version' in ts && ts.version === 1) {
    return ts as TravelState;
  }
  return null;
}

export type TravelProfilePatchResult = {
  travel_state: TravelState;
  travel_phase: TravelPhase;
  profileComplete: boolean;
  panelProfileComplete: boolean;
  showItineraryPanel: boolean;
  itineraryStale?: boolean;
  trip: TripRecord;
};

export type TravelItineraryActionResult = {
  travel_state: TravelState;
  showItineraryPanel: boolean;
  showDayPanels?: boolean;
  itineraryStale?: boolean;
  trip: TripRecord;
};

export async function patchTravelProfile(
  tripId: string,
  profile: Partial<UserProfile>
): Promise<TravelProfilePatchResult> {
  if (!useTravelAgent()) {
    throw new Error('Travel Agent richiede VITE_USE_LOCAL_API=true');
  }
  return apiJson<TravelProfilePatchResult>(`/api/travel/${tripId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify({ profile }),
  });
}

export async function recalculateTravelItinerary(
  tripId: string
): Promise<TravelItineraryActionResult> {
  if (!useTravelAgent()) {
    throw new Error('Travel Agent richiede VITE_USE_LOCAL_API=true');
  }
  return apiJson<TravelItineraryActionResult>(`/api/travel/${tripId}/itinerary/recalculate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function restoreItineraryVersion(
  tripId: string,
  versionId: string
): Promise<TravelItineraryActionResult> {
  if (!useTravelAgent()) {
    throw new Error('Travel Agent richiede VITE_USE_LOCAL_API=true');
  }
  return apiJson<TravelItineraryActionResult>(`/api/travel/${tripId}/itinerary/restore`, {
    method: 'POST',
    body: JSON.stringify({ versionId }),
  });
}

/** Unlock confirmed itinerary — back to Scopri / Controlla accordions. */
export async function reopenTravelItinerary(tripId: string): Promise<TravelItineraryActionResult> {
  if (!useTravelAgent()) {
    throw new Error('Travel Agent richiede VITE_USE_LOCAL_API=true');
  }
  return apiJson<TravelItineraryActionResult>(`/api/travel/${tripId}/itinerary/reopen`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
