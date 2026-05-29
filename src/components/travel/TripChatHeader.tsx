/**
 * Trip title — inline in chat or chip overlay on the destination photo hero.
 */
import ItineraryRecalculateIcon from './ItineraryRecalculateIcon';

type Props = {
  title: string;
  subtitle?: string | null;
  itineraryStale?: boolean;
  onRecalculate?: () => void;
  recalculateLoading?: boolean;
  recalculateDisabled?: boolean;
  /** chip = rounded overlay on hero photo */
  variant?: 'inline' | 'chip';
};

export default function TripChatHeader({
  title,
  subtitle,
  itineraryStale,
  onRecalculate,
  recalculateLoading,
  recalculateDisabled,
  variant = 'inline',
}: Props) {
  const chip = variant === 'chip';

  const inner = (
    <>
      <div className="flex items-center justify-center gap-1.5">
        <h2
          className={`font-semibold text-amber-50 tracking-wide leading-snug ${
            chip ? 'text-sm sm:text-[15px]' : 'text-sm sm:text-base'
          }`}
        >
          {title}
        </h2>
        {onRecalculate ? (
          <ItineraryRecalculateIcon
            stale={Boolean(itineraryStale)}
            onRecalculate={onRecalculate}
            disabled={recalculateDisabled}
            loading={recalculateLoading}
          />
        ) : null}
      </div>
      {subtitle ? (
        <p
          className={`text-amber-300/95 mt-1 tabular-nums ${
            chip ? 'text-[11px]' : 'text-[11px] text-amber-400/90 mt-0.5'
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </>
  );

  if (chip) {
    return (
      <div
        className="w-full max-w-md mx-auto text-center rounded-2xl border border-amber-900/35 bg-stone-950/[0.94] px-4 py-2.5 shadow-xl shadow-black/50"
        role="group"
        aria-label={title}
      >
        {inner}
      </div>
    );
  }

  return <div className="text-center py-1 px-1">{inner}</div>;
}
