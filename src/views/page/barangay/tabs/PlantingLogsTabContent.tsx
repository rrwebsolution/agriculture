import { useState } from "react";
import { CardListSkeleton, EmptyState, getStatusColor } from "./RegistryTabContents";
import { Activity, Calendar, ChevronDown, Clock, Sprout, User } from "lucide-react";
import { cn } from "../../../../lib/utils";

// --- NEW: PLANTING LOGS TAB CONTENT ---
export const PlantingLogsTabContent = ({ logs, isLoading }: { logs: any[], isLoading?: boolean }) => {
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  if (isLoading) return <CardListSkeleton type="expandable" />;
  if (!logs || logs.length === 0) return <EmptyState icon={<Sprout size={40}/>} text="No Active Planting Logs" />;

  return (
    <div className="grid grid-cols-1 gap-4">
      {logs.map((log: any) => {
        const isExpanded = expandedLogId === log.id;
        
        return (
          <div key={log.id} className={cn(
            "bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden",
            isExpanded ? "border-primary shadow-xl" : "border-gray-100 dark:border-slate-800 hover:border-primary/50"
          )}>
            {/* MAIN CARD HEADER */}
            <div 
              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
              className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                  isExpanded ? "bg-primary text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-500"
                )}>
                  <Sprout size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none">
                    {log.crop?.category || 'Unknown Crop'}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border", getStatusColor(log.status))}>
                      {log.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      • {Number(log.area).toFixed(2)} HA
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Harvest</p>
                  <p className="text-sm font-black text-emerald-600 uppercase">
                    {log.est_harvest ? new Date(log.est_harvest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                  </p>
                </div>
                <div className={cn("p-2 rounded-full transition-transform", isExpanded ? "bg-primary/10 text-primary rotate-180" : "bg-gray-50 text-gray-400")}>
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* EXPANDED DETAILS (History & Farmer Info) */}
            {isExpanded && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                  
                  {/* LEFT: Farmer & Plot Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                        <User size={14}/> Farmer Information
                      </p>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Name:</span>
                          <span className="text-[10px] font-black dark:text-white uppercase">{log.farmer?.first_name} {log.farmer?.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">RSBSA:</span>
                          <span className="text-[10px] font-black dark:text-white uppercase">{log.farmer?.rsbsa_no}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Contact:</span>
                          <span className="text-[10px] font-black dark:text-white uppercase">{log.farmer?.contact_no}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                        <p className="text-[8px] font-black text-blue-500 uppercase flex items-center gap-1 mb-1"><Calendar size={10}/> Date Planted</p>
                        <p className="text-xs font-black dark:text-white">{log.date_planted}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl">
                        <p className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1 mb-1"><Clock size={10}/> Est. Harvest</p>
                        <p className="text-xs font-black dark:text-white">{log.est_harvest}</p>
                      </div>
                    </div>
                  </div>


                  {/* RIGHT COLUMN: Growth History */}
                  <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                     <Activity size={14} className="text-primary"/> Status History & Progress
                  </p>
                  
                  <div className="relative pl-2 space-y-4">
                     {/* VERTICAL LINE IN BACKGROUND */}
                     <div className="absolute left-3.75 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-slate-800" />

                     {log.status_history && log.status_history.length > 0 ? (
                        log.status_history.map((history: any, hIdx: number) => (
                        <div key={hIdx} className="relative pl-8 animate-in slide-in-from-left-2 duration-300">
                           
                           {/* DOT INDICATOR */}
                           <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary flex items-center justify-center z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           </div>

                           {/* CONTENT CARD */}
                           <div className="bg-gray-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all">
                              <div className="flex justify-between items-start mb-1">
                              <span className={cn(
                                 "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                 getStatusColor(history.status) // Blue for Seedling, etc.
                              )}>
                                 {history.status}
                              </span>
                              <span className="text-[8px] font-bold text-gray-400 flex items-center gap-1">
                                 <Calendar size={8} /> 
                                 {new Date(history.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              </div>
                              
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                              "{history.remarks}"
                              </p>
                           </div>
                        </div>
                        ))
                     ) : (
                        <div className="py-4 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">No history records found.</p>
                        </div>
                     )}
                  </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};