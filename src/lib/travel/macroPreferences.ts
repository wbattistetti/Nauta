/**
 * Macro preference labels (7 tiles) — maps to likes/dislikes, style, budget.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Waves,
  Mountain,
  Wheat,
  Landmark,
  UtensilsCrossed,
  Gauge,
  Wallet,
  Building2,
  PartyPopper,
  Coffee,
  Sandwich,
  Store,
  Wine,
  Sparkles,
  Compass,
  CircleDollarSign,
  Gem,
  Trees,
  Home,
  MapPin,
} from 'lucide-react';
import type { TravelThemeId, UserProfile } from '../../types/travelState';
import { buildExclusiveChoicePatch } from './preferenceUi';

export type MacroPreferenceId =
  | 'mare'
  | 'montagna'
  | 'campagna'
  | 'citta_arte'
  | 'cibo'
  | 'ritmo'
  | 'budget';

export type MacroVisualState = 'neutral' | 'included' | 'excluded';

export type MacroSubOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Theme likes applied when this sub is selected. */
  themeIds?: TravelThemeId[];
  /** Exclusive style value (ritmo). */
  styleId?: string;
  /** Exclusive budget value. */
  budgetId?: string;
  /** Clear budget — “Non importa”. */
  budgetFlexible?: boolean;
};

export type MacroPreferenceDef = {
  id: MacroPreferenceId;
  label: string;
  icon: LucideIcon;
  /** All theme IDs owned by this macro (for bulk include/exclude). */
  themeIds: TravelThemeId[];
  subOptions?: MacroSubOption[];
};

export const MACRO_PREFERENCE_PAYOFF =
  'Seleziona quello che ti interessa o quello che non vuoi.';

export const MACRO_PREFERENCES: MacroPreferenceDef[] = [
  {
    id: 'mare',
    label: 'Mare',
    icon: Waves,
    themeIds: ['beach', 'outdoor_sports'],
  },
  {
    id: 'montagna',
    label: 'Montagna',
    icon: Mountain,
    themeIds: ['mountains', 'trekking', 'wildlife', 'parks', 'nature_photo'],
  },
  {
    id: 'campagna',
    label: 'Campagna',
    icon: Wheat,
    themeIds: ['nature', 'traditions', 'historic_sites', 'crafts'],
    subOptions: [
      { id: 'borghi', label: 'Borghi rurali', icon: Home, themeIds: ['historic_sites', 'traditions'] },
      { id: 'agriturismo', label: 'Agriturismo', icon: Trees, themeIds: ['local_food', 'traditions'] },
      { id: 'collini', label: 'Paesaggi collinari', icon: MapPin, themeIds: ['nature', 'nature_photo'] },
    ],
  },
  {
    id: 'citta_arte',
    label: "Città d'arte",
    icon: Landmark,
    themeIds: ['museums', 'historic_sites', 'architecture', 'festivals', 'cafes', 'art_ancient', 'art_modern'],
    subOptions: [
      { id: 'musei', label: 'Musei', icon: Landmark, themeIds: ['museums'] },
      { id: 'monumenti', label: 'Monumenti', icon: Building2, themeIds: ['historic_sites', 'architecture', 'archaeology'] },
      { id: 'chiese', label: 'Chiese', icon: Building2, themeIds: ['art_ancient', 'architecture'] },
      { id: 'eventi', label: 'Eventi', icon: PartyPopper, themeIds: ['festivals'] },
      { id: 'locali', label: 'Locali', icon: Coffee, themeIds: ['cafes', 'art_modern'] },
    ],
  },
  {
    id: 'cibo',
    label: 'Cibo',
    icon: UtensilsCrossed,
    themeIds: ['local_food', 'street_food', 'food_markets', 'tastings'],
    subOptions: [
      { id: 'tradizionale', label: 'Tradizionale', icon: UtensilsCrossed, themeIds: ['local_food'] },
      { id: 'internazionale', label: 'Internazionale', icon: Sandwich, themeIds: ['street_food'] },
      { id: 'mercati', label: 'Mercati tipici', icon: Store, themeIds: ['food_markets'] },
      { id: 'degustazioni', label: 'Degustazioni', icon: Wine, themeIds: ['tastings'] },
    ],
  },
  {
    id: 'ritmo',
    label: 'Ritmo',
    icon: Gauge,
    themeIds: ['relax', 'wellness'],
    subOptions: [
      { id: 'relax', label: 'Relax', icon: Sparkles, styleId: 'lento', themeIds: ['relax', 'wellness'] },
      { id: 'equilibrato', label: 'Equilibrato', icon: Gauge, styleId: 'equilibrato' },
      { id: 'movimentato', label: 'Movimentato', icon: Compass, styleId: 'intenso', themeIds: ['nightlife'] },
    ],
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: Wallet,
    themeIds: [],
    subOptions: [
      { id: 'basso', label: 'Basso', icon: Wallet, budgetId: 'economico' },
      { id: 'medio', label: 'Medio', icon: CircleDollarSign, budgetId: 'medio' },
      { id: 'alto', label: 'Alto', icon: Gem, budgetId: 'alto' },
      { id: 'indifferente', label: 'Non importa', icon: Wallet, budgetFlexible: true },
    ],
  },
];

