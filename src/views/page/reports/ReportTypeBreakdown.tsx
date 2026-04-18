import { useState, useMemo } from 'react';
import { BarChart3, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { cn } from '../../../lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-primary leading-none">
          {payload[0].value} <span className="text-xs font-bold text-gray-400">Reports</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportTypeBreakdown({ reports = [], isLoading }: { reports: any[]; isLoading: boolean }) {
  const [timeFilter, setTimeFilter] = useState<'This Week' | 'This Month' | 'This Year' | 'All Time'>('All Time');
  const filters = ['This Week', 'This Month', 'This Year', 'All Time'];

  const { chartData, totalCount } = useMemo(() => {
    const now = new Date();
    const filtered = reports.filter((r) => {
      const d = new Date(r.generated_at);
      switch (timeFilter) {
        case 'This Week': {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          return d >= start;
        }
        case 'This Month': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'This Year': return d.getFullYear() === now.getFullYear();
        default: return true;
      }
    });

    const grouped: Record<string, number> = {};
    filtered.forEach((r) => {
      const t = r.type || 'Other';
      grouped[t] = (grouped[t] || 0) + 1;
    });

    const data = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { chartData: data, totalCount: filtered.length };
  }, [reports, timeFilter]);

  return (
    <div className="relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-inner border border-primary/10">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none mb-1">Report Distribution</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> Count per Classification
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row md:items-center gap-6">
          <div className="flex items-center bg-gray-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-gray-100 dark:border-slate-800 w-fit">
            {filters.map((f) => (
              <button
                key={f}
                disabled={isLoading}
                onClick={() => setTimeFilter(f as any)}
                className={cn(
                  'px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
                  timeFilter === f ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total ({timeFilter})</p>
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded animate-pulse ml-auto" />
            ) : (
              <h2 className="text-2xl font-black text-gray-800 dark:text-white leading-none tracking-tighter">
                {totalCount} <span className="text-sm font-bold text-gray-400">Reports</span>
              </h2>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-87.5">
        {isLoading ? (
          <div className="w-full h-full flex items-end justify-around gap-4 px-10 pb-10">
            {[80, 50, 65, 35, 55, 40].map((h, i) => (
              <div key={i} style={{ height: `${h}%` }} className="w-16 bg-gray-100 dark:bg-slate-800 rounded-t-xl animate-pulse" />
            ))}
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" opacity={0.4} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={45} fill="url(#reportGradient)">
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-700">
              <FileText size={40} strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">No Reports Found</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">for {timeFilter}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
