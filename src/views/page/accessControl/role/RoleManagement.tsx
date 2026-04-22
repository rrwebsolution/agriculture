import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import axios from '../../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import { 
  ShieldCheck, Plus, Search, Filter, Users, Lock, 
  ShieldAlert, Star, X, RefreshCw 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { cn } from '../../../../lib/utils';

// Redux Actions
import { deleteRoleRecord, setRoleData, updateRoleRecord } from '../../../../store/slices/roleSlice';

// Dialogs & Table
import RoleDialog, { type PermissionItem } from './dialog/RoleDialog';
import RoleViewDialog from './dialog/RoleViewDialog';
import RoleTable from './table/RoleTable';

// 🌟 EXPANDED SYSTEM MODULES & PERMISSIONS (Added "View" & "Manage" for everything)
const SYSTEM_MODULES: PermissionItem[] = [
  { id: '1', category: 'Dashboard', subPermissions: ['View Overview Analytics'] },
  { id: '2', category: 'Farmer Registry', subPermissions: ['View Registered Farmers', 'Manage Registered Farmers'] },
  { id: '3', category: 'Fisherfolk Registry', subPermissions: ['View Registered Fisherfolks', 'Manage Registered Fisherfolks'] },
  { id: '4', category: 'Cooperatives', subPermissions: ['View Cooperatives', 'Manage Cooperatives'] },
  { id: '5', category: 'Locations', subPermissions: ['View Barangay List', 'Manage Barangay List', 'View Clusters', 'Manage Clusters'] },
  { id: '6', category: 'Production', subPermissions: ['View Crops', 'Manage Crops', 'View Planting Logs', 'Manage Planting Logs', 'View Harvest Records', 'Manage Harvest Records'] },
  { id: '7', category: 'Fishery', subPermissions: ['View Fisheries', 'Manage Fisheries'] },
  { id: '8', category: 'Resources', subPermissions: ['View Inventory', 'Manage Inventory', 'View Equipments', 'Manage Equipments'] },
  { id: '9', category: 'Finance', subPermissions: ['View Expenses', 'Manage Expenses', 'View Financial Reports'] },
  { id: '10', category: 'Access Control', subPermissions: ['View Roles', 'Manage Roles', 'View Users', 'Manage Users'] },
  { id: '12', category: 'System Settings', subPermissions: ['View Global Settings', 'Configure Global Settings'] }
];

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
}

const roleCategories = ["All Roles", "Administrative", "Supervisory", "Field Ops", "Technical"];

export default function RoleContainer() {
  const dispatch = useAppDispatch();
  const { records: roles, isLoaded } = useAppSelector((state: any) => state.role);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Roles");
  const [isLoading, setIsLoading] = useState(false); 
  const [isSaving, setIsSaving] = useState(false); 

  // Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 1. FETCH DATA ---
  const fetchRoles = async (forceRefresh = false) => {
    if (!forceRefresh && isLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get('roles');
      dispatch(setRoleData({ records: response.data.data || [] }));
    } catch (error) {
      toast.error("Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoles(false); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, selectedCategory]);

  // --- 2. FILTERING LOGIC ---
  const filteredRoles = useMemo(() => {
    return (roles || []).filter((role: Role) => {
      const matchesSearch = role.name.toLowerCase().includes(search.toLowerCase());
      const name = role.name.toLowerCase();
      let category = "Technical";
      
      if (name.includes('admin') || name.includes('page')) category = "Administrative";
      else if (name.includes('supervisor') || name.includes('manager')) category = "Supervisory";
      else if (name.includes('field') || name.includes('officer')) category = "Field Ops";
      
      const matchesCategory = selectedCategory === "All Roles" || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [roles, search, selectedCategory]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const currentItems = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- 3. CRUD LOGIC ---
  const handleSaveRole = async (data: any) => {
    setIsSaving(true);
    try {
      if (selectedRole) {
        const response = await axios.put(`roles/${selectedRole.id}`, data, getAuthHeaders());
        dispatch(updateRoleRecord({ 
          data: { ...response.data.data, users_count: selectedRole.users_count }, 
          mode: 'edit' 
        }));
        toast.success("Role updated successfully!");
      } else {
        const response = await axios.post('roles', data, getAuthHeaders());
        dispatch(updateRoleRecord({ 
          data: { ...response.data.data, users_count: 0 }, 
          mode: 'add' 
        }));
        toast.success("New role created!");
      }
      setIsModalOpen(false);
    } catch (error) { 
      toast.error("Failed to save role."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDeleteRole = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Users assigned to this role will lose their permissions. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`roles/${id}`, getAuthHeaders());
        dispatch(deleteRoleRecord(id)); 
        toast.success("Role deleted.");
      } catch (error) { 
        toast.error("Failed to delete role."); 
      }
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } };
  };

  const openAddDialog = () => { setSelectedRole(null); setIsModalOpen(true); };
  const handleEditClick = (role: Role) => { setSelectedRole(role); setIsModalOpen(true); };
  const handleViewClick = (role: Role) => { setSelectedRole(role); setIsViewOpen(true); };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Access Control</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Role <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button onClick={openAddDialog} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
          <Plus size={18} /> Add New Role
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLoading={isLoading} icon={<Lock />} title="Total Roles" value={roles?.length?.toString() || "0"} color="text-primary" bgColor="bg-primary/10" />
        <MetricCard isLoading={isLoading} icon={<Users />} title="Active Users" value={(roles || []).reduce((acc: number, r: Role) => acc + (r.users_count || 0), 0).toString()} color="text-blue-500" bgColor="bg-blue-500/10" />
        <MetricCard isLoading={isLoading} icon={<Star />} title="Full Access Roles" value={(roles || []).filter((r: Role) => (r.permissions || []).length > 20).length.toString()} color="text-emerald-500" bgColor="bg-emerald-500/10" />
        <MetricCard isLoading={isLoading} icon={<ShieldAlert />} title="Restricted Roles" value={(roles || []).filter((r: Role) => (r.permissions || []).length <= 5).length.toString()} color="text-amber-500" bgColor="bg-amber-500/10" />
      </div>

      {/* CONTROLS (Search & Filter) */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search roles..." 
            className="w-full pl-12 pr-12 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-13 pl-12 pr-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold cursor-pointer shadow-sm">
              <SelectValue placeholder="Role Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-1 z-50">
              {roleCategories.map((c) => (<SelectItem key={c} value={c} className="text-xs font-bold uppercase py-3 cursor-pointer">{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <button onClick={() => fetchRoles(true)} disabled={isLoading} className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-13 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-all cursor-pointer disabled:opacity-30 shadow-sm">
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary")}>{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* TABLE */}
      <RoleTable 
        isLoading={isLoading}
        items={currentItems}
        allFilteredItems={filteredRoles}
        onView={handleViewClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteRole}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {/* DIALOGS */}
      <RoleDialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveRole} 
        modules={SYSTEM_MODULES} 
        isSaving={isSaving} 
        initialData={selectedRole} 
      />

      <RoleViewDialog 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        role={selectedRole} 
      />
    </div>
  );
}

// METRIC CARD WITH SKELETON & PROGRESS BAR
const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="relative p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm overflow-hidden h-28">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
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
    <div className="relative p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm h-28 overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30" />
      <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
      </div>
    </div>
  );
};
