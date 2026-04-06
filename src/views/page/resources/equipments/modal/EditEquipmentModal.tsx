import { useState, useEffect } from 'react';
import { Edit3, Tractor, Hash, MapPin, X, Save, Loader2, LayoutGrid, Activity, Settings, Info, Layers, ChevronsUpDown, Check, Calendar } from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import SearchableSelect from '../../inventory/SearchableSelect';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../../components/ui/command';

interface EditEquipmentModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  selectedItem: any;
  // Equipment Type Props
  typeOptions: string[]; defaultTypes: string[]; onAddType: (v: string) => void; onDeleteType: (v: string) => void;
  // Program Props
  programOptions: string[]; defaultPrograms: string[]; onAddProgram: (v: string) => void; onDeleteProgram: (v: string) => void;
  // Condition Props
  conditionOptions: string[]; defaultConditions: string[]; onAddCondition: (v: string) => void; onDeleteCondition: (v: string) => void;
  // Status Props
  statusOptions: string[]; defaultStatuses: string[]; onAddStatus: (v: string) => void; onDeleteStatus: (v: string) => void;
  // Equipment List Props
  equipmentList: string[]; defaultEquipments: string[]; onAddEquipment: (v: string) => void; onDeleteEquipment: (v: string) => void;
  
  cooperativesRaw: any[]; 
  beneficiaryOptions: string[]; 
  onAddBeneficiary: (v: string) => void; 
  onDeleteBeneficiary: (v: string) => void;
  barangayOptions: string[]; 
}

