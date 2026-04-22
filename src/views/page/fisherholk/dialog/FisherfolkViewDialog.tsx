import React from 'react';
import { 
  X, MapPin, Phone, Fingerprint, Anchor, ShieldCheck, 
  Calendar, User, Sprout, Ship, 
  CheckCircle2, GraduationCap, HandCoins,
  Building2, Activity, Fish, PhilippinePeso
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface FisherfolkViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fisher: any | null;
  cooperatives: any[]; 
}

const FisherfolkViewDialog: React.FC<FisherfolkViewDialogProps> = ({ isOpen, onClose, fisher, cooperatives = [] }) => {
  
  if (!isOpen || !fisher) return null;

  const isActive = fisher.status === 'active';
  const isMainLivelihood = fisher.is_main_livelihood == 1 || fisher.is_main_livelihood === true;
  const isOrgMember = fisher.org_member == 1 || fisher.org_member === true;

  // Arrays extraction
  const boats = Array.isArray(fisher.boats_list) ? fisher.boats_list : [];
  const assistances = Array.isArray(fisher.assistances_list) ? fisher.assistances_list : [];
  
  // 🌟 FIX: Safety check for catch records (Laravel usually sends camelCase or snake_case based on the relationship name)
  const catches = Array.isArray(fisher.catch_records) ? fisher.catch_records : 
                  Array.isArray(fisher.catchRecords) ? fisher.catchRecords : [];

  const residenceBarangay =
    fisher.barangay?.name ??
    fisher.barangay_name ??
    (fisher.barangay_id ? `Barangay #${fisher.barangay_id}` : '');

  const farmLocation =
    typeof fisher.farm_location === 'object'
      ? fisher.farm_location?.name
      : fisher.farm_location;
  
  // Association mapping
  let affiliatedCoops: string[] = [];

  if (Array.isArray(fisher.assigned_cooperatives) && fisher.assigned_cooperatives.length > 0) {
      affiliatedCoops = fisher.assigned_cooperatives.map((c: any) => c.name);
  } else if (Array.isArray(fisher.cooperative_id) && fisher.cooperative_id.length > 0) {
      affiliatedCoops = fisher.cooperative_id.map((id: any) => {
          const match = cooperatives?.find(c => c.id.toString() === id.toString());
          return match ? match.name : `Association (ID: ${id})`;
      });
  }

  // 🌟 Compute Total Estimated Value from catch records
  const totalEstimatedValue = catches.reduce((sum: number, rec: any) => 
      sum + parseFloat(String(rec.market_value || 0)), 0
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* HEADER / BANNER */}
        <div className="relative shrink-0 h-44 bg-primary p-8 flex items-end">
           <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-black/10 hover:bg-black/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10 z-10 cursor-pointer">
             <X size={20}/>
           </button>
           
           <div className="flex items-center gap-6 relative z-10 translate-y-6">
             <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 text-primary font-black text-4xl ring-8 ring-black/5 uppercase shrink-0">
                {fisher.first_name?.[0]}{fisher.last_name?.[0]}
             </div>
             <div className="mb-8">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
                    isActive ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30" : "bg-red-500/20 text-red-100 border-red-400/30"
                  )}>
                    {fisher.status}
                  </span>
                  {isMainLivelihood && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-100 border border-amber-400/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                      Main Livelihood
                    </span>
                  )}
                  {isOrgMember && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-100 border border-blue-400/30 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={10}/> Org. Member
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md truncate max-w-xl">
                   {fisher.first_name} {fisher.middle_name} {fisher.last_name} {fisher.suffix && fisher.suffix !== 'None' ? fisher.suffix : ''}
                </h2>
                <p className="text-white/80 font-bold text-xs flex items-center gap-2 mt-1 uppercase tracking-widest">
                   <Fingerprint size={14} className="opacity-70"/> Registry ID: <span className="text-white font-black">{fisher.system_id}</span>
                </p>
             </div>
           </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto pt-16 px-8 pb-10 space-y-8 bg-white dark:bg-slate-950 custom-scrollbar">
           
           {/* QUICK STATS */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatItem icon={<MapPin size={14}/>} label="Barangay" value={residenceBarangay} color="text-red-500" />
              <StatItem icon={<Anchor size={14}/>} label="Type" value={fisher.fisher_type} color="text-blue-500" />
              <StatItem icon={<Calendar size={14}/>} label="Experience" value={`${fisher.years_in_fishing || 0} Years`} color="text-amber-500" />
              <StatItem icon={<ShieldCheck size={14}/>} label="Permit Status" value={fisher.inspection_status} color="text-emerald-500" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PERSONAL INFO */}
              <div className="space-y-4">
                <SectionTitle icon={<User size={14}/>} title="Personal Profile" color="text-primary" />
                <div className="space-y-3">
                   <DetailRow icon={<Activity size={14}/>} label="Civil Status" value={fisher.civil_status} />
                   <DetailRow icon={<Activity size={14}/>} label="Gender" value={fisher.gender} />
                   <DetailRow icon={<Calendar size={14}/>} label="Birthday" value={fisher.dob} />
                   <DetailRow icon={<Phone size={14}/>} label="Contact" value={fisher.contact_no} />
                   <DetailRow icon={<GraduationCap size={14}/>} label="Education" value={fisher.education} />
                   <DetailRow icon={<MapPin size={14}/>} label="Barangay" value={residenceBarangay} />
                   <DetailRow icon={<MapPin size={14}/>} label="Detailed Address" value={fisher.address_details} />
                </div>
              </div>

              {/* MARITIME DETAILS (BOATS & GEARS) */}
              <div className="space-y-4">
                <SectionTitle icon={<Ship size={14}/>} title={`Vessels & Gears (${boats.length})`} color="text-blue-500" />
                {boats.length > 0 ? (
                  <div className="space-y-3">
                    {boats.map((boat: any, idx: number) => (
                      <div key={idx} className="bg-blue-50/50 dark:bg-slate-900/50 rounded-2xl p-5 border border-blue-100 dark:border-slate-800 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center border-b border-blue-100/50 dark:border-slate-800 pb-2 mb-2">
                           <h4 className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Boat #{idx + 1}: {boat.boat_name || 'Unnamed'}</h4>
                           <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full text-gray-500">{boat.boat_type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                           <SmallInfo label="Engine HP" value={boat.engine_hp} />
                           <SmallInfo label="Reg. No" value={boat.registration_no} />
                           <SmallInfo label="Gear Type" value={boat.gear_type} />
                           <SmallInfo label="Fishing Area" value={boat.fishing_area} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-gray-400 uppercase italic p-6 bg-gray-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800 text-center">No boat records found.</p>
                )}
              </div>
           </div>

           {/* AQUACULTURE OPERATOR ONLY */}
           {fisher.fisher_type === 'Aquaculture Operator' && (
             <div className="animate-in slide-in-from-bottom-4 duration-500">
                <SectionTitle icon={<Sprout size={14}/>} title="Farm Information" color="text-emerald-500" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-emerald-50/50 dark:bg-emerald-900/10 p-8 mt-4 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
                   <SmallInfo label="Farm Name" value={fisher.farm_name} />
                   <SmallInfo label="Farm Type" value={fisher.farm_type} />
                   <SmallInfo label="Size" value={fisher.farm_size} />
                   <SmallInfo label="Species Cultured" value={fisher.species_cultured} />
                   <div className="sm:col-span-2">
                      <SmallInfo label="Farm Location" value={farmLocation} />
                   </div>
                </div>
             </div>
           )}

           {/* 🌟 ASSISTANCES & CATCH RECORDS GRID */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500 border-t border-gray-100 dark:border-slate-800 pt-8">
               
               {/* ASSISTANCES */}
               <div className="space-y-4">
                 <SectionTitle icon={<HandCoins size={14}/>} title={`Program Assistances (${assistances.length})`} color="text-amber-500" />
                 {assistances.length > 0 ? (
                    <div className="space-y-3 mt-4">
                        {assistances.map((asst: any, idx: number) => (
                        <div key={idx} className="bg-amber-50/50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-amber-100 dark:border-yellow-700/30 flex flex-col justify-between shadow-sm">
                            <h4 className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-500 mb-1">{asst.beneficiary_program}</h4>
                            <div className="flex justify-between items-center mt-2">
                               <p className="text-[9px] font-bold text-gray-500 uppercase flex gap-2">
                                 <span>{asst.assistance_type}</span> • <span>Qty: {asst.quantity}</span>
                               </p>
                               <span className="text-[10px] font-black text-gray-700 dark:text-slate-300 uppercase">{asst.date_released}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-[10px] font-bold text-gray-400 uppercase italic p-6 bg-gray-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800 text-center mt-4">No assistance records found.</p>
                 )}
               </div>

               {/* 🌟 CATCH HISTORY */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-cyan-600">
                        <Fish size={14}/> Catch History
                      </h3>
                      {catches.length > 0 && (
                          <div className="text-right">
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-0.5">Total Est. Sales</p>
                              <p className="text-xs font-black text-primary leading-none">₱{totalEstimatedValue.toLocaleString()}</p>
                          </div>
                      )}
                  </div>
                  
                  {catches.length > 0 ? (
                     <div className="space-y-3 mt-4">
                        {catches.slice(0, 5).map((catchRec: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center p-3 bg-cyan-50/30 dark:bg-cyan-900/10 rounded-xl border border-cyan-100/50 dark:border-cyan-800/30 group hover:border-cyan-400 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <Fish size={14} className="text-cyan-500" />
                                 </div>
                                 <div>
                                    <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase leading-none">{catchRec.catch_species}</p>
                                    <p className="text-[8px] text-gray-400 uppercase mt-1 font-bold">{catchRec.date} • {catchRec.fishing_area}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-black text-cyan-600">{catchRec.yield} KG</p>
                                 <div className="flex items-center justify-end gap-1 mt-0.5">
                                    <PhilippinePeso size={10} className="text-primary" />
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
                                + {catches.length - 5} more records
                             </p>
                          </div>
                        )}
                     </div>
                  ) : (
                     <p className="text-[10px] font-bold text-gray-400 uppercase italic p-6 bg-gray-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800 text-center mt-4">No catch records found.</p>
                  )}
               </div>

           </div>

           {/* ASSOCIATIONS */}
           {isOrgMember && (
             <div className="animate-in slide-in-from-bottom-4 duration-500 pt-4 border-t border-gray-100 dark:border-slate-800">
               <SectionTitle icon={<Building2 size={14}/>} title={`Affiliated Associations (${affiliatedCoops.length})`} color="text-blue-500" />
               {affiliatedCoops.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-4">
                    {affiliatedCoops.map((coopName: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800 text-[10px] font-black uppercase tracking-tight shadow-sm">
                        <CheckCircle2 size={14} /> {coopName}
                    </div>
                    ))}
                </div>
               ) : (
                <p className="text-[10px] font-bold text-gray-400 uppercase italic mt-4 px-2 border border-dashed p-4 rounded-xl text-center">Member of an association but records are incomplete.</p>
               )}
             </div>
           )}

           {/* FOOTER TIMESTAMPS */}
           <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-6 items-center justify-center sm:justify-between text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar size={12} className="opacity-50"/> Created: {new Date(fisher.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-2"><Calendar size={12} className="opacity-50"/> Last Updated: {new Date(fisher.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SectionTitle = ({ icon, title, color }: { icon: any, title: string, color: string }) => (
  <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2", color)}>
    {icon} {title}
  </h3>
);

const StatItem = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
    <div className={cn("p-1.5 w-fit rounded-lg bg-gray-50 dark:bg-slate-800", color)}>{icon}</div>
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{label}</p>
    <p className="text-[11px] font-black text-gray-800 dark:text-white truncate uppercase">{value || 'N/A'}</p>
  </div>
);

const DetailRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 group">
    <div className="flex items-center gap-2 text-gray-400">
      <div className="opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{label}</span>
    </div>
    <span className="text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase text-right truncate max-w-[60%]">{value || '---'}</span>
  </div>
);

const SmallInfo = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 tracking-tighter">{label}</p>
    <p className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase">{value || 'N/A'}</p>
  </div>
);

export default FisherfolkViewDialog;
