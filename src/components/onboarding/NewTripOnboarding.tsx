import { useState, useCallback, useEffect, useRef } from 'react';
import { useTravelAgent } from '../../lib/travel/travelApi';
import { useTravelSession } from '../../features/travel/session/useTravelSession';
import TripActiveSession from '../../features/travel/session/TripActiveSession';
import { fetchLatestInProgressTrip, tripDisplayLabel } from '../../lib/tripService';
import { useAiCallCosts } from '../../hooks/useAiCallCosts';
import { useSpeechInput } from '../../hooks/useSpeechInput';
import { useHeroPhotos } from '../../lib/travel/hero/useHeroPhotos';
import { APP_STICKY_HEADER_PX } from '../../lib/layout';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import SplashHeader from '../splash/SplashHeader';
import NewTripSplashHero from './NewTripLanding';
import StickyAiCostBadge from '../chat/StickyAiCostBadge';

/** Splash + Travel Agent (travel_phase). Postgres only. */
export default function NewTripOnboarding() {
  const travelMode = useTravelAgent();
  const [heroCtx, setHeroCtx] = useState<ExplorerHeroContext>({
    mode: 'trip',
    stop: null,
  });
  const [navPaused, setNavPaused] = useState(false);

  const session = useTravelSession();
  const { lastCall, totals, refresh: refreshAiCosts } = useAiCallCosts(session.chatStarted);

  useEffect(() => {
    if (session.assistantReadySignal > 0) {
      void refreshAiCosts();
    }
  }, [session.assistantReadySignal, refreshAiCosts]);

  const { supported: voiceSupported, listening: voiceListening, startListening, stopListening } =
    useSpeechInput({
      onTranscript: (text) => {
        void session.handleSend(text, stopListening);
      },
      autoListenAfterReply: true,
      assistantReadySignal: session.assistantReadySignal,
      disabled: session.aiLoading,
    });

  const stopFocus = heroCtx.mode === 'stop' && heroCtx.stop;
  const prevStopIdRef = useRef<string | null>(null);

  useEffect(() => {
    setHeroCtx({ mode: 'trip', stop: null });
    setNavPaused(false);
    prevStopIdRef.current = null;
  }, [session.tripId]);

  const {
    photos,
    photoIndex,
    setPhotoIndex,
    currentPhoto,
    markPhotoBroken,
    stopSets,
    poolKey: heroPoolKey,
  } = useHeroPhotos({
    destination: session.travelState?.profile.destination,
    stops: session.travelState?.itinerary.stops ?? [],
    stopFocus: Boolean(stopFocus),
    stopName: heroCtx.stop?.name,
    stopRegion: heroCtx.stop?.region,
    enabled: session.chatStarted,
    navPaused,
    onDestinationPhotosReady: session.handleDestinationPhotosReady,
  });

  const handleHeroContextChange = useCallback(
    (ctx: ExplorerHeroContext) => {
      setHeroCtx(ctx);
      if (ctx.mode === 'stop' && ctx.stop) {
        setPhotoIndex(0);
      }
      setNavPaused(false);
    },
    [setPhotoIndex]
  );

  useEffect(() => {
    const stopId = heroCtx.stop?.id ?? null;
    if (heroCtx.mode === 'stop' && stopId && stopId !== prevStopIdRef.current) {
      setPhotoIndex(0);
      prevStopIdRef.current = stopId;
    }
    if (heroCtx.mode === 'trip') {
      prevStopIdRef.current = null;
    }
  }, [heroCtx.mode, heroCtx.stop?.id, setPhotoIndex]);

  const handleStopPhotoPreview = useCallback(
    (stop: NonNullable<ExplorerHeroContext['stop']>) => {
      handleHeroContextChange({ mode: 'stop', stop });
    },
    [handleHeroContextChange]
  );

  if (!travelMode) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6 text-center text-amber-200">
        Imposta VITE_USE_LOCAL_API=true per usare il Travel Agent.
      </div>
    );
  }

  const chatHeight = `calc(100dvh - ${APP_STICKY_HEADER_PX}px)`;
  const pendingLabel = session.pendingResumeTrip
    ? tripDisplayLabel(session.pendingResumeTrip)
    : null;

  if (!session.hydrated) {
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
          session.applyRecordToState(trip);
          session.beginFreshChatSession(trip);
          session.setPendingResumeTrip(null);
        }}
        onNewTrip={session.handleNewTripFromMenu}
        activeTripId={session.tripId}
        travelState={session.travelState}
        itineraryVersionLoading={session.recalculateLoading}
        onSelectItineraryVersion={(id, versionId) =>
          void session.handleMenuItineraryVersion(id, versionId)
        }
        onTripDeleted={(deletedId) => {
          if (session.tripId === deletedId) session.handleNewTripFromMenu();
          void fetchLatestInProgressTrip().then(session.setPendingResumeTrip);
        }}
        costSlot={
          session.chatStarted ? (
            <StickyAiCostBadge lastCall={lastCall} totals={totals} />
          ) : undefined
        }
      />

      {!session.chatStarted && (
        <NewTripSplashHero
          pendingDestination={pendingLabel}
          onResume={session.pendingResumeTrip ? () => void session.handleResumePending() : undefined}
          onStartNew={() => void session.handleStartNew()}
        />
      )}

      {session.chatStarted && (
        <TripActiveSession
          session={session}
          chatHeight={chatHeight}
          voiceSupported={voiceSupported}
          voiceListening={voiceListening}
          onVoiceStart={startListening}
          onVoiceStop={stopListening}
          heroCtx={heroCtx}
          onHeroContextChange={handleHeroContextChange}
          carouselPhotos={photos}
          photoIndex={photoIndex}
          onPhotoIndexChange={setPhotoIndex}
          onPhotoError={markPhotoBroken}
          onNavPauseChange={setNavPaused}
          currentHeroPhoto={currentPhoto ?? undefined}
          stopSets={stopSets}
          heroPoolKey={heroPoolKey}
          onStopPhotoPreview={handleStopPhotoPreview}
        />
      )}
    </div>
  );
}
