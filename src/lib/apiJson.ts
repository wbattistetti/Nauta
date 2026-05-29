/**
 * Safe JSON parsing for API responses (avoids "Unexpected end of JSON input").
 */
import { apiUrl } from './apiClient';

export async function readApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.ok
        ? 'Risposta vuota dal server. Riprova tra poco.'
        : `Errore server (${res.status}): risposta vuota. Verifica che il backend sia avviato.`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Risposta non valida dal server (${res.status}): ${text.slice(0, 120)}`
    );
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const json = await readApiJson<{ error?: string } & T>(res);
  if (!res.ok) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
  return json;
}
