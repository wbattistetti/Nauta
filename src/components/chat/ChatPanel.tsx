import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Send, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react';
import type { ChatMessage } from '../../types/trip';

export type ChatPanelProps = {
  mode: 'trip' | 'onboarding' | 'planner';
  variant: 'embedded';
  appearance?: 'card' | 'overlay';
  messages: ChatMessage[];
  onSend: (text: string) => void;
  loading?: boolean;
  error?: string | null;
  inputPlaceholder?: string;
  footerSlot?: ReactNode;
  onBack?: () => void;
  /** Voice: show mic + auto-listen after assistant reply */
  voiceEnabled?: boolean;
  voiceSupported?: boolean;
  voiceListening?: boolean;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  topSlot?: ReactNode;
  /** Prior session recap accordion — first item in scroll area. */
  priorRecapSlot?: ReactNode;
  /** Rendered inside scroll area after messages (e.g. preference panels). */
  inlineSlot?: ReactNode;
  /** When true, auto-scroll only on new messages — not when inlineSlot updates. */
  scrollOnInlineSlot?: boolean;
};

function WaMessageRow({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[88%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
          isUser
            ? 'bg-teal-800 text-amber-50 rounded-2xl rounded-br-md'
            : 'bg-stone-800/95 text-amber-50/95 rounded-2xl rounded-bl-md border border-stone-700/50'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

/** Chat UI — card or full overlay with WhatsApp-style bubbles. */
export default function ChatPanel({
  mode,
  appearance = 'card',
  messages,
  onSend,
  loading = false,
  error = null,
  inputPlaceholder = 'Scrivi la tua risposta...',
  footerSlot,
  onBack,
  voiceEnabled = false,
  voiceSupported = false,
  voiceListening = false,
  onVoiceStart,
  onVoiceStop,
  topSlot,
  priorRecapSlot,
  inlineSlot,
  scrollOnInlineSlot = false,
}: ChatPanelProps) {
  const overlay = appearance === 'overlay';
  const [input, setInput] = useState('');
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCount = useRef(messages.length);

  useEffect(() => {
    const countChanged = messages.length !== prevMessageCount.current;
    prevMessageCount.current = messages.length;

    if (!countChanged && loading === false && !scrollOnInlineSlot) return;

    if (inlineSlot && !scrollOnInlineSlot && !countChanged) return;

    const target = countChanged || scrollOnInlineSlot ? lastMessageRef.current : bottomRef.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [messages, loading, inlineSlot, scrollOnInlineSlot]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  function submit() {
    const text = input.trim();
    if (!text || loading) return;
    onVoiceStop?.();
    setInput('');
    onSend(text);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const shell = overlay
    ? 'flex flex-col flex-1 min-h-0 rounded-2xl border border-stone-700/40 bg-stone-950/40 backdrop-blur-sm overflow-hidden'
    : 'flex flex-col bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden min-h-[320px] max-h-[70vh]';

  const scrollArea = overlay
    ? 'flex-1 overflow-y-auto px-3 py-4 space-y-3 min-h-0'
    : 'flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0';

  const inputBar = overlay
    ? 'px-3 py-3 border-t border-stone-700/50 bg-stone-950/60'
    : 'px-4 py-3 border-t border-slate-100';

  const inputWrap = overlay
    ? 'flex items-end gap-2 bg-stone-900/80 border border-stone-600/50 rounded-2xl px-3 py-2 focus-within:border-teal-700/60'
    : 'flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-300';

  return (
    <div className={shell}>
      {topSlot && <div className="shrink-0 px-3 pt-3">{topSlot}</div>}

      {onBack && !overlay && (
        <div className="px-4 py-2 border-b border-slate-100">
          <button type="button" onClick={onBack} className="text-xs text-slate-500">
            Indietro
          </button>
        </div>
      )}

      <div className={scrollArea}>
        {priorRecapSlot}
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            ref={index === messages.length - 1 ? lastMessageRef : undefined}
          >
            <WaMessageRow msg={msg} />
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-800/90 rounded-2xl rounded-bl-md px-3.5 py-3 flex items-center gap-2 border border-stone-700/40">
              <Loader2 size={14} className="text-teal-400 animate-spin" />
              <span className="text-xs text-stone-400">...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 px-1">
            <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-snug">{error}</p>
          </div>
        )}

        {footerSlot && <div className="pt-1">{footerSlot}</div>}

        {inlineSlot ? <div className="pt-2 pb-1">{inlineSlot}</div> : null}

        <div ref={bottomRef} />
      </div>

      <div className={`${inputBar} shrink-0`}>
        <div className={inputWrap}>
          {voiceEnabled && voiceSupported && (
            <button
              type="button"
              onClick={voiceListening ? onVoiceStop : onVoiceStart}
              disabled={loading}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-colors ${
                voiceListening
                  ? 'bg-rose-600/90 text-white animate-pulse'
                  : 'bg-stone-700 text-amber-100 hover:bg-stone-600'
              }`}
              title={voiceListening ? 'Ferma ascolto' : 'Parla'}
              aria-label={voiceListening ? 'Ferma microfono' : 'Attiva microfono'}
            >
              {voiceListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={inputPlaceholder}
            rows={1}
            className={
              overlay
                ? 'flex-1 bg-transparent text-sm text-amber-50 placeholder-stone-500 resize-none outline-none leading-relaxed'
                : 'flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none outline-none leading-relaxed'
            }
            style={{ maxHeight: '96px' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 96)}px`;
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim() || loading}
            className={
              overlay
                ? 'w-9 h-9 rounded-full bg-teal-800 hover:bg-teal-700 disabled:opacity-40 flex items-center justify-center shrink-0 mb-0.5'
                : 'w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 flex items-center justify-center shrink-0 mb-0.5'
            }
          >
            <Send size={14} className={input.trim() && !loading ? 'text-white' : 'text-stone-500'} />
          </button>
        </div>
        {voiceListening && (
          <p className="text-[10px] text-teal-400/90 text-center mt-1.5">In ascolto… parla ora</p>
        )}
        {(mode === 'trip' || mode === 'onboarding') && !voiceListening && (
          <p className={`text-[10px] text-center mt-1.5 ${overlay ? 'text-stone-500' : 'text-slate-400'}`}>
            Invio con Enter
            {voiceSupported ? ' · microfono attivo dopo ogni risposta' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
