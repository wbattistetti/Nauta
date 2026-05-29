import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatMessage, TripDraft, TripRecord } from '../../types/trip';
import type { TravelState } from '../../types/travelState';
import {
  patchTravelProfile,
  recalculateTravelItinerary,
  restoreItineraryVersion,
  sendTravelMessage,
  travelStateFromRecord,
  useTravelAgent,
  type TravelMessageResult,
} from '../../lib/travel/travelApi';
import {
  chatInputPlaceholder,
  syncUiFromTravelState,
  travelPhaseFromState,
  ITINERARY_PROPOSAL_CHAT_SHORT,
} from '../../lib/travel/travelUi';
import { AI_ERROR_MESSAGE } from '../../lib/trip/tripConstants';
import {
  chatMessagesFromRecord,
  createTrip,
  fetchLatestInProgressTrip,
  fetchTrip,
  resetTripOnboarding,
  tripDisplayLabel,
  tripRecordToDraft,
} from '../../lib/tripService';
import { buildChatHistoryRecap, sliceSessionChatMessages } from '../../lib/travel/chatHistoryRecap';
import { buildTripPeriodSubtitle } from '../../lib/travel/planningSummary';
import {
  buildTripItineraryContextLine,
  CURRENT_ITINERARY_VERSION_ID,
} from '../../lib/travel/itineraryVersionMenu';
import ChatPriorRecapAccordion from '../chat/ChatPriorRecapAccordion';
import ChatPanel from '../chat/ChatPanel';
import StickyAiCostBadge from '../chat/StickyAiCostBadge';
import { useAiCallCosts } from '../../hooks/useAiCallCosts';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import SplashHeader from '../splash/SplashHeader';
import NewTripSplashHero from './NewTripLanding';
import TripPlanningAccordions from '../travel/TripPlanningAccordions';
import type { UserProfile } from '../../types/travelState';
import TripDayPanel from '../trip/TripDayPanel';
import ChatTripBackground from './ChatTripBackground';
import TripChatHeader from '../travel/TripChatHeader';
import { APP_STICKY_HEADER_PX } from '../../lib/layout';

function assistantMessage(content: string): ChatMessage {
  return { id: crypto.randomUUID(), role: 'assistant', content };
}

