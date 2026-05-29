/**
 * Preference block title row — headline left, discrete action link top-right.
 */

type Props = {
  headline: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
};

export default function PreferencesPanelHeader({
  headline,
  actionLabel,
  onAction,
  disabled,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-sm font-semibold text-amber-100 leading-snug flex-1 min-w-0">
        {headline}
      </h2>
      {actionLabel && onAction ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onAction}
          className="shrink-0 text-xs text-amber-500/85 hover:text-amber-300 lowercase tracking-normal pt-0.5 disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
