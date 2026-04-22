import { Receipt, Calendar, Eye, Edit3, Trash2, LayoutList, Database, RotateCcw, CalendarX } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ExpensesTableProps {
  expenses: any[];
  isLoading: boolean;
  isArchived?: boolean; 
  onView: (expense: any) => void;
  onEdit?: (expense: any) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void; 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

export default function ExpensesTable({ 
  expenses, isLoading, isArchived = false,
  onView, onEdit, onDelete, onRestore,
  currentPage, totalPages, onPageChange, indexOfFirstItem, indexOfLastItem
}: ExpensesTableProps) {

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 ml-2 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border", isArchived ? "bg-amber-500/10 text-amber-600 border-amber-500/10" : "bg-primary/10 text-primary border-primary/10")}>
          <LayoutList size={20} />
        </div>
        <div>
          <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1", isArchived ? "text-amber-600" : "text-primary")}>
            {isArchived ? "Archive Registry" : "Financial Tracking"}
          </p>
          <h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            List of <span className={cn("italic", isArchived ? "text-amber-600" : "text-primary")}>
              {isArchived ? "Archived Expenses" : "Active Expenses"}
            </span>
          </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
            <div className="h-full bg-primary w-[40%] animate-progress-loop" />
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Expense Details</th>
                <th className="px-8 py-5">Category & Project</th>
                <th className="px-8 py-5">Date Incurred</th>
                {isArchived && <th className="px-8 py-5 text-amber-600">Deleted On</th>}
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">{(onEdit || onDelete || onRestore) ? 'Actions' : 'View'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                    <td className="px-8 py-6"><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0" /><div className="space-y-2 w-full mt-1"><div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" /><div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" /></div></div></td>
                    <td className="px-8 py-6"><div className="space-y-3"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" /><div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" /></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" /></td>
                    {isArchived && <td className="px-8 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" /></td>}
                    <td className="px-8 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" /></td>
                    <td className="px-8 py-6"><div className="flex justify-center"><div className="w-16 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" /></div></td>
                    <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div></td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all", isArchived ? "bg-amber-500/10 text-amber-600 border-amber-500/5" : "bg-primary/10 text-primary border-primary/5")}>
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{exp.item}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">REF: {exp.ref_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-middle">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5">{exp.project}</p>
                      <span className={cn("px-3 py-1 text-[9px] font-black uppercase rounded-lg border tracking-wider", isArchived ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary/5 text-primary border-primary/10")}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 align-middle">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-gray-400"/>
                        <span>{formatDate(exp.date_incurred)}</span>
                      </div>
                    </td>
                    {isArchived && (
                      <td className="px-8 py-6 align-middle">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600/70">
                          <CalendarX size={14} />
                          <span>{formatDate(exp.deleted_at)}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-6 align-middle">
                      <p className={cn("text-sm font-black", isArchived ? "text-slate-400" : "text-primary")}>{formatCurrency(exp.amount)}</p>
                    </td>
                    <td className="px-8 py-6 align-middle text-center">
                      <span className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border",
                        exp.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400'
                      )}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => onView(exp)} title="View Details" className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"><Eye size={16} /></button>
                        {isArchived && (onRestore || onDelete) ? (
                          <>
                            <button type="button" onClick={() => onRestore && onRestore(exp.id)} title="Restore Record" className="p-2.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer">
                              <RotateCcw size={16} />
                            </button>
                            <button type="button" onClick={() => onDelete && onDelete(exp.id)} title="Delete Permanently" className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : !isArchived && (onEdit || onDelete) ? (
                          <>
                            <button type="button" onClick={() => onEdit && onEdit(exp)} title="Edit Expense" className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"><Edit3 size={16} /></button>
                            <button type="button" onClick={() => onDelete && onDelete(exp.id)} title="Archive Record" className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isArchived ? 7 : 6} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-700"><Database size={40} strokeWidth={1} /></div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">
                            {isArchived ? "No Archived Records Found" : "No Active Records Found"}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Try adjusting your date or search filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/50 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-700 dark:text-slate-300 font-black">{expenses.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{Math.min(indexOfLastItem, expenses.length)}</span> of <span className="text-primary font-black">{expenses.length}</span> Entries
            </p>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage === 1 || isLoading} onClick={() => onPageChange(currentPage - 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 shadow-sm cursor-pointer">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button key={pageNum} onClick={() => onPageChange(pageNum)} className={cn("w-8 h-8 rounded-xl text-[11px] font-black transition-all shadow-sm border cursor-pointer", currentPage === pageNum ? "bg-primary border-primary text-white scale-105" : "bg-white dark:bg-slate-800 border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary")}>{pageNum}</button>
              ))}
              <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => onPageChange(currentPage + 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 shadow-sm cursor-pointer">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}