/** Splash + Travel Agent (travel_phase). Postgres only. */
export default function NewTripOnboarding() {
  const travelMode = useTravelAgent();

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
  /** Messages from before this UI session (shown only in recap accordion). */
  const [archivedPriorMessages, setArchivedPriorMessages] = useState<ChatMessage[]>([]);
  const archivedPriorCountRef = useRef(0);
  const [priorRecapOpen, setPriorRecapOpen] = useState(false);

  const travelPhase = travelPhaseFromState(travelState);
  const emptyProfile: UserProfile = { likes: [], dislikes: [] };
  const { lastCall, totals, refresh: refreshAiCosts } = useAiCallCosts(chatStarted);

  const { supported: voiceSupported, listening: voiceListening, startListening, stopListening } =
    useSpeechInput({
      onTranscript: (text) => {
        void handleSend(text);
      },
      autoListenAfterReply: true,
      assistantReadySignal,
      disabled: aiLoading,
    });

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

  async function sendToAgent(
    text: string,
    opts?: { resuming?: boolean; confirmReplacement?: { stopId: string; candidateId: string } }
  ) {
    if (!tripId) throw new Error('Nessun viaggio attivo');
    const result = await sendTravelMessage(tripId, text, opts);
    applyTravelResult(result);
    void refreshAiCosts();
    setAssistantReadySignal((n) => n + 1);
  }

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

  const showTripPlanningUI = Boolean(
    travelState && syncUiFromTravelState(travelState).showTripPlanningUI
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
              profile: { ...emptyProfile, ...merged },
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

  const applyItineraryActionResult = useCallback(
    (result: { travel_state: TravelState; showItineraryPanel?: boolean; trip: TripRecord }) => {
      const ui = syncUiFromTravelState(result.travel_state);
      setTravelState(ui.travelState);
      setShowItineraryPanel(result.showItineraryPanel ?? ui.showItineraryPanel);
      setDraft(tripRecordToDraft(result.trip));
    },
    []
  );

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

  const tripContextLine = buildTripItineraryContextLine(travelState);
  const itineraryStaleHeader =
    Boolean(travelState?.itineraryStale) &&
    !travelState?.locked &&
    (travelState?.itinerary.stops.length ?? 0) > 0;

  const tripHeroTitleChip = tripContextLine ? (
    <TripChatHeader
      variant="chip"
      title={tripContextLine}
      subtitle={buildTripPeriodSubtitle(travelState?.profile)}
      itineraryStale={itineraryStaleHeader}
      onRecalculate={tripId ? () => void handleRecalculateItinerary() : undefined}
      recalculateLoading={recalculateLoading}
      recalculateDisabled={aiLoading || !tripId}
    />
  ) : null;

  const priorChatRecapBody = buildChatHistoryRecap(
    archivedPriorMessages,
    travelState?.profile,
    {
      hasItinerary: (travelState?.itinerary.stops.length ?? 0) > 0,
      itineraryStopCount: travelState?.itinerary.stops.length,
    }
  );
  const priorRecapSlot =
    archivedPriorMessages.length > 0 ? (
      <ChatPriorRecapAccordion
        recapBody={priorChatRecapBody}
        open={priorRecapOpen}
        onToggle={() => setPriorRecapOpen((v) => !v)}
      />
    ) : null;

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
    [tripId, applyRecordToState, applyItineraryActionResult]
  );

  useEffect(
    () => () => {
      if (profilePatchTimer.current) clearTimeout(profilePatchTimer.current);
      if (microFeedbackTimer.current) clearTimeout(microFeedbackTimer.current);
    },
    []
  );

  async function handleSend(text: string) {
    if (aiLoading || !tripId) return;
    stopListening();

    const userMsg: { id: string; role: 'user'; content: string } = {
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
  }

  async function handleResumePending() {
    if (!pendingResumeTrip) return;
    const record = pendingResumeTrip;
    setPendingResumeTrip(null);
    applyRecordToState(record);
    beginFreshChatSession(record);
  }

  async function handleStartNew() {
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
  }

  function handleNewTripFromMenu() {
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
    void fetchLatestInProgressTrip().then(setPendingResumeTrip);
  }

  if (!travelMode) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6 text-center text-amber-200">
        Imposta VITE_USE_LOCAL_API=true per usare il Travel Agent.
      </div>
    );
  }

  const chatHeight = `calc(100dvh - ${APP_STICKY_HEADER_PX}px)`;
  const pendingLabel = pendingResumeTrip ? tripDisplayLabel(pendingResumeTrip) : null;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-900 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <SplashHeader
        onSelectTrip={(trip) => {
          applyRecordToState(trip);
          beginFreshChatSession(trip);
          setPendingResumeTrip(null);
        }}
        onNewTrip={handleNewTripFromMenu}
        activeTripId={tripId}
        travelState={travelState}
        itineraryVersionLoading={recalculateLoading}
        onSelectItineraryVersion={(id, versionId) =>
          void handleMenuItineraryVersion(id, versionId)
        }
        onTripDeleted={(deletedId) => {
          if (tripId === deletedId) handleNewTripFromMenu();
          void fetchLatestInProgressTrip().then(setPendingResumeTrip);
        }}
        costSlot={chatStarted ? <StickyAiCostBadge lastCall={lastCall} totals={totals} /> : undefined}
      />

      {!chatStarted && (
        <NewTripSplashHero
          pendingDestination={pendingLabel}
          onResume={pendingResumeTrip ? () => void handleResumePending() : undefined}
          onStartNew={() => void handleStartNew()}
        />
      )}

      {chatStarted && (
        <div className="relative flex flex-col bg-stone-950" style={{ height: chatHeight }}>
          <div className="relative h-[34dvh] min-h-[160px] max-h-[280px] shrink-0 overflow-hidden">
            <ChatTripBackground destination={travelState?.profile.destination} variant="hero" />
            {tripHeroTitleChip ? (
              <div className="absolute inset-x-0 top-0 z-10 px-3 pt-3 pointer-events-none flex justify-center">
                <div className="pointer-events-auto w-full">{tripHeroTitleChip}</div>
              </div>
            ) : null}
          </div>

          <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full max-w-2xl mx-auto px-0 pt-0 pb-0 bg-stone-950 md:px-3 md:pt-2 md:pb-3">
            {showDayPanels && draft.itinerary?.days?.length ? (
              <div className="space-y-3 overflow-y-auto max-h-[45vh] shrink-0">
                {draft.itinerary.days.map((d) => (
                  <TripDayPanel
                    key={d.day}
                    draft={{ ...draft, currentDay: d.day }}
                    dayNumber={d.day}
                  />
                ))}
              </div>
            ) : null}

            <div className="flex flex-col flex-1 min-h-0 gap-0 md:gap-3">
              <ChatPanel
                mode="trip"
                variant="embedded"
                appearance="overlay"
                messages={messages}
                onSend={(t) => void handleSend(t)}
                loading={aiLoading}
                error={chatError}
                inputPlaceholder={chatInputPlaceholder(travelState?.profile)}
                voiceEnabled
                voiceSupported={voiceSupported}
                voiceListening={voiceListening}
                onVoiceStart={startListening}
                onVoiceStop={stopListening}
                scrollOnInlineSlot={false}
                priorRecapSlot={priorRecapSlot}
                inlineSlot={
                  showTripPlanningUI && travelState ? (
                    <TripPlanningAccordions
                      travelState={travelState}
                      travelPhase={travelPhase}
                      panelMicroFeedback={panelMicroFeedback}
                      profilePatchError={profilePatchError}
                      onProfileChange={handleProfilePanelChange}
                      profileDisabled={aiLoading || !tripId}
                      onConfirmItinerary={() =>
                        void handleSend(
                          "Confermo l'itinerario, procedi con il dettaglio giorno per giorno."
                        )
                      }
                      onRequestReplace={(stopId) => {
                        const name =
                          travelState.itinerary.stops.find((s) => s.id === stopId)?.name ??
                          'questa tappa';
                        void handleSend(
                          `La tappa "${name}" non va bene per me. Proponi alternative (stopId: ${stopId}).`
                        );
                      }}
                      onPickReplacement={(stopId, candidateId) => {
                        setAiLoading(true);
                        sendTravelMessage(tripId!, 'Confermo la sostituzione', {
                          confirmReplacement: { stopId, candidateId },
                        })
                          .then(applyTravelResult)
                          .catch((e) =>
                            setChatError(e instanceof Error ? e.message : AI_ERROR_MESSAGE)
                          )
                          .finally(() => setAiLoading(false));
                      }}
                      onCancelReplacement={() =>
                        setTravelState((s) => (s ? { ...s, pendingReplacement: null } : s))
                      }
                    />
                  ) : null
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
