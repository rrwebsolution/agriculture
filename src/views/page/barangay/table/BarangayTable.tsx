import { Edit3, Building2, Mountain, Waves, Map } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export const BarangayTable = ({ isLoading, currentBarangays, allFilteredItems, openEdit, openMap, currentPage, setCurrentPage, totalPages, canManage = true }: any) => {
  const startEntry = allFilteredItems.length > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endEntry = Math.min(currentPage * 10, allFilteredItems.length);

  const getStatusConfig = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes('coastal')) return { icon: <Waves size={14} />, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/10", border: "border-cyan-100" };
    if (t.includes('urban') || t.includes('poblacion')) return { icon: <Building2 size={14} />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-100" };
    return { icon: <Mountain size={14} />, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-emerald-100" };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
      {isLoading && <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30"><div className="h-full bg-primary w-[40%] animate-progress-loop" /></div>}
      
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse min-w-150">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5 w-1/2">Barangay Name</th>
              <th className="px-8 py-5 text-center">Classification</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6"><div className="flex gap-4 items-center"><div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-800"/><div className="space-y-2"><div className="h-3 w-32 bg-gray-200 dark:bg-slate-800 rounded"/><div className="h-2 w-20 bg-gray-200 dark:bg-slate-800 rounded"/></div></div></td>
                  <td className="px-8 py-6"><div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto"/></td>
                  <td className="px-8 py-6"><div className="flex justify-end"><div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-lg"/></div></td>
                </tr>
              ))
            ) : currentBarangays.length > 0 ? (
              currentBarangays.map((brgy: any) => {
                const config = getStatusConfig(brgy.type);
                return (
                  <tr key={brgy.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black ${(brgy.type || "").includes("Urban") || (brgy.type || "").includes("Poblacion") ? "bg-blue-500" : (brgy.type || "").includes("Coastal") ? "bg-cyan-500" : "bg-emerald-500" }`}>
                          {(brgy.name || "BR").substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{brgy.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{brgy.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.color} text-[10px] font-black uppercase`}>
                        {config.icon} {brgy.type}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {/* 🌟 GIDUGANG NGA MAP BUTTON NGA MAG ABRE SA MODAL */}
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openMap(brgy)} className="p-2 text-gray-400 hover:text-emerald-500 transition-all cursor-pointer bg-gray-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/20 rounded-lg" title="View Map">
                          <Map size={18} />
                        </button>
                        {canManage && <button onClick={() => openEdit(brgy)} className="p-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/20 rounded-lg" title="Edit Barangay">
                          <Edit3 size={18} />
                        </button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={3} className="py-20 text-center text-gray-400 uppercase text-xs font-bold italic tracking-widest">No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-gray-400 font-bold uppercase text-[10px]">
        <p>Showing {allFilteredItems.length > 0 ? startEntry : 0} to {endEntry} of {allFilteredItems.length} entries</p>
        <div className="flex items-center gap-2">
            <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage((p:any) => p - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setCurrentPage(n)} className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer", currentPage === n ? "bg-primary text-white shadow-lg" : "bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary")}>{n}</button>
            ))}
            <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => setCurrentPage((p:any) => p + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Next</button>
        </div>
      </div>
    </div>
  );
};
