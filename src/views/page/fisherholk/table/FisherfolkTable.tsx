import React from 'react';
import { Ship, MapPin, Eye, Edit3, Building2 } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch';
import { cn } from '../../../../lib/utils';

interface FisherfolkTableProps {
  isLoading: boolean;
  currentItems: any[];
  filteredRecordsLength: number;
  handleToggleStatus?: (fisher: any) => void;
  openView: (fisher: any) => void;
  openEdit?: (fisher: any) => void;
  
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
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      
      {/* TOP PROGRESS LOOP BAR */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse min-w-225">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-md">
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
              Array.from({ length: 5 }).map((_, i) => (
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
                    <div className="space-y-2">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded"/>
                        <div className="h-2 w-16 bg-gray-200 dark:bg-slate-800 rounded"/>
                    </div>
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
              currentItems.map((f: any) => {
                const boatsCount = Array.isArray(f.boats_list) ? f.boats_list.length : 0;
                const isOrgMember = f.org_member == 1 || f.org_member === true;
                const barangayName = f.barangay?.name || f.barangay_name || (f.barangay_id ? `Barangay #${f.barangay_id}` : 'N/A');

                return (
                  <tr key={f.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase">
                          {f.last_name?.[0]}{f.first_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight leading-tight mb-1">
                            {f.first_name} {f.last_name} {f.suffix !== 'None' ? f.suffix : ''}
                          </p>
                          <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-gray-500 uppercase">
                            <span>ID: {f.system_id}</span>
                            {isOrgMember && (
                                <span className="flex items-center gap-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                    <Building2 size={10}/> Org. Member
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top pt-7">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">
                          <Ship size={14} className="text-primary/60 shrink-0" /> 
                          {boatsCount > 0 ? `${boatsCount} Registered Vessel(s)` : 'No Registered Vessel'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                          <MapPin size={12} className="shrink-0" /> Brgy. {barangayName}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center align-top pt-7">
                      <div className="flex flex-col items-center gap-1">
                        {handleToggleStatus ? (
                          <Switch checked={f.status === 'active'} onCheckedChange={() => handleToggleStatus(f)} className="data-[state=checked]:bg-emerald-500" />
                        ) : (
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            f.status === 'active'
                              ? 'text-emerald-500 border-emerald-200 bg-emerald-50'
                              : 'text-rose-500 border-rose-200 bg-rose-50'
                          )}>
                            {f.status}
                          </span>
                        )}
                        {handleToggleStatus && (
                          <span className={`text-[9px] font-black uppercase tracking-widest ${f.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {f.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openView(f)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all cursor-pointer"><Eye size={16} /></button>
                        {openEdit && <button onClick={() => openEdit(f)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded-xl transition-all cursor-pointer"><Edit3 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              /* NO DATA FOUND */
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Ship size={32} className="mb-3 opacity-20" />
                    <p className="uppercase text-xs font-black tracking-widest text-gray-300 dark:text-slate-600">No fisherfolk found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* PAGINATION */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {currentItems.length} of {filteredRecordsLength} Entries
          </p>
          <div className="flex items-center gap-2">
              <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Prev</button>
              
              <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button 
                        key={n} 
                        disabled={isLoading}
                        onClick={() => setCurrentPage(n)} 
                        className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center", currentPage === n ? "bg-primary text-white shadow-md" : "bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30")}
                      >
                        {n}
                      </button>
                  ))}
              </div>

              <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Next</button>
          </div>
      </div>
    </div>
  );
};

export default FisherfolkTable;
