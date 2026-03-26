import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, MapPin, Wheat, ArrowRight } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Link } from 'react-router-dom'; // 🌟 GI-IMPORT ANG LINK GIKAN SA REACT ROUTER

// 🌟 COLORS PARA SA PIE CHART
const PIE_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#14b8a6', '#ef4444', '#eab308', '#6366f1', '#0ea5e9',
  '#84cc16', '#f43f5e', '#d946ef', '#06b6d4', '#10b981'
];

export default function HarvestChart({ data = [], isLoading }: { data: any[], isLoading?: boolean }) {
  // 🌟 1. TANANG HOOKS DAPAT NAA SA PINAKA-IBABAW
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const barChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sortedData = [...data].sort((a, b) => new Date(a.dateHarvested).getTime() - new Date(b.dateHarvested).getTime());
    const grouped = sortedData.reduce((acc: any, curr: any) => {
      if (!curr.dateHarvested) return acc;
      const date = new Date(curr.dateHarvested);
      let key = "";
      if (timeframe === 'daily') key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      else if (timeframe === 'monthly') key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      else if (timeframe === 'yearly') key = date.getFullYear().toString();

      const numericValue = parseFloat(String(curr.value || '0').replace(/[^0-9.-]+/g, "")) || 0;
      if (!acc[key]) acc[key] = { name: key, totalValue: 0 };
      acc[key].totalValue += numericValue;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [data, timeframe]);

  const pieChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const grouped = data.reduce((acc: any, curr: any) => {
      const crop = curr.crop_name || curr.crop?.category || 'Unknown Crop';
      const numericValue = parseFloat(String(curr.value || '0').replace(/[^0-9.-]+/g, "")) || 0;
      if (!acc[crop]) acc[crop] = 0;
      acc[crop] += numericValue;
      return acc;
    }, {});
    return Object.keys(grouped).map(key => ({ name: key, value: grouped[key] })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  // ============================================
  // 3. RADAR CHART LOGIC (Top 6 Barangay Only)
  // ============================================
  const radarChartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const grouped = data.reduce((acc: any, curr: any) => {
      const brgy = curr.barangay_name || curr.barangay?.name || 'Unknown';
      const crop = curr.crop_name || curr.crop?.category || 'Unknown';
      const numericValue = parseFloat(String(curr.value || '0').replace(/[^0-9.-]+/g, "")) || 0;
      
      if (!acc[brgy]) {
        acc[brgy] = { totalValue: 0, crops: {} };
      }
      
      acc[brgy].totalValue += numericValue;
      
      if (!acc[brgy].crops[crop]) {
        acc[brgy].crops[crop] = 0;
      }
      acc[brgy].crops[crop] += numericValue;

      return acc;
    }, {});

    return Object.keys(grouped).map(key => ({ 
      subject: key.toUpperCase(), 
      totalValue: grouped[key].totalValue,
      cropsBreakdown: Object.keys(grouped[key].crops).map(cropName => ({
         name: cropName,
         value: grouped[key].crops[cropName]
      })).sort((a, b) => b.value - a.value) 
    })).sort((a, b) => b.totalValue - a.totalValue).slice(0, 6); 
  }, [data]);

  // ============================================
  // FORMATTERS & TOOLTIPS
  // ============================================
  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) return `₱${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `₱${(tickItem / 1000).toFixed(0)}K`;
    return `₱${tickItem}`;
  };

  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl z-50">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">₱ {payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cropName = payload[0].name;
      const value = payload[0].value;
      const color = payload[0].payload.fill; 
      
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl z-50 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{cropName} </p>
            <p className="text-sm font-black text-gray-800 dark:text-white">
              ₱ {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl z-50 min-w-50">
          <div className="mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={12}/> {data.subject}</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
               ₱ {data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1.5"><Wheat size={10}/> Crop Details</p>
            <div className="space-y-1.5">
               {data.cropsBreakdown.map((crop: any, index: number) => (
                 <div key={index} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 before:content-['•'] before:text-emerald-500 before:font-black">
                      {crop.name}
                    </span>
                    <span className="font-black text-gray-800 dark:text-white">
                      ₱ {crop.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ============================================
  // SKELETON LOADER
  // ============================================
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 md:p-8 flex flex-col min-h-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10"><div className="h-full bg-primary w-[30%] animate-progress-loop" /></div>
          <div className="flex justify-between items-start mb-8">
             <div className="space-y-2"><div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"/><div className="h-2 w-24 bg-gray-100 dark:bg-slate-800/50 rounded animate-pulse"/></div>
             <div className="h-8 w-48 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="flex-1 w-full flex items-end gap-3 px-4">
             {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
               <div key={i} className="flex-1 bg-gray-100 dark:bg-slate-800/50 rounded-t-lg animate-pulse" style={{ height: `${h}%` }} />
             ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col flex-1 min-h-62.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10"><div className="h-full bg-primary w-[30%] animate-progress-loop" /></div>
            <div className="flex gap-2 mb-4"><div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse"/><div className="space-y-2"><div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"/><div className="h-2 w-16 bg-gray-100 dark:bg-slate-800/50 rounded animate-pulse"/></div></div>
            <div className="flex-1 w-full flex items-center justify-center"><div className="w-32 h-32 rounded-full border-10 border-gray-100 dark:border-slate-800/50 animate-pulse" /></div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col flex-1 min-h-62.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10"><div className="h-full bg-primary w-[30%] animate-progress-loop" /></div>
            <div className="flex gap-2 mb-4"><div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse"/><div className="space-y-2"><div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"/><div className="h-2 w-16 bg-gray-100 dark:bg-slate-800/50 rounded animate-pulse"/></div></div>
            <div className="flex-1 w-full flex items-center justify-center"><div className="w-32 h-32 rounded-full border-14 border-gray-100 dark:border-slate-800/50 animate-pulse" /></div>
          </div>
        </div>
      </div>
    );
  }


  // ============================================
  // ACTUAL RENDER
  // ============================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* LEFT: BAR CHART */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 shrink-0">
          <div><div className="flex items-center gap-2 mb-1 text-emerald-500"><TrendingUp size={18} /><h3 className="text-xs font-black uppercase tracking-widest">Revenue Analytics</h3></div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Value vs. Timeline</p></div>
          <div className="flex p-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 w-full md:w-auto">
            {['daily', 'monthly', 'yearly'].map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf as any)} className={cn("flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer", timeframe === tf ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200")}>{tf}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-100 w-full flex flex-col">
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={35}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={formatYAxis} />
                <Tooltip content={<CurrencyTooltip />} cursor={{ fill: '#10b981', opacity: 0.05 }} />
                <Bar dataKey="totalValue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            /* 🌟 NO DATA PLACEHOLDER */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
              <TrendingUp size={48} strokeWidth={1} className="mb-2 opacity-40" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Revenue Logs Found</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: RADAR & PIE */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        
       {/* RADAR CHART */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col flex-1 min-h-70 relative overflow-hidden">
           <div className="flex items-center gap-2 mb-4 text-emerald-500 shrink-0">
             <MapPin size={18} />
             <div>
               <h3 className="text-xs font-black uppercase tracking-widest">Top 6 Locations</h3>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Highest Revenue by Barangay</p>
             </div>
           </div>
           
           <div className="flex-1 w-full min-h-55 flex flex-col">
            {radarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                  <PolarGrid stroke="#334155" opacity={0.2} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                  <Radar name="Revenue" dataKey="totalValue" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              /* 🌟 NO DATA PLACEHOLDER */
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                <MapPin size={40} strokeWidth={1} className="mb-2 opacity-40" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Location Data</p>
              </div>
            )}
          </div>

           {/* 🌟 NAKA-LINK NA NGA LABEL PADAULONG SA BARANGAY PAGE */}
           <div className="mt-2 text-center shrink-0 border-t border-gray-100 dark:border-slate-800 pt-4">
             <Link 
               to="/page/barangaylist-management" 
               className="group inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all cursor-pointer w-full text-[10px] font-black uppercase tracking-widest"
             >
               View Barangay Profile 
               <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
             </Link>
             <p className="text-[8px] font-bold text-gray-400 italic uppercase tracking-widest mt-2">
               * Click to view all details and full location breakdown
             </p>
           </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col flex-1 min-h-70 relative overflow-hidden">
           <div className="flex items-center gap-2 mb-4 text-blue-500 shrink-0">
              <PieChartIcon size={18} />
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest">Revenue by Crop</h3>
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Distribution of Income</p>
              </div>
           </div>
           
           <div className="flex-1 w-full min-h-55 flex flex-col">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="45%" innerRadius="55%" outerRadius="85%" paddingAngle={4} dataKey="value" stroke="none">
                    {pieChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              /* 🌟 NO DATA PLACEHOLDER */
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                <PieChartIcon size={40} strokeWidth={1} className="mb-2 opacity-40" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Crop Distribution</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}