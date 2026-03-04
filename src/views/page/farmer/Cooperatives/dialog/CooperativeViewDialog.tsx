import { X, MapPin, Phone, User, FileBadge, TrendingUp, Users, Calendar, ShieldCheck } from 'lucide-react';

const CooperativeViewDialog = ({ isOpen, onClose, coop }: any) => {
  if (!isOpen || !coop) return null;
  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
        <div className="h-32 bg-primary relative flex items-end p-8">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all cursor-pointer"><X size={20}/></button>
           <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center absolute -bottom-10 left-8 border-4 border-white dark:border-slate-900 text-primary font-black text-2xl uppercase">{coop.name.substring(0,2)}</div>
        </div>
        <div className="pt-14 p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
           <div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">{coop.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase tracking-widest">{coop.type} Cooperative</span>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><FileBadge size={12} className="text-primary"/> CDA No: {coop.cda_no}</p>
              </div>
           </div>

            <div className="grid grid-cols-2 gap-6">
               <InfoItem icon={<User size={14}/>} label="Chairman / Manager" value={coop.chairman} />
               <InfoItem icon={<Users size={14}/>} label="Member Count Estimated" value={`${coop.member_count} Active Members`} />
               <InfoItem icon={<TrendingUp size={14}/>} label="Capital / CBU" value={`₱${Number(coop.capital_cbu).toLocaleString()}`} />
               <InfoItem icon={<Phone size={14}/>} label="Contact No." value={coop.contact_no} />
               <InfoItem icon={<MapPin size={14}/>} label="Address" value={`${coop.address_details || 'N/A'}, Brgy. ${coop.barangay?.name || 'N/A'}`} />
               <InfoItem icon={<Calendar size={14}/>} label="Registry Date" value={new Date(coop.created_at).toLocaleDateString()} />
            </div>

           <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Compliance Verified</div>
              <div className={`px-4 py-1.5 rounded-full border ${coop.status === 'Compliant' ? 'text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 border-red-100 bg-red-50 dark:bg-red-900/20'}`}>{coop.status}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: any) => (
  <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
    <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-2 mb-1">{icon} {label}</p>
    <p className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase">{value || 'N/A'}</p>
  </div>
);

export default CooperativeViewDialog;