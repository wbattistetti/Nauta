/**
 * Nauta API — Postgres locale + OpenAI + tracking costi AI.
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkDb } from './db.js';
import { runTravelStateMigration } from './dbMigrations.js';
import { tripsRouter } from './routes/trips.js';
import { aiChatRouter } from './routes/aiChat.js';
import { travelRouter } from './routes/travel.js';
import { aiCostRouter } from './services/aiCost/aiCostRoutes.js';
import { photosRouter } from './routes/photos.js';
import { syncPricingFromOpenRouter } from './services/aiCost/pricingSync.js';
import { getUsdToEur } from './services/aiCost/exchangeRateSync.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    const dbOk = await checkDb();
    res.json({
      ok: true,
      db: dbOk,
      handler: 'nauta-server',
      openai: Boolean(process.env.OPENAI_API_KEY),
      unsplash: Boolean(process.env.UNSPLASH_ACCESS_KEY),
      model: process.env.OPENAI_MODEL ?? 'gpt-4.1',
    });
  } catch (e) {
    res.status(503).json({ ok: false, error: String(e.message) });
  }
});

app.use('/api/trips', tripsRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/travel', travelRouter);
app.use('/api/photos', photosRouter);
app.use('/api/ai-calls', aiCostRouter);

async function bootstrapCostCaches() {
  try {
    await syncPricingFromOpenRouter();
  } catch (e) {
    console.warn('[startup] pricing sync:', e.message);
  }
  try {
    await getUsdToEur();
  } catch (e) {
    console.warn('[startup] exchange rate:', e.message);
  }
}

app.listen(PORT, async () => {
  try {
    await runTravelStateMigration();
  } catch (e) {
    console.warn('[startup] travel_state migration:', e.message);
  }
  console.log(`Nauta API http://localhost:${PORT}`);
  console.log(`  health     GET /api/health`);
  console.log(`  trips      /api/trips`);
  console.log(`  ai-chat    POST /api/ai-chat`);
  console.log(`  travel     POST /api/travel/:tripId/message`);
  console.log(`  photos     GET /api/photos/destination  POST /api/photos/resolve`);
  console.log(`  ai-calls   GET /api/ai-calls`);
  bootstrapCostCaches();
});
