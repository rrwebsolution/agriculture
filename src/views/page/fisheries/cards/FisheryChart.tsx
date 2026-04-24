import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  Anchor,
  Fish,
  Calendar,
  PhilippinePeso,
  TrendingUp,
  Clock3,
  Waves,
  Ship,
  Scale,
  MapPin,
} from 'lucide-react';

interface VesselCatchEntry {
  boat_name?: string;
  gear_type?: string;
  fishing_area?: string;
  catch_date?: string;
  catch_time_from?: string;
  catch_time_to?: string;
  catch_species?: string;
  catch_species_list?: string[];
  yield?: string | number;
  market_value?: string | number;
  hours_spent_fishing?: string | number;
}

interface FisherRecord {
  id: number;
  name: string;
  yield: string | number;
  market_value: string | number;
  gear_type: string;
  catch_species: string;
  catch_species_list?: string[];
  boat_name?: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  hours_spent_fishing?: string | number;
  fishing_area?: string;
  vessel_catch_entries?: VesselCatchEntry[];
}

interface FisherDetailEntry {
  boatName: string;
  gearType: string;
  fishingArea: string;
  catchSpecies: string;
  yield: number;
  marketValue: number;
  hoursSpentFishing: number;
  date: string;
  catchTimeFrom?: string;
  catchTimeTo?: string;
}

interface FisherGroup {
  name: string;
  totalYield: number;
  totalMarketValue: number;
  totalHours: number;
  totalEntries: number;
  records: FisherRecord[];
  detailEntries: FisherDetailEntry[];
}

interface HourPerformanceEntry {
  id: string;
  name: string;
  date: string;
  catchTimeFrom?: string;
  catchTimeTo?: string;
  boatName: string;
  fishingArea: string;
  gearType: string;
  catchSpecies: string;
  yield: number;
  hoursSpentFishing: number;
  marketValue: number;
  yieldPerHour: number;
}

interface FisherHourTransactionChartRow {
  fisherfolk: string;
  transactions: HourPerformanceEntry[];
  [key: string]: string | number | HourPerformanceEntry[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

const getSpeciesLabel = (species?: string, speciesList?: string[]) => {
  if (Array.isArray(speciesList) && speciesList.length > 0) return speciesList.join(', ');
  return species || 'Unspecified catch';
};

const formatTimeRange = (date?: string, catchTimeFrom?: string, catchTimeTo?: string) => {
  if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const formattedDate = parsed.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      if (catchTimeFrom && catchTimeTo) {
        const formatTimeOnly = (timeValue: string) => {
          const [hours, minutes] = String(timeValue).split(':');
          const base = new Date();
          base.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);
          return base.toLocaleTimeString('en-PH', {
            hour: 'numeric',
            minute: '2-digit',
          });
        };

        return `${formattedDate} • ${formatTimeOnly(catchTimeFrom)} - ${formatTimeOnly(catchTimeTo)}`;
      }

      return formattedDate;
    }
  }

  return 'No date recorded';
};

const normalizeEntries = (record: FisherRecord): FisherDetailEntry[] => {
  const sourceEntries =
    Array.isArray(record.vessel_catch_entries) && record.vessel_catch_entries.length > 0
      ? record.vessel_catch_entries
      : [
          {
            boat_name: record.boat_name,
            gear_type: record.gear_type,
            fishing_area: record.fishing_area,
            catch_species: record.catch_species,
            catch_species_list: record.catch_species_list,
            yield: record.yield,
            market_value: record.market_value,
            hours_spent_fishing: record.hours_spent_fishing,
          },
        ];

  return sourceEntries.map((entry) => ({
    boatName: entry.boat_name || 'Unassigned Vessel',
    gearType: entry.gear_type || 'Unspecified Gear',
    fishingArea: entry.fishing_area || 'No fishing area',
    catchSpecies: getSpeciesLabel(entry.catch_species, entry.catch_species_list),
    yield: parseFloat(String(entry.yield || 0)),
    marketValue: parseFloat(String(entry.market_value || 0)),
    hoursSpentFishing: parseFloat(String(entry.hours_spent_fishing || 0)),
    date: entry.catch_date || record.date,
    catchTimeFrom: entry.catch_time_from,
    catchTimeTo: entry.catch_time_to,
  }));
};

