import React from 'react';
import { X, User, MapPin, Ship, Fish, Scale, Calendar, Waves, Phone, VenusAndMars, Clock3, PhilippinePeso, Layers3 } from 'lucide-react';

const getSpeciesList = (entry: any) => {
  if (Array.isArray(entry?.catch_species_list) && entry.catch_species_list.length > 0) return entry.catch_species_list;
  return String(entry?.catch_species || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

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

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
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

        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Fisherfolk Profile</h3>
              <ViewField icon={<User size={16} />} label="Full Name" value={record.name} />
              <ViewField icon={<VenusAndMars size={16} />} label="Gender" value={record.gender} />
              <ViewField icon={<Phone size={16} />} label="Contact Number" value={record.contact_no || 'N/A'} />
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Summary</h3>
              <ViewField icon={<Layers3 size={16} />} label="Vessel & Catch Entries" value={`${record.vessel_catch_entries?.length || 1} entries`} />
              <ViewField icon={<Clock3 size={16} />} label="Total Fishing Hours" value={`${Number(record.hours_spent_fishing || 0).toFixed(2)} hrs`} />
              <ViewField icon={<Calendar size={16} />} label="Catch Date" value={record.date} />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-slate-800" />

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">3. Totals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<Scale size={20} />} label="Combined Yield" value={`${Number(record.yield || 0).toFixed(2)} kg`} tone="emerald" />
              <StatCard icon={<PhilippinePeso size={20} />} label="Estimated Value" value={`PHP ${Number(record.market_value || 0).toLocaleString()}`} tone="amber" />
              <StatCard icon={<MapPin size={20} />} label="Primary Fishing Area" value={record.fishing_area || 'N/A'} tone="blue" />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">4. Vessel & Catch Entries</h3>
            <div className="space-y-4">
              {(record.vessel_catch_entries || []).map((entry: any, index: number) => (
                <div key={index} className="rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/30 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <ViewField icon={<Ship size={16} />} label="Boat Name" value={entry.boat_name || 'No Boat'} />
                    <ViewField icon={<Waves size={16} />} label="Gear Type" value={entry.gear_type} />
                    <ViewField icon={<MapPin size={16} />} label="Fishing Area" value={entry.fishing_area} />
                    <ViewField icon={<Clock3 size={16} />} label="Hours Spent" value={`${Number(entry.hours_spent_fishing || 0).toFixed(2)} hrs`} />
                    <SpeciesField icon={<Fish size={16} />} label="Species" items={getSpeciesList(entry)} />
                    <ViewField icon={<Scale size={16} />} label="Yield" value={`${Number(entry.yield || 0).toFixed(2)} kg`} />
                    <ViewField icon={<PhilippinePeso size={16} />} label="Market Value" value={`PHP ${Number(entry.market_value || 0).toLocaleString()}`} />
                  </div>
                </div>
              ))}
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
  <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
    <div className="text-primary/60 mt-0.5">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const SpeciesField = ({ icon, label, items }: any) => (
  <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
    <div className="text-primary/60 mt-0.5">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.length > 0 ? items.map((item: string) => (
          <span key={item} className="inline-flex items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">
            {item}
          </span>
        )) : (
          <p className="text-xs font-bold text-gray-800 dark:text-slate-200">No species</p>
        )}
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, tone }: any) => {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${tones[tone] || tones.blue}`}>
      <div>{icon}</div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
};

export default FisheryViewDialog;
