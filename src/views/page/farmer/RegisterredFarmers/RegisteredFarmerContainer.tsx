import { useState, useEffect } from 'react';

// 🌟 IMPORT REDUX HOOKS AND ACTIONS
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setFarmerData, updateFarmerRecord } from '../../../../store/slices/farmerSlice';

// 🌟 ICONS & UI COMPONENTS
import { Users, Plus, Search, Filter, Sprout, Tractor, UserCheck, LandPlot, RefreshCw, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import axios from './../../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../../lib/utils';

// 🌟 IMPORT SEPARATED COMPONENTS
import FarmerMetricCard from './cards/FarmerMetricCard';
import FarmerTable from './table/FarmerTable';
import FarmerDialog from './dialog/FarmerDialog';
import FarmerViewDialog from './dialog/FarmerViewDialog';

const statusOptions = ["All Status", "active", "inactive"];

export default function RegisteredFarmerContainer() {
  const dispatch = useAppDispatch();

  // 🌟 PULL FARMER DATA FROM REDUX
  const { records: farmers, isLoaded } = useAppSelector((state) => state.farmer);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLoading, setIsLoading] = useState(false);
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // MODAL STATES
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

  // --- 1. FETCH DATA LOGIC ---
  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded && farmers.length > 0) return;

    setIsLoading(true);
    try {
      const [farmerRes, brgyRes, cropRes, coopRes] = await Promise.all([
        axios.get('farmers'),
        axios.get('barangays'),
        axios.get('crops'),
        axios.get('cooperatives')
      ]);

      // 🌟 DISPATCH DATA (Assuming your slice handles these fields)
      dispatch(setFarmerData({
        records: farmerRes.data.data || [],
        barangays: brgyRes.data.data || [],
        crops: cropRes.data.data || [],
        cooperatives: coopRes.data.data || []
      }));
    } catch (error) {
      toast.error("Failed to load agricultural registry data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(false); 
  }, []);

  // --- 2. UPDATE LOGIC ---
  const handleFarmerUpdate = (data: any, mode: 'add' | 'edit') => {
    dispatch(updateFarmerRecord({ data, mode }));
  };

  const handleToggleStatus = async (farmer: any) => {
    const newStatus = farmer.status === 'active' ? 'inactive' : 'active';
    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Mark this farmer as ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      confirmButtonColor: '#10b981'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`farmers/${farmer.id}`, { status: newStatus });
        handleFarmerUpdate(response.data.data, 'edit');
        toast.success(`Status updated.`);
      } catch (error) {
        toast.error("Update failed.");
      }
    }
  };

  // --- MODAL HANDLERS ---
  const openView = (farmer: any) => {
    setSelectedFarmer(farmer);
    setIsViewOpen(true);
  };

  const openEdit = (farmer: any) => {
    setSelectedFarmer(farmer);
    setIsDialogOpen(true);
  };

  // --- 3. FILTERING & PAGINATION ---
  const filteredFarmers = (farmers || []).filter((f: any) => {
    const fullName = `${f.first_name} ${f.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || f.rsbsa_no?.includes(search);
    const matchesStatus = selectedStatus === "All Status" || f.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFarmers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, selectedStatus]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tractor className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Agricultural Registry</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Registered <span className="text-primary italic">Farmers</span>
          </h2>
        </div>
        <button 
          onClick={() => { setSelectedFarmer(null); setIsDialogOpen(true); }} 
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> Register Farmer
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerMetricCard isLoading={isLoading} icon={<Users />} title="Total Farmers" value={farmers?.length?.toString() || "0"} color="text-blue-500" bgColor="bg-blue-500/10" />
        <FarmerMetricCard isLoading={isLoading} icon={<UserCheck />} title="Active Status" value={(farmers || []).filter((f:any) => f.status === 'active').length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <FarmerMetricCard isLoading={isLoading} icon={<LandPlot />} title="Total Area (Ha)" value={(farmers || []).reduce((sum: number, f:any) => sum + Number(f.total_area || 0), 0).toFixed(1)} color="text-amber-500" bgColor="bg-amber-500/10" />
        <FarmerMetricCard isLoading={isLoading} icon={<Sprout />} title="Main Livelihood" value={(farmers || []).filter((f:any) => f.is_main_livelihood).length.toString()} color="text-purple-500" bgColor="bg-purple-500/10" />
      </div>

      {/* CONTROLS ROW */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          
          <input 
            type="text" 
            placeholder="Search Name or RSBSA..." 
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
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
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold cursor-pointer shadow-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
              {statusOptions.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <button 
          onClick={() => fetchData(true)} 
          disabled={isLoading}
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 shadow-sm"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary")}>{isLoading ? "Refreshing..." : "Refresh List"}</span>
        </button>
      </div>

      {/* TABLE COMPONENT */}
      <FarmerTable 
        isLoading={isLoading}
        currentItems={currentItems}
        filteredDataLength={filteredFarmers.length}
        handleToggleStatus={handleToggleStatus}
        openView={openView}
        openEdit={openEdit}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
      />

      {/* EXTERNAL MODALS (No props passed for masterlists anymore) */}
      <FarmerDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onUpdate={handleFarmerUpdate} 
        farmer={selectedFarmer} 
      />
      
      <FarmerViewDialog 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        farmer={selectedFarmer} 
      />

    </div>
  );
}