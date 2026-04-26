import { useEffect, useMemo, useState } from 'react';
import { X, FileText, FileSpreadsheet, Loader2, Calendar, Layers, User, StickyNote, ChevronsUpDown, Filter, ListFilter, CheckSquare } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';
import axios from '../../../../plugin/axios';

const REPORT_TYPES = ['Production', 'Fishery', 'Financial', 'Census', 'Inventory'];

const MODULE_MAP: Record<string, string[]> = {
  Production: ['Harvest Records', 'Planting Records', 'Crop Program'],
  Fishery: ['Fish Catch Data', 'Fisherfolk Registry', 'Fishpond Records'],
  Financial: ['Expense Summary', 'Budget Utilization', 'Program Expenditures'],
  Census: ['Farmer Registry', 'Fisherfolk Registry', 'Cooperative Listings', 'Barangay Profile'],
  Inventory: ['Equipment Status', 'Supply Inventory', 'Distribution Records'],
};

const STATUS_OPTIONS = ['Published', 'Pending Review', 'Draft'];

type FilterConfig = { key: string; label: string; type?: 'text' | 'select'; options?: string[] };
type FieldConfig = { key: string; label: string };

const CROP_OPTIONS = ['Rice', 'Corn', 'Coconut', 'Banana', 'Cassava', 'Cacao', 'Coffee', 'Vegetables'];
const GROWTH_STATUS_OPTIONS = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturing', 'Harvested'];
const BARANGAY_OPTIONS = ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8'];
const BOAT_TYPE_OPTIONS = ['Motorized', 'Non-motorized', 'Pump Boat', 'Banca', 'Commercial'];
const GEAR_TYPE_OPTIONS = ['Gill Net', 'Hook and Line', 'Longline', 'Fish Trap', 'Seine Net', 'Spear Gun'];
const FISHING_AREA_OPTIONS = ['Municipal Waters', 'Coastal Reef', 'River', 'Lake', 'Fishpond'];
const CATCH_SPECIES_OPTIONS = ['Tilapia', 'Bangus', 'Galunggong', 'Tuna', 'Shrimp', 'Crab', 'Squid'];
const TOTAL_YIELD_OPTIONS = ['0-50 kg', '51-100 kg', '101-250 kg', '251-500 kg', '500+ kg'];
const FINANCE_CATEGORY_OPTIONS = ['Supplies', 'Fuel', 'Equipment', 'Maintenance', 'Labor', 'Training', 'Administrative'];
const FINANCE_PROJECT_OPTIONS = ['Rice Program', 'Corn Program', 'Fishery Support', 'Farmer Registry', 'Barangay Census', 'Infrastructure'];

