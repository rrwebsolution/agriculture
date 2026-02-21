import React, { useState, useEffect } from 'react';
import { X, Key, Settings2, Check } from 'lucide-react';

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: { name: string; description: string; permissions: string[] }) => void;
  modules: string[];
}

const RoleDialog: React.FC<RoleDialogProps> = ({ isOpen, onClose, onSave, modules }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Reset form when modal opens/closes
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

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Create New Role</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">LGU Gingoog Security</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Field Supervisor" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200" 
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-slate-700 dark:text-slate-200" 
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
                  key={mod} 
                  type="button" 
                  onClick={() => togglePermission(mod)} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedPermissions.includes(mod) 
                    ? 'bg-primary/5 border-primary text-primary' 
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-tighter">{mod}</span>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    selectedPermissions.includes(mod) ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-slate-700'
                  }`}>
                    {selectedPermissions.includes(mod) && <Check size={12} strokeWidth={4} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
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