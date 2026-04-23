import React, { useState, useEffect } from 'react';
import { 
  X, Key, Settings2, Check, Loader2, Edit3, 
  LayoutDashboard, Contact, Sprout, Beef, Box, Wallet, ShieldCheck, Settings,
  MapPin, Save, LayoutGrid, FileText
} from 'lucide-react';
import { cn } from '../../../../../lib/utils'; // Adjust path if needed

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

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('dashboard')) return <LayoutDashboard size={14} />;
  if (c.includes('farmer registry')) return <Contact size={14} />;
  if (c.includes('locations')) return <MapPin size={14} />; 
  if (c.includes('production')) return <Sprout size={14} />;
  if (c.includes('livestock')) return <Beef size={14} />;
  if (c.includes('resources')) return <Box size={14} />;
  if (c.includes('finance')) return <Wallet size={14} />;
  if (c.includes('administration')) return <Contact size={14} />;
  if (c.includes('access control')) return <ShieldCheck size={14} />;
  return <Settings size={14} />;
};

const RoleDialog: React.FC<RoleDialogProps> = ({ 
  isOpen, onClose, onSave, modules, isSaving = false, initialData 
}) => {
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      {/* 🌟 ANIMATED BACKDROP */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={isSaving ? undefined : onClose} 
      />
      
      {/* 🌟 ANIMATED DIALOG BOX */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {initialData ? <Edit3 size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                {initialData ? 'Update Role Configuration' : 'Create New Role'}
              </h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">LGU Gingoog Access Control</p>
            </div>
          </div>
          <button 
            type="button" 
            disabled={isSaving} 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
            
            {/* Section 1: BASIC INFO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><LayoutGrid size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">1. Basic Identification</span>
              </div>
              
              {/* 🌟 PERFECT MATCH WITH VIEW DIALOG FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  icon={<Key size={16}/>} 
                  label="Role Name" 
                  required
                  disabled={isSaving}
                  placeholder="e.g. Field Supervisor"
                  value={roleName}
                  onChange={(e: any) => setRoleName(e.target.value)}
                />
                
                <InputField 
                  icon={<FileText size={16}/>} 
                  label="Description" 
                  required
                  disabled={isSaving}
                  placeholder="What can this role do?"
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
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
                {/* 🌟 MATCHES VIEW DIALOG TOTAL BADGE */}
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                  {selectedPermissions.length} Permissions Selected
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod) => {
                  // Check if any permission in this category is selected
                  const hasActivePermissions = mod.subPermissions.some(p => selectedPermissions.includes(`${mod.category}: ${p}`));
                  const isAllSelected = mod.subPermissions.every(p => selectedPermissions.includes(`${mod.category}: ${p}`));
                  
                  return (
                    <div 
                      key={mod.id} 
                      className={cn(
                        "rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all border",
                        hasActivePermissions 
                          ? "bg-primary/0.02 border-primary/20 dark:bg-primary/0.02 dark:border-primary/20" 
                          : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
                      )}
                    >
                      {/* Category Header */}
                      <div className={cn(
                        "px-5 py-4 flex items-center justify-between border-b",
                        hasActivePermissions ? "border-primary/10 bg-primary/5" : "bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800"
                      )}>
                        {/* 🌟 MATCHES VIEW DIALOG HEADER */}
                        <span className="text-[11px] font-black uppercase text-gray-700 dark:text-slate-300 flex items-center gap-2.5">
                          <div className={cn(
                            "p-1.5 rounded-lg shadow-sm transition-colors",
                            hasActivePermissions ? "bg-primary text-white" : "bg-white dark:bg-slate-700 text-primary"
                          )}>
                            {getCategoryIcon(mod.category)}
                          </div>
                          {mod.category}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => toggleCategory(mod.subPermissions.map(p => `${mod.category}: ${p}`))}
                          className={cn(
                            "text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer border",
                            isAllSelected 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 hover:text-primary hover:border-primary/50 shadow-sm"
                          )}
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
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer group outline-none",
                                isSelected 
                                  ? "bg-primary/5 border-primary/30 text-primary" 
                                  : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-800 dark:hover:text-slate-200 shadow-sm"
                              )}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-tight">{sub}</span>
                              <div className={cn(
                                "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                                isSelected 
                                  ? "bg-primary border-primary text-white" 
                                  : "border-gray-300 dark:border-slate-600 group-hover:border-primary/50"
                              )}>
                                {isSelected && <Check size={10} strokeWidth={4} className="animate-in zoom-in duration-200" />}
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

          </div>

          {/* FOOTER */}
          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className={cn(
                "px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95", 
                isSaving && "opacity-50 pointer-events-none"
              )}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isSaving ? 'Processing...' : initialData ? 'Update Role' : 'Authorize Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🌟 NEW: Input Field designed exactly like the View Field
const InputField = ({ icon, label, value, onChange, placeholder, required, disabled }: any) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-sm group">
    <div className="text-primary/60 mt-0.5 group-focus-within:text-primary transition-colors">{icon}</div>
    <div className="flex-1 w-full">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <input 
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-xs font-bold text-gray-800 dark:text-slate-200 outline-none placeholder:text-gray-400/50 placeholder:font-normal disabled:opacity-50"
      />
    </div>
  </div>
);

export default RoleDialog;
