import React, { useEffect, useMemo, useState } from 'react';
import { X, User, ChevronsUpDown, Ship, Waves, Save, Loader2, Anchor, VenusAndMars, Check, AlertCircle, Plus, Trash2, Clock3, Scale, CalendarDays, Phone, Fish, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';
import { cn } from '../../../../lib/utils';

interface FisheryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, mode: 'add' | 'edit') => void;
  record: any;
  fisherfolks: any[];
  existingRecords: any[];
  isSaving: boolean;
}

const blankEntry = {
  boat_name: '',
  gear_type: '',
  fishing_area: '',
  catch_date: '',
  catch_time_from: '',
  catch_time_to: '',
  catch_species: '',
  yield: '',
  market_value: '',
  hours_spent_fishing: '',
};

const CATCH_SPECIES_OPTIONS = [
  'Tuna',
  'Bangus',
  'Tilapia',
  'Galunggong',
  'Tamban',
  'Mackerel',
  'Sardines',
  'Anchovy',
  'Lapu-Lapu',
  'Maya-Maya',
  'Dalagang Bukid',
  'Bisugo',
  'Tulingan',
  'Hasa-Hasa',
  'Salmonete',
  'Dilis',
  'Shrimp',
  'Crab',
  'Squid',
  'Octopus',
  'Shellfish',
];

const splitSpecies = (value: string) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const joinSpecies = (items: string[]) => items.join(', ');
const isActiveOrNoStatus = (record: any) => {
  const status = String(record?.status ?? '').trim().toLowerCase();
  return !status || status === 'active';
};

const calculateHoursSpent = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return '';

  const [startHour, startMinute] = String(startTime).split(':').map(Number);
  const [endHour, endMinute] = String(endTime).split(':').map(Number);

  if ([startHour, startMinute, endHour, endMinute].some((value) => Number.isNaN(value))) return '';

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const durationMinutes = endTotalMinutes - startTotalMinutes;

  if (durationMinutes <= 0) return '';

  return (durationMinutes / 60).toFixed(2);
};

const createDefaultForm = () => ({
  fishr_id: '',
  name: '',
  gender: '',
  contact_no: '',
  date: new Date().toISOString().split('T')[0],
  vessel_catch_entries: [{
    ...blankEntry,
    catch_date: new Date().toISOString().split('T')[0],
    catch_time_from: '08:00',
    catch_time_to: '12:00',
  }],
});

