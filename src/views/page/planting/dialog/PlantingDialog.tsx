import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../../../store/hooks'; 
import { 
  Shovel, X, Loader2, User, 
  Wheat, BarChart, Plus, Trash2, 
  LayoutGrid, ChevronsUpDown, Save, CalendarDays, MapPin, Leaf, Ruler, Sprout
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from '../../../../components/ui/command';
import { cn } from '../../../../lib/utils';

interface PlantingEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: {
    farmer_id: number | string;
    barangay_id: number | string;
    crop_id: number | string;
    area: string;
    date_planted: string;
    est_harvest: string;
    status: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSaving: boolean;
  isEdit: boolean;
}

const INITIAL_STATUSES = ["Seedling", "Vegetative", "Flowering", "Maturity"];
const LOCAL_STORAGE_KEY = 'planting_status_list';
const isActiveOrNoStatus = (record: any) => {
  const status = String(record?.status ?? '').trim().toLowerCase();
  return !status || status === 'active';
};

// 🌟 HELPER FUNCTION: Siguraduhon nga kanunay Array ang farms_list para dili mag-crash
const getSafeFarmsList = (farmer: any) => {
  if (!farmer) return [];
  let farms = farmer.farms_list;
  if (typeof farms === 'string') {
     try { farms = JSON.parse(farms); } catch(e) { farms = []; }
  }
  return Array.isArray(farms) ? farms : [];
};

const PlantingDialog: React.FC<PlantingEditDialogProps> = ({ 
  isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit 
}) => {

  const { farmers: allFarmers, barangays, crops } = useAppSelector((state: any) => state.planting);

  const farmers = React.useMemo(() => {
    return (allFarmers || []).filter((f: any) => {
      // 🛡 PROTEKSYON: Kung aksidente nga walay status ang data, i-assume nga 'active' siya
      const stat = f.status ? String(f.status).toLowerCase() : 'active';
      return stat === 'active';
    });
  }, [allFarmers]);
  const activeBarangays = React.useMemo(
    () => (barangays || []).filter((b: any) => isActiveOrNoStatus(b)),
    [barangays]
  );
  const activeCrops = React.useMemo(
    () => (crops || []).filter((c: any) => isActiveOrNoStatus(c)),
    [crops]
  );
  
  const [openFarmer, setOpenFarmer] = useState(false);
  const [openBarangay, setOpenBarangay] = useState(false);
  const [openCrop, setOpenCrop] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  
  const [statuses, setStatuses] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STATUSES;
    }
    return INITIAL_STATUSES;
  });

  const [addDialog, setAddDialog] = useState<{ isOpen: boolean; value: string }>({ isOpen: false, value: '' });

  // Initial Form Setup
  useEffect(() => {
    if (isOpen && !isEdit && !formData.status) {
        setFormData((prev: any) => ({ ...prev, status: 'Seedling' }));
    }
  }, [isOpen, isEdit, formData.status, setFormData]);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(statuses)); }, [statuses]);

  const handleChange = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

  const handleFarmerSelect = (farmerId: number | string) => {
    const selectedFarmer = farmers.find((f: any) => Number(f.id) === Number(farmerId));
    const farms = getSafeFarmsList(selectedFarmer);

    if (farms.length > 0) {
      if (farms.length === 1) {
        const farm = farms[0];
        setFormData((prev: any) => ({
          ...prev,
          farmer_id: farmerId,
          barangay_id: farm.farm_barangay_id,
          crop_id: farm.crop_id,
          area: farm.total_area?.toString() || '',
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          farmer_id: farmerId,
          barangay_id: '',
          crop_id: '',
          area: ''
        }));
      }
    } else {
      // Fallback kung wala gyud sa farms_list
      setFormData((prev: any) => ({
        ...prev,
        farmer_id: farmerId,
        barangay_id: selectedFarmer?.farm_barangay_id || '',
        crop_id: selectedFarmer?.crop_id || '',
        area: selectedFarmer?.total_area?.toString() || ''
      }));
    }
    setOpenFarmer(false);
  };

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const val = addDialog.value.trim();
    if (!val || statuses.includes(val)) return;
    setStatuses([...statuses, val]);
    handleChange('status', val);
    setAddDialog({ isOpen: false, value: '' });
  };

  const handleDeleteStatus = (entry: string) => {
    const updated = statuses.filter(s => s !== entry);
    setStatuses(updated);
    if (formData.status === entry) handleChange('status', INITIAL_STATUSES[0]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={isSaving ? undefined : onClose} 
        />
        
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          
          <div className="bg-primary p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-white">
              <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shovel size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                  {isEdit ? 'Update Planting Log' : 'Log New Planting'}
                </h2>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Gingoog Geographical Unit</p>
              </div>
            </div>
            <button 
              type="button" 
              disabled={isSaving} 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
              
              <div className="space-y-6">
                <SectionLabel icon={<User size={14}/>} text="1. Farmer & Location Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 w-full">
                    <FieldLabel label="Farmer Name" required />
                    <SearchableFarmerPicker 
                      value={formData.farmer_id} 
                      open={openFarmer} 
                      setOpen={setOpenFarmer} 
                      farmers={farmers} 
                      onSelect={handleFarmerSelect} 
                    />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <FieldLabel label="Farm Location" required icon={<MapPin size={12} />} />
                    <SearchableFarmPicker 
                      value={formData.barangay_id} 
                      open={openBarangay} 
                      setOpen={setOpenBarangay} 
                      farmers={farmers} 
                      farmerId={formData.farmer_id}
                      barangays={activeBarangays} 
                      crops={activeCrops}         
                      onSelect={(farm: any) => {
                        handleChange('barangay_id', farm.farm_barangay_id);
                        handleChange('crop_id', farm.crop_id);
                        handleChange('area', farm.total_area?.toString() || '');
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6">
                <SectionLabel icon={<Wheat size={14}/>} text="2. Planting Specifics" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 w-full">
                    <FieldLabel label="Crop Category" required icon={<Leaf size={12} />} />
                    <SearchableCropPicker 
                      value={formData.crop_id} 
                      open={openCrop} 
                      setOpen={setOpenCrop} 
                      farmers={farmers} 
                      farmerId={formData.farmer_id} 
                      crops={activeCrops} 
                      onSelect={(id: number) => handleChange('crop_id', id)} 
                    />
                  </div>
                  <FormInput label="Area Size (ha)" required type="number" step="0.01" icon={<Ruler size={16} />} placeholder="e.g. 1.50" value={formData.area} onChange={(v: string) => handleChange('area', v)} disabled={isSaving} />
                  <FormInput label="Date Planted" required type="date" icon={<CalendarDays size={16} />} placeholder="Select date" value={formData.date_planted} onChange={(v: string) => handleChange('date_planted', v)} disabled={isSaving} />
                  <FormInput label="Estimated Harvest" required type="date" icon={<CalendarDays size={16} />} placeholder="Select date" value={formData.est_harvest} onChange={(v: string) => handleChange('est_harvest', v)} disabled={isSaving} />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6 pb-4">
                <SectionLabel icon={<BarChart size={14}/>} text="3. Tracking & Status" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 w-full">
                    <FieldLabel label="Planting Status" required icon={<Sprout size={12} />} />
                    <SearchableStatusPicker value={formData.status} open={openStatus} setOpen={setOpenStatus} statuses={statuses} defaults={INITIAL_STATUSES} onSelect={(v: string) => handleChange('status', v)} onAdd={() => setAddDialog({ isOpen: true, value: '' })} onDelete={(val: string) => handleDeleteStatus(val)} />
                  </div>
                </div>
              </div>

            </div>

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

      {addDialog.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddDialog({ ...addDialog, isOpen: false })} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
             <h3 className="font-black text-primary uppercase text-sm mb-6 flex items-center gap-2"><LayoutGrid size={16}/> Add New Status</h3>
             <form onSubmit={handleAddStatus} className="space-y-6">
                <FormInput label="Status Name" placeholder="e.g. Harvested or Destroyed" value={addDialog.value} onChange={(v: string) => setAddDialog({...addDialog, value: v})} required />
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

// MINI COMPONENTS FOR DIALOG
const SectionLabel = ({ icon, text }: any) => <div className="flex items-center gap-2 text-primary"><div className="p-1.5 bg-primary/10 rounded-2xl">{icon}</div><span className="text-[11px] font-black uppercase tracking-widest">{text}</span></div>;

const FieldLabel = ({ label, required, icon }: any) => (
  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
    {icon}
    <span>{label} {required && "*"}</span>
  </label>
);

const FormInput = ({ label, value, onChange, type = "text", required, disabled, step, placeholder, icon }: any) => (
  <div className="space-y-1.5 w-full">
    <FieldLabel label={label} required={required} />
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input type={type} step={step} disabled={disabled} placeholder={placeholder} className={cn("w-full h-11 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 placeholder:text-gray-400/50 placeholder:font-normal transition-all", icon ? "pl-11 pr-4" : "px-4")} value={value || ''} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  </div>
);

// 🌟 FARMER PICKER 
const SearchableFarmerPicker = ({ value, open, setOpen, farmers, onSelect }: any) => {
  const selected = farmers.find((f: any) => Number(f.id) === Number(value));
  const displayName = selected ? `${selected.first_name} ${selected.last_name}` : "Select Farmer...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate cursor-pointer hover:border-primary/30 outline-none transition-all">
          {displayName} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search farmer name..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No farmer found.</CommandEmpty>
            <CommandGroup>
              {farmers.map((f: any) => (
                <CommandItem key={f.id} value={`${f.first_name} ${f.last_name}`} onSelect={() => onSelect(f.id)} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
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

const SearchableFarmPicker = ({ value, open, setOpen, farmers, farmerId, onSelect, barangays, crops }: any) => {
  const selectedFarmer = farmers.find((f: any) => Number(f.id) === Number(farmerId));
  const farms = getSafeFarmsList(selectedFarmer);

  let displayName = "Select Farm Location...";
  if (!farmerId) displayName = "Select Farmer First";
  else if (value) {
    const matchingFarm = farms.find((f: any) => Number(f.farm_barangay_id) === Number(value));
    if (matchingFarm) {
       const brgy = barangays.find((b: any) => Number(b.id) === Number(matchingFarm.farm_barangay_id));
       displayName = `${matchingFarm.farm_sitio || 'Farm'} (${brgy ? brgy.name : 'Unknown'})`;
    }
  }

  return (
    <Popover open={open} onOpenChange={(val) => { if(farmerId && farms.length > 0) setOpen(val); }}>
      <PopoverTrigger asChild>
        <button type="button" disabled={!farmerId || farms.length === 0} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate", (!farmerId || farms.length === 0) && "opacity-50")}>
          {displayName} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search location..." className="border focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No properties found.</CommandEmpty>
            <CommandGroup>
              {farms.map((farm: any, idx: number) => {
                const brgy = barangays.find((b: any) => Number(b.id) === Number(farm.farm_barangay_id));
                const brgyName = brgy ? brgy.name : `Brgy ${farm.farm_barangay_id}`;
                
                // 🌟 FIX: Lookup sa pinaka-ulahing crop category name gikan sa Redux crops array
                const cropDetails = crops.find((c: any) => Number(c.id) === Number(farm.crop_id));
                const currentCropName = cropDetails ? cropDetails.category : `Crop ${farm.crop_id}`;

                return (
                  <CommandItem key={idx} onSelect={() => { onSelect(farm); setOpen(false); }} className="flex flex-col items-start gap-1 py-3 px-4 rounded-xl cursor-pointer">
                    <span className="text-xs font-bold uppercase">{farm.farm_sitio || 'Farm'} - {brgyName}</span>
                    <span className="text-[9px] font-bold uppercase text-primary/80 tracking-wider">
                      {currentCropName} • Area: {farm.total_area} ha
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// 🌟 CROP PICKER
const SearchableCropPicker = ({ value, open, setOpen, farmers, farmerId, onSelect, crops }: any) => {
  const selectedFarmer = farmers.find((f: any) => Number(f.id) === Number(farmerId));
  const farms = getSafeFarmsList(selectedFarmer);
  
  // 🌟 FIX: Gamit ang useMemo aron reactive ang lista inig usab sa 'crops' state
  const availableCrops = React.useMemo(() => {
    return farms.reduce((acc: any[], farm: any) => {
      if (!acc.find(c => Number(c.id) === Number(farm.crop_id))) {
        // Pangitaon ang updated category name gikan sa global crops array
        const cropDetails = crops.find((c: any) => Number(c.id) === Number(farm.crop_id));
        acc.push({
          id: farm.crop_id,
          name: cropDetails ? cropDetails.category : `Crop ${farm.crop_id}`
        });
      }
      return acc;
    }, []);
  }, [farms, crops]); // Re-run inig naay ma-receive nga realtime update sa crops

  let displayName = "Select Crop...";
  if (!farmerId) displayName = "Select Farmer First";
  else if (value) {
    const selected = availableCrops.find((c: any) => Number(c.id) === Number(value));
    displayName = selected ? selected.name : "Select Crop...";
  }

  return (
    <Popover open={open} onOpenChange={(val) => { if(farmerId && availableCrops.length > 0) setOpen(val); }}>
      <PopoverTrigger asChild>
        <button type="button" disabled={!farmerId || availableCrops.length === 0} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate", (!farmerId || availableCrops.length === 0) && "opacity-50")}>
          {displayName} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <Command>
          <CommandInput placeholder="Search crop..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No crops found.</CommandEmpty>
            <CommandGroup>
              {availableCrops.map((c: any) => (
                <CommandItem key={c.id} value={c.name} onSelect={() => { onSelect(c.id); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
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
const SearchableStatusPicker = ({ value, open, setOpen, statuses, onSelect, onAdd, onDelete, defaults }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" className="w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate cursor-pointer hover:border-primary/30 outline-none transition-all">
        {value || "Select Status..."} <ChevronsUpDown className="h-4 w-4 opacity-40" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <Command>
        <CommandInput placeholder="Search status..." className="border-none focus:ring-0" />
        <CommandList className="max-h-60 custom-scrollbar p-1">
          <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No status found.</CommandEmpty>
          <CommandGroup>
            {statuses.map((opt: string) => (
              <div key={opt} className="relative group flex items-center">
                <CommandItem value={opt} onSelect={() => { onSelect(opt); setOpen(false); }} className="flex-1 text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                  {opt}
                </CommandItem>
                {!defaults.includes(opt) && (
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(opt); }} className="absolute right-2 p-2 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 z-10 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </CommandGroup>
          <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
          <button type="button" onClick={() => { onAdd(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors">
            <Plus size={14} /> Add Custom Status
          </button>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export default PlantingDialog;
