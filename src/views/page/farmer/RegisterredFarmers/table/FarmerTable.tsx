import React from 'react';
import { Eye, Edit3, LandPlot, Package, Users } from 'lucide-react';
import { Switch } from '../../../../../components/ui/switch';
import { cn } from '../../../../../lib/utils';

interface FarmerTableProps {
  isLoading: boolean;
  currentItems: any[];
  filteredDataLength: number;
  handleToggleStatus?: (farmer: any) => void;
  openView: (farmer: any) => void;
  openEdit?: (farmer: any) => void;
  
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

const FarmerTable: React.FC<FarmerTableProps> = ({
  isLoading,
  currentItems,
  filteredDataLength,
  handleToggleStatus,
  openView,
  openEdit,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
      
      {/* TOP PROGRESS LOOP BAR */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse min-w-200">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Farmer Identity</th>
              <th className="px-8 py-5">Assets & Programs</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            
            {/* SKELETON LOADER FOR TABLE */}
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
                      <div className="space-y-2 w-full mt-1">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                      <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-10" />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              /* ACTUAL DATA RENDERING */
              currentItems.map((f: any) => {
                
                // 🌟 PARSE FARMS ARRAY TO GET TOTAL COUNT & COMBINED AREA
                let farms = [];
                try { farms = typeof f.farms_list === 'string' ? JSON.parse(f.farms_list) : (f.farms_list || []); } catch(e) {}
                if (farms.length === 0 && f.farm_barangay_id) farms.push({ total_area: f.total_area }); // Fallback for old data
                const totalArea = farms.reduce((sum: number, farm: any) => sum + Number(farm.total_area || 0), 0);

                // 🌟 PARSE PROGRAMS ARRAY TO GET COUNT
                let programs = [];
                try { programs = typeof f.assistances_list === 'string' ? JSON.parse(f.assistances_list) : (f.assistances_list || []); } catch(e) {}
                if (programs.length === 0 && f.program_name) programs.push({}); // Fallback for old data

                return (
                  <tr key={f.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    
                    {/* FARMER IDENTITY */}
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 uppercase shadow-sm border border-primary/20">
                          {f.last_name?.[0]}{f.first_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight leading-tight">
                            {f.first_name} {f.last_name} {f.suffix}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                             RSBSA: {f.rsbsa_no}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* 🌟 UPDATED: ASSETS & PROGRAMS SUMMARY */}
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                             <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400">
                               <LandPlot size={12} />
                             </div>
                             {farms.length} Parcel{farms.length !== 1 ? 's' : ''} • {totalArea.toFixed(2)} HA
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                             <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-md text-blue-600 dark:text-blue-400">
                               <Package size={12} />
                             </div>
                             {programs.length > 0 ? (
                               <span className="text-blue-600 dark:text-blue-400">{programs.length} Program{programs.length !== 1 ? 's' : ''} Rcvd.</span>
                             ) : (
                               'No Programs'
                             )}
                          </div>
                      </div>
                    </td>
                    
                    {/* STATUS */}
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                          {handleToggleStatus ? (
                            <Switch checked={f.status === 'active'} onCheckedChange={() => handleToggleStatus(f)} className="data-[state=checked]:bg-primary" />
                          ) : (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              f.status === 'active'
                                ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : 'text-rose-500 border-rose-200 bg-rose-50'
                            )}>
                              {f.status}
                            </span>
                          )}
                          {handleToggleStatus && <span className={`text-[9px] font-black uppercase tracking-widest ${f.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>{f.status}</span>}
                      </div>
                    </td>
                    
                    {/* ACTIONS */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openView(f)} className="p-2.5 text-gray-400 bg-transparent hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all cursor-pointer" title="View Details"><Eye size={16} /></button>
                        {openEdit && <button onClick={() => openEdit(f)} className="p-2.5 text-gray-400 bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl transition-all cursor-pointer" title="Edit Record"><Edit3 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
             <tr>
              <td colSpan={4} className="py-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-700">
                    <Users size={40} strokeWidth={1} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">
                      No Farmer Records Found
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Try adjusting your search or filters
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
            Showing <span className="text-gray-700 dark:text-slate-300 font-black">{filteredDataLength > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{Math.min(indexOfLastItem, filteredDataLength)}</span> of <span className="text-primary font-black">{filteredDataLength}</span> Entries
          </p>
          
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1 || isLoading} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer"
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button 
                  key={pageNum} 
                  onClick={() => setCurrentPage(pageNum)} 
                  className={cn(
                    "w-8 h-8 rounded-xl text-[11px] font-black transition-all shadow-sm border cursor-pointer", 
                    currentPage === pageNum 
                      ? "bg-primary border-primary text-white scale-105" 
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-primary/30 hover:text-primary"
                  )}
                >
                  {pageNum}
                </button>
            ))}

            <button 
              disabled={currentPage >= totalPages || totalPages === 0 || isLoading} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer"
            >
              Next
            </button>
          </div>
      </div>
    </div>
  );
};

export default FarmerTable;
