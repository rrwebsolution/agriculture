import { useEffect, useState, useRef } from 'react';
import standardAxios from 'axios';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudSun, Wind,
  Droplets, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw,
  ThermometerSun, Sprout, ChevronLeft, ChevronRight
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
  bg: string;
  border: string;
  badge: string;
  indicator: string;
}

const getRisk = (day: DayForecast): RiskInfo => {
  const rain = day.totalRainMm;
  const cond = day.condMain;
  const wind = day.maxWindKph;

  if (cond === 'Thunderstorm' || rain >= 50) return {
    level: 'extreme',
    label: 'Extreme Risk',
    hazards: ['Flash floods', 'Landslides', 'Crop damage'],
    bg: 'bg-gradient-to-br from-rose-50 to-rose-100/80 dark:from-rose-950/40 dark:to-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800/50',
    badge: 'bg-rose-200/50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
    indicator: 'bg-rose-500',
  };
  if (rain >= 25 || (cond === 'Rain' && rain >= 15)) return {
    level: 'high',
    label: 'High Risk',
    hazards: ['Flooding likely', 'Soil erosion', 'Watch drains'],
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100/80 dark:from-orange-950/40 dark:to-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800/50',
    badge: 'bg-orange-200/50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
    indicator: 'bg-orange-500',
  };
  if (rain >= 7.5 || cond === 'Drizzle' || wind > 40) return {
    level: 'moderate',
    label: 'Moderate Risk',
    hazards: ['Light flooding', 'Wind advisory'],
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/50',
    badge: 'bg-amber-200/50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    indicator: 'bg-amber-500',
  };
  if (rain > 0) return {
    level: 'low',
    label: 'Low Risk',
    hazards: ['Light rain', 'Good for crops'],
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800/50',
    badge: 'bg-blue-200/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    indicator: 'bg-blue-500',
  };
  return {
    level: 'safe',
    label: 'Optimal',
    hazards: ['Perfect conditions', 'Safe to spray'],
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/80 dark:from-emerald-950/40 dark:to-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    badge: 'bg-emerald-200/50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    indicator: 'bg-emerald-500',
  };
};

const condIcon = (cond: string, size = 14) => {
  if (cond === 'Clear')        return <Sun size={size} className="text-amber-500 drop-shadow-md" />;
  if (cond === 'Thunderstorm') return <CloudLightning size={size} className="text-purple-600 drop-shadow-md" />;
  if (cond === 'Rain')         return <CloudRain size={size} className="text-blue-500 drop-shadow-md" />;
  if (cond === 'Drizzle')      return <CloudRain size={size} className="text-sky-500 drop-shadow-md" />;
  if (cond === 'Clouds')       return <Cloud size={size} className="text-slate-400 drop-shadow-md" />;
  return <CloudSun size={size} className="text-amber-500 drop-shadow-md" />;
};

const riskIcon = (level: RiskLevel) => {
  if (level === 'extreme') return <ShieldAlert size={10} />;
  if (level === 'high')    return <AlertTriangle size={10} />;
  if (level === 'moderate') return <AlertTriangle size={10} />;
  return <CheckCircle2 size={10} />;
};

