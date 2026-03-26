import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wheat, X, Loader2, Save, User, Scale, 
  PhilippinePeso, ChevronsUpDown, Plus, Trash2, LayoutGrid, MapPin, Leaf 
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from '../../../../components/ui/command';

interface HarvestEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  isEdit: boolean;
  farmers: any[];
  barangays: any[];
  crops: any[];
}

const INITIAL_QUALITIES = ["Grade A", "Premium", "Standard"];
const LOCAL_STORAGE_KEY = 'harvest_quality_list';

const HarvestDialog: React.FC<HarvestEditDialogProps> = ({ 
  isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit,
  farmers, barangays, crops 
}) => {

  const [openFarmer, setOpenFarmer] = useState(false);
  const [openBarangay, setOpenBarangay] = useState(false); 
  const [openCrop, setOpenCrop] = useState(false);
  const [openQuality, setOpenQuality] = useState(false);

  const [qualities, setQualities] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_QUALITIES;
    }
    return INITIAL_QUALITIES;
  });

  const [addDialog, setAddDialog] = useState<{ isOpen: boolean; value: string }>({ isOpen: false, value: '' });

  useEffect(() => { 
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(qualities)); 
  }, [qualities]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 🌟 LOGIC: Pangitaon ang tibuok data sa napili nga farmer
  const selectedFarmerObj = useMemo(() => {
    if (!formData.farmer_id) return null;
    return farmers.find(f => f.id === formData.farmer_id);
  }, [formData.farmer_id, farmers]);

  // 🌟 LOGIC: I-filter ang mga Barangay base lang sa uma sa napili nga farmer
  const availableBarangays = useMemo(() => {
    if (!selectedFarmerObj) return barangays; 
    const validIds = new Set<number>();
    if (selectedFarmerObj.farm_barangay_id) validIds.add(selectedFarmerObj.farm_barangay_id);
    if (selectedFarmerObj.farms_list) {
      selectedFarmerObj.farms_list.forEach((farm: any) => {
        if (farm.farm_barangay_id) validIds.add(farm.farm_barangay_id);
      });
    }
    return barangays.filter(b => validIds.has(b.id));
  }, [selectedFarmerObj, barangays]);

  // 🌟 LOGIC: I-filter ang mga Crops base lang sa gitanom sa napili nga farmer
  const availableCrops = useMemo(() => {
    if (!selectedFarmerObj) return crops; 
    const validIds = new Set<number>();
    if (selectedFarmerObj.crop_id) validIds.add(selectedFarmerObj.crop_id);
    if (selectedFarmerObj.farms_list) {
      selectedFarmerObj.farms_list.forEach((farm: any) => {
        if (farm.crop_id) validIds.add(farm.crop_id);
      });
    }
    return crops.filter(c => validIds.has(c.id));
  }, [selectedFarmerObj, crops]);

  // 🌟 ANG EARLY RETURN IBUTANG SA UBOS SA MGA HOOKS PARA DI MO-ERROR
  if (!isOpen) return null;

  // 🌟 ACTION: Kung mo-select ug farmer, i-auto-fill ang uban fields!
  const handleFarmerSelect = (farmerId: number) => {
    handleChange('farmer_id', farmerId);
    
    const farmer = farmers.find(f => f.id === farmerId);
    if (farmer) {
      if (farmer.farm_barangay_id) {
        handleChange('barangay_id', farmer.farm_barangay_id);
      }
      if (farmer.crop_id) {
        handleChange('crop_id', farmer.crop_id);
      }
    }
  };

  const handleAddQuality = (e: React.FormEvent) => {
    e.preventDefault();
    const val = addDialog.value.trim();
    if (!val || qualities.includes(val)) return;
    
    setQualities([...qualities, val]);
    handleChange('quality', val);
    setAddDialog({ isOpen: false, value: '' });
  };

  const handleDeleteQuality = (entry: string) => {
    const updated = qualities.filter(q => q !== entry);
    setQualities(updated);
    if (formData.quality === entry) handleChange('quality', '');
  };

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* ANIMATED BACKDROP */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
        
        {/* ANIMATED DIALOG BOX */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          
          {/* HEADER */}
          <div className="bg-primary p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-white">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Wheat size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                  {isEdit ? 'Update Harvest Record' : 'Log New Harvest'}
                </h2>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Gingoog Geographical Unit</p>
              </div>
            </div>
            <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
              
              <div className="space-y-6">
                <SectionLabel icon={<User size={14}/>} text="1. Farmer & Location Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5 w-full relative z-30">
                    <label className="text-[10px] font-black uppercase text-gray-400">Farmer Name *</label>
                    <SearchableFarmerPicker 
                      value={formData.farmer_id || formData.farmer} 
                      open={openFarmer} 
                      setOpen={setOpenFarmer} 
                      farmers={farmers} 
                      onSelect={handleFarmerSelect} 
                      disabled={isSaving} 
                    />
                  </div>

                  {/* BARANGAY PICKER */}
                  <div className="space-y-1.5 w-full relative z-20">
                    <label className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
                       <MapPin size={12}/> Barangay or Farm Location *
                    </label>
                    <SearchableBarangayPicker 
                      value={formData.barangay_id || formData.barangay} 
                      open={openBarangay} 
                      setOpen={setOpenBarangay} 
                      barangays={availableBarangays} 
                      onSelect={(val: any) => handleChange('barangay_id', val)} 
                      disabled={isSaving || !formData.farmer_id} 
                    />
                  </div>

                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6">
                <SectionLabel icon={<Wheat size={14}/>} text="2. Crop Specifics" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CROP PICKER */}
                  <div className="space-y-1.5 w-full relative z-10">
                    <label className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
                      <Leaf size={12}/> Crop Planted *
                    </label>
                    <SearchableCropPicker 
                      value={formData.crop_id || formData.crop} 
                      open={openCrop} 
                      setOpen={setOpenCrop} 
                      crops={availableCrops} 
                      onSelect={(val: any) => handleChange('crop_id', val)} 
                      disabled={isSaving || !formData.farmer_id} 
                    />
                  </div>

                  <FormInput label="Date Harvested" required type="date" value={formData.dateHarvested} onChange={(v: string) => handleChange('dateHarvested', v)} disabled={isSaving} />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6 pb-4">
                <SectionLabel icon={<Scale size={14}/>} text="3. Yield & Financials" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormInput label="Quantity / Yield" required placeholder="e.g. 4.5 Tons" value={formData.quantity} onChange={(v: string) => handleChange('quantity', v)} disabled={isSaving} />
                  
                  <div className="space-y-1.5 w-full relative z-0">
                    <label className="text-[10px] font-black uppercase text-gray-400">Quality Grade *</label>
                    <SearchableQualityPicker 
                      value={formData.quality} 
                      open={openQuality} 
                      setOpen={setOpenQuality} 
                      options={qualities} 
                      defaults={INITIAL_QUALITIES}
                      onSelect={(val: string) => handleChange('quality', val)} 
                      onAdd={() => setAddDialog({ isOpen: true, value: '' })}
                      onDelete={handleDeleteQuality}
                      disabled={isSaving} 
                    />
                  </div>

                  <div className="relative space-y-1.5 w-full">
                    <label className="text-[10px] font-black uppercase text-gray-400">Estimated Value or Selling *</label>
                    <div className="relative">
                      <PhilippinePeso size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" required placeholder="e.g. 85,500" disabled={isSaving} value={formData.value} onChange={(e) => handleChange('value', e.target.value)} className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 text-gray-700 dark:text-gray-200" />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
               <button type="button" onClick={onClose} disabled={isSaving} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer">
                 Cancel
               </button>
               <button type="submit" disabled={isSaving} className={cn("px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95", isSaving && "opacity-50 pointer-events-none")}>
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                  {isSaving ? "Processing..." : isEdit ? "Update Log" : "Save Log"}
               </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🌟 ANIMATED INNER DIALOG (Add Custom Quality) */}
      {addDialog.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddDialog({ ...addDialog, isOpen: false })} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
             <h3 className="font-black text-primary uppercase text-sm mb-6 flex items-center gap-2"><LayoutGrid size={16}/> Add Quality Grade</h3>
             <form onSubmit={handleAddQuality} className="space-y-6">
                <FormInput label="Quality Name" placeholder="e.g. Reject or Export Grade" value={addDialog.value} onChange={(v: string) => setAddDialog({...addDialog, value: v})} required />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAddDialog({ ...addDialog, isOpen: false })} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:opacity-90 shadow-md">Save</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// MINI COMPONENTS & SEARCHABLE PICKERS
