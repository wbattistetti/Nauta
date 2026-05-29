export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function getTodayDayNumber(): number {
  const today = new Date();
  const tripStart = new Date('2025-05-20');
  const diff = Math.floor((today.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
  if (diff >= 0 && diff < 21) return diff + 1;
  return 1;
}
