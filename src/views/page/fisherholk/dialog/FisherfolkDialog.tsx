import React, { useState, useEffect } from 'react';
import { 
  X, Check, Loader2, User, Phone, ArrowRight, ArrowLeft,
  MapPin, ChevronsUpDown, Waves, Ship, Anchor, FileBadge, 
  ClipboardList, Sprout, Building2, Ruler, Save, AlertCircle
} from 'lucide-react';
import axios from '../../../../plugin/axios';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './../../../../components/ui/command';
import { Switch } from './../../../../components/ui/switch';
import { cn } from '.././../../../lib/utils';

interface FisherfolkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any, mode: 'add' | 'edit') => void;
  fisher: any | null;
  barangays: any[]; 
}

const FisherfolkDialog: React.FC<FisherfolkDialogProps> = ({ isOpen, onClose, onUpdate, fisher, barangays }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [age, setAge] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [openResBrgy, setOpenResBrgy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}); 

  // Form State
  const [formData, setFormData] = useState({
    system_id: '', 
    first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: '', dob: '', civil_status: '',
    barangay_id: '', address_details: '', contact_no: '',
    education: '',
    
    fisher_type: '', 
    is_main_livelihood: false,
    years_in_fishing: '',
    org_member: false,
    org_name: '',

    boat_name: '', boat_type: '', engine_hp: '',
    registration_no: '', gear_type: '', gear_units: '',
    fishing_area: '',

    farm_name: '', farm_owner: '', farm_location: '',
    farm_type: '', farm_size: '', species_cultured: '',
    
    beneficiary_program: '', assistance_type: '',
    date_released: '', quantity: '', funding_source: '',

    permit_no: '', permit_date_issued: '', permit_expiry: '',
    inspection_status: 'Pending', status: 'active'
  });

  // Calculate Age
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge('');
    }
  }, [formData.dob]);

  // Initialization
  useEffect(() => {
    if (fisher && isOpen) {
      setFormData({ ...formData, ...fisher, barangay_id: fisher.barangay?.id?.toString() || '' });
      setErrors({});
    } else if (isOpen) {
      const generatedId = `FF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData(prev => ({ ...prev, system_id: generatedId }));
      setActiveTab('personal'); 
      setErrors({});
    }
  }, [fisher, isOpen]);

  // Handle Input Change & Clear Errors
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // --- 🌟 GLOBAL INLINE VALIDATION LOGIC 🌟 ---
  const validateCurrentTab = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'personal') {
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.gender) newErrors.gender = 'Select gender';
      if (!formData.dob) newErrors.dob = 'DOB is required';
      if (!formData.civil_status) newErrors.civil_status = 'Status is required';
      if (!formData.barangay_id) newErrors.barangay_id = 'Select barangay';
      if (!formData.address_details) newErrors.address_details = 'Address is required';
    } 
    else if (activeTab === 'fishery') {
      if (!formData.fisher_type) newErrors.fisher_type = 'Type is required';
      if (!formData.years_in_fishing) newErrors.years_in_fishing = 'Years required';
      if (formData.org_member && !formData.org_name) newErrors.org_name = 'Cooperative name required';
      
      // Boat & Gear Validation
      if (!formData.boat_type) newErrors.boat_type = 'Select boat type';
      if (!formData.gear_type) newErrors.gear_type = 'Gear type required';
    }
    else if (activeTab === 'aquaculture') {
      if (!formData.farm_name) newErrors.farm_name = 'Farm name required';
      if (!formData.farm_owner) newErrors.farm_owner = 'Owner required';
      if (!formData.farm_location) newErrors.farm_location = 'Location required';
      if (!formData.farm_type) newErrors.farm_type = 'Facility type required';
      if (!formData.farm_size) newErrors.farm_size = 'Size required';
      if (!formData.species_cultured) newErrors.species_cultured = 'Species required';
    }
    else if (activeTab === 'compliance') {
      if (!formData.inspection_status) newErrors.inspection_status = 'Select inspection status';
      if (!formData.status) newErrors.status = 'Select account status';
    }
    else if (activeTab === 'assistance') {
        // Validation if program is partially filled
        if (formData.beneficiary_program && !formData.assistance_type) newErrors.assistance_type = 'Select assistance type';
        if (formData.beneficiary_program && !formData.funding_source) newErrors.funding_source = 'Select funding source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- WIZARD NAVIGATION LOGIC ---
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!validateCurrentTab()) return;

    if (activeTab === 'personal') setActiveTab('fishery');
    else if (activeTab === 'fishery') {
        if (formData.fisher_type === 'Aquaculture Operator') setActiveTab('aquaculture');
        else setActiveTab('compliance');
    }
    else if (activeTab === 'aquaculture') setActiveTab('compliance');
    else if (activeTab === 'compliance') setActiveTab('assistance');
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setErrors({});
    if (activeTab === 'fishery') setActiveTab('personal');
    else if (activeTab === 'aquaculture') setActiveTab('fishery');
    else if (activeTab === 'compliance') {
        if (formData.fisher_type === 'Aquaculture Operator') setActiveTab('aquaculture');
        else setActiveTab('fishery');
    }
    else if (activeTab === 'assistance') setActiveTab('compliance');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentTab()) return;

    setIsSaving(true);
    try {
      const payload = { ...formData, age };
      let response;
      if (fisher) {
        response = await axios.put(`fisherfolks/${fisher.id}`, payload);
        onUpdate(response.data.data, 'edit');
        toast.success("Registry updated!");
      } else {
        response = await axios.post('fisherfolks', payload);
        onUpdate(response.data.data, 'add');
        toast.success("Registration success!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Server Error.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* HEADER */}
        <div className="bg-primary p-6 sm:px-8 flex items-center justify-between shrink-0 rounded-t-[2.5rem] relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/20"><Waves size={28} strokeWidth={2.5} /></div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Fisherfolk Registry</h2>
              <p className="text-[11px] text-white/80 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">ID: {formData.system_id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-full text-white transition-all active:scale-95 cursor-pointer relative z-10"><X size={24} /></button>
        </div>

        {/* STEPPER NAV */}
        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 overflow-x-auto custom-scrollbar shadow-sm">
           <StepPill active={activeTab} id="personal" icon={<User size={14}/>} label="1. Personal" />
           <StepDivider />
           <StepPill active={activeTab} id="fishery" icon={<Anchor size={14}/>} label="2. Fishery" />
           {(formData.fisher_type === 'Aquaculture Operator' || activeTab === 'aquaculture') && (
             <><StepDivider /><StepPill active={activeTab} id="aquaculture" icon={<Sprout size={14}/>} label="2b. AquaFarm" /></>
           )}
           <StepDivider /><StepPill active={activeTab} id="compliance" icon={<FileBadge size={14}/>} label="3. Permits" />
           <StepDivider /><StepPill active={activeTab} id="assistance" icon={<ClipboardList size={14}/>} label="4. Programs" />
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900 relative">
            
            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                <SectionHeader icon={<User/>} title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <FormInput label="First Name" required placeholder="e.g. Juan" value={formData.first_name} onChange={(v:string)=>handleChange('first_name', v)} error={errors.first_name} />
                   <FormInput label="Middle Name" placeholder="e.g. Santos" value={formData.middle_name} onChange={(v:string)=>handleChange('middle_name', v)} />
                   <FormInput label="Last Name" required placeholder="e.g. Dela Cruz" value={formData.last_name} onChange={(v:string)=>handleChange('last_name', v)} error={errors.last_name} />
                   <div className="md:col-span-1"><FormInput label="Suffix" placeholder="e.g. Jr." value={formData.suffix} onChange={(v:string)=>handleChange('suffix', v)} /></div>
                   <FormSelect label="Gender" required value={formData.gender} onChange={(v:string)=>handleChange('gender', v)} options={['Male', 'Female']} error={errors.gender} />
                   <div className="flex gap-4">
                      <FormInput type="date" label="Date of Birth" required value={formData.dob} onChange={(v:string)=>handleChange('dob', v)} error={errors.dob} />
                      <div className="w-24 shrink-0 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1 block">Age</label>
                        <div className="h-11.5 flex items-center justify-center bg-gray-50 dark:bg-slate-800 border border-gray-200 rounded-xl font-black text-primary shadow-sm">{age || '-'}</div>
                      </div>
                   </div>
                   <FormSelect label="Civil Status" required value={formData.civil_status} onChange={(v:string)=>handleChange('civil_status', v)} options={['Single', 'Married', 'Widowed', 'Separated', 'Common Law']} error={errors.civil_status} />
                   <FormSelect label="Education" value={formData.education} onChange={(v:string)=>handleChange('education', v)} options={['Elementary', 'High School', 'College', 'Vocational', 'None']} />
                   <FormInput label="Contact Number" placeholder="e.g. 0917..." value={formData.contact_no} onChange={(v:string)=>handleChange('contact_no', v)} icon={<Phone size={14}/>} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-2">
                        <label className={cn("text-[10px] font-black uppercase flex items-center gap-1.5 ml-1", errors.barangay_id ? "text-red-500" : "text-gray-500")}>
                            <MapPin size={12} className={errors.barangay_id ? "text-red-500" : "text-primary"}/> Barangay <span className="text-red-500">*</span>
                        </label>
                        <SearchableBrgyPicker value={formData.barangay_id} open={openResBrgy} setOpen={setOpenResBrgy} barangays={barangays} onSelect={(id:string) => handleChange('barangay_id', id)} error={errors.barangay_id} />
                        {errors.barangay_id && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.barangay_id}</p>}
                    </div>
                    <FormInput label="Complete Address" required placeholder="e.g. Purok 2..." value={formData.address_details} onChange={(v:string)=>handleChange('address_details', v)} error={errors.address_details} />
                </div>
              </div>
            )}

            {activeTab === 'fishery' && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 fade-in">
                 <div>
                    <SectionHeader icon={<Waves/>} title="Fishery Profile" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <FormSelect label="Classification Type" required value={formData.fisher_type} onChange={(v:string)=>handleChange('fisher_type', v)} options={['Municipal Fisher', 'Commercial Fisher', 'Aquaculture Operator', 'Fish Vendor', 'Fish Processor', 'Gleaner']} error={errors.fisher_type} />
                       <FormInput type="number" label="Years in Fishing" required placeholder="e.g. 10" value={formData.years_in_fishing} onChange={(v:string)=>handleChange('years_in_fishing', v)} error={errors.years_in_fishing} />
                       <ToggleCard label="Main Livelihood?" checked={formData.is_main_livelihood} onChange={(c: boolean)=>handleChange('is_main_livelihood', c)} />
                       <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <ToggleCard label="Member of Cooperatives?" checked={formData.org_member} onChange={(c: boolean)=>handleChange('org_member', c)} />
                          {formData.org_member && <FormInput label="Name of Cooperative" required placeholder="e.g. Coop Name" value={formData.org_name} onChange={(v:string)=>handleChange('org_name', v)} icon={<Building2 size={14}/>} error={errors.org_name} />}
                       </div>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                    <SectionHeader icon={<Ship/>} title="Boat & Gear Details" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <FormInput label="Boat Name" placeholder="e.g. MB Princess" value={formData.boat_name} onChange={(v:string)=>handleChange('boat_name', v)} />
                       <FormSelect label="Boat Type" required value={formData.boat_type} onChange={(v:string)=>handleChange('boat_type', v)} options={['Motorized', 'Non-Motorized', 'No Boat']} error={errors.boat_type} />
                       <FormInput label="Registration Number" placeholder="e.g. GNG-001" value={formData.registration_no} onChange={(v:string)=>handleChange('registration_no', v)} />
                       <FormInput label="Engine Horsepower (HP)" placeholder="e.g. 16HP" value={formData.engine_hp} onChange={(v:string)=>handleChange('engine_hp', v)} icon={<Ruler size={14}/>} />
                       <FormInput label="Fishing Gear Type" required placeholder="e.g. Net / Line" value={formData.gear_type} onChange={(v:string)=>handleChange('gear_type', v)} error={errors.gear_type} />
                       <FormInput type="number" label="No. of Gear Units" placeholder="e.g. 2" value={formData.gear_units} onChange={(v:string)=>handleChange('gear_units', v)} />
                       <div className="md:col-span-3"><FormInput label="Primary Fishing Area" placeholder="Fishing grounds..." value={formData.fishing_area} onChange={(v:string)=>handleChange('fishing_area', v)} icon={<MapPin size={14}/>} /></div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'aquaculture' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                 <SectionHeader icon={<Sprout/>} title="Aquaculture Monitoring" />
                 <div className="p-8 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                    <FormInput label="Farm / Site Name" required placeholder="Farm Name" value={formData.farm_name} onChange={(v:string)=>handleChange('farm_name', v)} error={errors.farm_name} />
                    <FormInput label="Owner / Operator" required placeholder="Owner Name" value={formData.farm_owner} onChange={(v:string)=>handleChange('farm_owner', v)} error={errors.farm_owner} />
                    <FormInput label="Specific Location" required placeholder="Location" value={formData.farm_location} onChange={(v:string)=>handleChange('farm_location', v)} icon={<MapPin size={14}/>} error={errors.farm_location} />
                    <FormSelect label="Facility Type" required value={formData.farm_type} onChange={(v:string)=>handleChange('farm_type', v)} options={['Fish Pond', 'Fish Cage', 'Fish Pen', 'Seaweed Farm']} error={errors.farm_type} />
                    <FormInput label="Area Size (Sqm/Ha)" required placeholder="e.g. 500 sqm" value={formData.farm_size} onChange={(v:string)=>handleChange('farm_size', v)} icon={<Ruler size={14}/>} error={errors.farm_size} />
                    <FormInput label="Species Cultured" required placeholder="Species" value={formData.species_cultured} onChange={(v:string)=>handleChange('species_cultured', v)} error={errors.species_cultured} />
                 </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                 <SectionHeader icon={<FileBadge/>} title="Permits & Compliance" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl space-y-5 border border-gray-200 shadow-sm">
                       <h4 className="text-xs font-black uppercase text-primary mb-4 flex items-center gap-2"><FileBadge size={16}/> License Details</h4>
                       <FormInput label="Fishing Permit No." placeholder="Permit ID" value={formData.permit_no} onChange={(v:string)=>handleChange('permit_no', v)} />
                       <div className="grid grid-cols-2 gap-5">
                          <FormInput type="date" label="Date Issued" value={formData.permit_date_issued} onChange={(v:string)=>handleChange('permit_date_issued', v)} />
                          <FormInput type="date" label="Expiry Date" value={formData.permit_expiry} onChange={(v:string)=>handleChange('permit_expiry', v)} />
                       </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl space-y-5 border border-gray-200 shadow-sm">
                       <h4 className="text-xs font-black uppercase text-primary mb-4 flex items-center gap-2"><Check size={16}/> Status & Verification</h4>
                       <FormSelect label="Inspection Status" required value={formData.inspection_status} onChange={(v:string)=>handleChange('inspection_status', v)} options={['Passed', 'Pending', 'Failed', 'Needs Renewal']} error={errors.inspection_status} />
                       <FormSelect label="System Account Status" required value={formData.status} onChange={(v:string)=>handleChange('status', v)} options={['active', 'inactive']} error={errors.status} />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'assistance' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                 <SectionHeader icon={<ClipboardList/>} title="Program Tracking" />
                 <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/60 p-8 rounded-3xl shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormInput label="Program Name" placeholder="e.g. BFAR Program" value={formData.beneficiary_program} onChange={(v:string)=>handleChange('beneficiary_program', v)} />
                       <FormSelect label="Assistance Type" required={!!formData.beneficiary_program} value={formData.assistance_type} onChange={(v:string)=>handleChange('assistance_type', v)} options={['Fingerlings', 'Gear', 'Engine', 'Financial', 'Fuel']} error={errors.assistance_type} />
                       <FormInput type="date" label="Date Released" value={formData.date_released} onChange={(v:string)=>handleChange('date_released', v)} />
                       <FormInput label="Quantity / Amount" placeholder="Amount" value={formData.quantity} onChange={(v:string)=>handleChange('quantity', v)} />
                       <div className="md:col-span-2"><FormSelect label="Funding Source" required={!!formData.beneficiary_program} value={formData.funding_source} onChange={(v:string)=>handleChange('funding_source', v)} options={['City Agriculture', 'BFAR', 'Provincial', 'NGO']} error={errors.funding_source} /></div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 shrink-0 flex items-center justify-between gap-4 rounded-b-[2.5rem]">
             <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-2xl font-black uppercase text-[11px] text-gray-500 hover:text-gray-700 transition-all cursor-pointer">Cancel</button>
             <div className="flex items-center gap-3">
                {activeTab !== 'personal' && <button type="button" onClick={handleBack} className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 text-gray-600 rounded-2xl font-black uppercase text-[11px] transition-all hover:bg-gray-50 hover:-translate-y-0.5 flex items-center gap-2 shadow-sm cursor-pointer"><ArrowLeft size={16} /> Back</button>}
                {activeTab !== 'assistance' ? (
                    <button key="btn-next" type="button" onClick={handleNext} className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-[11px] tracking-wide shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border border-primary/20">Next Step <ArrowRight size={16} /></button>
                ) : (
                    <button key="btn-submit" type="submit" disabled={isSaving} className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-wide shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 flex items-center gap-2 cursor-pointer border border-emerald-400">
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Complete Registration
                    </button>
                )}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StepPill = ({ active, id, icon, label }: any) => {
    const isActive = active === id;
    return <div className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm", isActive ? "bg-primary text-white scale-105" : "bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800")}>{icon} {label}</div>;
};

const StepDivider = () => <div className="h-0.5 w-6 bg-gray-200 dark:bg-slate-800 rounded-full shrink-0" />;

const SectionHeader = ({ icon, title, subtitle }: any) => (
  <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-primary/10 text-primary rounded-2xl">{icon}</div><div><h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">{title}</h3>{subtitle && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}</div></div>
);

const FormInput = ({ label, value, onChange, type = "text", required, placeholder, icon, error }: any) => (
  <div className="space-y-2 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1.5", error ? "text-red-500" : "text-gray-500")}>{icon} {label} {required && <span className="text-red-500">*</span>}</label>
    <input type={type} placeholder={placeholder} className={cn("w-full h-11.5 px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold outline-none transition-all shadow-sm", error ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/20 text-red-600" : "border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-700 dark:text-slate-200")} value={value} onChange={(e) => onChange(e.target.value)} />
    {error && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const FormSelect = ({ label, value, onChange, options, required, error }: any) => (
  <div className="space-y-2 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1", error ? "text-red-500" : "text-gray-500")}>{label} {required && <span className="text-red-500">*</span>}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full h-11.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold shadow-sm transition-all", error ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/20" : "border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary")}>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 z-200">
        {options.map((opt: string) => (<SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">{opt}</SelectItem>))}
      </SelectContent>
    </Select>
    {error && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const SearchableBrgyPicker = ({ value, open, setOpen, barangays, onSelect, error }: any) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" className={cn("w-full h-11.5 flex items-center justify-between px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all", error ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/20" : "border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary")}>
        <span className="uppercase truncate">{value ? barangays.find((b: any) => b.id.toString() === value)?.name : "Select Barangay..."}</span>
        <ChevronsUpDown className={cn("h-4 w-4", error ? "text-red-500" : "opacity-40")} />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 rounded-2xl shadow-2xl w-[320px]" align="start">
      <Command>
        <CommandInput placeholder="Search Barangay..." className="h-12 text-xs font-bold uppercase border-none focus:ring-0" />
        <CommandList className="max-h-60 custom-scrollbar">
          <CommandEmpty className="py-6 text-center text-[10px] font-bold uppercase">No records found.</CommandEmpty>
          <CommandGroup>
            {barangays.map((b: any) => (<CommandItem key={b.id} value={b.name} onSelect={() => { onSelect(b.id.toString()); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer aria-selected:bg-primary aria-selected:text-white transition-colors">{b.name}<Check className={cn("ml-auto h-4 w-4", value === b.id.toString() ? "opacity-100" : "opacity-0")} /></CommandItem>))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

const ToggleCard = ({ label, checked, onChange }: any) => (
  <div className="h-11.5 mt-6 bg-white dark:bg-slate-900 px-4 rounded-xl flex items-center justify-between border border-gray-200 dark:border-slate-700 shadow-sm"><label className="text-[10px] font-black text-gray-500 uppercase">{label}</label><Switch type="button" className="data-[state=checked]:bg-primary" checked={checked} onCheckedChange={onChange} /></div>
);

export default FisherfolkDialog;