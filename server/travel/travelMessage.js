/**
 * Full travel message pipeline: Reasoner → Orchestrator → Planner → Explainer.
 */
import {
  createInitialTravelState,
  migrateDraftToTravelState,
  isReadyForItineraryGeneration,
  isProfileComplete,
  shouldShowItineraryPanel,
  shouldShowPreferencePanels,
} from './defaultState.js';
import { filterClarificationsForPanels } from './clarificationFilter.js';
import { maybeAutoGenerateStops, recalculateItineraryWithHistory } from './autoGenerateStops.js';
import { onItineraryGenerated } from './itineraryHistory.js';
import { applyOrchestrator } from './orchestrator.js';
import { runReasoner } from './reasoner.js';
import { runPlanner } from './planner.js';
import { runExplainer, buildFallbackReply } from './explainer.js';
import { destinationJustSet, followUpAfterDestinationPhotos } from './destinationAck.js';
import { buildTripItineraryFromTravelState } from './logisticsBuilder.js';
import { sanitizeTravelState } from './profileSanitize.js';
import { buildReasonerFallback } from './reasonerFallback.js';

/** @typedef {'draft'|'confirmed'|'logistics_ready'} ItineraryStatus */

/**
 * @param {object} input
 * @param {string} input.tripId
 * @param {string} input.userMessage
 * @param {import('./types.js').TravelState|null} input.travelState
 * @param {Record<string, unknown>} [input.draft]
 * @param {boolean} [input.resuming]
 * @param {{ stopId: string, candidateId: string }} [input.confirmReplacement]
 */
export async function processTravelMessage({
  tripId,
  userMessage,
  travelState,
  draft,
  resuming = false,
  confirmReplacement,
}) {
  try {
    return await processTravelMessageInner({
      tripId,
      userMessage,
      travelState,
      draft,
      resuming,
      confirmReplacement,
    });
  } catch (e) {
    console.error('[travelMessage] pipeline error', e);
    return processTravelMessageDegraded({
      userMessage,
      travelState,
      draft,
      resuming,
      errorMessage: String(e.message),
    });
  }
}

/**
 * @param {object} input
 */
async function processTravelMessageInner({
  tripId,
  userMessage,
  travelState,
  draft,
  resuming = false,
  confirmReplacement,
}) {
  let state =
    travelState && travelState.version === 1
      ? structuredClone(travelState)
      : migrateDraftToTravelState(draft ?? {});

  if (!state.version) state = createInitialTravelState();
  sanitizeTravelState(state);

  const reasoner = await runReasoner(userMessage, state, tripId, { confirmReplacement });

  let plannerResult = null;
  let { state: afterOrch, needsPlanner, plannerTask } = applyOrchestrator(state, reasoner, null);

  const task =
    plannerTask ??
    (reasoner.needsPlanner ? reasoner.plannerTask : null) ??
    (reasoner.actions.some((a) => a.type === 'generate_initial_itinerary')
      ? 'generate_initial'
      : reasoner.actions.some((a) => a.type === 'recalculate_itinerary')
        ? 'recalculate'
        : null);

  if (needsPlanner && task) {
    const stopId =
      reasoner.actions.find((a) => a.type === 'propose_stop_replacement')?.stopId ??
      reasoner.plannerContext?.stopId;
    try {
      if (task === 'recalculate') {
        const { state: next } = await recalculateItineraryWithHistory(afterOrch, tripId);
        afterOrch = next;
      } else {
        plannerResult = await runPlanner(
          task === 'generate_initial'
            ? 'generate_initial'
            : 'replacement_candidates',
          afterOrch,
          { stopId, ...reasoner.plannerContext },
          tripId
        );

        if (task === 'replacement_candidates' && plannerResult.candidates?.length && stopId) {
          const stop = afterOrch.itinerary.stops.find((s) => s.id === stopId);
          afterOrch.pendingReplacement = {
            stopId,
            stopName: stop?.name ?? '',
            candidates: plannerResult.candidates,
          };
        } else if (plannerResult.stops) {
          const applied = applyOrchestrator(afterOrch, reasoner, plannerResult);
          afterOrch = applied.state;
          if (task === 'generate_initial') onItineraryGenerated(afterOrch);
        }
      }
    } catch (e) {
      console.warn('[travelMessage] planner skipped:', e.message);
    }
  }

  const clarifications = filterClarificationsForPanels(
    [...reasoner.clarificationsNeeded],
    afterOrch.profile
  );

  if (
    isReadyForItineraryGeneration(afterOrch.profile) &&
    afterOrch.itinerary.stops.length === 0 &&
    !afterOrch.locked &&
    !plannerResult?.stops?.length
  ) {
    afterOrch = await maybeAutoGenerateStops(afterOrch, tripId);
  }

  const justSetDestination = destinationJustSet(afterOrch, state);

  const { reply, followUpAfterPhotos } = await runExplainer(
    userMessage,
    afterOrch,
    clarifications,
    tripId,
    resuming,
    { destinationJustSet: justSetDestination, previousState: state }
  );

  const tp = afterOrch.travel_phase;
  /** @type {ItineraryStatus} */
  let itineraryStatus = 'draft';
  if (afterOrch.locked && afterOrch.itinerary.days.length) {
    itineraryStatus = 'logistics_ready';
  } else if (afterOrch.itinerary.stops.length && (tp === 'phase2' || tp === 'phase3')) {
    itineraryStatus = tp === 'phase3' ? 'confirmed' : 'draft';
  }

  const legacyItinerary = buildTripItineraryFromTravelState(afterOrch);
  const dbCompat = mapDbCompat(tp, itineraryStatus);

  const showStopsPanel = shouldShowItineraryPanel(afterOrch);

  return {
    reply,
    followUpAfterPhotos: followUpAfterPhotos ?? null,
    travel_state: afterOrch,
    travel_phase: tp,
    itinerary_status: itineraryStatus,
    ...dbCompat,
    legacyItinerary,
    profileComplete: isProfileComplete(afterOrch.profile),
    showItineraryPanel: showStopsPanel,
    showProfilePanels: shouldShowPreferencePanels(afterOrch.profile),
    showDayPanels: tp === 'phase4' && legacyItinerary.days.length > 0,
    pendingReplacement: afterOrch.pendingReplacement,
  };
}

