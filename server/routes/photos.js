/**
 * Photo API — dynamic hero images for destinations and itinerary stops.
 */
import { Router } from 'express';
import {
  resolveDestinationPhotos,
  resolveStopPhotos,
  resolveTripPhotos,
} from '../travel/photoService.js';

export const photosRouter = Router();

photosRouter.get('/destination', async (req, res) => {
  try {
    const place = String(req.query.place ?? '').trim();
    if (!place) {
      return res.status(400).json({ error: 'Parametro place obbligatorio' });
    }
    const result = await resolveDestinationPhotos(place);
    return res.json(result);
  } catch (e) {
    console.error('[photos/destination]', e);
    return res.status(502).json({ error: 'Ricerca foto non riuscita' });
  }
});

photosRouter.get('/stop', async (req, res) => {
  try {
    const name = String(req.query.name ?? '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Parametro name obbligatorio' });
    }
    const region = String(req.query.region ?? '').trim() || undefined;
    const destination = String(req.query.destination ?? '').trim() || undefined;
    const result = await resolveStopPhotos(name, region, destination);
    return res.json(result);
  } catch (e) {
    console.error('[photos/stop]', e);
    return res.status(502).json({ error: 'Ricerca foto non riuscita' });
  }
});

photosRouter.post('/resolve', async (req, res) => {
  try {
    const destination = String(req.body?.destination ?? '').trim();
    const stops = Array.isArray(req.body?.stops) ? req.body.stops : [];
    const result = await resolveTripPhotos(destination, stops);
    return res.json(result);
  } catch (e) {
    console.error('[photos/resolve]', e);
    return res.status(502).json({ error: 'Ricerca foto non riuscita' });
  }
});
