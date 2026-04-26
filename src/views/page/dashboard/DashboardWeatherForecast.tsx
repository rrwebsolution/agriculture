import { useEffect, useState } from 'react';
import standardAxios from 'axios';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudSun, Wind,
  Droplets, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface DayForecast {
  date: Date;
  label: string;
  condMain: string;
  condDesc: string;
  tempMin: number;
  tempMax: number;
  totalRainMm: number;
  maxWindKph: number;
  maxHumidity: number;
  slots: number;
}

type RiskLevel = 'extreme' | 'high' | 'moderate' | 'low' | 'safe';

interface RiskInfo {
  level: RiskLevel;
  label: string;
  hazards: string[];
  color: string;
  bg: string;
  border: string;
  dark: string;
}

const getRisk = (day: DayForecast): RiskInfo => {
  const rain = day.totalRainMm;
  const cond = day.condMain;
  const wind = day.maxWindKph;

  if (cond === 'Thunderstorm' || rain >= 50) return {
    level: 'extreme',
    label: 'Extreme Risk',
    hazards: ['Flash flood', 'Landslide', 'Strong winds', 'Crop damage'],
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/30',
    dark: 'dark:text-rose-400',
  };
  if (rain >= 25 || (cond === 'Rain' && rain >= 15)) return {
    level: 'high',
    label: 'High Risk',
    hazards: ['Possible flooding', 'Landslide watch', 'Soil erosion'],
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/30',
    dark: 'dark:text-orange-400',
  };
  if (rain >= 7.5 || cond === 'Drizzle' || wind > 40) return {
    level: 'moderate',
    label: 'Moderate Risk',
    hazards: ['Light flooding possible', 'Monitor drainage', 'Wind advisory'],
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
    dark: 'dark:text-amber-400',
  };
  if (rain > 0) return {
    level: 'low',
    label: 'Low Risk',
    hazards: ['Light rain', 'Good for irrigation'],
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/30',
    dark: 'dark:text-blue-400',
  };
  return {
    level: 'safe',
    label: 'Clear / Safe',
    hazards: ['Favorable farming conditions'],
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    dark: 'dark:text-emerald-400',
  };
};

const condIcon = (cond: string, size = 22) => {
  if (cond === 'Clear')       return <Sun size={size} className="text-amber-400" />;
  if (cond === 'Thunderstorm') return <CloudLightning size={size} className="text-purple-500" />;
  if (cond === 'Rain')        return <CloudRain size={size} className="text-blue-500" />;
  if (cond === 'Drizzle')     return <CloudRain size={size} className="text-sky-400" />;
  if (cond === 'Clouds')      return <Cloud size={size} className="text-slate-400" />;
  return <CloudSun size={size} className="text-amber-400" />;
};

const riskIcon = (level: RiskLevel) => {
  if (level === 'extreme') return <ShieldAlert size={14} />;
  if (level === 'high')    return <AlertTriangle size={14} />;
  if (level === 'moderate') return <AlertTriangle size={14} />;
  return <CheckCircle2 size={14} />;
};

interface Props {
  lat?: number;
  lon?: number;
}

