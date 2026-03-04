import { useState, useEffect } from 'react';
import { 
  Waves, Plus, Search, MapPin, User, Ship, 
  Edit3, Trash2, Filter, Fish, Scale, Calendar, Phone, VenusAndMars
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import FisheryDialog from './dialog/FisheryDialog';

// --- 🌟 MOCK DATA 🌟 ---
const MOCK_BARANGAYS = [
  { id: 1, name: "Lunao" }, { id: 2, name: "Anakan" }, { id: 3, name: "Odiongan" }, { id: 4, name: "Poblacion" }
];

const INITIAL_RECORDS = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  fishr_id: `FSH-2026-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
  name: ["Roberto Generalao", "Danilo Ramos", "Maria Santos", "Juan Dela Mar", "Santi Bakuna"][i % 5],
  gender: i % 3 === 0 ? "Female" : "Male",
  contact_no: "0917-123-4567",
  boat_name: i % 2 === 0 ? "MB Gingoog-1" : "Non-Motorized",
  gear_type: ["Gill Net", "Hook & Line", "Net", "Traps"][i % 4],
  location_id: ((i % 4) + 1).toString(),
  location: { name: MOCK_BARANGAYS[i % 4].name },
  catch_species: ["Tuna", "Bangus", "Tilapia", "Mackerel"][i % 4],
  yield: (Math.random() * 100 + 20).toFixed(0),
  date: "2026-02-22"
}));

const gearOptions = ["All Gear Types", "Gill Net", "Hook & Line", "Net", "Traps", "Spear"];

function FisheriesContainer() {
  const [search, setSearch] = useState("");
  const [selectedGear, setSelectedGear] = useState("All Gear Types");
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 🌟 PAGINATION LOGIC 🌟
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust how many rows per page

  const filteredRecords = records.filter(r => 
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.fishr_id.toLowerCase().includes(search.toLowerCase())) &&
    (selectedGear === "All Gear Types" || r.gear_type === selectedGear)
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGear]);

  const handleUpdate = (data: any, mode: 'add' | 'edit') => {
    if (mode === 'add') {
      const newRec = { ...data, id: Date.now(), location: MOCK_BARANGAYS.find(b => b.id.toString() === data.location_id) };
      setRecords([newRec, ...records]);
    } else {
      setRecords(records.map(r => r.id === data.id ? { ...data, location: MOCK_BARANGAYS.find(b => b.id.toString() === data.location_id) } : r));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Waves className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Maritime Resources</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Fisheries <span className="text-primary italic">& Management</span>
          </h2>
        </div>
        <button onClick={() => { setSelectedRecord(null); setIsDialogOpen(true); }} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
          <Plus size={18} /> Record New Catch
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Scale />} title="Total Yield" value="1,240 kg" color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard icon={<Ship />} title="Active Boats" value="12" color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard icon={<User />} title="Total Fishers" value={records.length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard icon={<Fish />} title="Target Species" value="Tuna" color="text-purple-500" bgColor="bg-purple-500/10" />
      </div>

      {/* SEARCH/FILTER */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search name or FishR ID..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative shrink-0 w-60">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedGear} onValueChange={setSelectedGear}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Gear Type" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
              {gearOptions.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Fisherfolk Personal Info</th>
                <th className="px-8 py-5">Boat & Gear</th>
                <th className="px-8 py-5">Species Caught</th>
                <th className="px-8 py-5">Yield / Weight</th>
                <th className="px-8 py-5">Location / Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {currentItems.length > 0 ? (
                currentItems.map((r) => (
                  <tr key={r.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs border border-primary/20 shrink-0">{r.name.substring(0,2).toUpperCase()}</div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{r.name}</p>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded w-fit">FishR: {r.fishr_id}</span>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                <VenusAndMars size={10}/> {r.gender} • <Phone size={10}/> {r.contact_no}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300"><Ship size={14} className="text-primary/60" />{r.boat_name}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.gear_type}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top pt-8"><div className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight"><Fish size={16} className="text-blue-500" />{r.catch_species}</div></td>
                    <td className="px-8 py-6 align-top pt-8"><div className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-slate-300"><Scale size={16} className="text-emerald-500" />{r.yield} kg</div></td>
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300"><MapPin size={14} className="text-primary/60" />{r.location.name}</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><Calendar size={12} /> {r.date}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedRecord(r); setIsDialogOpen(true); }} className="p-2 text-gray-400 hover:text-primary transition-all cursor-pointer"><Edit3 size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-24 text-center text-gray-400 uppercase text-xs italic">No Records Found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🌟 PAGINATION FOOTER 🌟 */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {filteredRecords.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} Entries
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer"
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button 
                  key={pageNum} 
                  onClick={() => setCurrentPage(pageNum)} 
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer ${currentPage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary'}`}
                >
                  {pageNum}
                </button>
            ))}

            <button 
              disabled={currentPage >= totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <FisheryDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onUpdate={handleUpdate} record={selectedRecord} barangays={MOCK_BARANGAYS} />
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor }: any) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p><h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3></div>
  </div>
);

export default FisheriesContainer;