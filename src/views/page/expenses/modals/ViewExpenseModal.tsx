import { X, Eye, Receipt, Calendar, Tag, Layers, Banknote, ShieldAlert, CalendarX } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ViewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: any;
}

export default function ViewExpenseModal({ isOpen, onClose, expense }: ViewExpenseModalProps) {
  if (!isOpen || !expense) return null;

  // 🌟 Check if the record is currently in the archive
  const isArchived = !!expense.deleted_at;

  // Helper para sa Currency Format
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(parseFloat(amount) || 0);
  };

  // Helper para sa Date Format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            
            {/* HEADER */}
            <div className={cn(
              "p-6 flex items-center justify-between shrink-0",
              isArchived ? "bg-amber-600" : "bg-slate-800"
            )}>
                <div className="flex items-center gap-4 text-white">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Eye size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                          {isArchived ? "Archived Record" : "View Expense Record"}
                        </h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">
                          {isArchived ? "Deleted from Active list" : "System Audit Log"}
                        </p>
                    </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors"><X size={20} /></button>
            </div>
            
            {/* BODY */}
            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                {/* 1. EXPENSE DETAILS */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Receipt size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">1. Expense Information</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 md:col-span-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expense Item / Title</p>
                            <p className="text-lg font-black text-gray-800 dark:text-white uppercase leading-tight">{expense.item}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Tag size={12}/> Category</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase">{expense.category}</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Layers size={12}/> Project Allocation</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase">{expense.project || "N/A"}</p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-slate-800" />

                {/* 2. FINANCIALS & TIMELINE */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Banknote size={14}/> <span className="text-[11px] font-black uppercase tracking-widest">2. Financial & Timeline Details</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-primary leading-none">{formatCurrency(expense.amount)}</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><ShieldAlert size={12}/> Payment Status</p>
                            <span className={cn(
                                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg inline-block mt-1",
                                expense.status === 'Paid' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                            )}>
                                {expense.status}
                            </span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Receipt size={12}/> Reference No.</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase">{expense.ref_no}</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12}/> Date Incurred</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase">{formatDate(expense.date_incurred)}</p>
                        </div>

                        {/* 🌟 ARCHIVED SPECIFIC FIELD */}
                        {isArchived && (
                          <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10 md:col-span-2">
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <CalendarX size={12}/> Deleted On
                              </p>
                              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase">
                                {formatDate(expense.deleted_at)}
                              </p>
                          </div>
                        )}
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end shrink-0">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className={cn(
                    "px-8 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-lg active:scale-95",
                    isArchived ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-slate-800 hover:bg-slate-700 shadow-slate-800/20"
                  )}
                >
                    Close Window
                </button>
            </div>

        </div>
    </div>
  );
}