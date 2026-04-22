import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Building2, Mountain, Sprout, ChevronDown, 
  Phone, User, LandPlot, Calendar, ClipboardList, 
  Fingerprint, Waves, Info, Users, Briefcase, Anchor, CreditCard, ShieldCheck 
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface BarangayProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brgy: any;
  view: 'farmers' | 'fishery' | 'cooperatives' | 'all';
}

const BarangayProfileDialog: React.FC<BarangayProfileDialogProps> = ({ isOpen, onClose, brgy, view }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !brgy) return null;

  const handleToggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER SECTION */}
        <div className="bg-primary p-10 text-white relative shrink-0 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute -right-10 -top-10 opacity-10 rotate-12 scale-150 pointer-events-none text-white">
            <MapPin size={200} />
          </div>
          <div className="absolute left-0 bottom-0 w-full h-24 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                    {brgy.code}
                 </span>
                 <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-80">
                    {brgy.type?.includes("Urban") ? <Building2 size={14}/> : <Mountain size={14}/>} {brgy.type}
                 </span>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none drop-shadow-lg">
                {brgy.name}
              </h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Barangay Registry Profile</p>
            </div>
            <button 
                onClick={onClose} 
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all cursor-pointer backdrop-blur-md active:scale-90"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50 dark:bg-slate-950">
          
          {/* 1. FARMERS SECTION */}
          {(view === 'farmers' || view === 'all') && (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
              <SectionHeading 
                icon={<Sprout size={20} />} 
                title="Resident Farmers" 
                count={brgy.farmersList?.length} 
                color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
              />
              <div className="grid gap-3">
                {brgy.farmersList?.length > 0 ? brgy.farmersList.map((f: any) => (
                  <FarmerCard 
                    key={f.id} 
                    farmer={f} 
                    isExpanded={expandedId === `f-${f.id}`} 
                    onToggle={() => handleToggle(`f-${f.id}`)} 
                  />
                )) : <EmptyState text="No farmers found in this barangay" />}
              </div>
            </div>
          )}

          {/* 2. FISHERFOLK SECTION */}
          {(view === 'fishery' || view === 'all') && (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-75">
              <SectionHeading 
                icon={<Anchor size={20} />} 
                title="Registered Fisherfolk" 
                count={brgy.fisherfolksList?.length} 
                color="text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" 
              />
              <div className="grid gap-3">
                {brgy.fisherfolksList?.length > 0 ? brgy.fisherfolksList.map((f: any) => (
                  <FisherCard 
                    key={f.id} 
                    person={f} 
                    isExpanded={expandedId === `fi-${f.id}`} 
                    onToggle={() => handleToggle(`fi-${f.id}`)} 
                  />
                )) : <EmptyState text="No fisherfolk records found" />}
              </div>
            </div>
          )}

          {/* 3. COOPERATIVES SECTION */}
          {(view === 'cooperatives' || view === 'all') && (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-150">
              <SectionHeading 
                icon={<Building2 size={20} />} 
                title="Active Cooperatives" 
                count={brgy.cooperativesList?.length} 
                color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
              />
              <div className="grid gap-3">
                {brgy.cooperativesList?.length > 0 ? brgy.cooperativesList.map((coop: any) => (
                  <CoopCard 
                    key={coop.id} 
                    coop={coop} 
                    isExpanded={expandedId === `c-${coop.id}`} 
                    onToggle={() => handleToggle(`c-${coop.id}`)} 
                  />
                )) : <EmptyState text="No cooperatives recorded" />}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Reference: {brgy.id}</span>
          </div>
          <button 
            onClick={onClose} 
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-widest px-10 py-4 rounded-2xl shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SectionHeading = ({ icon, title, count, color }: any) => (
  <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
    <div className="flex items-center gap-3">
      <div className={cn("p-2.5 rounded-2xl shadow-sm", color)}>{icon}</div>
      <div>
        <h4 className="text-sm font-black uppercase tracking-tight text-gray-800 dark:text-slate-100">{title}</h4>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{count || 0} Registered Records</p>
      </div>
    </div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
    <div className="py-10 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2rem]">
      <Info size={24} className="mx-auto text-gray-200 mb-2" />
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">{text}</p>
    </div>
);

const DataBox = ({ icon, label, value, highlight = false }: any) => (
  <div className={cn(
    "p-3 rounded-2xl border transition-all",
    highlight ? "bg-primary/5 border-primary/20" : "bg-white dark:bg-slate-800 border-gray-50 dark:border-slate-700"
  )}>
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
        {icon} {label}
    </p>
    <p className={cn("text-[10px] font-bold uppercase truncate", highlight ? "text-primary" : "text-gray-700 dark:text-slate-200")}>
        {value || 'N/A'}
    </p>
  </div>
);

// --- COLLAPSIBLE CARDS ---

const FarmerCard = ({ farmer, isExpanded, onToggle }: any) => (
  <div className={cn(
    "rounded-[2rem] border transition-all duration-300 overflow-hidden",
    isExpanded ? "bg-white dark:bg-slate-900 border-primary shadow-xl shadow-primary/5 -translate-y-1" : "bg-white/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 hover:border-primary/30"
  )}>
    <button onClick={onToggle} className="w-full p-5 flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all", isExpanded ? "bg-primary text-white scale-110 shadow-lg" : "bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary")}>
          {farmer.last_name?.[0]}{farmer.first_name?.[0]}
        </div>
        <div className="text-left">
          <p className="text-xs font-black uppercase text-gray-800 dark:text-slate-100">{farmer.first_name} {farmer.last_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">RSBSA: {farmer.rsbsa_no}</span>
             <span className="h-1 w-1 rounded-full bg-gray-300" />
             <span className="text-[9px] font-black text-primary uppercase">{farmer.topography}</span>
          </div>
        </div>
      </div>
      <ChevronDown size={18} className={cn("transition-transform text-gray-300", isExpanded && "rotate-180 text-primary")} />
    </button>
    {isExpanded && (
      <div className="px-5 pb-6 animate-in slide-in-from-top-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50/50 dark:bg-slate-950 rounded-[1.5rem] border border-gray-200 dark:border-slate-800">
           <DataBox icon={<Phone size={10}/>} label="Contact" value={farmer.contact_no} />
           <DataBox icon={<LandPlot size={10}/>} label="Total Area" value={`${farmer.total_area} HA`} highlight />
           <DataBox icon={<MapPin size={10}/>} label="Farm Barangay" value={farmer.farmLocation?.name || farmer.farm_barangay_name || (farmer.farm_barangay_id ? `Barangay #${farmer.farm_barangay_id}` : '')} />
           <DataBox icon={<ShieldCheck size={10}/>} label="Livelihood" value={farmer.is_main_livelihood ? "Primary" : "Secondary"} />
           <DataBox icon={<Sprout size={10}/>} label="Ownership" value={farmer.ownership_type} />
           <DataBox icon={<Waves size={10}/>} label="Irrigation" value={farmer.irrigation_type} />
           <DataBox icon={<ClipboardList size={10}/>} label="Program" value={farmer.program_name} />
           <div className="col-span-full p-3 bg-primary/5 rounded-xl border border-primary/10 mt-2">
              <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Area Breakdown</p>
              <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200 uppercase">{farmer.area_breakdown || 'No specific breakdown provided'}</p>
           </div>
        </div>
      </div>
    )}
  </div>
);

const FisherCard = ({ person, isExpanded, onToggle }: any) => (
  <div className={cn(
    "rounded-[2rem] border transition-all duration-300 overflow-hidden",
    isExpanded ? "bg-white dark:bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/5 -translate-y-1" : "bg-white/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 hover:border-cyan-500/30"
  )}>
    <button onClick={onToggle} className="w-full p-5 flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all", isExpanded ? "bg-cyan-500 text-white scale-110 shadow-lg" : "bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-500")}>
          {person.last_name?.[0]}{person.first_name?.[0]}
        </div>
        <div className="text-left">
          <p className="text-xs font-black uppercase text-gray-800 dark:text-slate-100">{person.first_name} {person.last_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Boat: {person.boat_name}</span>
             <span className="h-1 w-1 rounded-full bg-gray-300" />
             <span className="text-[9px] font-black text-cyan-500 uppercase">{person.fisher_type}</span>
          </div>
        </div>
      </div>
      <ChevronDown size={18} className={cn("transition-transform text-gray-300", isExpanded && "rotate-180 text-cyan-500")} />
    </button>
    {isExpanded && (
      <div className="px-5 pb-6 animate-in slide-in-from-top-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50/50 dark:bg-slate-950 rounded-[1.5rem] border border-gray-200 dark:border-slate-800">
           <DataBox icon={<Waves size={10}/>} label="Boat Type" value={person.boat_type} highlight />
           <DataBox icon={<Briefcase size={10}/>} label="Years Fishing" value={`${person.years_in_fishing} Years`} />
           <DataBox icon={<Phone size={10}/>} label="Contact" value={person.contact_no} />
           <DataBox icon={<MapPin size={10}/>} label="Barangay" value={person.barangay?.name || person.barangay_name} />
           <DataBox icon={<Fingerprint size={10}/>} label="Permit No." value={person.permit_no} />
           <DataBox icon={<Calendar size={10}/>} label="Expiry" value={person.permit_expiry} />
           <DataBox icon={<Users size={10}/>} label="Org Name" value={person.org_name} />
           <div className="col-span-full p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 mt-2">
              <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest mb-1">Assistance History</p>
              <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200 uppercase">{person.assistance_type} ({person.quantity}) - {person.beneficiary_program}</p>
           </div>
        </div>
      </div>
    )}
  </div>
);

