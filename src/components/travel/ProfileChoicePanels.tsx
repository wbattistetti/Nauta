/**
 * Profile preferences — macro labels (proposal browse or edit panel).
 */
import type { UserProfile } from '../../types/travelState';
import { collectSynopticSelections, type SynopticEntry } from '../../lib/travel/preferenceUi';
import type { MacroPreferenceId } from '../../lib/travel/macroPreferences';
import MacroPreferencePanel from './MacroPreferencePanel';
import ProposedPreferencesBrowse from './ProposedPreferencesBrowse';

type Props = {
  profile: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
  disabled?: boolean;
  editMode: boolean;
  onEditModeChange: (edit: boolean) => void;
};

export default function ProfileChoicePanels({
  profile,
  onChange,
  disabled,
  editMode,
  onEditModeChange,
}: Props) {
  const synopticEntries = collectSynopticSelections(profile);

  function enterEditMode(_entry?: SynopticEntry) {
    onEditModeChange(true);
  }

  if (!editMode) {
    return (
      <ProposedPreferencesBrowse
        entries={synopticEntries}
        disabled={disabled}
        onEntryClick={(entry) => enterEditMode(entry)}
      />
    );
  }

  return (
    <div className="-mx-1 py-1">
      <MacroPreferencePanel profile={profile} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export type { MacroPreferenceId };
