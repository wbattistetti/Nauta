/**
 * Active trip chat + planning column (hero, chat panel, planning shell).
 */
import { useCallback, useEffect, useState } from 'react';
import ChatPanel from '../../../components/chat/ChatPanel';
import ChatPriorRecapAccordion from '../../../components/chat/ChatPriorRecapAccordion';
import ChatDateRangePicker from '../../../components/chat/ChatDateRangePicker';
import ChatTripBackground from '../../../components/onboarding/ChatTripBackground';
import TripDayPanel from '../../../components/trip/TripDayPanel';
import TripPlanningShell, { type ChatScope } from '../../../components/travel/TripPlanningShell';
import TripChatHeader from '../../../components/travel/TripChatHeader';
import type { ItineraryFeedback } from '../../../components/travel/ItineraryFeedbackIcons';
import { chatInputPlaceholder, shouldShowTripPlanningUI } from '../../../lib/travel/travelUi';
import { buildChatHistoryRecap } from '../../../lib/travel/chatHistoryRecap';
import { buildTripPeriodSubtitle } from '../../../lib/travel/planningSummary';
import { buildTripItineraryContextLine } from '../../../lib/travel/itineraryVersionMenu';
import { ITINERARY_REOPEN_LABEL } from '../../../lib/travel/itineraryCopy';
import { needsPeriodSelection } from '../../../lib/travel/periodFormat';
import {
  isPlanningChipTutorAcknowledged,
  markPlanningChipTutorAcknowledged,
} from '../../../lib/travel/planningTutorStorage';
import {
  buildStopFocusChipSubtitle,
  buildHeroPhotoCaption,
  buildDestinationPhotoCaption,
  sanitizeStopPhotoCaption,
  type ExplorerHeroContext,
} from '../../../lib/travel/heroTitle';
import type { TravelPhoto } from '../../../lib/travel/travelPhoto';
import type { UseTravelSessionResult } from './useTravelSession';
import type { TravelStop, TravelState } from '../../../types/travelState';

type TripActiveSessionProps = {
  session: UseTravelSessionResult;
  chatHeight: string;
  voiceSupported: boolean;
  voiceListening: boolean;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  heroCtx: ExplorerHeroContext;
  onHeroContextChange: (ctx: ExplorerHeroContext) => void;
  carouselPhotos: TravelPhoto[];
  photoIndex: number;
  onPhotoIndexChange: (index: number) => void;
  onPhotoError: (photoId: string) => void;
  onNavPauseChange: (paused: boolean) => void;
  currentHeroPhoto: TravelPhoto | undefined;
  stopSets?: Record<string, TravelPhoto[]>;
  heroPoolKey?: string;
  onStopPhotoPreview?: (stop: TravelStop) => void;
};

