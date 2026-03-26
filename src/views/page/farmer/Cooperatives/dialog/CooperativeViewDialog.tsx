import { 
  X, MapPin, Phone, User, FileBadge, TrendingUp,
  Calendar, ShieldCheck, Building2, Fish, Sprout 
} from 'lucide-react';
import { cn } from '../../../../../lib/utils';

const CooperativeViewDialog = ({ isOpen, onClose, coop, onViewMembers }: any) => {
  if (!isOpen || !coop) return null;

  // Determine status color dynamically
  const statusLower = coop.status?.toLowerCase() || '';
  const statusClasses = 
    statusLower === 'active' || statusLower === 'compliant' 
      ? 'text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-800' 
      : statusLower === 'probationary' || statusLower === 'inactive'
        ? 'text-amber-600 border-amber-100 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-800'
        : 'text-rose-500 border-rose-100 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-800';

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* HEADER COVER */}
        <div className="h-32 bg-primary relative flex items-end p-8 shrink-0">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all cursor-pointer">
              <X size={20}/>
           </button>
           <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center absolute -bottom-10 left-8 border-4 border-white dark:border-slate-900 text-primary font-black text-2xl uppercase">
              {coop.name ? coop.name.substring(0,2) : <Building2 size={32} />}
           </div>
        </div>

        {/* CONTENT */}
        <div className="pt-14 p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
           
           {/* TITLE & BADGES */}
           <div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">{coop.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                 <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-[9px] font-black uppercase tracking-widest">
                    {coop.org_type || 'Organization'} • {coop.type}
                 </span>
                 <p className="px-2.5 py-1 bg-gray-50 dark:bg-slate-800 rounded-md text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border border-gray-100 dark:border-slate-700">
                    <FileBadge size={12} className="text-primary"/> 
                    {coop.registration || 'CDA'} No: {coop.cda_no}
                 </p>
              </div>
           </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-5">
               <InfoItem icon={<User size={14}/>} label="Chairman / Manager" value={coop.chairman} />
               <InfoItem icon={<TrendingUp size={14}/>} label="Capital / CBU" value={`₱${Number(coop.capital_cbu || 0).toLocaleString()}`} />
               
               {/* 🌟 CLICKABLE REGISTERED FARMERS */}
               <InfoItem 
                  icon={<Sprout size={14} />} 
                  label="Registered Farmers" 
                  value={`${coop.assigned_farmers_count || 0} Assigned`} 
                  highlight="blue"
                  onClick={onViewMembers ? () => onViewMembers(coop, 'farmers') : undefined}
               />

               {/* 🌟 CLICKABLE REGISTERED FISHERFOLKS */}
               <InfoItem 
                  icon={<Fish size={14} />} 
                  label="Registered Fisherfolks" 
                  value={`${coop.assigned_fisherfolks_count || 0} Assigned`} 
                  highlight="cyan"
                  onClick={onViewMembers ? () => onViewMembers(coop, 'fisherfolks') : undefined}
               />
               
               <InfoItem icon={<Phone size={14}/>} label="Contact No." value={coop.contact_no} />
               <InfoItem icon={<Calendar size={14}/>} label="Registry Date" value={new Date(coop.created_at).toLocaleDateString()} />
               
               <div className="col-span-2">
                 <InfoItem icon={<MapPin size={14}/>} label="Full Address" value={`${coop.address_details || 'N/A'}, Brgy. ${coop.barangay?.name || 'N/A'}`} />
               </div>
            </div>

           {/* FOOTER STATUS */}
           <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className={statusLower === 'active' || statusLower === 'compliant' ? "text-emerald-500" : "text-gray-400"} /> 
                 Registry Status
              </div>
              <div className={`px-4 py-1.5 rounded-full border ${statusClasses}`}>
                 {coop.status}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// MINI COMPONENT WITH HIGHLIGHTS & ONCLICK SUPPORT
const InfoItem = ({ icon, label, value, highlight, onClick }: any) => {
  const isClickable = !!onClick;
  
  let bgClass = 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800';
  let textClass = 'text-gray-700 dark:text-slate-200';
  let labelClass = 'text-gray-400';
  let hoverText = '';

  if (highlight === 'blue') {
    bgClass = 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-900/30';
    textClass = 'text-blue-700 dark:text-blue-400';
    labelClass = 'text-blue-500';
    hoverText = 'text-blue-500';
  } else if (highlight === 'cyan') {
    bgClass = 'bg-cyan-50/50 dark:bg-cyan-500/5 border-cyan-100 dark:border-cyan-900/30';
    textClass = 'text-cyan-700 dark:text-cyan-400';
    labelClass = 'text-cyan-500';
    hoverText = 'text-cyan-500';
  }

  return (
    <div 
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "p-4 rounded-2xl border transition-all relative overflow-hidden",
        bgClass,
        isClickable && "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 group"
      )}
    >
      <p className={cn("text-[9px] font-black uppercase flex items-center gap-2 mb-1", labelClass)}>
        {icon} {label}
      </p>
      <p className={cn("text-xs font-bold uppercase", textClass)}>
        {value || 'N/A'}
      </p>
      {isClickable && (
         <span className={cn("absolute bottom-3 right-4 text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity", hoverText)}>
            View List &rarr;
         </span>
      )}
    </div>
  );
};

export default CooperativeViewDialog;