import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setBarangayData, updateBarangayRecord } from '../../../store/slices/barangaySlice';
import { MapPin, Search, Filter, RefreshCw, LandPlot, Building2, Mountain, Waves, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';

import { BarangayMetricCard } from './cards/BarangayMetricCard';
import { BarangayTable } from './table/BarangayTable';
import EditBarangayDialog from './dialog/EditBarangayDialog';
import BarangayProfileDialog from './dialog/BarangayProfileDialog';

const classifications = ["Urban (Poblacion)","Rural", "Coastal"];

export default function BarangayListContainer() {
  const dispatch = useAppDispatch();
  const { records: barangays, metrics, isLoaded } = useAppSelector((state: any) => state.barangay);

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classifications");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedBrgy, setSelectedBrgy] = useState<any>(null);
  const [activeView, setActiveView] = useState<'farmers' | 'fishery' | 'cooperatives' | 'all'>('all');
  const [formData, setFormData] = useState({ name: '', type: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBarangays = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('barangays');
      dispatch(setBarangayData({
        records: response.data.data || [],
        metrics: response.data.metrics || { total: 0, urban: 0, rural: 0, coastal: 0 }
      }));
    } catch (error) {
      toast.error("Failed to load barangay data.");
    } finally {
      setIsLoading(false);
    }
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
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBarangays = (barangays || []).filter((brgy:any) => {
    const matchesSearch = (brgy.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "All Classifications" || brgy.type === selectedClass;
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredBarangays.length / itemsPerPage);
  const currentBarangays = filteredBarangays.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BarangayMetricCard 
          isLoading={isLoading} 
          icon={<LandPlot />} 
          title="Total Barangays" 
          value={metrics?.total?.toString() || "0"} 
          color="text-primary" 
          bgColor="bg-primary/10" 
        />
        <BarangayMetricCard 
          isLoading={isLoading} 
          icon={<Building2 />} 
          title="Urban Areas" 
          value={metrics?.urban?.toString() || "0"} 
          color="text-blue-500" 
          bgColor="bg-blue-500/10" 
        />
        <BarangayMetricCard 
          isLoading={isLoading} 
          icon={<Mountain />} 
          title="Rural Areas" 
          value={metrics?.rural?.toString() || "0"} 
          color="text-emerald-500" 
          bgColor="bg-emerald-500/10" 
        />
        <BarangayMetricCard 
          isLoading={isLoading} 
          icon={<Waves />} 
          title="Coastal Zones" 
          value={metrics?.coastal?.toString() || "0"} 
          color="text-cyan-500" 
          bgColor="bg-cyan-500/10" 
        />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          
          <input 
            type="text" 
            placeholder="Search Barangay Name..." 
            className="w-full pl-12 pr-12 py-4 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />

          {/* X Button (Clear Search) */}
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
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
        <button onClick={() => fetchBarangays(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-primary hover:text-primary transition-all shadow-sm">
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} /> {isLoading ? "Refreshing..." : "Refresh list"}
        </button>
      </div>

      <BarangayTable 
        isLoading={isLoading}
        currentBarangays={currentBarangays}
        allFilteredItems={filteredBarangays}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        openProfile={(brgy: any, view: any) => { 
            setSelectedBrgy(brgy); setActiveView(view); setIsProfileModalOpen(true); 
        }}
        openEdit={(brgy: any) => {
            setSelectedBrgy(brgy); setFormData({ name: brgy.name, type: brgy.type }); setIsEditModalOpen(true);
        }}
      />

      <BarangayProfileDialog isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} brgy={selectedBrgy} view={activeView} />
      <EditBarangayDialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} selectedBrgy={selectedBrgy} formData={formData} setFormData={setFormData} onSave={handleUpdateBarangay} isSaving={isSaving} />
    </div>
  );
}