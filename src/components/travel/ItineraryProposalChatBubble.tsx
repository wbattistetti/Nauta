/**
 * Interactive assistant bubble when the itinerary proposal message is shown.
 */
import type { ReactNode } from 'react';
import { Eye, Puzzle } from 'lucide-react';
import {
  ITINERARY_ACCORDION_TITLE_ACTION,
  ITINERARY_PROPOSAL_CHAT_SHORT,
  PREFERENCES_ACCORDION_TITLE_ACTION,
} from '../../lib/travel/itineraryCopy';

type Props = {
  onOpenItinerary: () => void;
  onOpenPreferences: () => void;
  itineraryDisabled?: boolean;
};

/** Whether a chat message is the canonical itinerary proposal string. */
export function isItineraryProposalMessage(content: string): boolean {
  return content.trim() === ITINERARY_PROPOSAL_CHAT_SHORT.trim();
}

function ActionLink({
  onClick,
  disabled,
  ariaLabel,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  ariaLabel: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline font-inherit text-inherit underline decoration-amber-500/75 underline-offset-[3px] hover:text-amber-50 hover:decoration-amber-400/90 disabled:opacity-45 disabled:no-underline disabled:cursor-not-allowed touch-manipulation"
    >
      <span className="inline-flex items-baseline gap-0.5">
        {children}
        {icon ? (
          <span className="inline-flex shrink-0 self-center text-amber-200/90" aria-hidden>
            {icon}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export default function ItineraryProposalChatBubble({
  onOpenItinerary,
  onOpenPreferences,
  itineraryDisabled,
}: Props) {
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      <p>
        Ho pensato ad un{' '}
        <ActionLink
          onClick={onOpenItinerary}
          disabled={itineraryDisabled}
          label={ITINERARY_ACCORDION_TITLE_ACTION}
          ariaLabel={`${ITINERARY_ACCORDION_TITLE_ACTION} l'itinerario proposto`}
          icon={<Eye size={13} strokeWidth={1.75} />}
        >
          itinerario
        </ActionLink>
        , bilanciando vari{' '}
        <ActionLink
          onClick={onOpenPreferences}
          label={PREFERENCES_ACCORDION_TITLE_ACTION}
          ariaLabel={`${PREFERENCES_ACCORDION_TITLE_ACTION} i fattori del viaggio`}
          icon={<Puzzle size={13} strokeWidth={1.75} />}
        >
          fattori
        </ActionLink>
        .
      </p>
      <p>
        <ActionLink
          onClick={onOpenItinerary}
          disabled={itineraryDisabled}
          label="Guarda"
          ariaLabel="Guarda l'itinerario proposto"
        >
          Guarda
        </ActionLink>{' '}
        se ti piace!
      </p>
    </div>
  );
}
