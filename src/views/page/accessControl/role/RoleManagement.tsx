import React, { useState, useEffect } from 'react';
// 🌟 IMPORT REDUX HOOKS AND ACTIONS
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';

import { 
  ShieldCheck, Plus, Search, Edit3, Trash2, Key, Database,
  ClipboardCheck, HardHat, Star, Filter, Users, Lock, 
  ShieldAlert, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

import RoleDialog, { type PermissionItem } from './dialog/RoleDialog';
import axios from '../../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { cn } from '../../../../lib/utils';
import { deleteRoleRecord, setRoleData, updateRoleRecord } from '../../../../store/slices/roleSlice';

// --- PERMISSIONS DATA ---
const modules: PermissionItem[] = [
  { id: "M_DASH", category: "Dashboard", subPermissions: ["View Overview Analytics", "Export Daily Statistics"] },
  { id: "M_FARM", category: "Farmer Registry", subPermissions: ["Manage Registered Farmers", "Manage Cooperatives", "Export Registry List"] },
  { id: "M_LOCA", category: "Locations", subPermissions: ["Manage Barangay List", "Manage Clusters"] },
  { id: "M_PROD", category: "Production", subPermissions: ["Manage Crops", "Manage Planting Logs", "Manage Harvest Records"] },
  { id: "M_LIVE", category: "Livestock & Fish", subPermissions: ["Manage Fisheries", "Manage Livestock", "Manage Poultry"] },
  { id: "M_RESO", category: "Resources", subPermissions: ["Manage Inventory", "Manage Equipments", "Manage Land Mapping"] },
  { id: "M_FINA", category: "Finance", subPermissions: ["Manage Expenses", "View Financial Reports", "Delete Records"] },
  { id: "M_ACCE", category: "Access Control", subPermissions: ["Manage Roles", "Manage Users", "Assign Permissions"] },
  { id: "M_AUDI", category: "Audit Logs", subPermissions: ["View System Audit Logs", "Export Audit PDF"] },
  { id: "M_SETT", category: "System Settings", subPermissions: ["Configure Global Settings", "Manage System Backups"] }
];

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
}

