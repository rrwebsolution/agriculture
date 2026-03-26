import React, { useEffect, useState } from 'react';
import { 
  UserPlus, X, Check, Loader2, Edit3, 
  User, Mail, ShieldCheck, MapPin, LayoutGrid, ChevronsUpDown
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from '../../../../../components/ui/command';
import { cn } from '../../../../../lib/utils'; // Adjust path if needed

interface UserDialogProps {
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (e: React.FormEvent) => void;
  formData: any; 
  setFormData: any; 
  roles: any[]; 
  clusters: any[]; 
  isSaving: boolean; 
  isEdit: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({ 
    isOpen, onClose, onSave, formData, setFormData, roles, clusters, isSaving, isEdit 
}) => {

  const [openRole, setOpenRole] = useState(false);
  const [openCluster, setOpenCluster] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* 🌟 ANIMATED BACKDROP */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={isSaving ? undefined : onClose} 
      />
      
      {/* 🌟 ANIMATED DIALOG BOX */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {isEdit ? <Edit3 size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                {isEdit ? 'Update System User' : 'Register New User'}
              </h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">LGU Gingoog Access Control</p>
            </div>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors focus:outline-none disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* Section 1: User Identity */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><User size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">1. Personal Identity</span>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors"><User size={16} /></div>
                    <input 
                      type="text" 
                      required 
                      disabled={isSaving}
                      placeholder="e.g. Juan Dela Cruz" 
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 shadow-sm placeholder:text-gray-400/50 placeholder:font-normal" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors"><Mail size={16} /></div>
                    <input 
                      type="email" 
                      required 
                      disabled={isSaving}
                      placeholder="e.g. juan.delacruz@gingoog.gov.ph" 
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 shadow-sm placeholder:text-gray-400/50 placeholder:font-normal" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            {/* Section 2: Access & Assignment */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><LayoutGrid size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">2. System Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 🌟 ROLE COMMAND PICKER */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    System Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-gray-400 z-10"><ShieldCheck size={16} /></div>
                    <SearchableRolePicker 
                      value={formData.role} 
                      open={openRole} 
                      setOpen={setOpenRole} 
                      roles={roles} 
                      disabled={isSaving}
                      onSelect={(id: string) => setFormData({...formData, role: id})} 
                    />
                  </div>
                </div>

                {/* 🌟 CLUSTER COMMAND PICKER */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    <span>Assigned Cluster</span>
                    <span className="text-[8px] font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500">OPTIONAL</span>
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-gray-400 z-10"><MapPin size={16} /></div>
                    <SearchableClusterPicker 
                      value={formData.cluster} 
                      open={openCluster} 
                      setOpen={setOpenCluster} 
                      clusters={clusters} 
                      disabled={isSaving}
                      onSelect={(id: string) => setFormData({...formData, cluster: id === "none" ? "" : id})} 
                    />
                  </div>
                </div>

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
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
              {isSaving ? 'Processing...' : isEdit ? 'Update Changes' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MINI COMMAND PICKER COMPONENTS ---

const SearchableRolePicker = ({ value, open, setOpen, roles, onSelect, disabled }: any) => {
  const selected = roles.find((r: any) => r.id.toString() === value?.toString());
  const displayName = selected ? selected.name : "Select Role...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          type="button" 
          disabled={disabled}
          className="w-full h-13 pl-11 pr-4 flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span className="truncate uppercase">{displayName}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search role..." className="border-none focus:ring-0 text-xs font-bold" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No role found.</CommandEmpty>
            <CommandGroup>
              {roles.map((r: any) => (
                <CommandItem 
                  key={r.id} 
                  value={r.name} 
                  onSelect={() => { onSelect(r.id.toString()); setOpen(false); }} 
                  className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
                >
                  {r.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const SearchableClusterPicker = ({ value, open, setOpen, clusters, onSelect, disabled }: any) => {
  const selected = clusters.find((c: any) => c.id.toString() === value?.toString());
  const displayName = selected ? selected.name : "Global Access (None)";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          type="button" 
          disabled={disabled}
          className="w-full h-13 pl-11 pr-4 flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <span className="truncate uppercase">{value === "" || value === "none" ? "Select Cluster..." : displayName}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search cluster..." className="border-none focus:ring-0 text-xs font-bold" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No cluster found.</CommandEmpty>
            
            <CommandItem 
              value="none" 
              onSelect={() => { onSelect("none"); setOpen(false); }} 
              className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer text-gray-400 border border-transparent mb-1"
            >
              Not Assigned (Global)
            </CommandItem>

            <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2" />

            <CommandGroup>
              {clusters.map((c: any) => (
                <CommandItem 
                  key={c.id} 
                  value={c.name} 
                  onSelect={() => { onSelect(c.id.toString()); setOpen(false); }} 
                  className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
                >
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserDialog;