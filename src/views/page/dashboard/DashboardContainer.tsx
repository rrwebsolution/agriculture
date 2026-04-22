import React, { useState, useEffect } from 'react';
import standardAxios from 'axios';
import appAxios from '../../../plugin/axios';
import {
  Sprout, Wheat, Wallet,
  ArrowUpRight, Activity, CloudSun,
  Thermometer, Plus, ArrowRight,
  Sun, Cloud, CloudRain, CloudLightning,
  Fish, Anchor, Tractor, RefreshCw, ClipboardList, PhilippinePeso,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setFarmerData } from '../../../store/slices/farmerSlice';
import { setFisherfolksData } from '../../../store/slices/fisherfolkSlice';
import { setCropData } from '../../../store/slices/cropSlice';
import { setHarvestData } from '../../../store/slices/harvestSlice';
import { setFisheryData } from '../../../store/slices/fisherySlice';
import { setExpenseData } from '../../../store/slices/expenseSlice';
import QuickActionButton from './QuickActionButton';
import ActivityRow from './ActivityRow';

const fmt = (n: any) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DashboardContainer: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const farmerState = useAppSelector((state: any) => state.farmer);
  const fisherfolkState = useAppSelector((state: any) => state.fisherfolk);
  const cropState = useAppSelector((state: any) => state.crop);
  const harvestState = useAppSelector((state: any) => state.harvest);
  const fisheryState = useAppSelector((state: any) => state.fishery);
  const expenseState = useAppSelector((state: any) => state.expenses);

  // ── Weather ────────────────────────────────────────────────────────────────
  const [weather, setWeather] = useState({
    temp: '--', condition: 'Loading...', city: 'Locating...',
    icon: <CloudSun size={20} />,
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/10',
    lat: undefined as number | undefined,
    lon: undefined as number | undefined,
  });

  useEffect(() => {
    const load = async (lat: number, lon: number) => {
      try {
        const res = await standardAxios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHERMAP_KEY}&units=metric`
        );
        const d = res.data;
        const temp = Math.round(d.main.temp);
        const cond = d.weather[0].main;
        const city = d.name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        let icon = <CloudSun size={20} />;
        let color = 'text-gray-500 bg-gray-100 dark:bg-gray-800';
        if (cond === 'Clear')                       { icon = <Sun size={20} />;         color = 'text-amber-500 bg-amber-100 dark:bg-amber-500/10';   }
        else if (cond === 'Rain' || cond === 'Drizzle') { icon = <CloudRain size={20} />;  color = 'text-blue-500 bg-blue-100 dark:bg-blue-500/10';    }
        else if (cond === 'Thunderstorm')           { icon = <CloudLightning size={20} />; color = 'text-purple-500 bg-purple-100 dark:bg-purple-500/10'; }
        else if (cond === 'Clouds')                 { icon = <Cloud size={20} />;       color = 'text-slate-500 bg-slate-100 dark:bg-slate-800';       }
        setWeather({ temp: String(temp), condition: cond, city, icon, color, lat: d.coord?.lat ?? lat, lon: d.coord?.lon ?? lon });
      } catch {
        setWeather(p => ({ ...p, condition: 'Unavailable', temp: '--', city: 'Offline' }));
      }
    };
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(p => load(p.coords.latitude, p.coords.longitude), () => load(8.8222485, 125.1158747));
    } else {
      load(8.8222485, 125.1158747);
    }
  }, []);

  // ── Data (Redux-cached) ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  const farmers = farmerState.records ?? [];
  const fisherfolks = fisherfolkState.records ?? [];
  const crops = cropState.records ?? [];
  const harvests = harvestState.records ?? [];
  const fisheries = fisheryState.records ?? [];
  const expenses = expenseState.activeRecords ?? [];
  const hasLoadedData =
    farmerState.isLoaded &&
    fisherfolkState.isLoaded &&
    cropState.isLoaded &&
    harvestState.isLoaded &&
    fisheryState.isLoaded &&
    expenseState.isLoaded;

  const fetchAll = async (force = false) => {
    if (!force && hasLoadedData) return;

    setLoading(true);
    const safe = async (fn: () => Promise<any>) => {
      try {
        return await fn();
      } catch {
        return null;
      }
    };

    try {
      const [
        farmerRes,
        barangayRes,
        cropRes,
        coopRes,
        fisherRes,
        harvestRes,
        fisheryRes,
        expenseRes,
      ] = await Promise.all([
        safe(() => appAxios.get('farmers')),
        safe(() => appAxios.get('barangays')),
        safe(() => appAxios.get('crops')),
        safe(() => appAxios.get('cooperatives')),
        safe(() => appAxios.get('fisherfolks')),
        safe(() => appAxios.get('harvests')),
        safe(() => appAxios.get('fisheries')),
        safe(() => appAxios.get('expenses')),
      ]);

      const farmerRecords = farmerRes?.data?.data ?? [];
      const barangays = barangayRes?.data?.data ?? [];
      const cropRecords = cropRes?.data?.data ?? [];
      const cooperatives = coopRes?.data?.data ?? [];
      const fisherfolkRecords = fisherRes?.data?.data ?? [];
      const harvestRecords = harvestRes?.data?.data ?? [];
      const fisheryRecords = fisheryRes?.data?.data ?? [];
      const activeExpenses = expenseRes?.data?.expenses ?? expenseRes?.data?.data ?? [];
      const archivedExpenses = expenseRes?.data?.trashed ?? [];
      const expenseCategories = expenseRes?.data?.categories ?? [];
      const expenseProjects = expenseRes?.data?.projects ?? [];

      const uniqueBarangaysMap = new Map();
      const uniqueCropsMap = new Map();
      const addBarangay = (barangay: any) => {
        if (barangay?.id) uniqueBarangaysMap.set(barangay.id, barangay);
      };
      const addCrop = (crop: any) => {
        if (crop?.id) uniqueCropsMap.set(crop.id, crop);
      };

      harvestRecords.forEach((harvest: any) => {
        addBarangay(harvest.barangay);
        addCrop(harvest.crop);
      });

      farmerRecords.forEach((farmer: any) => {
        addBarangay(farmer.barangay);
        addBarangay(farmer.farm_location);
        addCrop(farmer.crop);
      });

      dispatch(setFarmerData({
        records: farmerRecords,
        barangays,
        crops: cropRecords,
        cooperatives,
      }));
      dispatch(setFisherfolksData({
        records: fisherfolkRecords,
        barangays,
        cooperatives,
      }));
      dispatch(setCropData({ records: cropRecords }));
      dispatch(setHarvestData({
        records: harvestRecords,
        farmers: farmerRecords,
        barangays: Array.from(uniqueBarangaysMap.values()),
        crops: Array.from(uniqueCropsMap.values()),
      }));
      dispatch(setFisheryData(fisheryRecords));
      dispatch(setExpenseData({
        active: activeExpenses,
        archived: archivedExpenses,
        categories: expenseCategories,
        projects: expenseProjects,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [hasLoadedData]);

  // ── Derived values ────────────────────────────────────────────────────────
  const getHarvestCropName = (harvest: any) =>
    typeof harvest.crop === 'string'
      ? harvest.crop
      : harvest.crop?.category ?? harvest.crop_name ?? 'Unknown';

  const getHarvestFarmerName = (harvest: any) => {
    if (typeof harvest.farmer === 'string') return harvest.farmer;
    if (harvest.farmer_name) return harvest.farmer_name;

    const fullName = `${harvest.farmer?.first_name || ''} ${harvest.farmer?.last_name || ''}`.trim();
    return fullName || '—';
  };

  const getHarvestBarangayName = (harvest: any) =>
    typeof harvest.barangay === 'string'
      ? harvest.barangay
      : harvest.barangay?.name ?? harvest.barangay_name ?? '—';

  // Fish yield: field is `yield` (string/number)
  const totalFishYield = fisheries.reduce((s: number, r: any) =>
    s + parseFloat(r.yield ?? r.total_catch ?? r.quantity ?? 0), 0);

  // Top crops by harvest quantity
  const cropTotals: Record<string, number> = {};
  harvests.forEach((h: any) => {
    const name = getHarvestCropName(h);
    cropTotals[name] = (cropTotals[name] ?? 0) + parseFloat(h.quantity ?? 0);
  });
  const sortedCrops = Object.entries(cropTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCrop = sortedCrops[0]?.[1] || 1;
  const cropColors = [
    { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { bar: 'bg-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-500/10'     },
    { bar: 'bg-blue-500',    text: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-500/10'       },
    { bar: 'bg-cyan-500',    text: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-500/10'       },
  ];

  // Recent activities — harvest + fishery merged & sorted by date
  const harvestActs = [...harvests].reverse().slice(0, 10).map((h: any) => ({
    name: getHarvestFarmerName(h),
    loc: getHarvestBarangayName(h),
    task: `Harvested ${getHarvestCropName(h)} (${Number(h.quantity ?? 0).toLocaleString()} kg)`,
    sector: 'Farming',
    time:   h.dateHarvested ?? h.date_harvested ?? h.created_at ?? '',
  }));
  const fishActs = [...fisheries].reverse().slice(0, 10).map((r: any) => ({
    name:   r.name ?? r.fisherfolk_name ?? '—',
    loc:    r.fishing_area ?? r.barangay ?? '—',
    task:   `Caught ${r.catch_species ?? '—'} · ${Number(r.yield ?? 0).toLocaleString()} kg`,
    sector: 'Fishery',
    // field is `date` per FisheryDialog
    time:   r.date ?? r.date_caught ?? r.created_at ?? '',
  }));
  const activities = [...harvestActs, ...fishActs]
    .filter(a => a.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  const recentHarvests = [...harvests].reverse().slice(0, 6);
  const recentExpenses = [...expenses].reverse().slice(0, 5);
  const totalExpenses  = expenses.reduce((s: number, e: any) => s + parseFloat(e.amount ?? 0), 0);

  const userData    = JSON.parse(localStorage.getItem('user_data') || '{}');
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statCards = [
    { title: 'Registered Farmers', value: farmers.length,                           sub: 'Total on record',  icon: <Tractor size={22} />, color: 'bg-emerald-500' },
    { title: 'Active Fisherfolk',  value: fisherfolks.length,                        sub: 'Coastal & Inland', icon: <Anchor size={22} />,  color: 'bg-blue-500'    },
    { title: 'Registered Crops',   value: crops.length,                              sub: 'Crop varieties',   icon: <Sprout size={22} />,  color: 'bg-green-500'   },
    { title: 'Total Fish Yield',   value: `${totalFishYield.toLocaleString()} kg`,   sub: 'All catch records',icon: <Fish size={22} />,    color: 'bg-cyan-500'    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            {greeting}, <span className="text-primary italic">{userData.name?.split(' ')[0] || 'Agriculturist'}!</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Gingoog City Agricultural Portal • {currentDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAll(true)}
            disabled={loading}
            className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-primary transition-all shadow-sm disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100 dark:border-slate-800">
              <div className={`p-2 rounded-xl ${weather.color} transition-colors duration-500`}>{weather.icon}</div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none truncate max-w-28">{weather.city}</p>
                {weather.lat !== undefined && (
                  <p className="text-[9px] text-gray-400 mt-0.5">{weather.lat.toFixed(4)}, {weather.lon!.toFixed(4)}</p>
                )}
                <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">{weather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={16} className={parseInt(weather.temp) > 30 ? 'text-red-500' : 'text-blue-500'} />
              <span className="text-lg font-black text-gray-800 dark:text-white">{weather.temp}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionButton icon={<Plus size={18} />}    label="Add Planting Log"    onClick={() => navigate('/page/planting-management',  { state: { openAddDialog: true } })} />
        <QuickActionButton icon={<Tractor size={18} />} label="Register Farmer"     onClick={() => navigate('/page/farmer-management',     { state: { openAddDialog: true } })} />
        <QuickActionButton icon={<Anchor size={18} />}  label="Register Fisherfolk" onClick={() => navigate('/page/fisherfolk-management', { state: { openAddDialog: true } })} />
        <QuickActionButton icon={<Wallet size={18} />}  label="Log Expense"         onClick={() => navigate('/page/expenses-management',   { state: { openAddDialog: true } })} />
      </div>

      {/* ── Stat Cards (progress bar on left edge while loading) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 pl-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-[2rem] bg-gray-100 dark:bg-slate-800 overflow-hidden">
              {loading && (
                <div
                  className="w-full bg-primary/70 rounded-full"
                  style={{
                    height: '35%',
                    animation: `progressSlide 1.4s ease-in-out infinite ${i * 0.15}s`,
                  }}
                />
              )}
              {!loading && <div className="w-full h-full bg-primary/30 rounded-full" />}
            </div>

            <div className="relative z-10">
              <div className={`${s.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ${loading ? 'animate-pulse opacity-60' : ''}`}>{s.icon}</div>
              {loading ? (
                <div className="h-2.5 w-28 bg-gray-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
              ) : (
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{s.title}</p>
              )}
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1">
                {loading ? (
                  <span className="inline-block w-16 h-7 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                ) : s.value}
              </h3>
              <p className="text-[9px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase tracking-tighter">
                <ArrowUpRight size={12} />
                {loading ? (
                  <span className="inline-block w-24 h-2.5 bg-emerald-100 dark:bg-emerald-500/10 rounded animate-pulse" />
                ) : s.sub}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">{s.icon}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes progressSlide {
          0%   { transform: translateY(-100%); }
          50%  { transform: translateY(200%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>


      {/* ── Middle: Crop Leaders + Recent Activities ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Crop Harvest Leaders */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
              <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-6">
            <Wheat size={20} className="text-primary" />
            <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Crop Harvest Leaders</h2>
          </div>

          {loading && !hasLoadedData ? (
            <div className="space-y-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-gray-50 dark:bg-slate-700 rounded-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedCrops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <ClipboardList size={32} className="text-gray-200 dark:text-slate-700" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No harvest records yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedCrops.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl ${cropColors[i].bg} flex items-center justify-center shrink-0`}>
                    <Sprout size={16} className={cropColors[i].text} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate">{name}</p>
                      <p className="text-[10px] font-black text-gray-400 ml-2 shrink-0">{qty.toLocaleString()} kg</p>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cropColors[i].bar} transition-all duration-1000`} style={{ width: `${(qty / maxCrop) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activities */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
              <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
          )}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Recent Activities</h2>
            </div>
            <button onClick={() => navigate('/page/harvest-management')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowRight size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {loading && !hasLoadedData ? (
              <div className="p-6 space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-2 bg-gray-50 dark:bg-slate-700 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Activity size={32} className="text-gray-200 dark:text-slate-700" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No recent activities</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50/70 dark:bg-slate-800/50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Activity</th>
                    <th className="px-6 py-3">Sector</th>
                    <th className="px-6 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {activities.map((a, i) => (
                    <ActivityRow key={i} name={a.name} loc={a.loc} task={a.task} sector={a.sector} time={a.time} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* ── Bottom: Recent Harvests + Recent Expenses ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Harvests */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
              <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wheat size={20} className="text-emerald-500" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Recent Harvests</h2>
            </div>
            <button onClick={() => navigate('/page/harvest-management')} className="text-[9px] font-black text-primary uppercase tracking-widest hover:opacity-70 flex items-center gap-1">
              View All <ArrowRight size={11} />
            </button>
          </div>

          {loading && !hasLoadedData ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
          ) : recentHarvests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Wheat size={28} className="text-gray-200 dark:text-slate-700" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No harvest records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentHarvests.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Sprout size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-800 dark:text-white truncate">{getHarvestCropName(h)}</p>
                      <p className="text-[9px] text-gray-400 font-medium truncate">{getHarvestFarmerName(h)} · {getHarvestBarangayName(h)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-black text-gray-800 dark:text-white">{Number(h.quantity ?? 0).toLocaleString()} kg</p>
                    <p className="text-[9px] text-emerald-500 font-bold">₱{fmt(h.value ?? 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
              <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PhilippinePeso size={20} className="text-red-400" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Recent Expenses</h2>
            </div>
            <button onClick={() => navigate('/page/expenses-management')} className="text-[9px] font-black text-primary uppercase tracking-widest hover:opacity-70 flex items-center gap-1">
              View All <ArrowRight size={11} />
            </button>
          </div>

          {!loading && expenses.length > 0 && (
            <p className="text-[10px] text-gray-400 font-bold mb-4">
              Total: <span className="text-red-400 font-black">₱{fmt(totalExpenses)}</span> across {expenses.length} records
            </p>
          )}

          {loading && !hasLoadedData ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
          ) : recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Wallet size={28} className="text-gray-200 dark:text-slate-700" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No expense records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                      <Wallet size={14} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-800 dark:text-white truncate">{e.item ?? '—'}</p>
                      <p className="text-[9px] text-gray-400 font-medium truncate">{e.category ?? '—'}{e.ref_no ? ` · ${e.ref_no}` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-black text-red-500">₱{fmt(e.amount ?? 0)}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{e.date ?? e.created_at ?? '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
};

export default DashboardContainer;
