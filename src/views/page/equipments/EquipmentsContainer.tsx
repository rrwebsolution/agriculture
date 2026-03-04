import { useState } from 'react';
import { 
  Tractor, Plus, Search, Edit3, Trash2, Eye, 
  Filter, Settings, Wrench, AlertCircle, CheckCircle2,
  User, MapPin
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_EQUIPMENTS = [
  { id: 1, name: "Kubota L-Series Tractor", type: "Heavy Machinery", owner: "Agricultural Division", condition: "Excellent", status: "Active", lastService: "Jan 15, 2026" },
  { id: 2, name: "Rice Harvester DC-70", type: "Harvesting", owner: "Cluster 3 (Lunao)", condition: "Fair", status: "Maintenance", lastService: "Feb 02, 2026" },
  { id: 3, name: "Power Tiller", type: "Tillage", owner: "Cluster 1 (Anakan)", condition: "Good", status: "Active", lastService: "Feb 10, 2026" },
  { id: 4, name: "Drone Sprayer V40", type: "Pest Control", owner: "Tech Unit", condition: "Critical", status: "Repair", lastService: "Dec 20, 2025" },
];

const typeOptions = ["All Types", "Heavy Machinery", "Harvesting", "Tillage", "Pest Control"];

function EquipmentsContainer() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [equipments] = useState(INITIAL_EQUIPMENTS);

  // Filter Logic
  const filteredEquipments = equipments.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.owner.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All Types" || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tractor className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Machinery & Assets</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Equipment <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Register New Equipment
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Settings />} title="Total Assets" value="245" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<CheckCircle2 />} title="Operational" value="210" color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard icon={<Wrench />} title="Maintenance" value="12" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<AlertCircle />} title="Repair Needed" value="23" color="text-red-500" bgColor="bg-red-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Equipment or Department..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type} className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- EQUIPMENT TABLE (Poultry Style) --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-237.5">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Equipment & ID</th>
                <th className="px-8 py-5">Type & Category</th>
                <th className="px-8 py-5">Assigned To</th>
                <th className="px-8 py-5">Condition</th>
                <th className="px-8 py-5">Maintenance Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredEquipments.length > 0 ? (
                filteredEquipments.map((e) => (
                  <tr key={e.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* INFO */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-gray-100 dark:border-slate-700">
                          <Tractor size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{e.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">EQP-2026-0{e.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-gray-700 dark:text-slate-300">{e.type}</p>
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight bg-primary/5 px-2 py-0.5 rounded w-fit">Asset</span>
                       </div>
                    </td>

                    {/* OWNER */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-black text-gray-800 dark:text-white uppercase">
                          <User size={14} className="text-primary" /> {e.owner}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                          <MapPin size={10} /> Central Depot
                        </div>
                      </div>
                    </td>

                    {/* CONDITION */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          e.condition === 'Excellent' || e.condition === 'Good' ? 'bg-emerald-500' : 
                          e.condition === 'Fair' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            e.condition === 'Excellent' ? 'text-emerald-600 dark:text-emerald-400' : 
                            e.condition === 'Fair' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                           {e.condition}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md w-fit border ${
                          e.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          e.status === 'Maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {e.status}
                        </span>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Last: {e.lastService}</p>
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
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full border border-gray-100 dark:border-slate-800">
                        <Tractor size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No Equipment Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredEquipments.length} Results</p>
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
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
    </div>
  </div>
);

export default EquipmentsContainer;