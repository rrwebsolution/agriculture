import React, { useState, useEffect } from 'react';
import { 
  X, Key, Settings2, Check, Loader2, Edit3, 
  LayoutDashboard, Contact, Sprout, Beef, Box, Wallet, ShieldCheck, ClipboardList, Settings, // Gidugang nga mga icons
  MapPin
} from 'lucide-react';

export interface PermissionItem {
  id: string;
  category: string;
  subPermissions: string[];
}

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSaving?: boolean;
  onSave: (roleData: { name: string; description: string; permissions: string[] }) => void;
  modules: PermissionItem[];
  initialData?: { name: string; description: string; permissions: string[] } | null;
}

// 🌟 BAG-O: Icon mapper aron mag-match sa imong Sidebar 🌟
const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('dashboard')) return <LayoutDashboard size={16} />;
  if (c.includes('farmer registry')) return <Contact size={16} />;
  
  if (c.includes('locations')) return <MapPin size={16} />; 
  if (c.includes('production')) return <Sprout size={16} />;
  if (c.includes('livestock')) return <Beef size={16} />;
  if (c.includes('resources')) return <Box size={16} />;
  if (c.includes('finance')) return <Wallet size={16} />;
  if (c.includes('access control')) return <ShieldCheck size={16} />;
  if (c.includes('audit')) return <ClipboardList size={16} />;
  return <Settings size={16} />;
};

const RoleDialog: React.FC<RoleDialogProps> = ({ isOpen, onClose, onSave, modules, isSaving = false, initialData }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRoleName(initialData.name);
        setDescription(initialData.description);
        setSelectedPermissions(initialData.permissions || []);
      } else {
        setRoleName("");
        setDescription("");
        setSelectedPermissions([]);
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, initialData]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleCategory = (categoryPermissions: string[]) => {
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !categoryPermissions.includes(p)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...categoryPermissions])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      alert("Please select at least one permission.");
      return;
    }
    onSave({ name: roleName, description, permissions: selectedPermissions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {initialData ? <Edit3 size={20} /> : <Key size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                {initialData ? 'Update Existing Role' : 'Create New Role'}
              </h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">LGU Gingoog Access Control</p>
            </div>
          </div>
          <button disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role Name</label>
              <input 
                type="text" required disabled={isSaving} placeholder="e.g. Field Supervisor" 
                className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200 transition-all" 
                value={roleName} onChange={(e) => setRoleName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
              <input 
                type="text" required disabled={isSaving} placeholder="What can this role do?" 
                className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200 transition-all" 
                value={description} onChange={(e) => setDescription(e.target.value)} 
              />
            </div>
          </div>

          {/* PERMISSION MATRIX */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
               <Settings2 size={16} className="text-primary" />
               <label className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-widest">Detailed Permission Matrix</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod) => {
                const isAllSelected = mod.subPermissions.every(p => selectedPermissions.includes(`${mod.category}: ${p}`));
                
                return (
                  <div key={mod.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden shadow-sm">
                    {/* Category Header with Dynamic Sidebar Icon */}
                    <div className="bg-gray-50/50 dark:bg-slate-800/50 px-5 py-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                      <span className="text-[11px] font-black uppercase text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="text-primary">{getCategoryIcon(mod.category)}</span>
                        {mod.category}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => toggleCategory(mod.subPermissions.map(p => `${mod.category}: ${p}`))}
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded transition-all ${isAllSelected ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}
                      >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Sub-Permissions List */}
                    <div className="p-4 space-y-2">
                      {mod.subPermissions.map((sub) => {
                        const fullPermName = `${mod.category}: ${sub}`;
                        const isSelected = selectedPermissions.includes(fullPermName);
                        
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => togglePermission(fullPermName)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                              isSelected 
                              ? 'bg-primary/5 border-primary/30 text-primary' 
                              : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-tight">{sub}</span>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-slate-700'
                            }`}>
                              {isSelected && <Check size={10} strokeWidth={4} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" disabled={isSaving} onClick={onClose} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
              {isSaving ? (
                <><Loader2 size={16} className="animate-spin" /><span>Saving...</span></>
              ) : (
                initialData ? "Update Role" : "Authorize Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleDialog;