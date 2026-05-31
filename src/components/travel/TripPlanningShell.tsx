/**
 * Orchestrates planning UI — chat mode vs fullscreen itinerary, contextual chat sheet.
 */
import type { ChatMessage } from '../../types/trip';
import type { TravelPhase, TravelState, TravelStop, UserProfile } from '../../types/travelState';
import type { TravelPhoto } from '../../lib/travel/travelPhoto';
import type { ExplorerHeroContext } from '../../lib/travel/heroTitle';
import { isPanelsReviewed } from '../../lib/travel/travelUi';
import {
  PREFERENCES_ACCORDION_PAYOFF_LONG,
  PREFERENCES_ACCORDION_PAYOFF_SHORT,
  PREFERENCES_REVISION_WRITE_PAYOFF,
  PREFERENCES_REVISION_PANELS_PAYOFF,
  PREFERENCES_REVISION_INPUT_PLACEHOLDER,
  ITINERARY_PROCEED_LABEL,
} from '../../lib/travel/itineraryCopy';
import ItineraryFeedbackIcons, { type ItineraryFeedback } from './ItineraryFeedbackIcons';
import PreliminaryItineraryPanel from './PreliminaryItineraryPanel';
import ProfileChoicePanels from './ProfileChoicePanels';
import PlanningChatFab from './PlanningChatFab';
import ContextualChatSheet, { type ChatScope } from './ContextualChatSheet';
import { PlanningAccordionBody, PlanningAccordionSection, PLANNING_PANEL_SHELL } from './PlanningAccordion';

export type { ChatScope };

export type TripPlanningShellProps = {
  travelState: TravelState;
  travelPhase: TravelPhase;
  panelMicroFeedback?: string | null;
  profilePatchError?: string | null;
  onProfileChange: (patch: Partial<UserProfile>) => void;
  profileDisabled?: boolean;
  onConfirmItinerary?: () => void;
  onRequestReplace?: (stopId: string) => void;
  onPickReplacement?: (stopId: string, candidateId: string) => void;
  onCancelReplacement?: () => void;
  onHeroContextChange?: (ctx: ExplorerHeroContext) => void;
  onStopPhotoPreview?: (stop: TravelStop) => void;
  stopSets?: Record<string, TravelPhoto[]>;
  chatInlineSlot?: React.ReactNode;
  chatSlot: React.ReactNode;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  chatLoading?: boolean;
  chatError?: string | null;
  chatInputPlaceholder?: string;
  focusedStop: TravelStop | null;
  itineraryMode: boolean;
  preferencesOpen: boolean;
  chatSheetOpen: boolean;
  chatScope: ChatScope | null;
  onChatSheetOpenChange: (open: boolean) => void;
  onChatScopeChange: (scope: ChatScope | null) => void;
  itineraryFeedback: ItineraryFeedback;
  onItineraryFeedbackChange: (value: ItineraryFeedback) => void;
  preferencesEditMode: boolean;
  onPreferencesEditModeChange: (edit: boolean) => void;
  revisionNote: string;
  onRevisionNoteChange: (note: string) => void;
  onProceedItinerary: () => void;
  itinerarySidebarOpen?: boolean;
  onItinerarySidebarOpenChange?: (open: boolean) => void;
};

