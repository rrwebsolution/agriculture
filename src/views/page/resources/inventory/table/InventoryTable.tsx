import { Package, Eye, ArrowDownLeft, ArrowUpNarrowWide, Edit3, Database, LayoutList } from 'lucide-react';
import { cn } from '../../../../../lib/utils';

interface InventoryTableProps {
  isLoading: boolean;
  currentItems: any[];
  filteredLength: number;
  currentPage: number;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  onPageChange: (page: number) => void;
  onView: (item: any) => void;
  onAddStock: (item: any) => void;
  onDistribute: (item: any) => void;
  onEdit: (item: any) => void;
}

export default function InventoryTable({
  isLoading, currentItems, filteredLength, currentPage, totalPages,
  indexOfFirstItem, indexOfLastItem, onPageChange,
  onView, onAddStock, onDistribute, onEdit
}: InventoryTableProps) {
  return (
    <div className="space-y-4">
      {/* 🌟 TABLE HEADER LABEL */}
      <div className="flex items-center gap-3 ml-2 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
          <LayoutList size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">Record Registry</p>
          <h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            List of <span className="text-primary italic">Inventory Items</span>
          </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
            <div className="h-full bg-primary w-[40%] animate-progress-loop" />
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Item & Details</th>
                <th className="px-8 py-5">Program & Category</th>
                <th className="px-8 py-5">Stock Level</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                    <td className="px-8 py-6"><div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0" /><div className="space-y-2 w-full mt-1"><div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" /><div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" /></div></div></td>
                    <td className="px-8 py-6"><div className="space-y-3"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" /><div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" /></div></td>
                    <td className="px-8 py-6"><div className="space-y-3"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" /><div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-full" /></div></td>
                    <td className="px-8 py-6"><div className="flex justify-center"><div className="w-16 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" /></div></td>
                    <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" /><div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div></td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Package size={18} /></div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{item.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.sku} | BATCH: {item.batch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-middle">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1.5">{item.commodity}</p>
                      <span className={cn(
                          "px-3 py-1 text-[9px] font-black uppercase rounded-lg border tracking-wider",
                          item.category.includes('Organic') ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          item.category.includes('Inorganic') ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400' : 
                          item.category === 'Equipment' ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800' :
                          'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10'
                      )}>{item.category}</span>
                    </td>
                    <td className="px-8 py-6 align-middle">
                      <div className="flex flex-col gap-1.5 min-w-30">
                        <div className="flex justify-between items-end">
                          <p className="text-sm font-black text-gray-800 dark:text-white leading-none">{item.stock} <span className="text-[10px] text-gray-400">{item.unit}</span></p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Min: {item.threshold}</p>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full transition-all duration-500", item.stock === 0 ? 'bg-red-500' : item.stock <= item.threshold ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${Math.min((item.stock / (item.threshold * 2.5)) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-middle text-center">
                      <span className={cn(
                          "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md",
                          item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : 
                          item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600' : 
                          'bg-red-50 text-red-600'
                      )}>{item.status}</span>
                    </td>
                    <td className="px-8 py-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onView(item)} title="View Transactions" className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"><Eye size={16} /></button>
                        <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                        <button onClick={() => onAddStock(item)} title="Add Stock" className="p-2.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all cursor-pointer"><ArrowDownLeft size={18} /></button>
                        <button onClick={() => onDistribute(item)} disabled={item.stock === 0} title="Distribute Stock" className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all disabled:opacity-30 cursor-pointer"><ArrowUpNarrowWide size={18} /></button>
                        <button onClick={() => onEdit(item)} title="Edit Details" className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"><Edit3 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-700"><Database size={40} strokeWidth={1} /></div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">No Inventory Items Found</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Try adjusting your search or filters</p>
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
              Showing <span className="text-gray-700 dark:text-slate-300 font-black">{filteredLength > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{Math.min(indexOfLastItem, filteredLength)}</span> of <span className="text-primary font-black">{filteredLength}</span> Entries
            </p>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage === 1 || isLoading} onClick={() => onPageChange(currentPage - 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button key={pageNum} onClick={() => onPageChange(pageNum)} className={cn("w-8 h-8 rounded-xl text-[11px] font-black transition-all shadow-sm border cursor-pointer", currentPage === pageNum ? "bg-primary border-primary text-white scale-105" : "bg-white dark:bg-slate-800 border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary")}>{pageNum}</button>
              ))}
              <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => onPageChange(currentPage + 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}