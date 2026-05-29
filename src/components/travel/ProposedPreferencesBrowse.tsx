/**
 * Proposal view body — selected icons only (title lives on parent accordion).
 */
import type { SynopticEntry } from '../../lib/travel/preferenceUi';
import PreferenceSummaryChip, { PreferenceSummaryGrid } from './PreferenceSummaryChip';

type Props = {
  entries: SynopticEntry[];
  disabled?: boolean;
  onEntryClick: (entry: SynopticEntry) => void;
};

export default function ProposedPreferencesBrowse({ entries, disabled, onEntryClick }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-xs text-amber-500/80 text-center py-2">
        Nessuna proposta ancora — tocca modifica per scegliere
      </p>
    );
  }

  return (
    <PreferenceSummaryGrid>
      {entries.map((entry) => (
        <PreferenceSummaryChip
          key={entry.key}
          label={entry.label}
          Icon={entry.icon}
          state={entry.state}
          showHeart={entry.state === 'included'}
          disabled={disabled}
          onClick={() => onEntryClick(entry)}
        />
      ))}
    </PreferenceSummaryGrid>
  );
}