const RoleManagement: React.FC = () => {
  const dispatch = useAppDispatch();

  // 🌟 PULL DATA FROM REDUX
  const { records: roles, isLoaded } = useAppSelector((state: any) => state.role);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Roles");
  const [isLoading, setIsLoading] = useState(false); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<Role | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<number[]>([]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const roleCategories = ["All Roles", "Administrative", "Supervisory", "Field Ops", "Technical"];

  // --- 1. FETCH DATA LOGIC ---
  const fetchRoles = async (forceRefresh = false) => {
    // 🌟 SKIP FETCH IF DATA IS ALREADY IN REDUX AND NO FORCE REFRESH IS CALLED
    if (!forceRefresh && isLoaded) return;

    setIsLoading(true);
    try {
      const response = await axios.get('roles');
      // 🌟 SAVE TO REDUX
      dispatch(setRoleData({ records: response.data.data || [] }));
    } catch (error) {
      toast.error("Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchRoles(false); 
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory]);

  const toggleExpand = (id: number) => {
    setExpandedRoles(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  const handleEditClick = (role: Role) => {
    setSelectedRoleForEdit(role);
    setIsModalOpen(true);
  };

  // --- 2. CRUD OPERATIONS ---
  const handleDeleteRole = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`roles/${id}`);
        dispatch(deleteRoleRecord(id)); // 🌟 REMOVE FROM REDUX
        toast.success("Deleted!");
      } catch (error) { 
        toast.error("Delete failed."); 
      }
    }
  };

  const handleSaveRole = async (data: any) => {
    setIsSaving(true);
    try {
      if (selectedRoleForEdit) {
        const response = await axios.put(`roles/${selectedRoleForEdit.id}`, data);
        // Dispatch update retaining users_count
        dispatch(updateRoleRecord({ 
          data: { ...response.data.data, users_count: selectedRoleForEdit.users_count }, 
          mode: 'edit' 
        }));
        toast.success("Updated!");
      } else {
        const response = await axios.post('roles', data);
        // Dispatch add with default users_count 0
        dispatch(updateRoleRecord({ 
          data: { ...response.data.data, users_count: 0 }, 
          mode: 'add' 
        }));
        toast.success("Added!");
      }
      setIsModalOpen(false);
    } catch (error) { 
      toast.error("Save failed."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  // --- 3. FILTERING & PAGINATION ---
  const allFilteredRoles = (roles || []).filter((role: Role) => {
    const matchesSearch = role.name.toLowerCase().includes(search.toLowerCase());
    const name = role.name.toLowerCase();
    let category = "Technical";
    
    if (name.includes('admin') || name.includes('page')) category = "Administrative";
    else if (name.includes('supervisor') || name.includes('manager')) category = "Supervisory";
    else if (name.includes('field') || name.includes('officer')) category = "Field Ops";
    
    return matchesSearch && (selectedCategory === "All Roles" || category === selectedCategory);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = allFilteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allFilteredRoles.length / itemsPerPage);

  const getRoleIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('page') || n.includes('admin')) return <Key size={14} />;
    if (n.includes('supervisor') || n.includes('manager')) return <ClipboardCheck size={14} />;
    if (n.includes('officer') || n.includes('field')) return <HardHat size={14} />;
    if (n.includes('encoder')) return <Database size={14} />;
    return <ShieldCheck size={14} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Access Control</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Role <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button onClick={() => { setSelectedRoleForEdit(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
          <Plus size={18} /> Add New Role
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLoading={isLoading} icon={<Lock />} title="Total Roles" value={roles?.length?.toString() || "0"} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<Users />} title="Active Users" value={(roles || []).reduce((acc: number, r: Role) => acc + (r.users_count || 0), 0).toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard isLoading={isLoading} icon={<Star />} title="Full Access" value={(roles || []).filter((r: Role) => (r.permissions || []).length > 15).length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard isLoading={isLoading} icon={<ShieldAlert />} title="Restricted" value={(roles || []).filter((r: Role) => (r.permissions || []).length < 5).length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search roles..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="relative shrink-0 w-full md:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all shadow-sm cursor-pointer">
              <SelectValue placeholder="Role Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-1 z-50">
              {roleCategories.map((c) => (<SelectItem key={c} value={c} className="text-xs font-bold uppercase py-3 cursor-pointer">{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* 🌟 REFRESH BUTTON */}
        <button 
          onClick={() => fetchRoles(true)} 
          disabled={isLoading}
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 shadow-sm"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary")}>{isLoading ? "Refreshing..." : "Refresh List"}</span>
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        
        {/* TOP PROGRESS LOOP BAR */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
            <div className="h-full bg-primary w-[40%] animate-progress-loop" />
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-200">
              <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Role Definition</th>
                  <th className="px-8 py-5">Permission Set</th>
                  <th className="px-8 py-5 text-center">Assigned Users</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                
                {/* 🌟 SKELETON LOADER FOR TABLE */}
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                      <td className="px-8 py-6">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0" />
                          <div className="space-y-2 w-full mt-1">
                            <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
                            <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-full" />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
                          <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
                          <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <div className="w-20 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                          <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : currentRoles.length > 0 ? (
                  /* ACTUAL DATA RENDERING */
                  currentRoles.map((role:any) => {
                    const isExpanded = expandedRoles.includes(role.id);
                    return (
                      <tr key={role.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                        <td className="px-8 py-6 align-top">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                              {getRoleIcon(role.name)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{role.name}</p>
                              <p className="text-[10px] font-medium text-gray-400 leading-tight mt-1 max-w-xs">{role.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 align-top pt-8">
                          <div className="flex flex-wrap gap-1.5 max-w-md transition-all duration-300">
                            {(isExpanded ? (role.permissions || []) : (role.permissions || []).slice(0, 3)).map((p:any, i:any) => (
                              <span key={i} className="px-2 py-1 bg-gray-50 dark:bg-slate-800 text-gray-500 text-[9px] font-black uppercase rounded border border-gray-100 dark:border-slate-700">{p}</span>
                            ))}
                            {(role.permissions || []).length > 3 && (
                              <button onClick={() => toggleExpand(role.id)} className={`px-2 py-1 text-[9px] font-black uppercase rounded border transition-all flex items-center gap-1 cursor-pointer ${isExpanded ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white'}`}>
                                {isExpanded ? 'Show Less' : `+${role.permissions.length - 3} More`}
                                {isExpanded ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center align-top pt-8">
                          <span className="text-[10px] font-black text-gray-700 dark:text-slate-300 uppercase bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">{role.users_count || 0} Members</span>
                        </td>
                        <td className="px-8 py-6 text-right align-top pt-6">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditClick(role)} className="p-2 text-gray-400 hover:text-primary transition-all cursor-pointer"><Edit3 size={16} /></button>
                            <button onClick={() => handleDeleteRole(role.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* NO DATA STATE */
                  <tr><td colSpan={4} className="py-24 text-center text-gray-400 font-black uppercase text-xs tracking-widest italic">No Records Found</td></tr>
                )}
              </tbody>
            </table>
        </div>
        
        {/* NUMBERED PAGINATION FOOTER */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Showing {currentRoles.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, allFilteredRoles.length)} of {allFilteredRoles.length} Roles
            </p>
            <div className="flex items-center gap-2">
                <button 
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    Prev
                </button>

                {/* --- PAGE NUMBERS --- */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    disabled={isLoading}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      currentPage === pageNum
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary disabled:opacity-30'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                    disabled={currentPage >= totalPages || totalPages === 0 || isLoading}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
      </div>

      <RoleDialog isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedRoleForEdit(null); }} onSave={handleSaveRole} modules={modules} isSaving={isSaving} initialData={selectedRoleForEdit} />
    </div>
  );
}

// 🌟 METRIC CARD COMPONENT WITH SKELETON LOADER
const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden group">
    
    {/* PROGRESS BAR LOADER PARA SA CARD */}
    {isLoading && (
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
        <div className="h-full bg-primary w-[40%] animate-progress-loop" />
      </div>
    )}

    <div className={cn(`p-4 rounded-2xl ${bgColor} ${color} transition-all duration-500`, isLoading && "animate-pulse")}>
      {icon}
    </div>
    
    <div className="flex-1 w-full">
      {isLoading ? (
        <div className="space-y-2 animate-pulse w-full">
          <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
        </div>
      )}
    </div>
  </div>
);

export default RoleManagement;