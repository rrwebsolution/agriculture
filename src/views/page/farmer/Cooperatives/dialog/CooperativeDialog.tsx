import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, User, Plus, Trash2, ChevronsUpDown, Handshake, Building2, 
  Save, TrendingUp, LayoutGrid, Phone, MapPin
} from 'lucide-react';
import axios from '../../../../../plugin/axios';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './../../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from './../../../../../components/ui/command';
import { cn } from '.././../../../../lib/utils';

const DEFAULT_TYPES = ["Multipurpose", "Agriculture", "Fisheries", "Livestock", "Credit", "Consumers"];
const DEFAULT_STATUSES = ["Compliant", "Non-Compliant", "Probationary", "Inactive"];

interface CooperativeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any, mode: 'add' | 'edit') => void;
  coop: any | null;
  barangays: any[]; 
}

const CooperativeDialog: React.FC<CooperativeDialogProps> = ({ isOpen, onClose, onUpdate, coop, barangays }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [openBrgy, setOpenBrgy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [availableTypes, setAvailableTypes] = useState<string[]>(DEFAULT_TYPES);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>(DEFAULT_STATUSES);
  
  const [addDialog, setAddDialog] = useState<{ isOpen: boolean; mode: 'type' | 'status'; value: string }>({
    isOpen: false, mode: 'type', value: ''
  });

  const [formData, setFormData] = useState({
    system_id: '', cda_no: '', name: '', type: '',
    chairman: '', contact_no: '', barangay_id: '', address_details: '',
    member_count: '', capital_cbu: '', status: 'Compliant'
  });

  // Load custom entries from local storage
  useEffect(() => {
    const savedTypes = localStorage.getItem('coop_custom_types');
    const savedStatuses = localStorage.getItem('coop_custom_statuses');
    if (savedTypes) setAvailableTypes(Array.from(new Set([...DEFAULT_TYPES, ...JSON.parse(savedTypes)])));
    if (savedStatuses) setAvailableStatuses(Array.from(new Set([...DEFAULT_STATUSES, ...JSON.parse(savedStatuses)])));
  }, []);

  useEffect(() => {
    setIsSaving(false);
    if (coop && isOpen) {
      if (coop.type && !availableTypes.includes(coop.type)) {
        setAvailableTypes(prev => [...prev, coop.type]);
      }
      if (coop.status && !availableStatuses.includes(coop.status)) {
        setAvailableStatuses(prev => [...prev, coop.status]);
      }

      setFormData({
        ...formData,
        ...coop,
        type: coop.type || '',
        status: coop.status || 'Compliant',
        contact_no: coop.contact_no || '', // 🌟 FIXED: Added explicit mapping
        address_details: coop.address_details || '', // 🌟 FIXED: Added explicit mapping
        barangay_id: coop.barangay_id?.toString() || coop.barangay?.id?.toString() || '',
        member_count: coop.member_count?.toString() || '',
        capital_cbu: coop.capital_cbu?.toString() || '',
      });
    } else if (isOpen) {
      const generatedId = `COOP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        system_id: generatedId, cda_no: '', name: '', type: '',
        chairman: '', contact_no: '', barangay_id: '', address_details: '',
        member_count: '', capital_cbu: '', status: 'Compliant'
      });
    }
    setErrors({});
  }, [coop, isOpen, availableTypes, availableStatuses]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    ['cda_no', 'name', 'type', 'chairman', 'barangay_id', 'member_count', 'capital_cbu', 'status'].forEach(f => {
      if (!formData[f as keyof typeof formData]) newErrors[f] = 'Required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCustomEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const val = addDialog.value.trim();
    if (!val) return;

    if (addDialog.mode === 'type') {
      const updated = Array.from(new Set([...availableTypes, val]));
      setAvailableTypes(updated);
      handleChange('type', val);
      localStorage.setItem('coop_custom_types', JSON.stringify(updated.filter(t => !DEFAULT_TYPES.includes(t))));
    } else {
      const updated = Array.from(new Set([...availableStatuses, val]));
      setAvailableStatuses(updated);
      handleChange('status', val);
      localStorage.setItem('coop_custom_statuses', JSON.stringify(updated.filter(s => !DEFAULT_STATUSES.includes(s))));
    }
    setAddDialog({ ...addDialog, isOpen: false, value: '' });
    toast.success("New entry added!");
  };

  const handleDeleteCustomEntry = (entry: string, mode: 'type' | 'status') => {
    if (mode === 'type') {
      const updated = availableTypes.filter(t => t !== entry);
      setAvailableTypes(updated);
      localStorage.setItem('coop_custom_types', JSON.stringify(updated.filter(t => !DEFAULT_TYPES.includes(t))));
    } else {
      const updated = availableStatuses.filter(s => s !== entry);
      setAvailableStatuses(updated);
      localStorage.setItem('coop_custom_statuses', JSON.stringify(updated.filter(s => !DEFAULT_STATUSES.includes(s))));
    }
    toast.info("Deleted successfully.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const response = coop 
        ? await axios.put(`cooperatives/${coop.id}`, formData) 
        : await axios.post('cooperatives', formData);
      onUpdate(response.data.data, coop ? 'edit' : 'add');
      toast.success(coop ? "Record Updated" : "Registration Success");
      onClose();
    } catch (error: any) { 
      toast.error(error.response?.data?.message || "An error occurred");
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20">
        
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><Handshake size={20} /></div>
            <h2 className="text-lg font-black uppercase tracking-tight leading-none">Cooperative Registry</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer"><X size={20} /></button>
        </div>

        <form key={formData.system_id} onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-10">
              
              <div className="space-y-6">
                <SectionLabel icon={<Building2 size={14}/>} text="1. Organization Identity" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><FormInput label="Official Cooperative Name" required placeholder="Legal Name" value={formData.name} onChange={(v:string)=>handleChange('name', v)} error={errors.name} /></div>
                  <FormInput label="CDA Registration No." required placeholder="9520-XXXXXXXX" value={formData.cda_no} onChange={(v:string)=>handleChange('cda_no', v)} error={errors.cda_no} />
                  
                  <CustomSelect 
                    label="Cooperative Type" required value={formData.type} error={errors.type} options={availableTypes} defaults={DEFAULT_TYPES}
                    onSelect={(v:any)=>handleChange('type', v)} 
                    onAdd={()=>setAddDialog({isOpen:true, mode:'type', value:''})} 
                    onDelete={(val:string) => handleDeleteCustomEntry(val, 'type')}
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6">
                <SectionLabel icon={<User size={14}/>} text="2. Representative & Location" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Chairman / Manager Name" required placeholder="Full Name" value={formData.chairman} onChange={(v:string)=>handleChange('chairman', v)} error={errors.chairman} />
                  {/* 🌟 CONTACT NO INPUT */}
                  <FormInput label="Contact Number" placeholder="09XX-XXX-XXXX" value={formData.contact_no} onChange={(v:string)=>handleChange('contact_no', v)} icon={<Phone size={14} className="text-gray-300"/>}/>
                  <div className="space-y-2">
                      <label className={cn("text-[10px] font-black uppercase ml-1", errors.barangay_id ? "text-red-500" : "text-gray-400")}>Office Barangay *</label>
                      <SearchableBrgyPicker value={formData.barangay_id} open={openBrgy} setOpen={setOpenBrgy} barangays={barangays} onSelect={(id:string) => handleChange('barangay_id', id)} error={errors.barangay_id} />
                  </div>
                  {/* 🌟 ADDRESS DETAILS INPUT */}
                  <FormInput label="Street / Full Address" placeholder="Purok / Street / House No." value={formData.address_details} onChange={(v:string)=>handleChange('address_details', v)} icon={<MapPin size={14} className="text-gray-300"/>}/>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800" />

              <div className="space-y-6 pb-4">
                <SectionLabel icon={<TrendingUp size={14}/>} text="3. Compliance & Metrics" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput label="Total Estimated Members" placeholder="0" required type="number" value={formData.member_count} onChange={(v:string)=>handleChange('member_count', v)} error={errors.member_count} />
                  <FormInput label="Capital Build-up (₱)" required type="number" placeholder="0.00" value={formData.capital_cbu} onChange={(v:string)=>handleChange('capital_cbu', v)} error={errors.capital_cbu} />
                  
                  <CustomSelect 
                    label="Registry Status" required value={formData.status} error={errors.status} options={availableStatuses} defaults={DEFAULT_STATUSES}
                    onSelect={(v:any)=>handleChange('status', v)} 
                    onAdd={()=>setAddDialog({isOpen:true, mode:'status', value:''})} 
                    onDelete={(val:string) => handleDeleteCustomEntry(val, 'status')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
             <button type="button" onClick={onClose} className="px-6 text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 cursor-pointer transition-colors">Cancel</button>
             <button type="submit" disabled={isSaving} className={cn("px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center gap-3 transition-all cursor-pointer", isSaving && "opacity-50")}>
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {isSaving ? "Saving..." : "Save Registration"}
             </button>
          </div>
        </form>
      </div>
    </div>

    {/* 🌟 ADD CUSTOM ENTRY DIALOG (Fixes addDialog warning) */}
    {addDialog.isOpen && (
        <div className="fixed inset-0 z-400 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAddDialog({ ...addDialog, isOpen: false })} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-3xl border border-white/20 p-8 animate-in zoom-in-95">
             <div className="flex items-center gap-3 text-primary mb-6">
                <div className="p-2 bg-primary/10 rounded-2xl"><LayoutGrid size={18}/></div>
                <h3 className="font-black uppercase text-sm tracking-tight">Add New {addDialog.mode === 'type' ? 'Coop Type' : 'Status'}</h3>
             </div>
             <form onSubmit={handleSaveCustomEntry} className="space-y-6">
                <FormInput label="Entry Name" placeholder="e.g. Transport or Delinquent" value={addDialog.value} onChange={(v:string)=>setAddDialog({...addDialog, value: v})} required />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAddDialog({ ...addDialog, isOpen: false })} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 rounded-2xl cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg cursor-pointer">Save Entry</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
};

// MINI COMPONENTS
const SectionLabel = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-primary">
      <div className="p-1.5 bg-primary/10 rounded-2xl">{icon}</div>
      <span className="text-[11px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

const FormInput = ({ label, value, onChange, type = "text", required, placeholder, error, icon }: any) => (
  <div className="space-y-1.5 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1.5", error ? "text-red-500" : "text-gray-400")}>
        {icon} {label} {required && "*"}
    </label>
    <input type={type} placeholder={placeholder} className={cn("w-full h-11 px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold outline-none transition-all", error ? "border-red-500" : "border-transparent focus:bg-white focus:border-primary/30")} value={value || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const CustomSelect = ({ label, value, error, options, onSelect, onAdd, onDelete, defaults, required }: any) => (
  <div className="space-y-1.5 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1", error ? "text-red-500" : "text-gray-400")}>{label} {required && "*"}</label>
    <Select value={value || ""} onValueChange={onSelect}>
      <SelectTrigger className={cn("w-full h-11 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold", error ? "border-red-500" : "border-transparent")}><SelectValue placeholder="Select..." /></SelectTrigger>
      <SelectContent className="bg-white dark:bg-slate-900 z-200 shadow-2xl">
        <div className="p-1">
          {options.map((opt: string) => (
            <div key={opt} className="relative group flex items-center">
              <SelectItem value={opt} className="flex-1 text-xs font-bold uppercase py-3 cursor-pointer rounded-xl">{opt}</SelectItem>
              {!defaults.includes(opt) && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(opt); }} className="absolute right-2 p-2 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"><Trash2 size={14} /></button>
              )}
            </div>
          ))}
          <div className="h-px bg-gray-100 dark:bg-slate-800 my-1" />
          <button type="button" onClick={onAdd} className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-all"><Plus size={14} /> Add Custom Entry</button>
        </div>
      </SelectContent>
    </Select>
  </div>
);

const SearchableBrgyPicker = ({ value, open, setOpen, barangays, onSelect, error }: any) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("w-full h-11 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold cursor-pointer", error ? "border-red-500" : "border-transparent")}>
          <span className="uppercase truncate">{value ? barangays.find((b: any) => b.id.toString() === value)?.name : "Select..."}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-300 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-2xl w-[320px]">
        <Command>
          <CommandInput placeholder="Search..." className="h-11 text-xs font-bold border-none" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center">No results found.</CommandEmpty>
            <CommandGroup>{barangays.map((b: any) => (<CommandItem key={b.id} value={b.name} onSelect={() => { onSelect(b.id.toString()); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer rounded-xl">{b.name}</CommandItem>))}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
);

export default CooperativeDialog;