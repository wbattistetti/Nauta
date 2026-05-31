/**
 * Persists hero chip tutor dismiss — acknowledged once user taps Sì.
 */
const KEY = 'nauta:planning-chip-tutor';

type ChipTutorState = { acknowledged: boolean };

function read(): ChipTutorState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { acknowledged: false };
    const parsed = JSON.parse(raw) as Partial<ChipTutorState>;
    return { acknowledged: Boolean(parsed.acknowledged) };
  } catch {
    return { acknowledged: false };
  }
}

function write(state: ChipTutorState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

/** Whether the chip tutor block should still be shown. */
export function isPlanningChipTutorAcknowledged(): boolean {
  return read().acknowledged;
}

/** Dismiss chip tutor permanently (user tapped Sì). */
export function markPlanningChipTutorAcknowledged(): void {
  write({ acknowledged: true });
}
