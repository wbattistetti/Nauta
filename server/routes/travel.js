/** POST /api/travel/:tripId/message — Travel Agent pipeline. */
import { randomUUID } from 'crypto';
import { Router } from 'express';
import { processTravelMessage } from '../travel/travelMessage.js';
import { applyProfilePatch } from '../travel/applyProfilePatch.js';
import { annotateStopsCompatibility } from '../travel/stopCompatibility.js';
import { maybeAutoGenerateStops, recalculateItineraryWithHistory } from '../travel/itinerarySync.js';
import {
  markItineraryStaleAfterProfileChange,
  restoreItineraryVersion,
  ensureItineraryHistoryFields,
} from '../travel/itineraryHistory.js';
import { reopenItinerary } from '../travel/reopenItinerary.js';
import { shouldShowItineraryPanel } from '../travel/defaultState.js';
import { sanitizeTravelState } from '../travel/profileSanitize.js';
import {
  loadTravelState,
  saveTravelState,
  buildTravelUiFlags,
} from '../travel/TravelTripRepository.js';

export const travelRouter = Router();

travelRouter.patch('/:tripId/profile', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const patch = req.body.profile ?? req.body;

    const { row, travelState: initialState } = await loadTravelState(tripId);
    if (!row) return res.status(404).json({ error: 'Viaggio non trovato' });

    const travelState = initialState;
    applyProfilePatch(travelState, patch);
    ensureItineraryHistoryFields(travelState);
    if (travelState.itinerary.stops.length === 0) {
      await maybeAutoGenerateStops(travelState, tripId);
    } else {
      markItineraryStaleAfterProfileChange(travelState);
    }

    const trip = await saveTravelState(tripId, travelState, {
      destination: travelState.profile.destination ?? null,
      duration_days: travelState.profile.durationDays ?? null,
      period_raw: travelState.profile.period ?? null,
    });

    res.json({
      travel_state: travelState,
      ...buildTravelUiFlags(travelState),
      trip,
    });
  } catch (e) {
    console.error('PATCH /api/travel/:tripId/profile', e);
    res.status(500).json({ error: String(e.message) });
  }
});

travelRouter.post('/:tripId/itinerary/recalculate', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const { row, travelState: initialState } = await loadTravelState(tripId);
    if (!row) return res.status(404).json({ error: 'Viaggio non trovato' });

    const { state, ok, error } = await recalculateItineraryWithHistory(initialState, tripId);
    if (!ok) {
      return res.status(400).json({ error: error ?? 'Ricalcolo non riuscito' });
    }

    const trip = await saveTravelState(tripId, state);

    res.json({
      travel_state: state,
      showItineraryPanel: shouldShowItineraryPanel(state),
      itineraryStale: false,
      trip,
    });
  } catch (e) {
    console.error('POST recalculate', e);
    res.status(500).json({ error: String(e.message) });
  }
});

travelRouter.post('/:tripId/itinerary/restore', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const versionId = String(req.body.versionId ?? '').trim();
    if (!versionId) return res.status(400).json({ error: 'versionId richiesto' });

    const { row, travelState } = await loadTravelState(tripId);
    if (!row) return res.status(404).json({ error: 'Viaggio non trovato' });

    ensureItineraryHistoryFields(travelState);

    if (!restoreItineraryVersion(travelState, versionId)) {
      return res.status(404).json({ error: 'Versione non trovata' });
    }

    travelState.itinerary.stops = annotateStopsCompatibility(
      travelState.itinerary.stops,
      travelState.profile
    );
    sanitizeTravelState(travelState);

    const trip = await saveTravelState(tripId, travelState);

    res.json({
      travel_state: travelState,
      showItineraryPanel: shouldShowItineraryPanel(travelState),
      itineraryStale: Boolean(travelState.itineraryStale),
      trip,
    });
  } catch (e) {
    console.error('POST restore', e);
    res.status(500).json({ error: String(e.message) });
  }
});

travelRouter.post('/:tripId/itinerary/reopen', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const { row, travelState } = await loadTravelState(tripId);
    if (!row) return res.status(404).json({ error: 'Viaggio non trovato' });

    reopenItinerary(travelState);
    sanitizeTravelState(travelState);

    const trip = await saveTravelState(tripId, travelState, {
      itinerary: null,
      itinerary_status: 'draft',
      current_day: null,
    });

    res.json({
      travel_state: travelState,
      showItineraryPanel: shouldShowItineraryPanel(travelState),
      showDayPanels: false,
      trip,
    });
  } catch (e) {
    console.error('POST reopen', e);
    res.status(500).json({ error: String(e.message) });
  }
});

travelRouter.post('/:tripId/message', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const userMessage = String(req.body.message ?? req.body.text ?? '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'message richiesto' });
    }

    const { row, travelState } = await loadTravelState(tripId);
    if (!row) return res.status(404).json({ error: 'Viaggio non trovato' });

    const confirmReplacement = req.body.confirmReplacement;
    const result = await processTravelMessage({
      tripId,
      userMessage: userMessage || 'Confermo sostituzione tappa',
      travelState,
      draft: row.draft ?? {},
      resuming: Boolean(req.body.resuming),
      confirmReplacement:
        confirmReplacement?.stopId && confirmReplacement?.candidateId
          ? {
              stopId: String(confirmReplacement.stopId),
              candidateId: String(confirmReplacement.candidateId),
            }
          : undefined,
    });

    const chatMessages = row.chat_messages ?? [];
    const userEntry = {
      id: randomUUID(),
      role: 'user',
      content: userMessage,
    };
    const assistantEntry = {
      id: randomUUID(),
      role: 'assistant',
      content: result.reply,
    };
    const nextChat = [...chatMessages, userEntry, assistantEntry].slice(-40);

    const trip = await saveTravelState(tripId, result.travel_state, {
      itinerary_status: result.itinerary_status,
      phase: result.phase,
      step: result.step,
      itinerary: result.legacyItinerary?.days?.length ? result.legacyItinerary : null,
      chat_messages: nextChat,
      destination: result.travel_state.profile.destination ?? null,
      duration_days: result.travel_state.profile.durationDays ?? null,
      period_raw: result.travel_state.profile.period ?? null,
      current_day: result.showDayPanels ? 1 : null,
    });

    res.json({
      ...result,
      chat_messages: trip.chat_messages,
      trip,
    });
  } catch (e) {
    console.error('POST /api/travel/:tripId/message', e);
    if (!res.headersSent) {
      res.status(502).json({
        error: String(e.message),
        code: 'TRAVEL_MESSAGE_FAILED',
      });
    }
  }
});
