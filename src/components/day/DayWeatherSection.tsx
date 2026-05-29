import type { WeatherSectionData } from '../../types/dayPage';
import DaySection from './DaySection';
import { CloudSun, ExternalLink } from 'lucide-react';
import { weatherIcon } from '../../lib/weatherIcon';

type Props = {
  weather: WeatherSectionData;
  weatherCode: number | null;
  open: boolean;
  onToggle: () => void;
};

/** Weather only — no internet/coverage content. */
export default function DayWeatherSection({ weather, weatherCode, open, onToggle }: Props) {
  const summary =
    weather.tempC != null && weather.description
      ? `${weather.tempC}°C · ${weather.description}`
      : weather.unavailable
      ? 'Previsione non ancora disponibile'
      : weather.loading
      ? 'Caricamento...'
      : 'Meteo del giorno';

  return (
    <DaySection
      title="Meteo"
      icon={<CloudSun size={20} className="text-amber-500" strokeWidth={2} />}
      iconBg="linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)"
      summary={summary}
      open={open}
      onToggle={onToggle}
    >
      {weather.loading ? (
        <div className="flex items-center gap-3 py-2">
          <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-amber-400 animate-spin" />
          <span className="text-sm text-stone-400">Caricamento meteo...</span>
        </div>
      ) : weather.unavailable ? (
        <div className="space-y-3">
          <p className="text-sm text-stone-600 leading-relaxed">
            La previsione per il {weather.dateLabel} non è ancora nel range dell&apos;API (circa 16
            giorni). Controlla di nuovo più avanti o apri i dettagli esterni.
          </p>
          <a
            href={weather.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            Apri dettagli meteo
            <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            {weather.locationLabel} · {weather.dateLabel}
            {weather.timeWindow ? ` · ${weather.timeWindow}` : ''}
          </p>
          <div className="flex items-center gap-4">
            {weatherCode != null && (
              <span className="text-5xl leading-none">{weatherIcon(weatherCode)}</span>
            )}
            <div>
              {weather.tempC != null && (
                <p className="text-3xl font-bold text-stone-800">{weather.tempC}°C</p>
              )}
              {weather.description && (
                <p className="text-sm text-stone-600 mt-0.5">{weather.description}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {weather.windKmh != null && (
              <div className="bg-stone-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase text-stone-400">Vento</p>
                <p className="text-sm font-bold text-stone-800">{weather.windKmh} km/h</p>
              </div>
            )}
            {weather.precipitationLabel && (
              <div className="bg-stone-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase text-stone-400">Precipitazioni</p>
                <p className="text-sm font-bold text-stone-800">{weather.precipitationLabel}</p>
              </div>
            )}
          </div>
          <a
            href={weather.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            Apri dettagli meteo
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </DaySection>
  );
}
