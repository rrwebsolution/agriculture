import React from 'react';
import { Building2, FileBadge, MapPin, Eye, Edit3, Trash2, Sprout, Fish } from 'lucide-react';
import { cn } from '../../../../../lib/utils'; 

interface CoopTableProps {
  isLoading: boolean;
  items: any[];
  allFilteredItems: any[]; 
  onView: (coop: any) => void;
  onEdit: (coop: any) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  // 🌟 GI-FIX ANG TYPESCRIPT ERROR DIRE: Gidugangan og tab argument
  onViewMembers: (coop: any, tab: 'farmers' | 'fisherfolks') => void;
}

const CoopTable: React.FC<CoopTableProps> = ({ 
  isLoading, items, allFilteredItems, onView, onEdit, onDelete, 
  currentPage, setCurrentPage, totalPages, onViewMembers
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
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-md">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Organization Details</th>
              <th className="px-8 py-5">Representative & Location</th>
              <th className="px-8 py-5">Classification</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            
            {/* 🌟 SKELETON LOADER */}
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6 align-top">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0 mt-1" />
                      <div className="space-y-2 w-full mt-1">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="flex gap-2">
                            <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
                            <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/4" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top pt-8">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                      <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-24" />
                    </div>
                  </td>
                  <td className="px-8 py-6 align-top pt-8">
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                        <div className="h-2 w-16 bg-gray-100 dark:bg-slate-800 rounded-md" />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center align-top pt-8">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-md mx-auto" />
                  </td>
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
                  
                  {/* Column 1: Name, Registration & Assigned Farmers */}
                  <td className="px-8 py-6 align-top">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight mb-1.5">
                          {coop.name}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-md uppercase tracking-wider">
                              {coop.registration || 'CDA'}: {coop.cda_no}
                            </span>
                            
                            {/* FARMERS BUTTON */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); onViewMembers(coop, 'farmers'); }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                            >
                              <Sprout size={10} /> 
                              {coop.assigned_farmers_count || 0} Farmers
                            </button>

                            {/* FISHERFOLKS BUTTON */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); onViewMembers(coop, 'fisherfolks'); }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-md uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                            >
                              <Fish size={10} /> 
                              {coop.assigned_fisherfolks_count || 0} Fisherfolks
                            </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Chairman & Location */}
                  <td className="px-8 py-6 align-top pt-7">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300">
                        <FileBadge size={14} className="text-gray-400" />
                        <span className="truncate max-w-37.5">{coop.chairman}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="truncate max-w-37.5">{coop.barangay?.name || "No Barangay Linked"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Type & Classification */}
                  <td className="px-8 py-6 align-top pt-6">
                    <div className="flex flex-col gap-1.5 items-start">
                        <span className="px-3 py-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-black uppercase rounded-lg border border-gray-100 dark:border-slate-700 tracking-wider">
                            {coop.org_type || 'Cooperative'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            {coop.type}
                        </span>
                    </div>
                  </td>

                  {/* Column 4: Status */}
                  <td className="px-8 py-6 text-center align-top pt-8">
                    <span className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md",
                        coop.status?.toLowerCase() === 'active' || coop.status?.toLowerCase() === 'compliant'
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : coop.status?.toLowerCase() === 'probationary' || coop.status?.toLowerCase() === 'inactive'
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        {coop.status}
                    </span>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-8 py-6 text-right align-top pt-6">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onView(coop)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(coop)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded-xl transition-all cursor-pointer">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => onDelete(coop.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* 🌟 EMPTY STATE */
              /* 🌟 EMPTY MASTERLIST STATE */
<tr>
  <td colSpan={5} className="py-32 text-center">
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-700">
        <Building2 size={40} strokeWidth={1} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">
          No Organization Records Found
        </p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Try adjusting your search or organization type filter
        </p>
      </div>
    </div>
  </td>
</tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 FOOTER & PAGINATION */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {allFilteredItems.length === 0 ? 0 : indexOfFirstItem + 1} to {indexOfLastItem} of {allFilteredItems.length} Entries
        </p>
        <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 cursor-pointer">
              Prev
            </button>
            
            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button 
                    key={n} 
                    onClick={() => setCurrentPage(n)} 
                    className={cn(
                        "w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center", 
                        currentPage === n 
                            ? "bg-primary text-white shadow-md" 
                            : "bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    )}
                    >
                    {n}
                    </button>
                ))}
            </div>

            <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 cursor-pointer">
              Next
            </button>
        </div>
      </div>
    </div>
  );
}

export default CoopTable;