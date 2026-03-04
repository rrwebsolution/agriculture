import React from 'react';
import { Users, MessageSquare, ChevronUp, ChevronDown, Edit3, Trash2, Sprout, Wheat, LandPlot, Trees } from 'lucide-react';

interface CropTableProps {
  isLoading: boolean;
  currentItems: any[];
  filteredDataLength: number;
  expandedRemarks: number[];
  toggleRemark: (id: number) => void;
  openView: (item: any) => void;
  openEdit: (item: any) => void;
  handleDelete: (id: number) => void;
  
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
}

const CropTable: React.FC<CropTableProps> = ({
  isLoading,
  currentItems,
  filteredDataLength,
  expandedRemarks,
  toggleRemark,
  openView,
  openEdit,
  handleDelete,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem
}) => {

  // Helper function to return icon based on category name
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('rice')) return <Sprout size={16} className="text-emerald-500" />;
    if (cat.includes('corn')) return <Wheat size={16} className="text-amber-500" />;
    if (cat.includes('tree') || cat.includes('coconut')) return <Trees size={16} className="text-green-700" />;
    return <LandPlot size={16} className="text-primary" />; // Default icon
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
      
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse min-w-225">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Land Use Category</th>
              <th className="px-8 py-5">Total Hectare Area (ha)</th>
              <th className="px-8 py-5 text-center">No. of Farmers</th>
              <th className="px-8 py-5">Remarks</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" /></td>
                  <td className="px-8 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" /></td>
                  <td className="px-8 py-6 text-center"><div className="w-16 h-8 bg-gray-200 dark:bg-slate-700 rounded-xl mx-auto" /></td>
                  <td className="px-8 py-6"><div className="space-y-2"><div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" /><div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-2/3" /></div></td>
                  <td className="px-8 py-6"><div className="flex items-center justify-end gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" /><div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" /></div></td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              currentItems.map((item: any) => {
                const isExpanded = expandedRemarks.includes(item.id);
                const computedArea = ((item.registered_farmers || []).reduce((sum: number, f: any) => sum + (Number(f.total_area) || 0), 0)).toFixed(1);
                
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex items-center gap-3">
                        {/* Icon beside text */}
                        <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            {getCategoryIcon(item.category)}
                        </div>
                        <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{item.category}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top pt-8">
                      <span className="text-sm font-black text-gray-700 dark:text-slate-300">{computedArea} ha</span>
                    </td>
                    <td className="px-8 py-6 align-top pt-8 text-center">
                      <button onClick={() => openView(item)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20 hover:scale-105 transition-all cursor-pointer font-black text-xs">
                        <Users size={14} /> {item.farmers}
                      </button>
                    </td>
                    <td className="px-8 py-6 align-top pt-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MessageSquare size={14} className="mt-0.5 text-gray-300 shrink-0" />
                          <p className={`text-xs font-bold text-gray-500 dark:text-slate-400 italic leading-snug ${!isExpanded && 'line-clamp-1'}`}>{item.remarks || "N/A"}</p>
                        </div>
                        <button onClick={() => toggleRemark(item.id)} className="flex items-center gap-1 text-[9px] font-black uppercase text-primary hover:underline w-fit cursor-pointer">
                          {isExpanded ? <>Show Less <ChevronUp size={10} /></> : <>Show More <ChevronDown size={10} /></>}
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="py-24 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] italic">No Records Found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing {filteredDataLength > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredDataLength)} of {filteredDataLength} Records
        </p>
        <div className="flex items-center gap-2">
          <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button 
                key={pageNum} 
                disabled={isLoading} 
                onClick={() => setCurrentPage(pageNum)} 
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all cursor-pointer ${currentPage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary disabled:opacity-30'}`}
              >
                {pageNum}
              </button>
          ))}
          <button disabled={currentPage >= totalPages || totalPages === 0 || isLoading} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg text-[10px] font-black uppercase hover:text-primary transition-all disabled:opacity-30 cursor-pointer">Next</button>
        </div>
      </div>

    </div>
  );
};

export default CropTable;