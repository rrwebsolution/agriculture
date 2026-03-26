import React, { useState, useEffect } from 'react';
import { 
  X, Check, Loader2, User, Phone, ArrowRight, ArrowLeft, Plus, Trash2,
  MapPin, ChevronsUpDown, Waves, Ship, Anchor, FileBadge, 
  ClipboardList, Sprout, Building2, Ruler, Save, AlertCircle
} from 'lucide-react';
import axios from '../../../../plugin/axios';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../../components/ui/select';
import { cn } from '.././../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';
import { Switch } from '../../../../components/ui/switch';

interface FisherfolkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any, mode: 'add' | 'edit') => void;
  fisher: any | null;
  barangays: any[]; 
  cooperatives: any[]; // 🌟 Gikan sa Redux Container
}

const initialFormState = {
  system_id: '', 
  first_name: '', middle_name: '', last_name: '', suffix: '',
  gender: '', dob: '', civil_status: '',
  barangay_id: '', address_details: '', contact_no: '', education: '',
  
  fisher_type: '', is_main_livelihood: false, years_in_fishing: '', org_member: false, 
  
  cooperative_id: [] as string[], 
  boats_list: [{ boat_name: '', boat_type: '', engine_hp: '', registration_no: '', gear_type: '', gear_units: '', fishing_area: '' }] as any[],
  assistances_list: [] as any[], 

  farm_name: '', farm_owner: '', farm_location: '', farm_type: '', farm_size: '', species_cultured: '',
  
  permit_no: '', permit_date_issued: '', permit_expiry: '', inspection_status: 'Passed', status: 'active'
};

const FISHER_TYPES = ['Municipal Fisher', 'Commercial Fisher', 'Aquaculture Operator', 'Fish Vendor', 'Fish Processor', 'Gleaner'];

