/**
 * Long-press gesture — tap vs hold (mobile-friendly detail reveal).
 */
import { useCallback, useRef, type MouseEvent, type PointerEvent } from 'react';

const DEFAULT_MS = 450;

type Options = {
  onLongPress: () => void;
  onTap?: () => void;
  delayMs?: number;
  disabled?: boolean;
};

export function useLongPress({
  onLongPress,
  onTap,
  delayMs = DEFAULT_MS,
  disabled = false,
}: Options) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pointerHandlers = {
    onPointerDown: (e: PointerEvent) => {
      if (disabled || e.button > 0) return;
      longPressFiredRef.current = false;
      clearTimer();
      timerRef.current = setTimeout(() => {
        longPressFiredRef.current = true;
        onLongPress();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(12);
        }
      }, delayMs);
    },
    onPointerUp: () => clearTimer(),
    onPointerLeave: () => clearTimer(),
    onPointerCancel: () => clearTimer(),
    onContextMenu: (e: MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      longPressFiredRef.current = true;
      onLongPress();
    },
  };

  const onClick = (e: MouseEvent) => {
    if (disabled) return;
    if (longPressFiredRef.current) {
      e.preventDefault();
      longPressFiredRef.current = false;
      return;
    }
    onTap?.();
  };

  return { pointerHandlers, onClick };
}

/** Grid columns so buttons fill row width (2–4 per row). */
export function preferenceGridCols(count: number): string {
  if (count <= 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-3';
  return 'grid-cols-4';
}
