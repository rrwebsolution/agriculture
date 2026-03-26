import React, { useState, useEffect } from 'react';
// 🌟 IMPORT REDUX HOOKS AND ACTIONS
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';

import { 
  UserPlus, Search, Edit3, Trash2, Users, 
  Mail, MapPin, Shield, UserCheck, Filter, Eye, ShieldCheck, RefreshCw
} from 'lucide-react';

import UserDialog from './dialog/UserDialog';
import UserViewDialog from './dialog/UserViewDialog';
import axios from '../../../../plugin/axios'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch'; 
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { cn } from '../../../../lib/utils';
import { deleteUserRecord, setUserData, updateUserRecord } from '../../../../store/slices/userSlice';

interface User {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string } | null;
  cluster: { id: number; name: string } | null;
  status: 'active' | 'inactive';
  avatar?: string;
}

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();

  // 🌟 PULL DATA FROM REDUX
  const { records: users, roles, clusters, isLoaded } = useAppSelector((state: any) => state.user);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // MODALS
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userFormData, setUserFormData] = useState({
    name: '', email: '', role: '', cluster: '', status: 'active'
  });

  // --- 1. FETCH DATA LOGIC ---
  const fetchData = async (forceRefresh = false) => {
    // 🌟 SKIP FETCH IF DATA IS ALREADY IN REDUX AND NO FORCE REFRESH IS CALLED
    if (!forceRefresh && isLoaded) return;

    setIsLoading(true);
    try {
      const [usersRes, rolesRes, clustersRes] = await Promise.all([
        axios.get('users'), axios.get('roles'), axios.get('clusters')
      ]);
      
      // 🌟 SAVE TO REDUX
      dispatch(setUserData({
        records: usersRes.data.data || [],
        roles: rolesRes.data.data || [],
        clusters: clustersRes.data.data || []
      }));
    } catch (error) {
      toast.error("Database sync failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(false); 
  }, []);

  // --- 2. CRUD OPERATIONS ---
  const handleToggleStatus = async (user: User) => {
    const isActivating = user.status === 'inactive';
    const newStatus = isActivating ? 'active' : 'inactive';
    const actionText = isActivating ? 'activate' : 'inactivate';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionText} this user account?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isActivating ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText} it!`,
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`users-update/${user.id}`, {
          name: user.name,
          email: user.email,
          role: user.role?.id,
          cluster: user.cluster?.id,
          status: newStatus
        });

        // 🌟 UPDATE REDUX
        dispatch(updateUserRecord({ data: response.data.data, mode: 'edit' }));
        toast.success(`Account successfully ${actionText}d!`);
      } catch (error) {
        toast.error("Connection error. Status change failed.");
      }
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);
  
  // 🌟 I-format ang payload para sa backend
  const payload = {
    ...userFormData,
    cluster: userFormData.cluster === "" ? null : userFormData.cluster // Convert empty to null
  };

  try {
    if (selectedUser) {
      const response = await axios.put(`users-update/${selectedUser.id}`, payload);
      dispatch(updateUserRecord({ data: response.data.data, mode: 'edit' }));
      toast.success("User updated!");
    } else {
      const response = await axios.post('users-store', payload);
      dispatch(updateUserRecord({ data: response.data.data, mode: 'add' }));
      toast.success("User registered!");
    }
    closeUserModal();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Operation failed.");
  } finally {
    setIsSaving(false);
  }
};

  const handleDeleteUser = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Revoke this user's system access?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`users-delete/${id}`);
        dispatch(deleteUserRecord(id)); // 🌟 REMOVE FROM REDUX
        toast.success("Account deleted.");
      } catch (error) { 
        toast.error("Delete failed."); 
      }
    }
  };

  // --- 3. MODAL HANDLERS ---
  const openAddModal = () => {
    setSelectedUser(null);
    setUserFormData({ name: '', email: '', role: '', cluster: '', status: 'active' });
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name, email: user.email,
      role: user.role?.id.toString() || '',
      cluster: user.cluster?.id.toString() || '',
      status: user.status
    });
    setIsUserModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  // --- 4. FILTERING & PAGINATION ---
  const filteredUsers = (users || []).filter((user: User) => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) || user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === "All Roles" || user.role?.name === selectedRole;
    return matchesSearch && matchesRole;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, selectedRole]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">System Administration</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            User <span className="text-primary italic">Management</span>
          </h2>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer">
          <UserPlus size={18} /> Register User
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard isLoading={isLoading} icon={<Users />} title="Total Staff" value={users?.length?.toString() || "0"} color="text-primary" bgColor="bg-primary/10" />
          <MetricCard isLoading={isLoading} icon={<ShieldCheck />} title="Administrators" value={users?.filter((u: User) => u.role?.name?.includes('Admin')).length.toString() || "0"} color="text-blue-500" bgColor="bg-blue-500/10" />
          <MetricCard isLoading={isLoading} icon={<UserCheck />} title="Active Accounts" value={users?.filter((u: User) => u.status === 'active').length.toString() || "0"} color="text-emerald-500" bgColor="bg-emerald-500/10" />
      </div>

      {/* CONTROLS ROW */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search Name or Email..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="relative shrink-0 w-full md:w-55">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold cursor-pointer shadow-sm">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50">
                <SelectItem value="All Roles" className="text-xs font-bold uppercase py-3 cursor-pointer">All Roles</SelectItem>
                {(roles || []).map((role: any) => (<SelectItem key={role.id} value={role.name} className="text-xs font-bold uppercase py-3 cursor-pointer">{role.name}</SelectItem>))}
              </SelectContent>
            </Select>
        </div>

        {/* 🌟 REFRESH BUTTON */}
        <button 
          onClick={() => fetchData(true)} 
          disabled={isLoading}
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-30 shadow-sm"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin text-primary")} />
          <span className={cn(isLoading && "text-primary")}>{isLoading ? "Refreshing..." : "Refresh data"}</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        
        {/* TOP PROGRESS LOOP BAR */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
            <div className="h-full bg-primary w-[40%] animate-progress-loop" />
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Staff Information</th>
                <th className="px-8 py-5">Role & Assignment</th>
                <th className="px-8 py-5 text-center">Account Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              
              {/* SKELETON LOADER FOR TABLE */}
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
                        <div className="space-y-2 w-full mt-1">
                          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2 pt-2">
                        <div className="w-10 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                        <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-10" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                /* ACTUAL DATA RENDERING */
                currentItems.map((user: User) => (
                  <tr key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 shrink-0">
                            {user.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{user.name}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-1"><Mail size={12} /> {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top pt-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight bg-primary/5 px-2 py-0.5 rounded w-fit border border-primary/20">{user.role?.name || 'No Role'}</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase"><MapPin size={10} /> {user.cluster?.name || 'No Cluster'}</div>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-center align-top pt-7">
                      <div className="flex flex-col items-center gap-1.5">
                          <Switch 
                            checked={user.status === 'active'} 
                            onCheckedChange={() => handleToggleStatus(user)}
                            className={`
                              data-[state=checked]:bg-emerald-500! 
                              data-[state=unchecked]:bg-red-500!
                              border-transparent
                            `}
                          />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            user.status === 'active' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {user.status}
                          </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right align-top pt-6">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openViewModal(user)} className="p-2 text-gray-400 hover:text-primary transition-all cursor-pointer"><Eye size={16} /></button>
                          <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteUser(user.id)} title="Delete User" className="p-2 text-gray-400 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* NO DATA STATE */
                <tr><td colSpan={4} className="py-24 text-center text-gray-400 font-black uppercase text-xs tracking-widest italic">No Records Found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {currentItems.length} of {filteredUsers.length} Entries</p>
            <div className="flex gap-2">
                <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase disabled:opacity-30 cursor-pointer">Prev</button>
                <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase disabled:opacity-30 cursor-pointer">Next</button>
            </div>
        </div>
      </div>

      {/* MODALS */}
      <UserDialog isOpen={isUserModalOpen} onClose={closeUserModal} onSave={handleSaveUser} formData={userFormData} setFormData={setUserFormData} roles={roles} clusters={clusters} isSaving={isSaving} isEdit={!!selectedUser} />
      <UserViewDialog isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
    </div>
  );
};

// 🌟 UPDATED METRIC CARD WITH VERTICAL SIDE LOADER
const MetricCard = ({ icon, title, value, color, bgColor, isLoading }: any) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden h-28 group">
    
    {/* 🌟 VERTICAL SIDE LOADER (LEFT SIDE) */}
    {isLoading && (
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 overflow-hidden z-30">
        <div className="w-full bg-primary h-[40%] animate-progress-loop-y" />
      </div>
    )}

    <div className={cn(
      `p-4 rounded-2xl ${bgColor} ${color} transition-all duration-500 ml-1`, 
      isLoading && "animate-pulse"
    )}>
      {icon}
    </div>
    
    <div className="flex-1 w-full ml-1">
      {isLoading ? (
        <div className="space-y-2 animate-pulse w-full">
          <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
        </div>
      )}
    </div>
  </div>
);

export default UserManagement;