import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, Plus, Search, Filter, Waves, Ship, Anchor, UserCheck, RefreshCw, X, Activity, ClipboardList
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../lib/utils';
import axios from '../../../plugin/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPageAccess } from '../../../lib/permissions';

// 🌟 SEPARATED COMPONENTS
import FisherfolkMetricCard from './cards/FisherfolkMetricCard';
import FisherfolkTable from './table/FisherfolkTable';
import FisherfolkDialog from './dialog/FisherfolkDialog';
import FisherfolkViewDialog from './dialog/FisherfolkViewDialog';

// 🌟 REDUX ACTIONS
import { addFisherfolk, setFisherfolksData, updateFisherfolkRecord } from '../../../store/slices/fisherfolkSlice'; 
import { upsertBarangayFisherfolkRecord } from '../../../store/slices/barangaySlice';
import FisherfolkAnalytics from './FisherfolkAnalytics';

const statusOptions = ["All Status", "active", "inactive"];

const hasBoatType = (fisher: any, boatType: string) => {
  const target = boatType.toLowerCase();
  const boats = Array.isArray(fisher?.boats_list) ? fisher.boats_list : [];

  if (boats.some((boat: any) => String(boat?.boat_type || '').toLowerCase() === target)) {
    return true;
  }

  return String(fisher?.boat_type || '').toLowerCase() === target;
};

export default function RegisteredFisherfolkContainer() {
  const dispatch = useDispatch();
  
 const { records, barangays, cooperatives, isLoaded } = useSelector((state: any) => state.fisherfolk);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFisher, setSelectedFisher] = useState<any>(null);
  const location = useLocation(); // <-- Add this
  const navigate = useNavigate(); // <-- Add this
  const { canManage } = getPageAccess(location.pathname);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 1. FETCH DATA ---
  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      // 🌟 FIX: Fetch cooperatives and include it in Promise.all
      const [fisherRes, brgyRes, coopRes] = await Promise.all([
        axios.get('fisherfolks'),
        axios.get('barangays'),
        axios.get('cooperatives')
      ]);

      // 🌟 FIX: Passed cooperatives to the Redux payload
      dispatch(setFisherfolksData({
        records: fisherRes.data.data || [],
        barangays: brgyRes.data.data || [],
        cooperatives: coopRes.data.data || []
      }));
    } catch (error) {
      toast.error("Failed to sync with database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(false); 
  }, []);

  useEffect(() => { 
    fetchData(false); 
  }, []);

  // 🌟 NEW EFFECT: Listen for redirection state from Dashboard
  useEffect(() => {
    if (location.state?.openAddDialog) {
      setSelectedFisher(null); // Ensure form is empty for new registration
      setIsDialogOpen(true);
      
      // Clear the state so it doesn't pop up again if the user reloads the page
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // --- 2. UPDATE HANDLERS ---
  const handleFisherUpdate = (data: any, mode: 'add' | 'edit') => {
    if (mode === 'add') {
      dispatch(addFisherfolk(data));
    } else {
      dispatch(updateFisherfolkRecord({ data, mode }));
    }

    dispatch(upsertBarangayFisherfolkRecord(data));
  };

  const handleToggleStatus = async (fisher: any) => {
    const newStatus = fisher.status === 'active' ? 'inactive' : 'active';
    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Mark this fisherfolk as ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      confirmButtonColor: '#10b981'
    });
    
    if (result.isConfirmed) {
      try {
        const response = await axios.put(`fisherfolks/${fisher.id}`, { status: newStatus });
        handleFisherUpdate(response.data.data, 'edit');
        toast.success(`Fisherfolk is now ${newStatus}`);
      } catch (error) {
        toast.error("Status update failed.");
      }
    }
  };

  const openView = (fisher: any) => {
    setSelectedFisher(fisher);
    setIsViewOpen(true);
  };

  const openEdit = (fisher: any) => {
    setSelectedFisher(fisher);
    setIsDialogOpen(true);
  };

  // --- 3. FILTERING & MEMOIZATION ---
  const filteredRecords = useMemo(() => {
    return (records || []).filter((f: any) => {
      const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) || f.system_id?.includes(search);
      const matchesStatus = selectedStatus === "All Status" || f.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, selectedStatus]);

  const currentItems = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, selectedStatus]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Waves className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Maritime Registry</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Registered <span className="text-primary italic">Fisherfolk</span>
          </h2>
        </div>
        {canManage && (
          <button 
            onClick={() => { setSelectedFisher(null); setIsDialogOpen(true); }} 
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Register Fisherfolk
          </button>
        )}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FisherfolkMetricCard isLoading={isLoading} icon={<Users />} title="Total Fisherfolk" value={records?.length?.toString() || "0"} color="text-blue-500" bgColor="bg-blue-500/10" />
        <FisherfolkMetricCard isLoading={isLoading} icon={<UserCheck />} title="Active Status" value={(records || []).filter((f:any) => f.status === 'active').length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <FisherfolkMetricCard isLoading={isLoading} icon={<Ship />} title="Motorized" value={(records || []).filter((f:any) => hasBoatType(f, 'Motorized')).length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <FisherfolkMetricCard isLoading={isLoading} icon={<Anchor />} title="Non-Motorized" value={(records || []).filter((f:any) => hasBoatType(f, 'Non-Motorized')).length.toString()} color="text-purple-500" bgColor="bg-purple-500/10" />
      </div>

      {/* SEARCH AND FILTER (White Card Style) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full h-auto py-4 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold shadow-sm cursor-pointer"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                {statusOptions.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          <button 
            onClick={() => fetchData(true)} 
            disabled={isLoading} 
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 shadow-sm"
          >
            <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
            <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
          </button>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
           <Activity className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Analytics Overview</h2>
        </div>
        <FisherfolkAnalytics fisherfolks={filteredRecords} isLoading={isLoading} />
      </div>

      {/* TABLE SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
           <ClipboardList className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Registered Masterlist</h2>
        </div>
        <FisherfolkTable 
          isLoading={isLoading}
          currentItems={currentItems}
          filteredRecordsLength={filteredRecords.length}
          handleToggleStatus={canManage ? handleToggleStatus : undefined}
          openView={openView}
          openEdit={canManage ? openEdit : undefined}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>

      {/* EXTERNAL MODALS */}
      <FisherfolkDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onUpdate={handleFisherUpdate} 
        fisher={selectedFisher} 
        barangays={barangays} 
        cooperatives={cooperatives} // 🌟 FIX: Added cooperatives Prop
      />
      
      <FisherfolkViewDialog 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        fisher={selectedFisher} 
        cooperatives={cooperatives} // 🌟 FIX: Added cooperatives Prop
      />

    </div>
  );
}
