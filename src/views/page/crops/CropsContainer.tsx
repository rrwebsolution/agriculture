import React, { useState, useEffect } from 'react';

// 🌟 IMPORT REDUX HOOKS AND ACTIONS (Gi-apil ang addCrop)
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteCropRecord, setCropData, updateCropRecord, addCrop } from '../../../store/slices/cropSlice';

// 🌟 ICONS & UI COMPONENTS
import { Sprout, Plus, Search, Filter, TrendingUp, Wheat, Users, RefreshCw, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import axios from '../../../plugin/axios'; 
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../lib/utils';

// 🌟 IMPORT SEPARATED COMPONENTS
import CropMetricCard from './cards/CropMetricCard';
import CropTable from './table/CropTable';
import CropDialog from './dialog/CropDialog';
import CropViewDialog from './dialog/CropViewDialog';

export default function CropsContainer() {
  const dispatch = useAppDispatch();

  // PULL DATA FROM REDUX
  const { records: landData, isLoaded } = useAppSelector((state: any) => state.crop);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState<number[]>([]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // MODAL STATES
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedEditId, setSelectedEditId] = useState<number | null>(null);

  // FORM STATE
  const [formData, setFormData] = useState({ category: "", remarks: "" });

  // --- 1. FETCH DATA LOGIC ---
  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('crops');
      dispatch(setCropData({ records: response.data.data || [] }));
    } catch (error) {
      toast.error("Failed to fetch land use data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(false); 
  }, []);

  // --- 2. ADD & UPDATE (EDIT) LOGIC ---
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (selectedEditId) {
        const response = await axios.put(`crops/${selectedEditId}`, formData);
        // 🌟 FIXED: Removed the wrapper, matches Realtime setup
        dispatch(updateCropRecord(response.data.data));
        toast.success("Land record updated successfully!");
      } else {
        const response = await axios.post('crops', formData);
        // 🌟 FIXED: Used addCrop and removed the wrapper
        dispatch(addCrop(response.data.data));
        toast.success("New land record saved!");
      }
      closeAddModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving record.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. DELETE LOGIC ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this record!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`crops/${id}`);
        dispatch(deleteCropRecord(id));
        toast.success("Land record deleted.");
      } catch (error: any) {
        toast.error((error as any).response?.data?.message || "Failed to delete record.");
      }
    }
  };

  // --- MODAL HANDLERS ---
  const openEdit = (item: any) => {
    setSelectedEditId(item.id);
    setFormData({ category: item.category, remarks: item.remarks });
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
    setSelectedEditId(null);
    setFormData({ category: "", remarks: "" });
  };

  const openView = (item: any) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const toggleRemark = (id: number) => {
    setExpandedRemarks(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // --- 4. FILTER & PAGINATION LOGIC ---
  const filteredData = (landData || []).filter((item: any) => {
    const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) || 
                          (item.remarks && item.remarks.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory]);

  const totalFarmers = (landData || []).reduce((sum: number, item: any) => sum + (item.farmers || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sprout className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Production Control</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Land Use <span className="text-primary italic">& Crops</span>
          </h2>
        </div>
        <button 
          onClick={() => { setSelectedEditId(null); setIsAddOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> Add New Entry
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CropMetricCard isLoading={isLoading} icon={<Users />} title="Total Farmers" value={totalFarmers.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <CropMetricCard isLoading={isLoading} icon={<Wheat />} title="Active Categories" value={`${landData?.length || 0} Types`} color="text-amber-500" bgColor="bg-amber-500/10" />
        <CropMetricCard isLoading={isLoading} icon={<TrendingUp />} title="Yield Forecast" value="High" color="text-purple-500" bgColor="bg-purple-500/10" />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          
          <input 
            type="text" 
            placeholder="Search Land Use category..." 
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              <SelectItem value="All Categories" className="text-xs font-bold uppercase py-3 cursor-pointer">All Categories</SelectItem>
              {(landData || []).map((c: any) => (<SelectItem key={c.id} value={c.category} className="text-xs font-bold uppercase py-3 cursor-pointer">{c.category}</SelectItem>))}
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

      {/* MAIN TABLE */}
      <CropTable 
        isLoading={isLoading}
        currentItems={currentItems}
        filteredDataLength={filteredData.length}
        expandedRemarks={expandedRemarks}
        toggleRemark={toggleRemark}
        openView={openView}
        openEdit={openEdit}
        handleDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
      />

      <CropDialog isOpen={isAddOpen} onClose={closeAddModal} onSave={handleAddSubmit} formData={formData} setFormData={setFormData} isSaving={isSaving} isEdit={!!selectedEditId} />
      <CropViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} selectedItem={selectedItem} />

    </div>
  );
}