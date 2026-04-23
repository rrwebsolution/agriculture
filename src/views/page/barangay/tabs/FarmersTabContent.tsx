import { useState } from "react";
import { Activity, CheckCircle2, ChevronDown, Map as MapIcon, Sprout, UserCheck, Wallet } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { FarmerCombinedMap } from "../map/FarmerCombinedMap";
import { CardListSkeleton, EmptyState, InfoRow } from "./RegistryTabContents";


export const FarmersTabContent = ({ 
  farmers, 
  isLoading, 
  allBarangays = [] 
}: { 
  farmers: any[], 
  isLoading?: boolean,
  allBarangays?: any[] 
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getBarangayName = (id: number | string) => {
    const brgy = allBarangays.find(b => String(b.id) === String(id));
    return brgy ? brgy.name : "Unknown Barangay";
  };

  const parseFarms = (farmer: any) => {
    if (Array.isArray(farmer?.farms_list)) return farmer.farms_list;
    if (typeof farmer?.farms_list === 'string') {
      try {
        const parsed = JSON.parse(farmer.farms_list);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  if (isLoading) return <CardListSkeleton type="expandable" />;
  if (!farmers || farmers.length === 0) return <EmptyState icon={<Sprout size={40}/>} text="No Farmers Recorded" />;

  return (
    <div className="flex flex-col gap-4">
      {farmers.map((f: any) => {
        const isExpanded = expandedId === f.id;
        const cooperatives = f.assigned_cooperatives || [];
        const farms = parseFarms(f);

        return (
          <div key={f.id} className={cn("bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 overflow-hidden", isExpanded ? "border-emerald-500 shadow-xl shadow-emerald-500/10" : "border-gray-100 dark:border-slate-800 hover:border-emerald-500/50")}>
            
            {/* CARD HEADER */}
            <div onClick={() => setExpandedId(isExpanded ? null : f.id)} className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none group">
               <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl uppercase transition-colors shrink-0", isExpanded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-gray-100 dark:bg-slate-800 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600")}>
                     {String(f.last_name || ' ')[0]}{String(f.first_name || ' ')[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none">{f.first_name} {f.middle_name} {f.last_name} {f.suffix !== 'None' ? f.suffix : ''}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700">RSBSA: {f.rsbsa_no}</span>
                      <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1", f.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100")}><CheckCircle2 size={10}/> {f.status}</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Area</p>
                     <p className="text-lg font-black text-emerald-600 uppercase">{Number(f.total_area || 0).toFixed(2)} HA</p>
                  </div>
                  <div className={cn("p-2 rounded-full transition-transform", isExpanded ? "bg-emerald-50 text-emerald-500 rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100")}><ChevronDown size={20} /></div>
               </div>
            </div>
            
            {/* EXPANDED CONTENT */}
            {isExpanded && (
               <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                     
                     {/* LEFT COLUMN: PERSONAL & LIVELIHOOD */}
                     <div className="col-span-1 space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><UserCheck size={14}/> Personal Information</p>
                           <div className="space-y-2">
                              <InfoRow label="Gender" value={f.gender} />
                              <InfoRow label="Date of Birth" value={f.dob} />
                              <InfoRow label="Contact" value={f.contact_no} />
                              <InfoRow label="Address" value={f.address_details} />
                           </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Activity size={14}/> Livelihood & Affiliation</p>
                           <div className="space-y-4">
                              <InfoRow label="Main Livelihood" value={f.is_main_livelihood ? "Yes (Primary)" : "No (Secondary)"} />
                              
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Organization Membership:</label>
                                 
                                 {cooperatives.length > 0 ? (
                                    cooperatives.map((coop: any) => (
                                       <div key={coop.id} className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl space-y-1">
                                          <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase leading-tight">{coop.name}</p>
                                          <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase">
                                             <span>{coop.org_type || 'Association'} • {coop.type}</span>
                                             <span className="text-emerald-600">{coop.registration}: {coop.status}</span>
                                          </div>
                                       </div>
                                    ))
                                 ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                                       <p className="text-[9px] font-bold text-gray-400 uppercase italic">Not a member of any organization</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* RIGHT COLUMN: PARCELS & MAP */}
                     <div className="col-span-1 lg:col-span-2 space-y-4">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><MapIcon size={14}/> Land Parcels & Map View</p>
                        <FarmerCombinedMap farms={farms} farmerName={`${f.first_name} ${f.last_name}`} />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                           {farms.map((farm: any, idx: number) => (
                              <div key={idx} className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl">
                                 <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase mb-2 border-b border-emerald-100 dark:border-emerald-800/50 pb-2 flex justify-between">
                                    <span>Parcel {idx + 1}</span>
                                    <span className="text-emerald-500 italic">Brgy. {getBarangayName(farm.farm_barangay_id)}</span>
                                 </p>
                                 <div className="space-y-1">
                                    <InfoRow label="Farm Location" value={farm.farm_sitio || 'N/A'} />
                                    <InfoRow label="Area" value={`${Number(farm.total_area || 0).toFixed(2)} HA`} />
                                    <InfoRow label="Ownership" value={farm.ownership_type} />
                                    <InfoRow label="Topography" value={farm.topography} />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* ASSISTANCE HISTORY SECTION */}
                  {f.assistances_list && f.assistances_list.length > 0 && (
                     <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Wallet size={14}/> Assistance History</p>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse min-w-150">
                              <thead>
                                 <tr className="bg-gray-50 dark:bg-slate-800 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                    <th className="p-3 rounded-l-lg">Program Name</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Quantity</th>
                                    <th className="p-3">Date Released</th>
                                    <th className="p-3 rounded-r-lg">Funding Source</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {f.assistances_list.map((ast: any, idx: number) => (
                                    <tr key={idx} className="border-b border-gray-50 dark:border-slate-800 last:border-0 text-xs font-bold text-gray-700 dark:text-gray-300">
                                       <td className="p-3">{ast.program_name}</td>
                                       <td className="p-3">{ast.assistance_type}</td>
                                       <td className="p-3 text-emerald-600">{ast.quantity}</td>
                                       <td className="p-3">{ast.date_released}</td>
                                       <td className="p-3">{ast.funding_source}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  )}
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

