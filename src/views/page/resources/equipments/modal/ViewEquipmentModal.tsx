import { X, Eye, Tractor, MapPin, Users, Settings, Activity, Info, Calendar, LayoutGrid } from 'lucide-react';
import { cn } from '../../../../../lib/utils';

interface ViewEquipmemtModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
}

export default function ViewEquipmemtModal({ isOpen, onClose, selectedItem }: ViewEquipmemtModalProps) {
  if (!isOpen || !selectedItem) return null;

  // --- FALLBACK HELPERS ---
  
  const formatBeneficiary = (val: any) => {
    if (Array.isArray(val)) {
        return val.length > 0 ? val.join(", ") : "Unassigned";
    }
    return val && val !== "" ? val : "Unassigned";
  };

  const formatLocation = (val: any) => {
    if (Array.isArray(val)) {
        return val.length > 0 ? val.join(", ") : "No Location Set";
    }
    return val && val !== "" ? val : "No Location Set";
  };

  const formatLastCheck = (val: any) => {
    if (!val || val === "" || val === "N/A") {
        return "No check record";
    }
    return val;
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Eye size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">Equipmemt Information</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Detailed View</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* HERO SECTION */}
            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mb-4 shadow-inner">
                    <Tractor size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none">{selectedItem.name}</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                    {selectedItem.sku}
                </p>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Settings size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Identification</span>
                    </div>
                    <div className="space-y-3">
                        <DetailItem label="Equipmemt Type" value={selectedItem.type || "N/A"} icon={<LayoutGrid size={14}/>} />
                        <DetailItem label="Funding Program" value={selectedItem.program || "Unspecified"} icon={<Info size={14}/>} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Activity size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ownership & State</span>
                    </div>
                    <div className="space-y-3">
                        <DetailItem 
                           label="Beneficiary" 
                           value={formatBeneficiary(selectedItem.beneficiary)} 
                           isUnassigned={formatBeneficiary(selectedItem.beneficiary) === "Unassigned"}
                           icon={<Users size={14}/>} 
                        />
                        <DetailItem 
                           label="Location" 
                           value={formatLocation(selectedItem.location)} 
                           isUnassigned={formatLocation(selectedItem.location) === "No Location Set"}
                           icon={<MapPin size={14}/>} 
                        />
                    </div>
                </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            {/* METRICS ROW */}
            <div className="grid grid-cols-3 gap-4">
                <StatusCard label="Condition" value={selectedItem.condition} 
                    color={selectedItem.condition === 'Excellent' || selectedItem.condition === 'Good' ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50'} />
                
                <StatusCard label="Status" value={selectedItem.status} 
                    color={selectedItem.status === 'Deployed' ? 'text-blue-500 bg-blue-50' : 'text-emerald-500 bg-emerald-50'} />
                
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Checked</p>
                    <p className={cn(
                        "text-xs font-bold flex items-center gap-1.5",
                        formatLastCheck(selectedItem.lastCheck) === "No check record" ? "text-gray-400 italic font-medium" : "text-slate-700 dark:text-slate-300"
                    )}>
                        <Calendar size={12} className={formatLastCheck(selectedItem.lastCheck) === "No check record" ? "text-gray-300" : "text-primary"}/> 
                        {formatLastCheck(selectedItem.lastCheck)}
                    </p>
                </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end shrink-0">
            <button type="button" onClick={onClose} className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:opacity-90 transition-all active:scale-95">
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
const DetailItem = ({ label, value, icon, isUnassigned }: any) => (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm">
        <div className={cn("text-primary", isUnassigned && "text-gray-300")}>{icon}</div>
        <div className="overflow-hidden">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
            <p className={cn(
                "text-xs font-bold uppercase truncate",
                isUnassigned ? "text-gray-400 italic font-medium" : "text-slate-700 dark:text-slate-200"
            )} title={value}>{value}</p>
        </div>
    </div>
);

const StatusCard = ({ label, value, color }: any) => (
    <div className={cn("p-4 rounded-2xl border border-transparent flex flex-col items-center justify-center text-center shadow-sm", color)}>
        <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xs font-black uppercase">{value}</p>
    </div>
);