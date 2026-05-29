import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { buildTripSystemPrompt } from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey, x-client-info",
};

const MODEL_TRIP = "llama-3.1-8b-instant";
const HANDLER_VERSION = "trip-only-v2";

function parseAiJson(content: string): Record<string, unknown> | null {
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

function buildContext(
  phase: string,
  step: string,
  draft: Record<string, unknown>,
  pageContent?: string
): string {
  let ctx = `Stato:\n- phase: ${phase}\n- step: ${step}\n- draft: ${JSON.stringify(draft)}`;
  if (pageContent) {
    ctx += `\n\nContenuto pagina fornito dall'utente:\n${pageContent.slice(0, 12000)}`;
  }
  return ctx;
}

async function groqChat(
  messages: { role: string; content: string }[],
  opts: { max_tokens: number; temperature: number; json?: boolean }
): Promise<Response> {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_TRIP,
      messages,
      temperature: opts.temperature,
      max_tokens: opts.max_tokens,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
}

async function handleTrip(body: Record<string, unknown>): Promise<Response> {
  const phase = (body.phase as string) ?? "F1";
  const step = (body.step as string) ?? "F1_destination";
  const draft = (body.draft ?? {}) as Record<string, unknown>;
  const messages = (body.messages ?? []) as { role: string; content: string }[];
  const pageContent = body.pageContent as string | undefined;
  const generateItinerary = Boolean(body.generateItinerary) || step === "F3_generate";

  const maxTokens = generateItinerary ? 4096 : 200;

  const groqMessages = [
    { role: "system", content: buildTripSystemPrompt(phase, step) },
    { role: "system", content: buildContext(phase, step, draft, pageContent) },
    ...messages.slice(-8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  if (generateItinerary && step === "F3_generate") {
    groqMessages.push({
      role: "user",
      content:
        "Genera ora l'itinerario completo in JSON nel campo extracted.itinerary. Usa il draft fornito.",
    });
  }

  const response = await groqChat(groqMessages, {
    max_tokens: maxTokens,
    temperature: 0.4,
    json: true,
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: `Groq API error: ${err}` }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseAiJson(rawContent);

  if (!parsed || typeof parsed.reply !== "string") {
    return new Response(JSON.stringify({ error: "Risposta AI non valida. Riprova." }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const extracted = (parsed.extracted ?? {}) as Record<string, unknown>;
  const itinerary = extracted.itinerary ?? parsed.itinerary;

  return new Response(
    JSON.stringify({
      handler: HANDLER_VERSION,
      reply: parsed.reply,
      extracted,
      advanceTo: parsed.advanceTo ?? null,
      itinerary: itinerary ?? undefined,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/** Legacy F1 — maps to trip mode. */
async function handleOnboardingLegacy(body: Record<string, unknown>): Promise<Response> {
  const legacyStep = body.currentStep as string;
  const stepMap: Record<string, string> = {
    destination: "F1_destination",
    duration: "F1_duration",
    period: "F1_period",
    complete: "F1_complete",
  };
  return handleTrip({
    ...body,
    mode: "trip",
    phase: "F1",
    step: stepMap[legacyStep] ?? "F1_destination",
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!Deno.env.get("GROQ_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY non configurata." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const mode = body.mode as string | undefined;

    if (mode === "trip" || mode === "onboarding") {
      if (mode === "onboarding") {
        return await handleOnboardingLegacy(body);
      }
      return await handleTrip(body);
    }

    return new Response(
      JSON.stringify({
        error: 'Richiede mode: "trip". Handler Alaska rimosso.',
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
