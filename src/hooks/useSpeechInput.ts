/**
 * Browser speech-to-text (Web Speech API). Auto-listen after assistant reply when enabled.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type UseSpeechInputOptions = {
  onTranscript: (text: string) => void;
  /** When true, starts listening once after each assistant turn (loading → false). */
  autoListenAfterReply?: boolean;
  assistantReadySignal?: number;
  disabled?: boolean;
};

export function useSpeechInput({
  onTranscript,
  autoListenAfterReply = false,
  assistantReadySignal = 0,
  disabled = false,
}: UseSpeechInputOptions) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => getRecognitionCtor() != null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (disabled || !supported) return;
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    stop();
    const rec = new Ctor();
    rec.lang = 'it-IT';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (text) onTranscriptRef.current(text);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [disabled, supported, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (!autoListenAfterReply || disabled || !supported || assistantReadySignal === 0) return;
    const t = window.setTimeout(() => startListening(), 400);
    return () => window.clearTimeout(t);
  }, [assistantReadySignal, autoListenAfterReply, disabled, supported, startListening]);

  return { supported, listening, startListening, stopListening: stop };
}
