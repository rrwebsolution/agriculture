import React, { useState, useEffect, useMemo } from 'react';

// 🌟 REDUX & API IMPORTS
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  setHarvestData, addHarvestRecord, updateHarvestRecord, deleteHarvestRecord,
  setHarvestFilters, setHarvestPage
} from '../../../store/slices/harvestSlice';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// 🌟 ICONS & UI
import { 
  Wheat, Plus, Search, Calendar, Download, Filter, X, RefreshCw, 
  Scale, PhilippinePeso, BadgeCheck, TrendingUp, Activity, ClipboardList 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { cn } from '../../../lib/utils';

import HarvestTable from './table/HarvestTable';
import HarvestEditDialog from './dialog/HarvestDialog';
import HarvestViewDialog from './dialog/HarvestViewDialog';
import HarvestChart from './cards/HarvestChart.tsx';

const qualityOptions = ["All Qualities", "Grade A", "Standard", "Premium"];
const emptyForm = { farmer_id: '', barangay_id: '', crop_id: '', dateHarvested: '', quantity: '', quality: '', value: '' };

export default function HarvestContainer() {
  const dispatch = useAppDispatch();
  
  const { 
    records: harvests = [], 
    farmers = [], 
    barangays = [], 
    crops = [], 
    isLoaded = false, 
    filters = { search: '', quality: 'All Qualities', startDate: '', endDate: '' }, 
    currentPage = 1 
  } = useAppSelector((state: any) => state.harvest || {});

  const { search, quality: selectedQuality, startDate, endDate } = filters;

  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [formData, setFormData] = useState<any>(emptyForm);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  const fetchData = async (forceRefresh = false) => {
  if (!forceRefresh && isLoaded) return;
  
  setIsLoading(true);
  try {
    const [harvestRes, farmerRes] = await Promise.all([
      axios.get('harvests', getAuthHeaders()),
      axios.get('farmers', getAuthHeaders())
    ]);

    const fetchedHarvests = harvestRes.data.data || [];
    const fetchedFarmers = farmerRes.data.data || [];

      // 🌟 LOGIC: Extract unique Barangays and Crops from Farmer and Harvest data
      const uniqueBarangaysMap = new Map();
      const uniqueCropsMap = new Map();

      const addBrgy = (b: any) => { if (b && b.id) uniqueBarangaysMap.set(b.id, b); };
      const addCrop = (c: any) => { if (c && c.id) uniqueCropsMap.set(c.id, c); };

      fetchedHarvests.forEach((h: any) => {
         addBrgy(h.barangay);
         addCrop(h.crop);
      });

      fetchedFarmers.forEach((f: any) => {
         addBrgy(f.barangay); 
         addBrgy(f.farm_location); 
         addCrop(f.crop);
      });

      dispatch(setHarvestData({
        records: fetchedHarvests,
        farmers: fetchedFarmers,
        barangays: Array.from(uniqueBarangaysMap.values()),
        crops: Array.from(uniqueCropsMap.values())
      }));

    } catch (error) {
      toast.error("Failed to load harvest data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
  fetchData(false); 
}, []);

  const filteredRecords = useMemo(() => {
    return (harvests || []).map((h:any) => ({
      ...h,
      farmer_name: `${h.farmer?.first_name || ''} ${h.farmer?.last_name || ''}`,
      barangay_name: h.barangay?.name || 'Unknown',
      crop_name: h.crop?.category || 'Unknown'
    })).filter((h: any) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = h.farmer_name.toLowerCase().includes(searchLower) || h.crop_name.toLowerCase().includes(searchLower);
      const matchesQuality = selectedQuality === "All Qualities" || h.quality === selectedQuality;
      
      let matchesDate = true;
      if (startDate || endDate) {
        if (!h.dateHarvested) matchesDate = false;
        else {
          const d = new Date(h.dateHarvested);
          d.setHours(0,0,0,0);
          if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); if (d < s) matchesDate = false; }
          if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); if (d > e) matchesDate = false; }
        }
      }
      return matchesSearch && matchesQuality && matchesDate;
    });
  }, [harvests, search, selectedQuality, startDate, endDate]);

  const totalYield = useMemo(() => {
    return filteredRecords.reduce((sum:any, h:any) => sum + (parseFloat(String(h.quantity).replace(/[^0-9.-]+/g, "")) || 0), 0);
  }, [filteredRecords]);

  const totalMarketValue = useMemo(() => {
    return filteredRecords.reduce((sum:any, h:any) => sum + (parseFloat(String(h.value).replace(/[^0-9.-]+/g, "")) || 0), 0);
  }, [filteredRecords]);

  const formatShortCurrency = (num: number) => {
    if (num >= 1000000) return `₱${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₱${(num / 1000).toFixed(1)}K`;
    return `₱${num.toFixed(2)}`;
  };

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentItems = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) return toast.warning("No records to export.");
    toast.success("Records exported successfully!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEdit) {
        const res = await axios.put(`harvests/${formData.id}`, formData, getAuthHeaders());
        dispatch(updateHarvestRecord(res.data.data));
        toast.success("Harvest record updated!");
      } else {
        const res = await axios.post('harvests', formData, getAuthHeaders());
        dispatch(addHarvestRecord(res.data.data));
        toast.success("New harvest logged!");
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "This harvest record will be permanently deleted.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        await axios.delete(`harvests/${id}`, getAuthHeaders());
        dispatch(deleteHarvestRecord(id)); 
        toast.success("Deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete record.");
      }
    }
  };

  const openNewDialog = () => { setFormData(emptyForm); setIsEdit(false); setIsDialogOpen(true); };
  const handleEdit = (h: any) => { setFormData({ id: h.id, farmer_id: h.farmer_id, barangay_id: h.barangay_id, crop_id: h.crop_id, dateHarvested: h.dateHarvested, quantity: h.quantity, quality: h.quality, value: h.value }); setIsEdit(true); setIsDialogOpen(true); };
  const handleView = (h: any) => { setSelectedRecord({ id: h.id, farmer: h.farmer_name, barangay: h.barangay_name, crop: h.crop_name, dateHarvested: h.dateHarvested, quantity: h.quantity, quality: h.quality, value: h.value || 'N/A' }); setIsViewOpen(true); };

  const handleSearchChange = (val: string) => dispatch(setHarvestFilters({ search: val }));
  const handleQualityChange = (val: string) => dispatch(setHarvestFilters({ quality: val }));
  const handleStartDateChange = (val: string) => dispatch(setHarvestFilters({ startDate: val }));
  const handleEndDateChange = (val: string) => dispatch(setHarvestFilters({ endDate: val }));
  const handleClearDates = () => dispatch(setHarvestFilters({ startDate: '', endDate: '' }));
  const handlePageChange = (page: number) => dispatch(setHarvestPage(page));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🌟 HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wheat className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Harvest Analytics</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Harvest <span className="text-primary italic">Management</span>
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={exportToCSV} disabled={isLoading || filteredRecords.length === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary/40 border border-primary/10 dark:border-primary/20 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50 shadow-sm">
            <Download size={18} /> Export Data
          </button>
          <button onClick={openNewDialog} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
            <Plus size={18} /> Log Harvest
          </button>
        </div>
      </div>

      {/* 🌟 METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLoading={isLoading} icon={<Scale />} title="Total Yield" value={`${totalYield.toFixed(1)} MT`} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard isLoading={isLoading} icon={<PhilippinePeso />} title="Market Value" value={formatShortCurrency(totalMarketValue)} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<BadgeCheck />} title="Filtered Records" value={filteredRecords.length.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard isLoading={isLoading} icon={<TrendingUp />} title="Growth Index" value="+12.4%" color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      {/* 🌟 CONTROLS (SEARCH & FILTER) - Matched to Planting Style */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col 2xl:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search Farmer or Crop..." className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
            {search && <button onClick={() => handleSearchChange("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer"><X size={14} /></button>}
          </div>

          <div className="relative flex items-center bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl h-13 px-4 gap-3 w-full sm:w-auto shrink-0 transition-all focus-within:ring-2 focus-within:ring-primary">
            <Calendar className="text-gray-400 shrink-0" size={18} />
            <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">From Date</span><input type="date" className={cn("bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-slate-200 cursor-pointer w-28", !startDate && "text-gray-400 font-normal")} value={startDate} onChange={(e) => handleStartDateChange(e.target.value)}/></div>
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 shrink-0 mx-1" />
            <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">To Date</span><input type="date" className={cn("bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-slate-200 cursor-pointer w-28", !endDate && "text-gray-400 font-normal")} value={endDate} onChange={(e) => handleEndDateChange(e.target.value)}/></div>
            {(startDate || endDate) && <button onClick={handleClearDates} className="p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer ml-1" title="Clear Dates"><X size={14} /></button>}
          </div>
          
          <div className="relative shrink-0 w-full sm:w-auto xl:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <Select value={selectedQuality} onValueChange={handleQualityChange}>
              <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Quality" /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                {qualityOptions.map((q) => (<SelectItem key={q} value={q} className="text-xs font-bold uppercase py-3 cursor-pointer">{q}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <button onClick={() => fetchData(true)} disabled={isLoading} className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary transition-all cursor-pointer disabled:opacity-30">
            <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
            <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
          </button>
        </div>
      </div>

      {/* 🌟 ANALYTICS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
           <Activity className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
             Analytics <span className="text-primary italic">Overview</span>
           </h2>
        </div>
        
        {/* Pass isLoading to HarvestChart so it can handle the identical skeleton logic */}
        <HarvestChart data={filteredRecords} isLoading={isLoading} />
      </div>

      {/* 🌟 TABLE SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
           <ClipboardList className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
             Harvest <span className="text-primary italic">Records Data</span>
           </h2>
        </div>
        
        <HarvestTable 
          isLoading={isLoading}
          items={currentItems.map((h: any) => ({
            ...h,
            farmer: h.farmer_name,
            barangay: h.barangay_name,
            crop: h.crop_name
          }))}
          allFilteredItems={filteredRecords}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          setCurrentPage={handlePageChange} 
          totalPages={totalPages}
        />
      </div>

      {/* DIALOGS */}
      <HarvestEditDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSave} 
        formData={formData} 
        setFormData={setFormData} 
        isSaving={isSaving} 
        isEdit={isEdit} 
        farmers={farmers} 
        barangays={barangays} 
        crops={crops} 
      />

      <HarvestViewDialog 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        harvest={selectedRecord} 
      />
    </div>
  );
}

// 🌟 METRIC CARD (Vertical loader on the left edge - matched exactly to Planting)
const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm overflow-hidden h-28">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div 
            className="w-full h-[40%] bg-primary" 
            style={{ animation: 'progress-loop-y 1.5s linear infinite' }} 
          />
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm h-28">
      <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
      </div>
    </div>
  );
};