import React, { useState, useEffect } from 'react';
// 🌟 IMPORT REDUX HOOKS AND ACTIONS
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  deleteClusterRecord, 
  setClusterData, 
  updateClusterRecord 
} from '../../../store/slices/clusterSlice';

import { 
  MapPin, Filter, Search, Plus, LayoutGrid, ShieldAlert, 
  UserCheck, RefreshCw, Eye, Edit3, Trash2, Users, 
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../lib/utils';

// Modals
import ClusterDialog from './dialog/ClusterDialog';
import ClusterViewDialog from './dialog/ClusterViewDialog';
import { getPageAccess } from '../../../lib/permissions';
import { useLocation } from 'react-router-dom';

export interface Cluster {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  staffCount?: number;
}

const clusterStatusOptions: string[] = ['All Status', 'Active', 'Inactive'];

const ClustersContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { canManage } = getPageAccess(location.pathname);

  // 🌟 FETCH DATA & LOAD STATE FROM REDUX
  const { records: clusters = [], isLoaded } = useAppSelector((state: any) => state.cluster || {});

  const [search, setSearch] = useState('');
  const [selectedClusterStatus, setSelectedClusterStatus] = useState('All Status');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // MODAL STATES
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClusterForEdit, setSelectedClusterForEdit] = useState<Cluster | null>(null);
  const [selectedClusterForView, setSelectedClusterForView] = useState<Cluster | null>(null);

  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' as 'Active' | 'Inactive' });

  // --- 1. FETCH DATA LOGIC ---
  const fetchClusters = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('clusters');
      dispatch(setClusterData({ records: response.data.data || [] }));
    } catch (error) {
      toast.error('Failed to load clusters.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters(false);
  }, [isLoaded, dispatch]);

  // --- 2. CRUD OPERATIONS ---
  const handleSaveCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (selectedClusterForEdit) {
        const response = await axios.put(`clusters/${selectedClusterForEdit.id}`, formData);
        dispatch(updateClusterRecord({ 
          data: { ...selectedClusterForEdit, ...response.data.data }, 
          mode: 'edit' 
        }));
        toast.success('Cluster updated!');
      } else {
        const response = await axios.post('clusters', formData);
        dispatch(updateClusterRecord({ 
          data: { ...response.data.data, staffCount: 0 }, 
          mode: 'add' 
        }));
        toast.success('New cluster added!');
      }
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (cluster: Cluster) => {
    const newStatus = cluster.status === 'Active' ? 'Inactive' : 'Active';
    const result = await Swal.fire({
      title: 'Update Status?',
      text: `Mark this cluster as ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      confirmButtonColor: '#10b981'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`clusters/${cluster.id}`, { status: newStatus });
        dispatch(updateClusterRecord({ 
          data: { ...cluster, ...response.data.data, status: newStatus }, 
          mode: 'edit' 
        }));
        toast.success(`Status updated.`);
      } catch (error) {
        toast.error("Update failed.");
      }
    }
  };

  const handleDeleteCluster = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Users assigned to this cluster might be affected!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`clusters/${id}`);
        dispatch(deleteClusterRecord(id)); 
        toast.success(response.data.message);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete cluster.');
      }
    }
  };

  // --- MODAL HANDLERS ---
  const openEditModal = (cluster: Cluster) => {
    setSelectedClusterForEdit(cluster);
    setFormData({ name: cluster.name, description: cluster.description, status: cluster.status });
    setIsClusterModalOpen(true);
  };

  const openViewModal = (cluster: Cluster) => {
    setSelectedClusterForView(cluster);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsClusterModalOpen(false);
    setSelectedClusterForEdit(null);
    setFormData({ name: '', description: '', status: 'Active' });
  };

  // --- 3. FILTERING & PAGINATION ---
  const filteredClusters = clusters.filter((cluster: Cluster) => {
    const matchesSearch = cluster.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedClusterStatus === 'All Status' || cluster.status === selectedClusterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClusters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClusters.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, selectedClusterStatus]);

  // METRICS
  const activeCount = clusters.filter((c: Cluster) => c.status === 'Active').length;
  const totalStaff = clusters.reduce((acc: number, c: Cluster) => acc + (c.staffCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Geographical Data</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Clusters <span className="text-primary italic">Management</span>
          </h2>
        </div>
        {canManage && <button onClick={() => setIsClusterModalOpen(true)} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
          <Plus size={18} /> Add Cluster
        </button>}
      </div>

      {/* 🌟 METRICS CARDS WITH LOADING SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLoading={isLoading} icon={<LayoutGrid />} title="Total Clusters" value={clusters.length.toString()} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<UserCheck />} title="Active Zones" value={activeCount.toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard isLoading={isLoading} icon={<ShieldAlert />} title="Inactive" value={(clusters.length - activeCount).toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
        <MetricCard isLoading={isLoading} icon={<Users />} title="Total Staff" value={totalStaff.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* CONTROLS ROW */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          
          <input 
            type="text" 
            placeholder="Search Cluster Name..." 
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
          <Select value={selectedClusterStatus} onValueChange={setSelectedClusterStatus}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold cursor-pointer"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {clusterStatusOptions.map((opt) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* 🌟 REFRESH BUTTON NOW FORCES A FETCH */}
        <button 
          onClick={() => fetchClusters(true)} 
          disabled={isLoading}
          className="shrink-0 flex items-center disabled:cursor-not-allowed justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary cursor-not-allowed")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        
        {/* TOP PROGRESS LOOP BAR */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
            <div className="h-full bg-primary w-[40%] animate-progress-loop" />
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Cluster Info</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              
              {/* 🌟 TABLE SKELETON LOADER */}
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-slate-700 shrink-0" />
                        <div className="space-y-2 w-full mt-1">
                          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-2/3" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                        <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-10" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                /* ACTUAL DATA RENDERING */
                currentItems.map((cluster: Cluster) => (
                <tr key={cluster.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase shadow-sm">
                        {cluster.name?.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 tracking-tight leading-tight group-hover:text-primary transition-colors">{cluster.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                          <Users size={12} /> {cluster.staffCount || 0} Staff Assigned
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-2 max-w-sm">
                      {cluster.description || <span className="italic text-gray-300">No description provided</span>}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {canManage ? (
                          <Switch checked={cluster.status === 'Active'} onCheckedChange={() => handleToggleStatus(cluster)} className="data-[state=checked]:bg-primary" />
                        ) : (
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                            cluster.status === 'Active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-rose-500 border-rose-200 bg-rose-50'
                          )}>{cluster.status}</span>
                        )}
                        {canManage && <span className={`text-[9px] font-black uppercase ${cluster.status === 'Active' ? 'text-emerald-600' : 'text-rose-500'}`}>{cluster.status}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openViewModal(cluster)} className="p-2.5 bg-transparent text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"><Eye size={16} /></button>
                      {canManage && <button onClick={() => openEditModal(cluster)} className="p-2.5 bg-transparent text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"><Edit3 size={16} /></button>}
                      {canManage && <button onClick={() => handleDeleteCluster(cluster.id)} className="p-2.5 bg-transparent text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))) : (
                /* NO DATA STATE */
                <tr><td colSpan={4} className="py-20 text-center text-gray-400 uppercase text-xs font-bold italic tracking-widest">No results found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {currentItems.length} of {filteredClusters.length} Entries</p>
            <div className="flex gap-2">
                <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase disabled:opacity-30 cursor-pointer">Prev</button>
                <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase disabled:opacity-30 cursor-pointer">Next</button>
            </div>
        </div>
      </div>

      <ClusterDialog isOpen={isClusterModalOpen} onClose={closeModal} onSave={handleSaveCluster} formData={formData} setFormData={setFormData} isSaving={isSaving} isEdit={!!selectedClusterForEdit} />
      <ClusterViewDialog isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} cluster={selectedClusterForView} />
    </div>
  );
};


const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => (
  <div className="p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden h-28 group">
    
    {/* 🌟 VERTICAL SIDE LOADER (LEFT SIDE) */}
    {isLoading && (
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
        <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
      </div>
    )}
    {!isLoading && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30" />}

    {isLoading ? (
      <>
        {/* Skeleton state */}
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 w-full ml-2">
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
        </div>
      </>
    ) : (
      <>
        {/* Data state */}
        <div className={cn(`p-4 rounded-2xl ${bgColor} ${color} transition-all duration-300 ml-1`)}>
          {icon}
        </div>
        <div className="flex-1 w-full animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
        </div>
      </>
    )}
  </div>
);

export default ClustersContainer;
