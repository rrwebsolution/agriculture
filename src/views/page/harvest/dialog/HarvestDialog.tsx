import React, { useEffect, useMemo, useState } from 'react';
import {
  Wheat, X, Loader2, Save, User, Scale,
  PhilippinePeso, ChevronsUpDown, Plus, Trash2, LayoutGrid, MapPin, Leaf, CalendarDays
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

const INITIAL_QUALITIES = ['Grade A', 'Premium', 'Standard'];
const LOCAL_STORAGE_KEY = 'harvest_quality_list';
const QUANTITY_UNITS = ['Tons', 'Kilograms', 'Grams', 'Sacks', 'Crates', 'Pieces'];
const UNIT_STORAGE_KEY = 'harvest_quantity_unit_list';

const isActiveOrNoStatus = (record: any) => {
  const status = String(record?.status ?? '').trim().toLowerCase();
  return !status || status === 'active';
};

const getSafeFarmsList = (farmer: any) => {
  if (!farmer) return [];
  let farms = farmer.farms_list;
  if (typeof farms === 'string') {
    try { farms = JSON.parse(farms); } catch { farms = []; }
  }
  return Array.isArray(farms) ? farms : [];
};

const getFarmerFarmLocations = (farmer: any) => {
  const registeredFarms = getSafeFarmsList(farmer).filter((farm: any) => farm?.farm_barangay_id);
  if (registeredFarms.length > 0) return registeredFarms;

  const legacyBarangayId = farmer?.farm_barangay_id || farmer?.farm_location?.id;
  if (!legacyBarangayId) return [];

  return [{
    farm_barangay_id: legacyBarangayId,
    farm_sitio: farmer?.farm_sitio,
    crop_id: farmer?.crop_id,
    total_area: farmer?.total_area,
  }];
};

const HarvestDialog: React.FC<HarvestEditDialogProps> = ({
  isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit,
  farmers, barangays, crops
}) => {
  const [openFarmer, setOpenFarmer] = useState(false);
  const [openBarangay, setOpenBarangay] = useState(false);
  const [openCrop, setOpenCrop] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [openQuality, setOpenQuality] = useState(false);
  const [locationSource, setLocationSource] = useState<'farmer' | 'barangay'>('barangay');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qualities, setQualities] = useState<string[]>(() => {
    if (typeof window === 'undefined') return INITIAL_QUALITIES;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_QUALITIES;
  });
  const [units, setUnits] = useState<string[]>(() => {
    if (typeof window === 'undefined') return QUANTITY_UNITS;
    const saved = localStorage.getItem(UNIT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : QUANTITY_UNITS;
  });
  const [addDialog, setAddDialog] = useState<{ isOpen: boolean; value: string; type: 'quality' | 'unit' }>({ isOpen: false, value: '', type: 'quality' });

  const activeFarmers = useMemo(() => (farmers || []).filter((farmer: any) => isActiveOrNoStatus(farmer)), [farmers]);
  const activeBarangays = useMemo(() => (barangays || []).filter((barangay: any) => isActiveOrNoStatus(barangay)), [barangays]);
  const activeCrops = useMemo(() => (crops || []).filter((crop: any) => isActiveOrNoStatus(crop)), [crops]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(qualities));
  }, [qualities]);

  useEffect(() => {
    localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setLocationSource('barangay');
      return;
    }

    if (!formData.farmer_id) {
      setLocationSource('barangay');
      return;
    }

    const selectedFarmer = activeFarmers.find((f: any) => Number(f.id) === Number(formData.farmer_id));
    const farms = getFarmerFarmLocations(selectedFarmer);
    const matchesRegisteredFarm = farms.some((farm: any) => Number(farm.farm_barangay_id) === Number(formData.barangay_id));
    setLocationSource(matchesRegisteredFarm || (!formData.barangay_id && farms.length > 0) ? 'farmer' : 'barangay');
  }, [isOpen, formData.farmer_id, formData.barangay_id, activeFarmers]);

  const clearError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleFarmerSelect = (farmerId: number | string) => {
    if (!farmerId) {
      setLocationSource('barangay');
      setFormData((prev: any) => ({ ...prev, farmer_id: '', barangay_id: '' }));
      setOpenFarmer(false);
      return;
    }

    const farmer = activeFarmers.find((f: any) => Number(f.id) === Number(farmerId));
    const farms = getFarmerFarmLocations(farmer);
    setLocationSource(farms.length > 0 ? 'farmer' : 'barangay');
    setFormData((prev: any) => ({
      ...prev,
      farmer_id: farmerId,
      barangay_id: '',
      crop_id: prev.crop_id || '',
    }));
    setOpenFarmer(false);
  };

  const handleLocationSourceChange = (source: 'farmer' | 'barangay') => {
    setLocationSource(source);
    handleChange('barangay_id', '');
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.barangay_id) nextErrors.barangay_id = 'Farm Location is required.';
    if (!formData.crop_id) nextErrors.crop_id = 'Crop Planted is required.';
    if (!formData.dateHarvested) nextErrors.dateHarvested = 'Date Harvested is required.';
    if (!formData.quantity) nextErrors.quantity = 'Quantity / Yield is required.';
    if (!formData.quantity_unit) nextErrors.quantity_unit = 'Unit is required.';
    if (!formData.quality) nextErrors.quality = 'Quality Grade is required.';
    if (!formData.value) nextErrors.value = 'Estimated Value or Selling is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving || !validate()) return;
    onSave(event);
  };

  const handleAddQuality = (e: React.FormEvent) => {
    e.preventDefault();
    const val = addDialog.value.trim();
    if (!val || qualities.includes(val)) return;

    setQualities([...qualities, val]);
    handleChange('quality', val);
    setAddDialog({ isOpen: false, value: '', type: 'quality' });
  };

  const handleDeleteQuality = (entry: string) => {
    const updated = qualities.filter(q => q !== entry);
    setQualities(updated);
    if (formData.quality === entry) handleChange('quality', '');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = addDialog.value.trim().replace(/\s+/g, ' ');
    if (!val) return;

    const existing = units.find((unit) => unit.toLowerCase() === val.toLowerCase());
    const savedValue = existing || val;
    if (!existing) setUnits([...units, savedValue]);
    handleChange('quantity_unit', savedValue);
    setAddDialog({ isOpen: false, value: '', type: 'unit' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />

        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
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
            <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl text-white cursor-pointer transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
              <div className="space-y-6">
                <SectionLabel icon={<User size={14} />} text="1. Location & Optional Farmer" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 w-full relative z-30">
                    <FieldLabel label="Farmer Name (Optional)" />
                    <SearchableFarmerPicker
                      value={formData.farmer_id}
                      open={openFarmer}
                      setOpen={setOpenFarmer}
                      farmers={activeFarmers}
                      onSelect={handleFarmerSelect}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-1.5 w-full relative z-20">
                    <FieldLabel label="Farm Location" required icon={<MapPin size={12} />} />
                    <SearchableFarmPicker
                      value={formData.barangay_id}
                      open={openBarangay}
                      setOpen={setOpenBarangay}
                      farmers={activeFarmers}
                      farmerId={formData.farmer_id}
                      barangays={activeBarangays}
                      crops={activeCrops}
                      locationSource={locationSource}
                      onLocationSourceChange={handleLocationSourceChange}
                      onSelect={(farm: any) => handleChange('barangay_id', farm.farm_barangay_id)}
                      disabled={isSaving}
                    />
                    <FieldError message={errors.barangay_id} />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6">
                <SectionLabel icon={<Wheat size={14} />} text="2. Crop Specifics" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 w-full relative z-10">
                    <FieldLabel label="Crop Planted" required icon={<Leaf size={12} />} />
                    <SearchableCropPicker
                      value={formData.crop_id}
                      open={openCrop}
                      setOpen={setOpenCrop}
                      crops={activeCrops}
                      onSelect={(val: any) => handleChange('crop_id', val)}
                      disabled={isSaving}
                    />
                    <FieldError message={errors.crop_id} />
                  </div>

                  <FormInput label="Date Harvested" required type="date" icon={<CalendarDays size={16} />} value={formData.dateHarvested} onChange={(v: string) => handleChange('dateHarvested', v)} disabled={isSaving} error={errors.dateHarvested} />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6 pb-4">
                <SectionLabel icon={<Scale size={14} />} text="3. Yield & Financials" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="w-full">
                    <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2 items-start">
                      <div className="space-y-1.5">
                        <FieldLabel label="Quantity / Yield" required />
                      <div className="relative">
                        <Scale size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="e.g. 4.5"
                          disabled={isSaving}
                          value={formData.quantity || ''}
                          onChange={(e) => handleChange('quantity', e.target.value)}
                          className={cn("w-full h-11 pl-11 pr-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none focus:border-primary/50 text-gray-700 dark:text-gray-200 placeholder:text-gray-400/50 placeholder:font-normal", errors.quantity ? "border-rose-500" : "border-gray-200 dark:border-slate-700")}
                        />
                      </div>
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <FieldLabel label="Unit" required />
                        <SearchableUnitPicker
                          value={formData.quantity_unit}
                          open={openUnit}
                          setOpen={setOpenUnit}
                          units={units}
                          onSelect={(unit: string) => handleChange('quantity_unit', unit)}
                          onAdd={() => setAddDialog({ isOpen: true, value: '', type: 'unit' })}
                          disabled={isSaving}
                          error={errors.quantity_unit}
                        />
                      </div>
                    </div>
                    <FieldError message={errors.quantity || errors.quantity_unit} />
                  </div>

                  <div className="space-y-1.5 w-full relative z-0">
                    <FieldLabel label="Quality Grade" required />
                    <SearchableQualityPicker
                      value={formData.quality}
                      open={openQuality}
                      setOpen={setOpenQuality}
                      options={qualities}
                      defaults={INITIAL_QUALITIES}
                      onSelect={(val: string) => handleChange('quality', val)}
                      onAdd={() => setAddDialog({ isOpen: true, value: '', type: 'quality' })}
                      onDelete={handleDeleteQuality}
                      disabled={isSaving}
                    />
                    <FieldError message={errors.quality} />
                  </div>

                  <div className="relative space-y-1.5 w-full">
                    <FieldLabel label="Estimated Value or Selling" required />
                    <div className="relative">
                      <PhilippinePeso size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. 85,500"
                        disabled={isSaving}
                        value={formData.value || ''}
                        onChange={(e) => handleChange('value', e.target.value)}
                        className={cn("w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none focus:border-primary/50 text-gray-700 dark:text-gray-200", errors.value ? "border-rose-500" : "border-gray-200 dark:border-slate-700")}
                      />
                    </div>
                    <FieldError message={errors.value} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
              <button type="button" onClick={onClose} disabled={isSaving} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className={cn("px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95", isSaving && "opacity-50 pointer-events-none")}>
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Processing...' : isEdit ? 'Update Log' : 'Save Log'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {addDialog.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddDialog({ ...addDialog, isOpen: false })} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-black text-primary uppercase text-sm mb-6 flex items-center gap-2">
              <LayoutGrid size={16} /> {addDialog.type === 'unit' ? 'Add Unit' : 'Add Quality Grade'}
            </h3>
            <form onSubmit={addDialog.type === 'unit' ? handleAddUnit : handleAddQuality} className="space-y-6" noValidate>
              <FormInput
                label={addDialog.type === 'unit' ? 'Unit Name' : 'Quality Name'}
                placeholder={addDialog.type === 'unit' ? 'e.g. Bundles' : 'e.g. Reject or Export Grade'}
                value={addDialog.value}
                onChange={(v: string) => setAddDialog({ ...addDialog, value: v })}
                required
              />
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

const SectionLabel = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-primary dark:text-[var(--dark-mode-text)]">
    <div className="p-1.5 bg-primary/10 rounded-2xl">{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

const FieldLabel = ({ label, required, icon }: any) => (
  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
    {icon}
    <span>{label}</span>
    {required && <span className="text-red-500 dark:text-red-400">*</span>}
  </label>
);

const FieldError = ({ message }: { message?: string }) => (
  message ? <p className="text-[10px] font-bold text-rose-500 ml-1">{message}</p> : null
);

const LocationSourceRadio = ({ value, hasFarmerLocations, farmerOptionDisabled, onChange }: any) => (
  <div className="grid grid-cols-2 gap-2 pb-1">
    <label className={cn(
      "flex items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase transition-colors dark:bg-slate-800/80",
      value === 'farmer'
        ? "border-primary bg-primary/5 text-primary dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-300"
        : "border-gray-200 text-gray-600 dark:border-slate-600 dark:text-slate-200",
      (farmerOptionDisabled || !hasFarmerLocations) ? "cursor-not-allowed opacity-45" : "cursor-pointer"
    )}>
      <input type="radio" name="harvest-farm-location-source" value="farmer" checked={value === 'farmer'} disabled={farmerOptionDisabled || !hasFarmerLocations} onChange={() => onChange('farmer')} className="accent-primary" />
      Farmer Location
    </label>
    <label className={cn(
      "flex items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-black uppercase transition-colors dark:bg-slate-800/80",
      value === 'barangay'
        ? "border-primary bg-primary/5 text-primary dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-300"
        : "border-gray-200 text-gray-600 dark:border-slate-600 dark:text-slate-200",
      "cursor-pointer"
    )}>
      <input type="radio" name="harvest-farm-location-source" value="barangay" checked={value === 'barangay'} onChange={() => onChange('barangay')} className="accent-primary" />
      Barangay List
    </label>
  </div>
);

const FormInput = ({ label, value, onChange, type = 'text', required, disabled, placeholder, icon, error }: any) => (
  <div className="space-y-1.5 w-full">
    <FieldLabel label={label} required={required} />
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("w-full h-11 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none focus:border-primary/50 placeholder:text-gray-400/50 placeholder:font-normal transition-all text-gray-700 dark:text-gray-200", icon ? "pl-11 pr-4" : "px-4", error ? "border-rose-500" : "border-gray-200 dark:border-slate-700")}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
    <FieldError message={error} />
  </div>
);

const SearchableFarmerPicker = ({ value, open, setOpen, farmers, onSelect, disabled }: any) => {
  const selected = farmers.find((f: any) => Number(f.id) === Number(value));
  const displayName = selected ? `${selected.first_name} ${selected.last_name}` : 'Select a farmer (optional)...';

  return (
    <Popover open={open} onOpenChange={(nextOpen) => { if (!disabled) setOpen(nextOpen); }}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30")}>
          {displayName} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search farmer by name..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No farmer found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="No farmer barangay only" onSelect={() => onSelect('')} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer text-primary">
                Continue Without a Farmer
              </CommandItem>
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

const SearchableFarmPicker = ({ value, open, setOpen, farmers, farmerId, onSelect, barangays, crops, locationSource, onLocationSourceChange, disabled }: any) => {
  const selectedFarmer = farmers.find((f: any) => Number(f.id) === Number(farmerId));
  const farms = getFarmerFarmLocations(selectedFarmer);
  const showBarangays = !farmerId || locationSource === 'barangay';
  const effectiveLocationSource = farmerId ? locationSource : 'barangay';
  const isDisabled = disabled || barangays.length === 0;

  let displayName = showBarangays ? 'Select a barangay...' : 'Select a registered farm...';
  if (value) {
    const matchingFarm = farms.find((farm: any) => Number(farm.farm_barangay_id) === Number(value));
    if (showBarangays) {
      const barangay = barangays.find((b: any) => Number(b.id) === Number(value));
      displayName = barangay?.name || 'Select a barangay...';
    } else if (matchingFarm) {
      const barangay = barangays.find((b: any) => Number(b.id) === Number(matchingFarm.farm_barangay_id));
      displayName = `${matchingFarm.farm_sitio || 'Farm'} (${barangay ? barangay.name : 'Unknown'})`;
    }
  }

  return (
    <Popover open={open} onOpenChange={(nextOpen) => { if (!isDisabled) setOpen(nextOpen); }}>
      <PopoverTrigger asChild>
        <button type="button" disabled={isDisabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate", isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30")}>
          {displayName} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-3 border-b border-gray-100 dark:border-slate-700 dark:bg-slate-900">
          <p className="px-1 pb-2 text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">Where is the harvest located?</p>
          <LocationSourceRadio value={effectiveLocationSource} hasFarmerLocations={farms.length > 0} farmerOptionDisabled={!farmerId} onChange={onLocationSourceChange} />
        </div>
        <Command>
          <div className="px-3 py-3 [&_[data-slot=command-input-wrapper]]:h-11 [&_[data-slot=command-input-wrapper]]:rounded-xl [&_[data-slot=command-input-wrapper]]:border [&_[data-slot=command-input-wrapper]]:border-gray-200 dark:[&_[data-slot=command-input-wrapper]]:border-slate-700">
            <CommandInput placeholder={showBarangays ? 'Search barangay...' : 'Search registered farm...'} className="focus:ring-0" />
          </div>
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">
              {showBarangays ? 'No matching barangay found.' : 'No registered farm found.'}
            </CommandEmpty>
            <CommandGroup>
              {(showBarangays ? barangays : farms).map((item: any, idx: number) => {
                if (showBarangays) {
                  return (
                    <CommandItem key={item.id} value={item.name} onSelect={() => { onSelect({ farm_barangay_id: item.id, isBarangayFallback: true }); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                      {item.name}
                    </CommandItem>
                  );
                }

                const barangay = barangays.find((b: any) => Number(b.id) === Number(item.farm_barangay_id));
                const crop = crops.find((c: any) => Number(c.id) === Number(item.crop_id));
                return (
                  <CommandItem key={idx} onSelect={() => { onSelect(item); setOpen(false); }} className="flex flex-col items-start gap-1 py-3 px-4 rounded-xl cursor-pointer">
                    <span className="text-xs font-bold uppercase">{item.farm_sitio || 'Farm'} - {barangay ? barangay.name : `Brgy ${item.farm_barangay_id}`}</span>
                    <span className="text-[9px] font-bold uppercase text-primary/80 tracking-wider">{crop?.category || `Crop ${item.crop_id}`} - Area: {item.total_area || 'N/A'} ha</span>
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

const SearchableCropPicker = ({ value, open, setOpen, crops, onSelect, disabled }: any) => {
  const selected = crops.find((crop: any) => Number(crop.id) === Number(value));

  return (
    <Popover open={open} onOpenChange={(nextOpen) => { if (!disabled && crops.length > 0) setOpen(nextOpen); }}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled || crops.length === 0} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled || crops.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30", selected ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
          {selected ? selected.category : 'Select Crop Planted...'} <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command>
          <CommandInput placeholder="Search crop category..." className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No crops found.</CommandEmpty>
            <CommandGroup>
              {crops.map((crop: any) => (
                <CommandItem key={crop.id} value={crop.category} onSelect={() => { onSelect(crop.id); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                  {crop.category}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const SearchableUnitPicker = ({ value, open, setOpen, units, onSelect, onAdd, disabled, error }: any) => (
  <Popover open={open} onOpenChange={(nextOpen) => { if (!disabled) setOpen(nextOpen); }}>
    <PopoverTrigger asChild>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "w-full h-11 flex items-center justify-between px-3 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-[10px] font-black uppercase truncate outline-none transition-all",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30",
          error ? "border-rose-500" : "border-gray-200 dark:border-slate-700",
          value ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70"
        )}
      >
        <span className="truncate">{value || 'Unit'}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 w-36 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <Command>
        <CommandInput placeholder="Unit..." className="border-none focus:ring-0 text-xs" />
        <CommandList className="max-h-56 custom-scrollbar p-1">
          <CommandEmpty className="py-5 text-[10px] font-bold uppercase text-center text-gray-400">No unit.</CommandEmpty>
          <CommandGroup>
            {units.map((unit: string) => (
              <CommandItem key={unit} value={unit} onSelect={() => { onSelect(unit); setOpen(false); }} className="text-[10px] font-black uppercase py-3 px-3 rounded-xl cursor-pointer">
                {unit}
              </CommandItem>
            ))}
          </CommandGroup>
          <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
          <button type="button" onClick={() => { onAdd(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors">
            <Plus size={13} /> Add Unit
          </button>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

const SearchableQualityPicker = ({ value, open, setOpen, options, onSelect, onAdd, onDelete, defaults, disabled }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30", value ? "text-gray-700 dark:text-gray-200" : "text-gray-400/70")}>
        {value || 'Select Quality Grade'} <ChevronsUpDown className="h-4 w-4 opacity-40" />
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
