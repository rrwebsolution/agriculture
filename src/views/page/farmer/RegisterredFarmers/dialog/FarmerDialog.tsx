import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Loader2, User, Phone, ArrowRight, ArrowLeft,
  ChevronsUpDown, LandPlot, Sprout, 
  Ruler, Save, Fingerprint, Info, Check,
  ClipboardList, DollarSign, Plus, Trash2, AlertCircle, Briefcase, Building2, Upload, MapPinned
} from 'lucide-react';
import axios from '../../../../../plugin/axios';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './../../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from './../../../../../components/ui/command';
import { Switch } from './../../../../../components/ui/switch';
import { cn } from '.././../../../../lib/utils';
import { useAppSelector } from '../../../../../store/hooks';
import FarmLocationMap from '../FarmLocationMap';

interface FarmerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any, mode: 'add' | 'edit') => void;
  farmer: any | null;
}

const SOIL_TYPES = [
  'Clay', 'Clay Loam', 'Sandy Clay', 'Sandy Clay Loam',
  'Loam', 'Sandy Loam', 'Loamy Sand',
  'Silt', 'Silt Loam', 'Silty Clay', 'Silty Clay Loam',
  'Sandy', 'Peat', 'Gravelly Loam',
];
const TOPOGRAPHY_TYPES = ['Plain', 'Rolling', 'Sloping'];
const IRRIGATION_TYPES = ['Irrigated', 'Rainfed', 'Upland'];
const OWNERSHIP_TYPES = ['Owner', 'Tenant', 'Lease'];
const ASSISTANCE_TYPES = ['Seeds', 'Fertilizer', 'Equipment', 'Financial Aid', 'Livestock'];
const CUSTOM_SOIL_TYPES_STORAGE_KEY = 'farmer_custom_soil_types';
const CUSTOM_TOPOGRAPHY_TYPES_STORAGE_KEY = 'farmer_custom_topography_types';
const CUSTOM_IRRIGATION_TYPES_STORAGE_KEY = 'farmer_custom_irrigation_types';
const CUSTOM_OWNERSHIP_TYPES_STORAGE_KEY = 'farmer_custom_ownership_types';
const CUSTOM_ASSISTANCE_TYPES_STORAGE_KEY = 'farmer_custom_assistance_types';
const FARMER_DRAFT_STORAGE_KEY = 'draft_farmer_registry';

const getSavedOptionList = (storageKey: string, defaults: string[]) => {
  if (typeof window === 'undefined') return defaults;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return defaults;

    return [...defaults, ...saved.filter((item) => typeof item === 'string')]
      .reduce<string[]>((unique, item) => {
        const option = item.trim().replace(/\s+/g, ' ');
        if (option && !unique.some(existing => existing.toLowerCase() === option.toLowerCase())) {
          unique.push(option);
        }
        return unique;
      }, []);
  } catch {
    return defaults;
  }
};

const saveCustomOptionList = (storageKey: string, options: string[], defaults: string[]) => {
  if (typeof window === 'undefined') return;

  const customOptions = options.filter(
    item => !defaults.some(defaultOption => defaultOption.toLowerCase() === item.toLowerCase())
  );
  localStorage.setItem(storageKey, JSON.stringify(customOptions));
};

const createOptionAdder = (
  setOptions: React.Dispatch<React.SetStateAction<string[]>>,
  storageKey: string,
  defaults: string[],
) => (value: string) => {
  const option = value.trim().replace(/\s+/g, ' ');
  if (!option) return;

  setOptions(prev => {
    const existing = prev.find(item => item.toLowerCase() === option.toLowerCase());
    if (existing) return prev;

    const updated = [...prev, option];
    saveCustomOptionList(storageKey, updated, defaults);
    return updated;
  });

  return option;
};

const createOptionRemover = (
  setOptions: React.Dispatch<React.SetStateAction<string[]>>,
  storageKey: string,
  defaults: string[],
) => (value: string) => {
  const option = value.trim();
  if (!option || defaults.some(item => item.toLowerCase() === option.toLowerCase())) return;

  setOptions(prev => {
    const updated = prev.filter(item => item.toLowerCase() !== option.toLowerCase());
    saveCustomOptionList(storageKey, updated, defaults);
    return updated;
  });
};

const GUIDES = {
  topography: (
    <ul className="text-[10px] space-y-1.5 list-disc pl-3 text-slate-600 dark:text-slate-300">
      <li><b>Plain:</b> Patag nga yuta. Maayo para sa basak (rice).</li>
      <li><b>Rolling:</b> Bawod-bawod nga yuta. Maayo para sa mais, lubi, o saging.</li>
      <li><b>Sloping:</b> Bakilid o panga-pang. Maayo para sa mga kahoy o root crops.</li>
    </ul>
  ),
  irrigation: (
    <ul className="text-[10px] space-y-1.5 list-disc pl-3 text-slate-600 dark:text-slate-300">
      <li><b>Irrigated:</b> Naay linya sa tubig / NIA. Kanunay naay supply sa tubig.</li>
      <li><b>Rainfed:</b> Nagsalig ra sa ulan (tig-ulan lang makatanom og tarong).</li>
      <li><b>Upland:</b> Naa sa bukid. Walay direct water source.</li>
    </ul>
  ),
  ownership: (
    <ul className="text-[10px] space-y-1.5 list-disc pl-3 text-slate-600 dark:text-slate-300">
      <li><b>Owner:</b> Kaugalingong yuta (naay Titulo / DAR CLOA).</li>
      <li><b>Tenant:</b> Nag-uma sa yuta sa uban, unya tunga (o nay porsyento) sa abot.</li>
      <li><b>Lease:</b> Nag-abang sa yuta binulan/tuig (nagbayad og cash, dili abot).</li>
    </ul>
  )
};

