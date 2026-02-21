import React from 'react';
import { 
  Sprout, 
  Wheat, 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Activity,
  Droplets
} from 'lucide-react';

const DashboardContainer: React.FC = () => {
  const stats = [
    { title: "Total Crops", value: "2,450", growth: "+12%", icon: <Sprout size={24} />, color: "bg-emerald-500" },
    { title: "Harvest Ready", value: "128", growth: "15 tons", icon: <Wheat size={24} />, color: "bg-amber-500" },
    { title: "Monthly Expenses", value: "₱45,200", growth: "-5%", icon: <Wallet size={24} />, color: "bg-primary" },
    { title: "Farm Area", value: "85.4 ha", growth: "Active", icon: <Activity size={24} />, color: "bg-blue-500" },
  ];

  const recentActivities = [
    { id: 1, task: "Corn Planting", location: "Sector A", time: "2 hours ago", status: "Completed" },
    { id: 2, task: "Fertilizer Application", location: "Sector C", time: "5 hours ago", status: "In Progress" },
    { id: 3, task: "Soil Quality Check", location: "Sector B", time: "Yesterday", status: "Pending" },
  ];

  const alerts = [
    { id: 1, msg: "Low Soil Moisture detected in Sector D", type: "critical", icon: <Droplets size={18} /> },
    { id: 2, msg: "Pest Warning: Armyworm reported in nearby farm", type: "warning", icon: <AlertTriangle size={18} /> },
    { id: 3, msg: "Upcoming Rice Harvest in 3 days", type: "info", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- OVERVIEW SECTION --- */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Overview</h2>
          <span className="w-fit text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
            Real-time Data
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={12} /> {stat.growth}
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SUMMARY SECTION --- */}
        <section className="lg:col-span-2 order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Recent Summary</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* 
                RESPONSIVE TABLE FIX:
                1. Wrap in overflow-x-auto
                2. Set min-w on the table to prevent squishing
            */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-[w-500px] border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {recentActivities.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{row.task}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{row.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-400 font-medium">{row.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                          row.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          row.status === 'In Progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 
                          'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Subtle indicator for mobile users that there is more content to scroll */}
            <div className="lg:hidden px-6 py-2 bg-gray-50 dark:bg-slate-800/30 text-[9px] text-gray-400 font-bold uppercase text-center border-t border-gray-100 dark:border-slate-800">
               Swipe horizontally to view more
            </div>
          </div>
        </section>

        {/* --- ALERTS SECTION --- */}
        <section className="order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={20} className="text-amber-500" />
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Alerts</h2>
          </div>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
                  alert.type === 'critical' ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400' :
                  alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400' :
                  'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}
              >
                <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm shrink-0 ${
                   alert.type === 'critical' ? 'text-red-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                }`}>
                  {alert.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black leading-tight uppercase tracking-widest mb-1 opacity-80">
                    {alert.type}
                  </p>
                  <p className="text-xs sm:text-sm font-bold leading-snug">{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardContainer;