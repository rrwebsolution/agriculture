import { useState } from "react";
import { CardListSkeleton, EmptyState, InfoRow } from "./RegistryTabContents";
import { ChevronDown, Leaf, PhilippinePeso, Users, Wheat } from "lucide-react";
import { cn } from "../../../../lib/utils";

// --- CROPS TAB ---
export const CropsTabContent = ({ crops, isLoading }: { crops: any[], isLoading?: boolean }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) return <CardListSkeleton type="expandable" />;
  if (!crops || crops.length === 0) return <EmptyState icon={<Leaf size={40}/>} text="No Crops Recorded" />;

  return (
    <div className="flex flex-col gap-4">
      {crops.map((c: any) => {
        const isExpanded = expandedId === c.id;
        return (
          <div key={c.id} className={cn("bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden relative", isExpanded ? "border-emerald-500 shadow-xl shadow-emerald-500/10" : "border-emerald-100 dark:border-emerald-900/30 hover:shadow-lg")}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Leaf size={150} className="text-emerald-500" /></div>
             
             <div onClick={() => setExpandedId(isExpanded ? null : c.id)} className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none group relative z-10">
                <div className="flex items-center gap-4">
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl uppercase transition-colors shrink-0", isExpanded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-emerald-50 dark:bg-slate-800 text-emerald-600 group-hover:bg-emerald-100")}><Leaf size={24}/></div>
                   <div><h4 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-tight pr-8">{c.category}</h4><p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{c.remarks}</p></div>
                </div>
                
                <div className="flex items-center gap-6">
                   <div className="hidden md:flex items-center gap-4 text-right">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Area</p>
                         <p className="text-sm font-black text-emerald-600 uppercase">{Number(c.totalArea || 0).toFixed(2)} HA</p>
                      </div>
                      <div className="border-l border-gray-200 dark:border-slate-700 pl-4">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Farmers</p>
                         <p className="text-sm font-black text-emerald-600 uppercase">{c.registered_farmers_count}</p>
                      </div>
                      <div className="border-l border-gray-200 dark:border-slate-700 pl-4">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 justify-end"><PhilippinePeso size={10}/> Total Sales</p>
                         <p className="text-sm font-black text-emerald-600 uppercase">₱ {Number(c.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                   <div className={cn("p-2 rounded-full transition-transform", isExpanded ? "bg-emerald-50 text-emerald-500 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}><ChevronDown size={20} /></div>
                </div>
             </div>

             {isExpanded && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-4 border-t border-emerald-100 dark:border-emerald-900/30 mt-2 bg-emerald-50/30 dark:bg-slate-900/50">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest my-4 flex items-center gap-2"><Users size={14}/> Registered Farmers & Harvests</p>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {(c.registered_farmers || []).map((farmer: any) => {
                         const indvSales = farmer.individual_sales || 0;
                         return (
                           <div key={farmer.id} className="p-5 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-700 pb-4">
                                 <div className="flex items-center gap-3">
                                   <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0">{String(farmer.last_name || ' ')[0]}{String(farmer.first_name || ' ')[0]}</div>
                                   <div><p className="text-sm font-black text-gray-800 dark:text-white uppercase leading-none">{farmer.first_name} {farmer.last_name}</p><p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">RSBSA: {farmer.rsbsa_no}</p></div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Sales</p>
                                    <p className="text-lg font-black text-emerald-600 uppercase">₱ {indvSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <InfoRow label="Area" value={`${Number(farmer.total_area || 0).toFixed(2)} HA`} />
                                   <InfoRow label="Topography" value={farmer.topography} />
                                   <InfoRow label="Contact" value={farmer.contact_no} />
                                </div>
                                <div>
                                  {farmer.harvest_records && farmer.harvest_records.length > 0 ? (
                                    <div className="space-y-2">
                                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1"><Wheat size={12}/> Harvest Log</p>
                                      {farmer.harvest_records.map((h: any, idx: number) => (
                                         <div key={idx} className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                            <div>
                                               <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300"><span className="text-emerald-600 font-black">{h.quantity}</span> • {h.quality}</p>
                                               <p className="text-[8px] font-black text-gray-400 uppercase mt-0.5">{h.dateHarvested}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-emerald-600">₱ {parseFloat(String(h.value || '0').replace(/[^0-9.-]+/g, "")).toLocaleString()}</p>
                                         </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-full border border-dashed border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-3 text-center bg-gray-50/50 dark:bg-slate-900/50">
                                       <Wheat size={16} className="text-gray-300 mb-1" />
                                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No Harvests Recorded</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
             )}
          </div>
        );
      })}
    </div>
  );
};