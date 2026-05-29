/**
 * Tri-state preference chip — main tap (include), corner X toggles exclude.
 */
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLongPress } from '../../hooks/useLongPress';
import type { PreferenceVisualState } from '../../lib/travel/preferenceUi';

type Props = {
  label: string;
  Icon: LucideIcon;
  state: PreferenceVisualState;
  disabled?: boolean;
  onMainClick: () => void;
  onExcludeToggle: () => void;
  onLongPress?: () => void;
};

function stateClasses(state: PreferenceVisualState): string {
  switch (state) {
    case 'included':
      return 'border-emerald-600/75 bg-emerald-950/45 text-emerald-50 shadow-[0_0_12px_rgba(52,211,153,0.18)]';
    case 'excluded':
      return 'border-red-600/80 bg-red-950/35 text-red-100/90';
    default:
      return 'border-amber-900/35 bg-stone-950/50 text-amber-200/70 active:bg-stone-900/80';
  }
}

function iconColor(state: PreferenceVisualState): string {
  if (state === 'included') return 'text-emerald-300';
  if (state === 'excluded') return 'text-red-300/80';
  return 'text-amber-500/80';
}

export default function PreferenceIcon({
  label,
  Icon,
  state,
  disabled,
  onMainClick,
  onExcludeToggle,
  onLongPress,
}: Props) {
  const { pointerHandlers, onClick } = useLongPress({
    onTap: onMainClick,
    onLongPress: onLongPress ?? (() => {}),
    disabled: disabled || !onLongPress,
  });

  const excluded = state === 'excluded';

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        {...(onLongPress ? pointerHandlers : {})}
        className={[
          'w-full flex flex-col items-center justify-center gap-1.5 px-1.5 py-2.5 rounded-xl border transition-all touch-manipulation select-none',
          stateClasses(state),
        ].join(' ')}
        aria-pressed={state === 'included' ? true : state === 'excluded' ? 'mixed' : false}
        aria-label={
          excluded ? `${label}, esclusa` : state === 'included' ? `${label}, inclusa` : label
        }
      >
        <Icon size={22} strokeWidth={1.75} className={iconColor(state)} aria-hidden />
        <span className="text-[10px] font-medium leading-tight text-center line-clamp-2">{label}</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        aria-label={excluded ? `Reincludi ${label}` : `Escludi ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          onExcludeToggle();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={[
          'absolute bottom-1 right-1 flex items-center justify-center w-[1.35rem] h-[1.35rem]',
          'rounded-md border bg-stone-950/90 pointer-events-auto touch-manipulation',
          'transition-colors hover:bg-stone-900',
          excluded
            ? 'border-red-800/60'
            : 'border-amber-900/50 opacity-80 hover:opacity-100',
        ].join(' ')}
      >
        <X
          size={11}
          strokeWidth={2.25}
          className={excluded ? 'text-red-500/85' : 'text-red-600/55'}
          aria-hidden
        />
      </button>
    </div>
  );
}