const FisheryDialog: React.FC<FisheryDialogProps> = ({ isOpen, onClose, onSave, record, fisherfolks = [], existingRecords = [], isSaving }) => {
  const [formData, setFormData] = useState<any>(createDefaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openFisherPicker, setOpenFisherPicker] = useState(false);
  const [openGenderPicker, setOpenGenderPicker] = useState(false);
  const [availableBoats, setAvailableBoats] = useState<any[]>([]);
  const [openBoatPickers, setOpenBoatPickers] = useState<Record<number, boolean>>({});
  const [openSpeciesPickers, setOpenSpeciesPickers] = useState<Record<number, boolean>>({});
  const isEdit = !!record;
  const activeFisherfolks = useMemo(
    () => (fisherfolks || []).filter((item: any) => isActiveOrNoStatus(item)),
    [fisherfolks]
  );

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setOpenBoatPickers({});
    setOpenSpeciesPickers({});

    if (record) {
      const fisher = activeFisherfolks.find((item: any) => item.system_id === record.fishr_id);
      setAvailableBoats(fisher?.boats_list || []);
      setFormData({
        fishr_id: record.fishr_id || '',
        name: record.name || '',
        gender: record.gender || '',
        contact_no: record.contact_no || '',
        date: record.date || new Date().toISOString().split('T')[0],
        vessel_catch_entries: Array.isArray(record.vessel_catch_entries) && record.vessel_catch_entries.length > 0
          ? record.vessel_catch_entries.map((entry: any) => ({
              ...blankEntry,
              ...entry,
              catch_date: entry.catch_date || record.date || new Date().toISOString().split('T')[0],
              catch_time_from: entry.catch_time_from || '08:00',
              catch_time_to: entry.catch_time_to || '12:00',
              yield: entry.yield?.toString?.() ?? '',
              market_value: entry.market_value?.toString?.() ?? '',
              hours_spent_fishing: entry.hours_spent_fishing?.toString?.() ?? '',
            }))
          : [{
              ...blankEntry,
              catch_date: record.date || new Date().toISOString().split('T')[0],
              catch_time_from: '08:00',
              catch_time_to: '12:00',
            }],
      });
    } else {
      setFormData(createDefaultForm());
      setAvailableBoats([]);
    }
  }, [record, isOpen, activeFisherfolks]);

  const totalHours = useMemo(
    () => formData.vessel_catch_entries.reduce((sum: number, entry: any) => sum + Number(entry.hours_spent_fishing || 0), 0),
    [formData.vessel_catch_entries]
  );

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleEntryChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      vessel_catch_entries: prev.vessel_catch_entries.map((entry: any, entryIndex: number) =>
        entryIndex === index
          ? {
              ...entry,
              [field]: value,
              hours_spent_fishing:
                field === 'catch_time_from' || field === 'catch_time_to'
                  ? calculateHoursSpent(
                      field === 'catch_time_from' ? value : entry.catch_time_from,
                      field === 'catch_time_to' ? value : entry.catch_time_to
                    )
                  : entry.hours_spent_fishing,
            }
          : entry
      ),
    }));

    const errorKey = `entry_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleSpeciesToggle = (index: number, species: string) => {
    const currentSelection = splitSpecies(formData.vessel_catch_entries[index]?.catch_species);
    const nextSelection = currentSelection.includes(species)
      ? currentSelection.filter((item) => item !== species)
      : [...currentSelection, species];

    handleEntryChange(index, 'catch_species', joinSpecies(nextSelection));
  };

  const addEntry = () => {
    setFormData((prev: any) => ({
      ...prev,
      vessel_catch_entries: [
        ...prev.vessel_catch_entries,
        {
          ...blankEntry,
          catch_date: prev.date || new Date().toISOString().split('T')[0],
          catch_time_from: '08:00',
          catch_time_to: '12:00',
        },
      ],
    }));
  };

  const removeEntry = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      vessel_catch_entries: prev.vessel_catch_entries.filter((_: any, entryIndex: number) => entryIndex !== index),
    }));
  };

  const getAutoFishingArea = (fishrId: string, boatName: string) => {
    if (!fishrId || !boatName) return '';
    const latestMatch = [...existingRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find((item: any) =>
        item.fishr_id === fishrId &&
        item.vessel_catch_entries?.some((entry: any) => entry.boat_name === boatName && entry.fishing_area)
      );

    return latestMatch?.vessel_catch_entries?.find((entry: any) => entry.boat_name === boatName)?.fishing_area || '';
  };

  const handleSelectFisherfolk = (fisher: any) => {
    const boats = fisher.boats_list || [];
    const fullName = `${fisher.first_name || ''} ${fisher.middle_name || ''} ${fisher.last_name || ''} ${fisher.suffix && fisher.suffix !== 'None' ? fisher.suffix : ''}`.replace(/\s+/g, ' ').trim();

    setAvailableBoats(boats);
    setFormData((prev: any) => ({
      ...prev,
      fishr_id: fisher.system_id || '',
      name: fullName,
      gender: fisher.gender || '',
      contact_no: fisher.contact_no || '',
      vessel_catch_entries: prev.vessel_catch_entries.map((entry: any) => ({ ...entry, boat_name: '', gear_type: '', fishing_area: '' })),
    }));
  };

  const handleSelectBoat = (index: number, boat: any) => {
    const autoFishingArea = getAutoFishingArea(formData.fishr_id, boat.boat_name);
    setFormData((prev: any) => ({
      ...prev,
      vessel_catch_entries: prev.vessel_catch_entries.map((entry: any, entryIndex: number) =>
        entryIndex === index
          ? {
              ...entry,
              boat_name: boat.boat_name || '',
              gear_type: boat.gear_type || '',
              fishing_area: autoFishingArea || entry.fishing_area || '',
            }
          : entry
      ),
    }));
    setOpenBoatPickers((prev) => ({ ...prev, [index]: false }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name) nextErrors.name = 'Full Name is required';
    if (!formData.gender) nextErrors.gender = 'Gender is required';
    if (!formData.contact_no) nextErrors.contact_no = 'Contact is required';
    if (!formData.date) nextErrors.date = 'Catch date is required';
    if (!formData.vessel_catch_entries.length) nextErrors.entries = 'At least one vessel & catch entry is required';

    formData.vessel_catch_entries.forEach((entry: any, index: number) => {
      if (!entry.boat_name) nextErrors[`entry_${index}_boat_name`] = 'Boat is required';
      if (!entry.gear_type) nextErrors[`entry_${index}_gear_type`] = 'Gear type is required';
      if (!entry.fishing_area) nextErrors[`entry_${index}_fishing_area`] = 'Fishing area is required';
      if (!entry.catch_date) nextErrors[`entry_${index}_catch_date`] = 'Catch date is required';
      if (!entry.catch_time_from) nextErrors[`entry_${index}_catch_time_from`] = 'Catch start time is required';
      if (!entry.catch_time_to) nextErrors[`entry_${index}_catch_time_to`] = 'Catch end time is required';
      if (!entry.catch_species) nextErrors[`entry_${index}_catch_species`] = 'Species is required';
      if (!entry.yield) nextErrors[`entry_${index}_yield`] = 'Yield is required';
      if (!entry.market_value) nextErrors[`entry_${index}_market_value`] = 'Market value is required';
      if (!entry.hours_spent_fishing) nextErrors[`entry_${index}_hours_spent_fishing`] = 'Hours spent fishing is required';
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      vessel_catch_entries: formData.vessel_catch_entries.map((entry: any) => ({
        ...entry,
        yield: Number(entry.yield),
        market_value: Number(entry.market_value),
        hours_spent_fishing: Number(entry.hours_spent_fishing),
      })),
      hours_spent_fishing: totalHours,
    };

    if (record?.id) payload.id = record.id;
    onSave(payload, isEdit ? 'edit' : 'add');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={isSaving ? undefined : onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
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
            <div className="space-y-6">
              <SectionLabel icon={<User size={14} />} text="1. Fisherfolk Personal Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5 lg:col-span-2">
                  <FieldLabel label="Full Name" required />
                  <SearchableFisherfolkPicker value={formData.name} open={openFisherPicker} setOpen={setOpenFisherPicker} items={activeFisherfolks} onSelect={handleSelectFisherfolk} disabled={isSaving} error={errors.name} />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel label="Gender" required icon={<VenusAndMars size={12} />} />
                  <SearchableGenderPicker value={formData.gender} open={openGenderPicker} setOpen={setOpenGenderPicker} onSelect={(value: any) => handleChange('gender', value)} disabled={isSaving || !!formData.fishr_id} error={errors.gender} />
                </div>
                <FormInput label="Catch Date" required type="date" icon={<CalendarDays size={16} />} disabled={isSaving} value={formData.date} onChange={(value: string) => handleChange('date', value)} error={errors.date} />
                <FormInput label="Contact Number" required icon={<Phone size={16} />} disabled={isSaving || !!formData.fishr_id} placeholder="09XX-XXX-XXXX" value={formData.contact_no} onChange={(value: string) => handleChange('contact_no', value)} error={errors.contact_no} />
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 lg:col-span-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Fishing Area Auto-Fill</p>
                  <p className="text-[11px] font-bold text-blue-700/80 mt-2 leading-relaxed">When you select a vessel, the form checks the fisherfolk&apos;s previous catch records and auto-fills the latest fishing area. You can still edit it anytime.</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            <div className="space-y-6 pb-4">
              <div className="flex items-center justify-between gap-4">
                <SectionLabel icon={<Ship size={14} />} text="2. Vessel & Catch Data" />
                <button type="button" onClick={addEntry} className="px-5 py-3 rounded-2xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:bg-primary/15 transition-colors">
                  <Plus size={14} /> Add Vessel Entry
                </button>
              </div>

              {errors.entries && <p className="text-[10px] text-red-500 font-bold">{errors.entries}</p>}

              <div className="space-y-6">
                {formData.vessel_catch_entries.map((entry: any, index: number) => (
                  <div key={index} className="rounded-[2rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Entry {index + 1}</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">Multiple vessel and catch rows are now supported per record.</p>
                      </div>
                      {formData.vessel_catch_entries.length > 1 && (
                        <button type="button" onClick={() => removeEntry(index)} className="p-3 rounded-2xl bg-rose-50 text-rose-500 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      <div className="space-y-1.5">
                        <FieldLabel label="Select Boat / Vessel" required />
                        <SearchableBoatPicker
                          value={entry.boat_name}
                          open={!!openBoatPickers[index]}
                          setOpen={(value: boolean) => setOpenBoatPickers((prev) => ({ ...prev, [index]: value }))}
                          items={availableBoats}
                          onSelect={(boat: any) => handleSelectBoat(index, boat)}
                          disabled={isSaving || !formData.fishr_id}
                          error={errors[`entry_${index}_boat_name`]}
                        />
                      </div>

                      <FormInput label="Gear Type" required icon={<Waves size={16} />} disabled={isSaving} placeholder="Gear type" value={entry.gear_type} onChange={(value: string) => handleEntryChange(index, 'gear_type', value)} error={errors[`entry_${index}_gear_type`]} />
                      <FormInput label="Fishing Area" required icon={<MapPin size={16} />} disabled={isSaving} placeholder="Fishing area" value={entry.fishing_area} onChange={(value: string) => handleEntryChange(index, 'fishing_area', value)} error={errors[`entry_${index}_fishing_area`]} />
                      <FormInput label="Catch Date" required type="date" icon={<CalendarDays size={16} />} disabled={isSaving} value={entry.catch_date} onChange={(value: string) => handleEntryChange(index, 'catch_date', value)} error={errors[`entry_${index}_catch_date`]} />
                      <FormInput label="Catch Time From" required type="time" icon={<Clock3 size={16} />} disabled={isSaving} value={entry.catch_time_from} onChange={(value: string) => handleEntryChange(index, 'catch_time_from', value)} error={errors[`entry_${index}_catch_time_from`]} />
                      <FormInput label="Catch Time To" required type="time" icon={<Clock3 size={16} />} disabled={isSaving} value={entry.catch_time_to} onChange={(value: string) => handleEntryChange(index, 'catch_time_to', value)} error={errors[`entry_${index}_catch_time_to`]} />
                      <FormInput label="Hours Spent Fishing" required type="number" icon={<Clock3 size={16} />} disabled={isSaving} readOnly placeholder="Auto-calculated" value={entry.hours_spent_fishing} onChange={(value: string) => handleEntryChange(index, 'hours_spent_fishing', value)} error={errors[`entry_${index}_hours_spent_fishing`]} />
                      <div className="space-y-1.5 w-full">
                        <FieldLabel label="Catch Species" required />
                        <SearchableSpeciesPicker
                          value={entry.catch_species}
                          open={!!openSpeciesPickers[index]}
                          setOpen={(value: boolean) => setOpenSpeciesPickers((prev) => ({ ...prev, [index]: value }))}
                          options={CATCH_SPECIES_OPTIONS}
                          onToggle={(species: string) => handleSpeciesToggle(index, species)}
                          disabled={isSaving}
                          error={errors[`entry_${index}_catch_species`]}
                        />
                      </div>
                      <FormInput label="Total Yield (kg)" required type="number" icon={<Scale size={16} />} disabled={isSaving} placeholder="0.00" value={entry.yield} onChange={(value: string) => handleEntryChange(index, 'yield', value)} error={errors[`entry_${index}_yield`]} />
                      <FormInput label="Estimated Value (PHP)" required type="number" icon={<Scale size={16} />} disabled={isSaving} placeholder="0.00" value={entry.market_value} onChange={(value: string) => handleEntryChange(index, 'market_value', value)} error={errors[`entry_${index}_market_value`]} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard icon={<Anchor size={18} />} label="Vessel Entries" value={formData.vessel_catch_entries.length.toString()} tone="blue" />
                <SummaryCard icon={<Clock3 size={18} />} label="Total Fishing Hours" value={`${totalHours.toFixed(2)} hrs`} tone="amber" />
                <SummaryCard icon={<Scale size={18} />} label="Combined Yield" value={`${formData.vessel_catch_entries.reduce((sum: number, current: any) => sum + Number(current.yield || 0), 0).toFixed(2)} kg`} tone="emerald" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 cursor-pointer">
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isSaving ? 'Processing...' : isEdit ? 'Update Log' : 'Save Catch Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SectionLabel = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-primary">
    <div className="p-1.5 bg-primary/10 rounded-2xl">{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

const FieldLabel = ({ label, required, icon }: any) => (
  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
    {icon}
    <span>{label} {required && '*'}</span>
  </label>
);

const FormInput = ({ label, value, onChange, type = 'text', required, disabled, placeholder, error, icon, readOnly = false }: any) => (
  <div className="space-y-1.5 w-full">
    <FieldLabel label={label} required={required} />
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input type={type} disabled={disabled} readOnly={readOnly} placeholder={placeholder} className={cn('w-full h-11 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none focus:border-primary/50 transition-all text-gray-700 dark:text-gray-200 disabled:opacity-70', readOnly && 'cursor-not-allowed bg-gray-100 dark:bg-slate-800/70 text-gray-500 dark:text-slate-300', icon ? 'pl-11 pr-4' : 'px-4', error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-slate-700')} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight"><AlertCircle size={10} /> {error}</p>}
  </div>
);

const SearchableFisherfolkPicker = ({ value, open, setOpen, items, onSelect, disabled, error }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn('w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all', error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-slate-700', disabled ? 'opacity-50' : 'hover:border-primary/30', value ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400/70')}>
        {value || 'Select Fisherfolk...'} <ChevronsUpDown className="h-4 w-4 opacity-40" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-xl overflow-hidden" align="start">
      <Command>
        <CommandInput placeholder="Search name..." className="h-12 border-none focus:ring-0" />
        <CommandList className="max-h-64 custom-scrollbar">
          <CommandEmpty className="py-6 text-center text-[10px] font-black uppercase text-gray-400">No fisherfolk found.</CommandEmpty>
          <CommandGroup>
            {items.map((item: any) => (
              <CommandItem key={item.id} value={`${item.first_name} ${item.last_name}`} onSelect={() => { onSelect(item); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                <div className="flex flex-col">
                  <span>{item.first_name} {item.last_name}</span>
                  <span className="text-[9px] text-gray-400">{item.system_id}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight mt-1"><AlertCircle size={10} /> {error}</p>}
  </Popover>
);

const SearchableGenderPicker = ({ value, open, setOpen, onSelect, disabled, error }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn('w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase truncate outline-none', error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-slate-700', disabled ? 'opacity-70' : 'hover:border-primary/30', value ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400/70')}>
        {value || 'Select Gender...'} <ChevronsUpDown className="h-4 w-4 opacity-40" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-xl shadow-xl overflow-hidden" align="start">
      <Command>
        <CommandList>
          <CommandGroup>
            {['Male', 'Female'].map((gender) => (
              <CommandItem key={gender} value={gender} onSelect={() => { onSelect(gender); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer flex justify-between items-center group">
                {gender} {value === gender && <Check size={14} className="text-primary" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase mt-1"><AlertCircle size={10} /> {error}</p>}
  </Popover>
);

const SearchableBoatPicker = ({ value, open, setOpen, items, onSelect, disabled, error }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" disabled={disabled} className={cn('w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase truncate outline-none transition-all', error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-slate-700', disabled ? 'opacity-50' : 'hover:border-primary/30', value ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400/70')}>
        <span className="truncate">{value || 'Select Boat...'}</span>
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
                  <span className="flex items-center gap-2"><Anchor size={12} className="text-primary" /> {boat.boat_name}</span>
                  <div className="flex gap-2 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1"><Waves size={10} /> {boat.gear_type}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    )}
    {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight mt-1"><AlertCircle size={10} /> {error}</p>}
  </Popover>
);

const SearchableSpeciesPicker = ({ value, open, setOpen, options, onToggle, disabled, error }: any) => {
  const selectedItems = splitSpecies(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full min-h-11 flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none transition-all text-left',
            error ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-slate-700',
            disabled ? 'opacity-50' : 'hover:border-primary/30',
            selectedItems.length > 0 ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400/70'
          )}
        >
          <div className="flex flex-wrap gap-2">
            {selectedItems.length > 0 ? selectedItems.map((item) => (
              <span key={item} className="inline-flex items-center rounded-xl bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-wide">
                {item}
              </span>
            )) : (
              <span>Select one or more fish species...</span>
            )}
          </div>
          <ChevronsUpDown size={16} className="opacity-40 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-xl overflow-hidden" align="start">
        <Command>
          <CommandInput placeholder="Search fish species..." className="h-12 border-none focus:ring-0" />
          <CommandList className="max-h-64 custom-scrollbar">
            <CommandEmpty className="py-6 text-center text-[10px] font-black uppercase text-gray-400">No species found.</CommandEmpty>
            <CommandGroup>
              {options.map((species: string) => {
                const isSelected = selectedItems.includes(species);
                return (
                  <CommandItem
                    key={species}
                    value={species}
                    onSelect={() => onToggle(species)}
                    className={cn(
                      'text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer flex items-center justify-between',
                      isSelected && 'bg-primary/5 text-primary'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Fish size={13} className={cn(isSelected ? 'text-primary' : 'text-gray-400')} />
                      {species}
                    </span>
                    {isSelected && <Check size={14} className="text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {error && <p className="text-[9px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-tight mt-1"><AlertCircle size={10} /> {error}</p>}
    </Popover>
  );
};

const SummaryCard = ({ icon, label, value, tone }: any) => {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-2xl border', tones[tone] || tones.blue)}>
      <div>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-sm font-black">{value}</p>
      </div>
    </div>
  );
};

export default FisheryDialog;
