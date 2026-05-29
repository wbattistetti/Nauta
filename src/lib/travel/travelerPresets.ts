/**
 * Traveler profile → preference panel presets (configurable JSON).
 */
import presetsJson from '../../config/travelerPresets.json';
import type { TravelThemeId, UserProfile } from '../../types/travelState';

export type TravelerType = 'solo' | 'couples' | 'family' | 'friends';
export type AgeBand = '18-25' | '25-35' | '35-50' | '50+';

type PresetRule = {
  id: string;
  match: { travelerType: TravelerType; ageBand: AgeBand };
  preset: {
    likes: TravelThemeId[];
    dislikes?: TravelThemeId[];
    style: string;
    budget: string;
  };
};

type PresetsConfig = {
  version: number;
  defaultPresetId: string;
  rules: PresetRule[];
  defaultPreset: {
    likes: TravelThemeId[];
    dislikes?: TravelThemeId[];
    style: string;
    budget: string;
  };
};

const config = presetsJson as PresetsConfig;

export type ResolvedPreset = {
  id: string;
  patch: Partial<UserProfile>;
};

/** Resolve preset from traveler type + age band. */
export function resolveTravelerPreset(
  travelerType?: string,
  ageBand?: string
): ResolvedPreset | null {
  if (!travelerType || !ageBand) return null;
  const rule = config.rules.find(
    (r) => r.match.travelerType === travelerType && r.match.ageBand === ageBand
  );
  const preset = rule?.preset ?? config.defaultPreset;
  const id = rule?.id ?? config.defaultPresetId;
  return {
    id,
    patch: {
      likes: [...preset.likes],
      dislikes: [...(preset.dislikes ?? [])],
      style: preset.style,
      budget: preset.budget,
      preferencesPresetId: id,
    },
  };
}

export const PREFERENCE_PANELS_CHAT_MESSAGE =
  'Nei pannelli qui sotto trovi interessi, ritmo e budget già impostati per voi: modificate tutto ciò che volete, poi andate avanti.';

import {
  ITINERARY_PROPOSAL_CHAT_SHORT,
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_PAYOFF,
  STOP_PHOTOS_ACCORDION_LABEL,
} from './itineraryCopy';

export {
  ITINERARY_PROPOSAL_CHAT_SHORT,
  ITINERARY_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_TITLE,
  PREFERENCES_ACCORDION_PAYOFF,
  STOP_PHOTOS_ACCORDION_LABEL,
};

/** @deprecated Use PREFERENCES_ACCORDION_PAYOFF */
export const PREFERENCE_PANELS_HINT_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;

/** @deprecated Use ITINERARY_PROPOSAL_CHAT_SHORT */
export const ITINERARY_PROPOSAL_CHAT_MESSAGE = ITINERARY_PROPOSAL_CHAT_SHORT;

/** @deprecated Use PREFERENCES_ACCORDION_PAYOFF */
export const TRAVEL_PLAN_PROPOSAL_MESSAGE = PREFERENCES_ACCORDION_PAYOFF;

/** Echo above panels — pass the user's last chat line. */
export function formatUserEchoAbovePanels(userMessage: string): string {
  return String(userMessage ?? '').trim();
}
