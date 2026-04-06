import { useState, useMemo } from 'react';
import { BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis 
} from 'recharts';
import { cn } from '../../../../../lib/utils';

interface InventoryChartsProps {
  inventory: any[];
  isLoading: boolean;
}

export default function InventoryCharts({ inventory, isLoading }: InventoryChartsProps) {
  const [barMetric, setBarMetric] = useState<"stock" | "items">("stock");

  // --- DATA PROCESSING ---
  const barData = useMemo(() => {
      const grouped = inventory.reduce((acc, item) => {
          let cat = item.category.replace(' distribution', '').replace('(Package)', '');
          if (cat.length > 15) cat = cat.substring(0, 15) + '...'; 
          if (!acc[cat]) acc[cat] = { category: cat, stock: 0, items: 0 };
          acc[cat].stock += item.stock;
          acc[cat].items += 1;
          return acc;
      }, {} as Record<string, any>);
      return Object.values(grouped);
  }, [inventory]);

  const pieColors = { "In Stock": "#10b981", "Low Stock": "#f59e0b", "Out of Stock": "#ef4444" };
  const pieData = useMemo(() => {
      const grouped = inventory.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      return Object.keys(pieColors).map(key => ({
          name: key, value: grouped[key] || 0, color: pieColors[key as keyof typeof pieColors]
      })).filter(d => d.value > 0); 
  }, [inventory]);

  const radialData = useMemo(() => {
      const total = inventory.length || 1;
      const healthy = inventory.filter(i => i.status === "In Stock").length;
      const percentage = Math.round((healthy / total) * 100);
      return [{ name: "Health", value: percentage, fill: percentage < 50 ? "#ef4444" : percentage < 80 ? "#f59e0b" : "#10b981" }];
  }, [inventory]);

  // --- REUSABLE COMPONENTS ---
  const ProgressLoader = () => (
    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
      <div className="h-full bg-primary w-[40%] animate-progress-loop" />
    </div>
  );

  // 🌟 FIX: Gidugangan og style prop sa interface
  const SkeletonBlock = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div 
        className={cn("bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse", className)} 
        style={style}
    />
  );

  if (inventory.length === 0 && !isLoading) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-500">
        
        {/* 1. BAR CHART CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col relative overflow-hidden min-h-95">
            {isLoading && <ProgressLoader />}
            
            {isLoading ? (
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2"><SkeletonBlock className="h-4 w-20" /><SkeletonBlock className="h-6 w-48" /></div>
                        <SkeletonBlock className="h-10 w-32" />
                    </div>
                    <div className="flex-1 flex items-end justify-around gap-4 px-2">
                        {[60, 40, 90, 70, 50, 80].map((h, i) => (
                            <SkeletonBlock key={i} className="w-full max-w-10 rounded-t-lg" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
            ) : (
                // 🌟 FIX: Gigamitan og Fragment (<> ... </>)
                <>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-1"><BarChart2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Analytics</span></div>
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none">Category Distribution</h3>
                        </div>
                        <div className="flex bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
                            <button onClick={() => setBarMetric("stock")} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", barMetric === "stock" ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-gray-400")}>Volume</button>
                            <button onClick={() => setBarMetric("items")} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", barMetric === "items" ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-gray-400")}>Items</button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-62.5">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 800 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 800 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }} />
                                <Bar dataKey={barMetric} fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>

        {/* 2. PIE & RADIAL STACK */}
        <div className="flex flex-col gap-4 lg:col-span-1">
            
            {/* PIE CHART CARD */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden min-h-50">
                {isLoading && <ProgressLoader />}
                
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="absolute top-6 left-6 space-y-2"><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="h-5 w-32" /></div>
                        <div className="h-28 w-28 rounded-full border-12 border-gray-100 dark:border-slate-800 animate-pulse mt-8" />
                        <SkeletonBlock className="h-3 w-24" />
                    </div>
                ) : (
                    // 🌟 FIX: Gigamitan og Fragment
                    <div className="flex-1 relative flex flex-col justify-center">
                        <div className="absolute top-0 left-0">
                            <div className="flex items-center gap-2 text-primary mb-1"><PieChartIcon size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Status</span></div>
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none">Stock Levels</h3>
                        </div>
                        <div className="h-45 w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" 
                                        label={({ name, percent }) => (percent !== undefined && percent > 0) ? `${name} ${(percent * 100).toFixed(0)}%` : ''} 
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* RADIAL CHART CARD */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden h-30">
                {isLoading && <ProgressLoader />}
                
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-between px-2">
                        <div className="space-y-2"><SkeletonBlock className="h-3 w-16" /><SkeletonBlock className="h-5 w-32" /><SkeletonBlock className="h-3 w-24" /></div>
                        <div className="h-16 w-16 rounded-full border-4 border-gray-100 dark:border-slate-800 animate-pulse" />
                    </div>
                ) : (
                    // 🌟 FIX: Gigamitan og Fragment
                    <>
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-1"><Activity size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Health</span></div>
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none mb-1">In-Stock Rate</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase italic">Items available</p>
                        </div>
                        <div className="h-24 w-24 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={radialData} startAngle={90} endAngle={-270}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background={{ fill: '#f3f4f6' }} cornerRadius={10} dataKey="value" />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <span className="absolute text-sm font-black text-gray-800 dark:text-white">
                                {radialData[0]?.value ?? 0}%
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
}