export default function EditEquipmentModal({ 
    isOpen, onClose, onSubmit, selectedItem, 
    typeOptions, defaultTypes, onAddType, onDeleteType, 
    programOptions, defaultPrograms, onAddProgram, onDeleteProgram,
    conditionOptions, defaultConditions, onAddCondition, onDeleteCondition,
    statusOptions, defaultStatuses, onAddStatus, onDeleteStatus,
    equipmentList, defaultEquipments, onAddEquipment, onDeleteEquipment,
    cooperativesRaw
}: EditEquipmentModalProps) {
    
  const [formData, setFormData] = useState({ 
    name: "", sku: "", type: "", program: "", 
    beneficiary: [] as string[],
    location: [] as string[],   
    condition: "", status: "", lastCheck: "" 
  });
  const [isSaving, setIsSaving] = useState(false);

  // Auto-fill form when item is selected
useEffect(() => { 
    if (selectedItem && isOpen) {
      const initialBeneficiaries = Array.isArray(selectedItem.beneficiary) 
          ? selectedItem.beneficiary 
          : (selectedItem.beneficiary && selectedItem.beneficiary !== "Unassigned" ? [selectedItem.beneficiary] : []);
      
      const initialLocations = Array.isArray(selectedItem.location) 
          ? selectedItem.location 
          : (selectedItem.location ? [selectedItem.location] : []);

      // --- FIX: Default to Today, but parse correctly from database string ---
      let formattedDate = new Date().toISOString().split('T')[0]; 
      
      if (selectedItem.lastCheck && selectedItem.lastCheck !== "N/A") {
        const d = new Date(selectedItem.lastCheck);
        // Check if date is valid
        if (!isNaN(d.getTime())) {
          // Adjust for timezone to prevent the "day before" bug
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }

      setFormData({ 
        ...selectedItem, 
        beneficiary: initialBeneficiaries,
        location: initialLocations,
        lastCheck: formattedDate
      }); 
    }
  }, [selectedItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSaving(true);
    try {
      // We "await" the onSubmit from the parent
      await onSubmit(formData); 
      // isSaving will be set to false once parent is done or on close
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSaving(false); 
    }
  };

  const handleToggleBeneficiary = (_id: string, name: string) => {
    setFormData(prev => {
      const isSelected = prev.beneficiary.includes(name);
      let newBeneficiaries: string[];

      if (isSelected) {
        newBeneficiaries = prev.beneficiary.filter(item => item !== name);
      } else {
        newBeneficiaries = [...prev.beneficiary, name];
      }

      // Auto-update locations base sa napili nga mga coops (Unique only)
      const newLocations = cooperativesRaw
        .filter(c => newBeneficiaries.includes(c.name))
        .map(c => c.barangay?.name)
        .filter((v, i, a) => v && a.indexOf(v) === i); 

      return { ...prev, beneficiary: newBeneficiaries, location: newLocations };
    });
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            
            {/* Header: Primary Theme */}
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Edit3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Edit Equipment Details</h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Update {selectedItem?.sku}</p>
                    </div>
                </div>
                <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* SECTION 1: Equipment Identification */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Settings size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">1. Equipment Identification</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Equipment Type */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Equipment Type <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Layers size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Type" 
                                        options={typeOptions} 
                                        defaultOptions={defaultTypes} 
                                        value={formData.type} 
                                        onAdd={onAddType} 
                                        onDelete={onDeleteType} 
                                        onChange={(v) => setFormData({...formData, type: v})} 
                                    />
                                </div>
                            </div>

                            {/* Equipment Name */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Equipment Name <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Tractor size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Select Machinery"
                                        options={equipmentList}
                                        defaultOptions={defaultEquipments}
                                        value={formData.name}
                                        onAdd={onAddEquipment}
                                        onDelete={onDeleteEquipment}
                                        onChange={(val) => setFormData({...formData, name: val})}
                                    />
                                </div>
                            </div>

                            {/* Funding Program */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Funding Program</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><LayoutGrid size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Program" 
                                        options={programOptions} 
                                        defaultOptions={defaultPrograms} 
                                        value={formData.program} 
                                        onAdd={onAddProgram} 
                                        onDelete={onDeleteProgram} 
                                        onChange={(v) => setFormData({...formData, program: v})} 
                                    />
                                </div>
                            </div>

                            {/* SKU / Serial No */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Serial No. <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <Hash className="absolute left-4 text-gray-400" size={16} />
                                    <input required disabled={isSaving} type="text" className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold uppercase focus:ring-4 focus:ring-slate-400/10 focus:border-slate-400/50 outline-none transition-all" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* SECTION 2: Dispersal & Condition */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl"><Activity size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">2. Dispersal & Current State</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* 🌟 BENEFICIARY MULTI-SELECT */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Beneficiary / Cooperative FCA <span className="text-gray-400 font-medium lowercase italic">(Optional)</span>
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="w-full min-h-11.5 flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:border-primary transition-all">
                                            <div className="flex flex-wrap gap-1.5 items-center justify-start flex-1 overflow-hidden">
                                                {formData.beneficiary.length > 0 ? (
                                                    formData.beneficiary.map((name) => (
                                                        <span key={name} className="bg-primary/10 border border-primary/20 text-primary pl-2.5 pr-1 py-1 rounded-lg text-[10px] flex items-center gap-1">
                                                            <span className="truncate">{name}</span>
                                                            <div 
                                                                onClick={(e) => { e.stopPropagation(); handleToggleBeneficiary("", name); }}
                                                                className="hover:bg-primary/30 text-primary/70 hover:text-primary rounded-full p-0.5 transition-colors cursor-pointer"
                                                            >
                                                                <X size={12} strokeWidth={3} />
                                                            </div>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="opacity-40 pl-1 uppercase font-bold text-[10px]">Select Cooperatives...</span>
                                                )}
                                            </div>
                                            <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0 ml-2" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 z-110 bg-white dark:bg-slate-900 w-80 rounded-2xl shadow-2xl border-slate-200">
                                        <Command>
                                            <CommandInput placeholder="Search cooperatives..." className="h-11 text-xs uppercase" />
                                            <CommandList className="max-h-60 overflow-y-auto custom-scrollbar">
                                                <CommandEmpty className="py-4 text-center text-[10px] font-bold text-slate-400">No results found.</CommandEmpty>
                                                <CommandGroup>
                                                    {cooperativesRaw.map((coop: any) => {
                                                        const isSelected = formData.beneficiary.includes(coop.name);
                                                        return (
                                                            <CommandItem 
                                                                key={coop.id} 
                                                                onSelect={() => handleToggleBeneficiary(coop.id.toString(), coop.name)} 
                                                                className={cn("text-xs font-bold uppercase py-3 px-4 cursor-pointer flex items-center justify-between", isSelected ? "bg-primary/5 text-primary" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
                                                            >
                                                                {coop.name}
                                                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* LOCATION BOX (READONLY TAGS STYLE) */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Current Locations / Barangays <span className="text-gray-400 font-medium lowercase italic">(Optional)</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-3 min-h-11.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl items-center shadow-inner">
                                    {formData.location.length > 0 ? (
                                        formData.location.map(brgy => (
                                            <span key={brgy} className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase rounded-lg border border-slate-300 flex items-center gap-1 shadow-sm">
                                                <MapPin size={10} className="text-primary" /> {brgy}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic ml-1 uppercase font-bold opacity-60">Auto-filled locations...</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Equipment Condition */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Equipment Condition <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Info size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Condition" 
                                        position="top" 
                                        options={conditionOptions} 
                                        defaultOptions={defaultConditions} 
                                        value={formData.condition} 
                                        onAdd={onAddCondition} 
                                        onDelete={onDeleteCondition} 
                                        onChange={(v) => setFormData({...formData, condition: v})} 
                                    />
                                </div>
                            </div>

                            {/* Dispersal Status */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dispersal Status <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Activity size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Status" 
                                        position="top" 
                                        options={statusOptions} 
                                        defaultOptions={defaultStatuses} 
                                        value={formData.status} 
                                        onAdd={onAddStatus} 
                                        onDelete={onDeleteStatus} 
                                        onChange={(v) => setFormData({...formData, status: v})} 
                                    />
                                </div>
                            </div>

                            {/* LAST CHECKED DATE */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Checked Date</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Calendar size={16} /></div>
                                    <input 
                                        type="date" 
                                        disabled={isSaving}
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary uppercase"
                                        value={formData.lastCheck} 
                                        onChange={(e) => setFormData({...formData, lastCheck: e.target.value})} 
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSaving} className={cn("px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50 shadow-primary/20")}>
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update Details
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}