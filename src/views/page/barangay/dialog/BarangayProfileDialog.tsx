import React, { useState, useEffect } from 'react';
import { X, MapPin, Building2, Mountain, Sprout, Ship, Group, ChevronDown, Phone, User, LandPlot, AreaChart, Calendar, ClipboardList, Fingerprint, Waves, Info, Users, Briefcase } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface BarangayProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brgy: any;
  view: 'farmers' | 'fishery' | 'cooperatives' | 'all';
}

const BarangayProfileDialog: React.FC<BarangayProfileDialogProps> = ({ isOpen, onClose, brgy, view }) => {
  const [expandedFarmerId, setExpandedFarmerId] = useState<number | null>(null);
  const [expandedFisherId, setExpandedFisherId] = useState<number | null>(null);
  const [expandedCoopId, setExpandedCoopId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !brgy) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95">
        
        <div className="bg-primary p-8 text-white relative shrink-0">
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><MapPin size={160} /></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{brgy.name}</h3>
              <div className="flex items-center gap-3 mt-2 opacity-90 uppercase tracking-widest font-black text-[10px]">
                <span className="px-2 py-1 bg-white/20 rounded-md">{brgy.code}</span>
                <span className="flex items-center gap-1">
                  {brgy.type?.includes("Urban") ? <Building2 size={12}/> : <Mountain size={12}/>} {brgy.type}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all cursor-pointer"><X size={20} /></button>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-slate-950">
          {(view === 'farmers' || view === 'all') && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg"><Sprout size={18} /></div>
                <div><h4 className="text-[12px] font-black uppercase tracking-tight">Resident Farmers</h4><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{brgy.farmersList?.length || 0} Records</p></div>
              </div>
              {brgy.farmersList?.length > 0 ? brgy.farmersList.map((f: any) => (
                <FarmerCollapse key={f.id} farmer={f} isExpanded={expandedFarmerId === f.id} onToggle={() => setExpandedFarmerId(expandedFarmerId === f.id ? null : f.id)} />
              )) : <EmptyState text="No farmers found" />}
            </div>
          )}

          {(view === 'fishery' || view === 'all') && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 border-b border-cyan-100 dark:border-cyan-900/30 pb-3 text-cyan-600">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg"><Ship size={18} /></div>
                <div><h4 className="text-[12px] font-black uppercase tracking-tight text-cyan-700 dark:text-cyan-400">Registered Fisherfolk</h4><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{brgy.fisherfolksList?.length || 0} Records</p></div>
              </div>
              {brgy.fisherfolksList?.length > 0 ? brgy.fisherfolksList.map((f: any) => (
                <FisheryCollapse key={f.id} person={f} isExpanded={expandedFisherId === f.id} onToggle={() => setExpandedFisherId(expandedFisherId === f.id ? null : f.id)} />
              )) : <EmptyState text="No fisherfolk found" />}
            </div>
          )}

          {(view === 'cooperatives' || view === 'all') && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/30 pb-3 text-emerald-600">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><Group size={18} /></div>
                <div><h4 className="text-[12px] font-black uppercase tracking-tight text-emerald-700 dark:text-emerald-400">Active Cooperatives</h4><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{brgy.cooperativesList?.length || 0} Organizations</p></div>
              </div>
              {brgy.cooperativesList?.length > 0 ? brgy.cooperativesList.map((coop: any) => (
                <CoopCollapse key={coop.id} coop={coop} isExpanded={expandedCoopId === coop.id} onToggle={() => setExpandedCoopId(expandedCoopId === coop.id ? null : coop.id)} />
              )) : <EmptyState text="No cooperatives recorded" />}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest"><Info size={12} /> Sync Ref: BRGY-LOG-{brgy.id}</div>
          <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl shadow-xl active:scale-95 cursor-pointer">Close Profile</button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const EmptyState = ({ text }: { text: string }) => <div className="py-8 text-center text-gray-400 text-[10px] font-black uppercase italic border border-dashed rounded-3xl">{text}</div>;

const DetailItem = ({ icon, label, value }: any) => (
  <div>
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">{icon} {label}</p>
    <p className="text-[10px] font-bold text-gray-700 dark:text-slate-200 uppercase truncate">{value || 'N/A'}</p>
  </div>
);

// --- EXPANDED SUB-COMPONENTS ---

const FarmerCollapse = ({ farmer, isExpanded, onToggle }: any) => {
  const fullName = `${farmer.first_name || ''} ${farmer.last_name || ''} ${farmer.suffix || ''}`.trim();
  const initials = `${farmer.first_name?.[0] || 'F'}${farmer.last_name?.[0] || 'A'}`.toUpperCase();
  
  return (
    <div className={cn("border rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-900 transition-all", isExpanded ? "border-primary/30 shadow-md" : "border-gray-100 dark:border-slate-800")}>
      <button onClick={onToggle} className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">{initials}</div>
          <div className="text-left"><p className="text-xs font-black uppercase">{fullName}</p><p className="text-[9px] font-bold text-gray-400">RSBSA: {farmer.rsbsa_no}</p></div>
        </div>
        <ChevronDown size={16} className={cn("transition-transform duration-300", isExpanded && "rotate-180 text-primary")} />
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 text-[10px] grid grid-cols-2 gap-4 border-t border-primary/10 pt-4">
          <DetailItem icon={<Phone size={10}/>} label="Contact" value={farmer.contact_no} />
          <DetailItem icon={<User size={10}/>} label="Gender" value={farmer.gender} />
          <DetailItem icon={<LandPlot size={10}/>} label="Total Area" value={`${Number(farmer.total_area).toFixed(2)} Ha`} />
          <DetailItem icon={<AreaChart size={10}/>} label="Topography" value={farmer.topography} />
          <DetailItem icon={<Sprout size={10}/>} label="Ownership" value={farmer.ownership_type} />
          <DetailItem icon={<ClipboardList size={10}/>} label="Irrigation" value={farmer.irrigation_type} />
          
          <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Area Breakdown</p>
            <p className="font-bold uppercase text-[10px]">{farmer.area_breakdown}</p>
          </div>

          <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <p className="text-[8px] font-black text-blue-600 uppercase">Program: {farmer.program_name}</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <p className="font-bold text-blue-800 dark:text-blue-300 uppercase">{farmer.assistance_type} ({farmer.quantity})</p>
                <p className="font-bold text-blue-800 dark:text-blue-300 uppercase italic">Cost: ₱{Number(farmer.total_cost).toLocaleString()}</p>
            </div>
            <p className="text-[8px] font-bold mt-1 text-blue-600/70">Funded by: {farmer.funding_source}</p>
          </div>
          <div className="col-span-2 text-[9px] font-black text-gray-400 uppercase">Farm: {farmer.farm_sitio}, {farmer.farm_location?.name}</div>
        </div>
      )}
    </div>
  );
};

const FisheryCollapse = ({ person, isExpanded, onToggle }: any) => {
  const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
  const initials = `${person.first_name?.[0] || 'F'}${person.last_name?.[0] || 'S'}`.toUpperCase();

  return (
    <div className={cn("border rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-900 transition-all", isExpanded ? "border-cyan-500/30 shadow-md" : "border-gray-100 dark:border-slate-800")}>
      <button onClick={onToggle} className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-cyan-50/50 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-black text-[10px]">{initials}</div>
          <div className="text-left">
            <p className="text-xs font-black uppercase">{fullName}</p>
            <p className="text-[9px] font-bold text-gray-400">ID: {person.system_id}</p>
          </div>
        </div>
        <ChevronDown size={16} className={cn("transition-transform duration-300", isExpanded && "rotate-180 text-cyan-500")} />
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 text-[10px] grid grid-cols-2 gap-4 border-t border-cyan-100 pt-4">
          <DetailItem icon={<Phone size={10}/>} label="Contact" value={person.contact_no} />
          <DetailItem icon={<User size={10}/>} label="Status" value={person.status} />
          <DetailItem icon={<Ship size={10}/>} label="Boat Name" value={person.boat_name} />
          <DetailItem icon={<Waves size={10}/>} label="Boat Type" value={person.boat_type} />
          <DetailItem icon={<Briefcase size={10}/>} label="Fisher Type" value={person.fisher_type} />
          <DetailItem icon={<Calendar size={10}/>} label="Years Fishing" value={`${person.years_in_fishing} years`} />

          {/* Permit Details */}
          <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1"><Fingerprint size={10}/> Permit Info</p>
            <p className="font-bold uppercase text-[10px]">{person.permit_no || 'No permit'} {person.permit_expiry ? `(Exp: ${person.permit_expiry})` : ''}</p>
          </div>

          {/* Program Assistance */}
          <div className="col-span-2 p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-xl border border-cyan-100 dark:border-cyan-900/20">
            <p className="text-[8px] font-black text-cyan-600 uppercase">Program: {person.beneficiary_program}</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <p className="font-bold text-cyan-800 dark:text-cyan-300 uppercase">{person.assistance_type} ({person.quantity})</p>
                <p className="font-bold text-cyan-800 dark:text-cyan-300 uppercase italic">Released: {person.date_released}</p>
            </div>
            <p className="text-[8px] font-bold mt-1 text-cyan-600/70">Funded by: {person.funding_source}</p>
          </div>
          
          <div className="col-span-2 text-[9px] font-black text-gray-400 uppercase">Org: {person.org_name || 'Individual'}</div>
        </div>
      )}
    </div>
  );
};

const CoopCollapse = ({ coop, isExpanded, onToggle }: any) => (
  <div className={cn("border rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-900", isExpanded ? "border-emerald-500/30 shadow-md" : "border-gray-100 dark:border-slate-800")}>
    <button onClick={onToggle} className="cursor-pointer w-full flex items-center justify-between p-5 text-left hover:bg-emerald-50/50 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-[10px]">CO</div>
        <div><p className="text-xs font-black uppercase">{coop.name}</p><p className="text-[9px] font-bold text-emerald-600">CDA: {coop.cda_no}</p></div>
      </div>
      <ChevronDown size={20} className={cn("text-gray-300 transition-all", isExpanded && "rotate-180 text-emerald-500")} />
    </button>
    {isExpanded && (
      <div className="px-6 pb-6 pt-2 text-[10px] grid grid-cols-2 gap-4 border-t border-emerald-500/10">
        <DetailItem icon={<User size={10}/>} label="Chairman" value={coop.chairman} />
        <DetailItem icon={<ClipboardList size={10}/>} label="Type" value={coop.type} />
        <DetailItem icon={<Users size={10}/>} label="Total Members" value={coop.member_count} />
        <DetailItem icon={<Fingerprint size={10}/>} label="Status" value={coop.status} />
        <div className="col-span-2 p-3 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Capital CBU</p>
            <p className="font-black text-lg text-emerald-700 dark:text-emerald-400">₱{Number(coop.capital_cbu).toLocaleString()}</p>
        </div>
        <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Office Address</p>
            <p className="font-bold uppercase">{coop.address_details}</p>
        </div>
      </div>
    )}
  </div>
);

export default BarangayProfileDialog;