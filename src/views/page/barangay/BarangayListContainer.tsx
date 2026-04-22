import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setBarangayData, updateBarangayRecord } from '../../../store/slices/barangaySlice';

import { 
  MapPin, Search, Filter, RefreshCw, LandPlot, Building2,
  Mountain, Waves, Anchor, Sprout, Leaf, AreaChart as AreaChartIcon, 
  PieChart as PieChartIcon, PhilippinePeso, Activity, ClipboardList, X,
  User 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';

import { 
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';

import { BarangayMetricCard } from './cards/BarangayMetricCard';
import { BarangayTable } from './table/BarangayTable';
import EditBarangayDialog from './dialog/EditBarangayDialog';
import ViewMapDialog from './dialog/ViewMapDialog';

import { TopographyFarmerListDialog } from './cards/TopographyWidgets';
import { FarmersTabContent } from './tabs/FarmersTabContent';
import { FisherfolksTabContent } from './tabs/FisherfolksTabContent';
import { PlantingLogsTabContent } from './tabs/PlantingLogsTabContent';
import { CooperativesTabContent } from './tabs/CooperativesTabContent';
import { CropsTabContent } from './tabs/CropsTabContent';

const classifications = ["Urban (Poblacion)", "Rural", "Coastal"];
const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e']; 

export default function BarangayListContainer() {
  const dispatch = useAppDispatch();
  const { records: barangays, isLoaded } = useAppSelector((state: any) => state.barangay);

  const [activeTab, setActiveTab] = useState<'barangays' | 'farmers' | 'fisherfolks' | 'cooperatives' | 'planting' | 'harvests'>('barangays');
  const [search, setSearch] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classifications");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isFarmerListOpen, setIsFarmerListOpen] = useState(false);
  const [selectedTopographyLabel, setSelectedTopographyLabel] = useState("");

  const [selectedBarangayId, setSelectedBarangayId] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBrgy, setSelectedBrgy] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', type: '', latitude: '', longitude: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapBarangay, setMapBarangay] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allFarmers = useMemo(() => barangays.flatMap((b: any) => b.farmersList || []), [barangays]);

  const topographyStats = useMemo(() => {
    const stats = { 
        plain: { area: 0, farmers: [] as any[] }, 
        rolling: { area: 0, farmers: [] as any[] }, 
        sloping: { area: 0, farmers: [] as any[] } 
    };
    allFarmers.forEach((f: any) => {
      const top = String(f.topography || "").toLowerCase();
      const area = Number(f.total_area || 0);
      if (stats[top as keyof typeof stats]) {
        stats[top as keyof typeof stats].area += area;
        stats[top as keyof typeof stats].farmers.push(f);
      }
    });
    return stats;
  }, [allFarmers]);

  const dynamicMetrics = useMemo(() => ({
    total: barangays.length,
    urban: barangays.filter((b: any) => b.type === 'Urban (Poblacion)').length,
    rural: barangays.filter((b: any) => b.type === 'Rural').length,
    coastal: barangays.filter((b: any) => b.type === 'Coastal').length,
  }), [barangays]);

  const salesPerBarangayData = useMemo(() => {
    const data = barangays.map((b: any) => {
      const totalSales = (b.harvests || []).reduce((sum: number, h: any) => sum + (parseFloat(String(h.value || '0').replace(/[^0-9.-]+/g, "")) || 0), 0);
      return { name: b.name, sales: totalSales };
    });
    return data.sort((a: any, b: any) => b.sales - a.sales).slice(0, 10);
  }, [barangays]);

  const topographyPieData = useMemo(() => {
    return [
      { name: 'Plain Land', value: topographyStats.plain.area, key: 'plain' },
      { name: 'Rolling Land', value: topographyStats.rolling.area, key: 'rolling' },
      { name: 'Sloping Land', value: topographyStats.sloping.area, key: 'sloping' }
    ].filter(item => item.value > 0);
  }, [topographyStats]);

  const formatShortCurrency = (num: number) => {
    if (num >= 1000000) return `₱${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₱${(num / 1000).toFixed(0)}K`;
    return `₱${num}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl z-50">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">₱ {payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl z-50 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">{payload[0].name}</p>
            <p className="text-xs font-black text-gray-800 dark:text-white">{payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HA</p>
            <p className="text-[8px] font-bold text-gray-400 uppercase italic">Click to view farmers</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const fetchBarangays = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('barangays');
      dispatch(setBarangayData({ records: response.data.data || [], metrics: response.data.metrics || {} }));
      if (response.data.data?.length > 0) setSelectedBarangayId(response.data.data[0].id);
    } catch (error) { toast.error("Failed to load barangay data."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { 
    fetchBarangays(false); 
    if (barangays.length > 0 && !selectedBarangayId) setSelectedBarangayId(barangays[0].id);
  }, [barangays.length]);

  const handleUpdateBarangay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await axios.put(`barangays/${selectedBrgy.id}`, formData);
      dispatch(updateBarangayRecord(response.data.data));
      toast.success("Barangay updated!");
      setIsEditModalOpen(false);
    } catch (error) { toast.error("Update failed."); }
    finally { setIsSaving(false); }
  };

  const filteredBarangays = useMemo(() => (
    (barangays || []).filter((brgy: any) => {
      const matchesSearch = String(brgy.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesClass = selectedClass === "All Classifications" || brgy.type === selectedClass;
      return matchesSearch && matchesClass;
    })
  ), [barangays, search, selectedClass]);

  const sidebarBarangays = useMemo(() => (
    (barangays || []).filter((brgy: any) => String(brgy.name || "").toLowerCase().includes(sidebarSearch.toLowerCase()))
  ), [barangays, sidebarSearch]);

  const activeBarangayData = useMemo(() => barangays.find((b: any) => b.id === selectedBarangayId), [barangays, selectedBarangayId]);

  const activeBarangayTotalSales = useMemo(() => {
    if (!activeBarangayData || !activeBarangayData.harvests) return 0;
    return activeBarangayData.harvests.reduce((sum: number, h: any) => sum + (parseFloat(String(h.value || '0').replace(/[^0-9.-]+/g, "")) || 0), 0);
  }, [activeBarangayData]);

  const activeBarangayCrops = useMemo(() => {
    if (!activeBarangayData) return [];
    const cropMap = new Map();

    const parseFarms = (farmer: any) => {
      if (Array.isArray(farmer?.farms_list)) return farmer.farms_list;
      if (typeof farmer?.farms_list === 'string') {
        try {
          const parsed = JSON.parse(farmer.farms_list);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const initCrop = (cropData: any) => {
      if (!cropMap.has(cropData.id)) {
        cropMap.set(cropData.id, { ...cropData, registered_farmers_count: 0, totalArea: 0, totalRevenue: 0, registered_farmers: [] });
      }
      return cropMap.get(cropData.id);
    };

    const getCropAreaForFarmer = (farmer: any, targetCropId: number) => {
      const farms = parseFarms(farmer);

      if (farms.length > 0) {
        const matchedArea = farms
          .filter((farm: any) => String(farm?.crop_id) === String(targetCropId))
          .reduce((sum: number, farm: any) => sum + Number(farm?.total_area || 0), 0);

        if (matchedArea > 0) return matchedArea;
      }

      if (String(farmer.crop_id) === String(targetCropId)) {
        return Number(farmer.total_area || 0);
      }

      return 0;
    };

    (activeBarangayData.farmersList || []).forEach((f: any) => {
      const cropsInvolved = new Set<number>();
      const farms = parseFarms(f);

      if (farms.length > 0) {
         farms.forEach((p: any) => { if (p.crop_id) cropsInvolved.add(p.crop_id); });
      } else if (f.crop_id || f.crop) {
         cropsInvolved.add(f.crop_id || f.crop.id);
      }

      cropsInvolved.forEach((cId) => {
         const cropData =
           farms.find((p:any) => String(p.crop_id) === String(cId))?.crop ||
           f.crop ||
           { id: cId, category: 'Crop ' + cId };
         const cropStat = initCrop(cropData);
         if (!cropStat.registered_farmers.find((rf: any) => rf.id === f.id)) {
            const computedCropArea = getCropAreaForFarmer(f, cId);
            cropStat.registered_farmers.push({ ...f, individual_sales: 0, harvest_records: [], computed_crop_area: computedCropArea });
            cropStat.registered_farmers_count += 1;
            cropStat.totalArea += computedCropArea;
         }
      });
    });

    (activeBarangayData.harvests || []).forEach((h: any) => {
      if (h.crop) {
        const cropStat = initCrop(h.crop);
        const val = parseFloat(String(h.value || '0').replace(/[^0-9.-]+/g, "")) || 0;
        
        cropStat.totalRevenue += val;
        let targetFarmer = cropStat.registered_farmers.find((rf: any) => rf.id === h.farmer_id);

        if (!targetFarmer) {
          const fallbackFarmer = h.farmer || { id: h.farmer_id, first_name: 'Farmer ID:', last_name: h.farmer_id, rsbsa_no: 'N/A', total_area: 0 };
          targetFarmer = { ...fallbackFarmer, individual_sales: 0, harvest_records: [], computed_crop_area: getCropAreaForFarmer(fallbackFarmer, h.crop.id) };
          cropStat.registered_farmers.push(targetFarmer);
          cropStat.registered_farmers_count += 1;
          cropStat.totalArea += targetFarmer.computed_crop_area;
        }

        targetFarmer.individual_sales += val;
        if (!targetFarmer.harvest_records) targetFarmer.harvest_records = [];
        targetFarmer.harvest_records.push(h);
      }
    });

    return Array.from(cropMap.values());
  }, [activeBarangayData]);

  const handlePieClick = (data: any) => {
    if (data && data.key) {
        setSelectedTopographyLabel(data.key);
        setIsFarmerListOpen(true);
    }
  };

  const tabs = [
    { id: 'barangays', label: 'Barangay List', icon: <MapPin size={16} /> },
    { id: 'farmers', label: `Farmers`, icon: <User size={16} /> },
    { id: 'fisherfolks', label: `Fisherfolks`, icon: <Anchor size={16} /> },
    { id: 'cooperatives', label: `Cooperatives`, icon: <Building2 size={16} /> },
    { id: 'planting', label: `Planting Logs`, icon: <Sprout size={16} /> },
    { id: 'harvests', label: `Harvest Records`, icon: <Leaf size={16} /> },
  ];

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <MapPin size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Geographical Data</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Gingoog <span className="text-primary italic">Registries</span>
          </h2>
        </div>
      </div>

     {/* TAB NAVIGATION (Bootstrap-like Nav Tabs) */}
<div className="relative border-b border-gray-200 dark:border-slate-800 overflow-x-auto custom-scrollbar scrollbar-hide">
  <div className="flex items-center gap-8 px-2 min-w-max">
    {tabs.map((tab) => {
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
            {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 16 })}
          </span>
          
          {tab.label}

          {/* 🌟 ACTIVE INDICATOR (The Underline) */}
          {isActive ? (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-300" />
          ) : (
            // Hover effect line (optional)
            <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gray-200 dark:bg-slate-700 transition-all duration-300" />
          )}
        </button>
      );
    })}
  </div>
</div>

      {activeTab === 'barangays' && (
        <div className="animate-in fade-in duration-500 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <BarangayMetricCard isLoading={isLoading} icon={<LandPlot />} title="Total Barangays" value={dynamicMetrics.total.toString()} color="text-primary" bgColor="bg-primary/10" />
            <BarangayMetricCard isLoading={isLoading} icon={<Building2 />} title="Urban Areas" value={dynamicMetrics.urban.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
            <BarangayMetricCard isLoading={isLoading} icon={<Mountain />} title="Rural Areas" value={dynamicMetrics.rural.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
            <BarangayMetricCard isLoading={isLoading} icon={<Waves />} title="Coastal Zones" value={dynamicMetrics.coastal.toString()} color="text-cyan-500" bgColor="bg-cyan-500/10" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Barangay Name..." 
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative shrink-0 w-full md:w-55">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer">
                  <SelectValue placeholder="Classification" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
                  <SelectItem value="All Classifications" className="text-xs font-bold uppercase py-3 cursor-pointer">All Classifications</SelectItem>
                  {classifications.map((c) => (<SelectItem key={c} value={c} className="text-xs font-bold uppercase py-3 cursor-pointer">{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <button onClick={() => fetchBarangays(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30">
              <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
              <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
            </button>
          </div>

          {(isLoading || barangays.length > 0) && (
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
                    <div className="lg:col-span-2"><ChartSkeleton title="Total Sales per Barangay" icon={AreaChartIcon} /></div>
                    <div className="lg:col-span-1"><ChartSkeleton title="Topography Distribution" icon={PieChartIcon} /></div>
                  </>
                ) : (
                  <>
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-80">
                       <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0">
                         <AreaChartIcon size={16} className="text-emerald-500" />
                         <h3 className="text-xs font-black uppercase tracking-widest">Total Sales per Barangay</h3>
                       </div>
                       
                       <div className="flex-1 w-full min-h-0">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={salesPerBarangayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <defs>
                               <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} />
                             <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }} />
                             <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                    </div>

                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-80">
                       <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-slate-200 shrink-0">
                         <PieChartIcon size={16} className="text-blue-500" />
                         <h3 className="text-xs font-black uppercase tracking-widest">Topography Distribution (HA)</h3>
                       </div>
                       
                       <div className="flex-1 w-full min-h-0 relative">
                         {topographyPieData.length === 0 ? (
                           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              No Data Available
                           </div>
                         ) : (
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie 
                                 data={topographyPieData} 
                                 cx="50%" cy="50%" 
                                 innerRadius={50} outerRadius={80} 
                                 paddingAngle={5} dataKey="value" stroke="none"
                                 onClick={(data) => handlePieClick(data.payload)}
                                 className="cursor-pointer outline-none"
                               >
                                 {topographyPieData.map((_entry, index) => (
                                   <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity" />
                                 ))}
                               </Pie>
                               <RechartsTooltip content={<PieTooltip />} cursor={{fill: 'transparent'}} />
                               <Legend verticalAlign="bottom" align="center" height={20} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', paddingTop: '10px'}} />
                             </PieChart>
                           </ResponsiveContainer>
                         )}
                       </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-1">
               <ClipboardList className="text-primary" size={20} />
               <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                 Barangay <span className="text-primary italic">Data Records</span>
               </h2>
            </div>

            <BarangayTable 
              isLoading={isLoading} 
              currentBarangays={filteredBarangays.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
              allFilteredItems={filteredBarangays} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalPages={Math.ceil(filteredBarangays.length / itemsPerPage)} 
              openEdit={(brgy: any) => { 
                setSelectedBrgy(brgy); 
                setFormData({ 
                  name: brgy.name, 
                  type: brgy.type,
                  latitude: brgy.latitude || '', 
                  longitude: brgy.longitude || '' 
                }); 
                setIsEditModalOpen(true); 
              }}
              openMap={(brgy: any) => { setMapBarangay(brgy); setIsMapModalOpen(true); }} 
            />
          </div>
        </div>
      )}

      {activeTab !== 'barangays' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-500">
          
          <div className="w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-4 shadow-sm shrink-0 lg:sticky lg:top-4 z-10">
            <h3 className="text-xs font-black uppercase text-gray-800 dark:text-white tracking-widest px-2 mb-4">Select Barangay</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search..." className="w-full pl-9 pr-3 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-xs font-bold outline-none transition-all" value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} />
            </div>
            
            <div className="flex flex-col gap-2 max-h-150 overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 animate-pulse">
                    <div className="space-y-2"><div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div><div className="h-2 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div></div>
                    <div className="h-6 w-8 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                ))
              ) : (
                sidebarBarangays.map((b: any) => {
                  let countText = "";
                  
                  if (activeTab === 'farmers') countText = `${b.farmersList?.length || 0} Farmer(s)`;
                  if (activeTab === 'fisherfolks') countText = `${b.fisherfolksList?.length || 0} Fisherfolk(s)`;
                  if (activeTab === 'cooperatives') countText = `${b.cooperativesList?.length || 0} Org(s)`;
                  if (activeTab === 'planting') countText = `${b.plantingLogs?.length || 0} Log(s)`;

                  if (activeTab === 'harvests') {
                    const uniqueCrops = new Set();
                    (b.farmersList || []).forEach((f: any) => { 
                       if (f.farms_list) f.farms_list.forEach((fl:any) => { if (fl.crop_id) uniqueCrops.add(fl.crop_id); });
                       else if (f.crop_id) uniqueCrops.add(f.crop_id); 
                    });
                    (b.harvests || []).forEach((h: any) => { if (h.crop_id) uniqueCrops.add(h.crop_id); });
                    countText = `${uniqueCrops.size} Crops`;
                  }

                  const isSelected = selectedBarangayId === b.id;
                  
                  return (
                    <button key={b.id} onClick={() => setSelectedBarangayId(b.id)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer text-left border", isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-primary/30 text-gray-700 dark:text-gray-300")}>
                      <div><p className="text-xs font-black uppercase leading-none">{b.name}</p><p className={cn("text-[9px] font-bold uppercase mt-1 tracking-widest", isSelected ? "text-white/80" : "text-gray-400")}>{b.code}</p></div>
                      <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black", isSelected ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-500")}>
                         {countText}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between mb-2">
               <div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase leading-none">
                     {isLoading ? "Loading Data..." : (activeBarangayData?.name || "No Barangay Selected")}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
                    {activeTab === 'farmers' ? "Registered Farmers Masterlist" : 
                     activeTab === 'planting' ? "Active Planting & Field Logs" : 
                     activeTab === 'fisherfolks' ? "Registered Fisherfolks List" : 
                     activeTab === 'harvests' ? "Harvest Records & Analytics" : 
                     "Registered Cooperatives List"}
                  </p>
               </div>
               
               <div className="flex items-center gap-4">
                  {activeTab === 'harvests' && (
                    <div className="hidden sm:block text-right border-r border-gray-100 dark:border-slate-700 pr-5 mr-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                         <PhilippinePeso size={12}/> Overall Sales
                       </p>
                       <p className="text-xl font-black text-emerald-600 uppercase">
                         ₱ {activeBarangayTotalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                       </p>
                    </div>
                  )}

                  <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
                    {activeTab === 'farmers' ? <User size={24}/> : activeTab === 'fisherfolks' ? <Anchor size={24}/> : activeTab === 'harvests' ? <Leaf size={24}/> : activeTab === 'planting' ? <Sprout size={24}/> : <Building2 size={24}/>}
                  </div>
               </div>
            </div>

            {activeTab === 'farmers' && (
              <FarmersTabContent 
                farmers={activeBarangayData?.farmersList || []} 
                isLoading={isLoading} 
                allBarangays={barangays} // I-pasa ang tanang barangay records dire
              />
            )}
            {activeTab === 'planting' && <PlantingLogsTabContent logs={activeBarangayData?.plantingLogs || []} isLoading={isLoading} />}
            {activeTab === 'harvests' && <CropsTabContent crops={activeBarangayCrops} isLoading={isLoading} />}
            {activeTab === 'fisherfolks' && <FisherfolksTabContent fisherfolks={activeBarangayData?.fisherfolksList || []} isLoading={isLoading} />}
            {activeTab === 'cooperatives' && <CooperativesTabContent cooperatives={activeBarangayData?.cooperativesList || []} isLoading={isLoading} />}
          </div>
        </div>
      )}

      {/* MGA MODALS */}
      <EditBarangayDialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} selectedBrgy={selectedBrgy} formData={formData} setFormData={setFormData} onSave={handleUpdateBarangay} isSaving={isSaving} />
      <TopographyFarmerListDialog isOpen={isFarmerListOpen} onClose={() => setIsFarmerListOpen(false)} label={selectedTopographyLabel} farmers={topographyStats[selectedTopographyLabel as keyof typeof topographyStats]?.farmers || []} />
      <ViewMapDialog isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} mapBarangay={mapBarangay} allBarangays={barangays} />
      
    </div>
  );
}
