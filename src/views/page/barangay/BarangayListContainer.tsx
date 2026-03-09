import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setBarangayData, updateBarangayRecord } from '../../../store/slices/barangaySlice';

import { 
  MapPin, Search, Filter, RefreshCw, LandPlot, Building2, 
  Mountain, Waves, X, ChevronUp, AreaChart, PieChart, Users, ArrowRight 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';

import { BarangayMetricCard } from './cards/BarangayMetricCard';
import { BarangayTable } from './table/BarangayTable';
import EditBarangayDialog from './dialog/EditBarangayDialog';
import BarangayProfileDialog from './dialog/BarangayProfileDialog';

const classifications = ["Urban (Poblacion)", "Rural", "Coastal"];

export default function BarangayListContainer() {
  const dispatch = useAppDispatch();
  const { records: barangays, isLoaded } = useAppSelector((state: any) => state.barangay);
  const { records: farmers } = useAppSelector((state: any) => state.farmer);

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classifications");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTopography, setShowTopography] = useState(false);

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFarmerListOpen, setIsFarmerListOpen] = useState(false);
  
  const [selectedBrgy, setSelectedBrgy] = useState<any>(null);
  const [activeView, setActiveView] = useState<'farmers' | 'fishery' | 'cooperatives' | 'all'>('all');
  const [selectedTopographyLabel, setSelectedTopographyLabel] = useState("");
  const [formData, setFormData] = useState({ name: '', type: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🌟 TOPOGRAPHY STATS
  const topographyStats = useMemo(() => {
    const stats = {
      plain: { area: 0, farmers: [] as any[] },
      rolling: { area: 0, farmers: [] as any[] },
      sloping: { area: 0, farmers: [] as any[] }
    };

    farmers.forEach((f: any) => {
      const top = (f.topography || "").toLowerCase();
      const area = Number(f.total_area) || 0;
      if (stats[top as keyof typeof stats]) {
        stats[top as keyof typeof stats].area += area;
        stats[top as keyof typeof stats].farmers.push(f);
      }
    });
    return stats;
  }, [farmers]);

  const dynamicMetrics = useMemo(() => ({
    total: barangays.length,
    urban: barangays.filter((b: any) => b.type === 'Urban (Poblacion)').length,
    rural: barangays.filter((b: any) => b.type === 'Rural').length,
    coastal: barangays.filter((b: any) => b.type === 'Coastal').length,
  }), [barangays]);

  const fetchBarangays = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('barangays');
      dispatch(setBarangayData({ records: response.data.data || [], metrics: response.data.metrics || {} }));
    } catch (error) { toast.error("Failed to load barangay data."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBarangays(false); }, []);

  const handleUpdateBarangay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await axios.put(`barangays/${selectedBrgy.id}`, formData);
      dispatch(updateBarangayRecord(response.data.data));
      toast.success("Barangay updated!");
      setIsEditModalOpen(false);
    } catch (error) { toast.error("Update failed."); }
    finally { setIsSaving(false); }
  };

  const filteredBarangays = useMemo(() => (
    (barangays || []).filter((brgy: any) => {
      const matchesSearch = (brgy.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesClass = selectedClass === "All Classifications" || brgy.type === selectedClass;
      return matchesSearch && matchesClass;
    })
  ), [barangays, search, selectedClass]);

  const openFarmerList = (type: string) => {
    setSelectedTopographyLabel(type);
    setIsFarmerListOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <MapPin size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Geographical Data</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Gingoog <span className="text-primary italic">Barangays</span>
          </h2>
        </div>

        <button 
          onClick={() => setShowTopography(!showTopography)}
          className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer border",
            showTopography ? "bg-primary text-white border-transparent" : "bg-white dark:bg-slate-900 text-primary border-primary/20 hover:bg-primary/5"
          )}
        >
          {showTopography ? <ChevronUp size={16}/> : <AreaChart size={16} />}
          {showTopography ? "Hide Area Statistics" : "View Land Topography Area"}
        </button>
      </div>

      {/* TOPOGRAPHY CARDS */}
      {showTopography && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
           <TopographyAreaCard 
              icon={<Waves className="text-blue-500"/>} 
              label="Plain Land Area" 
              area={topographyStats.plain.area} 
              count={topographyStats.plain.farmers.length}
              onViewFarmers={() => openFarmerList('plain')}
           />
           <TopographyAreaCard 
              icon={<PieChart className="text-amber-500"/>} 
              label="Rolling Land Area" 
              area={topographyStats.rolling.area} 
              count={topographyStats.rolling.farmers.length}
              onViewFarmers={() => openFarmerList('rolling')}
           />
           <TopographyAreaCard 
              icon={<Mountain className="text-emerald-500"/>} 
              label="Sloping Land Area" 
              area={topographyStats.sloping.area} 
              count={topographyStats.sloping.farmers.length}
              onViewFarmers={() => openFarmerList('sloping')}
           />
        </div>
      )}

      {/* MAIN METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BarangayMetricCard isLoading={isLoading} icon={<LandPlot />} title="Total Barangays" value={dynamicMetrics.total.toString()} color="text-primary" bgColor="bg-primary/10" />
        <BarangayMetricCard isLoading={isLoading} icon={<Building2 />} title="Urban Areas" value={dynamicMetrics.urban.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <BarangayMetricCard isLoading={isLoading} icon={<Mountain />} title="Rural Areas" value={dynamicMetrics.rural.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <BarangayMetricCard isLoading={isLoading} icon={<Waves />} title="Coastal Zones" value={dynamicMetrics.coastal.toString()} color="text-cyan-500" bgColor="bg-cyan-500/10" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search Barangay Name..." className="w-full pl-12 pr-12 py-4 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 cursor-pointer"><X size={14} /></button>}
        </div>
        <div className="relative shrink-0 w-full md:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold shadow-sm cursor-pointer"><SelectValue placeholder="Classification" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
              <SelectItem value="All Classifications" className="text-xs font-bold uppercase py-3 cursor-pointer">All Classifications</SelectItem>
              {classifications.map((c) => (<SelectItem key={c} value={c} className="text-xs font-bold uppercase py-3 cursor-pointer">{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <button onClick={() => fetchBarangays(true)} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-primary transition-all shadow-sm cursor-pointer"><RefreshCw size={16} className={cn(isLoading && "animate-spin")} /> Refresh list</button>
      </div>

      {/* TABLE */}
      <BarangayTable 
        isLoading={isLoading} currentBarangays={filteredBarangays.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
        allFilteredItems={filteredBarangays} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={Math.ceil(filteredBarangays.length / itemsPerPage)}
        openProfile={(brgy: any, view: any) => { setSelectedBrgy(brgy); setActiveView(view); setIsProfileModalOpen(true); }}
        openEdit={(brgy: any) => { setSelectedBrgy(brgy); setFormData({ name: brgy.name, type: brgy.type }); setIsEditModalOpen(true); }}
      />

      {/* DIALOGS */}
      <BarangayProfileDialog isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} brgy={selectedBrgy} view={activeView} />
      <EditBarangayDialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} selectedBrgy={selectedBrgy} formData={formData} setFormData={setFormData} onSave={handleUpdateBarangay} isSaving={isSaving} />
      
      {/* 🌟 NEW FARMER LIST BY TOPOGRAPHY DIALOG */}
      <TopographyFarmerListDialog 
        isOpen={isFarmerListOpen} 
        onClose={() => setIsFarmerListOpen(false)} 
        label={selectedTopographyLabel} 
        farmers={topographyStats[selectedTopographyLabel as keyof typeof topographyStats]?.farmers || []} 
      />
    </div>
  );
}

