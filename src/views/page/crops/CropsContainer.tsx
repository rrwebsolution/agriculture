import React, { useState, useEffect } from 'react';

// IMPORT REDUX HOOKS AND ACTIONS
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { deleteCropRecord, setCropData, updateCropRecord, addCrop } from '../../../store/slices/cropSlice';

// ICONS & UI COMPONENTS
import { Sprout, Plus, Search, Filter, TrendingUp, Wheat, Users, RefreshCw, X, Download, LayoutList, Map } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import axios from '../../../plugin/axios'; 
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../lib/utils';

// IMPORT SEPARATED COMPONENTS
import CropMetricCard from './cards/CropMetricCard';
import CropTable from './table/CropTable';
import CropDialog from './dialog/CropDialog';
import CropViewDialog from './dialog/CropViewDialog';
import CropFarmerBreakdown from './CropFarmerBreakdown'; // <-- IMPORT ANG BAG-ONG UI DINHI

export default function CropsContainer() {
  const dispatch = useAppDispatch();

  const { records: landData, isLoaded } = useAppSelector((state: any) => state.crop);

  // BAG-O NGA STATE PARA SA TABS (List vs Distribution)
  const [activeTab, setActiveTab] = useState<'table' | 'distribution'>('table');

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ 
    key: 'id', 
    direction: 'asc' 
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, _setSelectedItem] = useState<any>(null);
  const [selectedEditId, setSelectedEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ category: "", remarks: "" });

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

  useEffect(() => { fetchData(false); }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (selectedEditId) {
        const response = await axios.put(`crops/${selectedEditId}`, formData);
        dispatch(updateCropRecord(response.data.data));
        toast.success("Land record updated successfully!");
      } else {
        const response = await axios.post('crops', formData);
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

  const toggleRemark = (id: number) => {
    setExpandedRemarks(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleExportCSV = () => {
    // Export Logic remains the same...
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getComputedArea = (item: any) => {
    return (item.registered_farmers || []).reduce((sum: number, f: any) => sum + (Number(f.total_area) || 0), 0);
  };

  let filteredData = (landData || []).filter((item: any) => {
    const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase()) || 
                          (item.remarks && item.remarks.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortConfig.key) {
    filteredData.sort((a: any, b: any) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'area') { aValue = getComputedArea(a); bValue = getComputedArea(b); }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const cropTabs = [
    { id: 'table', label: 'Land Use List', icon: <LayoutList size={16} /> },
    { id: 'distribution', label: 'Farmer Distribution', icon: <Map size={16} /> },
  ];

  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory, itemsPerPage]);

  const totalFarmers = (landData || []).reduce((sum: number, item: any) => sum + (item.farmers || 0), 0);
  const totalAreaHectares = (landData || []).reduce((grandTotal: number, item: any) => grandTotal + getComputedArea(item), 0).toFixed(1);

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
        
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer">
            <Download size={18} /> Export
          </button>
          <button onClick={() => { setSelectedEditId(null); setIsAddOpen(true); }} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
            <Plus size={18} /> Add New Entry
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CropMetricCard isLoading={isLoading} icon={<Users />} title="Total Farmers" value={totalFarmers.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <CropMetricCard isLoading={isLoading} icon={<Wheat />} title="Active Categories" value={`${landData?.length || 0} Types`} color="text-amber-500" bgColor="bg-amber-500/10" />
        <CropMetricCard isLoading={isLoading} icon={<TrendingUp />} title="Total Area (ha)" value={`${totalAreaHectares} ha`} color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* 🌟 UNDERLINED TAB NAVIGATION (Barangay Style) */}
      <div className="relative border-b border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-8 px-2 min-w-max">
          {cropTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative flex items-center gap-2.5 py-4 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none group",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                <span className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive ? "bg-primary/10 text-primary" : "bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-slate-800"
                )}>
                  {tab.icon}
                </span>
                
                {tab.label}

                {/* ACTIVE INDICATOR LINE */}
                {isActive ? (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
                ) : (
                  <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gray-200 dark:bg-slate-700 transition-all duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 CONTROLS WITH WHITE BACKGROUND WRAPPER (Barangay Style) */}
      {activeTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-center gap-4">
            
            {/* SEARCH INPUT */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Land Use category..." 
                className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* CATEGORY FILTER (SELECT) */}
            <div className="relative shrink-0 w-full md:w-55">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
                  <SelectItem value="All Categories" className="text-xs font-bold uppercase py-3 cursor-pointer">All Categories</SelectItem>
                  {(landData || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.category} className="text-xs font-bold uppercase py-3 cursor-pointer">
                      {c.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* REFRESH BUTTON */}
            <button 
              onClick={() => fetchData(true)} 
              disabled={isLoading} 
              className="shrink-0 flex items-center justify-center gap-2 px-6 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30"
            >
              <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
              <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
            </button>

          </div>
        </div>
      )}

      {/* RENDER CONTENT BASE SA GIPILI NGA TAB */}
      {activeTab === 'table' ? (
        <CropTable 
          isLoading={isLoading}
          currentItems={currentItems}
          filteredDataLength={filteredData.length}
          expandedRemarks={expandedRemarks}
          toggleRemark={toggleRemark}
          openEdit={openEdit}
          handleDelete={handleDelete}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          sortConfig={sortConfig}
          handleSort={handleSort}
        />
      ) : (
        <CropFarmerBreakdown landData={landData} />
      )}

      <CropDialog isOpen={isAddOpen} onClose={closeAddModal} onSave={handleAddSubmit} formData={formData} setFormData={setFormData} isSaving={isSaving} isEdit={!!selectedEditId} />
      <CropViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} selectedItem={selectedItem} />

    </div>
  );
}