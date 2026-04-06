import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tractor, Plus, Search, Edit3, Trash2, Eye, Filter, Settings, Wrench, CheckCircle2, Users, MapPin, Anchor, Droplets, PenTool, RefreshCw, X, Database } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { toast } from 'react-toastify';
import { cn } from '../../../../lib/utils';
import Swal from 'sweetalert2';
import axios from '../../../../plugin/axios';

// --- REDUX ACTIONS ---
import { setEquipmentData, updateEquipmentRecord, deleteEquipmentRecord } from '../../../../store/slices/equipmentSlice'; 

// COMPONENTS
import InventoryMetricCard from '../inventory/InventoryMetricCard';
import NewEquipmentModal from './modal/NewEquipmentModal';
import EditEquipmentModal from './modal/EditEquipmentModal';
import ViewEquipmentModal from './modal/ViewEquipmentModal';

// --- CONSTANTS FOR OPTIONS ---
const DEFAULT_EQUIPMENTS = ["Hand Tractor (Kuliglig)", "Marine Engine 16HP", "Knapsack Sprayer 16L", "Water Pump 4-inch", "Rice Thresher", "Grass Cutter"];
const DEFAULT_TYPES = ["Farm Machinery", "Post-Harvest", "Irrigation", "Fishery Equipment", "Hand Tools"];
const DEFAULT_PROGRAMS = ["Rice Program", "Corn Program", "Fishery Program", "HVCDP"];
const DEFAULT_CONDITIONS = ["Excellent", "Good", "Fair", "Needs Repair", "Critical"];
const DEFAULT_STATUSES = ["In Depot", "Deployed", "Maintenance", "Turned Over", "Donated"];

const loadFromStorage = (key: string, defaultList: any) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultList;
};

