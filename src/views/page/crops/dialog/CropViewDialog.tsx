import React, { useState, useEffect } from 'react';
import { 
  X, Wheat, Users, LandPlot, AreaChart, TrendingUp, MessageSquare, 
  ChevronDown, Phone, User, MapPin, Layers, Info, Calendar 
} from 'lucide-react';

interface CropViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
}

const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className="text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase truncate">
      {value || 'N/A'}
    </p>
  </div>
);

const CropViewDialog: React.FC<CropViewDialogProps> = ({ isOpen, onClose, selectedItem }) => {
  const [expandedFarmerId, setExpandedFarmerId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !selectedItem) return null;

  // Compute topography sums for a category from its registered_farmers
  const computeTopographySums = (farmers: any[] = []) => {
    return farmers.reduce((acc, f) => {
      const area = Number(f.total_area) || 0;
      const t = (f.topography || f.land_type || '').toLowerCase();
      if (t.includes('plain')) acc.plain += area;
      else if (t.includes('rolling')) acc.rolling += area;
      else if (t.includes('slop') || t.includes('hill') || t.includes('mountain')) acc.sloping += area;
      else acc.other += area;
      acc.total += area;
      return acc;
    }, { plain: 0, rolling: 0, sloping: 0, other: 0, total: 0 });
  };

  const selectedTopo = computeTopographySums(selectedItem.registered_farmers || []);
  const totalLandArea = selectedTopo.total || 0;
  const getPercent = (val: number) => totalLandArea > 0 ? (val / totalLandArea) * 100 : 0;
  
  const plainPct = getPercent(selectedTopo.plain);
  const rollingPct = getPercent(selectedTopo.rolling);
  const slopingPct = getPercent(selectedTopo.sloping);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
        
        <div className="h-28 bg-primary relative flex items-end p-8">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer"><X size={20} /></button>
           <div className="w-16 h-16 bg-white z-99 dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center absolute -bottom-6 left-8 border-4 border-white dark:border-slate-900 text-primary"><Wheat size={28} /></div>
        </div>

        <div className="pt-10 p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">{selectedItem.category}</h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Classification Details</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative overflow-hidden p-6 bg-blue-500 text-white rounded-[2rem] shadow-lg shadow-blue-500/20 group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500"><Users size={120} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-blue-100"><Users size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Total Workforce</span></div>
                  <p className="text-4xl font-black tracking-tighter">{selectedItem.farmers || 0}</p>
                  <p className="text-[10px] font-bold text-blue-100 mt-1 uppercase">Registered Farmers</p>
                </div>
              </div>

              <div className="relative overflow-hidden p-6 bg-emerald-500 text-white rounded-[2rem] shadow-lg shadow-emerald-500/20 group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500"><LandPlot size={120} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-emerald-100"><LandPlot size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Total Coverage</span></div>
                  <p className="text-4xl font-black tracking-tighter">{totalLandArea.toFixed(1)} <span className="text-lg">ha</span></p>
                  <p className="text-[10px] font-bold text-emerald-100 mt-1 uppercase">Combined Hectarage</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-2"><AreaChart size={16} className="text-primary"/> Topography Distribution</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{totalLandArea > 0 ? '100% Data Mapped' : 'No Data Available'}</span>
              </div>

              <div className="flex h-4 rounded-full overflow-hidden mb-6 bg-gray-200 dark:bg-slate-700">
                <div style={{ width: `${plainPct}%` }} className="bg-emerald-400 h-full hover:opacity-80 transition-all duration-500" title={`Plain: ${plainPct.toFixed(1)}%`} />
                <div style={{ width: `${rollingPct}%` }} className="bg-amber-400 h-full hover:opacity-80 transition-all duration-500" title={`Rolling: ${rollingPct.toFixed(1)}%`} />
                <div style={{ width: `${slopingPct}%` }} className="bg-rose-400 h-full hover:opacity-80 transition-all duration-500" title={`Sloping: ${slopingPct.toFixed(1)}%`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><div className="w-4 h-1 bg-emerald-500 rounded-full" /></div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Plain</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white">{(selectedTopo.plain || 0).toFixed(1)} <span className="text-[10px] text-gray-400">ha</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><TrendingUp size={18} className="rotate-45" /></div>
                    <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rolling</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white">{(selectedTopo.rolling || 0).toFixed(1)} <span className="text-[10px] text-gray-400">ha</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><TrendingUp size={18} /></div>
                    <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Sloping</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white">{(selectedTopo.sloping || 0).toFixed(1)} <span className="text-[10px] text-gray-400">ha</span></p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400"><MessageSquare size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Remarks</span></div>
              <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 italic">
                <p className="text-sm font-bold text-gray-600 dark:text-slate-400 leading-relaxed">"{selectedItem.remarks || 'No specific remarks for this area.'}"</p>
              </div>
          </div>

          {/* 🌟 FULL RESTORED FARMER DIRECTORY (ACCORDION STYLE) 🌟 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <h4 className="text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-widest">Registered Farmers Registry</h4>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Click to expand details</span>
            </div>
            
            <div className="space-y-3">
              {selectedItem.registered_farmers && selectedItem.registered_farmers.length > 0 ? (
                selectedItem.registered_farmers.map((f: any) => {
                  const isExpanded = expandedFarmerId === f.id;
                  const fullName = `${f.first_name || f.name || ''} ${f.last_name || ''} ${f.suffix || ''}`.trim();
                  const initials = ((f.first_name && f.first_name[0]) || (f.last_name && f.last_name[0]) || fullName[0] || 'F').toString().toUpperCase() + ((f.last_name && f.last_name[0]) || '').toString().toUpperCase();
                  
                  return (
                    <div key={f.id} className={`overflow-hidden transition-all duration-300 border ${isExpanded ? 'border-primary/30 bg-primary/5 rounded-[2rem]' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl'}`}>
                      
                      <button onClick={() => setExpandedFarmerId(isExpanded ? null : f.id)} className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/50 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${isExpanded ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight leading-none mb-1">{fullName || 'Unknown'}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">RSBSA: {f.rsbsa_no}</p>
                          </div>
                        </div>
                        <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-primary/20 text-primary' : 'text-gray-300'}`}><ChevronDown size={18} /></div>
                      </button>

                      {/* 🌟 EXACT RESTORED DETAILS BOXES 🌟 */}
                      {isExpanded && (
                        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                          <div className="pt-4 border-t border-primary/10 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
                            
                            <DetailItem icon={<Phone size={12}/>} label="Contact No." value={f.contact_no} />
                            <DetailItem icon={<User size={12}/>} label="Gender" value={f.gender} />
                            <DetailItem icon={<MapPin size={12}/>} label="Home Address" value={f.barangay?.name} />
                            
                            <DetailItem icon={<Layers size={12}/>} label="Topography" value={f.topography || f.land_type} />
                            <DetailItem icon={<LandPlot size={12}/>} label="Farm Area" value={`${f.total_area} ha`} />
                            <DetailItem icon={<Info size={12}/>} label="Farmer Type" value={`${f.ownership_type || 'N/A'}`} />

                            <div className="col-span-2 sm:col-span-3 p-4 bg-white/50 dark:bg-slate-800 rounded-2xl border border-primary/10">
                              <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10} /> Actual Farm Location</p>
                              <p className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">{f.farm_sitio ? `${f.farm_sitio}, ` : ''} {f.farm_location?.name || 'No Farm Location Recorded'}</p>
                            </div>

                            <div className="col-span-2 sm:col-span-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Assistance / Program</p>
                              <p className="text-[10px] font-bold uppercase text-blue-700">{f.program_name || 'N/A'} {f.assistance_type ? `— ${f.assistance_type}` : ''}</p>
                              <p className="text-[9px] font-black text-gray-500 mt-1">Quantity: {f.quantity || 'N/A'} • Released: {f.date_released || 'N/A'}</p>
                              <p className="text-[9px] font-black text-gray-400">Cost: {f.total_cost ? `₱${Number(f.total_cost).toLocaleString()}` : 'N/A'} • Source: {f.funding_source || 'N/A'}</p>
                            </div>

                            {f.cooperative && (
                              <div className="col-span-2 sm:col-span-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Cooperative</p>
                                <p className="text-[10px] font-bold uppercase text-emerald-700">{f.cooperative.name}</p>
                                <p className="text-[9px] font-black text-gray-500 mt-1">CDA: {f.cooperative.cda_no || 'N/A'} • Members: {f.cooperative.member_count || 'N/A'}</p>
                                <p className="text-[9px] font-black text-gray-400">Contact: {f.cooperative.contact_no || 'N/A'}</p>
                              </div>
                            )}

                            <div className="col-span-2 sm:col-span-3 flex justify-end">
                              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${f.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                  Account Status: {f.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center bg-gray-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                    <Users className="mx-auto text-gray-300 mb-2" size={40} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching farmer records found</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar size={12} className="text-primary/60" /> 
                Updated: {selectedItem.updated_at ? new Date(selectedItem.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
             </div>
             <div className="flex items-center gap-1 text-[10px] font-black text-gray-300 uppercase italic">
                <Info size={12} /> RECORD-ID: SEC-{String(selectedItem.id).padStart(3, '0')}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropViewDialog;