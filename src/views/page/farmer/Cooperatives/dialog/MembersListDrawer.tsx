import React, { useState, useEffect } from 'react';
import { 
  X, User, Ship, MapPin, Phone, ShieldCheck, 
  ChevronUp, ChevronDown, Sprout, Fish, Map, HandCoins, PhilippinePeso, Search
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';

interface MembersListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  coop: any;
  defaultTab?: 'farmers' | 'fisherfolks';
}

const MembersListDrawer: React.FC<MembersListDrawerProps> = ({ isOpen, onClose, coop, defaultTab = 'farmers' }) => {
  const [activeTab, setActiveTab] = useState<'farmers' | 'fisherfolks'>(defaultTab);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setExpandedId(null);
      setSearchQuery('');
    }
  }, [isOpen, defaultTab, coop]);

  if (!isOpen || !coop) return null;

  const currentList = activeTab === 'farmers' 
    ? (coop.assigned_farmers_list || []) 
    : (coop.assigned_fisherfolks_list || []);

  const filteredMembers = currentList.filter((member: any) => {
    const fullName = `${member.first_name} ${member.middle_name || ''} ${member.last_name}`.toLowerCase();
    const rsbsa = (member.rsbsa_no || '').toLowerCase();
    const systemId = (member.system_id || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || rsbsa.includes(query) || systemId.includes(query);
  });

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const getFarmBarangayName = (farm: any) =>
    farm?.farm_barangay?.name ||
    farm?.farmLocation?.name ||
    farm?.farm_barangay_name ||
    (farm?.farm_barangay_id ? `Barangay #${farm.farm_barangay_id}` : 'N/A');

  const getMemberBarangayName = (member: any) =>
    member?.barangay?.name ||
    member?.barangay_name ||
    (member?.barangay_id ? `Barangay #${member.barangay_id}` : 'N/A');

  return (
    <div className="fixed inset-0 z-200 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl h-full bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 border-l border-gray-200 dark:border-slate-800">
        
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 shrink-0 relative overflow-hidden flex flex-col justify-end min-h-40">
           <button type="button" onClick={handleClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full transition-all z-100 shadow-sm">
              <X size={20} />
           </button>

           <div className="relative z-10">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none mb-4 pr-12">
                 {coop.name}
              </h2>
              
              {/* TABS */}
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                 <button 
                   onClick={() => setActiveTab('farmers')} 
                   className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === 'farmers' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                 >
                    <Sprout size={14}/> Farmers ({coop.assigned_farmers_count || 0})
                 </button>
                 <button 
                   onClick={() => setActiveTab('fisherfolks')} 
                   className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === 'fisherfolks' ? "bg-white dark:bg-slate-900 text-cyan-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                 >
                    <Fish size={14}/> Fisherfolks ({coop.assigned_fisherfolks_count || 0})
                 </button>
              </div>
           </div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 md:p-6 pb-0 shrink-0">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                 type="text" 
                 placeholder={`Search ${activeTab} by name or ID...`}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
              />
           </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
           {filteredMembers.length > 0 ? (
             filteredMembers.map((member: any) => {
               const isExpanded = expandedId === member.id;
               const isFarmer = activeTab === 'farmers';

               // 🌟 COMPUTE TOTAL CATCH VALUE
               const catches = Array.isArray(member.catch_records) ? member.catch_records : [];
               const totalCatchValue = catches.reduce((sum: number, rec: any) => sum + parseFloat(String(rec.market_value || 0)), 0);

               return (
                 <div key={member.id} className="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
                   
                   {/* MEMBER HEADER (ACCORDION TRIGGER) */}
                   <div onClick={() => setExpandedId(isExpanded ? null : member.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
                      <div className="flex items-start gap-4 flex-1 pr-4">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform", isFarmer ? "bg-blue-50 border-blue-100 text-blue-500" : "bg-cyan-50 border-cyan-100 text-cyan-600")}>
                              <User size={20} />
                          </div>
                          <div className="flex-1 pt-0.5">
                              <h4 className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">
                                  {member.last_name}, {member.first_name} {member.middle_name ? member.middle_name.charAt(0) + '.' : ''} {member.suffix && member.suffix !== 'None' ? member.suffix : ''}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest">
                                      <ShieldCheck size={10} /> {member.rsbsa_no ? `RSBSA: ${member.rsbsa_no}` : `ID: ${member.system_id}`}
                                  </span>
                              </div>
                          </div>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                   </div>

                   {/* DETAILS CONTENT */}
                   {isExpanded && (
                     <div className="p-5 bg-slate-50/50 space-y-6 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in">
                        
                        {/* ADDRESS & CONTACT */}
                        <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 uppercase bg-white p-3 rounded-xl border border-gray-100">
                           <span className="flex items-center gap-1.5"><MapPin size={12}/> {member.address_details || 'No address provided'} {getMemberBarangayName(member) !== 'N/A' ? `, ${getMemberBarangayName(member)}` : ''}</span>
                           <span className="flex items-center gap-1.5"><Phone size={12}/> {member.contact_no || 'N/A'}</span>
                        </div>

                        {/* SPECIFIC DATA (Farms for Farmers, Boats/Gears for Fisherfolks) */}
                        {isFarmer ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <Map size={16} />
                                    <h5 className="text-xs font-black uppercase tracking-widest">Farm Locations ({member.farms_list?.length || 0})</h5>
                                </div>
                                {member.farms_list?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {member.farms_list.map((farm: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span className="text-gray-400">Crop:</span>
                                                    <span className="text-emerald-600 font-black uppercase">{farm.crop_name || `Crop ID ${farm.crop_id}`}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                                    <span>Area: {Number(farm.total_area)} ha</span>
                                                        <span>Brgy. {getFarmBarangayName(farm)}</span>
                                                    </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">No farm records.</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* FISHERFOLK SUMMARY */}
                                <div className="flex flex-wrap gap-3 text-[10px] font-bold text-cyan-700 uppercase bg-cyan-50/50 p-3 rounded-xl border border-cyan-100">
                                    <span>Type: {member.fisher_type || 'N/A'}</span>
                                    <span>•</span>
                                    <span>Experience: {member.years_in_fishing || 0} Yrs</span>
                                    {member.is_main_livelihood === 1 && (
                                        <>
                                          <span>•</span>
                                          <span className="bg-cyan-500 text-white px-2 py-0.5 rounded">Main Livelihood</span>
                                        </>
                                    )}
                                </div>

                                {/* BOATS & GEARS */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-cyan-600">
                                        <Ship size={16} />
                                        <h5 className="text-xs font-black uppercase tracking-widest">Boats & Gears ({member.boats_list?.length || 0})</h5>
                                    </div>
                                    {member.boats_list?.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {member.boats_list.map((boat: any, idx: number) => (
                                                <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                                    <div className="flex justify-between text-xs font-bold mb-1">
                                                        <span className="text-gray-400">Boat Name:</span>
                                                        <span className="text-cyan-600 font-black uppercase truncate ml-2">{boat.boat_name || 'Unnamed Vessel'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mt-2">
                                                        <span>Type: {boat.boat_type}</span>
                                                        <span>HP: {boat.engine_hp || 'N/A'}</span>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-gray-50 flex flex-col gap-1 text-[10px] font-bold text-gray-500 uppercase">
                                                        <div className="flex justify-between">
                                                            <span>Gear: {boat.gear_type}</span>
                                                            <span>Units: {boat.gear_units || 0}</span>
                                                        </div>
                                                        {boat.fishing_area && (
                                                            <div className="text-gray-400 truncate">Area: {boat.fishing_area}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-bold text-gray-400 uppercase italic px-2">No boat records found.</p>
                                    )}
                                </div>

                                {/* 🌟 CATCH HISTORY */}
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                   <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                       <div className="flex items-center gap-2 text-cyan-600">
                                          <Fish size={16} />
                                          <h5 className="text-xs font-black uppercase tracking-widest">Catch History ({catches.length})</h5>
                                       </div>
                                       {catches.length > 0 && (
                                           <div className="text-right">
                                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-0.5">Total Est. Sales</p>
                                              {/* 🌟 Fixed variable name below */}
                                              <p className="text-xs font-black text-primary leading-none">₱{totalCatchValue.toLocaleString()}</p>
                                           </div>
                                       )}
                                   </div>
                                   {catches.length > 0 ? (
                                      <div className="space-y-2 mt-2">
                                         {catches.slice(0, 3).map((catchRec: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-cyan-400 transition-colors">
                                               <div className="flex items-center gap-3">
                                                  <div className="p-2 bg-cyan-50 dark:bg-slate-800 rounded-lg shadow-sm">
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
                                         {catches.length > 3 && (
                                           <div className="py-2 text-center">
                                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-help hover:text-cyan-500 transition-colors">
                                                 + {catches.length - 3} more records
                                              </p>
                                           </div>
                                         )}
                                      </div>
                                   ) : (
                                      <p className="text-[10px] font-bold text-gray-400 uppercase italic px-2">No catch records found.</p>
                                   )}
                                </div>
                            </div>
                        )}

                        {/* ASSISTANCES (COMMON FOR BOTH) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-500">
                                <HandCoins size={16} />
                                <h5 className="text-xs font-black uppercase tracking-widest">Received Assistances ({member.assistances_list?.length || 0})</h5>
                            </div>
                            {member.assistances_list?.length > 0 ? (
                                <div className="space-y-2">
                                    {member.assistances_list.map((asst: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-white rounded-xl border border-amber-100 flex justify-between items-center gap-4">
                                            <div>
                                                <h6 className="text-xs font-black text-gray-800 uppercase">{asst.beneficiary_program}</h6>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Qty: {asst.quantity} • Source: {asst.funding_source}</p>
                                            </div>
                                            <div className="text-right">
                                                {asst.total_cost && (
                                                   <div className="text-sm font-black text-amber-600">₱{Number(asst.total_cost).toLocaleString()}</div>
                                                )}
                                                {asst.date_released && (
                                                   <div className="text-[9px] font-bold text-gray-400 mt-1">{new Date(asst.date_released).toLocaleDateString()}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] font-bold text-gray-400 uppercase italic">No assistance records.</p>
                            )}
                        </div>

                     </div>
                   )}
                 </div>
               );
             })
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-60">
               <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-gray-400" />
               </div>
               <h3 className="text-sm font-black text-gray-800 uppercase mb-1">No Results</h3>
               <p className="text-xs font-bold text-gray-500 uppercase">No {activeTab} were found.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MembersListDrawer;
