import React from 'react';
import { MapPin, Calendar, User, Clock, Edit3, Trash2, Sprout, Eye } from 'lucide-react'; 
import { cn } from '../../../../lib/utils'; 

interface PlantingTableProps {
  isLoading: boolean;
  items: any[];
  allFilteredItems: any[]; 
  onView: (planting: any) => void;
  onEdit: (planting: any) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const getGrowthStatusColor = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('seedling')) return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
  if (s.includes('vegetative')) return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
  if (s.includes('flowering')) return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/30";
  if (s.includes('maturity') || s.includes('harvest')) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
  if (s.includes('destroy') || s.includes('damage')) return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
  return "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400 border-gray-200 dark:border-slate-700"; 
};

const PlantingTable: React.FC<PlantingTableProps> = ({ 
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
              <th className="px-8 py-5">Timeline</th>
              <th className="px-8 py-5 text-center">Growth Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-5 align-middle"><div className="flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-gray-200 dark:bg-slate-700 shrink-0" /><div className="space-y-2 w-full"><div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" /><div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" /></div></div></td>
                  <td className="px-8 py-5 align-middle"><div className="space-y-2.5"><div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-24" /><div className="h-5 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg" /></div></td>
                  <td className="px-8 py-5 align-middle"><div className="space-y-3"><div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-32" /><div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-28" /></div></td>
                  <td className="px-8 py-5 text-center align-middle"><div className="h-7 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg mx-auto" /></td>
                  <td className="px-8 py-5 text-right align-middle"><div className="flex items-center justify-end gap-2"><div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" /><div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" /><div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div></td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((p: any) => {
                // 🌟 BULLETPROOF FALLBACK PARA SA BARANGAY NAME
                const barangayName = p.barangay?.name || p.farmer?.barangay?.name || 'Unknown Location';

                return (
                  <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                    <td className="px-8 py-5 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm"><User size={18} /></div>
                        <div>
                          <p className="text-[13px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">
                            {p.farmer?.first_name} {p.farmer?.last_name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest" title={barangayName}>
                            <MapPin size={12} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-37.5 sm:max-w-50">
                              {barangayName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 align-middle">
                      <div className="flex flex-col items-start gap-1.5">
                        <p className="text-[13px] font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">{p.crop?.category || 'Unknown Crop'}</p>
                        <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-md shadow-sm">Area: <span className="text-primary">{parseFloat(p.area).toFixed(2)} ha</span></span>
                      </div>
                    </td>
                    <td className="px-8 py-5 align-middle">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"><div className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md"><Calendar size={12} /></div>Planted: <span className="text-gray-800 dark:text-gray-200">{p.date_planted}</span></div>
                        <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"><div className="p-1.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-md"><Clock size={12} /></div>Harvest: <span className="text-amber-600 dark:text-amber-500">{p.est_harvest}</span></div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center align-middle">
                      <span className={cn("px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border", getGrowthStatusColor(p.status))}>{p.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onView(p)} className="p-2.5 text-gray-400 bg-transparent hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer" title="View Record">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => onEdit(p)} className="p-2.5 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer" title="Edit Record">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="p-2.5 text-gray-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer" title="Delete Record">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-24">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-dashed border-gray-200 dark:border-slate-700 mb-4">
                      <Sprout size={32} className="text-gray-300 dark:text-slate-600" />
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

      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-700 dark:text-slate-300 font-black">{allFilteredItems.length === 0 ? 0 : indexOfFirstItem + 1}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{indexOfLastItem}</span> of <span className="text-primary font-black">{allFilteredItems.length}</span> Entries
        </p>
        <div className="flex items-center gap-1.5">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:hover:border-gray-200 cursor-pointer shadow-sm">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setCurrentPage(n)} className={cn("w-8 h-8 rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-sm border", currentPage === n ? "bg-primary border-primary text-white scale-105" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-primary/30 hover:text-primary")}>{n}</button>
            ))}
            <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:hover:border-gray-200 cursor-pointer shadow-sm">Next</button>
        </div>
      </div>
    </div>
  );
}

export default PlantingTable;