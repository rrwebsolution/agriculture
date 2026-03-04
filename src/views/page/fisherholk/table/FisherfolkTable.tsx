import React from 'react';
import { Ship, MapPin, Eye, Edit3 } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch'; // Verify this path
import { cn } from '../../../../lib/utils'; // Verify this path

interface FisherfolkTableProps {
  isLoading: boolean;
  currentItems: any[];
  filteredRecordsLength: number;
  handleToggleStatus: (fisher: any) => void;
  openView: (fisher: any) => void;
  openEdit: (fisher: any) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const FisherfolkTable: React.FC<FisherfolkTableProps> = ({
  isLoading,
  currentItems,
  filteredRecordsLength,
  handleToggleStatus,
  openView,
  openEdit,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
      
      {/* TOP PROGRESS LOOP BAR */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-225">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Fisherfolk Identity</th>
              <th className="px-8 py-5">Maritime Profile</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            
            {/* SKELETON LOADER */}
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0"/>
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-gray-200 dark:bg-slate-800 rounded"/>
                        <div className="h-2 w-20 bg-gray-200 dark:bg-slate-800 rounded"/>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded"/>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="w-10 h-5 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto"/>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-lg"/>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-lg"/>
                    </div>
                  </td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              /* ACTUAL DATA */
              currentItems.map((f: any) => (
                <tr key={f.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase">
                        {f.last_name?.[0]}{f.first_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight leading-tight">{f.first_name} {f.last_name}</p>
                        <p className="text-[10px] font-bold text-gray-400">ID: {f.system_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300">
                        <Ship size={14} className="text-primary/60" /> {f.boat_type || 'No Boat'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                        <MapPin size={12} /> {f.barangay?.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Switch checked={f.status === 'active'} onCheckedChange={() => handleToggleStatus(f)} className="data-[state=checked]:bg-primary" />
                      <span className={`text-[9px] font-black uppercase ${f.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{f.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(f)} className="p-2 text-gray-400 hover:text-primary transition-all cursor-pointer"><Eye size={16} /></button>
                      <button onClick={() => openEdit(f)} className="p-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"><Edit3 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* NO DATA FOUND */
              <tr>
                <td colSpan={4} className="py-20 text-center text-gray-400 uppercase text-xs font-bold italic tracking-widest">
                  No fisherfolk found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* PAGINATION */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {currentItems.length} of {filteredRecordsLength} Entries
          </p>
          <div className="flex gap-2">
              <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase disabled:opacity-30 cursor-pointer">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button 
                    key={n} 
                    disabled={isLoading}
                    onClick={() => setCurrentPage(n)} 
                    className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer", currentPage === n ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-gray-50 dark:bg-slate-800 text-gray-400 disabled:opacity-30")}
                  >
                    {n}
                  </button>
              ))}
              <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase disabled:opacity-30 cursor-pointer">Next</button>
          </div>
      </div>
    </div>
  );
};

export default FisherfolkTable;