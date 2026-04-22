import React from 'react';
import { MapPin, Calendar, User, Edit3, Trash2, Wheat, Eye, Scale } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface HarvestTableProps {
  isLoading: boolean;
  items: any[];
  allFilteredItems: any[]; 
  onView: (harvest: any) => void;
  onEdit?: (harvest: any) => void;
  onDelete?: (id: number) => void;
  currentPage: number;
  // 🌟 FIX: Gi-ilisan ang type ngadto sa normal nga function nga modawat og number
  setCurrentPage: (page: number) => void; 
  totalPages: number;
}

const HarvestTable: React.FC<HarvestTableProps> = ({ 
  isLoading, items, allFilteredItems, onView, onEdit, onDelete,
  currentPage, setCurrentPage, totalPages 
}) => {
  const indexOfFirstItem = (currentPage - 1) * 10;
  const indexOfLastItem = Math.min(currentPage * 10, allFilteredItems.length);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}
      
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse min-w-225">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Farmer & Location</th>
              <th className="px-8 py-5">Crop Details</th>
              <th className="px-8 py-5">Yield & Quality</th>
              <th className="px-8 py-5 text-center">Est. Value/Selling</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-200 dark:bg-slate-700 shrink-0" />
                      <div className="space-y-2 w-full">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="space-y-2.5">
                      <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                      <div className="h-5 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="space-y-3">
                      <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                      <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-28" />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center align-middle">
                    <div className="h-7 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg mx-auto" />
                  </td>
                  <td className="px-8 py-5 text-right align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                      <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                      <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((h: any) => (
                <tr key={h.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">
                          {h.farmer}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate max-w-37.5">{h.barangay}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2 text-[13px] font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">
                        <Wheat size={14} className="text-primary"/>{h.crop}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Calendar size={12} className="text-gray-400"/> {h.dateHarvested}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col gap-2 items-start">
                      <div className="flex items-center gap-2 text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                        <Scale size={14} className="text-gray-400"/> {h.quantity}
                      </div>
                      <span className={cn("px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border", 
                          h.quality === 'Grade A' || h.quality === 'Premium' 
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                          : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      )}>{h.quality}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center align-middle">
                     <p className="text-sm font-black text-primary">₱ {Number(h.value?.replace(/[^0-9.-]+/g,"") || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  </td>
                  <td className="px-8 py-5 text-right align-middle">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onView(h)} className="p-2.5 text-gray-400 bg-transparent hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer" title="View Record">
                        <Eye size={16} />
                      </button>
                      {onEdit && (
                        <button onClick={() => onEdit(h)} className="p-2.5 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer" title="Edit Record">
                          <Edit3 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(h.id)} className="p-2.5 text-gray-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer" title="Delete Record">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-24">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-dashed border-gray-200 dark:border-slate-700 mb-4">
                      <Wheat size={32} className="text-gray-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-1">No Records Found</h3>
                    <p className="text-[11px] font-bold text-gray-400 max-w-xs mx-auto">Try adjusting your search or timeline filters to find what you're looking for.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/30 dark:bg-slate-900/50 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">
          Showing <span className="text-gray-700 dark:text-slate-300 font-black">{allFilteredItems.length === 0 ? 0 : indexOfFirstItem + 1}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{indexOfLastItem}</span> of <span className="text-primary font-black">{allFilteredItems.length}</span> Entries
        </p>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* 🌟 FIX: Gi-ilisan nato ang setCurrentPage(p => p - 1) padulong sa setCurrentPage(currentPage - 1) */}
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:hover:border-gray-200 cursor-pointer shadow-sm">Prev</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setCurrentPage(n)} className={cn("w-8 h-8 rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-sm border", currentPage === n ? "bg-primary border-primary text-white scale-105" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-primary/30 hover:text-primary")}>{n}</button>
            ))}
            
            {/* 🌟 FIX: Gi-ilisan nato ang setCurrentPage(p => p + 1) padulong sa setCurrentPage(currentPage + 1) */}
            <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:hover:border-gray-200 cursor-pointer shadow-sm">Next</button>
        </div>
      </div>
    </div>
  );
}

export default HarvestTable;
