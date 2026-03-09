import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sprout, Wheat, Wallet, 
  ArrowUpRight, ArrowDownRight, Activity, CloudSun, 
  Thermometer, MapPin, Plus, ArrowRight,
  Sun, Cloud, CloudRain, CloudLightning, Database, 
  Fish, Anchor, Tractor, Wind, Megaphone, TrendingUp,
} from 'lucide-react';

const DashboardContainer: React.FC = () => {
  // --- WEATHER STATE ---
  const [weatherData, setWeatherData] = useState({
    temp: '--',
    condition: 'Loading...',
    city: 'Locating...',
    icon: <CloudSun size={20} />,
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/10',
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
        const condition = data.weather[0].main; 

        const latRes = data.coord?.lat ?? lat;
        const lonRes = data.coord?.lon ?? lon;
        const city = data.name || `${latRes.toFixed(5)}, ${lonRes.toFixed(5)}`;

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

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        (_error) => {
          fetchWeather(8.8222485, 125.1158747);
        }
      );
    } else {
      fetchWeather(8.8222485, 125.1158747);
    }
  }, []);

  // --- AGRICULTURAL METRICS (No Livestock) ---
  const stats = [
    { title: "Reg. Farmers", value: "1,850", growth: "+12 New Members", icon: <Tractor size={24} />, color: "bg-emerald-500" },
    { title: "Active Fisherfolk", value: "642", growth: "Coastal & Inland", icon: <Anchor size={24} />, color: "bg-blue-600" },
    { title: "Crop Coverage", value: "920 ha", growth: "Rice: 60%, Corn: 40%", icon: <Sprout size={24} />, color: "bg-green-500" },
    { title: "Fishery Yield", value: "15.8 tons", growth: "Tilapia & Bangus", icon: <Fish size={24} />, color: "bg-cyan-500" },
  ];

  // --- SECTOR PERFORMANCE ---
  const sectorPerformance = [
    { name: "Coastal Fisheries", type: "fishery", value: "12.4 Tons", progress: 85, icon: <Anchor size={16} />, color: "bg-blue-500", text: "text-blue-600" },
    { name: "Highland Corn", type: "farming", value: "840 Hectares", progress: 62, icon: <Wheat size={16} />, color: "bg-amber-500", text: "text-amber-600" },
    { name: "Inland Aquaculture", type: "fishery", value: "54 Ponds", progress: 45, icon: <Fish size={16} />, color: "bg-cyan-500", text: "text-cyan-600" },
    { name: "Lowland Rice", type: "farming", value: "1,200 Hectares", progress: 92, icon: <Tractor size={16} />, color: "bg-emerald-500", text: "text-emerald-600" },
  ];

  // --- MARKET WATCH DATA ---
  const marketPrices = [
    { item: "Palay (Dry)", price: "₱23.50", unit: "kg", trend: "up" },
    { item: "Yellow Corn", price: "₱18.00", unit: "kg", trend: "stable" },
    { item: "Tilapia (Fresh)", price: "₱110.00", unit: "kg", trend: "up" },
    { item: "Bangus", price: "₱140.00", unit: "kg", trend: "down" },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const hour = new Date().getHours();
  const greeting = hour >= 12 && hour < 18 ? 'Good afternoon' : hour >= 18 || hour < 5 ? 'Good evening' : 'Good morning';

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
        <QuickActionButton icon={<Tractor size={18} />} label="Register Farmer" />
        <QuickActionButton icon={<Anchor size={18} />} label="Register Fisherfolk" />
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
        
        {/* --- LEFT COLUMN --- */}
        <div className="flex flex-col gap-8">
          
          {/* SYSTEM DATABASE (Now at Top) */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Database size={20} className="text-primary" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">System Database</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2">
               {/* Main Circular-ish Visual */}
               <div className="relative w-full mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Storage Used</p>
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md">System Optimal</p>
                  </div>
                  <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                     <div className="h-full w-[45%] bg-purple-500 absolute top-0 left-0 rounded-full z-10 animate-pulse"></div>
                     <div className="h-full w-[45%] bg-purple-500 absolute top-0 left-0 rounded-full z-10 blur-sm opacity-50"></div>
                  </div>
               </div>

               <div className="flex justify-between w-full items-center">
                  <div>
                    <p className="text-3xl font-black text-gray-800 dark:text-white">4.5<span className="text-lg text-gray-400">GB</span></p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Consumed</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-4"></div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-300 dark:text-slate-600">10<span className="text-lg text-gray-500">GB</span></p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Total Capacity</p>
                  </div>
               </div>
            </div>
          </section>

          {/* SECTOR PERFORMANCE (Now below Database) */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Sector Performance</h2>
              </div>
            </div>
            
            <div className="space-y-6">
              {sectorPerformance.map((sector, i) => (
                <div key={i} className="flex items-center gap-4">
                  {/* Icon Box */}
                  <div className={`w-10 h-10 rounded-2xl ${sector.color} bg-opacity-10 flex items-center justify-center shrink-0 ${sector.text}`}>
                    {sector.icon}
                  </div>
                  
                  {/* Bar and Info */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-700 dark:text-slate-300">{sector.name}</p>
                      <p className="text-[10px] font-black text-gray-400">{sector.value}</p>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${sector.color} transition-all duration-1000`} 
                        style={{ width: `${sector.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* --- RIGHT COLUMN: LIVE OPERATIONS --- */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Live Operations</h2>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowRight size={18} /></button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left h-full">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Sector</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                <ActivityRow 
                  name="Juan D." 
                  loc="Brgy. Lunao" 
                  task="Tilapia Dispersal" 
                  sector="Fishery" 
                  time="12m ago" 
                />
                <ActivityRow 
                  name="Maria S." 
                  loc="Sitio Haruhay" 
                  task="Soil pH Analysis" 
                  sector="Farming" 
                  time="34m ago" 
                />
                <ActivityRow 
                  name="Pedro P." 
                  loc="Brgy. Agay-ayan" 
                  task="Banca Registration" 
                  sector="Fishery" 
                  time="1h ago" 
                />
                <ActivityRow 
                  name="Ana R." 
                  loc="Brgy. San Luis" 
                  task="Fertilizer Dist." 
                  sector="Farming" 
                  time="2h ago" 
                />
                <ActivityRow 
                  name="Luis V." 
                  loc="City Hall" 
                  task="Data Encoding" 
                  sector="Office" 
                  time="3h ago" 
                />
                <ActivityRow 
                  name="Carmen T." 
                  loc="Brgy. Anakan" 
                  task="Cacao Pruning" 
                  sector="Farming" 
                  time="5h ago" 
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* --- BOTTOM SECTION: MARKET WATCH & ADVISORIES (Replacing generic alerts) --- */}
        <section className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Market Watch Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-emerald-500" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Market Watch (Farm Gate)</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {marketPrices.map((item, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{item.item}</p>
                    <p className="text-xl font-black text-gray-800 dark:text-white">{item.price}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {item.trend === 'up' && <ArrowUpRight size={12} className="text-emerald-500"/>}
                      {item.trend === 'down' && <ArrowDownRight size={12} className="text-red-500"/>}
                      {item.trend === 'stable' && <Activity size={12} className="text-gray-400"/>}
                      <span className="text-[9px] font-bold text-gray-400 uppercase">/{item.unit}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Field & Sea Bulletins */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Megaphone size={20} className="text-blue-500" />
              <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Field & Sea Bulletins</h2>
            </div>
            <div className="space-y-4">
              {/* Bulletin 1: Fishery */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-900/10">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                    <Wind size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Fishery Advisory</p>
                    <p className="text-xs font-bold text-gray-600 dark:text-slate-300">Moderate winds affecting coastal barangays. Small sea craft advisory in effect until 5 PM.</p>
                 </div>
              </div>
              
              {/* Bulletin 2: Farming */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-900/10">
                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                    <Sprout size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Crop Notice</p>
                    <p className="text-xs font-bold text-gray-600 dark:text-slate-300">Free corn seeds distribution for Cluster 2 farmers starts tomorrow at the City Agriculture Office.</p>
                 </div>
              </div>
            </div>
          </div>

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

const ActivityRow = ({ name, loc, task, sector, time }: { name: string, loc: string, task: string, sector: string, time: string }) => (
  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-6 py-5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
        {name.split(' ')[0][0]}{name.split(' ')[1]?.[0]}
      </div>
      <p className="text-xs font-black text-gray-700 dark:text-slate-300">{name}</p>
    </td>
    <td className="px-6 py-5">
       <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
          <MapPin size={10} />
          <p className="text-[11px] font-bold uppercase">{loc}</p>
       </div>
    </td>
    <td className="px-6 py-5">
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{task}</p>
    </td>
    <td className="px-6 py-5">
      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
        sector === 'Farming' ? 'bg-emerald-100 text-emerald-600' : 
        sector === 'Fishery' ? 'bg-blue-100 text-blue-600' : 
        'bg-gray-100 text-gray-500'
      }`}>
        {sector}
      </span>
    </td>
    <td className="px-6 py-5 text-right">
      <p className="text-[10px] font-bold text-gray-400">{time}</p>
    </td>
  </tr>
);

export default DashboardContainer;