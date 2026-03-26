import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { PieChart as PieIcon, BarChart3, Users, Scale, User } from 'lucide-react';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface TypeData {
  name: string;
  value: number;
}

interface FisherYieldData {
  name: string;
  yield: number;
}

export default function FisherfolkAnalytics({ fisherfolks = [], isLoading }: { fisherfolks: any[], isLoading: boolean }) {
  
  // 🥧 1. Donut Chart: Distribution of Fisherfolk Types
  const typeData = useMemo<TypeData[]>(() => {
    const counts: Record<string, number> = {};
    fisherfolks?.forEach(f => {
      const type = String(f.fisher_type || 'Uncategorized');
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); 
  }, [fisherfolks]);

  // 📊 2. Bar Chart: Top Fisherfolks by Total Yield
  const fisherYieldData = useMemo<FisherYieldData[]>(() => {
    const dataMap: FisherYieldData[] = [];
    fisherfolks?.forEach(f => {
      const name = `${f.first_name || ''} ${f.last_name || ''}`.trim() || 'Unknown';
      const yieldSum = (f.catch_records || []).reduce((acc: number, r: any) => acc + parseFloat(String(r.yield || 0)), 0);
      if (yieldSum > 0) {
        dataMap.push({ name, yield: yieldSum });
      }
    });
    return dataMap
      .sort((a, b) => b.yield - a.yield)
      .slice(0, 8);
  }, [fisherfolks]);

  const totalFisherfolks = fisherfolks.length;

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* 🟢 BAR CHART: Top Performers */}
      <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-110">
         <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl text-cyan-500"><BarChart3 size={18} /></div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none text-gray-800 dark:text-white">Top Fisherfolks</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Based on Total Catch Yield (kg)</p>
            </div>
         </div>
         <div className="flex-1 min-h-0">
            {fisherYieldData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fisherYieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} />
                  {/* 🌟 Bar Chart Tooltip wrapperStyle zIndex added */}
                  <Tooltip content={<CustomBarTooltip />} cursor={{fill: '#f8fafc', opacity: 0.4}} wrapperStyle={{ zIndex: 100 }} />
                  <Bar dataKey="yield" radius={[4, 4, 0, 0]} barSize={40}>
                     {fisherYieldData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#06b6d433'} className="hover:fill-cyan-500 transition-colors duration-300" />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                  <BarChart3 size={48} strokeWidth={1} className="mb-2 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">No catch records found</p>
              </div>
            )}
         </div>
      </div>

      {/* 🟣 DONUT CHART: Fisherfolk Types */}
      <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-110 overflow-hidden">
         <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-500"><PieIcon size={18} /></div>
            <h3 className="text-sm font-black uppercase tracking-widest leading-none text-gray-800 dark:text-white">Registry Composition</h3>
         </div>
         
        <div className="flex-1 flex flex-col relative">
          {typeData.length > 0 ? (
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} wrapperStyle={{ zIndex: 100 }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* 🌟 CENTER TEXT - ONLY SHOW IF > 0 */}
              {totalFisherfolks > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total</p>
                  <p className="text-2xl font-black text-gray-800 dark:text-white leading-none">{totalFisherfolks}</p>
                </div>
              )}
            </div>
          ) : (
            /* 🌟 NO DATA PLACEHOLDER FOR PIE CHART */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
              <PieIcon size={48} strokeWidth={1} className="mb-2 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No registry data</p>
            </div>
          )}

          {/* Legend section stays as is, only shows if typeData.length > 0 if you want */}
          {typeData.length > 0 && (
            <div className="mt-4 space-y-2 overflow-y-auto custom-scrollbar max-h-32 pr-2">
               {typeData.map((entry: TypeData, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase truncate max-w-30">{entry.name}</span>
                     </div>
                     <span className="text-[10px] font-black text-gray-800 dark:text-white">{entry.value}</span>
                  </div>
               ))}
            </div>
          )}
          </div>
      </div>
    </div>
  );
}

// 🛠️ Chart Tooltips
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as FisherYieldData;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-2xl z-50 animate-in zoom-in-95">
        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1 flex items-center gap-1"><User size={12}/> {data.name}</p>
        <p className="text-xs font-black text-cyan-600 flex items-center gap-1"><Scale size={14}/> {data.yield.toLocaleString()} kg Total Catch</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl flex items-center gap-3 z-50 animate-in zoom-in-95">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">{payload[0].name}</p>
          <p className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1"><Users size={12} className="text-purple-500"/> {payload[0].value} Fisherfolk</p>
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsSkeleton = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse">
      <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-110 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden"><div className="h-full bg-primary w-[40%] animate-progress-loop" /></div>
         <div className="p-6 h-full flex flex-col"><div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mb-6" /><div className="flex-1 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl animate-pulse" /></div>
      </div>
      <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl h-110 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden"><div className="h-full bg-primary w-[40%] animate-progress-loop" /></div>
         <div className="p-6 h-full flex flex-col">
            <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mb-6" />
            <div className="flex-1 flex items-center justify-center">
               {/* 🌟 Fixed tailwind border-12 to standard border-[12px] */}
               <div className="w-40 h-40 rounded-full border-12 border-gray-50 dark:border-slate-800 animate-pulse" />
            </div>
         </div>
      </div>
    </div>
);