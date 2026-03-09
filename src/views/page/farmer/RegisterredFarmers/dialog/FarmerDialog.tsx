import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, User, Phone, ArrowRight, ArrowLeft,
  ChevronsUpDown, LandPlot, Sprout, 
  Ruler, Save, Fingerprint,
  ClipboardList, DollarSign
} from 'lucide-react';
import axios from '../../../../../plugin/axios';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './../../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from './../../../../../components/ui/command';
import { Switch } from './../../../../../components/ui/switch';
import { cn } from '.././../../../../lib/utils';
// 🌟 IMPORT REDUX HOOKS
import { useAppSelector } from '../../../../../store/hooks';

interface FarmerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any, mode: 'add' | 'edit') => void;
  farmer: any | null;
}

const FarmerDialog: React.FC<FarmerDialogProps> = ({ isOpen, onClose, onUpdate, farmer }) => {
  // 🌟 PULL MASTERLISTS DIRECTLY FROM REDUX (REAL-TIME UPDATES)
  const barangays = useAppSelector((state) => state.farmer.barangays || []);
  const crops = useAppSelector((state) => state.farmer.crops || []);
  const cooperatives = useAppSelector((state) => state.farmer.cooperatives || []);

  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [openResBrgy, setOpenResBrgy] = useState(false);
  const [openFarmBrgy, setOpenFarmBrgy] = useState(false);
  const [openCropPicker, setOpenCropPicker] = useState(false);
  const [openCoopPicker, setOpenCoopPicker] = useState(false);



  const [formData, setFormData] = useState({
    system_id: '', rsbsa_no: '', first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: '', dob: '', barangay_id: '', address_details: '', contact_no: '',
    farm_barangay_id: '', farm_sitio: '', crop_id: '', ownership_type: '', total_area: '', 
    topography: '', irrigation_type: '', area_breakdown: '',
    is_main_livelihood: true, is_coop_member: false, cooperative_id: '',
    program_name: '', assistance_type: '', date_released: '', 
    quantity: '', total_cost: '', funding_source: '', status: 'active'
  });

  useEffect(() => {
    setIsSaving(false);
    if (farmer && isOpen) {
      setFormData({
        ...formData,
        ...farmer,
        gender: farmer.gender ? String(farmer.gender).trim() : '', 
        suffix: farmer.suffix || '',
        is_main_livelihood: farmer.is_main_livelihood == 1,
        is_coop_member: farmer.is_coop_member == 1,
        barangay_id: farmer.barangay_id?.toString() || '',
        farm_barangay_id: farmer.farm_barangay_id?.toString() || '',
        crop_id: farmer.crop_id?.toString() || '',
        cooperative_id: farmer.cooperative_id?.toString() || '',
        funding_source: farmer.funding_source || '',
      });
    } else if (isOpen) {
      const generatedId = `FRM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({
        system_id: generatedId, rsbsa_no: '', first_name: '', middle_name: '', last_name: '', suffix: '',
        gender: '', dob: '', barangay_id: '', address_details: '', contact_no: '',
        farm_barangay_id: '', farm_sitio: '', crop_id: '', ownership_type: '', total_area: '', 
        topography: '', irrigation_type: '', area_breakdown: '',
        is_main_livelihood: true, is_coop_member: false, cooperative_id: '',
        program_name: '', assistance_type: '', date_released: '', quantity: '', total_cost: '', funding_source: '',
        status: 'active'
      });
      setActiveTab('personal');
      setErrors({});
    }
  }, [farmer, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (activeTab === 'personal') {
        if (!formData.rsbsa_no) e.rsbsa_no = "Required";
        if (!formData.first_name) e.first_name = "Required";
        if (!formData.last_name) e.last_name = "Required";
        if (!formData.gender) e.gender = "Required";
        if (!formData.barangay_id) e.barangay_id = "Required";
    } else if (activeTab === 'farm') {
        if (!formData.farm_barangay_id) e.farm_barangay_id = "Required";
        if (!formData.crop_id) e.crop_id = "Required";
        if (!formData.total_area) e.total_area = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (validate()) {
      if (activeTab === 'personal') setActiveTab('farm');
      else if (activeTab === 'farm') setActiveTab('assistance');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (isSaving) return; 
    if (activeTab !== 'assistance') return;
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const response = farmer 
        ? await axios.put(`farmers/${farmer.id}`, formData) 
        : await axios.post('farmers', formData);
      onUpdate(response.data.data, farmer ? 'edit' : 'add');
      toast.success(farmer ? "Changes Saved" : "Farmer Registered");
      onClose();
    } catch (err: any) {
      toast.error("Error saving record.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
        
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center"><Sprout size={24} /></div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Farmer Registry</h2>
              <p className="text-[10px] font-bold opacity-70 mt-1 uppercase">ID: {formData.system_id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full cursor-pointer transition-colors"><X size={20}/></button>
        </div>

        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 shrink-0">
           <Step active={activeTab === 'personal'} label="1. Personal" icon={<User size={14}/>} />
           <Step active={activeTab === 'farm'} label="2. Farm Profile" icon={<LandPlot size={14}/>} />
           <Step active={activeTab === 'assistance'} label="3. LGU Programs" icon={<ClipboardList size={14}/>} />
        </div>

        <form key={formData.system_id} onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="md:col-span-4"><FormInput label="RSBSA Number" required value={formData.rsbsa_no} onChange={(v:string)=>handleChange('rsbsa_no', v)} error={errors.rsbsa_no} icon={<Fingerprint size={14}/>} placeholder="10-22-XX-XXX-XXXXXX" /></div>
                   <FormInput label="First Name" required value={formData.first_name} onChange={(v:string)=>handleChange('first_name', v)} error={errors.first_name} placeholder="Juan" />
                   <FormInput label="Middle Name" value={formData.middle_name} onChange={(v:string)=>handleChange('middle_name', v)} placeholder="Santos" />
                   <FormInput label="Last Name" required value={formData.last_name} onChange={(v:string)=>handleChange('last_name', v)} error={errors.last_name} placeholder="Dela Cruz" />
                   <FormInput label="Suffix" value={formData.suffix} onChange={(v:string)=>handleChange('suffix', v)} placeholder="Jr. / III" />
                   <FormSelect label="Gender" required value={formData.gender} onChange={(v:string)=>handleChange('gender', v)} options={['Male', 'Female']} error={errors.gender} />
                   <FormInput type="date" label="Date of Birth" required value={formData.dob} onChange={(v:string)=>handleChange('dob', v)} />
                   <FormInput label="Contact Number" value={formData.contact_no} onChange={(v:string)=>handleChange('contact_no', v)} icon={<Phone size={14}/>} placeholder="0917-XXX-XXXX" />
                   <div className="md:col-span-2 space-y-2">
                        <label className={cn("text-[10px] font-black uppercase text-gray-500 ml-1", errors.barangay_id && "text-rose-500")}>Residence Barangay *</label>
                        <SearchablePicker value={formData.barangay_id} open={openResBrgy} setOpen={setOpenResBrgy} items={barangays} onSelect={(id:string)=>handleChange('barangay_id', id)} placeholder="Select Barangay..." error={errors.barangay_id} />
                   </div>
                   <div className="md:col-span-2"><FormInput label="Street / Address Details" value={formData.address_details} onChange={(v:string)=>handleChange('address_details', v)} placeholder="Street / Purok / House No." /></div>
                </div>
              </div>
            )}

            {activeTab === 'farm' && (
               <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Farm Location *</label>
                        <SearchablePicker value={formData.farm_barangay_id} open={openFarmBrgy} setOpen={setOpenFarmBrgy} items={barangays} onSelect={(id:string)=>handleChange('farm_barangay_id', id)} placeholder="Select Barangay..." />
                     </div>
                     <FormInput label="Sitio / Purok" value={formData.farm_sitio} onChange={(v:string)=>handleChange('farm_sitio', v)} placeholder="Sitio Pag-asa" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500">Main Crop *</label>
                        <SearchablePicker value={formData.crop_id} open={openCropPicker} setOpen={setOpenCropPicker} items={crops} labelField="category" onSelect={(id:string)=>handleChange('crop_id', id)} placeholder="Select Crop Category..." />
                     </div>
                     <FormSelect label="Topography" value={formData.topography} onChange={(v:string)=>handleChange('topography', v)} options={['Plain', 'Rolling', 'Sloping']} />
                     <FormSelect label="Irrigation" value={formData.irrigation_type} onChange={(v:string)=>handleChange('irrigation_type', v)} options={['Irrigated', 'Rainfed', 'Upland']} />
                     <FormSelect label="Ownership" value={formData.ownership_type} onChange={(v:string)=>handleChange('ownership_type', v)} options={['Owner', 'Tenant', 'Lease']} />
                     <FormInput type="number" label="Total Area (Ha)" required value={formData.total_area} onChange={(v:string)=>handleChange('total_area', v)} icon={<Ruler size={14}/>} placeholder="1.5" />
                  </div>
                  <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                     <ToggleCard label="Primary Livelihood?" checked={formData.is_main_livelihood} onChange={(c:boolean)=>handleChange('is_main_livelihood', c)} />
                     <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                        <ToggleCard label="Coop Member?" checked={formData.is_coop_member} onChange={(c:boolean)=>handleChange('is_coop_member', c)} />
                        {formData.is_coop_member && (
                           <SearchablePicker value={formData.cooperative_id} open={openCoopPicker} setOpen={setOpenCoopPicker} items={cooperatives} labelField="name" onSelect={(id:string)=>handleChange('cooperative_id', id)} placeholder="Select Cooperative..." />
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'assistance' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <div className="p-8 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><FormInput label="Program Name" value={formData.program_name} onChange={(v:string)=>handleChange('program_name', v)} placeholder="Rice Enhancement Program" /></div>
                    <FormSelect label="Assistance Type" value={formData.assistance_type} onChange={(v:string)=>handleChange('assistance_type', v)} options={['Seeds', 'Fertilizer', 'Equipment', 'Financial Aid']} />
                    <FormInput type="date" label="Date Released" value={formData.date_released} onChange={(v:string)=>handleChange('date_released', v)} />
                    <FormInput label="Quantity" value={formData.quantity} onChange={(v:string)=>handleChange('quantity', v)} placeholder="5 bags" />
                    <FormInput type="number" label="Total Cost" value={formData.total_cost} onChange={(v:string)=>handleChange('total_cost', v)} icon={<DollarSign size={14}/>} placeholder="0.00" />
                    <FormSelect label="Funding Source" value={formData.funding_source} onChange={(v:string)=>handleChange('funding_source', v)} options={['Department of Agriculture', 'LGU Gingoog', 'NGO', 'Others']} />
                 </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
             <button type="button" onClick={onClose} className="px-6 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-rose-500">Cancel</button>
             <div className="flex gap-2">
                {activeTab !== 'personal' && <button type="button" onClick={()=>setActiveTab(activeTab === 'assistance' ? 'farm' : 'personal')} className="px-6 py-3 bg-white dark:bg-slate-800 text-[10px] font-black uppercase rounded-xl border border-gray-200 cursor-pointer flex items-center gap-2 hover:bg-gray-50"><ArrowLeft size={14}/> Back</button>}
                {activeTab !== 'assistance' ? (
                   <button type="button" onClick={handleNext} className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-lg cursor-pointer flex items-center gap-2 hover:opacity-90 transition-all">Next Step <ArrowRight size={14}/></button>
                ) : (
                   <button type="submit" disabled={isSaving} className={cn("px-8 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all hover:bg-emerald-600", isSaving && "opacity-50 cursor-not-allowed")}>
                     {isSaving ? <><Loader2 size={14} className="animate-spin"/> Saving...</> : <><Save size={14}/> Complete Registry</>}
                   </button>
                )}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Step = ({ active, label, icon }: any) => (
  <div className={cn("px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 transition-all", active ? "bg-primary text-white shadow-md scale-105" : "text-gray-400 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800")}>{icon} {label}</div>
);

const FormInput = ({ label, value, onChange, type="text", icon, error, placeholder }: any) => (
  <div className="space-y-1.5 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1.5", error ? "text-rose-500" : "text-gray-500")}>{icon} {label}</label>
    <input type={type} placeholder={placeholder} className={cn("w-full h-11.5 px-4 bg-gray-50 dark:bg-slate-800 border rounded-xl text-xs font-bold outline-none transition-all", error ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700 focus:border-primary text-slate-700 dark:text-slate-200")} value={value || ''} onChange={(e)=>onChange(e.target.value)} />
  </div>
);

const FormSelect = ({ label, value, onChange, options, error }: any) => (
    <div className="space-y-1.5 w-full">
      <label className={cn("text-[10px] font-black uppercase ml-1", error ? "text-rose-500" : "text-gray-500")}>{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("w-full h-11.5 bg-gray-50 dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200", error ? "border-rose-500" : "border-gray-200 dark:border-slate-700")}><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 z-300">
          {options.map((o:string)=><SelectItem key={o} value={o} className="text-xs font-bold uppercase py-3 cursor-pointer">{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
);

const SearchablePicker = ({ value, open, setOpen, items = [], onSelect, placeholder, labelField="name", error }: any) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("w-full h-11.5 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-xl text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-200", error ? "border-rose-500" : "border-gray-200 dark:border-slate-700")}>
          <span className="uppercase truncate">{value ? items.find((i:any)=>i.id.toString() === value)?.[labelField] : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40" />
        </button>
      </PopoverTrigger>
      
      {/* 🌟 GI-AYO NAKO ANG PAG-CLOSE SA TAGS DINHI */}
      <PopoverContent className="p-0 z-300 bg-white dark:bg-slate-900 w-75 rounded-2xl shadow-2xl">
        <Command>
          <CommandInput placeholder="Search..." className="h-11 text-xs uppercase" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-[10px] font-bold">No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((i:any) => (
                <CommandItem 
                  key={i.id} 
                  onSelect={()=>{ onSelect(i.id.toString()); setOpen(false); }} 
                  className="text-xs font-bold uppercase py-3 px-4 cursor-pointer"
                >
                  {i[labelField]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
);

const ToggleCard = ({ label, checked, onChange }: any) => (
    <div className="h-11.5 px-4 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm transition-all">
        <label className="text-[10px] font-black text-gray-400 uppercase">{label}</label>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);

export default FarmerDialog;