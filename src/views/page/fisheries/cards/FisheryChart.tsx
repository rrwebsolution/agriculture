import { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  PieChart as PieIcon,
  Anchor, Fish, Calendar, PhilippinePeso, TrendingUp
} from 'lucide-react';
import { cn } from '../../../../lib/utils'; // Siguroha nga naka-import ang cn

interface FisherRecord {
  id: number;
  name: string;
  yield: string | number;
  market_value: string | number;
  gear_type: string;
  catch_species: string;
  boat_name?: string;
  date: string;
}

interface FisherGroup {
  name: string;
  totalYield: number;
  totalMarketValue: number;
  records: FisherRecord[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

export default function FisheryChart({ data = [], isLoading }: { data: FisherRecord[], isLoading: boolean }) {
  
  // 🌟 BAG-O: State para sa Time Filter (Default is 'monthly')
  const [timeFilter, setTimeFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // 📊 1. Group & Sort by Estimated Value (with Time Filter)
  const fisherGroups = useMemo<FisherGroup[]>(() => {
    if (!data || !Array.isArray(data)) return [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDateString = today.toDateString();

    // I-filter ang data base sa napili nga timeframe
    const timeFilteredData = data.filter((r) => {
      if (!r.date) return false;
      const recordDate = new Date(r.date);

      if (timeFilter === 'daily') {
        return recordDate.toDateString() === currentDateString;
      }
      if (timeFilter === 'monthly') {
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      }
      if (timeFilter === 'yearly') {
        return recordDate.getFullYear() === currentYear;
      }
      return true;
    });

    const groups: Record<string, FisherGroup> = {};
    timeFilteredData.forEach((r) => {
      const name = r.name || 'Unknown';
      if (!groups[name]) {
        groups[name] = { name, totalYield: 0, totalMarketValue: 0, records: [] };
      }
      groups[name].totalYield += parseFloat(String(r.yield || 0));
      groups[name].totalMarketValue += parseFloat(String(r.market_value || 0));
      groups[name].records.push(r);
    });
    
    return Object.values(groups)
      .sort((a, b) => b.totalMarketValue - a.totalMarketValue)
      .slice(0, 10);
  }, [data, timeFilter]);

  // 🥧 2. Data for Donut Chart (Overall Gear Distribution)
  const gearData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const gear = r.gear_type || 'Others';
      counts[gear] = (counts[gear] || 0) + parseFloat(String(r.market_value || 0));
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const grandTotalValue = useMemo(() => gearData.reduce((acc, curr) => acc + curr.value, 0), [gearData]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🟢 BAR CHART */}
      <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-120">
         
         {/* 🌟 HEADER NGA NAA NAY TOGGLE BUTTONS 🌟 */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
                  <TrendingUp width={20} height={20} />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none text-gray-800 dark:text-white">Top Fisherfolk Revenue</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 tracking-wider">Based on Estimated Market Value</p>
               </div>
            </div>

            {/* 🌟 TIME FILTER TOGGLE 🌟 */}
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
              {(['daily', 'monthly', 'yearly'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer",
                    timeFilter === filter
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
         </div>
         
         <div className="flex-1 min-h-0 relative flex flex-col">
  {fisherGroups.length > 0 ? (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={fisherGroups} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => `₱${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
        <Tooltip content={<CustomBarTooltip />} cursor={{fill: '#f8fafc', opacity: 0.4}} />
        <Bar dataKey="totalMarketValue" radius={[6, 6, 0, 0]} barSize={40}>
           {fisherGroups.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#10b98133'} className="hover:fill-emerald-500 transition-colors duration-300" />
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    /* 🌟 NO DATA PLACEHOLDER - CENTERED */
    <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
      <TrendingUp size={48} strokeWidth={1} className="mb-2 opacity-40" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em]">No catch records for this period</p>
    </div>
  )}
</div>
      </div>

      {/* 🟡 DONUT CHART (Walay labot sa time filter, Overall ni) */}
      <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-120 overflow-hidden">
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
       
       {/* 🌟 CENTER TEXT - ONLY SHOW IF SALES > 0 */}
       {grandTotalValue > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total Sales</p>
             <p className="text-lg font-black text-gray-800 dark:text-white">₱{(grandTotalValue / 1000).toFixed(1)}k</p>
          </div>
       )}
    </div>
  ) : (
    /* 🌟 NO DATA PLACEHOLDER - CENTERED */
    <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
      <PieIcon size={48} strokeWidth={1} className="mb-2 opacity-40" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em]">No gear distribution data</p>
    </div>
  )}

  {/* Only show legend if there is data */}
  {gearData.length > 0 && (
    <div className="mt-4 space-y-2 overflow-y-auto custom-scrollbar max-h-32 pr-2">
       {gearData.map((entry, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase truncate max-w-28">{entry.name}</span>
             </div>
             <span className="text-[10px] font-black text-gray-800 dark:text-white">₱{entry.value.toLocaleString()}</span>
          </div>
       ))}
    </div>
  )}
</div>
      </div>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as FisherGroup;
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xl min-w-64 max-h-80 flex flex-col z-50 animate-in zoom-in-95">
        <div className="border-b border-gray-100 dark:border-slate-700 pb-3 mb-3">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{data.name}</p>
          <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
             <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1"><PhilippinePeso width={12} height={12}/> Total Sales</span>
             <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">₱{data.totalMarketValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {data.records.map((rec: any, i: number) => (
            <div key={i} className="bg-gray-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase flex items-center gap-1"><Fish width={10} height={10} className="text-primary"/> {rec.catch_species}</span>
                <span className="text-[10px] font-black text-emerald-600">₱{parseFloat(String(rec.market_value)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase">
                 <span className="flex items-center gap-1"><Anchor width={8} height={8}/> {rec.yield} kg</span>
                 <span className="flex items-center gap-1"><Calendar width={8} height={8}/> {rec.date}</span>
              </div>
            </div>
          ))}
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
          <p className="text-xs font-black text-gray-800 dark:text-white">₱{payload[0].value.toLocaleString()}</p>
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsSkeleton = () => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div className="relative xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-120 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
        <div className="h-full bg-primary w-[40%] animate-progress-loop" />
      </div>
      <div className="p-6 h-full flex flex-col">
        <div className="h-4 w-48 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mb-8" />
        <div className="flex-1 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl animate-pulse" />
      </div>
    </div>
    <div className="relative xl:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-120 overflow-hidden">
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
);