export default function DashboardWeatherForecast({ lat, lon }: Props) {
  const [days, setDays] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchForecast = async (la: number, lo: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await standardAxios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${la}&lon=${lo}&appid=${import.meta.env.VITE_OPENWEATHERMAP_KEY}&units=metric`
      );

      // Group 3-hour slots by local date
      const map = new Map<string, any[]>();
      for (const slot of res.data.list) {
        const d = new Date(slot.dt * 1000);
        const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(slot);
      }

      const today = new Date().toLocaleDateString('en-CA');
      const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');

      const result: DayForecast[] = [];
      for (const [key, slots] of map) {
        if (result.length >= 5) break;
        const temps = slots.map((s: any) => s.main.temp);
        const rains = slots.map((s: any) => (s.rain?.['3h'] ?? 0) as number);
        const winds = slots.map((s: any) => (s.wind?.speed ?? 0) * 3.6);
        const humids = slots.map((s: any) => s.main.humidity ?? 0);

        // pick the worst condition slot for the day label
        const worst = slots.sort((a: any, b: any) => {
          const rank = (c: string) =>
            c === 'Thunderstorm' ? 4 : c === 'Rain' ? 3 : c === 'Drizzle' ? 2 : c === 'Clouds' ? 1 : 0;
          return rank(b.weather[0].main) - rank(a.weather[0].main);
        })[0];

        const date = new Date(key + 'T12:00:00');
        const label = key === today ? 'Today' : key === tomorrow ? 'Tomorrow'
          : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        result.push({
          date,
          label,
          condMain: worst.weather[0].main,
          condDesc: worst.weather[0].description,
          tempMin: Math.round(Math.min(...temps)),
          tempMax: Math.round(Math.max(...temps)),
          totalRainMm: Math.round(rains.reduce((a: number, b: number) => a + b, 0) * 10) / 10,
          maxWindKph: Math.round(Math.max(...winds)),
          maxHumidity: Math.round(Math.max(...humids)),
          slots: slots.length,
        });
      }

      setDays(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lat && lon) {
      fetchForecast(lat, lon);
    } else {
      fetchForecast(8.8222485, 125.1158747);
    }
  }, [lat, lon]);

  const highRiskDays = days.filter(d => ['extreme', 'high'].includes(getRisk(d).level));

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">5-Day Agricultural Weather Forecast</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
            Upcoming weather risk monitoring · Flood, Landslide & Crop Advisory
          </p>
        </div>
        <button
          onClick={() => fetchForecast(lat ?? 8.8222485, lon ?? 125.1158747)}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* High-risk alert banner */}
      {!loading && highRiskDays.length > 0 && (
        <div className="mx-6 mt-5 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-5 py-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
              ⚠ Agricultural Hazard Alert — {highRiskDays.length} high-risk {highRiskDays.length === 1 ? 'day' : 'days'} detected
            </p>
            <p className="text-[11px] font-bold text-rose-700/80 dark:text-rose-300 mt-1">
              Farmers near landslide and flood danger zones should be advised.{' '}
              {highRiskDays.map(d => d.label).join(' and ')} show elevated precipitation risk.
            </p>
          </div>
        </div>
      )}

      <div className="p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <CloudSun size={32} className="text-gray-200 dark:text-slate-700" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Forecast unavailable</p>
            <p className="text-[11px] font-bold text-gray-400">Check your API key or internet connection.</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 p-4 flex flex-col gap-3 animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-slate-700" />
                  <div className="space-y-1 text-right">
                    <div className="h-5 w-10 bg-gray-200 dark:bg-slate-700 rounded ml-auto" />
                    <div className="h-3 w-6 bg-gray-200 dark:bg-slate-700 rounded ml-auto" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-4/5 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-3/5 bg-gray-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-8 w-full bg-gray-200 dark:bg-slate-700 rounded-xl" />
                <div className="space-y-1">
                  <div className="h-2 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 w-2/3 bg-gray-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {days.map((day, idx) => {
              const risk = getRisk(day);
              return (
                <div
                  key={idx}
                  className={cn(
                    'rounded-[1.5rem] border p-4 flex flex-col gap-3 transition-all',
                    risk.bg, risk.border
                  )}
                >
                  {/* Day label */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">{day.label}</p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 capitalize mt-0.5">{day.condDesc}</p>
                  </div>

                  {/* Weather icon */}
                  <div className="flex items-center justify-between">
                    {condIcon(day.condMain, 28)}
                    <div className="text-right">
                      <p className="text-base font-black text-gray-800 dark:text-white">{day.tempMax}°</p>
                      <p className="text-[10px] font-bold text-gray-400">{day.tempMin}°</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Droplets size={11} className="text-blue-400 shrink-0" />
                      <span>{day.totalRainMm > 0 ? `${day.totalRainMm} mm rain` : 'No rain'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wind size={11} className="text-slate-400 shrink-0" />
                      <span>{day.maxWindKph} km/h wind</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets size={11} className="text-cyan-400 shrink-0" />
                      <span>{day.maxHumidity}% humidity</span>
                    </div>
                  </div>

                  {/* Risk badge */}
                  <div className={cn('flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', risk.color, risk.dark)}>
                    {riskIcon(risk.level)}
                    {risk.label}
                  </div>

                  {/* Hazard list */}
                  <ul className="space-y-1">
                    {risk.hazards.map((h, i) => (
                      <li key={i} className={cn('text-[9px] font-bold uppercase tracking-widest flex items-center gap-1', risk.color, risk.dark)}>
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'currentColor' }} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
