/**
 * Floating chat button — visible in fullscreen itinerary mode (bottom-right).
 */
import { createPortal } from 'react-dom';
import { MessageCircle } from 'lucide-react';

type Props = {
  open: boolean;
  onClick: () => void;
};

export default function PlanningChatFab({ open, onClick }: Props) {
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Chiudi conversazione' : 'Apri conversazione'}
      aria-expanded={open}
      className={`fixed z-[92] pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border shadow-lg shadow-black/45 touch-manipulation transition-colors ${
        open
          ? 'bg-teal-900/95 border-teal-600/50 text-teal-50'
          : 'bg-stone-950/92 border-amber-900/45 text-amber-100 hover:bg-stone-900'
      }`}
      style={{
        right: 'max(0.75rem, env(safe-area-inset-right))',
        bottom: 'calc(max(0.75rem, env(safe-area-inset-bottom)) + 0.75rem)',
      }}
    >
      <MessageCircle size={22} strokeWidth={1.75} aria-hidden />
    </button>,
    document.body
  );
}