const macroById = new Map(MACRO_PREFERENCES.map((m) => [m.id, m]));

export function getMacroPreference(id: MacroPreferenceId): MacroPreferenceDef {
  const m = macroById.get(id);
  if (!m) throw new Error(`Unknown macro: ${id}`);
  return m;
}

function allMacroThemeIds(macro: MacroPreferenceDef): TravelThemeId[] {
  const fromSubs =
    macro.subOptions?.flatMap((s) => s.themeIds ?? []) ?? [];
  return [...new Set([...macro.themeIds, ...fromSubs])];
}

function styleId(profile: UserProfile): string | undefined {
  return (profile.style ?? profile.ritmo)?.toLowerCase();
}

function budgetId(profile: UserProfile): string | undefined {
  return profile.budget?.toLowerCase();
}

function ritmoStyleIds(): string[] {
  return ['lento', 'equilibrato', 'intenso'];
}

function isBudgetFlexible(profile: UserProfile): boolean {
  return profile.budget === 'indifferente';
}

/** Derive macro tile visual state from profile. */
export function getMacroVisualState(
  macroId: MacroPreferenceId,
  profile: UserProfile
): MacroVisualState {
  const macro = getMacroPreference(macroId);
  const likes = profile.likes ?? [];
  const dislikes = profile.dislikes ?? [];
  const themes = allMacroThemeIds(macro);

  if (macroId === 'ritmo') {
    const style = styleId(profile);
    const ritmoExcluded =
      themes.length > 0 && themes.every((t) => dislikes.includes(t)) && !style;
    if (ritmoExcluded) return 'excluded';
    if (style || themes.some((t) => likes.includes(t))) return 'included';
    return 'neutral';
  }

  if (macroId === 'budget') {
    const budget = budgetId(profile);
    if (budget === 'escluso') return 'excluded';
    if (budget || isBudgetFlexible(profile)) return 'included';
    return 'neutral';
  }

  if (themes.length === 0) return 'neutral';

  const liked = themes.filter((t) => likes.includes(t));
  const disliked = themes.filter((t) => dislikes.includes(t));

  if (disliked.length > 0 && liked.length === 0 && disliked.length === themes.length) {
    return 'excluded';
  }
  if (liked.length > 0) return 'included';
  if (disliked.length > 0) return 'excluded';
  return 'neutral';
}

function withoutThemes(
  list: TravelThemeId[],
  remove: TravelThemeId[]
): TravelThemeId[] {
  const drop = new Set(remove);
  return list.filter((id) => !drop.has(id));
}

function mergeThemes(list: TravelThemeId[], add: TravelThemeId[]): TravelThemeId[] {
  return [...new Set([...list, ...add])];
}

/** Main tap: neutral → included (default themes for macro). */
export function buildMacroIncludePatch(
  macroId: MacroPreferenceId,
  profile: UserProfile
): Partial<UserProfile> {
  const macro = getMacroPreference(macroId);
  const themes = macro.themeIds.length > 0 ? macro.themeIds : allMacroThemeIds(macro);
  let likes = profile.likes ?? [];
  let dislikes = withoutThemes(profile.dislikes ?? [], themes);

  if (macroId === 'ritmo') {
    return {
      likes: mergeThemes(likes, ['relax']),
      dislikes,
      style: 'equilibrato',
      ritmo: '',
    };
  }

  if (macroId === 'budget') {
    return {
      likes,
      dislikes,
      budget: 'medio',
    };
  }

  likes = mergeThemes(likes, themes);
  return { likes, dislikes };
}

