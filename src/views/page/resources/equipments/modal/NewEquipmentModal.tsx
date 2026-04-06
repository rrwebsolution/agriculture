import { useState } from 'react';
import { Tractor, Hash, MapPin, Activity, X, Check, Settings, Loader2, Info, Layers, LayoutGrid, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import SearchableSelect from '../../inventory/SearchableSelect';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../../components/ui/command';

interface NewEquipmentModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  // Asset Type
  typeOptions: string[]; defaultTypes: string[]; onAddType: (v: string) => void; onDeleteType: (v: string) => void;
  // Program
  programOptions: string[]; defaultPrograms: string[]; onAddProgram: (v: string) => void; onDeleteProgram: (v: string) => void;
  // Condition
  conditionOptions: string[]; defaultConditions: string[]; onAddCondition: (v: string) => void; onDeleteCondition: (v: string) => void;
  // Status
  statusOptions: string[]; defaultStatuses: string[]; onAddStatus: (v: string) => void; onDeleteStatus: (v: string) => void;
  // Equipment List
  equipmentList: string[]; defaultEquipments: string[]; onAddEquipment: (v: string) => void; onDeleteEquipment: (v: string) => void;
  
  // COOPERATIVE & BARANGAY AUTO-FILL
  cooperativesRaw: any[]; 
  beneficiaryOptions: string[]; 
  onAddBeneficiary: (v: string) => void; 
  onDeleteBeneficiary: (v: string) => void;
  barangayOptions: string[]; 
}

export default function NewEquipmentModal({ 
    isOpen, onClose, onSubmit, 
    typeOptions, defaultTypes, onAddType, onDeleteType, 
    programOptions, defaultPrograms, onAddProgram, onDeleteProgram,
    conditionOptions, defaultConditions, onAddCondition, onDeleteCondition,
    statusOptions, defaultStatuses, onAddStatus, onDeleteStatus,
    equipmentList, defaultEquipments, onAddEquipment, onDeleteEquipment,
    cooperativesRaw, 
}: NewEquipmentModalProps) {
    
  const [formData, setFormData] = useState({ 
    name: "", sku: "", type: "", program: "", 
    beneficiary: [] as string[], 
    location: [] as string[],    
    condition: "", status: "", 
    lastCheck: new Date().toISOString().split('T')[0] 
  });
  
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // NewAssetModal.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
        // We await the parent function
        await onSubmit(formData);
        
        // Reset form ONLY after successful submission
        setFormData({ 
            name: "", sku: "", type: "", program: "", 
            beneficiary: [], location: [], 
            condition: "", status: "", 
            lastCheck: new Date().toISOString().split('T')[0] 
        });
    } catch (error) {
        console.error("Registration failed", error);
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
        
        {/* Modal Container */}
       <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Tractor size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Register New Equipment</h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Machinery & Equipment</p>
                    </div>
                </div>
                <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    {/* SECTION 1 */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <div className="p-1.5 bg-primary/10 rounded-2xl"><Settings size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">1. Equipment Identification</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        onChange={(val) => setFormData({...formData, type: val})} 
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
                                        onChange={(val) => setFormData({...formData, program: val})} 
                                    />
                                </div>
                            </div>

                            {/* SKU / Serial No */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Serial No. <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <Hash className="absolute left-4 text-gray-400" size={16} />
                                    <input required disabled={isSaving} type="text" className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none transition-all uppercase focus:ring-4 focus:ring-primary/10 focus:border-primary/50 placeholder:text-gray-400/50" placeholder="EQP-2024-XXXX" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* --- SECTION 2: Dispersal & Status --- */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <div className="p-1.5 bg-primary/10 rounded-2xl"><Activity size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">2. Dispersal & Current State</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
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

    

                            {/* Linked Locations (Read Only) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    Linked Locations / Barangays <span className="text-gray-400 font-medium lowercase italic">(Auto-filled)</span>
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-4 min-h-26.25 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl items-start align-top content-start shadow-inner">
                                    {formData.location.length > 0 ? (
                                        formData.location.map(brgy => (
                                            <span key={brgy} className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 shadow-sm">
                                                <MapPin size={10} className="text-primary" /> {brgy}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic">Locations will appear based on cooperatives...</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Asset Condition */}
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
                                        onChange={(val) => setFormData({...formData, condition: val})} 
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
                                        onChange={(val) => setFormData({...formData, status: val})} 
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className={cn("px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50 shadow-primary/20")}>
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
                        {isSaving ? 'Processing...' : 'Register Equipment'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}