export default function TripActiveSession({
  session,
  chatHeight,
  voiceSupported,
  voiceListening,
  onVoiceStart,
  onVoiceStop,
  heroCtx,
  onHeroContextChange,
  carouselPhotos,
  photoIndex,
  onPhotoIndexChange,
  onPhotoError,
  onNavPauseChange,
  currentHeroPhoto,
  stopSets,
  heroPoolKey,
  onStopPhotoPreview,
}: TripActiveSessionProps) {
  const {
    messages,
    draft,
    tripId,
    aiLoading,
    chatError,
    travelState,
    showDayPanels,
    profilePatchError,
    panelMicroFeedback,
    recalculateLoading,
    archivedPriorMessages,
    priorRecapOpen,
    setPriorRecapOpen,
    travelPhase,
    handleProfilePanelChange,
    handleReopenItinerary,
    handleRecalculateItinerary,
    handleSend,
    handlePickReplacement,
    setTravelState,
  } = session;

  const showTripPlanningUI = Boolean(
    travelState && shouldShowTripPlanningUI(travelState)
  );
  const hasStops = (travelState?.itinerary.stops.length ?? 0) > 0;

  const [itineraryMode, setItineraryMode] = useState(false);
  const [itinerarySidebarOpen, setItinerarySidebarOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [chatScope, setChatScope] = useState<ChatScope | null>(null);
  const [chipTutorAcknowledged, setChipTutorAcknowledged] = useState(isPlanningChipTutorAcknowledged);
  const [chipTutorExpanded, setChipTutorExpanded] = useState(false);
  const [itineraryFeedback, setItineraryFeedback] = useState<ItineraryFeedback>('none');
  const [preferencesEditMode, setPreferencesEditMode] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  useEffect(() => {
    if (!itineraryMode) {
      setChatSheetOpen(false);
      setChatScope(null);
      setItinerarySidebarOpen(false);
    }
  }, [itineraryMode]);

  useEffect(() => {
    if (!heroCtx.stop) setChatScope(null);
  }, [heroCtx.stop?.id, heroCtx.stop]);

  const openItineraryView = useCallback(() => {
    if (!hasStops) return;
    setPreferencesOpen(false);
    setItineraryMode(true);
    setItinerarySidebarOpen(true);
  }, [hasStops]);

  const openPreferencesView = useCallback(() => {
    setPreferencesOpen(true);
  }, []);

  const handleEye = useCallback(() => {
    if (!hasStops) return;
    setPreferencesOpen(false);
    if (!itineraryMode) {
      setItineraryMode(true);
      setItinerarySidebarOpen(true);
      return;
    }
    if (itinerarySidebarOpen) {
      setItineraryMode(false);
      return;
    }
    setItinerarySidebarOpen(true);
  }, [hasStops, itineraryMode, itinerarySidebarOpen]);

  const handlePuzzle = useCallback(() => {
    setPreferencesOpen((v) => !v);
  }, []);

  const handleChipTutorDismiss = useCallback(() => {
    markPlanningChipTutorAcknowledged();
    setChipTutorAcknowledged(true);
    setChipTutorExpanded(false);
  }, []);

  const handleChipTutorExpand = useCallback(() => {
    setChipTutorExpanded(true);
  }, []);

  const handleItineraryFeedbackChange = useCallback((value: ItineraryFeedback) => {
    setItineraryFeedback(value);
    if (value === 'liked') setPreferencesOpen(false);
    if (value === 'disliked') {
      setPreferencesOpen(true);
      setItineraryMode(false);
    }
  }, []);

  const handlePreferencesEditModeChange = useCallback((edit: boolean) => {
    setPreferencesEditMode(edit);
    if (edit) setPreferencesOpen(true);
  }, []);

  const handleProceedItinerary = useCallback(() => {
    setItineraryMode(false);
    void handleSend("Confermo l'itinerario, procedi con il dettaglio giorno per giorno.", onVoiceStop);
  }, [handleSend, onVoiceStop]);

  const activeDayNumber = draft.currentDay ?? draft.itinerary?.days?.[0]?.day ?? 1;

  const dayPanelSlot =
    showDayPanels && (draft.itinerary?.days?.length ?? 0) > 0 ? (
      <div className="space-y-2">
        <div className="flex items-center justify-end px-1">
          <button
            type="button"
            onClick={() => void handleReopenItinerary()}
            disabled={recalculateLoading || aiLoading || !tripId}
            className="text-xs font-medium text-amber-400/90 hover:text-amber-200 underline underline-offset-2 decoration-amber-600/50 disabled:opacity-50"
          >
            {ITINERARY_REOPEN_LABEL}
          </button>
        </div>
        <TripDayPanel embedded draft={draft} dayNumber={activeDayNumber} />
      </div>
    ) : null;

  const showDatePicker = Boolean(travelState && needsPeriodSelection(travelState.profile));

  const tripContextLine = buildTripItineraryContextLine(travelState);
  const stopFocus = heroCtx.mode === 'stop' && heroCtx.stop;

  const itineraryStaleHeader =
    Boolean(travelState?.itineraryStale) &&
    !travelState?.locked &&
    (travelState?.itinerary.stops.length ?? 0) > 0;

  const chipTitle = tripContextLine;

  const chipSubtitle = buildTripPeriodSubtitle(travelState?.profile);

  const stopPhotoCaption =
    stopFocus && heroCtx.stop
      ? sanitizeStopPhotoCaption(currentHeroPhoto ?? null, heroCtx.stop.name)
      : null;

  const chipStopSubtitle =
    stopFocus && heroCtx.stop && stopPhotoCaption
      ? buildStopFocusChipSubtitle(heroCtx.stop.name, stopPhotoCaption)
      : null;

  const heroPhotoCaption = currentHeroPhoto
    ? stopFocus && heroCtx.stop
      ? buildHeroPhotoCaption(heroCtx.stop.name, stopPhotoCaption ?? 'in evidenza')
      : buildDestinationPhotoCaption(travelState?.profile.destination, currentHeroPhoto.alt)
    : null;

  const tripHeroTitleChip = chipTitle ? (
    <TripChatHeader
      variant="chip"
      title={chipTitle}
      subtitle={chipSubtitle}
      stopSubtitle={chipStopSubtitle}
      itineraryStale={itineraryStaleHeader}
      onRecalculate={tripId ? () => void handleRecalculateItinerary() : undefined}
      recalculateLoading={recalculateLoading}
      recalculateDisabled={aiLoading || !tripId}
      planningActions={
        showTripPlanningUI
          ? {
              itineraryActive: itineraryMode,
              preferencesActive: preferencesOpen,
              itineraryDisabled: !hasStops,
              onItinerary: handleEye,
              onPreferences: handlePuzzle,
            }
          : null
      }
      showChipTutor={showTripPlanningUI && !chipTutorAcknowledged}
      chipTutorExpanded={chipTutorExpanded}
      onChipTutorExpand={handleChipTutorExpand}
      onChipTutorDismiss={handleChipTutorDismiss}
      chipTutorHasStops={hasStops}
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

  const chatInlineSlot =
    dayPanelSlot ??
    (showDatePicker && travelState ? (
      <ChatDateRangePicker
        durationDays={travelState.profile.durationDays}
        disabled={aiLoading || !tripId}
        onConfirm={(payload) => {
          void session.handlePeriodConfirm(payload);
        }}
      />
    ) : null);

  const chatProposalActions =
    showTripPlanningUI && hasStops
      ? {
          onOpenItinerary: openItineraryView,
          onOpenPreferences: openPreferencesView,
          itineraryDisabled: !hasStops,
        }
      : undefined;

  const chatSlot = (
    <ChatPanel
      mode="trip"
      variant="embedded"
      appearance="overlay"
      messages={messages}
      onSend={(t) => void handleSend(t, onVoiceStop)}
      loading={aiLoading}
      error={chatError}
      inputPlaceholder={chatInputPlaceholder(travelState?.profile)}
      voiceEnabled
      voiceSupported={voiceSupported}
      voiceListening={voiceListening}
      onVoiceStart={onVoiceStart}
      onVoiceStop={onVoiceStop}
      scrollOnInlineSlot={false}
      priorRecapSlot={priorRecapSlot}
      inlineSlot={null}
      itineraryProposalActions={chatProposalActions}
    />
  );

  const planningBody =
    showTripPlanningUI && travelState ? (
      <TripPlanningShell
        travelState={travelState}
        travelPhase={travelPhase}
        panelMicroFeedback={panelMicroFeedback}
        profilePatchError={profilePatchError}
        onProfileChange={handleProfilePanelChange}
        profileDisabled={aiLoading || !tripId}
        onConfirmItinerary={handleProceedItinerary}
        onRequestReplace={(stopId) => {
          const name =
            travelState.itinerary.stops.find((s: TravelStop) => s.id === stopId)?.name ??
            'questa tappa';
          void handleSend(
            `La tappa "${name}" non va bene per me. Proponi alternative (stopId: ${stopId}).`,
            onVoiceStop
          );
        }}
        onPickReplacement={handlePickReplacement}
        onCancelReplacement={() =>
          setTravelState((s: TravelState | null) => (s ? { ...s, pendingReplacement: null } : s))
        }
        onHeroContextChange={onHeroContextChange}
        onStopPhotoPreview={onStopPhotoPreview}
        stopSets={stopSets}
        chatInlineSlot={chatInlineSlot}
        chatSlot={chatSlot}
        messages={messages}
        onSend={(t) => void handleSend(t, onVoiceStop)}
        chatLoading={aiLoading}
        chatError={chatError}
        chatInputPlaceholder={chatInputPlaceholder(travelState.profile)}
        focusedStop={heroCtx.stop}
        itineraryMode={itineraryMode}
        preferencesOpen={preferencesOpen}
        chatSheetOpen={chatSheetOpen}
        chatScope={chatScope}
        onChatSheetOpenChange={setChatSheetOpen}
        onChatScopeChange={setChatScope}
        itineraryFeedback={itineraryFeedback}
        onItineraryFeedbackChange={handleItineraryFeedbackChange}
        preferencesEditMode={preferencesEditMode}
        onPreferencesEditModeChange={handlePreferencesEditModeChange}
        revisionNote={revisionNote}
        onRevisionNoteChange={setRevisionNote}
        onProceedItinerary={handleProceedItinerary}
        itinerarySidebarOpen={itinerarySidebarOpen}
        onItinerarySidebarOpenChange={setItinerarySidebarOpen}
      />
    ) : (
      <>
        {chatSlot}
        {chatInlineSlot}
      </>
    );

  return (
    <div className="relative flex flex-col bg-stone-950" style={{ height: chatHeight }}>
      <div className="relative h-[34dvh] min-h-[160px] max-h-[280px] shrink-0 overflow-hidden">
        <ChatTripBackground
          key={heroPoolKey ?? 'trip'}
          photos={carouselPhotos}
          stopFocus={Boolean(stopFocus)}
          photoIndex={photoIndex}
          onPhotoIndexChange={onPhotoIndexChange}
          onPhotoError={onPhotoError}
          onNavPauseChange={onNavPauseChange}
          interactive={Boolean(stopFocus)}
        />
        {tripHeroTitleChip ? (
          <div className="absolute inset-x-0 top-0 z-10 px-3 pt-3 pointer-events-none flex justify-center">
            <div className="pointer-events-auto w-full max-w-[min(100%,28rem)] mx-auto">
              {tripHeroTitleChip}
            </div>
          </div>
        ) : null}
        {heroPhotoCaption ? (
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 pointer-events-none">
            <p className="text-xs font-medium text-amber-100/95 drop-shadow-md line-clamp-2">
              {heroPhotoCaption}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-0 w-full max-w-2xl mx-auto px-0 pt-0 pb-0 bg-stone-950 md:px-3 md:pt-2 md:pb-3">
        {planningBody}
      </div>
    </div>
  );
}
