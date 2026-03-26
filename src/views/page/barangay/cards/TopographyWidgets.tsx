import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, ArrowRight, X, Search } from 'lucide-react';

export const TopographyAreaCard = ({ icon, label, area, count, onViewFarmers }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-6 transition-all hover:shadow-md relative overflow-hidden group">
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 }) : icon}
    </div>
    <div className="z-10">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <h4 className="text-3xl font-black text-gray-800 dark:text-white leading-none tracking-tighter">
          {Number(area || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h4>
        <span className="text-[10px] font-black text-primary uppercase italic">HA</span>
      </div>
      <button onClick={onViewFarmers} className="mt-2 px-3 py-1.5 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-2 transition-all cursor-pointer group/btn">
        <Users size={12} /> {count || 0} Farmer Records <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform"/>
      </button>
    </div>
  </div>
);

export const TopographyFarmerListDialog = ({ isOpen, onClose, label, farmers }: any) => {
  const [search, setSearch] = useState("");
  
  if (!isOpen) return null;

  const validFarmers = Array.isArray(farmers) ? farmers : [];
  const filtered = validFarmers.filter((f: any) => {
    const fullName = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
    const rsbsa = String(f.rsbsa_no || '');
    return fullName.includes(search.toLowerCase()) || rsbsa.includes(search);
  });

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="p-8 bg-primary text-white shrink-0">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Farmers List</h3>
                <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest mt-2">{label} Topography Area</p>
             </div>
             <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 cursor-pointer"><X size={20}/></button>
          </div>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input type="text" placeholder="Search by name or RSBSA..." className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-bold placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filtered.length > 0 ? filtered.map((f: any) => (
            <div key={f.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xs uppercase">
                  {String(f.last_name || ' ')[0]}{String(f.first_name || ' ')[0]}
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase leading-none">{f.first_name} {f.last_name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">RSBSA: {f.rsbsa_no}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-primary leading-none">{Number(f.total_area || 0).toFixed(2)} HA</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 italic">{f.barangay?.name}</p>
              </div>
            </div>
          )) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400"><Users size={32} className="opacity-20 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">No records found</p></div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};