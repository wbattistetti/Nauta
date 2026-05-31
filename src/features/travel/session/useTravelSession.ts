/**
 * Travel session state and API orchestration — extracted from NewTripOnboarding.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, TripDraft, TripRecord } from '../../../types/trip';
import type { TravelState, UserProfile } from '../../../types/travelState';
import {
  patchTravelProfile,
  recalculateTravelItinerary,
  restoreItineraryVersion,
  reopenTravelItinerary,
  sendTravelMessage,
  travelStateFromRecord,
  type TravelMessageResult,
} from '../../../lib/travel/travelApi';
import {
  syncUiFromTravelState,
  travelPhaseFromState,
  ITINERARY_PROPOSAL_CHAT_SHORT,
} from '../../../lib/travel/travelUi';
import { AI_ERROR_MESSAGE } from '../../../lib/travel/constants';
import {
  chatMessagesFromRecord,
  createTrip,
  fetchLatestInProgressTrip,
  fetchTrip,
  resetTripOnboarding,
  tripRecordToDraft,
} from '../../../lib/tripService';
import { sliceSessionChatMessages } from '../../../lib/travel/chatHistoryRecap';
import { CURRENT_ITINERARY_VERSION_ID } from '../../../lib/travel/itineraryVersionMenu';
import { buildAfterPeriodConfirmReply } from '@nauta/shared/travelFactsRecap';
import type { PeriodConfirmPayload } from '../../../lib/travel/periodFormat';

function assistantMessage(content: string): ChatMessage {
  return { id: crypto.randomUUID(), role: 'assistant', content };
}

const EMPTY_PROFILE: UserProfile = { likes: [], dislikes: [] };

export type UseTravelSessionResult = ReturnType<typeof useTravelSession>;

export function useTravelSession() {
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<TripDraft>({});
  const [tripId, setTripId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [pendingResumeTrip, setPendingResumeTrip] = useState<TripRecord | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [assistantReadySignal, setAssistantReadySignal] = useState(0);
  const [travelState, setTravelState] = useState<TravelState | null>(null);
  const [showItineraryPanel, setShowItineraryPanel] = useState(false);
  const [showDayPanels, setShowDayPanels] = useState(false);
  const [profilePatchError, setProfilePatchError] = useState<string | null>(null);
  const profilePatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProfilePatch = useRef<Partial<UserProfile>>({});
  const [panelMicroFeedback, setPanelMicroFeedback] = useState<string | null>(null);
  const microFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recalculateLoading, setRecalculateLoading] = useState(false);
  const [archivedPriorMessages, setArchivedPriorMessages] = useState<ChatMessage[]>([]);
  const archivedPriorCountRef = useRef(0);
  const [priorRecapOpen, setPriorRecapOpen] = useState(false);
  const pendingFollowUpRef = useRef<string | null>(null);

  const travelPhase = travelPhaseFromState(travelState);

  const beginFreshChatSession = useCallback((record: TripRecord) => {
    const saved = chatMessagesFromRecord(record);
    archivedPriorCountRef.current = saved.length;
    setArchivedPriorMessages(saved);
    setMessages([]);
    setPriorRecapOpen(false);
  }, []);

  const applyTravelResult = useCallback((result: TravelMessageResult) => {
    const ui = syncUiFromTravelState(result.travel_state);
    const hasStops = (result.travel_state?.itinerary.stops.length ?? 0) > 0;
    const archiveCount = archivedPriorCountRef.current;

    if (result.followUpAfterPhotos) {
      pendingFollowUpRef.current = result.followUpAfterPhotos;
    }

    setTravelState(ui.travelState);
    setShowItineraryPanel(result.showItineraryPanel ?? ui.showItineraryPanel);
    setShowDayPanels(result.showDayPanels ?? ui.showDayPanels);
    setDraft(tripRecordToDraft(result.trip));
    setMessages(() => {
      let chat = result.chat_messages.filter(
        (m) => !(m.role === 'assistant' && /ho registrato|registrato che siete/i.test(m.content))
      );
      chat = sliceSessionChatMessages(chat, archiveCount);
      if (hasStops) {
        const last = chat[chat.length - 1];
        if (last?.role === 'assistant') {
          chat = [...chat.slice(0, -1), { ...last, content: ITINERARY_PROPOSAL_CHAT_SHORT }];
        } else if (chat.length === 0) {
          chat = [assistantMessage(ITINERARY_PROPOSAL_CHAT_SHORT)];
        } else {
          chat = [...chat, assistantMessage(ITINERARY_PROPOSAL_CHAT_SHORT)];
        }
      }
      return chat;
    });
    setTripId(result.trip.id);
  }, []);

  const applyRecordToState = useCallback((record: TripRecord) => {
    const ts = travelStateFromRecord(record);
    const ui = syncUiFromTravelState(ts);
    setTripId(record.id);
    setDraft(tripRecordToDraft(record));
    setTravelState(ui.travelState);
    setShowItineraryPanel(ui.showItineraryPanel);
    setShowDayPanels(ui.showDayPanels);
    setChatStarted(true);
    setChatError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const pending = await fetchLatestInProgressTrip();
        if (!cancelled) setPendingResumeTrip(pending);
      } catch {
        if (!cancelled) setPendingResumeTrip(null);
      }
      if (!cancelled) setHydrated(true);
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendToAgent = useCallback(
    async (
      text: string,
      opts?: { resuming?: boolean; confirmReplacement?: { stopId: string; candidateId: string } }
    ) => {
      if (!tripId) throw new Error('Nessun viaggio attivo');
      const result = await sendTravelMessage(tripId, text, opts);
      applyTravelResult(result);
      setAssistantReadySignal((n) => n + 1);
      return result;
    },
    [tripId, applyTravelResult]
  );

  const flushProfilePatch = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!tripId) return;
      setProfilePatchError(null);
      try {
        const result = await patchTravelProfile(tripId, patch);
        const ui = syncUiFromTravelState(result.travel_state);
        setTravelState(ui.travelState);
        setShowItineraryPanel(result.showItineraryPanel ?? ui.showItineraryPanel);
        setDraft(tripRecordToDraft(result.trip));
      } catch (e) {
        setProfilePatchError(e instanceof Error ? e.message : 'Errore salvataggio preferenze');
      }
    },
    [tripId]
  );

  const handleProfilePanelChange = useCallback(
    (patch: Partial<UserProfile>) => {
      if (microFeedbackTimer.current) clearTimeout(microFeedbackTimer.current);
      setPanelMicroFeedback('Preferenza aggiornata');
      microFeedbackTimer.current = setTimeout(() => setPanelMicroFeedback(null), 2800);

      pendingProfilePatch.current = {
        ...pendingProfilePatch.current,
        ...patch,
        likes: patch.likes ?? pendingProfilePatch.current.likes,
        dislikes: patch.dislikes ?? pendingProfilePatch.current.dislikes,
      };
      const merged = pendingProfilePatch.current;
      setTravelState((prev) =>
        prev
          ? {
              ...prev,
              profile: {
                ...prev.profile,
                ...merged,
                likes: merged.likes ?? prev.profile.likes,
                dislikes: merged.dislikes ?? prev.profile.dislikes,
              },
              itineraryStale:
                prev.itinerary.stops.length > 0 && !prev.locked ? true : prev.itineraryStale,
            }
          : {
              version: 1,
              travel_phase: 'phase1',
              profile: { ...EMPTY_PROFILE, ...merged },
              itinerary: { stops: [], days: [] },
              locked: false,
              pendingReplacement: null,
            }
      );
      if (profilePatchTimer.current) clearTimeout(profilePatchTimer.current);
      profilePatchTimer.current = setTimeout(() => {
        const toSend = { ...pendingProfilePatch.current };
        pendingProfilePatch.current = {};
        void flushProfilePatch(toSend);
      }, 400);
    },
    [flushProfilePatch]
  );

  const handlePeriodConfirm = useCallback(
    async (payload: PeriodConfirmPayload) => {
      if (profilePatchTimer.current) {
        clearTimeout(profilePatchTimer.current);
        profilePatchTimer.current = null;
      }

      const patch: Partial<UserProfile> = {
        ...pendingProfilePatch.current,
        ...payload,
      };
      pendingProfilePatch.current = {};

      setTravelState((prev) =>
        prev
          ? {
              ...prev,
              profile: {
                ...prev.profile,
                ...patch,
                likes: patch.likes ?? prev.profile.likes,
                dislikes: patch.dislikes ?? prev.profile.dislikes,
              },
              itineraryStale:
                prev.itinerary.stops.length > 0 && !prev.locked ? true : prev.itineraryStale,
            }
          : {
              version: 1,
              travel_phase: 'phase1',
              profile: { ...EMPTY_PROFILE, ...patch },
              itinerary: { stops: [], days: [] },
              locked: false,
              pendingReplacement: null,
            }
      );

      if (!tripId) return;

      setProfilePatchError(null);
      try {
        const result = await patchTravelProfile(tripId, patch);
        const ui = syncUiFromTravelState(result.travel_state);
        setTravelState(ui.travelState);
        setShowItineraryPanel(result.showItineraryPanel ?? ui.showItineraryPanel);
        setDraft(tripRecordToDraft(result.trip));

        const reply = buildAfterPeriodConfirmReply(result.travel_state.profile);
        if (reply) {
          setMessages((prev) => {
            if (prev.some((m) => m.role === 'assistant' && m.content === reply)) return prev;
            return [...prev, assistantMessage(reply)];
          });
          setAssistantReadySignal((n) => n + 1);
        }
      } catch (e) {
        setProfilePatchError(e instanceof Error ? e.message : 'Errore salvataggio date');
      }
    },
    [tripId]
  );

  const applyItineraryActionResult = useCallback(
    (result: {
      travel_state: TravelState;
      showItineraryPanel?: boolean;
      showDayPanels?: boolean;
      trip: TripRecord;
    }) => {
      const ui = syncUiFromTravelState(result.travel_state);
      setTravelState(ui.travelState);
      setShowItineraryPanel(result.showItineraryPanel ?? ui.showItineraryPanel);
      setShowDayPanels(result.showDayPanels ?? ui.showDayPanels);
      setDraft(tripRecordToDraft(result.trip));
    },
    []
  );

  const handleReopenItinerary = useCallback(async () => {
    if (!tripId) return;
    setRecalculateLoading(true);
    setProfilePatchError(null);
    try {
      const result = await reopenTravelItinerary(tripId);
      applyItineraryActionResult(result);
    } catch (e) {
      setProfilePatchError(e instanceof Error ? e.message : "Impossibile riaprire l'itinerario");
    } finally {
      setRecalculateLoading(false);
    }
  }, [tripId, applyItineraryActionResult]);

  const handleRecalculateItinerary = useCallback(async () => {
    if (!tripId) return;
    setRecalculateLoading(true);
    setProfilePatchError(null);
    try {
      const result = await recalculateTravelItinerary(tripId);
      applyItineraryActionResult(result);
    } catch (e) {
      setProfilePatchError(e instanceof Error ? e.message : 'Ricalcolo non riuscito');
    } finally {
      setRecalculateLoading(false);
    }
  }, [tripId, applyItineraryActionResult]);

  const handleMenuItineraryVersion = useCallback(
    async (targetTripId: string, versionId: string) => {
      if (versionId === CURRENT_ITINERARY_VERSION_ID) return;
      if (targetTripId !== tripId) {
        const trip = await fetchTrip(targetTripId);
        if (!trip) return;
        applyRecordToState(trip);
        beginFreshChatSession(trip);
        setPendingResumeTrip(null);
      }
      if (!targetTripId) return;
      setRecalculateLoading(true);
      setProfilePatchError(null);
      try {
        const result = await restoreItineraryVersion(targetTripId, versionId);
        applyItineraryActionResult(result);
      } catch (e) {
        setProfilePatchError(e instanceof Error ? e.message : 'Ripristino non riuscito');
      } finally {
        setRecalculateLoading(false);
      }
    },
    [tripId, applyRecordToState, applyItineraryActionResult, beginFreshChatSession]
  );

  const handleDestinationPhotosReady = useCallback(() => {
    const text = pendingFollowUpRef.current;
    if (!text) return;
    pendingFollowUpRef.current = null;
    setMessages((prev) => {
      if (prev.some((m) => m.role === 'assistant' && m.content === text)) return prev;
      return [...prev, assistantMessage(text)];
    });
    setAssistantReadySignal((n) => n + 1);
  }, []);

  const resetSessionUi = useCallback(() => {
    setTripId(null);
    setChatStarted(false);
    setMessages([]);
    archivedPriorCountRef.current = 0;
    setArchivedPriorMessages([]);
    setPriorRecapOpen(false);
    setTravelState(null);
    setShowItineraryPanel(false);
    setShowDayPanels(false);
    setPanelMicroFeedback(null);
    pendingProfilePatch.current = {};
    setProfilePatchError(null);
    setDraft({});
    setChatError(null);
    pendingFollowUpRef.current = null;
  }, []);

  const handleSend = useCallback(
    async (text: string, stopListening?: () => void) => {
      if (aiLoading || !tripId) return;
      stopListening?.();

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setChatError(null);
      setAiLoading(true);

      try {
        await sendToAgent(text);
      } catch (e) {
        setChatError(e instanceof Error ? e.message : AI_ERROR_MESSAGE);
      } finally {
        setAiLoading(false);
      }
    },
    [aiLoading, tripId, sendToAgent]
  );

  const handleResumePending = useCallback(async () => {
    if (!pendingResumeTrip) return;
    const record = pendingResumeTrip;
    setPendingResumeTrip(null);
    applyRecordToState(record);
    beginFreshChatSession(record);
  }, [pendingResumeTrip, applyRecordToState, beginFreshChatSession]);

  const handleStartNew = useCallback(async () => {
    setPendingResumeTrip(null);
    setChatError(null);
    setPanelMicroFeedback(null);
    pendingProfilePatch.current = {};
    setProfilePatchError(null);
    try {
      const id = await createTrip();
      const record = await resetTripOnboarding(id);
      const ts = travelStateFromRecord(record);
      const ui = syncUiFromTravelState(ts);
      setTripId(record.id);
      setChatStarted(true);
      setTravelState(ui.travelState);
      setShowItineraryPanel(false);
      setShowDayPanels(false);
      setDraft({});
      archivedPriorCountRef.current = 0;
      setArchivedPriorMessages([]);
      setMessages(chatMessagesFromRecord(record));
    } catch (e) {
      setChatError(e instanceof Error ? e.message : 'Impossibile avviare un nuovo viaggio');
    }
  }, []);

  const handleNewTripFromMenu = useCallback(() => {
    resetSessionUi();
    void fetchLatestInProgressTrip().then(setPendingResumeTrip);
  }, [resetSessionUi]);

  const handlePickReplacement = useCallback(
    (stopId: string, candidateId: string) => {
      if (!tripId) return;
      setAiLoading(true);
      sendTravelMessage(tripId, 'Confermo la sostituzione', {
        confirmReplacement: { stopId, candidateId },
      })
        .then(applyTravelResult)
        .catch((e) => setChatError(e instanceof Error ? e.message : AI_ERROR_MESSAGE))
        .finally(() => setAiLoading(false));
    },
    [tripId, applyTravelResult]
  );

  useEffect(
    () => () => {
      if (profilePatchTimer.current) clearTimeout(profilePatchTimer.current);
      if (microFeedbackTimer.current) clearTimeout(microFeedbackTimer.current);
    },
    []
  );

  return {
    chatStarted,
    messages,
    draft,
    tripId,
    hydrated,
    pendingResumeTrip,
    aiLoading,
    chatError,
    assistantReadySignal,
    travelState,
    showItineraryPanel,
    showDayPanels,
    profilePatchError,
    panelMicroFeedback,
    recalculateLoading,
    archivedPriorMessages,
    priorRecapOpen,
    setPriorRecapOpen,
    travelPhase,
    applyRecordToState,
    beginFreshChatSession,
    applyTravelResult,
    handleProfilePanelChange,
    handlePeriodConfirm,
    handleReopenItinerary,
    handleRecalculateItinerary,
    handleMenuItineraryVersion,
    handleSend,
    handleResumePending,
    handleStartNew,
    handleNewTripFromMenu,
    handlePickReplacement,
    handleDestinationPhotosReady,
    setTravelState,
    setPendingResumeTrip,
  };
}
