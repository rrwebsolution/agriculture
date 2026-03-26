import React from 'react';
import { Ship, Fish, Scale, MapPin, Calendar, Edit3, Trash2, Eye, PhilippinePeso } from 'lucide-react';
import { cn } from '../../../../lib/utils'; 

interface FisheryTableProps {
  isLoading: boolean;
  items: any[];
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  onView: (record: any) => void;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
}

const FisheryTable: React.FC<FisheryTableProps> = ({
  isLoading, items, totalItems, indexOfFirstItem, indexOfLastItem,
  currentPage, totalPages, setCurrentPage, onView, onEdit, onDelete
}) => {
  
  // 🦴 SKELETON ROW COMPONENT
  const TableRowSkeleton = () => (
    <tr className="animate-pulse border-b border-gray-50 dark:border-slate-800 last:border-0">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-slate-800 shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
            <div className="h-2 w-20 bg-gray-50 dark:bg-slate-800/50 rounded" />
          </div>
        </div>
      </td>
      <td className="px-8 py-5"><div className="space-y-2"><div className="h-3 w-24 bg-gray-100 dark:bg-slate-800 rounded" /><div className="h-2 w-16 bg-gray-50 dark:bg-slate-800/50 rounded" /></div></td>
      <td className="px-8 py-5"><div className="space-y-2"><div className="h-3 w-20 bg-gray-100 dark:bg-slate-800 rounded" /><div className="h-2 w-12 bg-gray-50 dark:bg-slate-800/50 rounded" /></div></td>
      {/* Skeleton for Estimated Value */}
      <td className="px-8 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-slate-800 rounded" /></td>
      <td className="px-8 py-5"><div className="space-y-2"><div className="h-2.5 w-24 bg-gray-100 dark:bg-slate-800 rounded" /><div className="h-2.5 w-20 bg-gray-50 dark:bg-slate-800/50 rounded" /></div></td>
      <td className="px-8 py-5"><div className="flex justify-end gap-2"><div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800" /><div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800" /></div></td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-300">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Fisherfolk Info</th>
              <th className="px-8 py-5">Vessel & Gear</th>
              <th className="px-8 py-5">Catch Data</th>
              <th className="px-8 py-5 text-emerald-600 dark:text-emerald-500">Estimated Value</th>
              <th className="px-8 py-5">Location / Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : items.length > 0 ? (
              items.map((r: any) => (
                <tr key={r.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black uppercase text-xs shrink-0 shadow-sm transition-transform group-hover:scale-110">
                        {String(r.name).substring(0,2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">{r.name}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span className="text-primary">{r.fishr_id}</span> • {r.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[13px] font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">
                        <Ship size={14} className="text-primary/70" />{r.boat_name || 'No Boat'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-5">{r.gear_type}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-2 text-[13px] font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">
                        <Fish size={14} className="text-blue-500" />{r.catch_species}
                      </div>
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-500 ml-5">
                        <Scale size={12} className="text-emerald-500"/>{r.yield} kg
                      </div>
                    </div>
                  </td>

                  {/* 💰 NEW COLUMN: ESTIMATED VALUE */}
                  <td className="px-8 py-5 align-middle">
                     <div className="flex items-center gap-1.5 text-[14px] font-black text-emerald-600 dark:text-emerald-400">
                        <PhilippinePeso size={14} />
                        {Number(r.market_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </div>
                  </td>

                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <MapPin size={14} className="text-gray-400" />{r.fishing_area || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <Calendar size={14} className="text-gray-400" /> {r.date}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onView(r)} className="p-2 text-gray-400 bg-transparent hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(r)} className="p-2 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => onDelete(r.id)} className="p-2 text-gray-400 bg-transparent hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all cursor-pointer" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* 🌟 EMPTY MASTERLIST STATE */
            <tr>
              <td colSpan={6} className="py-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  {/* Icon with background circle */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-700">
                    <Fish size={40} strokeWidth={1} />
                  </div>
                  
                  {/* Text Labels */}
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">
                      No Catch Records Found
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Try adjusting your search, date range, or gear type filter
                    </p>
                  </div>
                </div>
              </td>
            </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* PAGINATION FOOTER */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/50 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-700 dark:text-slate-300 font-black">{totalItems > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="text-primary font-black">{totalItems}</span> Entries
        </p>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={currentPage === 1 || isLoading} 
            onClick={() => setCurrentPage(currentPage - 1)} 
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer active:scale-95"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button 
                  key={pageNum} 
                  onClick={() => setCurrentPage(pageNum)} 
                  className={cn(
                    "w-8 h-8 rounded-xl text-[11px] font-black transition-all shadow-sm border cursor-pointer active:scale-90", 
                    currentPage === pageNum 
                      ? "bg-primary border-primary text-white scale-105" 
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-primary/30 hover:text-primary"
                  )}
                >
                  {pageNum}
                </button>
            ))}
          </div>

          <button 
            disabled={currentPage >= totalPages || totalPages === 0 || isLoading} 
            onClick={() => setCurrentPage(currentPage + 1)} 
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer active:scale-95"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default FisheryTable;