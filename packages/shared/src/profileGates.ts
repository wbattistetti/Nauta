/**
 * Profile completeness gates — single source of truth for client and server.
 */
import type { UserProfile } from './types.js';

function trim(value: string | undefined): string {
  return value?.trim() ?? '';
}

/** Chat: destination, days, period. */
export function isTravelFactsComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  const hasPeriod = Boolean(profile.period || (profile.periodStart && profile.periodEnd));
  return Boolean(
    trim(profile.destination) &&
      profile.durationDays &&
      profile.durationDays > 0 &&
      hasPeriod
  );
}

/** Chat: companion + age band (after travel facts). */
export function isTravelerProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(profile.travelerType && profile.ageBand);
}

/** Themes + style + budget from panels (not chat). */
export function isPanelProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    (profile.likes?.length ?? 0) >= 1 && trim(profile.style) && trim(profile.budget)
  );
}

/** Optional UX flag — not required for itinerary generation. */
export function isPanelsReviewed(profile: UserProfile | null | undefined): boolean {
  return profile?.panelsReviewed === true;
}

/** Preset-filled profile ready for planner (facts + traveler + panel fields). */
export function isReadyForItineraryGeneration(profile: UserProfile | null | undefined): boolean {
  return (
    isTravelFactsComplete(profile) &&
    isTravelerProfileComplete(profile) &&
    isPanelProfileComplete(profile)
  );
}

/** Alias used by server routes. */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  return isReadyForItineraryGeneration(profile);
}

/** Show preference panels after facts + traveler profile. */
export function shouldShowPreferencePanels(profile: UserProfile | null | undefined): boolean {
  return isTravelFactsComplete(profile) && isTravelerProfileComplete(profile);
}
