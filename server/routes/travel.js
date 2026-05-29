/** POST /api/travel/:tripId/message — Travel Agent pipeline. */
import { randomUUID } from 'crypto';
import { Router } from 'express';
import { pool, rowToTrip } from '../db.js';
import { processTravelMessage } from '../travel/travelMessage.js';
import { createInitialTravelState, migrateDraftToTravelState } from '../travel/defaultState.js';
import { sanitizeTravelState } from '../travel/profileSanitize.js';
import { applyProfilePatch } from '../travel/applyProfilePatch.js';
import { annotateStopsCompatibility } from '../travel/stopCompatibility.js';
import {
  isProfileComplete,
  isPanelProfileComplete,
  shouldShowPreferencePanels,
  shouldShowItineraryPanel,
} from '../travel/defaultState.js';
import { maybeAutoGenerateStops, recalculateItineraryWithHistory } from '../travel/itinerarySync.js';
import {
  markItineraryStaleAfterProfileChange,
  restoreItineraryVersion,
  ensureItineraryHistoryFields,
} from '../travel/itineraryHistory.js';

export const travelRouter = Router();

travelRouter.patch('/:tripId/profile', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const patch = req.body.profile ?? req.body;

    const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });

    const row = rows[0];
    let travelState = row.travel_state;
    if (!travelState || Object.keys(travelState).length === 0) {
      travelState = migrateDraftToTravelState(row.draft ?? {});
    }
    if (!travelState.version) travelState = createInitialTravelState();

    applyProfilePatch(travelState, patch);
    ensureItineraryHistoryFields(travelState);
    if (travelState.itinerary.stops.length === 0) {
      travelState = await maybeAutoGenerateStops(travelState, tripId);
    } else {
      markItineraryStaleAfterProfileChange(travelState);
    }

    const draft = {
      ...(row.draft ?? {}),
      destinationNormalized: travelState.profile.destination,
      durationDays: travelState.profile.durationDays,
      periodNormalized: travelState.profile.period,
      style: travelState.profile.style,
      budget: travelState.profile.budget,
      preferenze: travelState.profile.likes?.join(', '),
    };

    const tp = travelState.travel_phase;
    const showStopsPanel = shouldShowItineraryPanel(travelState);
    const showPanels = shouldShowPreferencePanels(travelState.profile);

    const { rows: updated } = await pool.query(
      `UPDATE trips SET travel_state = $2::jsonb, draft = $3::jsonb, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [tripId, JSON.stringify(travelState), JSON.stringify(draft)]
    );

    res.json({
      travel_state: travelState,
      travel_phase: tp,
      profileComplete: isProfileComplete(travelState.profile),
      panelProfileComplete: isPanelProfileComplete(travelState.profile),
      showItineraryPanel: showStopsPanel,
      showProfilePanels: showPanels,
      itineraryStale: Boolean(travelState.itineraryStale),
      trip: rowToTrip(updated[0]),
    });
  } catch (e) {
    console.error('PATCH /api/travel/:tripId/profile', e);
    res.status(500).json({ error: String(e.message) });
  }
});

travelRouter.post('/:tripId/itinerary/recalculate', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });

    const row = rows[0];
    let travelState = row.travel_state;
    if (!travelState?.version) travelState = createInitialTravelState();

    const { state, ok, error } = await recalculateItineraryWithHistory(travelState, tripId);
    if (!ok) {
      return res.status(400).json({ error: error ?? 'Ricalcolo non riuscito' });
    }

    const { rows: updated } = await pool.query(
      `UPDATE trips SET travel_state = $2::jsonb, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [tripId, JSON.stringify(state)]
    );

    res.json({
      travel_state: state,
      showItineraryPanel: shouldShowItineraryPanel(state),
      itineraryStale: false,
      trip: rowToTrip(updated[0]),
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

    const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });

    let travelState = rows[0].travel_state;
    if (!travelState?.version) travelState = createInitialTravelState();
    ensureItineraryHistoryFields(travelState);

    if (!restoreItineraryVersion(travelState, versionId)) {
      return res.status(404).json({ error: 'Versione non trovata' });
    }

    travelState.itinerary.stops = annotateStopsCompatibility(
      travelState.itinerary.stops,
      travelState.profile
    );
    sanitizeTravelState(travelState);

    const { rows: updated } = await pool.query(
      `UPDATE trips SET travel_state = $2::jsonb, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [tripId, JSON.stringify(travelState)]
    );

    res.json({
      travel_state: travelState,
      showItineraryPanel: shouldShowItineraryPanel(travelState),
      itineraryStale: Boolean(travelState.itineraryStale),
      trip: rowToTrip(updated[0]),
    });
  } catch (e) {
    console.error('POST restore', e);
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

    const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });

    const row = rows[0];
    let travelState = row.travel_state;
    if (!travelState || Object.keys(travelState).length === 0) {
      travelState = migrateDraftToTravelState(row.draft ?? {});
    }
    if (!travelState.version) travelState = createInitialTravelState();
    sanitizeTravelState(travelState);

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

    const draft = {
      ...(row.draft ?? {}),
      destinationNormalized: result.travel_state.profile.destination,
      durationDays: result.travel_state.profile.durationDays,
      periodNormalized: result.travel_state.profile.period,
      periodStart: result.travel_state.profile.periodStart,
      periodEnd: result.travel_state.profile.periodEnd,
      style: result.travel_state.profile.style,
      ritmo: result.travel_state.profile.ritmo,
      budget: result.travel_state.profile.budget,
      alloggi: result.travel_state.profile.alloggi,
      preferenze: result.travel_state.profile.preferenze,
      itinerary: result.legacyItinerary?.days?.length ? result.legacyItinerary : null,
      currentDay: result.showDayPanels ? 1 : undefined,
    };

    const { rows: updated } = await pool.query(
      `UPDATE trips SET
        travel_state = $2::jsonb,
        itinerary_status = $3,
        phase = $4,
        step = $5,
        draft = $6::jsonb,
        itinerary = $7::jsonb,
        chat_messages = $8::jsonb,
        destination = $9,
        destination_normalized = $9,
        duration_days = $10,
        period_raw = $11,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        tripId,
        JSON.stringify(result.travel_state),
        result.itinerary_status,
        result.phase,
        result.step,
        JSON.stringify(draft),
        result.legacyItinerary?.days?.length
          ? JSON.stringify(result.legacyItinerary)
          : null,
        JSON.stringify(nextChat),
        result.travel_state.profile.destination ?? null,
        result.travel_state.profile.durationDays ?? null,
        result.travel_state.profile.period ?? null,
      ]
    );

    const trip = rowToTrip(updated[0]);
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
