import { useState, useEffect, useMemo } from 'react';
// 🌟 Ensure these paths match your actual folder structure (e.g., ../../../)
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'; 
import { setCoopData, updateCoopRecord } from '../../../../store/slices/cooperativeSlice';

import { 
  Building2, Plus, Search, 
  Filter, Handshake, Users, TrendingUp, UserCheck, RefreshCw,
  X,
} from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { cn } from '../../../../lib/utils';
import axios from '../../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import type { AxiosError } from 'axios';

// Separated components
import CoopMetricCard from './cards/CoopMetricCard';
import CoopTable from './table/CoopTable';
import CooperativeDialog from './dialog/CooperativeDialog';
import CooperativeViewDialog from './dialog/CooperativeViewDialog';

const coopTypes = ["All Types", "Multipurpose", "Agriculture", "Fisheries", "Livestock", "Credit", "Consumers"];

export default function CooperativesContainer() {
  const dispatch = useAppDispatch();
  const { records, barangays, isLoaded } = useAppSelector((state: any) => state.cooperative);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const [coopRes, brgyRes] = await Promise.all([
        axios.get('cooperatives'),
        axios.get('barangays')
      ]);
      dispatch(setCoopData({
        records: coopRes.data.data || [],
        barangays: brgyRes.data.data || []
      }));
    } catch (error) {
      toast.error("Failed to load cooperative data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(false); }, []);

  const handleUpdate = (data: any, mode: 'add' | 'edit') => {
    dispatch(updateCoopRecord({ data, mode }));
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Cooperative record will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`cooperatives/${id}`);
        dispatch(updateCoopRecord({ data: id, mode: 'delete' }));
        toast.success("Deleted successfully.");
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(axiosError.response?.data?.message || "Failed to delete record.");
      }
    }
  };

  const filteredRecords = useMemo(() => {
    return (records || []).filter((r: any) => {
      const matchesSearch = (r.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
                            (r.cda_no?.includes(search));
      const matchesType = selectedType === "All Types" || r.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [records, search, selectedType]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentItems = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">CDA Institutional Registry</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Agricultural <span className="text-primary italic">Cooperatives</span>
          </h2>
        </div>
        <button onClick={() => { setSelectedCoop(null); setIsDialogOpen(true); }} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
          <Plus size={18} /> Add Cooperative
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CoopMetricCard isLoading={isLoading} icon={<Building2 />} title="Total Coops" value={records?.length?.toString() || "0"} color="text-primary" bgColor="bg-primary/10" />
        <CoopMetricCard isLoading={isLoading} icon={<UserCheck />} title="Compliant" value={records?.filter((r:any) => r.status === 'Compliant').length.toString() || "0"} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <CoopMetricCard isLoading={isLoading} icon={<Users />} title="Total Members" value={records?.reduce((sum: number, r:any) => sum + Number(r.member_count || 0), 0).toLocaleString() || "0"} color="text-blue-500" bgColor="bg-blue-500/10" />
        <CoopMetricCard isLoading={isLoading} icon={<TrendingUp />} title="Capital Build-up" value={`₱${((records?.reduce((sum: number, r:any) => sum + Number(r.capital_cbu || 0), 0) || 0) / 1000000).toFixed(1)}M`} color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
       <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          
          <input 
            type="text" 
            placeholder="Search Name or CDA No..." 
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />

          {/* Clear Button */}
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
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold cursor-pointer shadow-sm"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1">
              {coopTypes.map((t) => (<SelectItem key={t} value={t} className="text-xs font-bold uppercase py-3 cursor-pointer">{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <button onClick={() => fetchData(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-all cursor-pointer disabled:opacity-30 shadow-sm">
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
          <span className={cn(isLoading && "text-primary")}>{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <CoopTable 
  isLoading={isLoading} 
  items={currentItems}
  allFilteredItems={filteredRecords} // Pass the full filtered array for counting
  onView={(c) => { setSelectedCoop(c); setIsViewOpen(true); }}
  onEdit={(c) => { setSelectedCoop(c); setIsDialogOpen(true); }}
  onDelete={handleDelete}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  totalPages={totalPages}
/>

      <CooperativeDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onUpdate={handleUpdate} coop={selectedCoop} barangays={barangays} />
      <CooperativeViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} coop={selectedCoop} />
    </div>
  );
}