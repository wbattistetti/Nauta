/**
 * Preference panel layout & tri-state helpers (neutral / included / excluded).
 */
import type { LucideIcon } from 'lucide-react';
import type { TravelThemeId, UserProfile } from '../../types/travelState';
import {
  ALL_THEME_OPTIONS,
  BUDGET_OPTIONS,
  PREFERENCE_SECTIONS,
  STYLE_OPTIONS,
  type ThemeOption,
} from './preferenceOptions';
import {
  MACRO_PREFERENCES,
  getMacroVisualState,
  isSubOptionSelected,
} from './macroPreferences';

export const PACE_SECTION_ID = 'pace';
export const BUDGET_SECTION_ID = 'budget';

export type SynopticEntryKind = 'theme' | 'style' | 'budget' | 'macro';

export type SynopticEntry = {
  key: string;
  kind: SynopticEntryKind;
  label: string;
  icon: LucideIcon;
  state: 'included' | 'excluded';
  themeId?: TravelThemeId;
  sectionId?: string;
  macroId?: string;
};

export const VISIBLE_PREFERENCES_PER_GROUP = 6;

export const PREFERENCE_GRID_COLS = 'grid-cols-3';

export const PREFERENCE_MORE_LABEL = 'Altro';

export type PreferenceVisualState = 'neutral' | 'included' | 'excluded';

export function getPreferenceVisualState(
  id: TravelThemeId,
  likes: TravelThemeId[],
  dislikes: TravelThemeId[]
): PreferenceVisualState {
  if (dislikes.includes(id)) return 'excluded';
  if (likes.includes(id)) return 'included';
  return 'neutral';
}

export function splitVisiblePreferences<T>(options: T[]): {
  visible: T[];
  extra: T[];
  hasMore: boolean;
} {
  if (options.length <= VISIBLE_PREFERENCES_PER_GROUP) {
    return { visible: options, extra: [], hasMore: false };
  }
  return {
    visible: options.slice(0, VISIBLE_PREFERENCES_PER_GROUP),
    extra: options.slice(VISIBLE_PREFERENCES_PER_GROUP),
    hasMore: true,
  };
}

export function findSectionIdForTheme(id: TravelThemeId): string | undefined {
  return PREFERENCE_SECTIONS.find((s) => s.options.some((o) => o.id === id))?.id;
}

/** Included themes in section order (for synoptic / proposal row). */
export function collectIncludedThemeOptions(
  likes: TravelThemeId[]
): ThemeOption[] {
  const likeSet = new Set(likes);
  return ALL_THEME_OPTIONS.filter((o) => likeSet.has(o.id));
}

/** Excluded themes in section order (proposal browse row). */
export function collectExcludedThemeOptions(
  dislikes: TravelThemeId[]
): ThemeOption[] {
  const dislikeSet = new Set(dislikes);
  return ALL_THEME_OPTIONS.filter((o) => dislikeSet.has(o.id));
}

/** Mutually exclusive panel field: at most one value; tap again clears (zero allowed). */
export function buildExclusiveChoicePatch(
  field: 'style' | 'budget',
  optionId: string,
  currentId: string | undefined
): Partial<UserProfile> {
  const clearing = currentId === optionId;
  if (field === 'style') {
    return clearing ? { style: '', ritmo: '' } : { style: optionId, ritmo: '' };
  }
  return clearing ? { budget: '' } : { budget: optionId };
}

export function isThemeInExtraSlice(
  sectionId: string,
  themeId: TravelThemeId
): boolean {
  const section = PREFERENCE_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return false;
  const idx = section.options.findIndex((o) => o.id === themeId);
  return idx >= VISIBLE_PREFERENCES_PER_GROUP;
}

/** All active selections for synoptic / proposal row (macros + legacy themes). */
export function collectSynopticSelections(profile: UserProfile): SynopticEntry[] {
  const macroEntries = collectMacroSynopticEntries(profile);
  if (macroEntries.length > 0) return macroEntries;

  const entries: SynopticEntry[] = [];
  const likes = profile.likes ?? [];
  const dislikes = profile.dislikes ?? [];

  for (const opt of collectIncludedThemeOptions(likes)) {
    entries.push({
      key: `theme-${opt.id}`,
      kind: 'theme',
      label: opt.label,
      icon: opt.icon,
      state: 'included',
      themeId: opt.id,
      sectionId: findSectionIdForTheme(opt.id),
    });
  }

  for (const opt of collectExcludedThemeOptions(dislikes)) {
    entries.push({
      key: `theme-ex-${opt.id}`,
      kind: 'theme',
      label: opt.label,
      icon: opt.icon,
      state: 'excluded',
      themeId: opt.id,
      sectionId: findSectionIdForTheme(opt.id),
    });
  }

  const styleId = (profile.style ?? profile.ritmo)?.toLowerCase();
  if (styleId) {
    const pace = STYLE_OPTIONS.find((o) => o.id === styleId);
    if (pace) {
      entries.push({
        key: `style-${pace.id}`,
        kind: 'style',
        label: pace.label,
        icon: pace.icon,
        state: 'included',
        sectionId: PACE_SECTION_ID,
      });
    }
  }

  const budgetId = profile.budget?.toLowerCase();
  if (budgetId) {
    const budget = BUDGET_OPTIONS.find((o) => o.id === budgetId);
    if (budget) {
      entries.push({
        key: `budget-${budget.id}`,
        kind: 'budget',
        label: budget.label,
        icon: budget.icon,
        state: 'included',
        sectionId: BUDGET_SECTION_ID,
      });
    }
  }

  return entries;
}

function collectMacroSynopticEntries(profile: UserProfile): SynopticEntry[] {
  const entries: SynopticEntry[] = [];
  for (const macro of MACRO_PREFERENCES) {
    const visual = getMacroVisualState(macro.id, profile);
    if (visual === 'neutral') continue;

    for (const sub of macro.subOptions ?? []) {
      if (isSubOptionSelected(macro.id, sub.id, profile)) {
        entries.push({
          key: `sub-${macro.id}-${sub.id}`,
          kind: 'macro',
          label: sub.label,
          icon: sub.icon,
          state: 'included',
          macroId: macro.id,
        });
      }
    }

    if (visual === 'included') {
      entries.push({
        key: `macro-${macro.id}`,
        kind: 'macro',
        label: macro.label,
        icon: macro.icon,
        state: 'included',
        macroId: macro.id,
      });
    } else if (visual === 'excluded') {
      entries.push({
        key: `macro-ex-${macro.id}`,
        kind: 'macro',
        label: macro.label,
        icon: macro.icon,
        state: 'excluded',
        macroId: macro.id,
      });
    }
  }
  return entries;
}
