/**
 * Macro preference grid — inline sub-tiles under parent; ⋮ menu on selected macros only.
 */
import { useMemo, useState } from 'react';
import type { UserProfile } from '../../types/travelState';
import {
  MACRO_PREFERENCE_PAYOFF,
  MACRO_PREFERENCES,
  buildMacroClearExcludePatch,
  buildMacroExcludePatch,
  buildMacroIncludePatch,
  buildMacroNeutralPatch,
  buildMacroSubOptionPatch,
  getMacroVisualState,
  isSubOptionSelected,
  macroHasSubPanel,
  type MacroPreferenceId,
  type MacroSubOption,
} from '../../lib/travel/macroPreferences';
import { PREFERENCE_GRID_COLS } from '../../lib/travel/preferenceUi';
import MacroPreferenceChip from './MacroPreferenceChip';
import type { MacroMenuAction } from './MacroChipMenu';

type GridItem =
  | { kind: 'macro'; macroId: MacroPreferenceId }
  | { kind: 'sub'; macroId: MacroPreferenceId; sub: MacroSubOption };

type Props = {
  profile: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
  disabled?: boolean;
};

function buildGridItems(
  profile: UserProfile,
  detailsExpandedMacroId: MacroPreferenceId | null
): GridItem[] {
  const items: GridItem[] = [];

  for (const macro of MACRO_PREFERENCES) {
    items.push({ kind: 'macro', macroId: macro.id });

    const subs = macro.subOptions ?? [];
    const pinned = subs.filter((s) => isSubOptionSelected(macro.id, s.id, profile));
    for (const sub of pinned) {
      items.push({ kind: 'sub', macroId: macro.id, sub });
    }

    if (detailsExpandedMacroId === macro.id) {
      const ephemeral = subs.filter((s) => !isSubOptionSelected(macro.id, s.id, profile));
      for (const sub of ephemeral) {
        items.push({ kind: 'sub', macroId: macro.id, sub });
      }
    }
  }

  return items;
}

export default function MacroPreferencePanel({ profile, onChange, disabled }: Props) {
  const [detailsExpandedMacroId, setDetailsExpandedMacroId] = useState<MacroPreferenceId | null>(
    null
  );

  const gridItems = useMemo(
    () => buildGridItems(profile, detailsExpandedMacroId),
    [profile, detailsExpandedMacroId]
  );

  function handleMacroMainClick(macroId: MacroPreferenceId) {
    const state = getMacroVisualState(macroId, profile);
    if (state === 'neutral') {
      onChange(buildMacroIncludePatch(macroId, profile));
      return;
    }
    if (state === 'included') {
      onChange(buildMacroNeutralPatch(macroId, profile));
      if (detailsExpandedMacroId === macroId) setDetailsExpandedMacroId(null);
    }
  }

  function handleMacroMenuAction(macroId: MacroPreferenceId, action: MacroMenuAction) {
    if (action === 'exclude') {
      onChange(buildMacroExcludePatch(macroId, profile));
      if (detailsExpandedMacroId === macroId) setDetailsExpandedMacroId(null);
      return;
    }
    if (action === 'details') {
      setDetailsExpandedMacroId((prev) => (prev === macroId ? null : macroId));
    }
  }

  function handleSubClick(macroId: MacroPreferenceId, subId: string) {
    onChange(buildMacroSubOptionPatch(macroId, subId, profile));
  }

  function handleExcludedMacroTap(macroId: MacroPreferenceId) {
    onChange(buildMacroClearExcludePatch(macroId, profile));
  }

  return (
    <div className="space-y-3 px-1">
      <p className="text-[11px] font-normal text-amber-500/75 leading-relaxed text-center px-1">
        {MACRO_PREFERENCE_PAYOFF}
      </p>

      <div className={`grid gap-2.5 w-full ${PREFERENCE_GRID_COLS}`}>
        {gridItems.map((item) => {
          const inDetailGroup =
            detailsExpandedMacroId !== null && detailsExpandedMacroId === item.macroId;

          if (item.kind === 'macro') {
            const macro = MACRO_PREFERENCES.find((m) => m.id === item.macroId)!;
            const state = getMacroVisualState(macro.id, profile);
            return (
              <MacroPreferenceChip
                key={`macro-${macro.id}`}
                macroId={macro.id}
                tile={{ id: macro.id, label: macro.label, icon: macro.icon }}
                state={state}
                variant="macro"
                showMenuButton
                hasDetailOptions={macroHasSubPanel(macro.id)}
                detailsExpanded={detailsExpandedMacroId === macro.id}
                inDetailGroup={inDetailGroup}
                disabled={disabled}
                onMainClick={() => {
                  if (state === 'excluded') handleExcludedMacroTap(macro.id);
                  else handleMacroMainClick(macro.id);
                }}
                onMenuAction={(action) => handleMacroMenuAction(macro.id, action)}
              />
            );
          }

          const selected = isSubOptionSelected(item.macroId, item.sub.id, profile);
          return (
            <MacroPreferenceChip
              key={`sub-${item.macroId}-${item.sub.id}`}
              macroId={item.macroId}
              tile={{
                id: `${item.macroId}-${item.sub.id}`,
                label: item.sub.label,
                icon: item.sub.icon,
              }}
              state={selected ? 'included' : 'neutral'}
              variant="sub"
              inDetailGroup={inDetailGroup}
              disabled={disabled}
              onMainClick={() => handleSubClick(item.macroId, item.sub.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
