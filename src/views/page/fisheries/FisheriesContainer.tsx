import { useState, useEffect, useMemo } from 'react';
import { 
  Waves, Plus, Search,
  Filter, Fish, Scale, RefreshCw, Calendar, X, Download, Activity, ClipboardList, PhilippinePeso
} from 'lucide-react'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { cn } from '../../../lib/utils';

import FisheryDialog from './dialog/FisheryDialog';
import FisheryViewDialog from './dialog/FisheryViewDialog'; 
import FisheryTable from './table/FisheryTable';
import FisheryChart from './cards/FisheryChart';

import { useAppDispatch, useAppSelector } from '../../../store/hooks'; 
import { setFisheryData, updateFisheryRecord, deleteFisheryRecord } from '../../../store/slices/fisherySlice';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function FisheriesContainer() {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [selectedGear, setSelectedGear] = useState("All Gear Types");
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState("");

  const { records: fisherfolks = [] } = useAppSelector((state: any) => state.fisherfolk || { records: [] });
  const { records = [], isLoaded } = useAppSelector((state: any) => state.fishery || { records: [] });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false); 
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }});

  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const res = await axios.get('fisheries', getAuthHeaders());
      dispatch(setFisheryData(res.data.data || []));
    } catch {
      toast.error("Failed to load catch records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(false); }, []);

  // 🌟 GI-FIX: Karon kuhaon na lang niya ang unique gear types gikan sa records.
  const dynamicGearOptions = useMemo(() => {
    const existingGears = Array.isArray(records) 
      ? records.map((r: any) => r.gear_type).filter(Boolean) 
      : [];
    return ["All Gear Types", ...Array.from(new Set(existingGears))];
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return records.filter((r: any) => {
      const matchesSearch = (String(r.name || "").toLowerCase().includes(search.toLowerCase()) || String(r.fishr_id || "").toLowerCase().includes(search.toLowerCase()));
      const matchesGear = selectedGear === "All Gear Types" || r.gear_type === selectedGear;
      
      let matchesDate = true;
      if (startDate || endDate) {
        if (!r.date) matchesDate = false;
        else {
          const recordDate = new Date(r.date);
          recordDate.setHours(0, 0, 0, 0);
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (recordDate < start) matchesDate = false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (recordDate > end) matchesDate = false;
          }
        }
      }
      return matchesSearch && matchesGear && matchesDate;
    });
  }, [records, search, selectedGear, startDate, endDate]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentItems = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdate = async (data: any, mode: 'add' | 'edit') => {
    setIsSaving(true);
    try {
      if (mode === 'edit') {
        const res = await axios.put(`fisheries/${data.id}`, data, getAuthHeaders());
        dispatch(updateFisheryRecord({ data: res.data.data, mode: 'edit' }));
        toast.success("Record updated!");
      } else {
        const res = await axios.post('fisheries', data, getAuthHeaders());
        dispatch(updateFisheryRecord({ data: res.data.data, mode: 'add' }));
        toast.success("Catch record added!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This catch record will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`fisheries/${id}`, getAuthHeaders());
        dispatch(deleteFisheryRecord(id)); 
        toast.success("Record deleted successfully.");
      } catch {
        toast.error("Failed to delete record.");
      }
    }
  };

  const totalYield = filteredRecords.reduce((acc: number, r: any) => acc + parseFloat(String(r.yield || 0)), 0);
  const totalValue = filteredRecords.reduce((acc: number, r: any) => acc + parseFloat(String(r.market_value || 0)), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Waves size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Maritime Resources</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Fisheries <span className="text-primary italic">& Catch Log</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary border border-primary/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
            <Download size={18} /> Export Data
          </button>
          <button onClick={() => { setSelectedRecord(null); setIsDialogOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
            <Plus size={18} /> Record Catch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLoading={isLoading} icon={<Scale />} title="Total Yield" value={`${totalYield.toFixed(1)} kg`} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard isLoading={isLoading} icon={<PhilippinePeso />} title="Market Value" value={`₱${totalValue.toLocaleString()}`} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<Activity />} title="Total Records" value={records.length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard isLoading={isLoading} icon={<Fish />} title="Target Species" value="Mixed" color="text-purple-500" bgColor="bg-purple-500/10" />
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col 2xl:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search Fisherfolk..." className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer"><X size={14} /></button>}
          </div>
          
          <div className="relative flex items-center bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl h-13 px-4 gap-3 w-full sm:w-auto shrink-0 transition-all focus-within:ring-2 focus-within:ring-primary shadow-sm">
            <Calendar className="text-gray-400 shrink-0" size={18} />
            <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">From Date</span><input type="date" className={cn("bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-slate-200 cursor-pointer w-28")} value={startDate} onChange={(e) => setStartDate(e.target.value)}/></div>
            <div className="w-px h-6 bg-gray-100 dark:bg-slate-800 shrink-0 mx-1" />
            <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">To Date</span><input type="date" className={cn("bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-slate-200 cursor-pointer w-28")} value={endDate} onChange={(e) => setEndDate(e.target.value)}/></div>
            {(startDate || endDate) && <button onClick={() => { setStartDate(""); setEndDate(""); }} className="p-1 text-red-300 hover:text-red-500 rounded-full transition-all ml-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm cursor-pointer"><X size={14} /></button>}
          </div>

          <div className="relative shrink-0 w-full sm:w-auto xl:w-56">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <Select value={selectedGear} onValueChange={setSelectedGear}>
              <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer shadow-sm">
                <SelectValue placeholder="All Gear Types" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                {dynamicGearOptions.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <button onClick={() => fetchData(true)} disabled={isLoading} className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary transition-all cursor-pointer disabled:opacity-30">
            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
            <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
           <Activity className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Analytics Overview</h2>
        </div>
        <FisheryChart data={filteredRecords} isLoading={isLoading} />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
           <ClipboardList className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Catch Records Database</h2>
        </div>
        <FisheryTable 
          isLoading={isLoading} 
          items={currentItems} 
          totalItems={filteredRecords.length} 
          indexOfFirstItem={(currentPage - 1) * itemsPerPage} 
          indexOfLastItem={currentPage * itemsPerPage}
          currentPage={currentPage} 
          totalPages={totalPages} 
          setCurrentPage={setCurrentPage}
          onView={(r: any) => { setSelectedRecord(r); setIsViewOpen(true); }} 
          onEdit={(r: any) => { setSelectedRecord(r); setIsDialogOpen(true); }} 
          onDelete={handleDelete}
        />
      </div>

      <FisheryDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleUpdate} record={selectedRecord} fisherfolks={fisherfolks} isSaving={isSaving} />
      <FisheryViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} record={selectedRecord} />
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => (
  <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm h-28 overflow-hidden group">
    {isLoading && (
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
        <div className="w-full h-[40%] bg-primary animate-progress-loop-y" />
      </div>
    )}
    {isLoading ? (
      <><div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" /><div className="space-y-2 w-full"><div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" /><div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" /></div></>
    ) : (
      <><div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div><div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p><h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3></div></>
    )}
  </div>
);