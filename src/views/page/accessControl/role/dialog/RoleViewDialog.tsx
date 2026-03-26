import React, { useMemo } from 'react';
import { 
  X, Key, Settings2, CheckCircle2, 
  LayoutDashboard, Contact, Sprout, Beef, Box, Wallet, ShieldCheck, ClipboardList, Settings,
  MapPin, LayoutGrid, FileText
} from 'lucide-react';

interface RoleViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: {
    id?: number | string;
    name: string;
    description: string;
    permissions: string[];
  } | null;
}

// Icon mapper to match the RoleDialog and Sidebar
const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('dashboard')) return <LayoutDashboard size={14} />;
  if (c.includes('farmer registry')) return <Contact size={14} />;
  if (c.includes('locations')) return <MapPin size={14} />; 
  if (c.includes('production')) return <Sprout size={14} />;
  if (c.includes('livestock')) return <Beef size={14} />;
  if (c.includes('resources')) return <Box size={14} />;
  if (c.includes('finance')) return <Wallet size={14} />;
  if (c.includes('access control')) return <ShieldCheck size={14} />;
  if (c.includes('audit')) return <ClipboardList size={14} />;
  return <Settings size={14} />;
};

const RoleViewDialog: React.FC<RoleViewDialogProps> = ({ isOpen, onClose, role }) => {
  
  // Group permissions by category (e.g. "Locations: Manage Clusters" -> Category: "Locations", Sub: "Manage Clusters")
  const groupedPermissions = useMemo(() => {
    if (!role?.permissions) return {};
    return role.permissions.reduce((acc: Record<string, string[]>, perm: string) => {
      const parts = perm.split(': ');
      const category = parts[0] || 'Uncategorized';
      const sub = parts[1] || perm;
      
      if (!acc[category]) acc[category] = [];
      acc[category].push(sub);
      return acc;
    }, {});
  }, [role]);

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      {/* ANIMATED BACKDROP */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* ANIMATED DIALOG BOX */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                Role Details & Permissions
              </h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">LGU Gingoog Access Control</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
            
            {/* Section 1: BASIC INFO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><LayoutGrid size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">1. Basic Identification</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ViewField 
                  icon={<Key size={16}/>} 
                  label="Role Name" 
                  value={role.name} 
                />
                <ViewField 
                  icon={<FileText size={16}/>} 
                  label="Description" 
                  value={role.description} 
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            {/* Section 2: PERMISSION MATRIX */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                    <div className="p-1.5 bg-primary/10 rounded-2xl"><Settings2 size={14}/></div>
                    <span className="text-[11px] font-black uppercase tracking-widest">2. Authorized Permissions</span>
                </div>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                  {role.permissions.length} Total Permissions
                </span>
              </div>
              
              {role.permissions.length === 0 ? (
                <div className="p-8 bg-gray-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-slate-700 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No permissions assigned to this role.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(groupedPermissions).map(([category, subPerms]) => (
                    <div key={category} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden shadow-sm">
                      
                      {/* Category Header */}
                      <div className="bg-gray-50/50 dark:bg-slate-800/50 px-5 py-4 flex items-center gap-2.5 border-b border-gray-100 dark:border-slate-800">
                        <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-primary">
                          {getCategoryIcon(category)}
                        </div>
                        <span className="text-[11px] font-black uppercase text-gray-700 dark:text-slate-300">
                          {category}
                        </span>
                      </div>

                      {/* Sub-Permissions List */}
                      <div className="p-4 space-y-2">
                        {subPerms.map((sub, idx) => (
                          <div key={idx} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary">
                            <span className="text-[10px] font-bold uppercase tracking-tight">{sub}</span>
                            <CheckCircle2 size={14} className="text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase text-[10px] hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-sm"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini component for displaying standard fields
const ViewField = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
    <div className="text-primary/60 mt-0.5">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{value || 'Not provided'}</p>
    </div>
  </div>
);

export default RoleViewDialog;