// 🌟 INTERNAL COMPONENT: TOPOGRAPHY AREA CARD
const TopographyAreaCard = ({ icon, label, area, count, onViewFarmers }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-6 transition-all hover:shadow-md relative overflow-hidden group">
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 }) : icon}
    </div>
    <div className="z-10">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <h4 className="text-3xl font-black text-gray-800 dark:text-white leading-none tracking-tighter">{area.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
        <span className="text-[10px] font-black text-primary uppercase italic">HA</span>
      </div>
      <button 
        onClick={onViewFarmers}
        className="mt-2 px-3 py-1.5 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-2 transition-all cursor-pointer group/btn"
      >
        <Users size={12} /> {count} Farmer Records <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform"/>
      </button>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
       {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 120 }) : null}
    </div>
  </div>
);

// 🌟 NEW DIALOG COMPONENT: TOPOGRAPHY FARMER LIST
const TopographyFarmerListDialog = ({ isOpen, onClose, label, farmers }: any) => {
  const [search, setSearch] = useState("");
  if (!isOpen) return null;

  const filtered = farmers.filter((f: any) => 
    `${f.first_name} ${f.last_name}`.toLowerCase().includes(search.toLowerCase()) || 
    f.rsbsa_no?.includes(search)
  );

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="p-8 bg-primary text-white shrink-0">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Farmers List</h3>
                <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest mt-2">{label} Topography Area</p>
             </div>
             <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 cursor-pointer"><X size={20}/></button>
          </div>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input 
              type="text" placeholder="Search by name or RSBSA..." 
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-bold placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filtered.length > 0 ? filtered.map((f: any) => (
            <div key={f.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xs uppercase">{f.last_name[0]}{f.first_name[0]}</div>
                <div>
                  <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase leading-none">{f.first_name} {f.last_name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">RSBSA: {f.rsbsa_no}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-primary leading-none">{Number(f.total_area).toFixed(2)} HA</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 italic">{f.barangay?.name}</p>
              </div>
            </div>
          )) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
               <Users size={32} className="opacity-20 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest">No records found</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 text-center shrink-0">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Records: {filtered.length}</p>
        </div>
      </div>
    </div>
  );
};