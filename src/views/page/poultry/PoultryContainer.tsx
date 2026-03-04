import { useState } from 'react';
import { 
  Bird, Plus, Search, MapPin, User, 
  Edit3, Trash2, Eye, Filter, Egg, 
  TrendingDown, ShieldAlert
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_POULTRY = [
  { id: 1, owner: "Fernando Poe Jr.", type: "Broiler", breed: "Cobb 500", sector: "Sector 3 (Lunao)", population: "1,200 birds", mortality: "2%", health: "Stable", lastAudit: "Feb 20, 2026" },
  { id: 2, owner: "Susan Roces", type: "Layer (Itlog)", breed: "Dekalb White", sector: "Sector 1 (Anakan)", population: "850 birds", mortality: "1%", health: "Excellent", lastAudit: "Feb 22, 2026" },
  { id: 3, owner: "Judy Ann Santos", type: "Duck (Itik)", breed: "Pekin", sector: "Sector 2 (Odiongan)", population: "450 birds", mortality: "0.5%", health: "Stable", lastAudit: "Feb 18, 2026" },
  { id: 4, owner: "Piolo Pascual", type: "Broiler", breed: "Ross 308", sector: "Sector 4 (Poblacion)", population: "2,000 birds", mortality: "5%", health: "Critical", lastAudit: "Feb 23, 2026" },
];

// Gikuha ang mga poultry types para sa filter
const typeOptions = ["All Types", "Broiler", "Layer (Itlog)", "Duck (Itik)"];

function PoultryContainer() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [poultryList] = useState(INITIAL_POULTRY);

  // Filter Logic
  const filteredPoultry = poultryList.filter(p => {
    const matchesSearch = p.owner.toLowerCase().includes(search.toLowerCase()) || 
                          p.breed.toLowerCase().includes(search.toLowerCase()) ||
                          p.type.toLowerCase().includes(search.toLowerCase());
    
    // Filter base sa Poultry Type column
    const matchesType = selectedType === "All Types" || p.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bird className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Avian & Poultry Division</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Poultry <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Register Poultry Farm
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Bird />} title="Total Population" value="14.5k" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<Egg />} title="Daily Production" value="2,400" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<TrendingDown />} title="Avg. Mortality" value="2.1%" color="text-red-500" bgColor="bg-red-500/10" />
        <MetricCard icon={<ShieldAlert />} title="Biosecurity Level" value="94%" color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* SEARCH BAR */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Owner, Type, or Breed..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* 🌟 POULTRY TYPE FILTER (Matched with Column Data) 🌟 */}
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Type" />
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

      {/* --- POULTRY TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Farm Owner & Location</th>
                <th className="px-8 py-5">Poultry Type & Breed</th>
                <th className="px-8 py-5">Population</th>
                <th className="px-8 py-5">Mortality Rate</th>
                <th className="px-8 py-5">Health Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredPoultry.length > 0 ? (
                filteredPoultry.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* OWNER & SECTOR */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-black uppercase text-xs shrink-0 border border-blue-200 dark:border-blue-500/20">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{p.owner}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <MapPin size={12} />
                            <span>{p.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TYPE & BREED */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <p className="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">{p.type}</p>
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight bg-primary/5 px-2 py-0.5 rounded w-fit">
                            {p.breed}
                          </span>
                       </div>
                    </td>

                    {/* POPULATION */}
                    <td className="px-8 py-6 align-top pt-8">
                       <p className="text-sm font-black text-gray-800 dark:text-white uppercase">
                          {p.population}
                       </p>
                    </td>

                    {/* MORTALITY */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2">
                        <TrendingDown size={14} className={parseFloat(p.mortality) > 3 ? "text-red-500" : "text-emerald-500"} />
                        <p className={`text-xs font-black ${parseFloat(p.mortality) > 3 ? "text-red-500" : "text-gray-700 dark:text-slate-300"}`}>
                           {p.mortality}
                        </p>
                      </div>
                    </td>

                    {/* HEALTH STATUS */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.health === 'Excellent' || p.health === 'Stable' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            p.health === 'Excellent' || p.health === 'Stable' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                           {p.health}
                        </span>
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
                        <Bird size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">No Poultry Records Found</p>
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredPoultry.length} Results</p>
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

export default PoultryContainer;