const parseGPXCoordinates = (content: string) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(content, 'application/xml');
  const points = Array.from(xml.getElementsByTagName('trkpt'))
    .map((point) => ({
      lat: Number(point.getAttribute('lat')),
      lng: Number(point.getAttribute('lon')),
    }))
    .filter((point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lng));

  if (points.length >= 3) {
    return points;
  }

  const routePoints = Array.from(xml.getElementsByTagName('rtept'))
    .map((point) => ({
      lat: Number(point.getAttribute('lat')),
      lng: Number(point.getAttribute('lon')),
    }))
    .filter((point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lng));

  return routePoints;
};

const formatDecimalCurrencyInput = (value: any) => {
  const raw = String(value ?? '').replace(/,/g, '').replace(/[^\d.]/g, '');
  if (!raw) return '';

  const [wholePart, ...decimalParts] = raw.split('.');
  const decimalPart = decimalParts.join('').slice(0, 2);
  const formattedWhole = (wholePart || '0').replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (raw.includes('.')) {
    return `${formattedWhole}.${decimalPart}`;
  }

  return formattedWhole;
};

const normalizeDecimalCurrencyInput = (value: any) => {
  const numericValue = Number(String(value ?? '').replace(/,/g, ''));
  if (Number.isNaN(numericValue)) return '';
  return numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const FarmerDialog: React.FC<FarmerDialogProps> = ({ isOpen, onClose, onUpdate, farmer }) => {
  const barangays = useAppSelector((state) => state.farmer.barangays || []);
  const crops = useAppSelector((state) => state.farmer.crops || []);
  const cooperatives = useAppSelector((state) => state.farmer.cooperatives || []);
  const isActiveOrNoStatus = (record: any) => {
    const status = String(record?.status ?? '').trim().toLowerCase();
    return !status || status === 'active';
  };
  const activeBarangays = React.useMemo(() => barangays.filter((item: any) => isActiveOrNoStatus(item)), [barangays]);
  const activeCrops = React.useMemo(() => crops.filter((item: any) => isActiveOrNoStatus(item)), [crops]);
  const selectableCooperatives = React.useMemo(() => cooperatives || [], [cooperatives]);

  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topographyTypes, setTopographyTypes] = useState(() => getSavedOptionList(CUSTOM_TOPOGRAPHY_TYPES_STORAGE_KEY, TOPOGRAPHY_TYPES));
  const [irrigationTypes, setIrrigationTypes] = useState(() => getSavedOptionList(CUSTOM_IRRIGATION_TYPES_STORAGE_KEY, IRRIGATION_TYPES));
  const [ownershipTypes, setOwnershipTypes] = useState(() => getSavedOptionList(CUSTOM_OWNERSHIP_TYPES_STORAGE_KEY, OWNERSHIP_TYPES));
  const [soilTypes, setSoilTypes] = useState(() => getSavedOptionList(CUSTOM_SOIL_TYPES_STORAGE_KEY, SOIL_TYPES));
  const [assistanceTypes, setAssistanceTypes] = useState(() => getSavedOptionList(CUSTOM_ASSISTANCE_TYPES_STORAGE_KEY, ASSISTANCE_TYPES));

  const [formData, setFormData] = useState({
    system_id: '', rsbsa_no: '', first_name: '', middle_name: '', last_name: '', suffix: '',
    gender: '', dob: '', barangay_id: '', address_details: '', contact_no: '',
    is_main_livelihood: true, is_coop_member: false, 
    cooperative_id: [] as string[],
    status: 'active',
    farms_list: [] as any[],
    assistances_list: [] as any[]
  });
  const addDraftInitializedRef = useRef(false);

  const createDefaultFormData = () => {
    const generatedId = `FRM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const defaults = {
      system_id: generatedId, rsbsa_no: '', first_name: '', middle_name: '', last_name: '', suffix: '',
      gender: '', dob: '', barangay_id: '', address_details: '', contact_no: '',
      is_main_livelihood: true, is_coop_member: false,
      cooperative_id: [] as string[],
      status: 'active',
      farms_list: [{ farm_barangay_id: '', farm_sitio: '', crop_id: '', ownership_type: '', total_area: '', topography: '', irrigation_type: '', soil_type: '', gpx_file_name: '', farm_coordinates: [] }],
      assistances_list: [] as any[]
    };
    try {
      const savedDraft = localStorage.getItem(FARMER_DRAFT_STORAGE_KEY);
      return savedDraft ? { ...defaults, ...JSON.parse(savedDraft) } : defaults;
    } catch {
      return defaults;
    }
  };

  const normalizeValue = (value: any, options: string[]): string => {
    if (!value) return "";
    const trimmedValue = value.toString().trim();
    if (options.includes(trimmedValue)) return trimmedValue;
    const match = options.find(opt => opt.toLowerCase() === trimmedValue.toLowerCase());
    return match || "";
  };

  useEffect(() => {
    setIsSaving(false);
    if (farmer && isOpen) {
      let parsedFarms = [];
      let parsedAssistances = [];
      try { parsedFarms = typeof farmer.farms_list === 'string' ? JSON.parse(farmer.farms_list) : (farmer.farms_list || []); } catch(e){}
      try { parsedAssistances = typeof farmer.assistances_list === 'string' ? JSON.parse(farmer.assistances_list) : (farmer.assistances_list || []); } catch(e){}

      if (parsedFarms.length === 0 && farmer.farm_barangay_id) {
         parsedFarms.push({
            farm_barangay_id: farmer.farm_barangay_id, farm_sitio: farmer.farm_sitio, crop_id: farmer.crop_id,
            ownership_type: farmer.ownership_type, total_area: farmer.total_area, topography: farmer.topography,
            irrigation_type: farmer.irrigation_type,
            soil_type: farmer.soil_type || '',
            gpx_file_name: farmer.gpx_file_path || '',
            farm_coordinates: typeof farmer.farm_coordinates === 'string' ? JSON.parse(farmer.farm_coordinates) : (farmer.farm_coordinates || [])
         });
      }

      let parsedCoops: string[] = [];
      try {
        if (Array.isArray(farmer.cooperative_id)) {
            parsedCoops = farmer.cooperative_id.map((id:any) => id.toString());
        } else if (typeof farmer.cooperative_id === 'string' && farmer.cooperative_id.startsWith('[')) {
            parsedCoops = JSON.parse(farmer.cooperative_id).map((id:any) => id.toString());
        } else if (farmer.cooperative_id) {
            parsedCoops = farmer.cooperative_id.toString().split(',').map((id: string) => id.trim());
        }
      } catch(e){}

      setFormData({
        ...formData,
        ...farmer,
        gender: normalizeValue(farmer.gender, ['Male', 'Female']),
        suffix: farmer.suffix || '',
        is_main_livelihood: farmer.is_main_livelihood == 1,
        is_coop_member: farmer.is_coop_member == 1,
        barangay_id: farmer.barangay_id?.toString() || '',
        cooperative_id: parsedCoops,
        farms_list: parsedFarms,
        assistances_list: parsedAssistances
      });
      setActiveTab('personal');
      setErrors({});
    } else if (isOpen && !addDraftInitializedRef.current) {
      setFormData(createDefaultFormData());
      addDraftInitializedRef.current = true;
      setActiveTab('personal');
      setErrors({});
    }
  }, [farmer, isOpen]);

  useEffect(() => {
    if (isOpen && !farmer && addDraftInitializedRef.current) {
      localStorage.setItem(FARMER_DRAFT_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, farmer, isOpen]);

  const handleFarmChange = (index: number, field: string, value: any) => {
  const newFarms = [...formData.farms_list];
  const updatedFarm = { ...newFarms[index], [field]: value };

    if (field === 'farm_coordinates') {
      if (value && value.length >= 3) {
        updatedFarm.total_area = calculateHectares(value);
      } else {
        updatedFarm.total_area = "0.0000";
      }
    }

    newFarms[index] = updatedFarm;

    setFormData(prev => ({ ...prev, farms_list: newFarms }));
    
    if (errors[`farm_${field}_${index}`]) {
      setErrors(prev => { const n = { ...prev }; delete n[`farm_${field}_${index}`]; return n; });
    }
  };
  const addFarm = () => setFormData(prev => ({ ...prev, farms_list: [...prev.farms_list, { farm_barangay_id: '', farm_sitio: '', crop_id: '', ownership_type: '', total_area: '', topography: '', irrigation_type: '', soil_type: '', gpx_file_name: '', farm_coordinates: [] }] }));
  const removeFarm = (index: number) => setFormData(prev => ({ ...prev, farms_list: prev.farms_list.filter((_, i) => i !== index) }));

  const handleGPXUpload = async (index: number, file: File | null) => {
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = parseGPXCoordinates(content);

      if (parsed.length < 3) {
        toast.error('GPX file needs at least 3 valid points.');
        return;
      }

      handleFarmChange(index, 'gpx_file_name', file.name);
      handleFarmChange(index, 'farm_coordinates', parsed);
      toast.success('GPX coordinates loaded on the map.');
    } catch {
      toast.error('Unable to read the GPX file.');
    }
  };

  const handleAssistanceChange = (index: number, field: string, value: any) => {
const newAssistances = [...formData.assistances_list];
  newAssistances[index] = { 
    ...newAssistances[index], 
    [field]: field === 'total_cost' ? formatDecimalCurrencyInput(value) : value 
  };
  
   setFormData(prev => ({ ...prev, assistances_list: newAssistances }));
   if (errors[`assistance_${field}_${index}`]) {
    setErrors(prev => { const n = { ...prev }; delete n[`assistance_${field}_${index}`]; return n; });
   }
  };
  const handleAssistanceCostBlur = (index: number) => {
    const value = formData.assistances_list[index]?.total_cost;
    if (!value) return;
    handleAssistanceChange(index, 'total_cost', normalizeDecimalCurrencyInput(value));
  };
  const addAssistance = () => setFormData(prev => ({ ...prev, assistances_list: [...prev.assistances_list, { program_name: '', assistance_type: '', assistance_kind: '', date_released: '', quantity: '', total_cost: '', funding_source: '' }] }));
  const removeAssistance = (index: number) => setFormData(prev => ({ ...prev, assistances_list: prev.assistances_list.filter((_, i) => i !== index) }));

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAddTopographyType = createOptionAdder(setTopographyTypes, CUSTOM_TOPOGRAPHY_TYPES_STORAGE_KEY, TOPOGRAPHY_TYPES);
  const handleAddIrrigationType = createOptionAdder(setIrrigationTypes, CUSTOM_IRRIGATION_TYPES_STORAGE_KEY, IRRIGATION_TYPES);
  const handleAddOwnershipType = createOptionAdder(setOwnershipTypes, CUSTOM_OWNERSHIP_TYPES_STORAGE_KEY, OWNERSHIP_TYPES);
  const handleAddSoilType = createOptionAdder(setSoilTypes, CUSTOM_SOIL_TYPES_STORAGE_KEY, SOIL_TYPES);
  const handleAddAssistanceType = createOptionAdder(setAssistanceTypes, CUSTOM_ASSISTANCE_TYPES_STORAGE_KEY, ASSISTANCE_TYPES);
  const handleDeleteTopographyType = createOptionRemover(setTopographyTypes, CUSTOM_TOPOGRAPHY_TYPES_STORAGE_KEY, TOPOGRAPHY_TYPES);
  const handleDeleteIrrigationType = createOptionRemover(setIrrigationTypes, CUSTOM_IRRIGATION_TYPES_STORAGE_KEY, IRRIGATION_TYPES);
  const handleDeleteOwnershipType = createOptionRemover(setOwnershipTypes, CUSTOM_OWNERSHIP_TYPES_STORAGE_KEY, OWNERSHIP_TYPES);
  const handleDeleteSoilType = createOptionRemover(setSoilTypes, CUSTOM_SOIL_TYPES_STORAGE_KEY, SOIL_TYPES);
  const handleDeleteAssistanceType = createOptionRemover(setAssistanceTypes, CUSTOM_ASSISTANCE_TYPES_STORAGE_KEY, ASSISTANCE_TYPES);

  const farmers = useAppSelector((state) => state.farmer.records || []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (activeTab === 'personal') {
        if (!formData.rsbsa_no) {
            e.rsbsa_no = "RSBSA Number is required";
        } else {
            // CHECK FOR DUPLICATES sa Redux Store
            const isDuplicate = farmers.some((f: any) => 
                f.rsbsa_no.toLowerCase() === formData.rsbsa_no.toLowerCase() && 
                f.id !== farmer?.id // Siguruhon nga dili niya ma-flag iyang kaugalingon kung mag-Edit
            );

            if (isDuplicate) {
                e.rsbsa_no = "This RSBSA Number is already registered to another farmer.";
            }
        }
        if (!formData.first_name) e.first_name = "First Name is required";
        if (!formData.last_name) e.last_name = "Last Name is required";
        if (!formData.gender) e.gender = "Sex is required";
        if (!formData.dob) e.dob = "Date of Birth is required";
        if (!formData.barangay_id) e.barangay_id = "Residence Barangay is required";
        if (formData.is_coop_member && (!formData.cooperative_id || formData.cooperative_id.length === 0)) {
            e.cooperative_id = "Please select at least one cooperative";
        }
    } else if (activeTab === 'farm') {
        formData.farms_list.forEach((farm, index) => {
            if (!farm.farm_barangay_id) e[`farm_farm_barangay_id_${index}`] = "Farm location is required";
            if (!farm.farm_sitio) e[`farm_farm_sitio_${index}`] = "Sitio / Purok is required";
            if (!farm.crop_id) e[`farm_crop_id_${index}`] = "Main crop is required";
            if (!farm.topography) e[`farm_topography_${index}`] = "Topography is required";
            if (!farm.irrigation_type) e[`farm_irrigation_type_${index}`] = "Irrigation is required";
            if (!farm.ownership_type) e[`farm_ownership_type_${index}`] = "Ownership is required";
            if (!farm.soil_type) e[`farm_soil_type_${index}`] = "Soil type is required";
            if (!farm.total_area) e[`farm_total_area_${index}`] = "Total area is required";
        });
    } else if (activeTab === 'assistance') {
        formData.assistances_list.forEach((assist, index) => {
            if (!assist.program_name) e[`assistance_program_name_${index}`] = "Program name is required";
            if (!assist.assistance_type) e[`assistance_assistance_type_${index}`] = "Assistance type is required";
            if (!assist.date_released) e[`assistance_date_released_${index}`] = "Date released is required";
            if (!assist.quantity) e[`assistance_quantity_${index}`] = "Quantity is required";
            if (!assist.total_cost) e[`assistance_total_cost_${index}`] = "Total cost is required";
            if (!assist.funding_source) e[`assistance_funding_source_${index}`] = "Funding source is required";
        });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (validate()) {
      if (activeTab === 'personal') setActiveTab('farm');
      else if(activeTab === 'farm') setActiveTab('assistance');
    } 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (isSaving) return; 
    if (activeTab !== 'assistance') return;
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        cooperative_id: JSON.stringify(formData.cooperative_id)
      };

      const response = farmer 
        ? await axios.put(`farmers/${farmer.id}`, payload) 
        : await axios.post('farmers', payload);
        
      onUpdate(response.data.data, farmer ? 'edit' : 'add');
      toast.success(farmer ? "Changes Saved successfully" : "Farmer Registered successfully");
      if (!farmer) {
        localStorage.removeItem(FARMER_DRAFT_STORAGE_KEY);
        setFormData(createDefaultFormData());
        addDraftInitializedRef.current = false;
      }
      onClose();
    } catch (err: any) {
      toast.error("Error saving record. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const calculateHectares = (coords: {lat: number, lng: number}[]) => {
    if (!coords || coords.length < 3) return "0.0000";
    let area = 0;
    const R = 6378137; // Radius sa kalibutan (meters)

    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      area += (p2.lng - p1.lng) * (Math.PI / 180) * (2 + Math.sin(p1.lat * (Math.PI / 180)) + Math.sin(p2.lat * (Math.PI / 180)));
    }
    area = Math.abs(area * R * R / 2.0);
    return (area / 10000).toFixed(4); // Convert to Ha
  };


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
          <div className="p-8 overflow-y-auto flex-1 bg-white dark:bg-slate-900 custom-scrollbar">
            
            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="md:col-span-4">
                    <FormInput 
                        label="RSBSA Number" 
                        required 
                        value={formData.rsbsa_no} 
                        onChange={(v:string) => handleChange('rsbsa_no', v)} 
                        onBlur={() => {
                          const isDuplicate = farmers.some((f: any) => 
                              f.rsbsa_no.toLowerCase() === formData.rsbsa_no.toLowerCase() && 
                              f.id !== farmer?.id
                          );
                          if (isDuplicate) {
                              setErrors(prev => ({ ...prev, rsbsa_no: "This RSBSA Number is already registered." }));
                          }
                        }}
                        error={errors.rsbsa_no} 
                        icon={<Fingerprint size={14}/>} 
                        placeholder="10-22-XX-XXX-XXXXXX" 
                      />
                  </div>

                  {/* ROW 2: NAMES */}
                  <FormInput label="First Name" required value={formData.first_name} onChange={(v:string)=>handleChange('first_name', v)} error={errors.first_name} placeholder="Juan" />
                  <FormInput label="Middle Name" value={formData.middle_name} onChange={(v:string)=>handleChange('middle_name', v)} placeholder="Santos" />
                  <FormInput label="Last Name" required value={formData.last_name} onChange={(v:string)=>handleChange('last_name', v)} error={errors.last_name} placeholder="Dela Cruz" />
                  <FormInput label="Suffix" value={formData.suffix} onChange={(v:string)=>handleChange('suffix', v)} placeholder="Jr. / III" />
                  
                  {/* ROW 3: GENDER (1), DOB (2), CONTACT (1) - TUPONG NA SILA */}
                  <div className="md:col-span-1">
                      <FormSelect label="Sex" required value={formData.gender} onChange={(v:string)=>handleChange('gender', v)} options={['Male', 'Female']} error={errors.gender} />
                  </div>
                  
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
                      <FormInput label="Contact Number" value={formData.contact_no} onChange={(v:string)=>handleChange('contact_no', v)} icon={<Phone size={14}/>} placeholder="0917-XXX-XXXX" />
                  </div>

                  {/* ROW 4: ADDRESS */}
                  <div className="md:col-span-2">
                      <FormSearchablePicker label="Residence Barangay" required value={formData.barangay_id} items={activeBarangays} onSelect={(id:string)=>handleChange('barangay_id', id)} placeholder="Select Barangay..." error={errors.barangay_id} />
                  </div>
                  <div className="md:col-span-2">
                      <FormInput label="Street / Address Details" value={formData.address_details} onChange={(v:string)=>handleChange('address_details', v)} placeholder="Street / Purok / House No." />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                     <div className="space-y-3 p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div>
                          <h4 className="text-[11px] font-black uppercase text-primary flex items-center gap-2"><Briefcase size={14}/> Source of Income</h4>
                          <p className="text-[10px] text-gray-500 mt-1 leading-tight">Is farming their main and primary source of livelihood and income?</p>
                        </div>
                        <ToggleCard label="Primary Livelihood?" checked={formData.is_main_livelihood} onChange={(c:boolean)=>handleChange('is_main_livelihood', c)} />
                     </div>

                     <div className="space-y-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                        <div>
                          <h4 className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2"><Building2 size={14}/> Cooperative Affiliation</h4>
                          <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-1 leading-tight">Is the farmer currently an active member of any registered agricultural cooperative?</p>
                        </div>
                        <ToggleCard label="Coop Member?" checked={formData.is_coop_member} onChange={(c:boolean)=>handleChange('is_coop_member', c)} />
                        
                        {formData.is_coop_member && (
                           <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                             <FormMultiSearchablePicker 
                               label="Select Cooperative Name(s)" 
                               required 
                               values={formData.cooperative_id} 
                              items={selectableCooperatives} 
                               labelField="name" 
                               onChange={(ids: string[]) => handleChange('cooperative_id', ids)} 
                               placeholder="Search and select coops..." 
                               error={errors.cooperative_id}
                             />
                           </div>
                        )}
                     </div>
                </div>
              </div>
            )}

            {activeTab === 'farm' && (
               <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">List of Farms / Land Parcels</h3>
                     <button type="button" onClick={addFarm} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase hover:bg-emerald-100 transition-colors">
                        <Plus size={14}/> Add Another Farm
                     </button>
                  </div>

                  {formData.farms_list.map((farm, index) => (
                    <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-200 dark:border-slate-700 relative">
                       {formData.farms_list.length > 1 && (
                         <button type="button" onClick={() => removeFarm(index)} className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                            <Trash2 size={16}/>
                         </button>
                       )}
                       
                       <h4 className="text-xs font-black uppercase text-primary mb-6">Farm Parcel #{index + 1}</h4>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <FormSearchablePicker label="Farm Barangay" required value={farm.farm_barangay_id} items={activeBarangays} onSelect={(id:string)=>handleFarmChange(index, 'farm_barangay_id', id)} placeholder="Select Barangay..." error={errors[`farm_farm_barangay_id_${index}`]} />
                          <FormInput label="Sitio / Purok" required value={farm.farm_sitio} onChange={(v:string)=>handleFarmChange(index, 'farm_sitio', v)} placeholder="Sitio Pag-asa" error={errors[`farm_farm_sitio_${index}`]} />
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          <FormSearchablePicker label="Main Crop" required value={farm.crop_id} items={activeCrops} labelField="category" onSelect={(id:string)=>handleFarmChange(index, 'crop_id', id)} placeholder="Select Crop Category..." error={errors[`farm_crop_id_${index}`]} />
                          
                          <FormCommandSelect label="Topography" required value={farm.topography} onChange={(v:string)=>handleFarmChange(index, 'topography', v)} options={topographyTypes} defaultOptions={TOPOGRAPHY_TYPES} onAddOption={handleAddTopographyType} onDeleteOption={handleDeleteTopographyType} guideContent={GUIDES.topography} placeholder="Select Topography..." error={errors[`farm_topography_${index}`]} />
                          <FormCommandSelect label="Irrigation" required value={farm.irrigation_type} onChange={(v:string)=>handleFarmChange(index, 'irrigation_type', v)} options={irrigationTypes} defaultOptions={IRRIGATION_TYPES} onAddOption={handleAddIrrigationType} onDeleteOption={handleDeleteIrrigationType} guideContent={GUIDES.irrigation} placeholder="Select Irrigation..." error={errors[`farm_irrigation_type_${index}`]} />
                          <FormCommandSelect label="Ownership" required value={farm.ownership_type} onChange={(v:string)=>handleFarmChange(index, 'ownership_type', v)} options={ownershipTypes} defaultOptions={OWNERSHIP_TYPES} onAddOption={handleAddOwnershipType} onDeleteOption={handleDeleteOwnershipType} guideContent={GUIDES.ownership} placeholder="Select Ownership..." error={errors[`farm_ownership_type_${index}`]} />
                          <FormCommandSelect label="Soil Type" required value={farm.soil_type} onChange={(v:string)=>handleFarmChange(index, 'soil_type', v)} options={soilTypes} defaultOptions={SOIL_TYPES} onAddOption={handleAddSoilType} onDeleteOption={handleDeleteSoilType} placeholder="Select Soil Type..." error={errors[`farm_soil_type_${index}`]} />
                          
                          <div className="md:col-span-4 mt-2">
                            <div className="relative">
                              <FormInput 
                                type="number" 
                                label="Total Area (Ha)" 
                                required 
                                value={farm.total_area} 
                                readOnly={true} // 🌟 ReadOnly para auto-calc ra gyud
                                icon={<Ruler size={14}/>} 
                                placeholder="0.0000" 
                                error={errors[`farm_total_area_${index}`]} 
                                className="bg-gray-100 dark:bg-slate-800/50 cursor-not-allowed"
                              />
                              
                              {/* 🌟 HELPER LABEL / INSTRUCTION */}
                              <div className="mt-1.5 ml-1 flex items-center gap-1.5">
                                {(!farm.farm_coordinates || farm.farm_coordinates.length < 3) ? (
                                  <p className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1 animate-pulse">
                                    <Info size={10}/> Plot at least 3 points on the map below to compute area
                                  </p>
                                ) : (
                                  <p className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                    <Check size={10}/> Area automatically computed from map points
                                  </p>
                                )}
                              </div>
                           </div>
                          </div>
                       </div>

                       <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/70 dark:bg-blue-900/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2"><Upload size={12}/> GPX Import</p>
                            <p className="text-[11px] font-bold text-blue-700/80 dark:text-blue-300 mt-2 leading-relaxed">Upload a `.gpx` boundary file to auto-generate coordinates and draw the parcel on the map.</p>
                            {farm.gpx_file_name && <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2">Loaded: {farm.gpx_file_name}</p>}
                          </div>
                          <label className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[10px] font-black uppercase tracking-widest text-blue-600 cursor-pointer">
                            <MapPinned size={14}/> Upload GPX
                            <input type="file" accept=".gpx,application/gpx+xml,.xml" className="hidden" onChange={(e) => handleGPXUpload(index, e.target.files?.[0] || null)} />
                          </label>
                        </div>
                        <FarmLocationMap 
                          coordinates={farm.farm_coordinates || []} 
                          onChange={(coords) => handleFarmChange(index, 'farm_coordinates', coords)} 
                          farmerName={[formData.first_name, formData.last_name].filter(Boolean).join(' ') + " Farm"}
                        />
                       </div>
                    </div>
                  ))}
               </div>
            )}

            {activeTab === 'assistance' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assistance & Programs Received</h3>
                     <button type="button" onClick={addAssistance} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full text-[10px] font-black uppercase hover:bg-blue-100 transition-colors">
                        <Plus size={14}/> Add Program
                     </button>
                  </div>

                  {formData.assistances_list.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200">
                       <p className="text-[10px] font-black uppercase text-slate-400">No programs added for this farmer.</p>
                    </div>
                  ) : (
                    formData.assistances_list.map((assist, index) => (
                      <div key={index} className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 relative">
                         <button type="button" onClick={() => removeAssistance(index)} className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                            <Trash2 size={16}/>
                         </button>
                         <h4 className="text-xs font-black uppercase text-blue-500 mb-6">Program #{index + 1}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><FormInput label="Program Name" required value={assist.program_name} onChange={(v:string)=>handleAssistanceChange(index, 'program_name', v)} placeholder="Rice Enhancement Program" error={errors[`assistance_program_name_${index}`]} /></div>
                            <FormCommandSelect label="Assistance Type" required value={assist.assistance_type} onChange={(v:string)=>handleAssistanceChange(index, 'assistance_type', v)} options={assistanceTypes} defaultOptions={ASSISTANCE_TYPES} onAddOption={handleAddAssistanceType} onDeleteOption={handleDeleteAssistanceType} placeholder="Select Assistance Type..." error={errors[`assistance_assistance_type_${index}`]} />
                            {assist.assistance_type && (
                              <FormInput label="Kinds/Type" value={assist.assistance_kind} onChange={(v:string)=>handleAssistanceChange(index, 'assistance_kind', v)} placeholder={`Specific ${assist.assistance_type}`} />
                            )}
                            <FormInput type="date" label="Date Released" required value={assist.date_released} onChange={(v:string)=>handleAssistanceChange(index, 'date_released', v)} error={errors[`assistance_date_released_${index}`]} />
                            <FormInput label="Quantity" required value={assist.quantity} onChange={(v:string)=>handleAssistanceChange(index, 'quantity', v)} placeholder="5 bags" error={errors[`assistance_quantity_${index}`]} />
                            <FormInput type="text" inputMode="decimal" label="Total Cost" required value={assist.total_cost} onChange={(v:string)=>handleAssistanceChange(index, 'total_cost', v)} onBlur={() => handleAssistanceCostBlur(index)} icon={<DollarSign size={14}/>} placeholder="0.00" error={errors[`assistance_total_cost_${index}`]} />
                            <FormSelect label="Funding Source" required value={assist.funding_source} onChange={(v:string)=>handleAssistanceChange(index, 'funding_source', v)} options={['Department of Agriculture', 'LGU Gingoog', 'NGO', 'Others']} error={errors[`assistance_funding_source_${index}`]} />
                         </div>
                      </div>
                    ))
                  )}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
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

// --- HELPER COMPONENTS ---
const Step = ({ active, label, icon }: any) => (
  <div className={cn("px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 transition-all", active ? "bg-primary text-white shadow-md scale-105" : "text-gray-400 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800")}>{icon} {label}</div>
);

const FormInput = ({ label, value, onChange, onBlur, type="text", icon, error, placeholder, required, readOnly, className, inputMode }: any) => (
  <div className="space-y-1.5 w-full">
    <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1.5", error ? "text-rose-500" : "text-gray-500")}>
      {icon} {label} {required && <span className="text-rose-500 text-[14px] leading-none">*</span>}
    </label>
    <input 
      type={type} 
      inputMode={inputMode}
      readOnly={readOnly} // 🌟 Idugang kini
      placeholder={placeholder} 
      className={cn(
        "w-full h-11.5 px-4 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold outline-none transition-all shadow-sm", 
        error ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700 focus:border-primary text-slate-700 dark:text-slate-200",
        readOnly && "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed", // Style para readonly
        className // Para sa custom classes
      )} 
      value={value || ''} 
      onChange={(e)=> !readOnly && onChange(e.target.value)} // Dili mo-change kung readonly
      onBlur={onBlur}
    />
    {error && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
  </div>
);

const FormSelect = ({ label, value, onChange, options, onAddOption, error, required, guideContent }: any) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [addError, setAddError] = useState('');

  const handleSaveOption = () => {
    if (!onAddOption) return;

    const option = newOption.trim().replace(/\s+/g, ' ');
    if (!option) {
      setAddError(`${label} name is required.`);
      return;
    }

    const existing = options.find((item: string) => item.toLowerCase() === option.toLowerCase());
    if (existing) {
      onChange(existing);
      setNewOption('');
      setAddError('');
      setAddDialogOpen(false);
      return;
    }

    const addedValue = onAddOption(option) || option;
    onChange(addedValue);
    setNewOption('');
    setAddError('');
    setAddDialogOpen(false);
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-1.5">
        <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1", error ? "text-rose-500" : "text-gray-500")}>
          {label} {required && <span className="text-rose-500 text-[14px] leading-none">*</span>}
        </label>
        {guideContent && (
          <Popover>
            <PopoverTrigger type="button" className="text-gray-400 hover:text-primary transition-colors cursor-pointer">
              <Info size={14} />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 text-xs z-200 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-xl rounded-2xl">
              <p className="font-black uppercase text-[10px] mb-2 text-primary">Guide: {label}</p>
              {guideContent}
            </PopoverContent>
          </Popover>
        )}
      </div>

      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className={cn("w-full h-11.5 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm", error ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700")}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 z-300">
          {options.map((o:string)=><SelectItem key={o} value={o} className="text-xs font-bold uppercase py-3 cursor-pointer">{o}</SelectItem>)}
          {onAddOption && (
            <div className="border-t border-gray-100 dark:border-slate-800 p-1.5 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNewOption('');
                  setAddError('');
                  setAddDialogOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors"
              >
                <Plus size={14} /> Add {label}
              </button>
            </div>
          )}
        </SelectContent>
      </Select>
      {addDialogOpen && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddDialogOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-7 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-black text-primary uppercase text-sm mb-5 flex items-center gap-2"><Plus size={16}/> Add {label}</h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1", addError ? "text-rose-500" : "text-gray-500")}>
                  {label} Name <span className="text-rose-500 text-[14px] leading-none">*</span>
                </label>
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => { setNewOption(e.target.value); if (addError) setAddError(''); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveOption();
                    }
                  }}
                  autoFocus
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  className={cn(
                    "w-full h-11.5 px-4 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold outline-none transition-all shadow-sm uppercase",
                    addError ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700 focus:border-primary text-slate-700 dark:text-slate-200"
                  )}
                />
                {addError && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{addError}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddDialogOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                <button type="button" onClick={handleSaveOption} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:opacity-90 shadow-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
    </div>
  );
};

const FormSearchablePicker = ({ label, value, items = [], onSelect, placeholder, labelField="name", error, required }: any) => {
    const [open, setOpen] = useState(false);
    return (
    <div className="space-y-1.5 w-full">
      <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1", error ? "text-rose-500" : "text-gray-500")}>
        {label} {required && <span className="text-rose-500 text-[14px] leading-none">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={cn("w-full h-11.5 flex items-center justify-between px-4 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-200 shadow-sm", error ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700 hover:border-primary")}>
            <span className="uppercase truncate">{value ? items.find((i:any)=>i.id.toString() === value?.toString())?.[labelField] : placeholder}</span>
            <ChevronsUpDown className="h-4 w-4 opacity-40" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 w-75 rounded-2xl shadow-2xl border-slate-200">
          <Command>
            <CommandInput placeholder="Search..." className="h-11 text-xs uppercase border-b-0" />
            <CommandList className="max-h-60 overflow-y-auto custom-scrollbar">
              <CommandEmpty className="py-4 text-center text-[10px] font-bold text-slate-400">No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((i:any) => (
                  <CommandItem key={i.id} onSelect={()=>{ onSelect(i.id.toString()); setOpen(false); }} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    {i[labelField]}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
    </div>
)};

const FormCommandSelect = ({ label, value, onChange, options, defaultOptions = [], onAddOption, onDeleteOption, placeholder = 'Select...', error, required, guideContent }: any) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [addError, setAddError] = useState('');
  const cleanSearch = search.trim().replace(/\s+/g, ' ');
  const exactMatch = options.some((opt: string) => opt.toLowerCase() === cleanSearch.toLowerCase());
  const isDefaultOption = (option: string) => defaultOptions.some((item: string) => item.toLowerCase() === option.toLowerCase());

  const openAddDialog = () => {
    if (!onAddOption) return;
    setNewOption(cleanSearch);
    setAddError('');
    setOpen(false);
    setAddDialogOpen(true);
  };

  const handleSaveOption = () => {
    if (!onAddOption) return;

    const soilType = newOption.trim().replace(/\s+/g, ' ');
    if (!soilType) {
      setAddError('Soil type name is required.');
      return;
    }

    const existing = options.find((opt: string) => opt.toLowerCase() === soilType.toLowerCase());
    if (existing) {
      onChange(existing);
      setNewOption('');
      setAddError('');
      setSearch('');
      setAddDialogOpen(false);
      return;
    }

    const addedValue = onAddOption(soilType) || soilType;
    onChange(addedValue);
    setNewOption('');
    setAddError('');
    setSearch('');
    setAddDialogOpen(false);
  };

  const handleDeleteOption = (e: React.PointerEvent | React.MouseEvent, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDeleteOption || isDefaultOption(option)) return;

    onDeleteOption(option);
    if (value?.toString().toLowerCase() === option.toLowerCase()) {
      onChange('');
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-1.5">
        <label className={cn('text-[10px] font-black uppercase ml-1 flex items-center gap-1', error ? 'text-rose-500' : 'text-gray-500')}>
          {label} {required && <span className="text-rose-500 text-[14px] leading-none">*</span>}
        </label>
        {guideContent && (
          <Popover>
            <PopoverTrigger type="button" className="text-gray-400 hover:text-primary transition-colors cursor-pointer">
              <Info size={14} />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 text-xs z-300 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-xl rounded-2xl">
              <p className="font-black uppercase text-[10px] mb-2 text-primary">Guide: {label}</p>
              {guideContent}
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={cn('w-full h-11.5 flex items-center justify-between px-4 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-200 shadow-sm', error ? 'border-rose-500' : 'border-gray-200 dark:border-slate-700 hover:border-primary')}>
            <span className={cn('uppercase truncate', !value && 'text-slate-400 font-normal')}>{value || placeholder}</span>
            <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 w-64 rounded-2xl shadow-2xl border-slate-200">
          <Command>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && cleanSearch && !exactMatch) {
                  e.preventDefault();
                  openAddDialog();
                }
              }}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="h-11 text-xs uppercase border-b-0"
            />
            <CommandList className="max-h-60 overflow-y-auto custom-scrollbar">
              <CommandEmpty className="py-4 text-center text-[10px] font-bold text-slate-400">No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt: string) => {
                  const canDelete = !!onDeleteOption && !isDefaultOption(opt);
                  return (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => { onChange(opt); setOpen(false); }}
                      className="text-xs font-bold uppercase py-3 px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{opt}</span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        {value === opt && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                        {canDelete && (
                          <button
                            type="button"
                            onPointerDown={(e) => handleDeleteOption(e, opt)}
                            onClick={(e) => handleDeleteOption(e, opt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                            title={`Delete ${opt}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {onAddOption && (
              <div className="border-t border-gray-100 dark:border-slate-800 p-1.5">
                <button
                  type="button"
                  onClick={openAddDialog}
                  className="w-full flex items-center gap-2 px-3 py-3 text-primary text-[10px] font-black uppercase hover:bg-primary/5 rounded-xl cursor-pointer transition-colors"
                >
                  <Plus size={14} /> Add {label}
                </button>
                {exactMatch && <p className="px-3 pb-2 text-[9px] font-bold uppercase text-slate-400">This {label.toLowerCase()} already exists.</p>}
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      {addDialogOpen && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setAddDialogOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-7 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-black text-primary uppercase text-sm mb-5 flex items-center gap-2"><Plus size={16}/> Add {label}</h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1", addError ? "text-rose-500" : "text-gray-500")}>
                  {label} Name <span className="text-rose-500 text-[14px] leading-none">*</span>
                </label>
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => { setNewOption(e.target.value); if (addError) setAddError(''); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveOption();
                    }
                  }}
                  autoFocus
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  className={cn(
                    "w-full h-11.5 px-4 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold outline-none transition-all shadow-sm uppercase",
                    addError ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700 focus:border-primary text-slate-700 dark:text-slate-200"
                  )}
                />
                {addError && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{addError}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAddDialogOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                <button type="button" onClick={handleSaveOption} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl cursor-pointer hover:opacity-90 shadow-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
    </div>
  );
};

