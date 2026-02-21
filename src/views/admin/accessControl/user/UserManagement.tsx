import React, { useState } from 'react';
import { 
  UserPlus, Search, Edit3, Trash2, Users, 
  Mail, MapPin, Shield, UserCheck, 
  MoreVertical 
} from 'lucide-react';
import UserDialog from './dialog/UserDialog';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Administrator' | 'Encoder';
  sector: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar: string;
}

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Encoder',
    sector: 'Main Office'
  });

  const [users] = useState<User[]>([
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan.admin@gingoog.gov.ph",
      role: "Administrator",
      sector: "Main Office",
      status: "Active",
      lastLogin: "2 mins ago",
      avatar: "https://i.pravatar.cc/150?u=juan"
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.encoder@gingoog.gov.ph",
      role: "Encoder",
      sector: "Sector 4 (Anakan)",
      status: "Active",
      lastLogin: "1 hour ago",
      avatar: "https://i.pravatar.cc/150?u=maria"
    }
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.sector.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New User Registered:", formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({ name: '', email: '', role: 'Encoder', sector: 'Main Office' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Staff Directory</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            User <span className="text-primary italic">Management</span>
          </h2>
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-2">
            LGU Gingoog City • Registered Agricultural Personnel
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <UserPlus size={18} />
          Register New User
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Users size={24} /></div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Staff</p>
              <h4 className="text-xl font-black text-gray-800 dark:text-white leading-none mt-1">{users.length}</h4>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Shield size={24} /></div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admins</p>
              <h4 className="text-xl font-black text-gray-800 dark:text-white leading-none mt-1">1</h4>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><MapPin size={24} /></div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sectors</p>
              <h4 className="text-xl font-black text-gray-800 dark:text-white leading-none mt-1">12</h4>
           </div>
        </div>
      </div>

      {/* --- SEARCH BAR (Same size as Role Management) --- */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by name, email or sector..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- USER LIST TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-800px">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Staff Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role & Sector</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Activity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-6 text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shrink-0">
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{user.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md w-fit uppercase ${
                        user.role === 'Administrator' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                      }`}>
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
                       <span className="text-[10px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-tighter">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{user.lastLogin}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary rounded-xl transition-all shadow-sm"><Edit3 size={14} /></button>
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm"><Trash2 size={14} /></button>
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl transition-all shadow-sm"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DIALOG COMPONENT --- */}
      <UserDialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        formData={formData} 
        setFormData={setFormData}
      />
    </div>
  );
};

export default UserManagement;