import { useState } from "react";
import { CardListSkeleton, EmptyState, InfoRow } from "./RegistryTabContents";
import { Activity, Anchor, CheckCircle2, ChevronDown, FileBadge, Fish, PhilippinePeso, Ship, UserCheck, Wallet } from "lucide-react";
import { cn } from "../../../../lib/utils";

// --- FISHERFOLKS TAB ---
export const FisherfolksTabContent = ({ fisherfolks, isLoading }: { fisherfolks: any[], isLoading?: boolean }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) return <CardListSkeleton type="expandable" />;
  if (!fisherfolks || fisherfolks.length === 0) return <EmptyState icon={<Anchor size={40}/>} text="No Fisherfolks Recorded" />;
  
  return (
    <div className="flex flex-col gap-4">
      {fisherfolks.map((f: any) => {
        const isExpanded = expandedId === f.id;
        const boats = f.boats_list || [];
        const assistances = f.assistances_list || [];
        const catches = f.catch_records || []; 
        const barangayName = f.barangay?.name || f.barangay_name || (f.barangay_id ? `Barangay #${f.barangay_id}` : 'N/A');

        // 🌟 Compute Total Estimated Value for this fisherfolk
        const totalEstimatedValue = catches.reduce((sum: number, rec: any) => 
            sum + parseFloat(String(rec.market_value || 0)), 0
        );

        return (
          <div key={f.id} className={cn(
            "bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden", 
            isExpanded ? "border-cyan-500 shadow-xl shadow-cyan-500/10" : "border-gray-100 dark:border-slate-800 hover:border-cyan-500/50"
          )}>
            
            {/* CARD HEADER */}
            <div onClick={() => setExpandedId(isExpanded ? null : f.id)} className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none group">
               <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl uppercase transition-colors shrink-0", 
                    isExpanded ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" : "bg-gray-100 dark:bg-slate-800 text-gray-500 group-hover:bg-cyan-50 group-hover:text-cyan-600"
                  )}>
                     {String(f.last_name || ' ')[0]}{String(f.first_name || ' ')[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none">
                      {f.first_name} {f.middle_name} {f.last_name} {f.suffix && f.suffix !== 'None' ? f.suffix : ''}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700">ID: {f.system_id}</span>
                      <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1", f.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100")}><CheckCircle2 size={10}/> {f.status}</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type / Classification</p>
                     <p className="text-sm font-black text-cyan-600 uppercase">{f.fisher_type || 'N/A'}</p>
                  </div>
                  <div className={cn("p-2 rounded-full transition-transform", isExpanded ? "bg-cyan-50 text-cyan-500 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}><ChevronDown size={20} /></div>
               </div>
            </div>
            
            {/* EXPANDED CONTENT */}
            {isExpanded && (
               <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                     
                     {/* PERSONAL INFORMATION */}
                     <div className="col-span-1 space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><UserCheck size={14}/> Personal Information</p>
                           <div className="space-y-2">
                             <InfoRow label="Gender" value={f.gender} />
                             <InfoRow label="Date of Birth" value={f.dob} />
                             <InfoRow label="Age" value={f.age} />
                             <InfoRow label="Civil Status" value={f.civil_status} />
                             <InfoRow label="Barangay" value={barangayName} />
                             <InfoRow label="Contact" value={f.contact_no} />
                             <InfoRow label="Address" value={f.address_details} />
                           </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Activity size={14}/> Fishery Profile</p>
                           <div className="space-y-2">
                             <InfoRow label="Years in Fishing" value={f.years_in_fishing} />
                             <InfoRow label="Main Livelihood" value={f.is_main_livelihood == 1 ? "Yes (Primary)" : "No (Secondary)"} />
                             <InfoRow label="Org Member" value={f.org_member == 1 ? "Yes" : "No"} />
                           </div>
                        </div>
                     </div>

                     {/* PERMITS & VESSELS */}
                     <div className="col-span-1 lg:col-span-2 space-y-4">
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1"><FileBadge size={14}/> Permits & Compliance</p>
                        <div className="p-4 bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/30 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <InfoRow label="Permit No." value={f.permit_no || 'None'} />
                           <InfoRow label="Inspection Status" value={f.inspection_status || 'Pending'} valueClass={f.inspection_status === 'Passed' ? 'text-emerald-500' : 'text-amber-500'} />
                           <InfoRow label="Date Issued" value={f.permit_date_issued} />
                           <InfoRow label="Expiry Date" value={f.permit_expiry} />
                        </div>

                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1 mt-6"><Ship size={14}/> Vessels & Gears ({boats.length})</p>
                        {boats.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                             {boats.map((boat: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm rounded-2xl">
                                   <p className="text-xs font-black text-cyan-700 dark:text-cyan-400 uppercase mb-2 border-b border-gray-100 dark:border-slate-700 pb-2 flex justify-between">
                                      Boat #{idx + 1}
                                      <span className="text-[9px] text-gray-400">{boat.boat_type}</span>
                                   </p>
                                   <div className="space-y-1">
                                      <InfoRow label="Name" value={boat.boat_name || 'Unnamed'} />
                                      <InfoRow label="Reg. No" value={boat.registration_no} />
                                      <InfoRow label="Gear Type" value={boat.gear_type} />
                                   </div>
                                </div>
                             ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center bg-gray-50/50 dark:bg-slate-900/50 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No vessel records found.</p>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* LOWER SECTION: ASSISTANCE & CATCH HISTORY */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                    
                    {/* ASSISTANCE HISTORY */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <Wallet size={14}/> Assistance History
                        </p>
                        {assistances.length > 0 ? (
                           <div className="space-y-2">
                              {assistances.map((ast: any, idx: number) => (
                                 <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                                    <p className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase">{ast.beneficiary_program}</p>
                                    <div className="flex justify-between items-center mt-1">
                                       <p className="text-[9px] text-gray-400 uppercase font-bold">{ast.assistance_type}</p>
                                       <p className="text-[9px] font-black text-emerald-600">{ast.date_released}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-4 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                              <p className="text-[10px] italic text-gray-400 uppercase">No assistance recorded</p>
                           </div>
                        )}
                    </div>

                    {/* 🌟 CATCH RECORDS LOG WITH ESTIMATED VALUE 🌟 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                               <Fish size={14}/> Catch History
                            </p>
                            {catches.length > 0 && (
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Total Est. Sales</p>
                                    <p className="text-xs font-black text-primary">₱{totalEstimatedValue.toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        {catches.length > 0 ? (
                           <div className="space-y-2">
                              {catches.slice(0, 5).map((catchRec: any, idx: number) => (
                                 <div key={idx} className="flex justify-between items-center p-3 bg-cyan-50/30 dark:bg-cyan-900/10 rounded-xl border border-cyan-100/50 dark:border-cyan-800/30 group/item hover:border-cyan-400 transition-colors">
                                    <div className="flex items-center gap-3">
                                       <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                          <Fish size={12} className="text-cyan-500" />
                                       </div>
                                       <div>
                                          <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase leading-none">{catchRec.catch_species}</p>
                                          <p className="text-[8px] text-gray-400 uppercase mt-1 font-bold">{catchRec.date} • {catchRec.fishing_area}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="flex items-center gap-1 justify-end">
                                          <p className="text-xs font-black text-cyan-600">{catchRec.yield} KG</p>
                                       </div>
                                       {/* 🌟 NEW: ESTIMATED VALUE LABEL */}
                                       <div className="flex items-center gap-1 justify-end mt-0.5">
                                          <PhilippinePeso size={8} className="text-primary" />
                                          <p className="text-[10px] font-black text-primary uppercase">
                                             {Number(catchRec.market_value || 0).toLocaleString()}
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                              {catches.length > 5 && (
                                <div className="py-2 text-center">
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-help hover:text-cyan-500 transition-colors">
                                      + {catches.length - 5} more records available
                                   </p>
                                </div>
                              )}
                           </div>
                        ) : (
                           <div className="p-4 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/30 dark:bg-slate-900/30">
                              <p className="text-[10px] italic text-gray-400 uppercase">No catch records found</p>
                           </div>
                        )}
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