const FisherfolkDialog: React.FC<FisherfolkDialogProps> = ({ isOpen, onClose, onUpdate, fisher, barangays = [], cooperatives = [] }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [age, setAge] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [openResBrgy, setOpenResBrgy] = useState(false);
  const [openFisherType, setOpenFisherType] = useState(false);
  const [openOrgName, setOpenOrgName] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({}); 
  const [formData, setFormData] = useState(initialFormState);

  const isEdit = !!fisher;

  // 🌟 Calculate Age automatically from DOB
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

  // 🌟 Populate form on open (Add or Edit)
  useEffect(() => {
    if (fisher && isOpen) {
      const formatDropdownValue = (val: any, options: string[]) => {
        if (!val) return '';
        const strVal = String(val).trim();
        if (options.includes(strVal)) return strVal;
        const match = options.find(opt => opt.toLowerCase() === strVal.toLowerCase());
        return match || ''; 
      };

      setFormData({ 
        ...initialFormState,
        ...fisher, 
        gender: formatDropdownValue(fisher.gender, ['Male', 'Female']),
        civil_status: formatDropdownValue(fisher.civil_status, ['Single', 'Married', 'Widowed', 'Separated', 'Common Law']),
        education: formatDropdownValue(fisher.education, ['Elementary', 'High School', 'College', 'Vocational', 'None']),
        fisher_type: formatDropdownValue(fisher.fisher_type, FISHER_TYPES),
        farm_type: formatDropdownValue(fisher.farm_type, ['Fish Pond', 'Fish Cage', 'Fish Pen', 'Seaweed Farm']),
        inspection_status: formatDropdownValue(fisher.inspection_status, ['Passed', 'Pending', 'Failed', 'Needs Renewal']),
        status: formatDropdownValue(fisher.status, ['active', 'inactive']),
        is_main_livelihood: fisher.is_main_livelihood == 1 || fisher.is_main_livelihood === true,
        org_member: fisher.org_member == 1 || fisher.org_member === true,
        barangay_id: fisher.barangay?.id?.toString() || fisher.barangay_id?.toString() || '',
        
        cooperative_id: Array.isArray(fisher.cooperative_id) ? fisher.cooperative_id.map(String) : [],
        boats_list: Array.isArray(fisher.boats_list) && fisher.boats_list.length > 0 ? fisher.boats_list : initialFormState.boats_list,
        assistances_list: Array.isArray(fisher.assistances_list) ? fisher.assistances_list : [],
      });
      setErrors({});
    } else if (isOpen) {
      const generatedId = `FF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({ ...initialFormState, system_id: generatedId });
      setActiveTab('personal'); 
      setErrors({});
    }
  }, [fisher, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  const toggleCoop = (id: string) => {
    setFormData(prev => {
        const list = prev.cooperative_id.includes(id) ? prev.cooperative_id.filter(c => c !== id) : [...prev.cooperative_id, id];
        return { ...prev, cooperative_id: list };
    });
    if (errors.cooperative_id) setErrors(prev => ({ ...prev, cooperative_id: '' }));
  };

  const addBoat = () => handleChange('boats_list', [...formData.boats_list, { boat_name: '', boat_type: '', engine_hp: '', registration_no: '', gear_type: '', gear_units: '', fishing_area: '' }]);
  const updateBoat = (index: number, field: string, value: string) => {
      const updated = [...formData.boats_list];
      updated[index][field] = value;
      handleChange('boats_list', updated);
      const errorKey = `boat_${index}_${field}`;
      if (errors[errorKey]) {
          setErrors(prev => { const newE = { ...prev }; delete newE[errorKey]; return newE; });
      }
  };
  const removeBoat = (index: number) => handleChange('boats_list', formData.boats_list.filter((_, i) => i !== index));

  const addAssistance = () => handleChange('assistances_list', [...formData.assistances_list, { beneficiary_program: '', assistance_type: '', date_released: '', quantity: '', funding_source: '' }]);
  const updateAssistance = (index: number, field: string, value: string) => {
      const updated = [...formData.assistances_list];
      updated[index][field] = value;
      handleChange('assistances_list', updated);
  };
  const removeAssistance = (index: number) => handleChange('assistances_list', formData.assistances_list.filter((_, i) => i !== index));

  const validateCurrentTab = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'personal') {
      if (!formData.first_name) newErrors.first_name = 'Required';
      if (!formData.last_name) newErrors.last_name = 'Required';
      if (!formData.gender) newErrors.gender = 'Required';
      if (!formData.dob) newErrors.dob = 'Required';
      if (!formData.civil_status) newErrors.civil_status = 'Required';
      if (!formData.barangay_id) newErrors.barangay_id = 'Required';
      if (!formData.address_details) newErrors.address_details = 'Required';
    } 
    else if (activeTab === 'fishery') {
      if (!formData.fisher_type) newErrors.fisher_type = 'Required';
      if (!formData.years_in_fishing) newErrors.years_in_fishing = 'Required';
      if (formData.org_member && formData.cooperative_id.length === 0) newErrors.cooperative_id = 'Select at least 1 association';
      
      // VALIDATE BOATS
      if (formData.boats_list.length > 0) {
          formData.boats_list.forEach((boat, index) => {
              if (!boat.boat_type) newErrors[`boat_${index}_boat_type`] = 'Required';
              if (!boat.gear_type) newErrors[`boat_${index}_gear_type`] = 'Required';
          });
      }
    }
    else if (activeTab === 'aquaculture') {
      if (!formData.farm_name) newErrors.farm_name = 'Required';
      if (!formData.farm_owner) newErrors.farm_owner = 'Required';
      if (!formData.farm_location) newErrors.farm_location = 'Required';
      if (!formData.farm_type) newErrors.farm_type = 'Required';
      if (!formData.farm_size) newErrors.farm_size = 'Required';
      if (!formData.species_cultured) newErrors.species_cultured = 'Required';
    }
    else if (activeTab === 'compliance') {
      if (!formData.permit_no) newErrors.permit_no = 'Required';
      if (!formData.permit_date_issued) newErrors.permit_date_issued = 'Required';
      if (!formData.permit_expiry) newErrors.permit_expiry = 'Required';
      if (!formData.inspection_status) newErrors.inspection_status = 'Required';
      if (!formData.status) newErrors.status = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!validateCurrentTab()) {
        toast.error("Please fill in required fields.");
        return;
    }
    if (activeTab === 'personal') setActiveTab('fishery');
    else if (activeTab === 'fishery') setActiveTab(formData.fisher_type === 'Aquaculture Operator' ? 'aquaculture' : 'compliance');
    else if (activeTab === 'aquaculture') setActiveTab('compliance');
    else if (activeTab === 'compliance') setActiveTab('assistance');
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setErrors({});
    if (activeTab === 'fishery') setActiveTab('personal');
    else if (activeTab === 'aquaculture') setActiveTab('fishery');
    else if (activeTab === 'compliance') setActiveTab(formData.fisher_type === 'Aquaculture Operator' ? 'aquaculture' : 'fishery');
    else if (activeTab === 'assistance') setActiveTab('compliance');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentTab()) return;

    setIsSaving(true);
    try {
      const payload = { ...formData, age };
      let response;
      if (isEdit) {
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
              <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{isEdit ? "Update Registry" : "Fisherfolk Registry"}</h2>
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
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  {/* ROW 1: NAMES */}
                  <FormInput label="First Name" required placeholder="e.g. Juan" value={formData.first_name} onChange={(v:string)=>handleChange('first_name', v)} error={errors.first_name} />
                  <FormInput label="Middle Name" placeholder="e.g. Santos" value={formData.middle_name} onChange={(v:string)=>handleChange('middle_name', v)} />
                  <FormInput label="Last Name" required placeholder="e.g. Dela Cruz" value={formData.last_name} onChange={(v:string)=>handleChange('last_name', v)} error={errors.last_name} />
                  <FormInput label="Suffix" placeholder="e.g. Jr." value={formData.suffix} onChange={(v:string)=>handleChange('suffix', v)} />
                  
                  {/* ROW 2: GENDER (1), DOB (2), CIVIL STATUS (1) - TUPONG NA SILA */}
                  <div className="md:col-span-1">
                      <FormSelect label="Gender" required value={formData.gender} onChange={(v:string)=>handleChange('gender', v)} options={['Male', 'Female']} error={errors.gender} />
                  </div>
                  
                  {/* 🌟 NATIVE DATE INPUT BALIK */}
                  <div className="md:col-span-2">
                      <FormInput 
                        type="date" 
                        label="Date of Birth" 
                        required 
                        value={formData.dob} 
                        onChange={(v:string)=>handleChange('dob', v)} 
                        error={errors.dob} 
                      />
                  </div>

                  <div className="md:col-span-1">
                      <FormSelect label="Civil Status" required value={formData.civil_status} onChange={(v:string)=>handleChange('civil_status', v)} options={['Single', 'Married', 'Widowed', 'Separated', 'Common Law']} error={errors.civil_status} />
                  </div>

                  {/* ROW 3: CONTACT & EDUCATION */}
                  <div className="md:col-span-2">
                      <FormInput label="Contact Number" placeholder="e.g. 0917..." value={formData.contact_no} onChange={(v:string)=>handleChange('contact_no', v)} icon={<Phone size={14}/>} />
                  </div>
                  <div className="md:col-span-2">
                      <FormSelect label="Education" value={formData.education} onChange={(v:string)=>handleChange('education', v)} options={['Elementary', 'High School', 'College', 'Vocational', 'None']} />
                  </div>
                </div>

                {/* ROW 4: ADDRESS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-2">
                        <label className={cn("text-[10px] font-black uppercase flex items-center gap-1.5 ml-1", errors.barangay_id ? "text-red-500" : "text-gray-500")}>
                            <MapPin size={12} className={errors.barangay_id ? "text-red-500" : "text-primary"}/> Barangay <span className="text-red-500">*</span>
                        </label>
                        <SearchablePicker 
                            value={formData.barangay_id} 
                            open={openResBrgy} 
                            setOpen={setOpenResBrgy} 
                            options={barangays?.map(b => ({ id: b.id.toString(), name: b.name })) || []} 
                            onSelect={(id:string) => handleChange('barangay_id', id)} 
                            error={errors.barangay_id}
                            placeholder="Select Barangay..."
                            searchPlaceholder="Search barangay..."
                        />
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
                       
                       <div className="space-y-2 w-full">
                           <label className={cn("text-[10px] font-black uppercase flex items-center gap-1.5 ml-1", errors.fisher_type ? "text-red-500" : "text-gray-500")}>
                               Classification Type <span className="text-red-500">*</span>
                           </label>
                           <SearchablePicker
                               value={formData.fisher_type}
                               open={openFisherType}
                               setOpen={setOpenFisherType}
                               options={FISHER_TYPES.map(t => ({ id: t, name: t }))}
                               onSelect={(val: string) => handleChange('fisher_type', val)}
                               error={errors.fisher_type}
                               placeholder="Select Classification..."
                               searchPlaceholder="Search type..."
                           />
                           {errors.fisher_type && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.fisher_type}</p>}
                       </div>

                       <FormInput type="number" label="Years in Fishing" required placeholder="e.g. 10" value={formData.years_in_fishing} onChange={(v:string)=>handleChange('years_in_fishing', v)} error={errors.years_in_fishing} />
                       
                       <ToggleCard 
                           label="Main Livelihood?" 
                           checked={formData.is_main_livelihood} 
                           onChange={(c: boolean)=>handleChange('is_main_livelihood', c)} 
                           desc="Is fishing the primary source of income?"
                       />
                       
                       <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-t border-gray-100 dark:border-slate-800 pt-6">
                          <ToggleCard 
                              label="Member of Association?" 
                              checked={formData.org_member} 
                              onChange={(c: boolean)=>handleChange('org_member', c)} 
                              desc="Is the fisherfolk registered in an organization?"
                          />
                          
                          {formData.org_member && (
                            <div className="space-y-2 w-full animate-in fade-in slide-in-from-left-4 pt-1">
                               <label className={cn("text-[10px] font-black uppercase flex items-center gap-1.5 ml-1", errors.cooperative_id ? "text-red-500" : "text-gray-500")}>
                                   <Building2 size={12} className={errors.cooperative_id ? "text-red-500" : "text-primary"} /> Select Associations <span className="text-red-500">*</span>
                               </label>
                               
                               <MultiSearchablePicker
                                   selectedValues={formData.cooperative_id}
                                   open={openOrgName}
                                   setOpen={setOpenOrgName}
                                   options={cooperatives?.map(c => ({ id: c.id.toString(), name: c.name })) || []}
                                   onSelect={(val: string) => toggleCoop(val)}
                                   error={errors.cooperative_id}
                                   placeholder="Select associations..."
                                   searchPlaceholder="Search association..."
                               />
                               {errors.cooperative_id && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.cooperative_id}</p>}
                            </div>
                          )}
                       </div>

                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <SectionHeader icon={<Ship/>} title="Boat & Gear Details" subtitle="Add multiple vessels if applicable" />
                        <button type="button" onClick={addBoat} className="px-5 py-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center gap-2 transition-all cursor-pointer">
                            <Plus size={14}/> Add Boat
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        {formData.boats_list.map((boat, idx) => (
                            <div key={idx} className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Ship size={60}/></div>
                                
                                {formData.boats_list.length > 1 && (
                                  <button type="button" onClick={() => removeBoat(idx)} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all cursor-pointer z-10">
                                      <Trash2 size={16}/>
                                  </button>
                                )}
                                
                                <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-6 flex items-center gap-2"><Ship size={14}/> Vessel #{idx + 1}</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                   <FormInput label="Boat Name" placeholder="e.g. MB Princess" value={boat.boat_name} onChange={(v:string)=>updateBoat(idx, 'boat_name', v)} />
                                   
                                   <FormSelect 
                                      label="Boat Type" required 
                                      value={boat.boat_type} onChange={(v:string)=>updateBoat(idx, 'boat_type', v)} 
                                      options={['Motorized', 'Non-Motorized', 'No Boat']} 
                                      error={errors[`boat_${idx}_boat_type`]} 
                                   />
                                   
                                   <FormInput label="Registration Number" placeholder="e.g. GNG-001" value={boat.registration_no} onChange={(v:string)=>updateBoat(idx, 'registration_no', v)} />
                                   <FormInput label="Engine Horsepower (HP)" placeholder="e.g. 16HP" value={boat.engine_hp} onChange={(v:string)=>updateBoat(idx, 'engine_hp', v)} icon={<Ruler size={14}/>} />
                                   
                                   <FormInput 
                                      label="Fishing Gear Type" required placeholder="e.g. Net / Line" 
                                      value={boat.gear_type} onChange={(v:string)=>updateBoat(idx, 'gear_type', v)} 
                                      error={errors[`boat_${idx}_gear_type`]} 
                                   />
                                   
                                   <FormInput type="number" label="No. of Gear Units" placeholder="e.g. 2" value={boat.gear_units} onChange={(v:string)=>updateBoat(idx, 'gear_units', v)} />
                                   <div className="md:col-span-3"><FormInput label="Primary Fishing Area" placeholder="Fishing grounds..." value={boat.fishing_area} onChange={(v:string)=>updateBoat(idx, 'fishing_area', v)} icon={<MapPin size={14}/>} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'aquaculture' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                 <SectionHeader icon={<Sprout/>} title="Aquaculture Monitoring" />
                 <div className="p-8 bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
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
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl space-y-5 border border-gray-200 dark:border-slate-800 shadow-sm">
                       <h4 className="text-xs font-black uppercase text-primary mb-4 flex items-center gap-2"><FileBadge size={16}/> License Details</h4>
                       
                       <FormInput label="Fishing Permit No." required placeholder="Permit ID" value={formData.permit_no} onChange={(v:string)=>handleChange('permit_no', v)} error={errors.permit_no} />
                       <div className="grid grid-cols-2 gap-5">
                          <FormInput type="date" label="Date Issued" required value={formData.permit_date_issued} onChange={(v:string)=>handleChange('permit_date_issued', v)} error={errors.permit_date_issued} />
                          <FormInput type="date" label="Expiry Date" required value={formData.permit_expiry} onChange={(v:string)=>handleChange('permit_expiry', v)} error={errors.permit_expiry} />
                       </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl space-y-5 border border-gray-200 dark:border-slate-800 shadow-sm">
                       <h4 className="text-xs font-black uppercase text-primary mb-4 flex items-center gap-2"><Check size={16}/> Status & Verification</h4>
                       <FormSelect label="Inspection Status" required value={formData.inspection_status} onChange={(v:string)=>handleChange('inspection_status', v)} options={['Passed', 'Pending', 'Failed', 'Needs Renewal']} error={errors.inspection_status} />
                       <FormSelect label="System Account Status" required value={formData.status} onChange={(v:string)=>handleChange('status', v)} options={['active', 'inactive']} error={errors.status} />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'assistance' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 fade-in">
                 <div className="flex items-center justify-between mb-6">
                    <SectionHeader icon={<ClipboardList/>} title="Program Tracking" subtitle="Log multiple assistances received" />
                    <button type="button" onClick={addAssistance} className="px-5 py-2.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-xl text-xs font-black uppercase hover:bg-yellow-100 dark:hover:bg-yellow-500/20 flex items-center gap-2 transition-all cursor-pointer">
                        <Plus size={14}/> Add Record
                    </button>
                 </div>
                 
                 <div className="space-y-6">
                    {formData.assistances_list.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                            <ClipboardList size={32} className="mx-auto text-gray-300 mb-2"/>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No programs recorded yet</p>
                        </div>
                    ) : formData.assistances_list.map((asst: any, idx: number) => (
                        <div key={idx} className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200/60 dark:border-yellow-700/50 p-8 rounded-3xl shadow-sm relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><ClipboardList size={60}/></div>
                            <button type="button" onClick={() => removeAssistance(idx)} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all cursor-pointer z-10">
                                <Trash2 size={16}/>
                            </button>
                            <h4 className="text-[10px] font-black uppercase text-yellow-600 dark:text-yellow-500 tracking-widest mb-6 flex items-center gap-2"><ClipboardList size={14}/> Record #{idx + 1}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                               <FormInput label="Program Name" placeholder="e.g. BFAR Program" value={asst.beneficiary_program} onChange={(v:string)=>updateAssistance(idx, 'beneficiary_program', v)} />
                               <FormSelect label="Assistance Type" value={asst.assistance_type} onChange={(v:string)=>updateAssistance(idx, 'assistance_type', v)} options={['Fingerlings', 'Gear', 'Engine', 'Financial', 'Fuel']} />
                               <FormInput type="date" label="Date Released" value={asst.date_released} onChange={(v:string)=>updateAssistance(idx, 'date_released', v)} />
                               <FormInput label="Quantity / Amount" placeholder="Amount" value={asst.quantity} onChange={(v:string)=>updateAssistance(idx, 'quantity', v)} />
                               <div className="md:col-span-2"><FormSelect label="Funding Source" value={asst.funding_source} onChange={(v:string)=>updateAssistance(idx, 'funding_source', v)} options={['City Agriculture', 'BFAR', 'Provincial', 'NGO']} /></div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* FOOTER NAV */}
          <div className="p-6 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-4 rounded-b-[2.5rem]">
             <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-2xl font-black uppercase text-[11px] text-gray-500 hover:text-red-500 transition-all cursor-pointer">Cancel</button>
             <div className="flex items-center gap-3">
                {activeTab !== 'personal' && <button type="button" onClick={handleBack} className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-black uppercase text-[11px] transition-all hover:bg-gray-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 flex items-center gap-2 shadow-sm cursor-pointer"><ArrowLeft size={16} /> Back</button>}
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

const StepPill = ({ active, id, icon, label }: { active: string, id: string, icon: React.ReactNode, label: string }) => {
    const isActive = active === id;
    return <div className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm shrink-0", isActive ? "bg-primary text-white scale-105" : "bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800")}>{icon} {label}</div>;
};

const StepDivider = () => <div className="h-0.5 w-6 bg-gray-200 dark:bg-slate-800 rounded-full shrink-0" />;

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-primary/10 text-primary rounded-2xl">{icon}</div><div><h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">{title}</h3>{subtitle && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>}</div></div>
);

const FormInput = ({ label, value, onChange, type = "text", required, placeholder, icon, error }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string, icon?: React.ReactNode, error?: string }) => (
  <div className="space-y-2 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1.5", error ? "text-red-500" : "text-gray-500")}>{icon} {label} {required && <span className="text-red-500">*</span>}</label>
    <input type={type} placeholder={placeholder} className={cn("w-full h-11 px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold outline-none transition-all shadow-sm", error ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/20 text-red-600" : "border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-700 dark:text-slate-200")} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    {error && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const FormSelect = ({ label, value, onChange, options, required, error }: { label: string, value: string, onChange: (v: string) => void, options: string[], required?: boolean, error?: string }) => (
  <div className="space-y-2 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1 block", error ? "text-red-500" : "text-gray-500")}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Select key={value} value={value || ""} onValueChange={onChange}>
      <SelectTrigger className={cn(
        "w-full h-11 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold border shadow-sm transition-all",
        error ? "border-red-500" : "border-gray-200 dark:border-slate-800"
      )}>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 z-110">
        {options.map((opt: string) => (
          <SelectItem key={opt} value={opt} className="text-xs font-bold uppercase py-3 cursor-pointer">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const ToggleCard = ({ label, desc, checked, onChange }: { label: string, desc?: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="h-15 bg-white dark:bg-slate-900 px-4 rounded-xl flex items-center justify-between border border-gray-200 dark:border-slate-700 shadow-sm mt-5">
      <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase">{label}</label>
          {desc && <span className="text-[9px] font-bold text-gray-400 mt-0.5">{desc}</span>}
      </div>
      <Switch type="button" className="data-[state=checked]:bg-primary" checked={checked} onCheckedChange={onChange} />
  </div>
);

const SearchablePicker = ({ value, open, setOpen, options, onSelect, error, placeholder, searchPlaceholder }: { value: string, open: boolean, setOpen: (v: boolean) => void, options: { id: string, name: string }[], onSelect: (id: string) => void, error?: string, placeholder?: string, searchPlaceholder?: string }) => (
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" className={cn(
        "w-full h-11 flex items-center justify-between px-4 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all", 
        error ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/20" : "border border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary",
        !value ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
      )}>
        <span className="uppercase truncate">{value ? options?.find((o: any) => o.id === value)?.name : (placeholder || "Select...")}</span>
        <ChevronsUpDown className={cn("h-4 w-4 shrink-0", error ? "text-red-500" : "opacity-40")} />
      </button>
    </PopoverTrigger>
    <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl w-80" align="start">
      <Command>
        <CommandInput placeholder={searchPlaceholder || "Search..."} className="h-12 text-xs font-bold uppercase border-none focus:ring-0" />
        <CommandList className="max-h-60 custom-scrollbar">
          <CommandEmpty className="py-6 text-center text-[10px] font-bold uppercase text-gray-400">No records found.</CommandEmpty>
          <CommandGroup>
            {options?.map((o: any) => (
              <CommandItem key={o.id} value={o.name} onSelect={() => { onSelect(o.id); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer aria-selected:bg-primary aria-selected:text-white transition-colors">
                {o.name}
                <Check className={cn("ml-auto h-4 w-4", value === o.id ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

const MultiSearchablePicker = ({ selectedValues, open, setOpen, options, onSelect, error, placeholder, searchPlaceholder }: { selectedValues: string[], open: boolean, setOpen: (v: boolean) => void, options: { id: string, name: string }[], onSelect: (id: string) => void, error?: string, placeholder?: string, searchPlaceholder?: string }) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn(
          "w-full min-h-11 flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl cursor-pointer shadow-sm transition-all",
          error ? "border-2 border-red-500 focus-within:ring-4 focus-within:ring-red-500/20" : "border border-gray-200 dark:border-slate-700 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary"
        )}>
          {selectedValues.length === 0 ? (
            <span className="text-xs font-bold uppercase text-slate-400 pl-2">{placeholder || "Select..."}</span>
          ) : (
            selectedValues.map((id: string) => {
              const opt = options?.find((o: any) => o.id === id);
              return opt ? (
                <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-lg text-[10px] font-bold">
                  {opt.name}
                  <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(id); }} className="hover:text-red-500 ml-1"><X size={12}/></button>
                </span>
              ) : null;
            })
          )}
          <ChevronsUpDown className={cn("h-4 w-4 ml-auto mr-2 shrink-0", error ? "text-red-500" : "opacity-40")} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl w-80" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder || "Search..."} className="h-12 text-xs font-bold uppercase border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar">
            <CommandEmpty className="py-6 text-center text-[10px] font-bold uppercase text-gray-400">No records found.</CommandEmpty>
            <CommandGroup>
              {options?.map((o: any) => {
                const isSelected = selectedValues.includes(o.id);
                return (
                  <CommandItem key={o.id} value={o.name} onSelect={() => onSelect(o.id)} className={cn("text-xs font-bold uppercase py-3 px-4 cursor-pointer transition-colors", isSelected && "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400")}>
                    <div className="flex items-center w-full">
                        {o.name}
                        {isSelected && <Check size={14} className="ml-auto text-blue-500" />}
                    </div>
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

export default FisherfolkDialog;