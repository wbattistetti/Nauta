/**
 * Cost badges for sticky Nauta header: current turn + session total.
 */
import { formatCostEur } from '../../domain/aiCost/formatCost';
import type { AiCallRecord, AiCallsTotals } from '../../services/aiCallsApi';

type Props = {
  lastCall: AiCallRecord | null;
  totals: AiCallsTotals;
};

export default function StickyAiCostBadge({ lastCall, totals }: Props) {
  if (!lastCall && totals.count === 0) return null;

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      {lastCall && (
        <span
          className="text-[10px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 rounded-md px-1.5 py-0.5"
          title={`Turno · ${lastCall.modelId}`}
        >
          {formatCostEur(lastCall.costEur)}
          {!lastCall.pricingFound && ' ?'}
        </span>
      )}
      {totals.count > 0 && (
        <span className="text-[10px] text-amber-500/80" title="Totale sessione">
          Σ {formatCostEur(totals.costEur)}
        </span>
      )}
    </div>
  );
}
