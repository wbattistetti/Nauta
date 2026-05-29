/**
 * Humanized recap of prior chat for the "Fin qui ci siamo detti…" accordion.
 */
import type { ChatMessage } from '../../types/trip';
import type { UserProfile } from '../../types/travelState';
import { collectIncludedThemeOptions } from './preferenceUi';
import { STYLE_OPTIONS, BUDGET_OPTIONS } from './preferenceOptions';

const TRAVELER_LABELS: Record<string, string> = {
  solo: 'da solo',
  couples: 'in coppia',
  coppia: 'in coppia',
  family: 'in famiglia',
  famiglia: 'in famiglia',
  friends: 'con amici',
  amici: 'con amici',
};

const AGE_BAND_LABELS: Record<string, string> = {
  '18-25': '18–25 anni',
  '25-35': '25–35 anni',
  '35-50': '35–50 anni',
  '50+': 'over 55',
};

function travelerPhrase(profile: UserProfile): string | null {
  const type = profile.travelerType?.toLowerCase();
  const band = profile.ageBand?.toLowerCase();
  if (!type && !band) return null;
  const who = type ? TRAVELER_LABELS[type] ?? type : 'viaggio';
  const age = band ? AGE_BAND_LABELS[band] ?? band : '';
  if (type && age) return `Viaggio ${who}, fascia ${age}.`;
  if (type) return `Viaggio ${who}.`;
  return `Fascia d'età: ${age}.`;
}

function preferencePhrase(profile: UserProfile): string | null {
  const themes = collectIncludedThemeOptions(profile.likes ?? []).map((o) => o.label);
  const styleId = (profile.style ?? profile.ritmo)?.toLowerCase();
  const style = STYLE_OPTIONS.find((o) => o.id === styleId)?.label;
  const budget = BUDGET_OPTIONS.find((o) => o.id === profile.budget?.toLowerCase())?.label;

  const bits: string[] = [];
  if (themes.length > 0) bits.push(`interessi come ${themes.slice(0, 4).join(', ')}`);
  if (style) bits.push(`ritmo ${style.toLowerCase()}`);
  if (budget) bits.push(`budget ${budget.toLowerCase()}`);

  if (bits.length === 0) return null;
  return `Abbiamo parlato di ${bits.join(', ')}.`;
}

/** One-line preview for collapsed accordion. */
export function buildChatHistoryRecapPreview(
  profile: UserProfile | undefined,
  priorMessageCount: number
): string {
  const dest = profile?.destination?.trim();
  if (dest && profile?.durationDays) {
    return `${profile.durationDays} giorni in ${dest} · ${priorMessageCount} messaggi`;
  }
  if (dest) return `Viaggio in ${dest} · ${priorMessageCount} messaggi`;
  return `${priorMessageCount} messaggi nella sessione precedente`;
}

/** Full humanized recap (expanded accordion body). */
export function buildChatHistoryRecap(
  priorMessages: ChatMessage[],
  profile: UserProfile | undefined,
  opts?: { hasItinerary?: boolean; itineraryStopCount?: number }
): string {
  if (priorMessages.length === 0) return 'Nessun messaggio precedente.';

  const paragraphs: string[] = [];
  const p = profile ?? ({} as UserProfile);

  if (p.destination?.trim()) {
    let trip = 'Hai chiesto un viaggio';
    if (p.durationDays && p.durationDays > 0) trip += ` di ${p.durationDays} giorni`;
    trip += ` in ${p.destination.trim()}`;
    if (p.period?.trim()) trip += ` (${p.period.trim()})`;
    trip += '.';
    paragraphs.push(trip);
  }

  const who = travelerPhrase(p);
  if (who) paragraphs.push(who);

  const prefs = preferencePhrase(p);
  if (prefs) paragraphs.push(prefs);

  if (opts?.hasItinerary) {
    const n = opts.itineraryStopCount ?? 0;
    const tappe = n > 0 ? ` con ${n} ${n === 1 ? 'tappa' : 'tappe'}` : '';
    paragraphs.push(
      `Abbiamo costruito una proposta di itinerario${tappe} e le preferenze nei pannelli sotto la chat.`
    );
  }

  const userTurns = priorMessages.filter((m) => m.role === 'user').length;
  if (userTurns > 0) {
    paragraphs.push(
      `Nella chat precedente hai scritto ${userTurns} ${userTurns === 1 ? 'messaggio' : 'messaggi'}: puoi riaprire questo riepilogo quando vuoi, senza rileggere tutto il filo.`
    );
  }

  return paragraphs.join('\n\n');
}

/** Session messages = server chat minus archived prefix (stable order). */
export function sliceSessionChatMessages(
  fullChat: ChatMessage[],
  archivedCount: number
): ChatMessage[] {
  if (archivedCount <= 0) return fullChat;
  if (fullChat.length <= archivedCount) return [];
  return fullChat.slice(archivedCount);
}
