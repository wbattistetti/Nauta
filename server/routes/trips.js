/** REST routes for trips (Postgres). */
import { randomUUID } from 'crypto';
import { Router } from 'express';
import { pool, rowToTrip } from '../db.js';
import { createInitialTravelState } from '../travel/defaultState.js';

export const tripsRouter = Router();

tripsRouter.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM trips ORDER BY created_at DESC LIMIT 50`
    );
    res.json(rows.map(rowToTrip));
  } catch (e) {
    console.error('GET /api/trips', e);
    res.status(500).json({ error: String(e.message) });
  }
});

tripsRouter.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });
    res.json(rowToTrip(rows[0]));
  } catch (e) {
    console.error('GET /api/trips/:id', e);
    res.status(500).json({ error: String(e.message) });
  }
});

tripsRouter.post('/', async (req, res) => {
  try {
    const id = req.body.id ?? randomUUID();
    const phase = req.body.phase ?? 'F1';
    const step = req.body.step ?? 'intake_dialog';
    const status = req.body.status ?? 'in_progress';
    const draft = req.body.draft ?? {};

    const { rows } = await pool.query(
      `INSERT INTO trips (id, phase, step, status, draft, title)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       RETURNING *`,
      [
        id,
        phase,
        step,
        status,
        JSON.stringify(draft),
        draft.destinationNormalized ?? null,
      ]
    );
    res.status(201).json(rowToTrip(rows[0]));
  } catch (e) {
    console.error('POST /api/trips', e);
    res.status(500).json({ error: String(e.message) });
  }
});

/** Reset trip for a fresh onboarding chat (phase1, no profile facts, no panels). */
tripsRouter.post('/:id/reset-onboarding', async (req, res) => {
  try {
    const travelState = createInitialTravelState();
    const opener = [
      {
        id: randomUUID(),
        role: 'assistant',
        content:
          'Ciao! Dimmi dove vorresti andare, per quanti giorni e in che periodo.',
      },
    ];
    const { rows } = await pool.query(
      `UPDATE trips SET
        phase = 'F1',
        step = 'intake_dialog',
        status = 'in_progress',
        draft = '{}'::jsonb,
        itinerary = NULL,
        travel_state = $2::jsonb,
        itinerary_status = 'draft',
        chat_messages = $3::jsonb,
        destination = NULL,
        destination_raw = NULL,
        destination_normalized = NULL,
        duration_days = NULL,
        duration_raw = NULL,
        period_raw = NULL,
        current_day = NULL,
        title = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [req.params.id, JSON.stringify(travelState), JSON.stringify(opener)]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });
    res.json(rowToTrip(rows[0]));
  } catch (e) {
    console.error('POST /api/trips/:id/reset-onboarding', e);
    res.status(500).json({ error: String(e.message) });
  }
});

tripsRouter.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM trips WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Viaggio non trovato' });
    res.status(204).send();
  } catch (e) {
    console.error('DELETE /api/trips/:id', e);
    res.status(500).json({ error: String(e.message) });
  }
});

tripsRouter.patch('/:id', async (req, res) => {
  try {
    const draft = req.body.draft ?? {};
    const normalized = draft.destinationNormalized ?? null;

    const { rows } = await pool.query(
      `UPDATE trips SET
        phase = COALESCE($2, phase),
        step = COALESCE($3, step),
        status = COALESCE($4, status),
        draft = COALESCE($5::jsonb, draft),
        itinerary = COALESCE($6::jsonb, itinerary),
        chat_messages = COALESCE($7::jsonb, chat_messages),
        destination = $8,
        destination_raw = $9,
        destination_normalized = $10,
        duration_days = $11,
        duration_raw = $12,
        period_raw = $13,
        current_day = $14,
        review_notes = COALESCE($15::jsonb, review_notes),
        bookings = COALESCE($16::jsonb, bookings),
        last_page_analysis = $17,
        title = COALESCE($18, title),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        req.params.id,
        req.body.phase ?? null,
        req.body.step ?? null,
        req.body.status ?? null,
        req.body.draft ? JSON.stringify(draft) : null,
        req.body.itinerary != null ? JSON.stringify(req.body.itinerary) : null,
        req.body.chat_messages != null ? JSON.stringify(req.body.chat_messages) : null,
        normalized,
        draft.destinationRaw ?? null,
        normalized,
        draft.durationDays ?? null,
        draft.durationRaw ?? null,
        draft.periodRaw ?? null,
        draft.currentDay ?? null,
        draft.reviewNotes != null ? JSON.stringify(draft.reviewNotes) : null,
        draft.bookings != null ? JSON.stringify(draft.bookings) : null,
        draft.lastPageAnalysis ?? null,
        normalized,
      ]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Viaggio non trovato' });
    res.json(rowToTrip(rows[0]));
  } catch (e) {
    console.error('PATCH /api/trips/:id', e);
    res.status(500).json({ error: String(e.message) });
  }
});