const FILTER_CONFIG: Record<string, FilterConfig[]> = {
  Production: [
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
    { key: 'crop', label: 'Crop', type: 'select', options: CROP_OPTIONS },
    { key: 'growth_status', label: 'Growth Status', type: 'select', options: GROWTH_STATUS_OPTIONS },
    { key: 'quality', label: 'Quality', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
  ],
  Fishery: [
    { key: 'boat_type', label: 'Boat Type', type: 'select', options: BOAT_TYPE_OPTIONS },
    { key: 'gear_type', label: 'Gear Type', type: 'select', options: GEAR_TYPE_OPTIONS },
    { key: 'fishing_area', label: 'Fishing Area', type: 'select', options: FISHING_AREA_OPTIONS },
    { key: 'catch_species', label: 'Catch Species', type: 'select', options: CATCH_SPECIES_OPTIONS },
    { key: 'total_yield', label: 'Total Yield', type: 'select', options: TOTAL_YIELD_OPTIONS },
  ],
  Financial: [
    { key: 'category', label: 'Category', type: 'select', options: FINANCE_CATEGORY_OPTIONS },
    { key: 'project', label: 'Project', type: 'select', options: FINANCE_PROJECT_OPTIONS },
    { key: 'status', label: 'Expense Status', type: 'select', options: ['Open', 'Pending', 'Approved', 'Disbursed', 'Closed'] },
  ],
  Census: [
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
    { key: 'crop', label: 'Primary Crop', type: 'select', options: CROP_OPTIONS },
    { key: 'gender', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
    { key: 'status', label: 'Farmer Status', type: 'select', options: ['active', 'inactive'] },
    { key: 'is_main_livelihood', label: 'Main Livelihood', type: 'select', options: ['true', 'false'] },
  ],
  Inventory: [
    { key: 'category', label: 'Category', type: 'select', options: ['Machinery', 'Input Supplies', 'Seed Stock', 'Fertilizer', 'Tools'] },
    { key: 'commodity', label: 'Commodity', type: 'select', options: ['Rice', 'Corn', 'Fish Feed', 'Fingerlings', 'Fertilizer'] },
    { key: 'status', label: 'Inventory Status', type: 'select', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
    { key: 'year', label: 'Year', type: 'select', options: ['2023', '2024', '2025', '2026'] },
  ],
};

const FIELD_CONFIG: Record<string, FieldConfig[]> = {
  Production: [
    { key: 'farmer', label: 'Farmer' },
    { key: 'crop', label: 'Crop' },
    { key: 'barangay', label: 'Barangay' },
    { key: 'date_harvested', label: 'Date Harvested' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'quality', label: 'Quality' },
    { key: 'value', label: 'Value (PHP)' },
  ],
  Fishery: [
    { key: 'name', label: 'Name' },
    { key: 'boat_name', label: 'Boat' },
    { key: 'gear_type', label: 'Gear Type' },
    { key: 'fishing_area', label: 'Fishing Area' },
    { key: 'catch_species', label: 'Species' },
    { key: 'yield', label: 'Yield (kg)' },
    { key: 'market_value', label: 'Market Value (PHP)' },
    { key: 'hours_spent_fishing', label: 'Hours Spent Fishing' },
    { key: 'date', label: 'Date' },
  ],
  Financial: [
    { key: 'ref_no', label: 'Reference No.' },
    { key: 'item', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'project', label: 'Project' },
    { key: 'amount', label: 'Amount (PHP)' },
    { key: 'date_incurred', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'remarks', label: 'Remarks' },
  ],
  Census: [
    { key: 'full_name', label: 'Full Name' },
    { key: 'gender', label: 'Sex' },
    { key: 'barangay', label: 'Barangay' },
    { key: 'contact_no', label: 'Contact No.' },
    { key: 'primary_crop', label: 'Primary Crop' },
    { key: 'farm_area', label: 'Farm Area (ha)' },
    { key: 'ownership', label: 'Ownership' },
    { key: 'soil_type', label: 'Soil Type' },
    { key: 'status', label: 'Status' },
  ],
  Inventory: [
    { key: 'name', label: 'Item Name' },
    { key: 'commodity', label: 'Commodity' },
    { key: 'category', label: 'Category' },
    { key: 'sku', label: 'SKU' },
    { key: 'stock', label: 'Stock' },
    { key: 'unit', label: 'Unit' },
    { key: 'status', label: 'Status' },
    { key: 'year', label: 'Year' },
  ],
};

const MODULE_FILTER_CONFIG: Record<string, FilterConfig[]> = {
  'Harvest Records': [
    { key: 'crop', label: 'Crop', type: 'select', options: CROP_OPTIONS },
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
    { key: 'quality', label: 'Quality', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
  ],
  'Planting Records': [
    { key: 'crop_type', label: 'Crop Type', type: 'select', options: CROP_OPTIONS },
    { key: 'growth_status', label: 'Growth Status', type: 'select', options: GROWTH_STATUS_OPTIONS },
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
  ],
  'Fish Catch Data': [
    { key: 'boat_type', label: 'Boat Type', type: 'select', options: BOAT_TYPE_OPTIONS },
    { key: 'gear_type', label: 'Gear Type', type: 'select', options: GEAR_TYPE_OPTIONS },
    { key: 'fishing_area', label: 'Fishing Area', type: 'select', options: FISHING_AREA_OPTIONS },
    { key: 'catch_species', label: 'Catch Species', type: 'select', options: CATCH_SPECIES_OPTIONS },
    { key: 'total_yield', label: 'Total Yield', type: 'select', options: TOTAL_YIELD_OPTIONS },
  ],
  'Farmer Registry': [
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
    ...FILTER_CONFIG.Census.filter((f) => f.key !== 'barangay'),
  ],
  'Fisherfolk Registry': [
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
    { key: 'gender', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
    { key: 'status', label: 'Registry Status', type: 'select', options: ['active', 'inactive'] },
    { key: 'fisher_type', label: 'Fisher Type', type: 'select', options: ['Capture', 'Aquaculture', 'Municipal', 'Commercial'] },
  ],
  'Expense Summary': [
    { key: 'category', label: 'Category', type: 'select', options: FINANCE_CATEGORY_OPTIONS },
    { key: 'project', label: 'Project', type: 'select', options: FINANCE_PROJECT_OPTIONS },
  ],
  'Program Expenditures': [
    { key: 'category', label: 'Category', type: 'select', options: FINANCE_CATEGORY_OPTIONS },
    { key: 'project', label: 'Project', type: 'select', options: FINANCE_PROJECT_OPTIONS },
  ],
  'Barangay Profile': [
    { key: 'barangay', label: 'Barangay', type: 'select', options: BARANGAY_OPTIONS },
    { key: 'gender', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
    { key: 'status', label: 'Registry Status', type: 'select', options: ['active', 'inactive'] },
  ],
};

const MODULE_FIELD_CONFIG: Record<string, FieldConfig[]> = {
  'Harvest Records': [
    { key: 'farmer', label: 'Farmer' },
    { key: 'crop', label: 'Crop' },
    { key: 'barangay', label: 'Barangay' },
    { key: 'date_harvested', label: 'Date Harvested' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'quality', label: 'Quality' },
    { key: 'value', label: 'Value (PHP)' },
  ],
  'Planting Records': [
    { key: 'farmer', label: 'Farmer' },
    { key: 'crop_type', label: 'Crop Type' },
    { key: 'growth_status', label: 'Growth Status' },
    { key: 'barangay', label: 'Barangay' },
    { key: 'date_planted', label: 'Date Planted' },
    { key: 'area', label: 'Area (ha)' },
  ],
  'Farmer Registry': FIELD_CONFIG.Census,
  'Fisherfolk Registry': [
    { key: 'full_name', label: 'Full Name' },
    { key: 'gender', label: 'Sex' },
    { key: 'barangay', label: 'Barangay' },
    { key: 'contact_no', label: 'Contact No.' },
    { key: 'fisher_type', label: 'Fisher Type' },
    { key: 'years_in_fishing', label: 'Years in Fishing' },
    { key: 'status', label: 'Status' },
  ],
  'Fish Catch Data': [
    { key: 'name', label: 'Name' },
    { key: 'boat_type', label: 'Boat Type' },
    { key: 'gear_type', label: 'Gear Type' },
    { key: 'fishing_area', label: 'Fishing Area' },
    { key: 'catch_species', label: 'Catch Species' },
    { key: 'yield', label: 'Total Yield (kg)' },
    { key: 'date', label: 'Date' },
  ],
  'Expense Summary': FIELD_CONFIG.Financial,
  'Program Expenditures': FIELD_CONFIG.Financial,
  'Barangay Profile': [
    { key: 'barangay', label: 'Barangay' },
    { key: 'population', label: 'Population' },
    { key: 'households', label: 'Households' },
    { key: 'primary_livelihood', label: 'Primary Livelihood' },
    { key: 'registered_farmers', label: 'Registered Farmers' },
    { key: 'registered_fisherfolk', label: 'Registered Fisherfolk' },
  ],
};

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: any) => void;
}

type ModuleDateRange = {
  period_from: string | null;
  period_to: string | null;
  has_data: boolean;
};

const defaultForm = {
  title: '',
  type: '',
  module: '',
  period_from: '',
  period_to: '',
  format: 'PDF' as 'PDF' | 'XLSX',
  status: 'Published',
  notes: '',
  filters: {} as Record<string, string>,
  selected_fields: [] as string[],
};

export default function GenerateReportModal({ isOpen, onClose, onSuccess }: GenerateReportModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openType, setOpenType] = useState(false);
  const [openModule, setOpenModule] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [moduleDateRange, setModuleDateRange] = useState<ModuleDateRange | null>(null);
  const [barangayOptions, setBarangayOptions] = useState<string[]>([]);
  const [cropOptions, setCropOptions] = useState<string[]>([]);

  const availableModules = form.type ? MODULE_MAP[form.type] ?? [] : [];
  const availableFilters = useMemo(() => {
    const moduleFilters = form.module ? MODULE_FILTER_CONFIG[form.module] ?? [] : [];
    return moduleFilters.map((filter) => (
      filter.key === 'barangay'
        ? { ...filter, options: barangayOptions }
        : (filter.key === 'crop' || filter.key === 'crop_type')
          ? { ...filter, options: cropOptions }
        : filter
    ));
  }, [form.module, barangayOptions, cropOptions]);
  const availableFields = form.module ? MODULE_FIELD_CONFIG[form.module] ?? [] : [];

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
      setErrors({});
      setModuleDateRange(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLookups = async () => {
      try {
        const [barangayResponse, cropResponse] = await Promise.all([
          axios.get('barangays'),
          axios.get('crops'),
        ]);

        const barangaySource = Array.isArray(barangayResponse.data?.data)
          ? barangayResponse.data.data
          : Array.isArray(barangayResponse.data?.barangays)
            ? barangayResponse.data.barangays
            : [];

        const barangayNames: string[] = barangaySource
          .map((barangay: any) => String(barangay?.name ?? '').trim())
          .filter((name: string) => name.length > 0);

        if (barangayNames.length) {
          const uniqueBarangays = Array.from(new Set<string>(barangayNames)).sort((a, b) => a.localeCompare(b));
          setBarangayOptions(uniqueBarangays);
        }

        const cropSource = Array.isArray(cropResponse.data?.data)
          ? cropResponse.data.data
          : Array.isArray(cropResponse.data?.crops)
            ? cropResponse.data.crops
            : [];

        const cropNames: string[] = cropSource
          .map((crop: any) => String(crop?.category ?? crop?.name ?? '').trim())
          .filter((name: string) => name.length > 0);

        if (cropNames.length) {
          const uniqueCrops = Array.from(new Set<string>(cropNames)).sort((a, b) => a.localeCompare(b));
          setCropOptions(uniqueCrops);
        }
      } catch {
        setBarangayOptions([]);
        setCropOptions([]);
      }
    };

    fetchLookups();
  }, [isOpen]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, module: '', filters: {}, selected_fields: [] }));
  }, [form.type]);

  useEffect(() => {
    if (!form.module) return;
    const nextFields = (MODULE_FIELD_CONFIG[form.module] ?? FIELD_CONFIG[form.type] ?? []).map((field) => field.key);
    setForm((prev) => ({ ...prev, filters: {}, selected_fields: nextFields }));
  }, [form.module, form.type]);

  useEffect(() => {
    if (!isOpen || !form.type || !form.module) {
      setModuleDateRange(null);
      return;
    }

    const fetchDateRange = async () => {
      try {
        const response = await axios.get('reports/date-range', {
          params: { type: form.type, module: form.module },
        });
        const nextRange: ModuleDateRange = response.data;
        setModuleDateRange(nextRange);

        if (!nextRange.has_data || !nextRange.period_from || !nextRange.period_to) {
          setErrors((prev) => ({ ...prev, module: '' }));
          return;
        }

        setErrors((prev) => ({ ...prev, module: '' }));
        setForm((prev) => {
          const from = prev.period_from && prev.period_from >= nextRange.period_from! && prev.period_from <= nextRange.period_to!
            ? prev.period_from
            : nextRange.period_from!;
          const to = prev.period_to && prev.period_to >= nextRange.period_from! && prev.period_to <= nextRange.period_to!
            ? prev.period_to
            : nextRange.period_to!;

          return { ...prev, period_from: from, period_to: to };
        });
      } catch {
        setModuleDateRange(null);
      }
    };

    fetchDateRange();
  }, [isOpen, form.type, form.module]);

  const selectedFieldCount = useMemo(() => form.selected_fields.length, [form.selected_fields]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = 'Report title is required.';
    if (!form.type) nextErrors.type = 'Classification is required.';
    if (!form.module) nextErrors.module = 'Module is required.';
    if (!form.period_from) nextErrors.period_from = 'Start date is required.';
    if (!form.period_to) nextErrors.period_to = 'End date is required.';
    if (form.period_from && form.period_to && form.period_from > form.period_to) nextErrors.period_to = 'End date must be after start date.';
    if (form.selected_fields.length === 0) nextErrors.selected_fields = 'Select at least one data field.';
    return nextErrors;
  };

  const set = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const setFilter = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, filters: { ...prev.filters, [key]: value } }));
  };

  const toggleField = (key: string) => {
    setForm((prev) => ({
      ...prev,
      selected_fields: prev.selected_fields.includes(key)
        ? prev.selected_fields.filter((field: string) => field !== key)
        : [...prev.selected_fields, key],
    }));
    setErrors((prev) => ({ ...prev, selected_fields: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        filters: Object.fromEntries(Object.entries(form.filters).filter(([, value]) => value !== '')),
      };
      const res = await axios.post('reports', payload);
      onSuccess(res.data.data);
      onClose();
      const { toast } = await import('react-toastify');
      toast.success('Report generated successfully!');
    } catch (err: any) {
      const { toast } = await import('react-toastify');
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error('Failed to generate report.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />

      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><FileText size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">Generate New Report</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Documentation & Analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Report Title *</label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Q2 Rice Harvest Summary" className={cn('w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none', errors.title ? 'border-red-400' : 'border-gray-300 dark:border-slate-700')} />
              {errors.title && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.title}</p>}
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <Layers size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">1. Report Setup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1"><Layers size={11} /> Classification *</label>
                  <Popover open={openType} onOpenChange={setOpenType}>
                    <PopoverTrigger asChild>
                      <button type="button" className={cn('w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase outline-none transition-all cursor-pointer', errors.type ? 'border-red-400' : 'border-gray-300 dark:border-slate-700', form.type ? 'text-gray-700 dark:text-white' : 'text-gray-400/70')}>
                        {form.type || 'Select Type'}
                        <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-65 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
                      <Command>
                        <CommandInput placeholder="Search type..." className="border-none focus:ring-0" />
                        <CommandList className="max-h-60 custom-scrollbar p-1">
                          <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No type found.</CommandEmpty>
                          <CommandGroup>
                            {REPORT_TYPES.map((type) => (
                              <CommandItem key={type} value={type} onSelect={() => { set('type', type); setOpenType(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                                {type}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.type && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Data Module *</label>
                  <Popover open={openModule} onOpenChange={setOpenModule}>
                    <PopoverTrigger asChild>
                      <button type="button" disabled={!form.type} className={cn('w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase outline-none transition-all', errors.module ? 'border-red-400' : 'border-gray-300 dark:border-slate-700', !form.type ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer', form.module ? 'text-gray-700 dark:text-white' : 'text-gray-400/70')}>
                        {form.module || (form.type ? 'Select Module' : 'Select Type First')}
                        <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-65 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
                      <Command>
                        <CommandInput placeholder="Search module..." className="border-none focus:ring-0" />
                        <CommandList className="max-h-60 custom-scrollbar p-1">
                          <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No module found.</CommandEmpty>
                          <CommandGroup>
                            {availableModules.map((module) => (
                              <CommandItem key={module} value={module} onSelect={() => { set('module', module); setOpenModule(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                                {module}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.module && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.module}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1"><Calendar size={11} /> Period From *</label>
                  <input
                    type="date"
                    value={form.period_from}
                    onChange={(e) => set('period_from', e.target.value)}
                    className={cn('w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer', errors.period_from ? 'border-red-400' : 'border-gray-300 dark:border-slate-700')}
                  />
                  {errors.period_from && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.period_from}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1"><Calendar size={11} /> Period To *</label>
                  <input
                    type="date"
                    value={form.period_to}
                    onChange={(e) => set('period_to', e.target.value)}
                    className={cn('w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer', errors.period_to ? 'border-red-400' : 'border-gray-300 dark:border-slate-700')}
                  />
                  {errors.period_to && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.period_to}</p>}
                </div>
                {moduleDateRange?.has_data && moduleDateRange.period_from && moduleDateRange.period_to && (
                  <div className="sm:col-span-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    Available data range for this module: {moduleDateRange.period_from} to {moduleDateRange.period_to}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Output Format</label>
                  <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl w-fit">
                    {(['PDF', 'XLSX'] as const).map((format) => (
                      <button key={format} type="button" onClick={() => set('format', format)} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer', form.format === format ? format === 'PDF' ? 'bg-red-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600')}>
                        {format === 'PDF' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1"><User size={11} /> Initial Status</label>
                  <Popover open={openStatus} onOpenChange={setOpenStatus}>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase text-gray-700 dark:text-white outline-none transition-all cursor-pointer">
                        {form.status}
                        <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-55 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
                      <Command>
                        <CommandList className="p-1">
                          <CommandGroup>
                            {STATUS_OPTIONS.map((status) => (
                              <CommandItem key={status} value={status} onSelect={() => { set('status', status); setOpenStatus(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                                {status}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <Filter size={16} />
                <h3 className="text-[11px] font-black uppercase tracking-widest">2. Selection Filters {form.module ? `- ${form.module}` : ''}</h3>
              </div>
              {!form.module ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/40 px-4 py-5 text-[11px] font-bold text-gray-500 dark:text-slate-300">
                  Select a data module first to show the specific filter options.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableFilters.map((field) => (
                    <label key={field.key} className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block">{field.label}</span>
                      {field.type === 'select' ? (
                        <FilterSelectField
                          value={form.filters[field.key] || ''}
                          onChange={(value) => setFilter(field.key, value)}
                          options={field.options ?? []}
                          placeholder={`All ${field.label}`}
                        />
                      ) : (
                        <input value={form.filters[field.key] || ''} onChange={(e) => setFilter(field.key, e.target.value)} placeholder={`Filter by ${field.label.toLowerCase()}...`} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-primary">
                  <ListFilter size={16} />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">3. Data Fields To Include</h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <CheckSquare size={12} /> {selectedFieldCount} selected
                </div>
              </div>
              {!form.module ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/40 px-4 py-5 text-[11px] font-bold text-gray-500 dark:text-slate-300">
                  Select a data module first to choose which fields will appear in PDF/Excel.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFields.map((field) => {
                  const checked = form.selected_fields.includes(field.key);
                  return (
                    <button key={field.key} type="button" onClick={() => toggleField(field.key)} className={cn('flex items-center justify-between gap-3 px-4 py-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer', checked ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-700')}>
                      <span>{field.label}</span>
                      <span className={cn('w-4 h-4 rounded border flex items-center justify-center', checked ? 'border-white bg-white/20' : 'border-gray-300')}>{checked ? '✓' : ''}</span>
                    </button>
                  );
                })}
                </div>
              )}
              {errors.selected_fields && <p className="text-[10px] text-red-500 font-bold">{errors.selected_fields}</p>}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1"><StickyNote size={11} /> Notes / Remarks</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional - add context or remarks about this report..." rows={3} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none resize-none" />
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-4 bg-primary hover:opacity-90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer">
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><FileText size={15} /> Generate Report</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FilterSelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const displayValue = value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none flex items-center justify-between cursor-pointer">
          <span className={cn('truncate', !value && 'text-gray-400')}>{displayValue}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-65 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="border-none focus:ring-0" />
          <CommandList className="max-h-60 custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No option found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All"
                onSelect={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
              >
                All
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer"
                >
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
