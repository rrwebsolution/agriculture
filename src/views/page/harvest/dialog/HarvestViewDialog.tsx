import React from 'react';
import { X, Wheat, User, MapPin, Scale, PhilippinePeso, Calendar, BadgeCheck } from 'lucide-react';

interface HarvestViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  harvest: any;
}

const HarvestViewDialog: React.FC<HarvestViewDialogProps> = ({ isOpen, onClose, harvest }) => {
  if (!isOpen || !harvest) return null;

  // 🌟 FORMATTER PARA SA KWARTA ARON NINDOT TAN-AWON
  const formatCurrency = (val: any) => {
    if (!val) return '₱ 0.00';
    const numericVal = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return `₱ ${numericVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Wheat size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">Harvest Record Details</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Record ID: #{harvest.id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Farmer & Location</h3>
              <ViewField icon={<User size={16}/>} label="Farmer Name" value={harvest.farmer} />
              
              {/* 🌟 GIBAG-O GIKAN SECTOR NGADTO BARANGAY */}
              <ViewField icon={<MapPin size={16}/>} label="Barangay" value={harvest.barangay || 'N/A'} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Crop Information</h3>
              <ViewField icon={<Wheat size={16}/>} label="Crop Category" value={harvest.crop} />
              <ViewField icon={<Calendar size={16}/>} label="Date Harvested" value={harvest.dateHarvested} />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-slate-800" />

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">3. Yield & Financials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* QUANTITY CARD */}
              <div className="flex flex-col justify-center p-5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 hover:shadow-md transition-all">
                 <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Scale size={16} />
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70 leading-none">Total Quantity</p>
                 </div>
                 <p className="text-xl font-black text-blue-700 dark:text-blue-400 uppercase truncate">{harvest.quantity}</p>
              </div>

              {/* QUALITY CARD */}
              <div className="flex flex-col justify-center p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 hover:shadow-md transition-all">
                 <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <BadgeCheck size={16} />
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 leading-none">Quality Grade</p>
                 </div>
                 <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 uppercase truncate">{harvest.quality}</p>
              </div>

              {/* EST VALUE CARD */}
              <div className="flex flex-col justify-center p-5 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10 hover:shadow-md transition-all">
                 <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <PhilippinePeso size={16} />
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 leading-none">Estimated Value</p>
                 </div>
                 <p className="text-xl font-black text-amber-700 dark:text-amber-400 uppercase truncate">
                    {formatCurrency(harvest.value)}
                 </p>
              </div>

            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase text-[10px] hover:border-primary hover:text-primary transition-all cursor-pointer shadow-sm">
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewField = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-primary/20 transition-colors">
    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-primary/60 border border-gray-100 dark:border-slate-800">
      {icon}
    </div>
    <div className="pt-0.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase">{value}</p>
    </div>
  </div>
);

export default HarvestViewDialog;