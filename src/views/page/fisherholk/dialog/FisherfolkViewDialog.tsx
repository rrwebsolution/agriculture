import { X, MapPin, Phone, Fingerprint, Anchor, ShieldCheck, Calendar, User, BookOpen, Sprout } from 'lucide-react';

const FisherfolkViewDialog = ({ isOpen, onClose, fisher }: any) => {
  if (!isOpen || !fisher) return null;

  // Determine status color
  const isOk = fisher.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Banner */}
        <div className="h-40 bg-linear-to-r from-blue-700 to-cyan-600 relative p-8">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 text-white rounded-full hover:bg-black/30 transition-all"><X size={20}/></button>
           
           <div className="absolute -bottom-12 left-10 flex items-end gap-6">
             <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900 text-blue-600 font-black text-3xl uppercase">
                {fisher.first_name?.[0]}{fisher.last_name?.[0]}
             </div>
             <div className="mb-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none shadow-black/20 drop-shadow-md">
                   {fisher.first_name} {fisher.last_name} {fisher.suffix}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="px-2 py-0.5 bg-white/20 text-white rounded-md text-[9px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                     {fisher.fisher_type || 'Unclassified'}
                   </span>
                   <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest flex items-center gap-1">
                     <Fingerprint size={12}/> ID: {fisher.system_id || 'N/A'}
                   </p>
                </div>
             </div>
           </div>
        </div>

        <div className="pt-16 px-8 pb-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
           
           {/* Section 1: Overview Grid */}
           <div className="grid grid-cols-2 gap-4">
              <ViewCard icon={<MapPin className="text-red-500"/>} label="Location" value={`${fisher.barangay?.name || ''}, ${fisher.address_details || ''}`} />
              <ViewCard icon={<Phone className="text-green-500"/>} label="Contact" value={fisher.contact_no} />
              <ViewCard icon={<User className="text-blue-500"/>} label="Civil Status" value={fisher.civil_status} />
              <ViewCard icon={<BookOpen className="text-purple-500"/>} label="Education" value={fisher.education} />
           </div>

           {/* Section 2: Maritime Details */}
           <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                 <Anchor size={14}/> Maritime Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                 <DetailItem label="Boat Name" value={fisher.boat_name} />
                 <DetailItem label="Boat Type" value={fisher.boat_type} />
                 <DetailItem label="Engine HP" value={fisher.engine_hp} />
                 <DetailItem label="Registration" value={fisher.registration_no} />
                 <DetailItem label="Fishing Gear" value={fisher.gear_type} />
                 <DetailItem label="Fishing Area" value={fisher.fishing_area} />
              </div>
           </div>

           {/* Section 3: Aquaculture (Conditional) */}
           {fisher.fisher_type === 'Aquaculture Operator' && (
             <div className="space-y-4">
                <h3 className="text-xs font-black text-green-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                   <Sprout size={14}/> Aquaculture Farm
                </h3>
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl grid grid-cols-2 gap-4">
                   <DetailItem label="Farm Name" value={fisher.farm_name} />
                   <DetailItem label="Type" value={fisher.farm_type} />
                   <DetailItem label="Size" value={fisher.farm_size} />
                   <DetailItem label="Species" value={fisher.species_cultured} />
                </div>
             </div>
           )}

           {/* Footer Status */}
           <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase">
                 <Calendar size={12} /> Registered: {fisher.created_at ? new Date(fisher.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                isOk ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                <ShieldCheck size={12} /> {fisher.inspection_status || 'Pending'}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ViewCard = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
     <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">{icon}</div>
     <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-30">{value || '-'}</p>
     </div>
  </div>
);

const DetailItem = ({ label, value }: any) => (
  <div>
     <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
     <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{value || 'N/A'}</p>
  </div>
);

export default FisherfolkViewDialog;