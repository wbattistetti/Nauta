/**
 * Travel facts recap + next chat question after calendar period confirm.
 */
import type { UserProfile } from './types.js';
import { isTravelFactsComplete } from './profileGates.js';

export const TRAVELER_TYPE_QUESTION =
  'Viaggi da solo, in coppia, in famiglia o con amici?';

export const AGE_BAND_QUESTION =
  'Quale fascia d\'età ti rappresenta? (es. 18–25, 25–35, 35–50, 50+)';

/** Short recap once destination, days, and period are known. */
export function buildTravelFactsRecapPrefix(profile: UserProfile | null | undefined): string {
  if (!profile) return '';
  const dest = profile.destination?.trim();
  const days = profile.durationDays;
  const period = profile.period?.trim();
  const hasPeriod = Boolean(period || (profile.periodStart && profile.periodEnd));
  if (!dest || !days || days <= 0 || !hasPeriod) return '';
  const periodLabel =
    period ||
    (profile.periodStart && profile.periodEnd
      ? `${profile.periodStart} – ${profile.periodEnd}`
      : '');
  return `Ok, allora: ${days} giorni, ${periodLabel}, per ${dest}.`;
}

/** Next chat question after travel facts (traveler profile). */
export function buildNextProfileQuestion(profile: UserProfile | null | undefined): string | null {
  if (!profile || !isTravelFactsComplete(profile)) return null;
  if (!profile.travelerType) return TRAVELER_TYPE_QUESTION;
  if (!profile.ageBand) return AGE_BAND_QUESTION;
  return null;
}

/** Full assistant reply immediately after calendar period confirm. */
export function buildAfterPeriodConfirmReply(profile: UserProfile | null | undefined): string | null {
  const recap = buildTravelFactsRecapPrefix(profile);
  const next = buildNextProfileQuestion(profile);
  if (!recap && !next) return null;
  if (!next) return recap;
  return recap ? `${recap} ${next}` : next;
}
