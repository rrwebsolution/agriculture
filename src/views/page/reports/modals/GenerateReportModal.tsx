import { useState, useEffect } from 'react';
import { X, FileText, FileSpreadsheet, Loader2, Calendar, Layers, User, StickyNote, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../components/ui/command';

const REPORT_TYPES = [
  'Production',
  'Fishery',
  'Financial',
  'Census',
  'Inventory',
];

const MODULE_MAP: Record<string, string[]> = {
  Production: ['Harvest Records', 'Planting Records', 'Crop Program'],
  Fishery: ['Fish Catch Data', 'Fisherfolk Registry', 'Fishpond Records'],
  Financial: ['Expense Summary', 'Budget Utilization', 'Program Expenditures'],
  Census: ['Farmer Registry', 'Fisherfolk Registry', 'Cooperative Listings', 'Barangay Profile'],
  Inventory: ['Equipment Status', 'Supply Inventory', 'Distribution Records'],
};

const STATUS_OPTIONS = ['Published', 'Pending Review', 'Draft'];

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
  status: 'Pending Review',
  notes: '',
};

export default function GenerateReportModal({ isOpen, onClose, onSuccess }: GenerateReportModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openType, setOpenType] = useState(false);
  const [openModule, setOpenModule] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, module: '' }));
  }, [form.type]);

  const availableModules = form.type ? MODULE_MAP[form.type] ?? [] : [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Report title is required.';
    if (!form.type) e.type = 'Classification is required.';
    if (!form.module) e.module = 'Module is required.';
    if (!form.period_from) e.period_from = 'Start date is required.';
    if (!form.period_to) e.period_to = 'End date is required.';
    if (form.period_from && form.period_to && form.period_from > form.period_to)
      e.period_to = 'End date must be after start date.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const { default: axios } = await import('../../../../plugin/axios');
      const res = await axios.post('reports', form);
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

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />

      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="text-primary" size={16} />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Report Generation</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
              Generate <span className="text-primary italic">New Report</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">

            {/* TITLE */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Report Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Q2 Rice Harvest Summary"
                className={cn('w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all', errors.title ? 'border-red-400' : 'border-gray-100 dark:border-slate-700')}
              />
              {errors.title && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.title}</p>}
            </div>

            {/* TYPE & MODULE ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Layers size={11} /> Classification *
                </label>
                <Popover open={openType} onOpenChange={setOpenType}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase outline-none transition-all cursor-pointer',
                        errors.type ? 'border-red-400' : 'border-gray-100 dark:border-slate-700',
                        form.type ? 'text-gray-700 dark:text-white' : 'text-gray-400/70'
                      )}
                    >
                      {form.type || 'Select Type'}
                      <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-65 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <Command>
                      <CommandInput placeholder="Search type..." className="border-none focus:ring-0" />
                      <CommandList className="max-h-60 custom-scrollbar p-1">
                        <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No type found.</CommandEmpty>
                        <CommandGroup>
                          {REPORT_TYPES.map((t) => (
                            <CommandItem key={t} value={t} onSelect={() => { set('type', t); setOpenType(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                              {t}
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
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Data Module *</label>
                <Popover open={openModule} onOpenChange={setOpenModule}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={!form.type}
                      className={cn(
                        'w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold uppercase outline-none transition-all',
                        errors.module ? 'border-red-400' : 'border-gray-100 dark:border-slate-700',
                        !form.type ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                        form.module ? 'text-gray-700 dark:text-white' : 'text-gray-400/70'
                      )}
                    >
                      {form.module || (form.type ? 'Select Module' : 'Select Type First')}
                      <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-65 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <Command>
                      <CommandInput placeholder="Search module..." className="border-none focus:ring-0" />
                      <CommandList className="max-h-60 custom-scrollbar p-1">
                        <CommandEmpty className="py-6 text-[10px] font-bold uppercase text-center text-gray-400">No module found.</CommandEmpty>
                        <CommandGroup>
                          {availableModules.map((m) => (
                            <CommandItem key={m} value={m} onSelect={() => { set('module', m); setOpenModule(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                              {m}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.module && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.module}</p>}
              </div>
            </div>

            {/* PERIOD ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Calendar size={11} /> Period From *
                </label>
                <input
                  type="date"
                  value={form.period_from}
                  onChange={(e) => set('period_from', e.target.value)}
                  className={cn('w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer', errors.period_from ? 'border-red-400' : 'border-gray-100 dark:border-slate-700')}
                />
                {errors.period_from && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.period_from}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Calendar size={11} /> Period To *
                </label>
                <input
                  type="date"
                  value={form.period_to}
                  onChange={(e) => set('period_to', e.target.value)}
                  className={cn('w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer', errors.period_to ? 'border-red-400' : 'border-gray-100 dark:border-slate-700')}
                />
                {errors.period_to && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.period_to}</p>}
              </div>
            </div>

            {/* FORMAT & STATUS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FORMAT TOGGLE */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Output Format</label>
                <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl w-fit">
                  {(['PDF', 'XLSX'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => set('format', fmt)}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer',
                        form.format === fmt
                          ? fmt === 'PDF' ? 'bg-red-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      {fmt === 'PDF' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <User size={11} /> Initial Status
                </label>
                <Popover open={openStatus} onOpenChange={setOpenStatus}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-12 flex items-center justify-between px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold uppercase text-gray-700 dark:text-white outline-none transition-all cursor-pointer"
                    >
                      {form.status}
                      <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-55 bg-white dark:bg-slate-900 rounded-2xl z-200 border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <Command>
                      <CommandList className="p-1">
                        <CommandGroup>
                          {STATUS_OPTIONS.map((s) => (
                            <CommandItem key={s} value={s} onSelect={() => { set('status', s); setOpenStatus(false); }} className="text-xs font-bold uppercase py-3 px-4 rounded-xl cursor-pointer">
                              {s}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* NOTES */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <StickyNote size={11} /> Notes / Remarks
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Optional — add context or remarks about this report..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 p-8 pt-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-primary hover:opacity-90 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><FileText size={15} /> Generate Report</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
