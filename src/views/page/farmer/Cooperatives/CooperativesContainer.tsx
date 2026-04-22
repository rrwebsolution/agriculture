import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'; 

import { 
  setCoopData, 
  updateCooperativeRecord, 
  deleteCooperative 
} from '../../../../store/slices/cooperativeSlice';

import { 
  Building2, Plus, Search, 
  Filter, Handshake, Users, TrendingUp, UserCheck, RefreshCw, X, 
  BarChart3, MapPin, ExternalLink, Activity, ClipboardList
} from 'lucide-react';

// 🌟 IMPORT RECHARTS FOR BAR AND RADAR CHART
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

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
import MembersListDrawer from './dialog/MembersListDrawer'; 
import { useLocation, useNavigate } from 'react-router-dom';
import { getPageAccess } from '../../../../lib/permissions';

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
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'farmers' | 'fisherfolks'>('farmers');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const location = useLocation();
  const { canManage } = getPageAccess(location.pathname);

  const handleOpenMembersDrawer = (coop: any, tab: 'farmers' | 'fisherfolks') => {
    setSelectedCoop(coop);
    setDrawerTab(tab);
    setIsDrawerOpen(true);
  };

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
      toast.error("Failed to load FFCA data.");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => { fetchData(false); }, []);

  const handleUpdate = (data: any, mode: 'add' | 'edit') => {
    if (mode === 'edit') {
      // Pangitaon nato ang daan nga record sa state aron kuhaon ang current counts
      const existingRecord = records?.find((r: any) => r.id === data.id);
      
      if (existingRecord) {
        // I-pilit (merge) balik ang counts paingon sa bag-ong data gikan sa backend
        data.assigned_farmers_count = existingRecord.assigned_farmers_count || 0;
        data.assigned_fisherfolks_count = existingRecord.assigned_fisherfolks_count || 0;
      }
    }
    
    // I-save sa Redux store ang updated data nga naa nay existing counts
    dispatch(updateCooperativeRecord(data)); 
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "FFCA record will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`cooperatives/${id}`);
        dispatch(deleteCooperative(id)); 
        toast.success("Deleted successfully.");
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(axiosError.response?.data?.message || "Failed to delete record.");
      }
    }
  };

  const filteredRecords = useMemo(() => {
    return (records || []).filter((r: any) => {
      const matchesSearch = 
        (r.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
        (r.cda_no?.toLowerCase() || "").includes(search.toLowerCase()); 
      const matchesType = selectedType === "All Types" || r.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [records, search, selectedType]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentItems = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const barChartData = useMemo(() => {
    if (!records) return [];
    const mapped = records.map((r: any) => ({
      name: r.name,
      Farmers: r.assigned_farmers_count || 0,
      Fisherfolks: r.assigned_fisherfolks_count || 0,
      total: (r.assigned_farmers_count || 0) + (r.assigned_fisherfolks_count || 0)
    }));
    return mapped.sort((a: any, b: any) => b.total - a.total).slice(0, 10);
  }, [records]);

  const radarChartData = useMemo(() => {
    if (!barangays || barangays.length === 0) return [];
    const sortedBrgy = [...barangays].sort((a: any, b: any) => {
        const totalA = (a.farmers || 0) + (a.fisherfolks || 0);
        const totalB = (b.farmers || 0) + (b.fisherfolks || 0);
        return totalB - totalA; 
    });

    return sortedBrgy.slice(0, 6).map((b: any) => ({
        barangay: (b.name || "").toUpperCase(),
        Farmers: b.farmers || 0,
        Fisherfolks: b.fisherfolks || 0
    }));
  }, [barangays]);

  const totalMembersCount = records?.reduce((sum: number, r: any) => {
    return sum + (r.assigned_farmers_count || 0) + (r.assigned_fisherfolks_count || 0);
  }, 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Farmers/Fisherfolks Cooperative & Association</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            FFCA <span className="text-primary italic">Registry</span>
          </h2>
        </div>
        {canManage && (
          <button onClick={() => { setSelectedCoop(null); setIsDialogOpen(true); }} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
            <Plus size={18} /> Add FFCA
          </button>
        )}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CoopMetricCard isLoading={isLoading} icon={<Building2 />} title="Total FFCAs" value={records?.length?.toString() || "0"} color="text-primary" bgColor="bg-primary/10" />
        <CoopMetricCard isLoading={isLoading} icon={<UserCheck />} title="Compliant" value={records?.filter((r:any) => r.status === 'Compliant').length.toString() || "0"} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <CoopMetricCard isLoading={isLoading} icon={<Users />} title="Total Members" value={totalMembersCount.toLocaleString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <CoopMetricCard isLoading={isLoading} icon={<TrendingUp />} title="Capital Build-up" value={`₱${((records?.reduce((sum: number, r:any) => sum + Number(r.capital_cbu || 0), 0) || 0) / 1000000).toFixed(1)}M`} color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      {/* 🌟 CONTROLS (SEARCH, FILTER, REFRESH) */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Name or CDA No..." 
            className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" 
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
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
              {coopTypes.map((t) => (<SelectItem key={t} value={t} className="text-xs font-bold uppercase py-3 cursor-pointer">{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <button 
          onClick={() => fetchData(true)} 
          disabled={isLoading}
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
        </button>
      </div>

      {/* 🌟 ANALYTICS SECTION */}
        <div className="space-y-4 pt-2">
           <div className="flex items-center gap-2 px-1">
             <Activity className="text-primary" size={20} />
             <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
               Analytics <span className="text-primary italic">Overview</span>
             </h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             {/* BAR CHART */}
             <div className="relative overflow-hidden lg:col-span-7 xl:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-96">
                 {isLoading && (
                   <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-30">
                     <div className="h-full bg-primary w-[40%] animate-progress-loop" />
                   </div>
                 )}

                 <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-xl text-blue-500">
                       <BarChart3 size={18} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Members Distribution</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top 10 Organizations</p>
                    </div>
                 </div>
                 
                 {/* 🌟 FIXED WRAPPER WITH flex flex-col */}
                <div className="flex-1 w-full mt-auto relative z-10 flex flex-col"> 
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-end justify-around px-4 pb-8 animate-pulse gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-full flex flex-col gap-1 items-center justify-end h-full">
                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-t-md" style={{ height: `${30 + Math.random() * 60}%` }} />
                            <div className="w-8 h-2 bg-gray-100 dark:bg-slate-800 rounded-sm mt-2" />
                          </div>
                        ))}
                    </div>
                  ) : barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: '900', fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} angle={-20} textAnchor="end" dy={10} />
                        <YAxis tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '30px' }} />
                        <Bar dataKey="Farmers" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} animationDuration={1500} />
                        <Bar dataKey="Fisherfolks" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={30} animationDuration={1500} />
                      </BarChart>
                    </ResponsiveContainer>
                    ) : (
                      /* 🌟 UPDATED PLACEHOLDER: Added h-full for absolute centering */
                      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                          <BarChart3 size={48} strokeWidth={1} className="mb-2 opacity-40" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">No membership data found</p>
                      </div>
                    )}
                </div>
              </div>
             {/* RADAR CHART */}
             <div className="relative overflow-hidden lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-96">
                 {isLoading && (
                   <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/10 z-30">
                     <div className="h-full bg-indigo-500 w-[40%] animate-progress-loop" />
                   </div>
                 )}

                 <div className="flex items-start justify-between mb-2 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-500">
                           <MapPin size={18} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Barangay Coverage</h3>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top 6 Registered</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => navigate('/page/barangaylist-management')}
                       disabled={isLoading}
                       className="px-3 py-2 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-gray-100 dark:border-slate-700 disabled:opacity-50"
                     >
                       View Profiles <ExternalLink size={12} />
                     </button>
                 </div>
                 
                 {/* 🌟 FIXED RADAR CHART WRAPPER */}
                <div className="flex-1 w-full mt-auto relative z-10 flex flex-col">
                    {isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <div className="w-40 h-40 rounded-full border-4 border-gray-100 dark:border-slate-800 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-slate-800 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full border-4 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50" />
                            </div>
                        </div>
                      </div>
                    ) : (radarChartData.length > 0 && radarChartData.some(d => d.Farmers > 0 || d.Fisherfolks > 0)) ? (
                      /* 🌟 ONLY SHOW CHART IF AT LEAST ONE BARANGAY HAS DATA > 0 */
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarChartData}>
                          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="barangay" tick={{ fontSize: 9, fontWeight: '900', fill: '#64748b' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8, fill: '#cbd5e1' }} axisLine={false} />
                          <Radar name="Farmers" dataKey="Farmers" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} animationDuration={1500} />
                          <Radar name="Fisherfolks" dataKey="Fisherfolks" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} animationDuration={1500} />
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '10px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      /* 🌟 CENTERED NO DATA PLACEHOLDER */
                      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                        <MapPin size={48} strokeWidth={1} className="mb-2 opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No coverage data available</p>
                      </div>
                    )}
                </div>
             </div>
           </div>
        </div>

      {/* 🌟 TABLE SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
           <ClipboardList className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
             FFCA <span className="text-primary italic">Data Records</span>
           </h2>
        </div>
        
        <CoopTable 
          isLoading={isLoading} 
          items={currentItems}
          allFilteredItems={filteredRecords} 
          onView={(c) => { setSelectedCoop(c); setIsViewOpen(true); }}
          onEdit={canManage ? (c) => { setSelectedCoop(c); setIsDialogOpen(true); } : undefined}
          onDelete={canManage ? handleDelete : undefined}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onViewMembers={handleOpenMembersDrawer} 
        />
      </div>

      {/* DIALOGS */}
      <CooperativeDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onUpdate={handleUpdate} coop={selectedCoop} barangays={barangays} />
      <MembersListDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} coop={selectedCoop} defaultTab={drawerTab} />
      <CooperativeViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} coop={selectedCoop} />
    </div>
  );
}
