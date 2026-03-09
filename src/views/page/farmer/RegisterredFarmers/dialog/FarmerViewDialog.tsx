import React from 'react';
import { 
  X, MapPin, Fingerprint, Calendar, LandPlot, Sprout, 
  Building2, User, Info, Waves, 
  HandCoins, Package, ClipboardCheck, Ban
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';

interface FarmerViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: any;
}

const FarmerViewDialog: React.FC<FarmerViewDialogProps> = ({ isOpen, onClose, farmer }) => {
  if (!isOpen || !farmer) return null;

  // Function para sa kwarta
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
  };

  // Condition check para sa Cooperative
  const isCoopMember = Number(farmer.is_coop_member) === 1;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop/Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER SECTION */}
        <div className="h-36 bg-primary relative flex items-end p-8 shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 cursor-pointer transition-all z-10"
          >
            <X size={20}/>
          </button>
          
          <div className="flex items-center gap-6 translate-y-4">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900 text-primary font-black text-3xl uppercase">
              {farmer.last_name[0]}{farmer.first_name[0]}
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-md">
                {farmer.first_name} {farmer.middle_name} {farmer.last_name} {farmer.suffix || ''}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-white/20",
                  farmer.status === 'active' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                  {farmer.status}
                </span>
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Fingerprint size={12}/> RSBSA: {farmer.rsbsa_no}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="pt-12 p-8 space-y-8 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          
          {/* 1. PERSONAL PROFILE */}
          <section>
            <SectionTitle icon={<User size={16}/>} title="Personal Profile" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoItem label="System ID" value={farmer.system_id} />
              <InfoItem label="Date of Birth" value={farmer.dob} />
              <InfoItem label="Gender" value={farmer.gender} />
              <InfoItem label="Contact No." value={farmer.contact_no} />
              <div className="sm:col-span-2">
                <InfoItem label="Residential Address" value={`${farmer.address_details}, ${farmer.barangay?.name}`} />
              </div>
              <InfoItem 
                label="Livelihood" 
                value={farmer.is_main_livelihood ? "Primary Source" : "Secondary Source"} 
                isHighlight={farmer.is_main_livelihood}
              />
              <InfoItem 
                label="Coop Status" 
                value={isCoopMember ? "Registered Member" : "NOT A MEMBER"} 
                isHighlight={isCoopMember}
              />
            </div>
          </section>

          {/* 2. FARM SPECIFICATIONS */}
          <section>
            <SectionTitle icon={<LandPlot size={16}/>} title="Farm Specifications" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <InfoItem icon={<MapPin size={12}/>} label="Farm Location" value={`SITIO ${farmer.farm_sitio || 'N/A'}, ${farmer.farm_location?.name}`} />
              </div>
              <InfoItem icon={<Sprout size={12}/>} label="Crop Category" value={farmer.crop?.category} />
              <InfoItem icon={<LandPlot size={12}/>} label="Total Area" value={`${farmer.total_area} HECTARES`} />
              <InfoItem label="Ownership" value={farmer.ownership_type} />
              <InfoItem label="Topography" value={farmer.topography} />
              <InfoItem icon={<Waves size={12}/>} label="Irrigation" value={farmer.irrigation_type} />
              <div className="sm:col-span-2">
                <InfoItem label="Area Breakdown" value={farmer.area_breakdown || 'No details provided'} />
              </div>
            </div>
          </section>

          {/* 3. COOPERATIVE DETAILS - DILI NA "0" ANG MOGAWAS */}
          {isCoopMember ? (
            <section className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-[2rem] relative overflow-hidden">
               <Building2 className="absolute -right-4 -bottom-4 text-emerald-500/10" size={120} />
               <SectionTitle icon={<Building2 className="text-emerald-600"/>} title="Cooperative Membership" color="text-emerald-800 dark:text-emerald-400" />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase">Organization Name</p>
                    <p className="text-sm font-black text-slate-800 dark:text-emerald-100 uppercase mt-1 leading-tight">{farmer.cooperative?.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase">CDA Registration No.</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-emerald-200 mt-1">{farmer.cooperative?.cda_no}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase">Coop Chairman</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-emerald-200 mt-1">{farmer.cooperative?.chairman}</p>
                  </div>
               </div>
            </section>
          ) : (
            <div className="p-5 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-center gap-3 opacity-60">
                <Ban size={18} className="text-gray-400" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Farmer is not affiliated with any Cooperative</p>
            </div>
          )}

          {/* 4. PROGRAM ASSISTANCE HISTORY */}
          <section>
            <SectionTitle icon={<ClipboardCheck size={16}/>} title="Program Assistance History" />
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
               {farmer.program_name ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                     <ProgramMetric icon={<Package className="text-blue-500"/>} label="Program Name" value={farmer.program_name} />
                     <ProgramMetric icon={<Info className="text-amber-500"/>} label="Assistance Type" value={farmer.assistance_type} />
                     <ProgramMetric icon={<Calendar className="text-purple-500"/>} label="Date Released" value={new Date(farmer.date_released).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})} />
                     <ProgramMetric icon={<LandPlot className="text-emerald-500"/>} label="Quantity Received" value={farmer.quantity} />
                     <ProgramMetric icon={<HandCoins className="text-rose-500"/>} label="Total Cost/Value" value={formatCurrency(farmer.total_cost)} />
                     <ProgramMetric icon={<Building2 className="text-indigo-500"/>} label="Funding Source" value={farmer.funding_source} />
                  </div>
               ) : (
                  <div className="text-center py-4">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No LGU Assistance History Found</p>
                  </div>
               )}
            </div>
          </section>

          {/* FOOTER METADATA */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-300 tracking-widest">
                <Calendar size={14} /> Registered On: {new Date(farmer.created_at).toLocaleDateString()}
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-300 tracking-widest">
                <Info size={14} /> System Updated: {new Date(farmer.updated_at).toLocaleString()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE UI SUB-COMPONENTS ---

const SectionTitle = ({ icon, title, color = "text-gray-800 dark:text-white" }: any) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">{icon}</div>
    <h4 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", color)}>{title}</h4>
  </div>
);

const InfoItem = ({ icon, label, value, isHighlight = false }: any) => (
  <div className={cn(
    "p-4 border rounded-2xl transition-all",
    isHighlight 
      ? "bg-primary/5 border-primary/20 shadow-sm" 
      : "bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800"
  )}>
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className="text-primary/50">{icon}</span>}
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
    </div>
    <p className={cn(
        "text-[11px] font-bold uppercase truncate",
        isHighlight ? "text-primary" : "text-gray-700 dark:text-slate-200"
    )}>{value || 'N/A'}</p>
  </div>
);

const ProgramMetric = ({ icon, label, value }: any) => (
  <div className="flex gap-4">
    <div className="mt-1 p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800 shrink-0">
       {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
    </div>
    <div className="flex flex-col justify-center">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className="text-xs font-black text-gray-700 dark:text-slate-100 uppercase leading-tight">{value || 'N/A'}</p>
    </div>
  </div>
);

export default FarmerViewDialog;