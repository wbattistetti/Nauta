/**
 * Formattazione costi stimati AI (EUR / centesimi).
 */

export function formatCostEur(eur: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? (eur < 0.01 && eur > 0 ? 4 : 3);
  if (!Number.isFinite(eur) || eur <= 0) return '€0';
  if (eur < 0.01) return `€${eur.toFixed(decimals)}`;
  if (eur < 1) return `${(eur * 100).toFixed(1)}¢`;
  return `€${eur.toFixed(2)}`;
}

export function formatCostUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return '$0';
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}

export function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
