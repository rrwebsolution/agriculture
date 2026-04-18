import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks'; 
import { 
  setPlantingData, 
} from '../../../store/slices/plantingSlice';

import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import { 
  Shovel, Plus, Search, MapPin, 
  Wheat, ArrowUpRight, Filter, X, RefreshCw, Calendar, Download,
  BarChart2, PieChart as PieChartIcon, Activity, ClipboardList
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../components/ui/select';
import { cn } from '../../../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import PlantingEditDialog from './dialog/PlantingDialog';
import PlantingViewDialog from './dialog/PlantingViewDialog'; 
import PlantingTable from './table/PlantingTable';

const statusOptions = ["All Statuses", "Vegetative", "Flowering", "Seedling", "Maturity"];

const getStatusChartColor = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('seedling')) return '#f59e0b';
  if (s.includes('vegetative')) return '#3b82f6';
  if (s.includes('flowering')) return '#a855f7';
  if (s.includes('maturity') || s.includes('harvest')) return '#10b981';
  if (s.includes('destroy') || s.includes('damage')) return '#f43f5e';
  return '#9ca3af';
};

const emptyForm = { farmer_id: '', barangay_id: '', crop_id: '', area: '', date_planted: '', est_harvest: '', status: 'Seedling' };

export default function PlantingContainer() {
  const dispatch = useAppDispatch();
  const { records, isLoaded } = useAppSelector((state: any) => state.planting);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null); 
  const [formData, setFormData] = useState(emptyForm);
  const location = useLocation(); 
  const navigate = useNavigate(); 

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } };
  };

  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const [plantRes, farmRes, brgyRes, cropRes] = await Promise.all([
        axios.get('plantings', headers), 
        axios.get('farmers', headers),
        axios.get('barangays', headers),
        axios.get('crops', headers)
      ]);
      
      dispatch(setPlantingData({
        records: plantRes.data.data || [], 
        farmers: farmRes.data.data || [], 
        barangays: brgyRes.data.data || [], 
        crops: cropRes.data.data || []      
      }));
    } catch (error) {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => { setFormData(emptyForm); setIsEdit(false); setEditId(null); };

  useEffect(() => { fetchData(false); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, selectedStatus, startDate, endDate]);

  const filteredRecords = useMemo(() => {
    return (records || []).filter((p: any) => {
      const isFarmerActive = p.farmer?.status === 'active';
      if (!isFarmerActive) return false; 

      const farmerName = `${p.farmer?.first_name || ''} ${p.farmer?.last_name || ''}`.toLowerCase();
      const cropName = (p.crop?.category || '').toLowerCase();
      const barangayName = (p.barangay?.name || '').toLowerCase(); 
      const searchLower = search.toLowerCase();
      
      const matchesStatus = selectedStatus === "All Statuses" || p.status === selectedStatus;
      const matchesSearch = farmerName.includes(searchLower) || cropName.includes(searchLower) || barangayName.includes(searchLower);
        let matchesDate = true;
        if (startDate || endDate) {
          if (!p.date_planted) matchesDate = false; 
          else {
            const plantedDate = new Date(p.date_planted);
            plantedDate.setHours(0, 0, 0, 0); 
            if (startDate) { const start = new Date(startDate); start.setHours(0, 0, 0, 0); if (plantedDate < start) matchesDate = false; }
            if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); if (plantedDate > end) matchesDate = false; }
          }
        }
         return matchesSearch && matchesStatus && matchesDate;
      });
  }, [records, search, selectedStatus, startDate, endDate]);

  const { farmerChartData, uniqueStatuses, statusPieData } = useMemo(() => {
    const farmerGroups: Record<string, any> = {};
    const statusesSet = new Set<string>();
    const statusAreas: Record<string, number> = {};
    const statusCrops: Record<string, Record<string, number>> = {}; 

    filteredRecords.forEach((p: any) => {
      const farmerName = `${p.farmer?.first_name || ''} ${p.farmer?.last_name || ''}`.trim() || 'Unknown Farmer';
      const status = p.status || 'Unknown';
      const cropName = p.crop?.category || 'Unknown Crop';
      const area = parseFloat(p.area || 0);

      statusesSet.add(status);

      if (!farmerGroups[farmerName]) {
        farmerGroups[farmerName] = { name: farmerName, totalArea: 0, records: [] };
      }
      // I-update ang area per status para sa stacked bar
      farmerGroups[farmerName][status] = (farmerGroups[farmerName][status] || 0) + area;
      farmerGroups[farmerName].totalArea += area;
      
      // 🌟 KINI ANG IMPORTANTE: I-save ang record para sa breakdown list
      farmerGroups[farmerName].records.push(p);

      // Pie chart data preparation
      statusAreas[status] = (statusAreas[status] || 0) + area;
      if (!statusCrops[status]) statusCrops[status] = {};
      statusCrops[status][cropName] = (statusCrops[status][cropName] || 0) + area;
    });

    const farmerData = Object.values(farmerGroups).sort((a: any, b: any) => b.totalArea - a.totalArea).slice(0, 15);

    const pieData = Object.keys(statusAreas).map(key => ({ 
      name: key, 
      value: statusAreas[key],
      color: getStatusChartColor(key),
      crops: statusCrops[key] 
    }));

    return { 
      farmerChartData: farmerData, 
      uniqueStatuses: Array.from(statusesSet),
      statusPieData: pieData 
    };
  }, [filteredRecords]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentItems = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) return toast.warning("No records to export.");
    const headers = ["Farmer Name", "Location/Barangay", "Crop Category", "Area (ha)", "Date Planted", "Est. Harvest Date", "Status"];
    const rows = filteredRecords.map((p: any) => [`"${p.farmer?.first_name || ''} ${p.farmer?.last_name || ''}"`, `"${p.barangay?.name || 'N/A'}"`, `"${p.crop?.category || 'N/A'}"`, p.area, p.date_planted, p.est_harvest, p.status]);
    const csvContent = [headers.join(","), ...rows.map((r:any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Planting_Records_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("Records exported successfully!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEdit && editId) {
        await axios.put(`plantings/${editId}`, formData, getAuthHeaders());
        toast.success("Planting log updated!");
      } else {
        await axios.post('plantings', formData, getAuthHeaders());
        toast.success("New planting logged!");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "This planting log will be permanently deleted.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        await axios.delete(`plantings/${id}`, getAuthHeaders());
        toast.success("Deleted successfully.");
      } catch (error: any) { toast.error(error.response?.data?.message || "Failed to delete record."); }
    }
  };

  const openNewDialog = () => { resetForm(); setIsDialogOpen(true); };
  const handleEdit = (p: any) => { setFormData({ farmer_id: p.farmer_id, barangay_id: p.barangay_id, crop_id: p.crop_id, area: p.area, date_planted: p.date_planted, est_harvest: p.est_harvest, status: p.status }); setEditId(p.id); setIsEdit(true); setIsDialogOpen(true); };
  const handleView = (p: any) => { setSelectedRecord(p); setIsViewOpen(true); };

  useEffect(() => {
    if (location.state?.openAddDialog) {
      resetForm(); setIsDialogOpen(true); navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const CustomFarmerTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; 
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 min-w-60 max-w-75 z-50">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
             <p className="text-xs font-black uppercase text-gray-800 dark:text-slate-200 tracking-wider">
                {label}
             </p>
             <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                Total: {data.totalArea.toFixed(2)} ha
             </span>
          </div>
          
          <div className="space-y-1.5 mb-3">
            {payload.map((entry: any, index: number) => {
              if (entry.value > 0) {
                return (
                  <div key={index} className="flex justify-between items-center text-[10px] font-bold">
                    <span style={{ color: entry.color }} className="uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{entry.value.toFixed(2)} ha</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl mt-2 max-h-35 overflow-y-auto custom-scrollbar">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Crop Details Breakdown</p>
            <div className="space-y-2">
              {data.records.map((r: any, i: number) => (
                 <div key={i} className="flex flex-col gap-0.5">
                   <p className="text-[11px] font-bold text-gray-700 dark:text-slate-300 truncate">
                      • {r.crop?.category || 'Unknown'}
                   </p>
                   <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider pl-2.5">
                      {parseFloat(r.area).toFixed(2)} ha — <span style={{ color: getStatusChartColor(r.status) }}>{r.status}</span>
                   </p>
                 </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 min-w-50 z-50">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
             <p className="text-xs font-black uppercase tracking-wider" style={{ color: data.color }}>
                {data.name}
             </p>
             <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                {data.value.toFixed(2)} ha
             </span>
          </div>
          
          <div className="space-y-2">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Crop Breakdown</p>
             {Object.entries(data.crops).map(([cropName, area]: [string, any]) => (
                <div key={cropName} className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-600 dark:text-slate-300 uppercase tracking-widest">• {cropName}</span>
                  <span className="text-gray-500 dark:text-gray-400">{area.toFixed(2)} ha</span>
                </div>
             ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartSkeleton = ({ title, icon: Icon }: any) => (
    <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-30"><div className="h-full bg-primary w-[40%] animate-progress-loop" /></div>
       <div className="flex items-center gap-2 mb-4 shrink-0 text-gray-300 dark:text-slate-600"><Icon size={16} /><h3 className="text-xs font-black uppercase tracking-widest">{title}</h3></div>
       <div className="flex-1 w-full bg-gray-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><Shovel className="text-primary" size={20} /><span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Field Operations</span></div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">Planting <span className="text-primary italic">Management</span></h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={exportToCSV} disabled={isLoading || filteredRecords.length === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary/40 border border-primary/10 dark:border-primary/20 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:grayscale shadow-sm"><Download size={18} /> Export Data</button>
          <button onClick={openNewDialog} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"><Plus size={18} /> Log New Planting</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLoading={isLoading} icon={<Shovel />} title="Ongoing Plantings" value={records?.length.toString() || "0"} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<MapPin />} title="Total Area Logged" value={`${records?.reduce((sum: number, p: any) => sum + parseFloat(p.area || 0), 0).toFixed(2)} ha`} color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard isLoading={isLoading} icon={<Wheat />} title="Pending Harvest" value={`${records?.filter((p: any) => new Date(p.est_harvest) >= new Date()).length} Farms`} color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard isLoading={isLoading} icon={<ArrowUpRight />} title="Avg. Growth Rate" value="88%" color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col 2xl:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search Farmer, Crop, or Barangay Location..." className="w-full pl-12 pr-12 h-13 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer"><X size={14} /></button>}
          </div>

          <div className="relative flex items-center bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl h-13 px-4 gap-3 w-full sm:w-auto shrink-0 transition-all focus-within:ring-2 focus-within:ring-primary">
            <Calendar className="text-gray-400 shrink-0" size={18} />
            <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">From Date</span><input type="date" className={cn("bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-slate-200 cursor-pointer w-28", !startDate && "text-gray-400 font-normal")} value={startDate} onChange={(e) => setStartDate(e.target.value)}/></div>
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 shrink-0 mx-1" />
            <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">To Date</span><input type="date" className={cn("bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-slate-200 cursor-pointer w-28", !endDate && "text-gray-400 font-normal")} value={endDate} onChange={(e) => setEndDate(e.target.value)}/></div>
            {(startDate || endDate) && <button onClick={() => { setStartDate(""); setEndDate(""); }} className="p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer ml-1" title="Clear Dates"><X size={14} /></button>}
          </div>
          
          <div className="relative shrink-0 w-full sm:w-auto xl:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                {statusOptions.map((s) => (<SelectItem key={s} value={s} className="text-xs font-bold uppercase py-3 cursor-pointer">{s}</SelectItem>))}
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
             <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Analytics <span className="text-primary italic">Overview</span></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <div className="lg:col-span-2"><ChartSkeleton title="Farmer Crop Area by Status (ha)" icon={BarChart2} /></div>
                <div className="lg:col-span-1"><ChartSkeleton title="Status Distribution (ha)" icon={PieChartIcon} /></div>
              </>
            ) : (
              <>
                <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0">
                    <BarChart2 size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Farmer Crop Area by Status (ha)</h3>
                  </div>
                  <div className="flex-1 w-full min-h-0 flex flex-col">
                    {farmerChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={farmerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(name) => name.split(' ')[0]} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} content={<CustomFarmerTooltip />} />
                          {uniqueStatuses.map((status) => (
                            <Bar key={status} dataKey={status} stackId="a" fill={getStatusChartColor(status)} radius={[0, 0, 0, 0]} barSize={35} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      /* NO DATA PLACEHOLDER FOR BAR CHART */
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                        <BarChart2 size={48} strokeWidth={1} className="mb-2 opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Field Activities Found</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0">
                    <PieChartIcon size={16} className="text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Status Distribution (ha)</h3>
                  </div>
                  <div className="flex-1 w-full min-h-0 flex flex-col">
                    {statusPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                            {statusPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} /> ))}
                          </Pie>
                          <RechartsTooltip content={<CustomPieTooltip />} />
                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      /* NO DATA PLACEHOLDER FOR PIE CHART */
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                        <PieChartIcon size={48} strokeWidth={1} className="mb-2 opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Status Distribution</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
 

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
           <ClipboardList className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">Planting <span className="text-primary italic">Records Data</span></h2>
        </div>
        <PlantingTable isLoading={isLoading} items={currentItems} allFilteredItems={filteredRecords} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
      </div>

      <PlantingEditDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSave={handleSave} formData={formData} setFormData={setFormData} isSaving={isSaving} isEdit={isEdit} />
      <PlantingViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} planting={selectedRecord} onUpdateRecord={setSelectedRecord} />
    </div>
  );
}

const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm overflow-hidden h-28">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30"><div className="w-full h-[40%] bg-primary" style={{ animation: 'progress-loop-y 1.5s linear infinite' }} /></div>
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 w-full"><div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" /><div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" /></div>
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