const StatRow = ({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
      {icon}
      <span className="text-[9px] font-medium">{title}</span>
    </div>
    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">{text}</span>
  </div>
);

interface Props {
  lat?: number;
  lon?: number;
}

// 4 cards visible at a time
const VISIBLE = 4;

export default function DashboardWeatherForecast({ lat, lon }: Props) {
  const [days, setDays] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchForecast = async (la: number, lo: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await standardAxios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${la}&lon=${lo}&appid=${import.meta.env.VITE_OPENWEATHERMAP_KEY}&units=metric`
      );

      const map = new Map<string, any[]>();
      for (const slot of res.data.list) {
        const d = new Date(slot.dt * 1000);
        const key = d.toLocaleDateString('en-CA');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(slot);
      }

      const today    = new Date().toLocaleDateString('en-CA');
      const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');

      const result: DayForecast[] = [];
      for (const [key, slots] of map) {
        if (result.length >= 5) break;
        const temps  = slots.map((s: any) => s.main.temp);
        const rains  = slots.map((s: any) => (s.rain?.['3h'] ?? 0) as number);
        const winds  = slots.map((s: any) => (s.wind?.speed ?? 0) * 3.6);
        const humids = slots.map((s: any) => s.main.humidity ?? 0);

        const worst = slots.sort((a: any, b: any) => {
          const rank = (c: string) =>
            c === 'Thunderstorm' ? 4 : c === 'Rain' ? 3 : c === 'Drizzle' ? 2 : c === 'Clouds' ? 1 : 0;
          return rank(b.weather[0].main) - rank(a.weather[0].main);
        })[0];

        const date  = new Date(key + 'T12:00:00');
        const label = key === today ? 'Today' : key === tomorrow ? 'Tomorrow'
          : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        result.push({
          date,
          label,
          condMain:    worst.weather[0].main,
          condDesc:    worst.weather[0].description,
          tempMin:     Math.round(Math.min(...temps)),
          tempMax:     Math.round(Math.max(...temps)),
          totalRainMm: Math.round(rains.reduce((a: number, b: number) => a + b, 0) * 10) / 10,
          maxWindKph:  Math.round(Math.max(...winds)),
          maxHumidity: Math.round(Math.max(...humids)),
          slots:       slots.length,
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
    if (lat && lon) fetchForecast(lat, lon);
    else fetchForecast(8.8222485, 125.1158747);
  }, [lat, lon]);

  const handleScroll = () => {
    if (!scrollRef.current || days.length === 0) return;
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const cardWidth = scrollWidth / days.length;
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(index, Math.max(0, days.length - VISIBLE)));
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current && days.length > 0) {
      const cardWidth = scrollRef.current.scrollWidth / days.length;
      scrollRef.current.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    }
  };

  const highRiskDays = days.filter(d => ['extreme', 'high'].includes(getRisk(d).level));
  const maxIndex     = Math.max(0, days.length - VISIBLE);

  return (
    <div className="relative bg-white dark:bg-slate-900/80 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden backdrop-blur-xl group">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <Sprout size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">5-Day Agricultural Forecast</h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Weather risk monitoring & crop advisory
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchForecast(lat ?? 8.8222485, lon ?? 125.1158747)}
          disabled={loading}
          className="shrink-0 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* High-risk alert banner */}
      {!loading && highRiskDays.length > 0 && (
        <div className="mx-5 mt-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-linear-to-r from-rose-50 to-white dark:from-rose-500/10 dark:to-slate-900/50 p-3.5 flex items-start gap-3 shadow-sm">
          <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 rounded-full text-rose-600 dark:text-rose-400 animate-pulse">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-rose-700 dark:text-rose-400">
              Agricultural Hazard Alert — {highRiskDays.length} High-Risk {highRiskDays.length === 1 ? 'Day' : 'Days'}
            </h4>
            <p className="text-[11px] font-medium text-rose-600/80 dark:text-rose-300 mt-1 leading-relaxed">
              Advise farmers near danger zones.{' '}
              <strong className="font-bold">{highRiskDays.map(d => d.label).join(' and ')}</strong> show elevated precipitation.
            </p>
          </div>
        </div>
      )}

      {/* Carousel body */}
      <div className="relative p-5">
        {error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 mb-1">
              <CloudSun size={32} />
            </div>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Forecast Unavailable</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Unable to connect to the weather network.</p>
          </div>
        ) : loading ? (
          <div className="flex gap-2 pb-6">
            {Array.from({ length: VISIBLE }).map((_, i) => (
              <div key={i} className="shrink-0 w-[calc(25%-0.375rem)] rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-10 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
                    <div className="h-2 w-14 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse delay-75" />
                  </div>
                  <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse delay-150" />
                </div>
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse delay-75" />
                <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse delay-100" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* SCROLLABLE CARDS — rendered first so arrows sit on top */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {days.map((day, idx) => {
                const risk = getRisk(day);
                return (
                  <div
                    key={idx}
                    className={cn(
                      'snap-start shrink-0 w-[calc(25%-0.375rem)] group/card relative flex flex-col rounded-2xl border p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/40 overflow-hidden',
                      risk.bg, risk.border
                    )}
                  >
                    <div className="absolute -right-6 -top-6 w-16 h-16 bg-white/40 dark:bg-white/5 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700 pointer-events-none" />

                    {/* Label + icon */}
                    <div className="flex items-start justify-between mb-1.5 relative z-10">
                      <div>
                        <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{day.label}</h4>
                        <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400 capitalize mt-0.5 leading-tight">{day.condDesc}</p>
                      </div>
                      <div className="p-1 rounded-lg bg-white/60 dark:bg-slate-900/50 border border-white/40 dark:border-white/10">
                        {condIcon(day.condMain, 13)}
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-baseline gap-1 mb-1.5 relative z-10">
                      <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white leading-none">{day.tempMax}°</span>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                        <ThermometerSun size={9} className="text-slate-300" />
                        {day.tempMin}°
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col gap-0.5 mb-1.5 p-1.5 rounded-xl bg-white/50 dark:bg-slate-950/30 border border-white/50 dark:border-white/5 relative z-10">
                      <StatRow title="Rain"  icon={<Droplets size={9} className="text-blue-500" />}  text={`${day.totalRainMm} mm`} />
                      <StatRow title="Wind"  icon={<Wind size={9} className="text-teal-500" />}       text={`${day.maxWindKph} km/h`} />
                      <StatRow title="Humid" icon={<CloudRain size={9} className="text-sky-400" />}   text={`${day.maxHumidity}%`} />
                    </div>

                    {/* Risk badge + hazards */}
                    <div className="mt-auto relative z-10">
                      <div className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide mb-1', risk.badge)}>
                        {riskIcon(risk.level)}
                        {risk.label}
                      </div>
                      <ul className="space-y-0.5">
                        {risk.hazards.map((h, i) => (
                          <li key={i} className="text-[8px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <span className={cn('w-1 h-1 rounded-full shrink-0', risk.indicator)} />
                            <span className="truncate">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LEFT ARROW — after scroll container so it renders on top */}
            <button
              onClick={() => scrollTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="absolute left-1 top-1/2 -translate-y-5 z-20 h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full shadow-lg transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none hover:scale-110 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() => scrollTo(currentIndex + 1)}
              disabled={currentIndex >= maxIndex}
              className="absolute right-1 top-1/2 -translate-y-5 z-20 h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full shadow-lg transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none hover:scale-110 text-slate-700 dark:text-slate-300"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>

            {/* PAGINATION DOTS */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {Array.from({ length: Math.max(1, days.length - VISIBLE + 1) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={cn(
                    'h-1 transition-all duration-300 rounded-full cursor-pointer hover:bg-slate-500',
                    currentIndex === i
                      ? 'w-6 bg-slate-800 dark:bg-slate-200'
                      : 'w-3 bg-slate-300 dark:bg-slate-600'
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