// ============================================

const SectionLabel = ({ icon, text }: any) => <div className="flex items-center gap-2 text-primary"><div className="p-1.5 bg-primary/10 rounded-2xl">{icon}</div><span className="text-[11px] font-black uppercase tracking-widest">{text}</span></div>;

const FormInput = ({ label, value, onChange, type = "text", required, disabled, placeholder }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black uppercase text-gray-400">{label} {required && "*"}</label>
    <input type={type} disabled={disabled} placeholder={placeholder} className="w-full h-11 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 placeholder:text-gray-400/50 placeholder:font-normal transition-all text-gray-700 dark:text-gray-200" value={value || ''} onChange={(e) => onChange(e.target.value)} required={required} />
  </div>
);

// 🌟 FARMER PICKER
const SearchableFarmerPicker = ({ value, open, setOpen, farmers, onSelect, disabled }: any) => {
  const selected = farmers.find((f: any) => f.id === value || `${f.first_name} ${f.last_name}` === value);
  const displayName = selected ? `${selected.first_name} ${selected.last_name}` : "Select Farmer...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30", selected ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
          {displayName} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search farmer name..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No farmer found.</CommandEmpty>
            <CommandGroup>
              {farmers.map((f: any) => (
                <CommandItem key={f.id} value={`${f.first_name} ${f.last_name}`} onSelect={() => { onSelect(f.id); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                  {f.first_name} {f.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// 🌟 BARANGAY PICKER (FILTERED)
const SearchableBarangayPicker = ({ value, open, setOpen, barangays, onSelect, disabled }: any) => {
  const selected = barangays.find((b: any) => b.id === value || b.name === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-emerald-300", selected ? "text-emerald-700 dark:text-emerald-400" : "text-emerald-500/50")}>
          {selected ? selected.name : (disabled ? "Waiting for Farmer Selection..." : "Select Farm Location...")} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search location..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No matching farm location.</CommandEmpty>
            <CommandGroup>
              {barangays.map((b: any) => (
                <CommandItem key={b.id} value={b.name} onSelect={() => { onSelect(b.id); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                  {b.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// 🌟 CROP PICKER (FILTERED)
const SearchableCropPicker = ({ value, open, setOpen, crops, onSelect, disabled }: any) => {
  const selected = crops.find((c: any) => c.id === value || c.category === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-emerald-300", selected ? "text-emerald-700 dark:text-emerald-400" : "text-emerald-500/50")}>
          {selected ? selected.category : (disabled ? "Waiting for Farmer Selection..." : "Select Crop Planted...")} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search crop..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No crop found for this farmer.</CommandEmpty>
            <CommandGroup>
              {crops.map((c: any) => (
                <CommandItem key={c.id} value={c.category} onSelect={() => { onSelect(c.id); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                  {c.category}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// 🌟 QUALITY PICKER
const SearchableQualityPicker = ({ value, open, setOpen, options, onSelect, onAdd, onDelete, defaults, disabled }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30", value ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
        {value || "Select Quality Grade"} <ChevronsUpDown className="h-4 w-4 opacity-40" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <Command>
        <CommandInput placeholder="Search quality..." className="border-none focus:ring-0" />
        <CommandList className="max-h-60 custom-scrollbar p-1">
          <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No quality found.</CommandEmpty>
          
          <CommandGroup>
            {options.map((opt: string) => (
              <div key={opt} className="relative group flex items-center">
                <CommandItem value={opt} onSelect={() => { onSelect(opt); setOpen(false); }} className="flex-1 text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                  {opt}
                </CommandItem>
                {!defaults.includes(opt) && (
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(opt); }} className="absolute right-2 p-2 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 z-10 cursor-pointer transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </CommandGroup>

          <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
          
          <button type="button" onClick={() => { onAdd(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors">
            <Plus size={14} /> Add Quality Grade
          </button>

        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export default HarvestDialog;