export default function TripPlanningShell({
  travelState,
  travelPhase,
  panelMicroFeedback,
  profilePatchError,
  onProfileChange,
  profileDisabled,
  onConfirmItinerary,
  onRequestReplace,
  onPickReplacement,
  onCancelReplacement,
  onHeroContextChange,
  onStopPhotoPreview,
  stopSets,
  chatInlineSlot,
  chatSlot,
  messages,
  onSend,
  chatLoading,
  chatError,
  chatInputPlaceholder,
  focusedStop,
  itineraryMode,
  preferencesOpen,
  chatSheetOpen,
  chatScope,
  onChatSheetOpenChange,
  onChatScopeChange,
  itineraryFeedback,
  onItineraryFeedbackChange,
  preferencesEditMode,
  onPreferencesEditModeChange,
  revisionNote,
  onRevisionNoteChange,
  onProceedItinerary,
  itinerarySidebarOpen,
  onItinerarySidebarOpenChange,
}: TripPlanningShellProps) {
  const hasStops = travelState.itinerary.stops.length > 0;
  const stops = travelState.itinerary.stops;
  const panelsReviewed = isPanelsReviewed(travelState.profile);
  const showRevisionPayoff = itineraryFeedback === 'disliked';
  const preferencesPayoff = panelsReviewed
    ? PREFERENCES_ACCORDION_PAYOFF_SHORT
    : PREFERENCES_ACCORDION_PAYOFF_LONG;

  const preferencesPanel = (
    <PlanningAccordionSection>
      <PlanningAccordionBody open>
        {showRevisionPayoff ? (
          <>
            <p className="text-xs text-amber-200/90 leading-relaxed pb-2">
              {PREFERENCES_REVISION_WRITE_PAYOFF}
            </p>
            <textarea
              value={revisionNote}
              onChange={(e) => onRevisionNoteChange(e.target.value)}
              placeholder={PREFERENCES_REVISION_INPUT_PLACEHOLDER}
              rows={3}
              className="w-full mb-3 rounded-lg border border-amber-900/40 bg-stone-950/80 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-600/60 focus:outline-none focus:ring-1 focus:ring-teal-600/50 resize-y min-h-[4.5rem]"
            />
            <p className="text-xs text-amber-200/90 leading-relaxed pb-3">
              {PREFERENCES_REVISION_PANELS_PAYOFF}
            </p>
          </>
        ) : (
          <p className="text-xs text-amber-200/90 leading-relaxed pb-3">{preferencesPayoff}</p>
        )}
        {panelMicroFeedback ? (
          <p className="text-[11px] text-teal-400/90 pb-2">{panelMicroFeedback}</p>
        ) : null}
        {profilePatchError ? (
          <p className="text-xs text-red-400/90 pb-2">{profilePatchError}</p>
        ) : null}
        <ProfileChoicePanels
          profile={travelState.profile}
          onChange={onProfileChange}
          disabled={profileDisabled}
          editMode={preferencesEditMode}
          onEditModeChange={onPreferencesEditModeChange}
        />
      </PlanningAccordionBody>
    </PlanningAccordionSection>
  );

  if (itineraryMode && hasStops) {
    return (
      <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden bg-stone-950">
        <div
          className={`flex flex-col flex-1 min-h-0 overflow-y-auto ${
            preferencesOpen ? 'opacity-25 pointer-events-none' : ''
          }`}
        >
          {!travelState.locked && onConfirmItinerary ? (
            <div className="flex items-center justify-end gap-1.5 px-4 py-2 shrink-0">
              <ItineraryFeedbackIcons
                value={itineraryFeedback}
                onLike={() => onItineraryFeedbackChange('liked')}
                onDislike={() => onItineraryFeedbackChange('disliked')}
              />
              {itineraryFeedback === 'liked' ? (
                <button
                  type="button"
                  onClick={onProceedItinerary}
                  className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full bg-emerald-800 text-emerald-50 font-medium whitespace-nowrap hover:bg-emerald-700 transition-colors touch-manipulation"
                >
                  {ITINERARY_PROCEED_LABEL}
                </button>
              ) : null}
            </div>
          ) : null}
          <PreliminaryItineraryPanel
            stops={stops}
            profile={travelState.profile}
            destination={travelState.profile.destination}
            stopSets={stopSets}
            travelPhase={travelPhase}
            visible
            locked={travelState.locked}
            pendingReplacement={travelState.pendingReplacement}
            onRequestReplace={onRequestReplace}
            onPickReplacement={onPickReplacement}
            onCancelReplacement={onCancelReplacement}
            onHeroContextChange={onHeroContextChange}
            onStopPhotoPreview={onStopPhotoPreview}
            useDock
            sidebarOpen={itinerarySidebarOpen}
            onSidebarOpenChange={onItinerarySidebarOpenChange}
          />
        </div>

        {preferencesOpen ? (
          <div className="absolute inset-0 z-[91] overflow-y-auto bg-stone-950/98 backdrop-blur-sm">
            <div className={`w-full h-full ${PLANNING_PANEL_SHELL} border-0 md:border-0`}>
              {preferencesPanel}
            </div>
          </div>
        ) : null}

        <PlanningChatFab open={chatSheetOpen} onClick={() => onChatSheetOpenChange(!chatSheetOpen)} />
        <ContextualChatSheet
          open={chatSheetOpen}
          onClose={() => onChatSheetOpenChange(false)}
          messages={messages}
          onSend={onSend}
          loading={chatLoading}
          error={chatError}
          inputPlaceholder={chatInputPlaceholder}
          focusedStop={focusedStop}
          chatScope={chatScope}
          onChooseScope={onChatScopeChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {chatSlot}
      {chatInlineSlot}
      {preferencesOpen ? (
        <div className={`shrink-0 w-full ${PLANNING_PANEL_SHELL}`}>{preferencesPanel}</div>
      ) : null}
    </div>
  );
}
