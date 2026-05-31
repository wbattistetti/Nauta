/**
 * Compact labels for the planning summary ribbon (stops + preferences).
 */
import type { TravelState, UserProfile } from '../../types/travelState';
import {
  ALL_THEME_OPTIONS,
  BUDGET_OPTIONS,
  STYLE_OPTIONS,
} from './preferenceOptions';
import { profilePeriodLabel } from './periodFormat';

const themeLabel = new Map(ALL_THEME_OPTIONS.map((o) => [o.id, o.label]));

function styleLabel(id?: string) {
  return STYLE_OPTIONS.find((o) => o.id === id)?.label ?? id ?? '';
}

function budgetLabel(id?: string) {
  return BUDGET_OPTIONS.find((o) => o.id === id)?.label ?? id ?? '';
}

export type PlanningRibbonChip = {
  id: string;
  label: string;
  kind: 'stop' | 'pref';
};

/** Chips for horizontal summary strip under accordions. */
export function buildPlanningRibbonChips(state: TravelState | null): PlanningRibbonChip[] {
  if (!state) return [];
  const chips: PlanningRibbonChip[] = [];

  for (const stop of state.itinerary.stops) {
    chips.push({
      id: `stop-${stop.id}`,
      label: `${stop.name} · ${stop.days}g`,
      kind: 'stop',
    });
  }

  const profile = state.profile;
  for (const like of (profile.likes ?? []).slice(0, 4)) {
    chips.push({
      id: `like-${like}`,
      label: themeLabel.get(like) ?? like,
      kind: 'pref',
    });
  }
  if (profile.style) {
    chips.push({ id: 'style', label: styleLabel(profile.style), kind: 'pref' });
  }
  if (profile.budget) {
    chips.push({ id: 'budget', label: budgetLabel(profile.budget), kind: 'pref' });
  }

  return chips;
}

export function travelPeriodSummary(profile: UserProfile | undefined): string {
  if (!profile) return '';
  const parts: string[] = [];
  if (profile.destination) parts.push(profile.destination);
  if (profile.durationDays) parts.push(`${profile.durationDays} giorni`);
  const period = profilePeriodLabel(profile);
  if (period) parts.push(period);
  return parts.join(' · ');
}

/** Period line for chat header (destination already in title). */
export function buildTripPeriodSubtitle(profile: UserProfile | undefined): string | null {
  if (!profile) return null;
  const parts: string[] = [];
  if (profile.durationDays) parts.push(`${profile.durationDays} giorni`);
  const period = profilePeriodLabel(profile);
  if (period) parts.push(period);
  if (parts.length === 0) return null;
  return `· ${parts.join(' · ')}`;
}