export default function EquipmentsContainer() {
  const dispatch = useDispatch();
  
  // 1. REDUX STATE
  const { records: equipments, isLoaded } = useSelector((state: any) => state.equipment);

  // 2. UI & Pagination States
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 3. Modals State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 4. Options State (Cached in LocalStorage)
  const [typeOptions, setTypeOptions] = useState<string[]>(() => loadFromStorage('eqp_types', DEFAULT_TYPES));
  const [programOptions, setProgramOptions] = useState<string[]>(() => loadFromStorage('eqp_programs', DEFAULT_PROGRAMS));
  const [equipmentList, setEquipmentList] = useState<string[]>(() => loadFromStorage('eqp_names_list', DEFAULT_EQUIPMENTS));
  const [conditionOptions, setConditionOptions] = useState<string[]>(() => loadFromStorage('eqp_conditions', DEFAULT_CONDITIONS));
  const [statusOptions, setStatusOptions] = useState<string[]>(() => loadFromStorage('eqp_statuses', DEFAULT_STATUSES));

  // 5. Lookups State (Cached in LocalStorage)
  const [coopsRaw, setCoopsRaw] = useState<any[]>(() => loadFromStorage('eqp_coops_raw', []));
  const [coopOptions, setCoopOptions] = useState<string[]>(() => loadFromStorage('eqp_coops_opts', []));
  const [brgyNames, setBrgyNames] = useState<string[]>(() => loadFromStorage('eqp_brgy_names', []));

  // --- API FETCH LOGIC ---
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    // 🛑 If Redux already has data AND the user didn't click refresh, STOP HERE!
    if (isLoaded && !isRefresh) return;

    setIsLoading(true); // Always trigger loading so skeleton shows up
    try {
      // 1. Fetch Lookups (Coops/Brgys)
      const lookupRes = await axios.get('/equipments/lookups');
      setCoopsRaw(lookupRes.data.cooperatives);
      setCoopOptions(lookupRes.data.cooperatives.map((c: any) => c.name));
      setBrgyNames(lookupRes.data.barangays.map((b: any) => b.name));

      // 2. Fetch equipments (Get everything at once for Redux)
      const res = await axios.get('/equipments'); 
      dispatch(setEquipmentData(res.data)); 
      
     } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, dispatch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sync Options & Lookups to LocalStorage
  useEffect(() => { localStorage.setItem('eqp_types', JSON.stringify(typeOptions)); }, [typeOptions]);
  useEffect(() => { localStorage.setItem('eqp_programs', JSON.stringify(programOptions)); }, [programOptions]);
  useEffect(() => { localStorage.setItem('eqp_names_list', JSON.stringify(equipmentList)); }, [equipmentList]);
  useEffect(() => { localStorage.setItem('eqp_conditions', JSON.stringify(conditionOptions)); }, [conditionOptions]);
  useEffect(() => { localStorage.setItem('eqp_statuses', JSON.stringify(statusOptions)); }, [statusOptions]);
  useEffect(() => { localStorage.setItem('eqp_coops_raw', JSON.stringify(coopsRaw)); }, [coopsRaw]);
  useEffect(() => { localStorage.setItem('eqp_coops_opts', JSON.stringify(coopOptions)); }, [coopOptions]);
  useEffect(() => { localStorage.setItem('eqp_brgy_names', JSON.stringify(brgyNames)); }, [brgyNames]);

  // --- FRONTEND SEARCH & FILTERING ---
  const filteredEquipments = equipments.filter((e: any) => {
    const beneficiaryString = Array.isArray(e.beneficiary) ? e.beneficiary.join(", ") : (e.beneficiary || "");
    const matchesSearch = 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.sku.toLowerCase().includes(search.toLowerCase()) || 
      beneficiaryString.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = selectedType === "All Types" || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Reset page to 1 when search or type changes
  useEffect(() => { setCurrentPage(1); }, [search, selectedType, equipments.length]);

  // --- FRONTEND PAGINATION CALCULATIONS ---
  const totalEntries = filteredEquipments.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

  // --- ACTION HANDLERS ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ 
        title: 'Remove Equipment?', 
        text: "This will permanently delete the record from the database.",
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonText: 'Yes, remove it', 
        confirmButtonColor: '#ef4444' 
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/equipments/${id}`); // Keeping API path as /equipments unless backend changes
        dispatch(deleteEquipmentRecord(id)); 
        toast.success("Equipment removed.");
      } catch (error) {
        toast.error("Failed to delete equipment.");
      }
    }
  };

  const handleAddNew = async (data: any) => {
    try {
      const res = await axios.post('/equipments', data);
      dispatch(updateEquipmentRecord({ data: res.data, mode: 'add' })); 
      setIsNewModalOpen(false);
      toast.success(`${data.name} successfully registered!`);
    } catch (error) {
      toast.error("Failed to register equipment.");
      throw error;
    }
  };

  const handleEditUpdate = async (data: any) => {
    try {
      const res = await axios.put(`/equipments/${selectedItem.id}`, data);
      dispatch(updateEquipmentRecord({ data: res.data, mode: 'edit' }));
      setIsEditModalOpen(false);
      toast.success("Equipment details updated.");
    } catch (error) {
      toast.error("Update failed.");
      throw error;
    }
  };

  const getIconForType = (type: string) => {
    if (type === "Fishery Equipment") return <Anchor size={18} />;
    if (type === "Irrigation") return <Droplets size={18} />;
    if (type === "Hand Tools") return <PenTool size={18} />;
    return <Tractor size={18} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tractor className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Dispersal & Equipments</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">Equipment <span className="text-primary italic">Tracker</span></h2>
        </div>
        <button onClick={() => setIsNewModalOpen(true)} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95">
          <Plus size={18} /> Register Equipment
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InventoryMetricCard isLoading={isLoading} icon={<Settings />} title="Total Equipments" value={equipments.length.toString()} color="text-primary" bgColor="bg-primary/10" percentage={100} />
        <InventoryMetricCard isLoading={isLoading} icon={<CheckCircle2 />} title="Deployed" value={equipments.filter((e:any) => e.status === "Deployed").length.toString()} color="text-blue-500" bgColor="bg-blue-500/10" percentage={60} />
        <InventoryMetricCard isLoading={isLoading} icon={<Tractor />} title="In Depot" value={equipments.filter((e:any) => e.status === "In Depot").length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" percentage={30} />
        <InventoryMetricCard isLoading={isLoading} icon={<Wrench />} title="Maintenance" value={equipments.filter((e:any) => e.status === "Maintenance").length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" percentage={10} />
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search Equipment..." className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500"><X size={14} /></button>}
        </div>
        <div className="relative shrink-0 w-full md:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); }}>
            <SelectTrigger className="w-full h-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl z-50">
              <SelectItem value="All Types" className="text-xs font-bold uppercase py-3">All Types</SelectItem>
              {typeOptions.map(t => <SelectItem key={t} value={t} className="text-xs font-bold uppercase py-3">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <button onClick={() => fetchData(true)} disabled={isLoading} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30">
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
        </button>
      </div> 

      {/* 🔥 LABEL OUTSIDE THE TABLE 🔥 */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Database className="text-primary" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none">List of Equipments</h3>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Dispersed & Maintained Equipments</p>
        </div>
      </div>

      {/* TABLE SECTION CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        
        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-50">
            <div className="h-full bg-primary w-[40%] animate-progress-loop" />
          </div>
        )}
        
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">Equipment Details</th>
                <th className="px-6 py-5">Category & Program</th>
                <th className="px-6 py-5">Beneficiary / Custodian</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            
           <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                // SKELETON LOADER
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-6"><div className="flex gap-4"><div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-xl" /><div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded mt-3" /></div></td>
                    <td className="px-6 py-6"><div className="w-24 h-4 bg-gray-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-6"><div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-6"><div className="w-16 h-4 mx-auto bg-gray-200 dark:bg-slate-700 rounded" /></td>
                    <td className="px-6 py-6"><div className="w-16 h-6 ml-auto bg-gray-200 dark:bg-slate-700 rounded" /></td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((e: any) => (
                  <tr key={e.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-gray-100 dark:border-slate-700">
                          {getIconForType(e.type)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{e.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{e.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-middle">
                      <p className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase mb-1">{e.type}</p>
                      <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {e.program}
                      </span>
                    </td>
                    <td className="px-6 py-6 align-middle">
                      <div className="flex flex-col gap-2">
                        {/* BENEFICIARY BADGES */}
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(e.beneficiary) && e.beneficiary.length > 0 ? (
                            e.beneficiary.map((name: string, index: number) => (
                              <span 
                                key={index} 
                                className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase rounded-md shadow-sm flex items-center gap-1"
                              >
                                <Users size={10} />
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 text-[9px] font-bold uppercase rounded-md italic">
                              Unassigned
                            </span>
                          )}
                        </div>

                        {/* LOCATION / BARANGAY LOGIC */}
                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          <MapPin size={10} className="text-gray-400/60" /> 
                          <span className="truncate max-w-50">
                            {Array.isArray(e.location) 
                              ? (e.location.length > 0 ? e.location.join(", ") : 'No Location Set') 
                              : (e.location || 'No Location Set')
                            }
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-middle text-center">
                      <span className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border", 
                        e.status === 'Deployed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        e.status === 'In Depot' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                      )}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedItem(e); setIsViewModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><Eye size={16} /></button>
                        <button onClick={() => { setSelectedItem(e); setIsEditModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-gray-400 font-bold uppercase text-xs">
                    <Database size={40} className="mx-auto mb-3 opacity-20" />
                    No Equipments Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER / PAGINATION */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/50 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-700 dark:text-white font-black">{totalEntries > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-700 dark:text-white font-black">{Math.min(indexOfLastItem, totalEntries)}</span> of <span className="text-primary font-black">{totalEntries}</span> Entries
          </p>
          <div className="flex gap-1.5">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary disabled:opacity-30 transition-all">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)} className={cn("w-8 h-8 rounded-xl text-[11px] font-black border transition-all", currentPage === p ? "bg-primary border-primary text-white" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500")}>{p}</button>
            ))}
            <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary disabled:opacity-30 transition-all">Next</button>
          </div>
        </div>
      </div>

      <NewEquipmentModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSubmit={handleAddNew} 
        cooperativesRaw={coopsRaw}
        beneficiaryOptions={coopOptions} 
        barangayOptions={brgyNames} 
        typeOptions={typeOptions} 
        defaultTypes={DEFAULT_TYPES} 
        onAddType={v => setTypeOptions([...typeOptions, v])} 
        onDeleteType={v => setTypeOptions(typeOptions.filter((i: string) => i !== v))}
        programOptions={programOptions} 
        defaultPrograms={DEFAULT_PROGRAMS} 
        onAddProgram={v => setProgramOptions([...programOptions, v])} 
        onDeleteProgram={v => setProgramOptions(programOptions.filter((i: string) => i !== v))}
        conditionOptions={conditionOptions} 
        defaultConditions={DEFAULT_CONDITIONS}
        onAddCondition={v => setConditionOptions([...conditionOptions, v])}
        onDeleteCondition={v => setConditionOptions(conditionOptions.filter((i: string) => i !== v))}
        statusOptions={statusOptions} 
        defaultStatuses={DEFAULT_STATUSES}
        onAddStatus={v => setStatusOptions([...statusOptions, v])}
        onDeleteStatus={v => setStatusOptions(statusOptions.filter((i: string) => i !== v))}
        equipmentList={equipmentList}
        defaultEquipments={DEFAULT_EQUIPMENTS}
        onAddEquipment={v => setEquipmentList([...equipmentList, v])}
        onDeleteEquipment={v => setEquipmentList(equipmentList.filter((i: string) => i !== v))}
        onAddBeneficiary={() => {}} 
        onDeleteBeneficiary={() => {}} 
      />

      <EditEquipmentModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        selectedItem={selectedItem}
        onSubmit={handleEditUpdate} 
        cooperativesRaw={coopsRaw}
        beneficiaryOptions={coopOptions} 
        barangayOptions={brgyNames} 
        typeOptions={typeOptions} 
        defaultTypes={DEFAULT_TYPES} 
        onAddType={v => setTypeOptions([...typeOptions, v])} 
        onDeleteType={v => setTypeOptions(typeOptions.filter((i: string) => i !== v))}
        programOptions={programOptions} 
        defaultPrograms={DEFAULT_PROGRAMS} 
        onAddProgram={v => setProgramOptions([...programOptions, v])} 
        onDeleteProgram={v => setProgramOptions(programOptions.filter((i: string) => i !== v))}
        conditionOptions={conditionOptions} 
        defaultConditions={DEFAULT_CONDITIONS}
        onAddCondition={v => setConditionOptions([...conditionOptions, v])}
        onDeleteCondition={v => setConditionOptions(conditionOptions.filter((i: string) => i !== v))}
        statusOptions={statusOptions} 
        defaultStatuses={DEFAULT_STATUSES}
        onAddStatus={v => setStatusOptions([...statusOptions, v])}
        onDeleteStatus={v => setStatusOptions(statusOptions.filter((i: string) => i !== v))}
        equipmentList={equipmentList}
        defaultEquipments={DEFAULT_EQUIPMENTS}
        onAddEquipment={v => setEquipmentList([...equipmentList, v])}
        onDeleteEquipment={v => setEquipmentList(equipmentList.filter((i: string) => i !== v))}
        onAddBeneficiary={() => {}}
        onDeleteBeneficiary={() => {}}
      />

      <ViewEquipmentModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        selectedItem={selectedItem} 
      />

    </div>
  );
}