const CoopCard = ({ coop, isExpanded, onToggle }: any) => (
  <div className={cn(
    "rounded-[2rem] border transition-all duration-300 overflow-hidden",
    isExpanded ? "bg-white dark:bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/5 -translate-y-1" : "bg-white/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 hover:border-blue-500/30"
  )}>
    <button onClick={onToggle} className="w-full p-5 flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] transition-all", isExpanded ? "bg-blue-500 text-white scale-110 shadow-lg" : "bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-500")}>CO</div>
        <div className="text-left">
          <p className="text-xs font-black uppercase text-gray-800 dark:text-slate-100">{coop.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">CDA: {coop.cda_no}</span>
             <span className="h-1 w-1 rounded-full bg-gray-300" />
             <span className="text-[9px] font-black text-blue-500 uppercase">{coop.type}</span>
          </div>
        </div>
      </div>
      <ChevronDown size={18} className={cn("transition-transform text-gray-300", isExpanded && "rotate-180 text-blue-500")} />
    </button>
    {isExpanded && (
      <div className="px-5 pb-6 animate-in slide-in-from-top-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-50/50 dark:bg-slate-950 rounded-[1.5rem] border border-gray-200 dark:border-slate-800">
           <DataBox icon={<User size={10}/>} label="Chairman" value={coop.chairman} highlight />
           <DataBox icon={<Users size={10}/>} label="Member Count" value={coop.member_count} />
           <DataBox icon={<ShieldCheck size={10}/>} label="Compliance" value={coop.status} />
           <div className="col-span-full md:col-span-1">
             <DataBox icon={<CreditCard size={10}/>} label="Capital CBU" value={`₱${Number(coop.capital_cbu).toLocaleString()}`} />
           </div>
           <div className="col-span-full p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 mt-2">
              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Official Address</p>
              <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200 uppercase">{coop.address_details}</p>
           </div>
        </div>
      </div>
    )}
  </div>
);

export default BarangayProfileDialog;
