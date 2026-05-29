/**
 * Macro or sub preference tile — grey when neutral; thematic accent when included;
 * thematic ring when parent details are expanded.
 */
import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import type { MacroPreferenceId, MacroVisualState } from '../../lib/travel/macroPreferences';
import {
  macroDetailGroupRingClass,
  macroTileButtonClasses,
  macroTileIconClass,
  macroTileLabelClass,
} from '../../lib/travel/macroAccent';
import MacroChipMenu, { type MacroMenuAction } from './MacroChipMenu';

export type MacroTileModel = {
  id: string;
  label: string;
  icon: import('lucide-react').LucideIcon;
};

type Props = {
  tile: MacroTileModel;
  macroId: MacroPreferenceId;
  state: MacroVisualState;
  variant: 'macro' | 'sub';
  showMenuButton?: boolean;
  detailsExpanded?: boolean;
  hasDetailOptions?: boolean;
  /** Thematic ring while “Più dettagli” is open — neutral tiles stay grey inside. */
  inDetailGroup?: boolean;
  disabled?: boolean;
  onMainClick: () => void;
  onMenuAction?: (action: MacroMenuAction) => void;
};

export default function MacroPreferenceChip({
  tile,
  macroId,
  state,
  variant,
  showMenuButton = false,
  detailsExpanded = false,
  hasDetailOptions = false,
  inDetailGroup = false,
  disabled,
  onMainClick,
  onMenuAction,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = tile.icon;
  const included = state === 'included';
  const excluded = state === 'excluded';
  const mainDisabled = disabled;

  function handleMenuAction(action: MacroMenuAction) {
    setMenuOpen(false);
    onMenuAction?.(action);
  }

  const showGroupRing = inDetailGroup && !excluded;

  return (
    <div
      className={[
        'relative min-w-0 rounded-xl transition-[box-shadow]',
        showGroupRing ? macroDetailGroupRingClass(macroId) : '',
      ].join(' ')}
    >
      <button
        type="button"
        disabled={mainDisabled}
        onClick={onMainClick}
        className={[
          'w-full flex flex-col items-center justify-center gap-1.5 px-1.5 pt-3 pb-3 rounded-xl border transition-all touch-manipulation select-none min-h-[4.75rem]',
          macroTileButtonClasses(state, macroId),
          excluded ? 'opacity-90' : '',
          variant === 'sub' ? 'min-h-[4.5rem]' : '',
        ].join(' ')}
        aria-pressed={included}
        aria-label={
          excluded ? `${tile.label}, escluso — tocca per annullare` : tile.label
        }
      >
        <Icon
          size={variant === 'sub' ? 22 : 24}
          strokeWidth={1.75}
          className={macroTileIconClass(state, macroId)}
          aria-hidden
        />
        <span
          className={[
            'text-[11px] font-medium leading-tight text-center line-clamp-2 px-0.5',
            macroTileLabelClass(state, macroId),
          ].join(' ')}
        >
          {tile.label}
        </span>
      </button>

      {showMenuButton && included && !excluded ? (
        <>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Opzioni ${tile.label}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="absolute bottom-1.5 right-1.5 p-0.5 text-amber-200/80 hover:text-amber-50 transition-colors touch-manipulation"
          >
            <MoreVertical size={16} strokeWidth={2} aria-hidden />
          </button>
          <MacroChipMenu
            open={menuOpen}
            detailsActive={detailsExpanded}
            showDetailsOption={hasDetailOptions}
            onAction={handleMenuAction}
            onClose={() => setMenuOpen(false)}
          />
        </>
      ) : null}
    </div>
  );
}
