/**
 * Thematic accent colors per macro family — selection = full accent; neutral = shared grey.
 */
import type { MacroPreferenceId } from './macroPreferences';

export type MacroAccentTokens = {
  ring: string;
  includedBorder: string;
  includedBg: string;
  includedText: string;
  includedIcon: string;
  includedShadow: string;
};

/** Unselected tile — same look for macros and subs (e.g. Mare). */
export const NEUTRAL_MACRO_TILE =
  'border-stone-600/40 bg-stone-950/50 text-stone-400/85 active:bg-stone-900/70';

export const NEUTRAL_MACRO_ICON = 'text-stone-500/80';
export const NEUTRAL_MACRO_LABEL = 'text-stone-400/90';

const EXCLUDED_MACRO_TILE =
  'border-stone-600/50 bg-stone-900/60 text-stone-400/90 cursor-default';

export const MACRO_ACCENT: Record<MacroPreferenceId, MacroAccentTokens> = {
  mare: {
    ring: 'ring-sky-400/55',
    includedBorder: 'border-sky-500/75',
    includedBg: 'bg-sky-950/45',
    includedText: 'text-sky-50/95',
    includedIcon: 'text-sky-300',
    includedShadow: 'shadow-[0_0_12px_rgba(56,189,248,0.14)]',
  },
  montagna: {
    ring: 'ring-amber-700/55',
    includedBorder: 'border-amber-700/75',
    includedBg: 'bg-amber-950/40',
    includedText: 'text-amber-50/95',
    includedIcon: 'text-amber-400/95',
    includedShadow: 'shadow-[0_0_12px_rgba(180,83,9,0.12)]',
  },
  campagna: {
    ring: 'ring-emerald-500/55',
    includedBorder: 'border-emerald-600/75',
    includedBg: 'bg-emerald-950/45',
    includedText: 'text-emerald-50/95',
    includedIcon: 'text-emerald-300',
    includedShadow: 'shadow-[0_0_12px_rgba(52,211,153,0.12)]',
  },
  citta_arte: {
    ring: 'ring-violet-400/55',
    includedBorder: 'border-violet-500/75',
    includedBg: 'bg-violet-950/45',
    includedText: 'text-violet-50/95',
    includedIcon: 'text-violet-300',
    includedShadow: 'shadow-[0_0_12px_rgba(167,139,250,0.14)]',
  },
  cibo: {
    ring: 'ring-orange-400/55',
    includedBorder: 'border-orange-500/75',
    includedBg: 'bg-orange-950/40',
    includedText: 'text-orange-50/95',
    includedIcon: 'text-orange-300',
    includedShadow: 'shadow-[0_0_12px_rgba(251,146,60,0.12)]',
  },
  ritmo: {
    ring: 'ring-cyan-400/55',
    includedBorder: 'border-cyan-500/75',
    includedBg: 'bg-cyan-950/40',
    includedText: 'text-cyan-50/95',
    includedIcon: 'text-cyan-300',
    includedShadow: 'shadow-[0_0_12px_rgba(34,211,238,0.12)]',
  },
  budget: {
    ring: 'ring-yellow-500/50',
    includedBorder: 'border-yellow-500/70',
    includedBg: 'bg-yellow-950/35',
    includedText: 'text-yellow-50/95',
    includedIcon: 'text-yellow-300',
    includedShadow: 'shadow-[0_0_12px_rgba(234,179,8,0.1)]',
  },
};

export function getMacroAccent(macroId: MacroPreferenceId): MacroAccentTokens {
  return MACRO_ACCENT[macroId];
}

export function macroTileButtonClasses(
  state: 'neutral' | 'included' | 'excluded',
  macroId: MacroPreferenceId
): string {
  if (state === 'excluded') return EXCLUDED_MACRO_TILE;
  if (state === 'included') {
    const a = getMacroAccent(macroId);
    return [a.includedBorder, a.includedBg, a.includedText, a.includedShadow].join(' ');
  }
  return NEUTRAL_MACRO_TILE;
}

export function macroTileIconClass(
  state: 'neutral' | 'included' | 'excluded',
  macroId: MacroPreferenceId
): string {
  if (state === 'included') return getMacroAccent(macroId).includedIcon;
  return NEUTRAL_MACRO_ICON;
}

export function macroTileLabelClass(
  state: 'neutral' | 'included' | 'excluded',
  macroId: MacroPreferenceId
): string {
  if (state === 'included') return getMacroAccent(macroId).includedText;
  return NEUTRAL_MACRO_LABEL;
}

export function macroDetailGroupRingClass(macroId: MacroPreferenceId): string {
  return `ring-2 ${getMacroAccent(macroId).ring} ring-offset-2 ring-offset-stone-950`;
}

export function macroSynopticIncludedClasses(macroId: MacroPreferenceId): string {
  const a = getMacroAccent(macroId);
  return [a.includedBorder, a.includedBg, a.includedText, a.includedShadow].join(' ');
}

export function macroSynopticIncludedIconClass(macroId: MacroPreferenceId): string {
  return getMacroAccent(macroId).includedIcon;
}
