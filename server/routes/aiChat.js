/** POST /api/ai-chat — OpenAI dialog manager + log costi. */
import { Router } from 'express';
import { buildTripSystemPrompt } from '../prompts.js';
import { logAiCall } from '../services/aiCost/logAiCall.js';

export const aiChatRouter = Router();

const HANDLER_VERSION = 'trip-dialog-manager-openai-v5';
const PROVIDER_ID = 'openai';

function getOpenAiModel() {
  return process.env.OPENAI_MODEL ?? 'gpt-4.1';
}

function parseAiJson(content) {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function hasItinerary(parsed) {
  const itin = parsed?.itinerary ?? parsed?.extracted?.itinerary;
  return Boolean(itin?.days?.length);
}

function buildContext(phase, step, draft, pageContent, intakeContext) {
  const slimDraft = {
    destinationNormalized: draft.destinationNormalized,
    durationNormalized: draft.durationNormalized,
    durationDays: draft.durationDays,
    periodNormalized: draft.periodNormalized,
    periodStart: draft.periodStart,
    periodEnd: draft.periodEnd,
    style: draft.style,
    budget: draft.budget,
    preferenze: draft.preferenze,
  };
  let ctx = `phase: ${phase}\nstep: ${step}\ndraft: ${JSON.stringify(slimDraft)}`;
  if (intakeContext) {
    ctx += `\n\nINTAKE_ORCHESTRATOR:\n${JSON.stringify(intakeContext, null, 2)}`;
  }
  if (pageContent) {
    ctx += `\n\npageContent:\n${String(pageContent).slice(0, 12000)}`;
  }
  return ctx;
}

function intakePurpose(step, intakeMode) {
  if (intakeMode || step === 'intake_dialog') return 'TRIP_INTAKE_DIALOG';
  if (step === 'F3_generate') return 'TRIP_ITINERARY_GENERATE';
  if (step.startsWith('F4')) return 'TRIP_REVIEW';
  if (step.startsWith('F5')) return 'TRIP_DAY_RENDER';
  if (step.startsWith('F6')) return 'TRIP_BOOKINGS';
  if (step.startsWith('F7')) return 'TRIP_PAGE_ANALYSIS';
  return 'TRIP_CHAT';
}

function openAiErrorMessage(status, errText) {
  try {
    const j = JSON.parse(errText);
    const msg = j?.error?.message;
    if (msg) return msg;
  } catch {
    /* raw text */
  }
  if (status === 429) return 'Troppe richieste a OpenAI. Attendi qualche secondo e riprova.';
  if (status === 401) return 'Chiave OpenAI non valida.';
  return `OpenAI (${status}): ${errText.slice(0, 280)}`;
}

aiChatRouter.post('/', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY non configurata in server/.env',
    });
  }

  const model = getOpenAiModel();
  const phase = req.body.phase ?? 'F1';
  const step = req.body.step ?? 'intake_dialog';
  const draft = req.body.draft ?? {};
  const messages = req.body.messages ?? [];
  const pageContent = req.body.pageContent;
  const isItineraryStep = step === 'F3_generate';
  const intakeMode =
    Boolean(req.body.intakeMode) || (step === 'intake_dialog' && !isItineraryStep);
  const intakeContext = req.body.intakeContext;
  const resuming = Boolean(req.body.resuming);
  const generateItinerary = Boolean(req.body.generateItinerary) || isItineraryStep;
  const maxTokens = generateItinerary ? 8192 : intakeMode ? 800 : 500;
  const purpose = intakePurpose(step, intakeMode);
  const tripId = draft.tripId ?? req.body.tripId;

  let systemContext = buildContext(phase, step, draft, pageContent, intakeContext);
  if (resuming) {
    systemContext +=
      '\n\nRESUME_SESSION: L\'utente torna dopo una pausa. Nel reply: breve benvenuto ("Bentornato, eravamo rimasti qui"), NON ripetere dati già noti, fai la prossima domanda su ciò che manca (missing). Max 2 frasi.';
  }

  const chatMessages = [
    { role: 'system', content: buildTripSystemPrompt(phase, step, intakeMode) },
    { role: 'system', content: systemContext },
    ...messages.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  if (resuming) {
    chatMessages.push({
      role: 'user',
      content: 'Riprendiamo il viaggio da dove eravamo rimasti.',
    });
  }

  if (generateItinerary && isItineraryStep) {
    chatMessages.push({
      role: 'user',
      content:
        'Genera l itinerario completo. Rispondi SOLO con JSON valido che include reply (string) e itinerary.days (array).',
    });
  }

  const started = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: isItineraryStep ? 0.4 : intakeMode ? 0.35 : 0.5,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
    });

    const durationMs = Date.now() - started;

    if (!response.ok) {
      const errText = await response.text();
      logAiCall({
        providerId: PROVIDER_ID,
        modelId: model,
        purpose,
        durationMs,
        taskId: tripId,
        error: errText.slice(0, 500),
      });
      return res.status(502).json({
        error: openAiErrorMessage(response.status, errText),
        code: 'openai_http',
      });
    }

    const data = await response.json();
    const callRecord = logAiCall({
      providerId: PROVIDER_ID,
      modelId: model,
      purpose,
      response: data,
      durationMs,
      taskId: tripId,
      taskLabel: step,
    });

    const rawContent = data.choices?.[0]?.message?.content ?? '';
    const finishReason = data.choices?.[0]?.finish_reason;
    const parsed = parseAiJson(rawContent);

    if (!parsed) {
      console.error('[ai-chat] JSON parse failed', { step, finishReason, preview: rawContent.slice(0, 400) });
      return res.status(502).json({
        error:
          finishReason === 'length'
            ? 'Risposta troppo lunga (troncata). Riprova o riduci i giorni del viaggio.'
            : 'Risposta AI non in formato JSON. Riprova.',
        code: 'parse_failed',
      });
    }

    let reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
    const extracted = parsed.extracted ?? {};
    const itinerary = extracted.itinerary ?? parsed.itinerary;

    if (!reply) {
      if (generateItinerary && hasItinerary(parsed)) {
        reply = 'Ecco il tuo itinerario giorno per giorno.';
      } else {
        console.error('[ai-chat] missing reply', { step, keys: Object.keys(parsed) });
        return res.status(502).json({
          error: 'Risposta AI incompleta (manca reply). Riprova.',
          code: 'missing_reply',
        });
      }
    }

    if (generateItinerary && isItineraryStep && !itinerary?.days?.length) {
      return res.status(502).json({
        error: 'Itinerario non generato correttamente. Riprova.',
        code: 'missing_itinerary',
      });
    }

    res.json({
      handler: HANDLER_VERSION,
      model,
      reply,
      intent: parsed.intent ?? 'collect',
      normalized: parsed.normalized ?? {},
      deduced: parsed.deduced ?? {},
      missing: Array.isArray(parsed.missing) ? parsed.missing : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      ambiguities: Array.isArray(parsed.ambiguities) ? parsed.ambiguities : [],
      pendingConfirmation: parsed.pendingConfirmation ?? null,
      intakeComplete: Boolean(parsed.intakeComplete),
      extracted,
      advanceTo: parsed.advanceTo ?? null,
      itinerary: itinerary ?? undefined,
      lastCallCost: {
        costEur: callRecord.costEur,
        costUsd: callRecord.costUsd,
        inputTokens: callRecord.inputTokens,
        outputTokens: callRecord.outputTokens,
        pricingFound: callRecord.pricingFound,
      },
    });
  } catch (e) {
    const durationMs = Date.now() - started;
    logAiCall({
      providerId: PROVIDER_ID,
      modelId: model,
      purpose,
      durationMs,
      taskId: tripId,
      error: String(e.message),
    });
    console.error('ai-chat', e);
    res.status(500).json({ error: String(e.message) });
  }
});
