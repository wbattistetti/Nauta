/**
 * Edit-mode synoptic as compact panel grid (not single horizontal row).
 */
import type { SynopticEntry } from '../../lib/travel/preferenceUi';
import PreferenceSummaryChip, { PreferenceSummaryGrid } from './PreferenceSummaryChip';

type Props = {
  entries: SynopticEntry[];
  disabled?: boolean;
  onSelect: (entry: SynopticEntry) => void;
};

export default function PreferencesSynoptic({ entries, disabled, onSelect }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-[11px] text-amber-500/75 py-0.5">
        Nessuna preferenza inclusa — scegli le icone qui sotto
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-normal text-amber-500/65 uppercase tracking-wide">Le tue scelte</p>
      <div className="rounded-xl border border-amber-900/30 bg-stone-950/40 p-2">
        <PreferenceSummaryGrid>
        {entries.map((entry) => (
          <PreferenceSummaryChip
            key={entry.key}
            label={entry.label}
            Icon={entry.icon}
            state={entry.state}
            macroId={entry.macroId}
            showHeart={false}
            disabled={disabled}
            onClick={() => onSelect(entry)}
          />
        ))}
        </PreferenceSummaryGrid>
      </div>
    </div>
  );
}
