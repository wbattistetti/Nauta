/**
 * Slide-up contextual chat — disambiguates stop vs itinerary scope when a stop is focused.
 */
import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ChatMessage } from '../../types/trip';
import type { TravelStop } from '../../types/travelState';
import ChatPanel from '../chat/ChatPanel';
import {
  CHAT_SCOPE_ITINERARY_LABEL,
  CHAT_SCOPE_PROMPT,
  CHAT_SCOPE_STOP_LABEL,
  CHAT_SHEET_CLOSE_LABEL,
  CHAT_SHEET_TITLE,
} from '../../lib/travel/itineraryCopy';

export type ChatScope = 'stop' | 'itinerary';

type Props = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  loading?: boolean;
  error?: string | null;
  inputPlaceholder?: string;
  focusedStop: TravelStop | null;
  chatScope: ChatScope | null;
  onChooseScope: (scope: ChatScope | null) => void;
};

export default function ContextualChatSheet({
  open,
  onClose,
  messages,
  onSend,
  loading,
  error,
  inputPlaceholder,
  focusedStop,
  chatScope,
  onChooseScope,
}: Props) {
  const needsScope = Boolean(focusedStop) && chatScope === null;
  const effectiveScope: ChatScope = chatScope ?? (focusedStop ? 'stop' : 'itinerary');

  const handleSend = useCallback(
    (text: string) => {
      if (needsScope) return;
      if (effectiveScope === 'stop' && focusedStop) {
        onSend(`[Tappa: ${focusedStop.name}] ${text}`);
        return;
      }
      onSend(text);
    },
    [needsScope, effectiveScope, focusedStop, onSend]
  );

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[93]" role="dialog" aria-modal aria-label={CHAT_SHEET_TITLE}>
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        aria-label={CHAT_SHEET_CLOSE_LABEL}
        onClick={onClose}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col max-h-[min(78dvh,640px)] rounded-t-2xl border-t border-amber-900/40 bg-stone-950 shadow-2xl overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-900/30">
          <h3 className="text-sm font-semibold text-amber-50">{CHAT_SHEET_TITLE}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={CHAT_SHEET_CLOSE_LABEL}
            className="p-1.5 rounded-full text-amber-300/90 hover:bg-stone-800 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {needsScope ? (
          <div className="shrink-0 px-4 py-3 border-b border-amber-900/25 bg-stone-900/50">
            <p className="text-xs text-amber-200/90 leading-relaxed mb-2.5">{CHAT_SCOPE_PROMPT}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChooseScope('stop')}
                className="text-xs px-3 py-1.5 rounded-full border border-teal-700/50 bg-teal-950/60 text-teal-100 hover:bg-teal-900/70 transition-colors"
              >
                {CHAT_SCOPE_STOP_LABEL}
                {focusedStop ? `: ${focusedStop.name}` : ''}
              </button>
              <button
                type="button"
                onClick={() => onChooseScope('itinerary')}
                className="text-xs px-3 py-1.5 rounded-full border border-amber-800/50 bg-stone-900/80 text-amber-100 hover:bg-stone-800 transition-colors"
              >
                {CHAT_SCOPE_ITINERARY_LABEL}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col flex-1 min-h-0">
          <ChatPanel
            mode="trip"
            variant="embedded"
            appearance="overlay"
            messages={messages}
            onSend={handleSend}
            loading={loading}
            error={error}
            inputDisabled={needsScope}
            inputPlaceholder={
              needsScope ? 'Scegli il contesto sopra…' : inputPlaceholder
            }
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
