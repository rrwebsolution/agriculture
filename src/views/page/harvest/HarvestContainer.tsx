import { useState } from 'react';
import { 
  Wheat, Plus, Search, MapPin, Calendar, 
  User, TrendingUp, Edit3, Trash2, Eye, 
  Filter, Scale, PhilippinePeso, BadgeCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_HARVESTS = [
  { id: 1, farmer: "Juan Dela Cruz", crop: "Rice (RC-222)", sector: "Sector 3 (Lunao)", dateHarvested: "Feb 15, 2026", quantity: "4.5 Tons", quality: "Grade A", value: "₱85,500" },
  { id: 2, farmer: "Maria Santos", crop: "Corn (Pioneer)", sector: "Sector 1 (Anakan)", dateHarvested: "Feb 10, 2026", quantity: "2.8 Tons", quality: "Standard", value: "₱42,000" },
  { id: 3, farmer: "Pedro Penduko", crop: "Cacao", sector: "Sector 4 (Poblacion)", dateHarvested: "Jan 28, 2026", quantity: "450 Kg", quality: "Premium", value: "₱67,500" },
  { id: 4, farmer: "Ana Dimagiba", crop: "Banana (Lakatan)", sector: "Sector 2 (Odiongan)", dateHarvested: "Jan 20, 2026", quantity: "1.2 Tons", quality: "Grade A", value: "₱30,000" },
];

// Gikuha ang mga unique quality grades para sa filter
const qualityOptions = ["All Qualities", "Grade A", "Standard", "Premium"];

function HarvestContainer() {
  const [search, setSearch] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("All Qualities"); // Giusab gikan sa Sector
  const [harvests] = useState(INITIAL_HARVESTS);

  // Filter Logic
  const filteredHarvests = harvests.filter(h => {
    const matchesSearch = h.farmer.toLowerCase().includes(search.toLowerCase()) || 
                          h.crop.toLowerCase().includes(search.toLowerCase());
    
    // Filter base sa Quality column
    const matchesQuality = selectedQuality === "All Qualities" || h.quality === selectedQuality;
    
    return matchesSearch && matchesQuality;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wheat className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Harvest Analytics</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Harvest <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Add Harvest Record
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Scale />} title="Total Yield (MT)" value="142.5" color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard icon={<PhilippinePeso />} title="Market Value" value="₱1.2M" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<BadgeCheck />} title="Top Quality" value="85%" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<TrendingUp />} title="Growth Index" value="+12.4%" color="text-amber-500" bgColor="bg-amber-500/10" />
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
        
        {/* 🌟 QUALITY FILTER (Matched with Column Data) 🌟 */}
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          
          <Select value={selectedQuality} onValueChange={setSelectedQuality}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Quality" />
            </SelectTrigger>
            
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {qualityOptions.map((q) => (
                <SelectItem 
                  key={q} 
                  value={q} 
                  className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none"
                >
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* --- HARVEST TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Farmer & Location</th>
                <th className="px-8 py-5">Crop Information</th>
                <th className="px-8 py-5">Harvest Date</th>
                <th className="px-8 py-5">Yield / Quality</th>
                <th className="px-8 py-5">Est. Value</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredHarvests.length > 0 ? (
                filteredHarvests.map((h) => (
                  <tr key={h.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black uppercase text-xs shrink-0 border border-emerald-200 dark:border-emerald-500/20">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{h.farmer}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <MapPin size={12} />
                            <span>{h.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">
                          <Wheat size={16} className="text-primary/70" />
                          {h.crop}
                       </div>
                    </td>

                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-gray-400"/>
                        <span>{h.dateHarvested}</span>
                      </div>
                    </td>

                    <td className="px-8 py-6 align-top pt-7">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm font-black text-gray-800 dark:text-white">
                           <Scale size={14} className="text-gray-400"/>
                           {h.quantity}
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded inline-block ${
                            h.quality === 'Grade A' || h.quality === 'Premium' 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                        }`}>
                            {h.quality}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 align-top pt-8">
                      <p className="text-sm font-black text-primary">{h.value}</p>
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
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full border border-gray-100 dark:border-slate-800">
                        <Wheat size={40} className="text-gray-300 dark:text-slate-600" />
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredHarvests.length} Results</p>
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

export default HarvestContainer;