/** Main tap on included macro → neutral (deselect, no exclude). */
export function buildMacroNeutralPatch(
  macroId: MacroPreferenceId,
  profile: UserProfile
): Partial<UserProfile> {
  const macro = getMacroPreference(macroId);
  const themes = allMacroThemeIds(macro);
  const likes = withoutThemes(profile.likes ?? [], themes);
  const dislikes = withoutThemes(profile.dislikes ?? [], themes);

  if (macroId === 'ritmo') {
    return { likes, dislikes, style: '', ritmo: '' };
  }
  if (macroId === 'budget') {
    return { likes, dislikes, budget: '' };
  }
  return { likes, dislikes };
}

/** Thumbs-down on selected macro → excluded. */
export function buildMacroExcludePatch(
  macroId: MacroPreferenceId,
  profile: UserProfile
): Partial<UserProfile> {
  const macro = getMacroPreference(macroId);
  const themes = allMacroThemeIds(macro);
  let likes = withoutThemes(profile.likes ?? [], themes);
  let dislikes = mergeThemes(profile.dislikes ?? [], themes);

  if (macroId === 'ritmo') {
    return {
      likes,
      dislikes: mergeThemes(dislikes, ['relax', 'wellness']),
      style: '',
      ritmo: '',
    };
  }

  if (macroId === 'budget') {
    return {
      likes,
      dislikes,
      budget: 'escluso',
    };
  }

  return { likes, dislikes };
}

/** X on excluded macro → back to neutral. */
export function buildMacroClearExcludePatch(
  macroId: MacroPreferenceId,
  profile: UserProfile
): Partial<UserProfile> {
  const macro = getMacroPreference(macroId);
  const themes = allMacroThemeIds(macro);
  let dislikes = withoutThemes(profile.dislikes ?? [], themes);

  if (macroId === 'ritmo') {
    return { dislikes, style: '', ritmo: '' };
  }
  if (macroId === 'budget') {
    return { dislikes, budget: '' };
  }
  return { dislikes, likes: withoutThemes(profile.likes ?? [], themes) };
}

/** Sub-option tap in expanded panel. */
export function buildMacroSubOptionPatch(
  macroId: MacroPreferenceId,
  subId: string,
  profile: UserProfile
): Partial<UserProfile> {
  const macro = getMacroPreference(macroId);
  const sub = macro.subOptions?.find((s) => s.id === subId);
  if (!sub) return {};

  const macroThemes = allMacroThemeIds(macro);
  let likes = profile.likes ?? [];
  let dislikes = withoutThemes(profile.dislikes ?? [], macroThemes);

  if (sub.themeIds?.length) {
    const selected = isSubOptionSelected(macroId, subId, profile);
    if (selected) {
      likes = withoutThemes(likes, sub.themeIds);
    } else {
      likes = mergeThemes(likes, sub.themeIds);
      dislikes = withoutThemes(dislikes, sub.themeIds);
    }
    return { likes, dislikes };
  }

  if (sub.styleId) {
    const current = styleId(profile);
    return buildExclusiveChoicePatch('style', sub.styleId, current);
  }

  if (sub.budgetFlexible) {
    const flex = isBudgetFlexible(profile);
    return { budget: flex ? '' : 'indifferente' };
  }

  if (sub.budgetId) {
    const current = budgetId(profile);
    return buildExclusiveChoicePatch('budget', sub.budgetId, current);
  }

  return { likes, dislikes };
}

export function isSubOptionSelected(
  macroId: MacroPreferenceId,
  subId: string,
  profile: UserProfile
): boolean {
  const macro = getMacroPreference(macroId);
  const sub = macro.subOptions?.find((s) => s.id === subId);
  if (!sub) return false;

  if (sub.styleId) return styleId(profile) === sub.styleId;
  if (sub.budgetFlexible) return isBudgetFlexible(profile);
  if (sub.budgetId) return budgetId(profile) === sub.budgetId;
  if (sub.themeIds?.length) {
    return sub.themeIds.every((t) => (profile.likes ?? []).includes(t));
  }
  return false;
}

export function macroHasSubPanel(macroId: MacroPreferenceId): boolean {
  return (getMacroPreference(macroId).subOptions?.length ?? 0) > 0;
}
