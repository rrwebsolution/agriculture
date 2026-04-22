import React, { useState, useMemo } from 'react';
import { 
  Search, Calendar, Warehouse, UserCheck, SearchX, ChevronLeft, ChevronRight, X, History 
} from 'lucide-react';
import Swal from 'sweetalert2'; // 🌟 IMPORT SWEETALERT2
import { cn } from '../../../../../lib/utils';

interface InventoryTransactionLogsProps {
  inventory: any[];
  isLoading: boolean;
  onRevertTransaction?: (id: number) => Promise<void>; // Gi-change ngadto sa Promise kung mag-await sa parent
}

export default function InventoryTransactionLogs({ inventory, isLoading, onRevertTransaction }: InventoryTransactionLogsProps) {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. I-FLATTEN UG I-SORT ANG TANANG TRANSACTIONS
  const allLogs = useMemo(() => {
    const logs = inventory.flatMap(item => 
      (item.transactions || []).map((tx: any) => ({
        ...tx,
        itemName: item.name,
        itemSku: item.sku,
        itemUnit: item.unit
      }))
    );
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [inventory]);

  // 2. FILTERING LOGIC
  const filteredLogs = useMemo(() => {
      return allLogs.filter(log => {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          log.itemName.toLowerCase().includes(searchLower) || 
          (log.recipient_name || "").toLowerCase().includes(searchLower) ||
          (log.source_supplier || "").toLowerCase().includes(searchLower) ||
          log.itemSku.toLowerCase().includes(searchLower);
        
        const matchesDate = !filterDate || log.transaction_date.includes(filterDate);
        return matchesSearch && matchesDate;
      });
  }, [allLogs, search, filterDate]);

  React.useEffect(() => { setCurrentPage(1); }, [search, filterDate]);

  // 3. PAGINATION
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 🌟 SWEETALERT LOGIC PARA SA PAG-REVERT (DELETE)
  const handleRevertClick = (id: number, type: string, quantity: number, itemName: string) => {
    if (!onRevertTransaction) return;

    // Dili pwede i-revert ang naka-revert na daan aron dili mag-loop
    if (type === 'REVERT') {
        Swal.fire("Not Allowed", "This transaction is already a revert record.", "info");
        return;
    }

    Swal.fire({
      title: "Revert Transaction?",
      html: `You are about to revert a <b>${type === 'IN' ? 'Stock In' : 'Release'}</b> of <b>${quantity}</b> units for <b>${itemName}</b>.<br/><br/>This will create a new <b>REVERT</b> record and adjust the stock balance.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, revert it!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await onRevertTransaction(id);
        } catch (error) {
            console.error("Revert failed");
        }
      }
    });
};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* LOGS FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search item, beneficiary, or supplier..." 
            className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none uppercase transition-all" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer">
                  <X size={14} />
              </button>
          )}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="date" 
            className="w-full pl-12 pr-10 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none uppercase focus:ring-2 focus:ring-primary transition-all" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)} 
          />
          {filterDate && (
              <button onClick={() => setFilterDate("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-red-300 hover:text-red-500 rounded-full transition-all cursor-pointer">
                  <X size={14} />
              </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* 🌟 TABLE HEADER LABEL */}
        <div className="flex items-center gap-3 ml-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                <History size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">Audit Trail</p>
                <h3 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                    List of <span className="text-primary italic">Transactions</span>
                </h3>
            </div>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative min-h-100">
            {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
                <div className="h-full bg-primary w-[40%] animate-progress-loop" />
            </div>
            )}

            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-5">Timestamp</th>
                    <th className="px-6 py-5">Item Details</th>
                    <th className="px-6 py-5">Activity</th>
                    <th className="px-6 py-5 text-right">Quantity</th>
                    <th className="px-6 py-5">Source / Beneficiary</th>
                    {onRevertTransaction && <th className="px-6 py-5 text-center">Action</th>}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {currentLogs.length > 0 ? (
                    currentLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-5">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{log.transaction_date}</p>
                        <p className="text-[9px] text-gray-400 font-medium">Ref: #{log.id}</p>
                        </td>
                        <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate max-w-62.5">{log.itemName}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{log.itemSku}</p>
                        </td>
                       <td className="px-6 py-5">
                            <span className={cn(
                                "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 w-fit",
                                log.type === "IN" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10" : 
                                log.type === "OUT" ? " text-red-600" : 
                                "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10" // 🌟 COLOR PARA SA REVERT
                            )}>
                                {log.type === "IN" ? <Warehouse size={12}/> : log.type === "OUT" ? <UserCheck size={12}/> : <History size={12}/>}
                                {log.type === "IN" ? "Stock In" : log.type === "OUT" ? "Released" : "Reverted"}
                            </span>
                        </td>

                        <td className={cn(
                            "px-6 py-5 text-right text-sm font-black tabular-nums italic", 
                            log.type === "IN" ? "text-emerald-600" : 
                            log.type === "OUT" ? "text-red-600" : "text-amber-600" // 🌟 QUANTITY COLOR
                        )}>
                            {log.type === "IN" ? "+" : log.type === "OUT" ? "-" : "↺ "}{log.quantity} 
                            <span className="text-[10px] text-gray-400 not-italic font-bold"> {log.itemUnit}</span>
                        </td>

                        <td className="px-6 py-5">
                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase leading-none truncate max-w-50">
                                {log.type === "IN" ? (log.source_supplier || "Initial Registry") : 
                                log.type === "OUT" ? (log.recipient_name || "Walk-in Recipient") : 
                                "System Reversal"}
                            </p>
                            {log.remarks && <p className="text-[9px] font-bold text-amber-500 mt-1.5 italic">{log.remarks}</p>}
                        </td>

                        {onRevertTransaction && (
                          <td className="px-6 py-5 text-center">
                            {log.type !== 'REVERT' && (
                                <button 
                                    onClick={() => handleRevertClick(log.id, log.type, log.quantity, log.itemName)}
                                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer"
                                    title="Revert Transaction"
                                >
                                    <History size={16} /> {/* Giilisan ang Trash2 ngadto sa History icon */}
                                </button>
                            )}
                          </td>
                        )}
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={onRevertTransaction ? 6 : 5} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-full text-gray-300 dark:text-slate-600 shadow-inner">
                            <SearchX size={48} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No transaction logs found</p>
                            {(search || filterDate) && <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">Try clearing your filters</p>}
                        </div>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            {/* LOGS PAGINATION */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-slate-900/30 shrink-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-primary font-black">{currentLogs.length}</span> of <span className="text-gray-700 dark:text-slate-300 font-black">{filteredLogs.length}</span> Records
                </p>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(p => p - 1)} 
                            className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:text-primary disabled:opacity-30 shadow-sm transition-all cursor-pointer"
                        >
                            <ChevronLeft size={18}/>
                        </button>
                        
                        <span className="text-[10px] font-black px-4 uppercase tracking-widest text-gray-400">
                            Page <span className="text-primary">{currentPage}</span> / {totalPages}
                        </span>
                        
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0} 
                            onClick={() => setCurrentPage(p => p + 1)} 
                            className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:text-primary disabled:opacity-30 shadow-sm transition-all cursor-pointer"
                        >
                            <ChevronRight size={18}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
