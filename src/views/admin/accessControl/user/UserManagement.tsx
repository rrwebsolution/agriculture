import React, { useState } from 'react';
import { 
  UserPlus, Search, Edit3, Trash2, Users, 
  Mail, MapPin, Shield, UserCheck, 
  MoreVertical, LayoutGrid, Plus,
} from 'lucide-react';

// Import Components
import UserDialog from './dialog/UserDialog';
import SectorDialog from './dialog/SectorDialog';
import SectorTable from './table/SectorTable';

// Import Types (Using 'import type' to fix verbatimModuleSyntax errors)
import type { UserRole } from './dialog/UserDialog';
import type { Sector } from './table/SectorTable';

// --- LOCAL TYPES ---
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  sector: string;
  status: 'Active' | 'Inactive';
  avatar: string;
}

const UserManagement: React.FC = () => {
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState<'users' | 'sectors'>('users');
  const [search, setSearch] = useState("");
  
  // Modal Visibility States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);

  // --- FORM STATES ---
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'Encoder' as UserRole, 
    sector: 'Main Office'
  });

  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // --- MOCK DATA: USERS ---
  const [users] = useState<User[]>([
    { id: 1, name: "Juan Dela Cruz", email: "juan.admin@gingoog.gov.ph", role: "Administrator", sector: "Main Office", status: "Active", avatar: "https://i.pravatar.cc/150?u=juan" },
    { id: 2, name: "Maria Santos", email: "maria.encoder@gingoog.gov.ph", role: "Encoder", sector: "Sector 4 (Anakan)", status: "Active", avatar: "https://i.pravatar.cc/150?u=maria" },
    { id: 3, name: "Pedro Penduko", email: "pedro.supervisor@gingoog.gov.ph", role: "Supervisor", sector: "Sector 1 (Poblacion)", status: "Active", avatar: "https://i.pravatar.cc/150?u=pedro" },
    { id: 4, name: "Ana Dimagiba", email: "ana.field@gingoog.gov.ph", role: "Field Officer", sector: "Sector 3 (Lunao)", status: "Inactive", avatar: "https://i.pravatar.cc/150?u=ana" },
    { id: 5, name: "Jose Rizal", email: "jose.viewer@gingoog.gov.ph", role: "Viewer", sector: "City Hall", status: "Active", avatar: "https://i.pravatar.cc/150?u=jose" }
  ]);

  // --- MOCK DATA: SECTORS ---
  const [sectors] = useState<Sector[]>([
    { id: 1, name: "Main Office", description: "Central Command & Admin", staffCount: 15, status: "Active" },
    { id: 2, name: "Sector 1 (Poblacion)", description: "Urban Agriculture Zone", staffCount: 8, status: "Active" },
    { id: 3, name: "Sector 2 (Odiongan)", description: "Coastal & Fisheries", staffCount: 12, status: "Active" },
    { id: 4, name: "Sector 3 (Lunao)", description: "Rice & Corn Production", staffCount: 20, status: "Active" },
    { id: 5, name: "Sector 4 (Anakan)", description: "Highland Crops & Forestry", staffCount: 5, status: "Active" },
  ]);

  // --- FILTERING LOGIC ---
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.sector.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSectors = sectors.filter(sector => 
    sector.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- SAVE HANDLERS ---
  const handleUserSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving User...", userFormData);
    setIsUserModalOpen(false);
    setUserFormData({ name: '', email: '', role: 'Encoder', sector: 'Main Office' });
  };

  const handleSectorSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving Sector...", sectorFormData);
    setIsSectorModalOpen(false);
    setSectorFormData({ name: '', description: '', status: 'Active' });
  };

  // --- HELPER: ROLE BADGE STYLING ---
  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Administrator': return 'bg-primary/10 text-primary';
      case 'Supervisor': return 'bg-purple-500/10 text-purple-500';
      case 'Encoder': return 'bg-blue-500/10 text-blue-500';
      case 'Field Officer': return 'bg-amber-500/10 text-amber-500';
      case 'Viewer': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">System Administration</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            {activeTab === 'users' ? 'User' : 'Sector'} <span className="text-primary italic">Management</span>
          </h2>
          
          {/* TAB SWITCHER */}
          <div className="flex items-center gap-2 mt-4 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-gray-200 dark:border-slate-700">
            <button 
              onClick={() => { setActiveTab('users'); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'users' 
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <Users size={14} /> Staff List
            </button>
            <button 
              onClick={() => { setActiveTab('sectors'); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'sectors' 
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid size={14} /> Sectors
            </button>
          </div>
        </div>
        
        {/* ACTION BUTTON */}
        <button 
          onClick={() => activeTab === 'users' ? setIsUserModalOpen(true) : setIsSectorModalOpen(true)}
          className="cursor-pointer flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          {activeTab === 'users' ? <UserPlus size={18} /> : <Plus size={18} />}
          {activeTab === 'users' ? 'Register New User' : 'Add New Sector'}
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {activeTab === 'users' ? (
          <>
            <StatsCard icon={<Users size={24} />} label="Total Registered Staff" value={users.length} color="primary" />
            <StatsCard icon={<Shield size={24} />} label="Total Administrators" value={users.filter(u => u.role === 'Administrator').length} color="blue" />
            <StatsCard icon={<UserCheck size={24} />} label="Active Status" value={users.filter(u => u.status === 'Active').length} color="emerald" />
          </>
        ) : (
          <>
            <StatsCard icon={<LayoutGrid size={24} />} label="Total Registered Sectors" value={sectors.length} color="primary" />
            <StatsCard icon={<MapPin size={24} />} label="Operational Zones" value={sectors.filter(s => s.status === 'Active').length} color="emerald" />
          </>
        )}
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder={activeTab === 'users' ? "Search by name, email, or role..." : "Search by sector or officer..."}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-400px">
        <div className="overflow-x-auto scrollbar-hide">
          
          {activeTab === 'users' ? (
            /* --- USERS TABLE --- */
            <table className="w-full text-left border-collapse min-w-800px animate-in fade-in duration-500">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Staff Member</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role & Sector</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shrink-0">
                          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{user.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                            <Mail size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md w-fit uppercase ${getRoleBadgeStyle(user.role)}`}>
                          {user.role}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                          <MapPin size={10} /> {user.sector}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                         <span className={`text-[10px] font-black uppercase tracking-tighter ${user.status === 'Active' ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400'}`}>
                           {user.status}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <ActionButtons />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* --- EXTERNAL SECTORS TABLE COMPONENT --- */
            <SectorTable sectors={filteredSectors} />
          )}

          {/* Empty State */}
          {(activeTab === 'users' ? filteredUsers : filteredSectors).length === 0 && (
            <div className="text-center py-20 animate-in fade-in duration-500">
               <Search className="mx-auto text-gray-200 dark:text-slate-800 mb-4" size={48} />
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No results found for "{search}"</p>
            </div>
          )}
          
        </div>
      </div>

      {/* --- MODAL DIALOGS --- */}
      
      {/* 1. User Registration Dialog */}
      <UserDialog 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSave={handleUserSave} 
        formData={userFormData} 
        setFormData={setUserFormData}
      />

      {/* 2. Sector Addition Dialog */}
      <SectorDialog 
        isOpen={isSectorModalOpen} 
        onClose={() => setIsSectorModalOpen(false)} 
        onSave={handleSectorSave} 
        formData={sectorFormData} 
        setFormData={setSectorFormData}
      />

    </div>
  );
};

// --- HELPER SUB-COMPONENTS ---

const StatsCard = ({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 animate-in zoom-in-95 duration-500">
      <div className={`p-3 rounded-2xl ${colorClasses[color] || colorClasses.primary}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <h4 className="text-xl font-black text-gray-800 dark:text-white leading-none mt-1">{value}</h4>
      </div>
    </div>
  );
};

const ActionButtons = () => (
  <div className="flex items-center justify-end gap-1">
    <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary rounded-xl transition-all shadow-sm active:scale-90"><Edit3 size={14} /></button>
    <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm active:scale-90"><Trash2 size={14} /></button>
    <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><MoreVertical size={14} /></button>
  </div>
);

export default UserManagement;