import React from 'react';
import { Building2, FileBadge, MapPin, Eye, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../../../../lib/utils'; // Adjust path if needed

interface CoopTableProps {
  isLoading: boolean;
  items: any[];
  allFilteredItems: any[]; 
  onView: (coop: any) => void;
  onEdit: (coop: any) => void;
  onDelete: (id: number) => void;
  // Pagination Props
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const CoopTable: React.FC<CoopTableProps> = ({ 
  isLoading, items, allFilteredItems, onView, onEdit, onDelete, 
  currentPage, setCurrentPage, totalPages 
}) => {
  const indexOfFirstItem = (currentPage - 1) * 10;
  const indexOfLastItem = Math.min(currentPage * 10, allFilteredItems.length);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* 🌟 TOP PROGRESS BAR LOADER */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}
      
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse min-w-225">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Organization Name</th>
              <th className="px-8 py-5">Chairman / Location</th>
              <th className="px-8 py-5">Classification</th>
              <th className="px-8 py-5 text-center">CDA Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            
            {/* 🌟 SKELETON LOADER */}
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                  {/* Column 1: Org Name */}
                  <td className="px-8 py-6 align-top">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0 mt-1" />
                      <div className="space-y-2 w-full mt-1">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  </td>
                  {/* Column 2: Chairman / Location */}
                  <td className="px-8 py-6 align-top pt-8">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                      <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-24" />
                    </div>
                  </td>
                  {/* Column 3: Classification */}
                  <td className="px-8 py-6 align-top pt-8">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                  </td>
                  {/* Column 4: Status */}
                  <td className="px-8 py-6 text-center align-top pt-8">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-md mx-auto" />
                  </td>
                  {/* Column 5: Actions */}
                  <td className="px-8 py-6 text-right align-top pt-6">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              
              /* 🌟 ACTUAL DATA ROWS */
              items.map((coop: any) => (
                <tr key={coop.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                  
                  {/* Column 1: Name & Members */}
                  <td className="px-8 py-6 align-top">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1">
                          {coop.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded">
                            CDA: {coop.cda_no}
                          </span>
                          <span>•</span>
                          <span>{coop.member_count} Members</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Chairman & Location */}
                  <td className="px-8 py-6 align-top pt-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300">
                        <FileBadge size={14} className="text-gray-400" />
                        {coop.chairman}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                        <MapPin size={12} className="text-gray-400" />
                        {coop.barangay?.name || "No Barangay Linked"}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Type/Classification */}
                  <td className="px-8 py-6 align-top pt-8">
                    <span className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-black uppercase rounded-lg border border-gray-100 dark:border-slate-700">
                      {coop.type}
                    </span>
                  </td>

                  {/* Column 4: Status */}
                  <td className="px-8 py-6 text-center align-top pt-8">
                    <span className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md",
                        (coop.status === 'Compliant' || coop.status === 'Active') 
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        {coop.status}
                    </span>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-8 py-6 text-right align-top pt-6">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onView(coop)} className="p-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(coop)} className="p-2 text-gray-400 hover:text-primary transition-all cursor-pointer">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => onDelete(coop.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* 🌟 EMPTY STATE */
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-400 uppercase text-xs font-bold italic tracking-widest">
                  No cooperative found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 FOOTER & PAGINATION */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {allFilteredItems.length === 0 ? 0 : indexOfFirstItem + 1} to {indexOfLastItem} of {allFilteredItems.length} Entries
        </p>
        <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button 
                  key={n} 
                  onClick={() => setCurrentPage(n)} 
                  className={cn(
                    "w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer", 
                    currentPage === n ? "bg-primary text-white shadow-lg" : "bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  )}
                >
                  {n}
                </button>
            ))}

            <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">
              Next
            </button>
        </div>
      </div>
    </div>
  );
}

export default CoopTable;