import { useState } from 'react';
import { 
  Map, Plus, Search, MapPin, Layers, 
  User, Globe, Edit3, Trash2,
  Filter, Compass, Mountain, Droplets, LocateFixed
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';

// --- MOCK DATA ---
const INITIAL_PARCELS = [
  { id: 1, landId: "LND-001-ANA", owner: "Ricardo Dalisay", area: "5.2 ha", sector: "Sector 1 (Anakan)", soilType: "Loamy", landUse: "Rice/Corn", coordinates: "8.8242° N, 125.0933° E" },
  { id: 2, landId: "LND-042-LUN", owner: "Liza Soberano", area: "2.8 ha", sector: "Sector 3 (Lunao)", soilType: "Clay", landUse: "Banana", coordinates: "8.8315° N, 125.1021° E" },
  { id: 3, landId: "LND-015-ODI", owner: "Coco Martin", area: "12.5 ha", sector: "Sector 2 (Odiongan)", soilType: "Sandy Loam", landUse: "Fishery/Coconut", coordinates: "8.8101° N, 125.0845° E" },
  { id: 4, landId: "LND-088-POB", owner: "Vic Sotto", area: "1.5 ha", sector: "Sector 4 (Poblacion)", soilType: "Loamy", landUse: "Urban Garden", coordinates: "8.8200° N, 125.0900° E" },
];

const sectorOptions = ["All Clusters", "Sector 1 (Anakan)", "Sector 2 (Odiongan)", "Sector 3 (Lunao)", "Sector 4 (Poblacion)"];

function LandmappingContainer() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Clusters");
  const [parcels] = useState(INITIAL_PARCELS);

  // Filter Logic
  const filteredParcels = parcels.filter(p => {
    const matchesSearch = p.owner.toLowerCase().includes(search.toLowerCase()) || 
                          p.landId.toLowerCase().includes(search.toLowerCase()) ||
                          p.landUse.toLowerCase().includes(search.toLowerCase());
    
    const matchesSector = selectedSector === "All Clusters" || p.sector === selectedSector;
    
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Geospatial Intelligence</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Land <span className="text-primary italic">Mapping</span>
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Add New Plot
        </button>
      </div>

      {/* --- SUMMARY METRICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Globe />} title="Total Mapped Area" value="854.2 ha" color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<Layers />} title="Total Parcels" value="1,240" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<Droplets />} title="Average Soil Health" value="Good" color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard icon={<Mountain />} title="Mountainous Zones" value="12 Zones" color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      {/* --- CONTROLS: SEARCH & FILTER --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* SEARCH BAR */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Parcel ID, Owner, or Land Use..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* 🌟 SECTOR FILTER (Matched with Table Data) 🌟 */}
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Select Sector" />
            </SelectTrigger>
            
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {sectorOptions.map((sector) => (
                <SelectItem 
                  key={sector} 
                  value={sector} 
                  className="text-xs font-bold text-gray-700 dark:text-slate-300 cursor-pointer py-3 px-4 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors outline-none"
                >
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* --- LAND REGISTRY TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Parcel ID & Owner</th>
                <th className="px-8 py-5">Total Area</th>
                <th className="px-8 py-5">Sector / Zone</th>
                <th className="px-8 py-5">Soil & Land Use</th>
                <th className="px-8 py-5">GPS Coordinates</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredParcels.length > 0 ? (
                filteredParcels.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* PARCEL & OWNER */}
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-gray-100 dark:border-slate-700">
                          <Globe size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{p.landId}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                            <User size={12} /> {p.owner}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* AREA */}
                    <td className="px-8 py-6 align-top pt-8">
                       <span className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-xs font-black border border-primary/10 inline-block">
                          {p.area}
                       </span>
                    </td>

                    {/* SECTOR */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300">
                        <MapPin size={14} className="text-primary/70" />
                        {p.sector}
                      </div>
                    </td>

                    {/* SOIL & USE */}
                    <td className="px-8 py-6 align-top pt-8">
                       <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-gray-700 dark:text-slate-300">{p.soilType}</p>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                            {p.landUse}
                          </span>
                       </div>
                    </td>

                    {/* GPS */}
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-400">
                        <Compass size={14} className="text-primary/70" />
                        <span>{p.coordinates}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><LocateFixed size={16} /></button>
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
                        <Map size={40} className="text-gray-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">No Parcels Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginator */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredParcels.length} Results</p>
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

export default LandmappingContainer;