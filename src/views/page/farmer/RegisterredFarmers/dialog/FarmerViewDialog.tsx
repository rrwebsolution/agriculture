import { X, MapPin, Phone, Fingerprint, Calendar, LandPlot, Sprout, Building2, ShieldCheck } from 'lucide-react';

const FarmerViewDialog = ({ isOpen, onClose, farmer }: any) => {
  if (!isOpen || !farmer) return null;
  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="h-32 bg-primary relative flex items-end p-8">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 cursor-pointer transition-all"><X size={20}/></button>
           <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center absolute -bottom-10 left-8 border-4 border-white dark:border-slate-900 text-primary font-black text-2xl uppercase">{farmer.last_name[0]}{farmer.first_name[0]}</div>
        </div>
        <div className="pt-14 p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
           <div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">{farmer.first_name} {farmer.middle_name} {farmer.last_name}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase tracking-widest">Farmer Profile</span>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Fingerprint size={12} className="text-primary"/> RSBSA: {farmer.rsbsa_no}</p>
              </div>
           </div>

            <div className="grid grid-cols-2 gap-4">
               <InfoItem icon={<Fingerprint size={14}/>} label="System Farmer ID" value={farmer.system_id} />
               <InfoItem icon={<Calendar size={14}/>} label="Date of Birth" value={farmer.dob} />
               <InfoItem icon={<Sprout size={14}/>} label="Main Crop" value={farmer.crop?.category} />
               <InfoItem icon={<Building2 size={14}/>} label="Ownership" value={farmer.ownership_type} />
               <InfoItem icon={<LandPlot size={14}/>} label="Total Area" value={`${farmer.total_area} Hectares`} />
               <InfoItem icon={<ShieldCheck size={14}/>} label="Livelihood" value={farmer.is_main_livelihood ? "Primary" : "Secondary"} />
               <InfoItem icon={<MapPin size={14}/>} label="Residence" value={farmer.barangay?.name} />
               <InfoItem icon={<Phone size={14}/>} label="Contact" value={farmer.contact_no} />
            </div>

            {farmer.is_coop_member && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center gap-3">
                   <Building2 className="text-emerald-500" size={24} />
                   <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase">Cooperative Member</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-emerald-200 uppercase">{farmer.cooperative?.name || "N/A"}</p>
                   </div>
                </div>
            )}

           <div className="pt-4 border-t flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <div className="flex items-center gap-2"><Calendar size={14} /> Registered: {new Date(farmer.created_at).toLocaleDateString()}</div>
              <div className={`px-3 py-1 rounded-full border ${farmer.status === 'active' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-rose-500 border-rose-100 bg-rose-50'}`}>{farmer.status}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: any) => (
  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-800">
    <p className="text-[8px] font-black text-gray-400 uppercase flex items-center gap-2 mb-1">{icon} {label}</p>
    <p className="text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase truncate">{value || 'N/A'}</p>
  </div>
);

export default FarmerViewDialog;