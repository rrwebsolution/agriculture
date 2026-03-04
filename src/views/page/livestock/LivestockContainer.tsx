import { useState } from 'react';
import { 
  Beef, Plus, Search, MapPin, User, 
  Edit3, Trash2, Eye, Filter, Syringe, 
  HeartPulse
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_LIVESTOCK = [
  { id: 1, owner: "Ricardo Dalisay", type: "Cattle (Baka)", breed: "Brahman", sector: "Sector 4 (Anakan)", population: "12 heads", health: "Healthy", lastVac: "Jan 10, 2026" },
  { id: 2, owner: "Liza Soberano", type: "Swine (Baboy)", breed: "Landrace", sector: "Sector 1 (Poblacion)", population: "25 heads", health: "Monitoring", lastVac: "Feb 05, 2026" },
  { id: 3, owner: "Coco Martin", type: "Poultry (Manok)", breed: "Broiler", sector: "Sector 3 (Lunao)", population: "500 heads", health: "Healthy", lastVac: "Feb 20, 2026" },
  { id: 4, owner: "Vic Sotto", type: "Goat (Kanding)", breed: "Anglo-Nubian", sector: "Sector 2 (Odiongan)", population: "8 heads", health: "Healthy", lastVac: "Dec 15, 2025" },
];

// Gikuha ang mga categories para sa filter base sa animal types
const typeOptions = ["All Types", "Cattle (Baka)", "Swine (Baboy)", "Poultry (Manok)", "Goat (Kanding)"];

function LivestockContainer() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [livestockList] = useState(INITIAL_LIVESTOCK);

  // Filter Logic
  const filteredLivestock = livestockList.filter(l => {
    const matchesSearch = l.owner.toLowerCase().includes(search.toLowerCase()) || 
                          l.breed.toLowerCase().includes(search.toLowerCase()) ||
                          l.type.toLowerCase().includes(search.toLowerCase());
    
    // Filter base sa Animal Type column
    const matchesType = selectedType === "All Types" || l.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Beef className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Livestock & Poultry Division</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Livestock <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Register New Entry
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Beef />} title="Total Headcount" value="4,250" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<HeartPulse />} title="Healthy Status" value="92%" color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard icon={<Syringe />} title="Vac. Coverage" value="85%" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<User />} title="Active Raisers" value="128" color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* SEARCH BAR */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Owner, Breed, or Animal..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* 🌟 ANIMAL TYPE FILTER (Matched with Column Data) 🌟 */}
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Animal Type" />
            </SelectTrigger>
            
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {typeOptions.map((type) => (
                <SelectItem 
                  key={type} 
                  value={type} 
                  className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none"
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* --- LIVESTOCK TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Owner & Sector</th>
                <th className="px-8 py-5">Animal & Breed</th>
                <th className="px-8 py-5 text-center">Headcount</th>
                <th className="px-8 py-5">Health Status</th>
                <th className="px-8 py-5">Last Vaccination</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredLivestock.length > 0 ? (
                filteredLivestock.map((l) => (
                  <tr key={l.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* OWNER & SECTOR */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-black uppercase text-xs shrink-0 border border-blue-200 dark:border-blue-500/20">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{l.owner}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <MapPin size={12} />
                            <span>{l.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ANIMAL & BREED */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <p className="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">{l.type}</p>
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight bg-primary/5 px-2 py-0.5 rounded w-fit">
                            {l.breed}
                          </span>
                       </div>
                    </td>

                    {/* HEADCOUNT */}
                    <td className="px-8 py-6 text-center align-top pt-8">
                      <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-black text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 inline-block">
                          {l.population}
                      </span>
                    </td>

                    {/* HEALTH STATUS */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${l.health === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            l.health === 'Healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                           {l.health}
                        </span>
                      </div>
                    </td>

                    {/* VACCINATION */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Syringe size={14} className="text-primary/70" />
                        <span>{l.lastVac}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Eye size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                /* EMPTY STATE */
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full border border-gray-100 dark:border-slate-800">
                        <Beef size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">No Records Found</p>
                        <p className="text-[10px] font-medium text-gray-400/70 dark:text-slate-600 uppercase italic">
                          Try adjusting your search filters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredLivestock.length} Results</p>
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Prev</button>
                <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all">Next</button>
            </div>
        </div>
      </div>

    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor }: { icon: any, title: string, value: string, color: string, bgColor: string }) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
    </div>
  </div>
);

export default LivestockContainer;