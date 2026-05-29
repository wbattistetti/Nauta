/**
 * Base URL for Nauta API (Postgres + Groq). Empty = same origin (Vite proxy → /api).
 */
export function apiBase(): string {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  return url?.replace(/\/$/, '') ?? '';
}

export function apiUrl(path: string): string {
  const base = apiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

/** When true, trips and AI use local API instead of Supabase. */
export function useLocalApi(): boolean {
  return import.meta.env.VITE_USE_LOCAL_API === 'true';
}
