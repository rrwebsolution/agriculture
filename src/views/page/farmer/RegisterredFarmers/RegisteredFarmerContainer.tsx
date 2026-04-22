import { useState, useEffect, useMemo } from 'react';

// 🌟 REDUX & API IMPORTS
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setFarmerData, updateFarmerRecord } from '../../../../store/slices/farmerSlice';

// 🌟 ICONS & UI COMPONENTS
import { 
  Users, Plus, Search, Filter, Sprout, Tractor, UserCheck, LandPlot, 
  RefreshCw, X, Activity, ClipboardList, BarChart2, PieChart as PieChartIcon 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import axios from './../../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../../lib/utils';

// 🌟 RECHARTS IMPORTS
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

// 🌟 IMPORT SEPARATED COMPONENTS
import FarmerMetricCard from './cards/FarmerMetricCard';
import FarmerTable from './table/FarmerTable';
import FarmerDialog from './dialog/FarmerDialog';
import FarmerViewDialog from './dialog/FarmerViewDialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPageAccess } from '../../../../lib/permissions';

const statusOptions = ["All Status", "active", "inactive"];

export default function RegisteredFarmerContainer() {
  const dispatch = useAppDispatch();

  const { records: farmers = [], isLoaded } = useAppSelector((state: any) => state.farmer);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation(); // <-- Add this
  const navigate = useNavigate(); // <-- Add this
  const { canManage } = getPageAccess(location.pathname);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

  const fetchData = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;

    setIsLoading(true);
    try {
      const [farmerRes, brgyRes, cropRes, coopRes] = await Promise.all([
        axios.get('farmers'),
        axios.get('barangays'),
        axios.get('crops'),
        axios.get('cooperatives')
      ]);

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
  }, [dispatch, isLoaded]); 

  useEffect(() => { 
    fetchData(false); 
  }, [dispatch, isLoaded]); 

  // 🌟 NEW EFFECT: Listen for redirection state from Dashboard
  useEffect(() => {
    if (location.state?.openAddDialog) {
      setSelectedFarmer(null); // Ensure it acts as "Register" instead of "Edit"
      setIsDialogOpen(true);
      
      // Clear the state so it doesn't pop up again if the user reloads the page
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // --- 🌟 ADVANCED CHART DATA PROCESSING ---
  const { barChartData, pieChartData, totalChartFarmers } = useMemo(() => {
    
    const stats = {
      both: { count: 0, planted: 0, harvest: 0 },
      planting: { count: 0, planted: 0 },
      harvest: { count: 0, harvest: 0 },
      idle: { count: 0 }
    };

    const chartData = farmers.map((f: any) => {
      const plantedArea = (f.plantings || []).reduce((sum: number, p: any) => sum + parseFloat(p.area || 0), 0);
      const harvestYield = (f.harvests || []).reduce((sum: number, h: any) => sum + parseFloat(String(h.quantity).replace(/[^0-9.-]+/g, "") || "0"), 0);

      const plantingsCount = (f.plantings || []).length;
      const harvestsCount = (f.harvests || []).length;

      if (plantingsCount > 0 && harvestsCount > 0) {
        stats.both.count++;
        stats.both.planted += plantedArea;
        stats.both.harvest += harvestYield;
      } else if (plantingsCount > 0) {
        stats.planting.count++;
        stats.planting.planted += plantedArea;
      } else if (harvestsCount > 0) {
        stats.harvest.count++;
        stats.harvest.harvest += harvestYield;
      } else {
        stats.idle.count++;
      }

      return {
        name: `${f.first_name} ${f.last_name}`.trim(),
        shortName: `${f.first_name.charAt(0)}. ${f.last_name}`,
        plantedArea,
        harvestYield,
        plantingsCount,
        harvestsCount,
        totalActivity: plantingsCount + harvestsCount // Used for sorting highest engaged
      };
    })
    .filter((d: any) => d.totalActivity > 0) 
    .sort((a: any, b: any) => b.totalActivity - a.totalActivity) 
    .slice(0, 15); 

    const pieData = [
      { name: 'Planting & Harvest', value: stats.both.count, planted: stats.both.planted, harvest: stats.both.harvest, color: '#10b981' }, 
      { name: 'Planting Only', value: stats.planting.count, planted: stats.planting.planted, harvest: 0, color: '#3b82f6' }, 
      { name: 'Harvest Only', value: stats.harvest.count, planted: 0, harvest: stats.harvest.harvest, color: '#f59e0b' }, 
      { name: 'Idle (No Activity)', value: stats.idle.count, planted: 0, harvest: 0, color: '#9ca3af' }, 
    ].filter(d => d.value > 0);

    return { 
      barChartData: chartData, 
      pieChartData: pieData,
      totalChartFarmers: farmers.length 
    };
  }, [farmers]);

  const filteredFarmers = farmers.filter((f: any) => {
    const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
    const searchLower = search.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || (f.rsbsa_no || '').includes(searchLower);
    const matchesStatus = selectedStatus === "All Status" || f.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFarmers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, selectedStatus]);

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

  const openView = (farmer: any) => { setSelectedFarmer(farmer); setIsViewOpen(true); };
  const openEdit = (farmer: any) => { setSelectedFarmer(farmer); setIsDialogOpen(true); };

  // 🌟 ENHANCED TOOLTIP FOR DUAL-AXIS BAR CHART
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; 
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 min-w-55 z-50">
          <p className="text-xs font-black uppercase text-gray-800 dark:text-slate-200 tracking-wider border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
             {data.name}
          </p>
          <div className="space-y-3">
             
             {/* Plantings Section */}
             <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                  <span className="text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Plantings Count
                  </span>
                  <span className="text-gray-800 dark:text-white font-black">{data.plantingsCount} Logs</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-medium text-gray-400 uppercase tracking-widest pl-3">
                   <span>Total Area</span>
                   <span>{data.plantedArea.toFixed(2)} ha</span>
                </div>
             </div>

             <div className="h-px bg-gray-50 dark:bg-slate-700" />

             {/* Harvests Section */}
             <div>
                <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                  <span className="text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Harvests Count
                  </span>
                  <span className="text-gray-800 dark:text-white font-black">{data.harvestsCount} Logs</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-medium text-gray-400 uppercase tracking-widest pl-3">
                   <span>Total Yield</span>
                   <span>{data.harvestYield.toFixed(2)} MT</span>
                </div>
             </div>
             
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomEngagementTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 min-w-55 z-50">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2 mb-3">
             <p className="text-xs font-black uppercase tracking-wider" style={{ color: data.color }}>
                {data.name}
             </p>
             <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                {data.value} Farmers
             </span>
          </div>
          
          <div className="space-y-2">
             {data.planted > 0 && (
               <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Total Area
                  </span>
                  <span className="text-gray-800 dark:text-slate-200">{data.planted.toFixed(2)} ha</span>
               </div>
             )}
             {data.harvest > 0 && (
               <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Total Yield
                  </span>
                  <span className="text-gray-800 dark:text-slate-200">{data.harvest.toFixed(2)} MT</span>
               </div>
             )}
             {data.planted === 0 && data.harvest === 0 && (
               <p className="text-[10px] font-medium text-gray-400 italic">No field data recorded yet.</p>
             )}
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartSkeleton = ({ title, icon: Icon }: any) => (
    <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-30">
         <div className="h-full bg-primary w-[40%] animate-progress-loop" />
       </div>
       <div className="flex items-center gap-2 mb-4 shrink-0 text-gray-300 dark:text-slate-600">
          <Icon size={16} />
          <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
       </div>
       <div className="flex-1 w-full bg-gray-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
    </div>
  );

  

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
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
        {canManage && (
          <button 
            onClick={() => { setSelectedFarmer(null); setIsDialogOpen(true); }} 
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Register Farmer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerMetricCard isLoading={isLoading} icon={<Users />} title="Total Farmers" value={farmers.length.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <FarmerMetricCard isLoading={isLoading} icon={<UserCheck />} title="Active Status" value={farmers.filter((f:any) => f.status === 'active').length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <FarmerMetricCard isLoading={isLoading} icon={<LandPlot />} title="Total Area (Ha)" value={farmers.reduce((sum: number, f:any) => sum + Number(f.total_area || 0), 0).toFixed(1)} color="text-amber-500" bgColor="bg-amber-500/10" />
        <FarmerMetricCard isLoading={isLoading} icon={<Sprout />} title="Main Livelihood" value={farmers.filter((f:any) => f.is_main_livelihood).length.toString()} color="text-purple-500" bgColor="bg-purple-500/10" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search Name or RSBSA..." className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer"><X size={14} /></button>}
        </div>

        <div className="relative shrink-0 w-full md:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
              {statusOptions.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <button onClick={() => fetchData(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30">
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary ")} />
          <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
        </button>
      </div>

      {/* 🌟 ANALYTICS OVERVIEW SECTION */}
      <div className="space-y-4 pt-2">
  <div className="flex items-center gap-2 px-1">
     <Activity className="text-primary" size={20} />
     <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
       Analytics <span className="text-primary italic">Overview</span>
     </h2>
  </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <div className="lg:col-span-2"><ChartSkeleton title="Plantings vs Harvests Count" icon={BarChart2} /></div>
                <div className="lg:col-span-1"><ChartSkeleton title="Farmer Engagement" icon={PieChartIcon} /></div>
              </>
            ) : (
              <>
                {/* 🌟 UPDATED DUAL-AXIS BAR CHART: Count Base */}
                <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0">
                    <BarChart2 size={16} className="text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Plantings vs Harvests Logs (Top 15)</h3>
                  </div>
                  {/* 🌟 BAR CHART CONTAINER */}
                  <div className="flex-1 w-full min-h-0 flex flex-col">
                    {barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="shortName" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#10b981' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#f59e0b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <RechartsTooltip cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} content={<CustomBarTooltip />} />
                          <Bar yAxisId="left" dataKey="plantingsCount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar yAxisId="right" dataKey="harvestsCount" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      /* NO DATA PLACEHOLDER */
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                        <BarChart2 size={48} strokeWidth={1} className="mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Activity Logs Found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🌟 PIE CHART: Farmer Engagement */}
                <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm h-80 flex flex-col relative">
                  <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0 z-10">
                    <PieChartIcon size={16} className="text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Farmer Engagement</h3>
                  </div>
                  
                  {/* 🌟 CENTERED LABEL - HIDDEN IF 0 */}
                  {totalChartFarmers > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                      <span className="text-2xl font-black text-gray-800 dark:text-white leading-none">
                        {totalChartFarmers}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Farmers
                      </span>
                    </div>
                  )}

                  {/* 🌟 PIE CHART CONTAINER */}
                  <div className="flex-1 w-full min-h-0 flex flex-col">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} /> 
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomEngagementTooltip />} cursor={{fill: 'transparent'}} />
                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      /* NO DATA PLACEHOLDER */
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                        <PieChartIcon size={48} strokeWidth={1} className="mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Engagement Data</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
 

      {/* TABLE SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
           <ClipboardList className="text-primary" size={20} />
           <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
             Registry <span className="text-primary italic">Data Records</span>
           </h2>
        </div>

        <FarmerTable 
          isLoading={isLoading}
          currentItems={currentItems}
          filteredDataLength={filteredFarmers.length}
          handleToggleStatus={canManage ? handleToggleStatus : undefined}
          openView={openView}
          openEdit={canManage ? openEdit : undefined}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
        />
      </div>

      <FarmerDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onUpdate={handleFarmerUpdate} farmer={selectedFarmer} />
      <FarmerViewDialog isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} farmer={selectedFarmer} />
    </div>
  );
}
