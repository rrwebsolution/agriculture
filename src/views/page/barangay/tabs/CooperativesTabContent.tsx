import { useState } from "react";
import { CardListSkeleton, EmptyState, InfoRow } from "./RegistryTabContents";
import { Activity, Anchor, Building2, CheckCircle2, ChevronDown, Sprout, User, UserCheck, Users } from "lucide-react";
import { cn } from "../../../../lib/utils";

// --- COOPS TAB ---
export const CooperativesTabContent = ({ cooperatives, isLoading }: { cooperatives: any[], isLoading?: boolean }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeList, setActiveList] = useState<'farmers' | 'fisherfolks' | null>(null);

  const toggleMainAccordion = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setActiveList(null);
    } else {
      setExpandedId(id);
      setActiveList(null);
    }
  };

  const toggleList = (listType: 'farmers' | 'fisherfolks') => {
    setActiveList(activeList === listType ? null : listType);
  };

  if (isLoading) return <CardListSkeleton type="expandable" />;
  if (!cooperatives || cooperatives.length === 0) return <EmptyState icon={<Building2 size={40}/>} text="No Organizations Recorded" />;
  
  return (
    <div className="flex flex-col gap-4">
      {cooperatives.map((c: any) => {
        const isExpanded = expandedId === c.id;
        const regPrefix = c.registration ? `${c.registration}: ` : 'CDA: ';
        const totalMembers = (c.assigned_farmers_count || 0) + (c.assigned_fisherfolks_count || 0);

        return (
          <div key={c.id} className={cn("bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden", isExpanded ? "border-blue-500 shadow-xl shadow-blue-500/10" : "border-gray-100 dark:border-slate-800 hover:border-blue-500/50")}>
            
            <div onClick={() => toggleMainAccordion(c.id)} className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none group">
               <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl uppercase transition-colors shrink-0", isExpanded ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-gray-100 dark:bg-slate-800 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600")}>
                     <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-tight">{c.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700">
                         {regPrefix} {c.cda_no}
                      </span>
                      <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1", c.status === 'active' || c.status === 'Compliant' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100")}>
                         <CheckCircle2 size={10}/> {c.status}
                      </span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</p>
                     <p className="text-sm font-black text-blue-600 uppercase">{c.org_type || 'Cooperative'} • {c.type}</p>
                  </div>
                  <div className={cn("p-2 rounded-full transition-transform", isExpanded ? "bg-blue-50 text-blue-500 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}>
                     <ChevronDown size={20} />
                  </div>
               </div>
            </div>

            {isExpanded && (
               <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                     
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><UserCheck size={14}/> Representative & Contact</p>
                        <div className="space-y-2">
                           <InfoRow label="Chairman/Manager" value={c.chairman} />
                           <InfoRow label="Contact No." value={c.contact_no} />
                           <InfoRow label="Address" value={`${c.address_details || 'N/A'}, Brgy. ${c.barangay?.name || c.barangay_id}`} />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Activity size={14}/> Organization Profile</p>
                        <div className="space-y-2">
                           <InfoRow label="Capital / CBU" value={`₱ ${Number(c.capital_cbu || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} valueClass="text-emerald-600" />
                           <InfoRow label="Total Registered Members" value={totalMembers} />
                           
                           {/* IN-LINE TOGGLE BUTTONS */}
                           <div className="flex gap-2 mt-4 pt-2 border-t border-gray-50 dark:border-slate-800/50">
                              <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); toggleList('farmers'); }}
                                 className={cn("flex-1 p-3 rounded-xl border flex justify-between items-center transition-all cursor-pointer active:scale-95", activeList === 'farmers' ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30 text-emerald-600")}
                              >
                                 <span className={cn("text-[10px] font-bold uppercase flex items-center gap-1", activeList === 'farmers' ? "text-white" : "text-emerald-600")}><Sprout size={12}/> Farmers</span>
                                 <span className={cn("text-sm font-black", activeList === 'farmers' ? "text-white" : "text-emerald-700")}>{c.assigned_farmers_count || 0}</span>
                              </button>
                              
                              <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); toggleList('fisherfolks'); }}
                                 className={cn("flex-1 p-3 rounded-xl border flex justify-between items-center transition-all cursor-pointer active:scale-95", activeList === 'fisherfolks' ? "bg-cyan-500 text-white border-cyan-500 shadow-md" : "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/10 dark:hover:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30 text-cyan-600")}
                              >
                                 <span className={cn("text-[10px] font-bold uppercase flex items-center gap-1", activeList === 'fisherfolks' ? "text-white" : "text-cyan-600")}><Anchor size={12}/> Fisherfolks</span>
                                 <span className={cn("text-sm font-black", activeList === 'fisherfolks' ? "text-white" : "text-cyan-700")}>{c.assigned_fisherfolks_count || 0}</span>
                              </button>
                           </div>
                           
                        </div>
                     </div>

                     {/* 🌟 IN-LINE ACCORDION CONTENT (FARMERS / FISHERFOLKS) 🌟 */}
                     {activeList && (
                        <div className="col-span-1 md:col-span-2 mt-2 pt-6 border-t border-gray-100 dark:border-slate-800/50 animate-in slide-in-from-top-4 fade-in">
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                             <Users size={14} className={activeList === 'farmers' ? "text-emerald-500" : "text-cyan-500"} /> 
                             {activeList === 'farmers' ? 'Registered Farmers' : 'Registered Fisherfolks'} List
                           </h5>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2 pb-2">
                             {activeList === 'farmers' && (c.assigned_farmers_list || []).length > 0 ? (
                                c.assigned_farmers_list.map((member: any) => (
                                  <div key={member.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800/30 rounded-xl flex items-center gap-3 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-black text-sm text-emerald-600 uppercase shrink-0">
                                      {String(member.last_name || ' ')[0]}{String(member.first_name || ' ')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-black uppercase truncate dark:text-white leading-none mb-1 text-gray-800">{member.first_name} {member.last_name}</p>
                                      <p className="text-[9px] font-bold text-emerald-600 uppercase truncate">RSBSA: {member.rsbsa_no || 'N/A'}</p>
                                    </div>
                                  </div>
                                ))
                             ) : activeList === 'fisherfolks' && (c.assigned_fisherfolks_list || []).length > 0 ? (
                                c.assigned_fisherfolks_list.map((member: any) => (
                                  <div key={member.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 border border-transparent hover:border-cyan-100 dark:hover:border-cyan-800/30 rounded-xl flex items-center gap-3 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-black text-sm text-cyan-600 uppercase shrink-0">
                                      {String(member.last_name || ' ')[0]}{String(member.first_name || ' ')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-black uppercase truncate dark:text-white leading-none mb-1 text-gray-800">{member.first_name} {member.last_name}</p>
                                      <p className="text-[9px] font-bold text-gray-400 uppercase truncate"><User size={10} className="inline mr-1 opacity-50"/> {member.fisher_type || 'N/A'}</p>
                                    </div>
                                  </div>
                                ))
                             ) : (
                               <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">No {activeList} found in this organization.</p>
                               </div>
                             )}
                           </div>
                        </div>
                     )}

                  </div>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};