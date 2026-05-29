/**
 * OpenAI chat completion → JSON + cost logging.
 */
import { logAiCall } from '../services/aiCost/logAiCall.js';

function parseJson(content) {
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

/**
 * @param {object} opts
 * @param {string} opts.system
 * @param {string} opts.user
 * @param {number} [opts.maxTokens]
 * @param {string} opts.purpose
 * @param {string} [opts.tripId]
 */
export async function callOpenAiJson({ system, user, maxTokens = 1200, purpose, tripId }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY non configurata');

  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1';
  const started = Date.now();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  const elapsed = Date.now() - started;
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }

  let data;
  try {
    data = text.trim() ? JSON.parse(text) : null;
  } catch {
    throw new Error(`OpenAI envelope non JSON: ${text.slice(0, 200)}`);
  }
  if (!data) throw new Error('OpenAI risposta vuota');

  const content = data.choices?.[0]?.message?.content ?? '';
  const usage = data.usage ?? {};

  logAiCall({
    providerId: 'openai',
    modelId: model,
    purpose,
    response: data,
    durationMs: elapsed,
    taskId: tripId ?? undefined,
    taskLabel: 'travel-agent',
  });

  return { parsed: parseJson(content), raw: content, model, usage };
}
