import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sprout, Wheat, Wallet, AlertTriangle, Calendar, 
  ArrowUpRight, Activity, Droplets, Waves, Beef, CloudSun, 
  Thermometer, MapPin, Plus, ArrowRight,
  Sun, Cloud, CloudRain, CloudLightning
} from 'lucide-react';

const DashboardContainer: React.FC = () => {
  // --- WEATHER STATE ---
  const [weatherData, setWeatherData] = useState({
    temp: '--',
    condition: 'Loading...',
    city: 'Locating...',
    icon: <CloudSun size={20} />,
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/10', // Default color
    lat: undefined as number | undefined,
    lon: undefined as number | undefined
  });

  // --- FETCH LIVE WEATHER ---
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res: { data: { main: { temp: number }; weather: Array<{ main: string }>; name: string; coord: { lat: number; lon: number } } } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHERMAP_KEY}&units=metric`);
        const data = res.data;

        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].main; // e.g., "Clear", "Rain", "Clouds"

        // prefer coordinates returned by API (if present), otherwise use the ones we requested
        const latRes = data.coord?.lat ?? lat;
        const lonRes = data.coord?.lon ?? lon;

        // Use API place name when available; otherwise display the coordinates
        const city = data.name || `${latRes.toFixed(5)}, ${lonRes.toFixed(5)}`;

        // Dynamic Icon ug Color base sa Panahon
        let icon = <CloudSun size={20} />;
        let color = 'text-gray-500 bg-gray-100 dark:bg-gray-800';

        if (condition === 'Clear') {
          icon = <Sun size={20} />;
          color = 'text-amber-500 bg-amber-100 dark:bg-amber-500/10';
        } else if (condition === 'Rain' || condition === 'Drizzle') {
          icon = <CloudRain size={20} />;
          color = 'text-blue-500 bg-blue-100 dark:bg-blue-500/10';
        } else if (condition === 'Thunderstorm') {
          icon = <CloudLightning size={20} />;
          color = 'text-purple-500 bg-purple-100 dark:bg-purple-500/10';
        } else if (condition === 'Clouds') {
          icon = <Cloud size={20} />;
          color = 'text-slate-500 bg-slate-100 dark:bg-slate-800';
        }

        setWeatherData({ temp: temp.toString(), condition, city, icon, color, lat: latRes, lon: lonRes });

      } catch (error: any) {
        console.error("Failed to fetch weather", error?.response?.status, error?.response?.data || error?.message);
        setWeatherData(prev => ({ 
          ...prev, 
          condition: 'Unavailable', 
          temp: '--', 
          city: 'Offline',
          lat: undefined,
          lon: undefined
        }));
      }
    };

    // Pangayuon ang Location sa User gamit ang Browser Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // KUNG I-ALLOW SA USER: Gamiton ang iyang current location
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (_error) => {
          // KUNG I-DENY/ERROR: Mo-default sa GINGOOG CITY coordinates
          console.warn("Location access denied. Defaulting to Gingoog City.");
          fetchWeather(8.8222485, 125.1158747);
        }
      );
    } else {
      // Kung walay geolocation feature ang browser, default to Gingoog
      fetchWeather(8.8222485, 125.1158747);
    }
  }, []);

  // --- AGRICULTURAL METRICS ---
  const stats = [
    { title: "Total Farmers", value: "1,240", growth: "+4% from last month", icon: <UsersIcon size={24} />, color: "bg-emerald-500" },
    { title: "Active Crops", value: "854.2 ha", growth: "Rice & Corn leading", icon: <Sprout size={24} />, color: "bg-green-600" },
    { title: "Livestock Count", value: "4,250", growth: "Poultry: 3k, Cattle: 1.2k", icon: <Beef size={24} />, color: "bg-orange-500" },
    { title: "Fishery Yield", value: "12.5 tons", growth: "Current Quarter", icon: <Waves size={24} />, color: "bg-blue-500" },
  ];

  // --- CLUSTER PERFORMANCE (Gingoog Zones) ---
  const clusterPerformance = [
    { name: "Cluster 1 (Anakan)", productivity: 85, color: "bg-emerald-500" },
    { name: "Cluster 2 (Odiongan)", productivity: 62, color: "bg-blue-500" },
    { name: "Cluster 3 (Lunao)", productivity: 92, color: "bg-amber-500" },
    { name: "Cluster 4 (Poblacion)", productivity: 45, color: "bg-purple-500" },
  ];

  const alerts = [
    { id: 1, msg: "Low Soil Moisture detected in Cluster 3", type: "critical", icon: <Droplets size={18} /> },
    { id: 2, msg: "Pest Warning: Armyworm reported in Mis. Or. areas", type: "warning", icon: <AlertTriangle size={18} /> },
    { id: 3, msg: "Seed Distribution scheduled for next Monday", type: "info", icon: <Calendar size={18} /> },
  ];

  // Dynamic Date Format (e.g., Feb 24, 2024)
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Time-based greeting (Cebuano + English)
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else if (hour >= 18 || hour < 5) {
    greeting = 'Good evening';
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- WELCOME & WEATHER HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            {greeting}, <span className="text-primary italic">Agriculturist!</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Gingoog City Agricultural Portal • {currentDate}
          </p>
        </div>

        {/* 🌟 LIVE WEATHER WIDGET 🌟 */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 pr-4 border-r border-gray-100 dark:border-slate-800">
            <div className={`p-2 rounded-xl ${weatherData.color} transition-colors duration-500`}>
              {weatherData.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none truncate max-w-25" title={weatherData.city}>
                {weatherData.city}
              </p>
              {weatherData.lat !== undefined && weatherData.lon !== undefined && (
                <p className="text-[9px] text-gray-400 mt-0.5">{weatherData.lat.toFixed(5)}, {weatherData.lon.toFixed(5)}</p>
              )}
              <p className="text-sm font-black text-gray-800 dark:text-white mt-1">
                {weatherData.condition}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-15 justify-end">
            <Thermometer size={18} className={`${parseInt(weatherData.temp) > 30 ? 'text-red-500' : 'text-blue-500'} transition-colors duration-500`} />
            <span className="text-lg font-black text-gray-800 dark:text-white">{weatherData.temp}°C</span>
          </div>
        </div>
      </div>

      {/* --- QUICK ACTIONS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionButton icon={<Plus size={18} />} label="Add Planting Log" />
        <QuickActionButton icon={<Sprout size={18} />} label="Register Farmer" />
        <QuickActionButton icon={<Wheat size={18} />} label="Record Harvest" />
        <QuickActionButton icon={<Wallet size={18} />} label="New Expense" />
      </div>

      {/* --- MAIN METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="relative z-10">
                <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                <p className="text-[9px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase tracking-tighter">
                   <ArrowUpRight size={12} /> {stat.growth}
                </p>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CLUSTER PERFORMANCE --- */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Cluster Productivity</h2>
            </div>
            <button className="text-[10px] font-black text-primary uppercase hover:underline">View Map</button>
          </div>
          
          <div className="space-y-6">
            {clusterPerformance.map((cluster, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase">{cluster.name}</p>
                  <p className="text-xs font-black text-primary">{cluster.productivity}%</p>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cluster.color} transition-all duration-1000`} 
                    style={{ width: `${cluster.productivity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
             <p className="text-[10px] font-black text-primary uppercase mb-1">Top Performer</p>
             <p className="text-xs font-bold text-gray-700 dark:text-slate-300">Cluster 3 (Lunao) shows 12% increase in Rice production this season.</p>
          </div>
        </section>

        {/* --- RECENT ACTIVITY TABLE --- */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Live Operations</h2>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowRight size={18} /></button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-4">Technician</th>
                  <th className="px-8 py-4">Task</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                <ActivityRow name="Juan D." task="Vaccination" status="Livestock" time="10m ago" />
                <ActivityRow name="Maria S." task="Seed Dist." status="Crops" time="45m ago" />
                <ActivityRow name="Pedro P." task="Boat Audit" status="Fisheries" time="2h ago" />
                <ActivityRow name="Ana R." task="Expenses" status="Finance" time="5h ago" />
              </tbody>
            </table>
          </div>
        </section>

        {/* --- ALERTS & NOTIFICATIONS --- */}
        <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all hover:-translate-y-1 ${
                alert.type === 'critical' ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-900/20 text-red-700' :
                alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-900/20 text-amber-700' :
                'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-900/20 text-blue-700'
              }`}
            >
              <div className={`p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm shrink-0 ${
                 alert.type === 'critical' ? 'text-red-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
              }`}>
                {alert.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{alert.type}</p>
                <p className="text-xs font-black dark:text-white leading-tight">{alert.msg}</p>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const QuickActionButton = ({ icon, label }: { icon: any, label: string }) => (
  <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:border-primary hover:text-primary transition-all group">
    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl mb-2 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const ActivityRow = ({ name, task, status, time }: { name: string, task: string, status: string, time: string }) => (
  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-8 py-5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
        {name.split(' ')[0][0]}{name.split(' ')[1]?.[0]}
      </div>
      <p className="text-xs font-black text-gray-700 dark:text-slate-300">{name}</p>
    </td>
    <td className="px-8 py-5">
      <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{task}</p>
    </td>
    <td className="px-8 py-5">
      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
        status === 'Livestock' ? 'bg-orange-100 text-orange-600' : 
        status === 'Crops' ? 'bg-emerald-100 text-emerald-600' : 
        status === 'Fisheries' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
      }`}>
        {status}
      </span>
    </td>
    <td className="px-8 py-5">
      <p className="text-[10px] font-bold text-gray-400">{time}</p>
    </td>
  </tr>
);

const UsersIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default DashboardContainer;