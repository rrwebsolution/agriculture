import React from 'react';
import { X, User, MapPin, Ship, Fish, Scale, Calendar, Waves, Phone, VenusAndMars } from 'lucide-react';

interface FisheryViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
}

const FisheryViewDialog: React.FC<FisheryViewDialogProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Waves size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">Catch Record Details</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">FishR ID: {record.fishr_id}</p>
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
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Fisherfolk Profile</h3>
              <ViewField icon={<User size={16}/>} label="Full Name" value={record.name} />
              <ViewField icon={<VenusAndMars size={16}/>} label="Gender" value={record.gender} />
              <ViewField icon={<Phone size={16}/>} label="Contact Number" value={record.contact_no || 'N/A'} />
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Vessel & Location</h3>
              <ViewField icon={<Ship size={16}/>} label="Boat Name" value={record.boat_name || 'No Boat / Non-Motorized'} />
              <ViewField icon={<Waves size={16}/>} label="Gear Type" value={record.gear_type} />
              <ViewField icon={<MapPin size={16}/>} label="Fishing Area" value={record.fishing_area} />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-slate-800" />

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">3. Catch Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                 <div className="text-blue-500"><Fish size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70 mb-0.5">Species Caught</p>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{record.catch_species}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                 <div className="text-emerald-500"><Scale size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-0.5">Total Yield</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{record.yield} kg</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                 <div className="text-amber-500"><Calendar size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 mb-0.5">Catch Date</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{record.date}</p>
                 </div>
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase text-[10px] hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-sm">
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewField = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
    <div className="text-primary/60 mt-0.5">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

export default FisheryViewDialog;