/**
 * Last-resort pipeline: apply heuristic profile patch + safe reply (no throw).
 * @param {object} input
 */
async function processTravelMessageDegraded({
  userMessage,
  travelState,
  draft,
  resuming,
}) {
  let state =
    travelState && travelState.version === 1
      ? structuredClone(travelState)
      : migrateDraftToTravelState(draft ?? {});

  if (!state.version) state = createInitialTravelState();
  sanitizeTravelState(state);

  const reasoner = buildReasonerFallback(userMessage, state);
  const { state: afterOrch } = applyOrchestrator(state, reasoner, null);
  const clarifications = filterClarificationsForPanels(
    [...reasoner.clarificationsNeeded],
    afterOrch.profile
  );

  const justSetDestination = destinationJustSet(afterOrch, state);

  let reply = buildFallbackReply(afterOrch, clarifications, {
    destinationJustSet: justSetDestination,
  });
  let followUpAfterPhotos = followUpAfterDestinationPhotos(afterOrch, justSetDestination);
  try {
    const explained = await runExplainer(userMessage, afterOrch, clarifications, '', resuming, {
      destinationJustSet: justSetDestination,
      previousState: state,
    });
    if (explained?.reply?.trim()) reply = explained.reply.trim();
    if (explained?.followUpAfterPhotos) followUpAfterPhotos = explained.followUpAfterPhotos;
  } catch {
    /* keep buildFallbackReply */
  }

  const tp = afterOrch.travel_phase;
  const legacyItinerary = buildTripItineraryFromTravelState(afterOrch);
  const showStopsPanel = shouldShowItineraryPanel(afterOrch);

  return {
    reply,
    followUpAfterPhotos: followUpAfterPhotos ?? null,
    travel_state: afterOrch,
    travel_phase: tp,
    itinerary_status: 'draft',
    ...mapDbCompat(tp, 'draft'),
    legacyItinerary,
    profileComplete: isProfileComplete(afterOrch.profile),
    showItineraryPanel: showStopsPanel,
    showProfilePanels: shouldShowPreferencePanels(afterOrch.profile),
    showDayPanels: false,
    pendingReplacement: afterOrch.pendingReplacement,
  };
}

/** Minimal DB columns — UI uses travel_phase only. */
function mapDbCompat(travelPhase, itineraryStatus) {
  if (itineraryStatus === 'logistics_ready') return { step: 'F5_render', phase: 'F5' };
  if (travelPhase === 'phase2' || travelPhase === 'phase3') {
    return { step: 'F3_explain', phase: 'F3' };
  }
  if (travelPhase === 'phase4') return { step: 'F5_render', phase: 'F5' };
  return { step: 'intake_dialog', phase: 'F1' };
}