export default function FisheryChart({ data = [], isLoading }: { data: FisherRecord[]; isLoading: boolean }) {
  const timeFilteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      if (Number.isNaN(recordDate.getTime())) return false;
      return true;
    });
  }, [data]);

  const fisherGroups = useMemo<FisherGroup[]>(() => {
    const groups: Record<string, FisherGroup> = {};

    timeFilteredData.forEach((record) => {
      const name = record.name || 'Unknown';
      if (!groups[name]) {
        groups[name] = {
          name,
          totalYield: 0,
          totalMarketValue: 0,
          totalHours: 0,
          totalEntries: 0,
          records: [],
          detailEntries: [],
        };
      }

      const entries = normalizeEntries(record);
      groups[name].totalYield += entries.reduce((sum, entry) => sum + entry.yield, 0);
      groups[name].totalMarketValue += entries.reduce((sum, entry) => sum + entry.marketValue, 0);
      groups[name].totalHours += entries.reduce((sum, entry) => sum + entry.hoursSpentFishing, 0);
      groups[name].totalEntries += entries.length;
      groups[name].records.push(record);
      groups[name].detailEntries.push(...entries);
    });

    return Object.values(groups)
      .sort((a, b) => b.totalMarketValue - a.totalMarketValue)
      .slice(0, 10);
  }, [timeFilteredData]);

  const hourPerformanceData = useMemo<HourPerformanceEntry[]>(() => {
    return timeFilteredData
      .flatMap((record) =>
        normalizeEntries(record).map((entry, index) => ({
          id: `${record.id}-${index}`,
          name: record.name || 'Unknown',
          date: entry.date,
          catchTimeFrom: entry.catchTimeFrom,
          catchTimeTo: entry.catchTimeTo,
          boatName: entry.boatName,
          fishingArea: entry.fishingArea,
          gearType: entry.gearType,
          catchSpecies: entry.catchSpecies,
          yield: entry.yield,
          hoursSpentFishing: entry.hoursSpentFishing,
          marketValue: entry.marketValue,
          yieldPerHour: entry.hoursSpentFishing > 0 ? entry.yield / entry.hoursSpentFishing : 0,
        }))
      )
      .filter((entry) => entry.hoursSpentFishing > 0)
      .sort((a, b) => b.yieldPerHour - a.yieldPerHour)
      .slice(0, 10);
  }, [timeFilteredData]);

  const fisherHourChartData = useMemo<FisherHourTransactionChartRow[]>(() => {
    const grouped: Record<string, HourPerformanceEntry[]> = {};

    hourPerformanceData.forEach((entry) => {
      if (!grouped[entry.name]) grouped[entry.name] = [];
      grouped[entry.name].push(entry);
    });

    return Object.entries(grouped)
      .map(([fisherfolk, transactions]) => {
        const sortedTransactions = [...transactions]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 6);

        const row: FisherHourTransactionChartRow = {
          fisherfolk,
          transactions: sortedTransactions,
        };

        sortedTransactions.forEach((transaction, index) => {
          row[`transaction_${index + 1}`] = transaction.hoursSpentFishing;
        });

        return row;
      })
      .sort((a, b) => {
        const maxA = Math.max(...a.transactions.map((transaction) => transaction.hoursSpentFishing), 0);
        const maxB = Math.max(...b.transactions.map((transaction) => transaction.hoursSpentFishing), 0);
        return maxB - maxA;
      });
  }, [hourPerformanceData]);

  const maxTransactionCount = useMemo(
    () => Math.min(6, Math.max(0, ...fisherHourChartData.map((entry) => entry.transactions.length))),
    [fisherHourChartData]
  );

  const gearData = useMemo(() => {
    const counts: Record<string, number> = {};
    timeFilteredData.forEach((record) => {
      const entries = normalizeEntries(record);
      entries.forEach((entry) => {
        const gear = entry.gearType || 'Others';
        counts[gear] = (counts[gear] || 0) + entry.marketValue;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [timeFilteredData]);

  const grandTotalValue = useMemo(() => gearData.reduce((acc, curr) => acc + curr.value, 0), [gearData]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-120">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
              <TrendingUp width={20} height={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none text-gray-800 dark:text-white">Top Fisherfolk Revenue</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 tracking-wider">Includes revenue, fishing hours, and catch entry details</p>
            </div>
          </div>

        </div>

        <div className="flex-1 min-h-0 relative flex flex-col">
          {fisherGroups.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fisherGroups} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => `PHP ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.4 }} />
                <Bar dataKey="totalMarketValue" radius={[6, 6, 0, 0]} barSize={40}>
                  {fisherGroups.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#10b98133'} className="hover:fill-emerald-500 transition-colors duration-300" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
              <TrendingUp size={48} strokeWidth={1} className="mb-2 opacity-40" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No catch records for this period</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-120">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
              <Clock3 width={20} height={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none text-gray-800 dark:text-white">Catch Per Hour</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 tracking-wider">Per fisherfolk transaction hours shown as separate bars</p>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative flex flex-col">
            {fisherHourChartData.length > 0 && maxTransactionCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fisherHourChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="fisherfolk" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => `${Number(val).toFixed(1)}h`} />
                  <Tooltip shared={false} content={<HourPerformanceTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                  {Array.from({ length: maxTransactionCount }).map((_, index) => (
                    <Bar
                      key={`transaction_${index + 1}`}
                      dataKey={`transaction_${index + 1}`}
                      name={`Txn ${index + 1}`}
                      radius={[6, 6, 0, 0]}
                      barSize={18}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                <Clock3 size={48} strokeWidth={1} className="mb-2 opacity-40" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No hourly catch data for this period</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-120 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
              <PieIcon width={20} height={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none text-gray-800 dark:text-white">Gear Distribution</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 tracking-wider">Overall Sales per Gear Type</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative">
            {gearData.length > 0 ? (
              <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gearData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                      {gearData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {grandTotalValue > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total Sales</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white">PHP {(grandTotalValue / 1000).toFixed(1)}k</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                <PieIcon size={48} strokeWidth={1} className="mb-2 opacity-40" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No gear distribution data</p>
              </div>
            )}

            {gearData.length > 0 && (
              <div className="mt-4 space-y-2 overflow-y-auto custom-scrollbar max-h-32 pr-2">
                {gearData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase truncate max-w-28">{entry.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-800 dark:text-white">PHP {entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as FisherGroup;
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xl min-w-72 max-w-80 max-h-96 flex flex-col z-50 animate-in zoom-in-95">
        <div className="border-b border-gray-100 dark:border-slate-700 pb-3 mb-3">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{data.name}</p>
          <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1"><PhilippinePeso width={12} height={12} /> Total Sales</span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">PHP {data.totalMarketValue.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Hours</p>
              <p className="text-[11px] font-black text-gray-800 dark:text-white flex items-center gap-1 mt-1"><Clock3 width={10} height={10} className="text-amber-500" />{data.totalHours.toFixed(1)} hrs</p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Yield</p>
              <p className="text-[11px] font-black text-gray-800 dark:text-white flex items-center gap-1 mt-1"><Scale width={10} height={10} className="text-emerald-500" />{data.totalYield.toFixed(1)} kg</p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Entries</p>
              <p className="text-[11px] font-black text-gray-800 dark:text-white flex items-center gap-1 mt-1"><Ship width={10} height={10} className="text-primary" />{data.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {data.detailEntries.map((entry, index) => (
            <div key={`${entry.date}-${entry.boatName}-${index}`} className="bg-gray-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase flex items-center gap-1"><Fish width={10} height={10} className="text-primary" /> {entry.catchSpecies}</span>
                <span className="text-[10px] font-black text-emerald-600">PHP {entry.marketValue.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-gray-400 uppercase">
                <span className="flex items-center gap-1"><Anchor width={8} height={8} /> {entry.yield} kg</span>
                <span className="flex items-center gap-1"><Clock3 width={8} height={8} /> {entry.hoursSpentFishing} hrs</span>
                <span className="flex items-center gap-1"><Ship width={8} height={8} /> {entry.boatName}</span>
                <span className="flex items-center gap-1"><Waves width={8} height={8} /> {entry.gearType}</span>
                <span className="flex items-center gap-1 col-span-2"><MapPin width={8} height={8} /> {entry.fishingArea}</span>
                <span className="flex items-center gap-1 col-span-2"><Calendar width={8} height={8} /> {entry.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const HourPerformanceTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const activeTransaction = payload[0];
    const row = activeTransaction?.payload as FisherHourTransactionChartRow;
    const transactionIndex = Number(String(activeTransaction?.dataKey || '').replace('transaction_', '')) - 1;
    const data = row.transactions[transactionIndex];

    if (!data) return null;

    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl min-w-64 z-50">
        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3">{data.name}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-500/10 px-3 py-2">
            <span className="text-[10px] font-black uppercase text-amber-600">Catch Hours</span>
            <span className="text-sm font-black text-amber-700 dark:text-amber-400">{data.hoursSpentFishing.toFixed(2)} hrs</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Yield</p>
              <p className="mt-1 text-[11px] font-black text-gray-800 dark:text-white">{data.yield.toFixed(1)} kg</p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-2.5 py-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Sales</p>
              <p className="mt-1 text-[11px] font-black text-gray-800 dark:text-white">PHP {data.marketValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-gray-500 dark:text-slate-400">
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-3 py-2">
              <p className="uppercase tracking-widest text-gray-400">Catch</p>
              <p className="mt-1 text-gray-800 dark:text-white">{data.catchSpecies}</p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-3 py-2">
              <p className="uppercase tracking-widest text-gray-400">Gear</p>
              <p className="mt-1 text-gray-800 dark:text-white">{data.gearType}</p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-3 py-2">
              <p className="uppercase tracking-widest text-gray-400">Boat</p>
              <p className="mt-1 text-gray-800 dark:text-white">{data.boatName}</p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-3 py-2">
              <p className="uppercase tracking-widest text-gray-400">Date</p>
              <p className="mt-1 text-gray-800 dark:text-white">{formatTimeRange(data.date, data.catchTimeFrom, data.catchTimeTo)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 px-3 py-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Fishing Area</p>
            <p className="mt-1 text-[10px] font-bold text-gray-800 dark:text-white">{data.fishingArea}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl flex items-center gap-3 z-50">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">{payload[0].name}</p>
          <p className="text-xs font-black text-gray-800 dark:text-white">PHP {payload[0].value.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return null;
};

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="relative bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-120 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
        <div className="h-full bg-primary w-[40%] animate-progress-loop" />
      </div>
      <div className="p-6 h-full flex flex-col">
        <div className="h-4 w-48 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mb-8" />
        <div className="flex-1 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl animate-pulse" />
      </div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="relative bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-120 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
        <div className="p-6 h-full flex flex-col">
          <div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mb-8" />
          <div className="flex-1 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl animate-pulse" />
        </div>
      </div>
      <div className="relative bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-120 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
        <div className="p-6 h-full flex flex-col">
          <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mb-8" />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-20 border-gray-50 dark:border-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
