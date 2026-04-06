import React, { useState, useMemo } from 'react';
import { 
  X, Package, History, Calendar, ChevronLeft, ChevronRight, 
  SearchX, ListFilter, Calculator, UserCheck, 
  Warehouse, RotateCcw,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';

interface ViewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
}

export default function ViewTransactionModal({ isOpen, onClose, selectedItem }: ViewTransactionModalProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null); 
  const itemsPerPage = 10;

  // 1. CALCULATE RUNNING BALANCE (Breakdown Logic)
  const processedTransactions = useMemo(() => {
    if (!selectedItem?.transactions) return [];

    // I-sort gikan sa pinaka-dugay (Oldest) para sa saktong ledger calculation
    const sortedOldest = [...selectedItem.transactions].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let runningBalance = 0;
    const calculated = sortedOldest.map((tx) => {
        const prevBal = runningBalance;
        let symbol = "";

        if (tx.type === "IN") {
            runningBalance += tx.quantity;
            symbol = "+";
        } else if (tx.type === "OUT") {
            runningBalance -= tx.quantity;
            symbol = "-";
        } else if (tx.type === "REVERT") {
            // Logic: Kung ang remarks naay (+), i-add. Kung naay (-), i-minus.
            // Base kini sa compensating transaction logic sa Laravel
            if (tx.remarks?.includes('+')) {
                runningBalance += tx.quantity;
                symbol = "+";
            } else {
                runningBalance -= tx.quantity;
                symbol = "-";
            }
        }

        return { ...tx, prevBal, newBal: runningBalance, symbol };
    });

    return calculated.reverse(); // I-reverse para ang newest naa sa taas
  }, [selectedItem]);

  // 2. FILTERING
  const filteredTransactions = useMemo(() => {
    return processedTransactions.filter((tx: any) => {
      const matchesType = filterType === "ALL" || tx.type === filterType;
      const matchesDate = !filterDate || tx.transaction_date.includes(filterDate);
      return matchesType && matchesDate;
    });
  }, [processedTransactions, filterType, filterDate]);

  // 3. PAGINATION
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  if (!isOpen || !selectedItem) return null;

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-4 text-white">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Audit Ledger</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction History & Audit Breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all cursor-pointer"><X size={24} /></button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/50 dark:bg-slate-950/50">
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* ASSET SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 flex items-center gap-5 shadow-sm">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0"><Package size={28} /></div>
                    <div className="truncate">
                        <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase truncate leading-none">{selectedItem.name}</h3>
                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{selectedItem.sku} • {selectedItem.category}</p>
                    </div>
                </div>
                <div className="bg-primary p-5 rounded-[2rem] text-white flex flex-col justify-center shadow-lg shadow-primary/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Current Stock</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tighter">{selectedItem.stock}</span>
                        <span className="text-xs font-bold uppercase opacity-80">{selectedItem.unit}</span>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter Transaction</label>
                    <div className="relative">
                        <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                        <Select value={filterType} onValueChange={(val) => { setFilterType(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full h-auto pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-[11px] font-black uppercase outline-none ring-0">
                                <SelectValue placeholder="All Movements" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-2xl p-1 z-130">
                                <SelectItem value="ALL" className="text-[11px] font-black uppercase py-3 cursor-pointer">All Movements</SelectItem>
                                <SelectItem value="IN" className="text-[11px] font-black uppercase py-3 text-emerald-500 cursor-pointer">Stock In Only (+)</SelectItem>
                                <SelectItem value="OUT" className="text-[11px] font-black uppercase py-3 text-red-500 cursor-pointer">Released Only (-)</SelectItem>
                                <SelectItem value="REVERT" className="text-[11px] font-black uppercase py-3 text-amber-500 cursor-pointer">Reverted Only (↺)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-1.5 flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                        <input type="date" className="w-full pl-12 pr-10 py-4 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/20" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} />
                        {filterDate && <button onClick={() => setFilterDate("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"><X size={14} /></button>}
                    </div>
                </div>
            </div>

            {/* TABLE AREA */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Activity</th>
                      <th className="px-6 py-5">Source / Recipient</th>
                      <th className="px-6 py-5 text-right">Quantity</th>
                      <th className="px-6 py-5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((tx: any) => (
                        <React.Fragment key={tx.id}>
                          {/* MAIN ROW */}
                          <tr 
                            onClick={() => toggleRow(tx.id)} 
                            className={cn(
                                "group cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-800/40",
                                expandedRow === tx.id && "bg-primary/5 dark:bg-primary/10"
                            )}
                          >
                            <td className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase">{tx.transaction_date}</td>
                            <td className="px-6 py-5">
                                <span className={cn(
                                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 w-fit",
                                    tx.type === "IN" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10" : 
                                    tx.type === "OUT" ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10" : 
                                    "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10"
                                )}>
                                    {tx.type === "IN" ? <Warehouse size={12}/> : tx.type === "OUT" ? <UserCheck size={12}/> : <RotateCcw size={12}/>}
                                    {tx.type === "IN" ? "Stock In" : tx.type === "OUT" ? "Released" : "Reverted"}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase truncate max-w-45">
                                    {tx.type === "IN" ? (tx.source_supplier || "Initial Registry") : 
                                     tx.type === "OUT" ? (tx.recipient_name || "Walk-in Recipient") : 
                                     "System Reversal"}
                                </p>
                            </td>
                            <td className={cn(
                                "px-6 py-5 text-right text-sm font-black tabular-nums italic",
                                tx.type === "IN" ? "text-emerald-600" : 
                                tx.type === "OUT" ? "text-red-600" : "text-amber-600"
                            )}>
                                {tx.symbol}{tx.quantity} <span className="text-[10px] text-gray-400 not-italic font-bold">{selectedItem.unit}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <ChevronDown size={18} className={cn("text-gray-400 transition-transform duration-300", expandedRow === tx.id && "rotate-180 text-primary")} />
                            </td>
                          </tr>

                          {/* ACCORDION CONTENT (AUDIT BREAKDOWN) */}
                          {expandedRow === tx.id && (
                              <tr className="bg-white dark:bg-slate-900 border-l-4 border-l-primary animate-in slide-in-from-top-2 duration-300">
                                  <td colSpan={5} className="px-8 py-6">
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                          <div className="space-y-4 flex-1">
                                              <div className="flex items-center gap-2 text-primary">
                                                  <Calculator size={14}/>
                                                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Audit Breakdown</span>
                                              </div>
                                              <div className="flex items-center gap-8 overflow-x-auto pb-2">
                                                  <div className="space-y-1 shrink-0 text-center">
                                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Previous Balance</p>
                                                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{tx.prevBal}</p>
                                                  </div>
                                                  <div className="text-gray-300 dark:text-slate-700 font-light text-2xl shrink-0">{tx.symbol}</div>
                                                  <div className="space-y-1 shrink-0 text-center">
                                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transaction Qty</p>
                                                      <p className={cn("text-sm font-black", tx.type === "IN" ? "text-emerald-500" : tx.type === "OUT" ? "text-red-500" : "text-amber-500")}>{tx.quantity}</p>
                                                  </div>
                                                  <div className="text-gray-300 dark:text-slate-700 font-light text-2xl shrink-0">=</div>
                                                  <div className="space-y-1 bg-primary/5 p-2 px-6 rounded-xl border border-primary/10 shrink-0">
                                                      <p className="text-[9px] font-black text-primary uppercase tracking-widest text-center">Resulting Balance</p>
                                                      <p className="text-base font-black text-primary text-center">{tx.newBal} <span className="text-[10px] opacity-60">{selectedItem.unit}</span></p>
                                                  </div>
                                              </div>
                                              {tx.remarks && (
                                                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500/80">
                                                      <RotateCcw size={12}/>
                                                      <span className="text-[10px] font-bold italic uppercase">{tx.remarks}</span>
                                                  </div>
                                              )}
                                          </div>

                                          {tx.type === "OUT" && (tx.beneficiary_type || tx.rsbsa_no) && (
                                              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 min-w-50">
                                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><UserCheck size={10}/> Beneficiary Details</p>
                                                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{tx.beneficiary_type || 'Beneficiary'}</p>
                                                  <p className="text-[11px] font-bold text-primary mt-1">ID: {tx.rsbsa_no || 'N/A'}</p>
                                              </div>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-24 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-200 dark:text-slate-700 shadow-inner">
                                    <SearchX size={48} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No logs found</p>
                                    {(filterDate || filterType !== "ALL") && <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">Try clearing your filters</p>}
                                </div>
                            </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-primary font-black">{currentTransactions.length}</span> of {filteredTransactions.length} Logs
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:text-primary disabled:opacity-30 cursor-pointer shadow-sm transition-all"><ChevronLeft size={16} /></button>
                        <div className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Page {currentPage} / {totalPages}</div>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:text-primary disabled:opacity-30 cursor-pointer shadow-sm transition-all"><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end shrink-0">
            <button onClick={onClose} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
              Close Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}