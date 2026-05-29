import type { InternetSectionData } from '../../types/dayPage';
import DaySection from './DaySection';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

type Props = {
  data: InternetSectionData;
  open: boolean;
  onToggle: () => void;
};

/** Standalone mobile coverage section. */
export default function DayInternetSection({ data, open, onToggle }: Props) {
  const Icon =
    data.coverage === 'good' ? Wifi : data.coverage === 'medium' ? AlertTriangle : WifiOff;
  const iconClass =
    data.coverage === 'good'
      ? 'text-emerald-500'
      : data.coverage === 'medium'
      ? 'text-amber-500'
      : 'text-stone-400';

  return (
    <DaySection
      title="Internet"
      icon={<Icon size={20} className={iconClass} strokeWidth={2} />}
      iconBg="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
      summary={`Copertura ${data.coverageLabel.toLowerCase()}`}
      open={open}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <p className="text-sm font-semibold text-stone-800">
          Copertura mobile: <span className="text-sky-700">{data.coverageLabel}</span>
        </p>

        {data.deadZones.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Zone senza segnale
            </p>
            <ul className="space-y-1.5">
              {data.deadZones.map((z) => (
                <li key={z} className="text-sm text-stone-600 leading-relaxed">{z}</li>
              ))}
            </ul>
          </div>
        )}

        {data.wifiHotspots.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Hotspot Wi‑Fi utili
            </p>
            <ul className="space-y-1.5">
              {data.wifiHotspots.map((h) => (
                <li key={h} className="text-sm text-stone-600">{h}</li>
              ))}
            </ul>
          </div>
        )}

        {data.tips.length > 0 && (
          <ul className="space-y-2">
            {data.tips.map((tip) => (
              <li
                key={tip}
                className="text-sm text-stone-600 leading-relaxed bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5"
              >
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DaySection>
  );
}
