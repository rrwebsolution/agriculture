import { useEffect, useMemo, useState } from 'react';
import { X, FileText, FileSpreadsheet, Loader2, Calendar, Layers, User, StickyNote, ChevronsUpDown, Filter, ListFilter, CheckSquare } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';

const REPORT_TYPES = ['Production', 'Fishery', 'Financial', 'Census', 'Inventory'];

const MODULE_MAP: Record<string, string[]> = {
  Production: ['Harvest Records', 'Planting Records', 'Crop Program'],
  Fishery: ['Fish Catch Data', 'Fisherfolk Registry', 'Fishpond Records'],
  Financial: ['Expense Summary', 'Budget Utilization', 'Program Expenditures'],
  Census: ['Farmer Registry', 'Fisherfolk Registry', 'Cooperative Listings', 'Barangay Profile'],
  Inventory: ['Equipment Status', 'Supply Inventory', 'Distribution Records'],
};

const STATUS_OPTIONS = ['Published', 'Pending Review', 'Draft'];

const FILTER_CONFIG: Record<string, { key: string; label: string; type?: 'text' | 'select'; options?: string[] }[]> = {
  Production: [
    { key: 'barangay_id', label: 'Barangay ID' },
    { key: 'crop_id', label: 'Crop ID' },
    { key: 'farmer_id', label: 'Farmer ID' },
    { key: 'quality', label: 'Quality' },
  ],
  Fishery: [
    { key: 'fishr_id', label: 'Fisherfolk ID' },
    { key: 'gear_type', label: 'Gear Type' },
    { key: 'fishing_area', label: 'Fishing Area' },
  ],
  Financial: [
    { key: 'category', label: 'Category' },
    { key: 'project', label: 'Project' },
    { key: 'status', label: 'Expense Status' },
  ],
  Census: [
    { key: 'barangay_id', label: 'Barangay ID' },
    { key: 'crop_id', label: 'Crop ID' },
    { key: 'gender', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
    { key: 'status', label: 'Farmer Status', type: 'select', options: ['active', 'inactive'] },
    { key: 'is_main_livelihood', label: 'Main Livelihood', type: 'select', options: ['true', 'false'] },
  ],
  Inventory: [
    { key: 'category', label: 'Category' },
    { key: 'commodity', label: 'Commodity' },
    { key: 'status', label: 'Inventory Status' },
    { key: 'year', label: 'Year' },
  ],
};

const FIELD_CONFIG: Record<string, { key: string; label: string }[]> = {
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

const MODULE_FILTER_CONFIG: Record<string, { key: string; label: string; type?: 'text' | 'select'; options?: string[] }[]> = {
  'Farmer Registry': FILTER_CONFIG.Census,
  'Fisherfolk Registry': [
    { key: 'barangay_id', label: 'Barangay ID' },
    { key: 'gender', label: 'Sex', type: 'select', options: ['Male', 'Female'] },
    { key: 'status', label: 'Registry Status', type: 'select', options: ['active', 'inactive'] },
    { key: 'fisher_type', label: 'Fisher Type' },
  ],
};

const MODULE_FIELD_CONFIG: Record<string, { key: string; label: string }[]> = {
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
};

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: any) => void;
}

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

  const availableModules = form.type ? MODULE_MAP[form.type] ?? [] : [];
  const availableFilters = form.module
    ? MODULE_FILTER_CONFIG[form.module] ?? FILTER_CONFIG[form.type] ?? []
    : form.type ? FILTER_CONFIG[form.type] ?? [] : [];
  const availableFields = form.module
    ? MODULE_FIELD_CONFIG[form.module] ?? FIELD_CONFIG[form.type] ?? []
    : form.type ? FIELD_CONFIG[form.type] ?? [] : [];

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const nextFields = FIELD_CONFIG[form.type]?.map((field) => field.key) || [];
    setForm((prev) => ({ ...prev, module: '', filters: {}, selected_fields: nextFields }));
  }, [form.type]);

  useEffect(() => {
    if (!form.module) return;
    const nextFields = (MODULE_FIELD_CONFIG[form.module] ?? FIELD_CONFIG[form.type] ?? []).map((field) => field.key);
    setForm((prev) => ({ ...prev, filters: {}, selected_fields: nextFields }));
  }, [form.module, form.type]);

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
      const { default: axios } = await import('../../../../plugin/axios');
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
                  <input type="date" value={form.period_from} onChange={(e) => set('period_from', e.target.value)} className={cn('w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer', errors.period_from ? 'border-red-400' : 'border-gray-300 dark:border-slate-700')} />
                  {errors.period_from && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.period_from}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1"><Calendar size={11} /> Period To *</label>
                  <input type="date" value={form.period_to} onChange={(e) => set('period_to', e.target.value)} className={cn('w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer', errors.period_to ? 'border-red-400' : 'border-gray-300 dark:border-slate-700')} />
                  {errors.period_to && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.period_to}</p>}
                </div>

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
                <h3 className="text-[11px] font-black uppercase tracking-widest">2. Report Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFilters.map((field) => (
                  <label key={field.key} className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 block">{field.label}</span>
                    {field.type === 'select' ? (
                      <select value={form.filters[field.key] || ''} onChange={(e) => setFilter(field.key, e.target.value)} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                        <option value="">All</option>
                        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : (
                      <input value={form.filters[field.key] || ''} onChange={(e) => setFilter(field.key, e.target.value)} placeholder={`Filter by ${field.label.toLowerCase()}...`} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-primary">
                  <ListFilter size={16} />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">3. Selected Data Fields</h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <CheckSquare size={12} /> {selectedFieldCount} selected
                </div>
              </div>
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
