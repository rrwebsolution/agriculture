import { useState } from 'react';
import { 
  Shovel, Plus, Search, MapPin, Calendar, 
  User, Wheat, ArrowUpRight, Clock, 
  Edit3, Trash2, Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import PlantingDialog from './dialog/PlantingDialog';

const INITIAL_PLANTING = [
  { id: 1, farmer: "Juan Dela Cruz", crop: "Rice (RC-222)", sector: "Sector 3 (Lunao)", datePlanted: "Feb 10, 2026", estHarvest: "May 20, 2026", area: "2.5 ha", status: "Vegetative" },
  { id: 2, farmer: "Maria Santos", crop: "Corn (Pioneer)", sector: "Sector 1 (Anakan)", datePlanted: "Jan 15, 2026", estHarvest: "Apr 15, 2026", area: "1.2 ha", status: "Flowering" },
  { id: 3, farmer: "Pedro Penduko", crop: "Cacao", sector: "Sector 4 (Poblacion)", datePlanted: "Dec 05, 2025", estHarvest: "Dec 2028", area: "0.5 ha", status: "Seedling" },
  { id: 4, farmer: "Ana Dimagiba", crop: "Banana", sector: "Sector 2 (Odiongan)", datePlanted: "Nov 20, 2025", estHarvest: "Aug 2026", area: "3.0 ha", status: "Maturity" },
];

const statusOptions = ["All Statuses", "Vegetative", "Flowering", "Seedling", "Maturity"];
const emptyForm = { farmer: '', sector: '', crop: '', area: '', datePlanted: '', estHarvest: '', status: 'Seedling' };

function PlantingContainer() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [plantings, setPlantings] = useState(INITIAL_PLANTING);

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const filteredPlantings = plantings.filter(p => {
    const matchesSearch = p.farmer.toLowerCase().includes(search.toLowerCase()) || p.crop.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === "All Statuses" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newEntry = { id: plantings.length + 1, ...formData, area: formData.area.includes('ha') ? formData.area : `${formData.area} ha` };
      setPlantings([newEntry, ...plantings]);
      setIsSaving(false);
      setIsDialogOpen(false);
      setFormData(emptyForm);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shovel className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Field Operations</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Planting <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
          <Plus size={18} /> Log New Planting
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Shovel />} title="Ongoing Plantings" value={`${plantings.length} Logs`} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard icon={<MapPin />} title="Total Area Logged" value="324.5 ha" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<Wheat />} title="Pending Harvest" value="28 Farms" color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<ArrowUpRight />} title="Avg. Growth Rate" value="88%" color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search Farmer or Crop..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative shrink-0 w-full sm:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50">
              {statusOptions.map((s) => (<SelectItem key={s} value={s} className="text-xs font-bold py-3 px-4 rounded-xl cursor-pointer">{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE (Simplified for brevity, keep your original table here) */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse min-w-225">
             <thead className="bg-gray-50/95 dark:bg-slate-800/95 sticky top-0 z-10">
               <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 <th className="px-8 py-5">Farmer & Location</th>
                 <th className="px-8 py-5">Crop Details</th>
                 <th className="px-8 py-5">Timeline</th>
                 <th className="px-8 py-5 text-center">Status</th>
                 <th className="px-8 py-5 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
               {filteredPlantings.map((p) => (
                 <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                   <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600"><User size={18}/></div><div><p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{p.farmer}</p><p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><MapPin size={10}/>{p.sector}</p></div></div></td>
                   <td className="px-8 py-6"><p className="text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">{p.crop}</p><span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">Area: {p.area}</span></td>
                   <td className="px-8 py-6"><div className="space-y-1"><p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Calendar size={10}/>{p.datePlanted}</p><p className="text-xs font-bold text-primary flex items-center gap-1"><Clock size={10}/>{p.estHarvest}</p></div></td>
                   <td className="px-8 py-6 text-center"><span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-primary/10 text-primary">{p.status}</span></td>
                   <td className="px-8 py-6 text-right"><div className="flex justify-end gap-1"><button className="p-2 text-gray-400 hover:text-primary"><Edit3 size={16}/></button><button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div></td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG COMPONENT */}
      <PlantingDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} formData={formData} setFormData={setFormData} isSaving={isSaving} isEdit={false} />
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor }: any) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
    </div>
  </div>
);

export default PlantingContainer;