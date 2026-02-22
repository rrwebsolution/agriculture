import React, { useState, useEffect } from 'react';
import { X, Key, Settings2, Check } from 'lucide-react';

// Exporting the type so the Parent can use it
export interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: { name: string; description: string; permissions: string[] }) => void;
  modules: PermissionItem[]; // Updated to use the interface
}

const RoleDialog: React.FC<RoleDialogProps> = ({ isOpen, onClose, onSave, modules }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setRoleName("");
      setDescription("");
      setSelectedPermissions([]);
      document.body.style.overflow = 'unset';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [isOpen]);

  const togglePermission = (permName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: roleName, description, permissions: selectedPermissions });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">Create New Role</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">LGU Gingoog Security</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Field Supervisor" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200 transition-all" 
                value={roleName} 
                onChange={(e) => setRoleName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Short Description</label>
              <input 
                type="text" 
                required 
                placeholder="Brief responsibility..." 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200 transition-all" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
               <Settings2 size={16} className="text-primary" />
               <label className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-widest">Permission Matrix</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modules.map((mod) => (
                <button 
                  key={mod.id} 
                  type="button" 
                  onClick={() => togglePermission(mod.name)} 
                  className={`flex items-start justify-between p-4 rounded-2xl border transition-all text-left group ${
                    selectedPermissions.includes(mod.name) 
                    ? 'bg-primary/5 border-primary text-primary shadow-sm shadow-primary/10' 
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500 hover:border-gray-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="pr-2">
                    <span className="text-xs font-black uppercase tracking-tighter block leading-tight">
                      {mod.name}
                    </span>
                    <p className={`text-[10px] font-medium mt-1 leading-relaxed ${
                      selectedPermissions.includes(mod.name) ? 'text-primary/70' : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {mod.description}
                    </p>
                  </div>
                  
                  <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    selectedPermissions.includes(mod.name) 
                    ? 'bg-primary border-primary text-white scale-110' 
                    : 'border-gray-300 dark:border-slate-700'
                  }`}>
                    {selectedPermissions.includes(mod.name) && <Check size={12} strokeWidth={4} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
            >
              Save & Authorize
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleDialog;