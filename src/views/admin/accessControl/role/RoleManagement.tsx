import React, { useState } from 'react';
import { 
  ShieldCheck, Plus, Search, Edit3, Trash2, Users, 
  Settings2, CheckCircle, Key, Database, Sprout, Tractor,
  ClipboardCheck, HardHat, Eye // Added new icons
} from 'lucide-react';
import RoleDialog, { type PermissionItem } from './dialog/RoleDialog';

const RoleManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roles = [
    {
      id: 1,
      name: "Administrator",
      description: "Full system authority. Manages users, financial oversight, and critical system configurations for LGU Gingoog.",
      userCount: 2,
      permissions: ["Full Access", "User Management", "Finance Control", "System Settings"],
      color: "bg-primary",
      icon: <Key size={18} />
    },
    {
      id: 2,
      name: "Supervisor", // NEW ROLE
      description: "Oversees field operations and data accuracy. Can review logs, approve harvest reports, and manage officer assignments.",
      userCount: 3,
      permissions: ["Review Logs", "Approve Harvest", "Crops View", "Staff Oversight"],
      color: "bg-purple-600",
      icon: <ClipboardCheck size={18} />
    },
    {
      id: 3,
      name: "Field Officer", // NEW ROLE
      description: "On-the-ground management. Records real-time field data, manages planting schedules, and monitors crop health.",
      userCount: 12,
      permissions: ["Planting Logs", "Harvest Entry", "Expenses Tracker", "Field Updates"],
      color: "bg-orange-500",
      icon: <HardHat size={18} />
    },
    {
      id: 4,
      name: "Encoder",
      description: "Data entry specialist. Responsible for updating crop cycles, planting schedules, and harvest logs accurately.",
      userCount: 5,
      permissions: ["Crops (View/Edit)", "Planting Logs", "Harvest Entry"],
      color: "bg-blue-600",
      icon: <Database size={18} />
    },
    {
      id: 5,
      name: "Viewer", // NEW ROLE
      description: "Read-only access for stakeholders. Monitor yields, view financial summaries, and track progress without editing.",
      userCount: 8,
      permissions: ["Analytics View", "Reports View", "System Audit"],
      color: "bg-slate-500",
      icon: <Eye size={18} />
    }
  ];

  const modules: PermissionItem[] = [
    { id: "DASH_01", name: "Dashboard Access", description: "View analytics and daily summaries." },
    { id: "CROP_01", name: "Crops Management", description: "Manage crop varieties and cycles." },
    { id: "PLAN_01", name: "Planting Logs", description: "Record daily planting and field updates." },
    { id: "HARV_01", name: "Harvest Records", description: "Input yield and quality control data." },
    { id: "EXPN_01", name: "Expenses Tracker", description: "Log operational and material costs." },
    { id: "FINA_01", name: "Financial Reports", description: "Generate monthly statements." },
    { id: "USER_01", name: "User Management", description: "Administer staff accounts and roles." },
    { id: "SETT_01", name: "System Settings", description: "Configure global portal preferences." }
  ];

  const handleSaveRole = (data: any) => {
    console.log("New Role Data:", data);
    setIsModalOpen(false);
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PAGE HEADER --- */}
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <Plus size={18} /> Add New Role
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search roles..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* --- ROLES LIST TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-800px">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Role Definition</th>
                <th className="px-8 py-5 text-center">Active Users</th>
                <th className="px-8 py-5">Permission Set</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-7">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${role.color} text-white shadow-md shrink-0`}>
                        {role.icon}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">{role.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium leading-relaxed max-w-sm">{role.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <Users size={12} className="text-gray-500 dark:text-slate-400" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase">{role.userCount} Assigned</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {role.permissions.map((p, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-[9px] font-black uppercase rounded border border-gray-200 dark:border-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary rounded-xl transition-all shadow-sm">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 className="text-primary" size={20} />
            <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Active System Modules</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {modules.slice(0, 6).map((mod) => (
              <div key={mod.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                <CheckCircle size={16} className="text-primary" />
                <span className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase tracking-tighter">{mod.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group min-h-250px">
            <Sprout className="absolute -bottom-6 -right-6 text-white/10 rotate-12 transition-transform group-hover:scale-110 duration-500" size={180} />
            <div className="relative z-10">
                <p className="text-lg font-black uppercase tracking-tighter leading-tight italic">Security <br />Guidelines</p>
                <div className="h-1 w-10 bg-white/30 my-4" />
                <p className="text-xs font-medium text-white/80 leading-relaxed">
                    Permissions are audited monthly. Encoders and Field Officers are restricted from deleting historical data. Only Admins can approve financial overrides.
                </p>
            </div>
            <div className="mt-8 relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-widest">
                <div>
                  <p className="opacity-60">Gingoog secured</p>
                  <p className="text-green-300">RR Web Solution</p>
                </div>
                <Tractor size={24} className="text-white/20 animate-bounce" />
            </div>
        </div>
      </div>

      <RoleDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRole} modules={modules} />
    </div>
  );
};

export default RoleManagement;