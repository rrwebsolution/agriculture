import React, { useState, useEffect } from 'react';
import { 
  X, User, ChevronsUpDown, 
  Ship, Waves, Save, Loader2, Anchor, MapPin, MousePointerClick, VenusAndMars, Check, AlertCircle
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';
import { cn } from '../../../../lib/utils';

interface FisheryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, mode: 'add' | 'edit') => void;
  record: any;
  fisherfolks: any[];
  isSaving: boolean;
}

const FisheryDialog: React.FC<FisheryDialogProps> = ({ isOpen, onClose, onSave, record, fisherfolks = [], isSaving }) => {
  const [formData, setFormData] = useState<any>({
    fishr_id: '', name: '', gender: '', contact_no: '', 
    boat_name: '', gear_type: '', fishing_area: '', catch_species: '', 
    yield: '', market_value: '', 
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [openFisherPicker, setOpenFisherPicker] = useState(false);
  const [openBoatPicker, setOpenBoatPicker] = useState(false);
  const [openGenderPicker, setOpenGenderPicker] = useState(false);
  const [availableBoats, setAvailableBoats] = useState<any[]>([]);
  
  const isEdit = !!record;

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (record) {
        setFormData({ ...record });
        const fisher = fisherfolks.find((f: any) => f.system_id === record.fishr_id);
        if (fisher) setAvailableBoats(fisher.boats_list || []);
      } else {
        setFormData({ 
            fishr_id: '', name: '', gender: '', contact_no: '', 
            boat_name: '', gear_type: '', fishing_area: '', catch_species: '', 
            yield: '', market_value: '', 
            date: new Date().toISOString().split('T')[0] 
        });
        setAvailableBoats([]);
      }
    }
  }, [record, isOpen, fisherfolks]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Full Name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.contact_no) newErrors.contact_no = "Contact is required";
    if (!formData.boat_name) newErrors.boat_name = "Boat selection is required";
    if (!formData.gear_type) newErrors.gear_type = "Gear type is required";
    if (!formData.fishing_area) newErrors.fishing_area = "Fishing area is required";
    if (!formData.catch_species) newErrors.catch_species = "Species is required";
    if (!formData.yield) newErrors.yield = "Yield is required";
    if (!formData.market_value) newErrors.market_value = "Market value is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData, isEdit ? 'edit' : 'add');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const handleSelectFisherfolk = (fisher: any) => {
    const boats = fisher.boats_list || [];
    setAvailableBoats(boats);
    const fullName = `${fisher.first_name || ''} ${fisher.middle_name || ''} ${fisher.last_name || ''} ${fisher.suffix && fisher.suffix !== 'None' ? fisher.suffix : ''}`.replace(/\s+/g, ' ').trim();
    const primaryBoat = boats.length === 1 ? boats[0] : null;

    setFormData((prev: any) => ({
      ...prev,
      fishr_id: fisher.system_id || '',
      name: fullName,
      gender: fisher.gender || '',
      contact_no: fisher.contact_no || '',
      boat_name: primaryBoat ? primaryBoat.boat_name : '',
      gear_type: primaryBoat ? primaryBoat.gear_type : '',
      fishing_area: primaryBoat ? primaryBoat.fishing_area : ''
    }));
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={isSaving ? undefined : onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Waves size={20} /></div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">{isEdit ? 'Modify Catch Record' : 'Record New Catch'}</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Fisheries Division</p>
            </div>
          </div>
          <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
            
            {/* SECTION 1 */}
            <div className="space-y-6">
               <SectionLabel icon={<User size={14}/>} text="1. Fisherfolk Personal Details" />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">Full Name *</label>
                    <SearchableFisherfolkPicker value={formData.name} open={openFisherPicker} setOpen={setOpenFisherPicker} items={fisherfolks} onSelect={handleSelectFisherfolk} disabled={isSaving} error={errors.name} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1"><VenusAndMars size={10}/> Gender *</label>
                    <SearchableGenderPicker value={formData.gender} open={openGenderPicker} setOpen={setOpenGenderPicker} onSelect={(val:any) => handleChange('gender', val)} disabled={isSaving || !!formData.fishr_id} error={errors.gender} />
                  </div>

                  <FormInput label="Contact Number" required disabled={isSaving || !!formData.fishr_id} placeholder="09XX-XXX-XXXX" value={formData.contact_no} onChange={(v: string) => handleChange('contact_no', v)} error={errors.contact_no} />
               </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            {/* SECTION 2 */}
            <div className="space-y-6 pb-4">
               <SectionLabel icon={<Ship size={14}/>} text="2. Vessel & Catch Data" />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400">Select Boat / Vessel *</label>
                    <SearchableBoatPicker value={formData.boat_name} open={openBoatPicker} setOpen={setOpenBoatPicker} items={availableBoats} onSelect={(boat: any) => { setFormData((prev: any) => ({...prev, boat_name: boat.boat_name, gear_type: boat.gear_type, fishing_area: boat.fishing_area})); setOpenBoatPicker(false); setErrors(prev => ({...prev, boat_name: '', gear_type: '', fishing_area: ''})); }} disabled={isSaving || !formData.fishr_id} error={errors.boat_name} />
                  </div>

                  <FormInput label="Gear Type" required disabled={isSaving || !!formData.boat_name} placeholder="Gear type" value={formData.gear_type} onChange={(v: string) => handleChange('gear_type', v)} error={errors.gear_type} />
                  <FormInput label="Fishing Area" required disabled={isSaving || !!formData.boat_name} placeholder="Fishing area" value={formData.fishing_area} onChange={(v: string) => handleChange('fishing_area', v)} error={errors.fishing_area} />
                  <FormInput label="Catch Species" required disabled={isSaving} placeholder="e.g. Tuna" value={formData.catch_species} onChange={(v: string) => handleChange('catch_species', v)} error={errors.catch_species} />
                  <FormInput label="Total Yield (kg)" required type="number" disabled={isSaving} placeholder="0.00" value={formData.yield} onChange={(v: string) => handleChange('yield', v)} error={errors.yield} />
                  <FormInput label="Estimated Value (₱)" required type="number" disabled={isSaving} placeholder="0.00" value={formData.market_value} onChange={(v: string) => handleChange('market_value', v)} error={errors.market_value} />
                  <FormInput label="Catch Date" required type="date" disabled={isSaving} value={formData.date} onChange={(v: string) => handleChange('date', v)} />
               </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
             <button type="button" onClick={onClose} disabled={isSaving} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
             <button type="submit" disabled={isSaving} className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                {isSaving ? "Processing..." : isEdit ? "Update Log" : "Save Catch Record"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- HELPERS ---

const SectionLabel = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-primary">
    <div className="p-1.5 bg-primary/10 rounded-2xl">{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

const FormInput = ({ label, value, onChange, type = "text", required, disabled, placeholder, error }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black uppercase text-gray-400">{label} {required && "*"}</label>
    <input type={type} disabled={disabled} placeholder={placeholder} className={cn("w-full h-11 px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none focus:border-primary/50 transition-all text-gray-700 dark:text-gray-200 disabled:opacity-70", error ? "border-red-500 bg-red-50/30" : "border-gray-100 dark:border-slate-800")} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const SearchableFisherfolkPicker = ({ value, open, setOpen, items, onSelect, disabled, error }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", error ? "border-red-500 bg-red-50/30" : "border-gray-100 dark:border-slate-800", disabled ? "opacity-50" : "hover:border-primary/30", value ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
        {value || "Select Fisherfolk..."} <ChevronsUpDown className="h-4 w-4 opacity-40" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-xl overflow-hidden" align="start">
      <Command>
        <CommandInput placeholder="Search name..." className="h-12 border-none focus:ring-0" />
        <CommandList className="max-h-64 custom-scrollbar">
          <CommandEmpty className="py-6 text-center text-[10px] font-black uppercase text-gray-400">No fisherfolk found.</CommandEmpty>
          <CommandGroup>
            {items.map((f: any) => (
              <CommandItem key={f.id} value={`${f.first_name} ${f.last_name}`} onSelect={() => { onSelect(f); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                <div className="flex flex-col">
                    <span>{f.first_name} {f.last_name}</span>
                    <span className="text-[9px] text-gray-400">{f.system_id}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight mt-1"><AlertCircle size={10}/> {error}</p>}
  </Popover>
);

const SearchableGenderPicker = ({ value, open, setOpen, onSelect, disabled, error }: any) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase truncate outline-none", error ? "border-red-500 bg-red-50/30" : "border-gray-100 dark:border-slate-800", disabled ? "opacity-70" : "hover:border-primary/30", value ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
          {value || "Select Gender..."} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-xl shadow-xl overflow-hidden" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {["Male", "Female"].map((g) => (
                <CommandItem key={g} value={g} onSelect={() => { onSelect(g); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer flex justify-between items-center group">
                  {g} {value === g && <Check size={14} className="text-primary"/>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase mt-1"><AlertCircle size={10}/> {error}</p>}
    </Popover>
);

const SearchableBoatPicker = ({ value, open, setOpen, items, onSelect, disabled, error }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", error ? "border-red-500 bg-red-50/30" : "border-gray-100 dark:border-slate-800", disabled ? "opacity-50" : "hover:border-primary/30", value ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
        <span className="truncate">{value || "Select Boat..."}</span> 
        <ChevronsUpDown size={16} className="opacity-40 shrink-0" />
      </button>
    </PopoverTrigger>
    {items.length > 0 && (
      <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-xl overflow-hidden" align="start">
        <Command>
          <CommandList className="max-h-48 custom-scrollbar">
            <CommandGroup>
              {items.map((boat: any, idx: number) => (
                <CommandItem key={idx} value={boat.boat_name} onSelect={() => onSelect(boat)} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer flex flex-col items-start gap-1">
                   <span className="flex items-center gap-2"><Anchor size={12} className="text-primary"/> {boat.boat_name}</span>
                   <div className="flex gap-2 text-[9px] text-gray-400">
                      <span className="flex items-center gap-1"><MousePointerClick size={10}/> {boat.gear_type}</span>
                      <span className="flex items-center gap-1"><MapPin size={10}/> {boat.fishing_area}</span>
                   </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    )}
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight mt-1"><AlertCircle size={10}/> {error}</p>}
  </Popover>
);

export default FisheryDialog;