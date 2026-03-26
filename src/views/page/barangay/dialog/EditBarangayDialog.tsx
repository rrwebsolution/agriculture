import React from 'react';
import { createPortal } from 'react-dom'; 
import { X, Edit3, Loader2, Check, MapPin, Building2, Map, Info } from 'lucide-react';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../../../components/ui/select';
import { cn } from '../../../../lib/utils';

const classifications = ["Urban (Poblacion)", "Rural", "Coastal"];

interface EditBarangayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrgy: any;
  formData: { name: string; type: string; latitude: string; longitude: string }; // 🌟 GIDUGANG ANG LAT & LNG
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
}

const EditBarangayDialog: React.FC<EditBarangayDialogProps> = ({ 
  isOpen, onClose, selectedBrgy, formData, setFormData, onSave, isSaving 
}) => {
  
  if (!isOpen || !selectedBrgy) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={isSaving ? undefined : onClose} 
      />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="bg-primary p-6 md:p-8 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight leading-none">
                Edit Barangay Profile
              </h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                <MapPin size={12} /> {selectedBrgy.code || 'BRGY-CODE'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-xl text-white cursor-pointer transition-colors focus:outline-none disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* General Info Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary border-b border-gray-100 dark:border-slate-800 pb-2">
                  <div className="p-1.5 bg-primary/10 rounded-xl"><Building2 size={14}/></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">1. General Information</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-primary"/> Barangay Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" required placeholder="e.g. San Juan" disabled={isSaving}
                  className="w-full h-13 px-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 shadow-sm" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Building2 size={12} className="text-blue-500"/> Classification <span className="text-rose-500">*</span>
                </label>
                <Select disabled={isSaving} value={formData.type} onValueChange={(val: string) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="w-full h-13 px-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-sm font-bold cursor-pointer border border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 shadow-sm focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select Classification" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-10000">
                    {classifications.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs font-bold uppercase py-3 px-4 cursor-pointer hover:bg-primary/10 rounded-xl transition-colors">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🌟 COORDINATES SECTION 🌟 */}
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-500">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl"><Map size={14}/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">2. Geographical Coordinates</span>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase italic">Optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Latitude */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Latitude</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">LAT</span>
                    <input 
                      type="number" step="any" placeholder="e.g. 8.8234000" disabled={isSaving}
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500/50 shadow-sm" 
                      value={formData.latitude || ''} onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    />
                  </div>
                </div>

                {/* Longitude */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Longitude</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">LNG</span>
                    <input 
                      type="number" step="any" placeholder="e.g. 125.1234000" disabled={isSaving}
                      className="w-full h-12 pl-14 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500/50 shadow-sm" 
                      value={formData.longitude || ''} onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
                 <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed uppercase tracking-wide">
                   Adding coordinates will display this barangay as a marker on the interactive Global Map.
                 </p>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className={cn(
                "px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-pointer transition-all shadow-xl shadow-primary/20 active:scale-95", 
                isSaving && "opacity-50 pointer-events-none"
              )}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
              {isSaving ? 'Saving Changes...' : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body 
  );
};

export default EditBarangayDialog;