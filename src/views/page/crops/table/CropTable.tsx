import React from 'react';
import { MessageSquare, ChevronUp, ChevronDown, Edit3, Trash2, Sprout, Wheat, LandPlot, Trees } from 'lucide-react';
import { cn } from '../../../../lib/utils'; // Siguraduha nga sakto ni nga path sa imong utils

interface CropTableProps {
  isLoading: boolean;
  currentItems: any[];
  filteredDataLength: number;
  expandedRemarks: number[];
  toggleRemark: (id: number) => void;
  openEdit: (item: any) => void;
  handleDelete: (id: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  sortConfig: { key: string, direction: 'asc' | 'desc' | null };
  handleSort: (key: string) => void;
}

const CropTable: React.FC<CropTableProps> = ({
  isLoading, currentItems, filteredDataLength, expandedRemarks, toggleRemark,
  openEdit, handleDelete, currentPage, setCurrentPage, totalPages,
  indexOfFirstItem, indexOfLastItem
}) => {

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('rice')) return <Sprout size={18} className="text-emerald-500" />;
    if (cat.includes('corn')) return <Wheat size={18} className="text-amber-500" />;
    if (cat.includes('tree') || cat.includes('coconut')) return <Trees size={18} className="text-green-700" />;
    return <LandPlot size={18} className="text-primary" />; 
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative flex flex-col">
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] flex-1">
        <table className="w-full text-left border-collapse min-w-200">
          <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {/* GITANGTANG ANG SORTING NGA ICONS UG ONCLICK */}
              <th className="px-8 py-5">Land Use Category</th>
              <th className="px-8 py-5">Total Hectare Area</th>
              <th className="px-8 py-5 w-2/5">Remarks & Notes</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse bg-white dark:bg-slate-900">
                  <td className="px-8 py-6"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4" /></td>
                  <td className="px-8 py-6"><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-20" /></td>
                  <td className="px-8 py-6"><div className="space-y-2"><div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" /><div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-2/3" /></div></td>
                  <td className="px-8 py-6"><div className="flex items-center justify-end gap-2"><div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" /><div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div></td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              currentItems.map((item: any) => {
                const isExpanded = expandedRemarks.includes(item.id);
                const computedArea = ((item.registered_farmers || []).reduce((sum: number, f: any) => sum + (Number(f.total_area) || 0), 0)).toFixed(1);
                
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5 align-top pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                            {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-slate-100 uppercase tracking-tight">{item.category}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Agricultural Zone</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 align-top pt-8">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{computedArea}</span>
                        <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-500/70 uppercase">ha</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 align-top pt-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-2">
                          <MessageSquare size={14} className="mt-0.5 text-gray-300 dark:text-slate-600 shrink-0" />
                          <p className={cn(
                            "text-xs font-bold text-gray-500 dark:text-slate-400 italic leading-relaxed",
                            !isExpanded && "line-clamp-2"
                          )}>
                            {item.remarks || "No specific remarks recorded for this area."}
                          </p>
                        </div>
                        {item.remarks && item.remarks.length > 80 && (
                          <button onClick={() => toggleRemark(item.id)} className="flex items-center gap-1 text-[9px] font-black uppercase text-primary hover:text-primary/70 transition-colors w-fit ml-6 mt-1">
                            {isExpanded ? <>Show Less <ChevronUp size={12} /></> : <>Read More <ChevronDown size={12} /></>}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right align-top pt-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(item)} 
                          className="p-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all shadow-sm"
                          title="Edit Record"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                    <Sprout size={32} className="opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Records Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 PAGINATION FOOTER (RESTORED & IMPROVED) 🌟 */}
      <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        
        {/* Left Side: Showing Entries & Rows Selector */}
        <div className="flex items-center gap-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
            Showing <span className="text-gray-700 dark:text-gray-300 font-black">{filteredDataLength > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-gray-700 dark:text-gray-300 font-black">{Math.min(indexOfLastItem, filteredDataLength)}</span> of <span className="text-gray-700 dark:text-gray-300 font-black">{filteredDataLength}</span> entries
          </p>
        </div>

        {/* Right Side: Prev / Numbers / Next Buttons */}
        {/* 🌟 GI-SEPARATE ANG MGA NUMBER BUTTONS PARA DILI NA GROUPED 🌟 */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* Prev Button */}
          <button 
            disabled={currentPage === 1 || isLoading} 
            onClick={() => setCurrentPage(prev => prev - 1)} 
            className="h-9 px-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:hover:border-gray-100 shadow-sm cursor-pointer flex items-center justify-center"
          >
            Prev
          </button>
          
          {/* Number Buttons */}
          {getPageNumbers().map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="text-gray-400 px-1 text-xs font-bold flex items-center justify-center h-9">...</span>
              ) : (
                <button 
                  key={`page-${pageNum}`} 
                  disabled={isLoading} 
                  onClick={() => setCurrentPage(pageNum as number)} 
                  className={cn(
                    "min-w-9 h-9 px-3 rounded-xl border text-[10px] font-black transition-all cursor-pointer flex items-center justify-center shadow-sm",
                    currentPage === pageNum 
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/30" 
                      : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-primary hover:border-primary/30"
                  )}
                >
                  {pageNum}
                </button>
              )
          ))}

          {/* Next Button */}
          <button 
            disabled={currentPage >= totalPages || totalPages === 0 || isLoading} 
            onClick={() => setCurrentPage(prev => prev + 1)} 
            className="h-9 px-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:hover:border-gray-100 shadow-sm cursor-pointer flex items-center justify-center"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
};

export default CropTable;