import { useState, useEffect } from 'react';
import { 
  X, Save, Loader2, LayoutGrid, 
  Banknote, Receipt, Tag, Edit3, FolderKanban, Calendar, ShieldCheck
} from 'lucide-react';
import { cn } from '../../../../lib/utils'; 
import SearchableSelect from '../SearchableSelect';
import axios from '../../../../plugin/axios'; // 🌟 Import Axios
import { toast } from 'react-toastify'; // 🌟 Import Toast

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedExpense: any) => void;
  expense: any;
  categories: string[];
  projects: string[];
  onAddCategory: (val: string) => void;
  onAddProject: (val: string) => void;
}

const STATUS_OPTIONS = ["Paid", "Pending", "Cancelled", "Refunded"];

export default function EditExpenseModal({ 
    isOpen, onClose, onSuccess, expense, // <-- Gi-add ang onSuccess diri
    categories, projects, 
    onAddCategory, onAddProject 
}: EditExpenseModalProps) {
    
  const [formData, setFormData] = useState({ 
    item: "", category: "", project: "", amount: "", date: "", status: "" 
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (expense && isOpen) {
        const rawAmount = expense.amount ? expense.amount.toString().replace(/[₱,]/g, '') : "";
        setFormData({
            item: expense.item || "",
            category: expense.category || "",
            project: expense.project || "",
            amount: rawAmount,
            date: expense.date_incurred ? new Date(expense.date_incurred).toISOString().split('T')[0] : "", 
            status: expense.status || "Pending",
        });
        setErrors({}); 
    }
  }, [expense, isOpen]);

  if (!isOpen || !expense) return null;

  const validateForm = () => {
      let newErrors: Record<string, string> = {};
      if (!formData.item) newErrors.item = "Expense item is required.";
      if (!formData.category) newErrors.category = "Category is required.";
      if (!formData.project) newErrors.project = "Project allocation is required.";
      if (!formData.amount) newErrors.amount = "Amount is required.";
      if (!formData.date) newErrors.date = "Date is required.";
      if (!formData.status) newErrors.status = "Status is required.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
        const response = await axios.put(`expenses/${expense.id}`, {
            item: formData.item,
            category: formData.category,
            project: formData.project,
            amount: formData.amount,
            date_incurred: formData.date,
            status: formData.status
        });

        toast.success("Expense updated successfully!");
        
        // 🌟 IPASA ANG NA-UPDATE NGA DATA PAINGON SA PARENT
        onSuccess(response.data.data); 
        onClose();

    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to update expense.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
        {/* Backdrop (magsira ra sa modal, DILI mo-refresh sa table) */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
        
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            
            {/* HEADER */}
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Edit3 size={20} /></div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Edit Expense</h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">REF: {expense.ref_no}</p>
                    </div>
                </div>
                <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
                <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* 1. CATEGORIZATION & PROJECT */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <LayoutGrid size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">1. Categorization & Project</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expense Category <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><Tag size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Select Category" options={categories} defaultOptions={categories} 
                                        value={formData.category} onAdd={onAddCategory} onDelete={()=>{}} 
                                        onChange={(val) => { setFormData({...formData, category: val}); setErrors({...errors, category: ""}); }} 
                                    />
                                </div>
                                {errors.category && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.category}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Project Allocation <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-primary z-10"><FolderKanban size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Select Program/Project" options={projects} defaultOptions={projects} 
                                        value={formData.project} onAdd={onAddProject} onDelete={()=>{}} 
                                        onChange={(val) => { setFormData({...formData, project: val}); setErrors({...errors, project: ""}); }} 
                                    />
                                </div>
                                {errors.project && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.project}</p>}
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expense Item / Title <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <Receipt className="absolute left-4 text-gray-400" size={16} />
                                    <input type="text" className={cn("w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none uppercase", errors.item ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} value={formData.item} onChange={(e) => { setFormData({...formData, item: e.target.value}); setErrors({...errors, item: ""}); }} />
                                </div>
                                {errors.item && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.item}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-800" />

                    {/* 2. FINANCIALS & STATUS */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 text-primary">
                            <div className="p-1.5 bg-primary/10 rounded-2xl"><Banknote size={14}/></div>
                            <span className="text-[11px] font-black uppercase tracking-widest">2. Financials & Status</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₱) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.01" className={cn("w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none text-primary", errors.amount ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} value={formData.amount} onChange={(e) => { setFormData({...formData, amount: e.target.value}); setErrors({...errors, amount: ""}); }} />
                                {errors.amount && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.amount}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <Calendar className="absolute left-4 text-gray-400" size={16} />
                                    <input type="date" className={cn("w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold outline-none", errors.date ? "border-red-500 focus:border-red-500" : "border-gray-300 dark:border-slate-700")} value={formData.date} onChange={(e) => { setFormData({...formData, date: e.target.value}); setErrors({...errors, date: ""}); }} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Status <span className="text-red-500">*</span></label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-gray-400 z-10"><ShieldCheck size={16} /></div>
                                    <SearchableSelect 
                                        placeholder="Status" 
                                        options={STATUS_OPTIONS} defaultOptions={STATUS_OPTIONS} 
                                        value={formData.status} 
                                        showAddButton={false}
                                        side="top" 
                                        onAdd={()=>{}} onDelete={()=>{}} 
                                        onChange={(val) => { setFormData({...formData, status: val}); setErrors({...errors, status: ""}); }} 
                                    />
                                </div>
                                {errors.status && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.status}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isSaving} className={cn("px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95", isSaving && "opacity-50 cursor-not-allowed")}>
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                        {isSaving ? 'Updating...' : 'Update Expense'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}