// 🌟 UPDATED: FORM MULTI-SEARCHABLE PICKER COMPONENT NAAY X BUTTON SA SULOD
const FormMultiSearchablePicker = ({ label, values = [], items = [], onChange, placeholder, labelField="name", error, required }: any) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (id: string) => {
        if (values.includes(id)) {
            onChange(values.filter((v: string) => v !== id)); // Remove if selected
        } else {
            onChange([...values, id]); // Add if not selected
        }
    };

    // ✨ Gihimo natong function para ma-handle ang pag click sa "X" icon sa sulod sa trigger nga dili maabli ang dropdown.
    const handleRemove = (e: React.PointerEvent | React.MouseEvent, id: string) => {
        e.stopPropagation(); // Pugngi nga ma-trigger ang pag-abli/sira sa popover
        e.preventDefault();
        onChange(values.filter((v: string) => v !== id)); // Remove logic
    };

    return (
    <div className="space-y-1.5 w-full">
      <label className={cn("text-[10px] font-black uppercase ml-1 flex items-center gap-1", error ? "text-rose-500" : "text-gray-500")}>
        {label} {required && <span className="text-rose-500 text-[14px] leading-none">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={cn("w-full min-h-11.5 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm", error ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-gray-200 dark:border-slate-700 hover:border-primary")}>
            <div className="flex flex-wrap gap-1.5 items-center justify-start flex-1 overflow-hidden pr-2">
               {values && values.length > 0 ? (
                   items.filter((i:any) => values.includes(i.id.toString())).map((i:any) => (
                     <span key={i.id} className="bg-primary/10 border border-primary/20 text-primary pl-2.5 pr-1 py-1 rounded-lg text-[10px] flex items-center gap-1 max-w-full z-10">
                       <span className="truncate">{i[labelField]}</span>
                       {/* ✨ X BUTTON PARA MA-REMOVE ANG SPECIFIC COOPERATIVE */}
                       <div 
                         onPointerDown={(e) => handleRemove(e, i.id.toString())}
                         className="hover:bg-primary/30 text-primary/70 hover:text-primary rounded-full p-0.5 transition-colors cursor-pointer"
                       >
                         <X size={12} strokeWidth={3} />
                       </div>
                     </span>
                   ))
               ) : (
                 <span className="opacity-60 pl-1">{placeholder}</span>
               )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 z-200 bg-white dark:bg-slate-900 w-75 rounded-2xl shadow-2xl border-slate-200">
          <Command>
            <CommandInput placeholder="Search cooperatives..." className="h-11 text-xs uppercase border-b-0" />
            <CommandList className="max-h-60 overflow-y-auto custom-scrollbar">
              <CommandEmpty className="py-4 text-center text-[10px] font-bold text-slate-400">No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((i:any) => {
                  const isSelected = values.includes(i.id.toString());
                  return (
                  <CommandItem key={i.id} onSelect={()=>{ handleSelect(i.id.toString()); }} className={cn("text-xs font-bold uppercase py-3 px-4 cursor-pointer flex items-center justify-between", isSelected ? "bg-primary/5 text-primary" : "hover:bg-slate-50 dark:hover:bg-slate-800")}>
                    {i[labelField]}
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </CommandItem>
                )})}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10}/>{error}</p>}
    </div>
)};

const ToggleCard = ({ label, checked, onChange }: any) => (
    <div className="h-11.5 px-4 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-between border border-gray-200 dark:border-slate-700 shadow-sm transition-all">
        <label className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase">{label}</label>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);



export default FarmerDialog;
