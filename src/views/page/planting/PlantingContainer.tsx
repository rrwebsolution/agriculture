import { useState } from 'react';
import { 
  Shovel, Plus, Search, MapPin, Calendar, 
  User, Wheat, ArrowUpRight, Clock, 
  Edit3, Trash2, Eye, Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_PLANTING = [
  { id: 1, farmer: "Juan Dela Cruz", crop: "Rice (RC-222)", sector: "Sector 3 (Lunao)", datePlanted: "Feb 10, 2026", estHarvest: "May 20, 2026", area: "2.5 ha", status: "Vegetative" },
  { id: 2, farmer: "Maria Santos", crop: "Corn (Pioneer)", sector: "Sector 1 (Anakan)", datePlanted: "Jan 15, 2026", estHarvest: "Apr 15, 2026", area: "1.2 ha", status: "Flowering" },
  { id: 3, farmer: "Pedro Penduko", crop: "Cacao", sector: "Sector 4 (Poblacion)", datePlanted: "Dec 05, 2025", estHarvest: "Dec 2028", area: "0.5 ha", status: "Seedling" },
  { id: 4, farmer: "Ana Dimagiba", crop: "Banana", sector: "Sector 2 (Odiongan)", datePlanted: "Nov 20, 2025", estHarvest: "Aug 2026", area: "3.0 ha", status: "Maturity" },
];

// Diri nato kuhaon ang mga unique statuses gikan sa INITIAL_PLANTING data
const statusOptions = ["All Statuses", "Vegetative", "Flowering", "Seedling", "Maturity"];

function PlantingContainer() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses"); // Giusab gikan sa Sector
  const [plantings] = useState(INITIAL_PLANTING);

  // Filter Logic
  const filteredPlantings = plantings.filter(p => {
    const matchesSearch = p.farmer.toLowerCase().includes(search.toLowerCase()) || 
                          p.crop.toLowerCase().includes(search.toLowerCase());
    
    // Filter base sa Status column
    const matchesStatus = selectedStatus === "All Statuses" || p.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shovel className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Field Operations</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Planting <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Log New Planting
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Shovel />} title="Ongoing Plantings" value="142 Logs" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<MapPin />} title="Total Area Logged" value="324.5 ha" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<Wheat />} title="Pending Harvest" value="28 Farms" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<ArrowUpRight />} title="Avg. Growth Rate" value="88%" color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* SEARCH BAR */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Farmer or Crop..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* 🌟 STATUS FILTER (Matched with Column Status) 🌟 */}
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {statusOptions.map((status) => (
                <SelectItem 
                  key={status} 
                  value={status} 
                  className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none"
                >
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* --- PLANTING TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Farmer & Location</th>
                <th className="px-8 py-5">Crop Details</th>
                <th className="px-8 py-5">Timeline</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredPlantings.length > 0 ? (
                filteredPlantings.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 font-black uppercase text-xs shrink-0 border border-blue-200 dark:border-blue-500/20">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{p.farmer}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <MapPin size={12} />
                            <span>{p.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <p className="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">{p.crop}</p>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                            Area: {p.area}
                          </span>
                       </div>
                    </td>

                    <td className="px-8 py-6 align-top pt-8">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                           <Calendar size={12} className="text-gray-400"/>
                           <span>Planted: {p.datePlanted}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary/80">
                           <Clock size={12} />
                           <span>Harvest: {p.estHarvest}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-center align-top pt-8">
                      <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                        p.status === 'Vegetative' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                        p.status === 'Flowering' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                        p.status === 'Maturity' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>

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
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full border border-gray-100 dark:border-slate-800">
                        <Shovel size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">No Plantings Found</p>
                        <p className="text-[10px] font-medium text-gray-400/70 dark:text-slate-600 uppercase italic">
                          Try adjusting your search filters or log a new planting activity.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredPlantings.length} Results</p>
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

export default PlantingContainer;