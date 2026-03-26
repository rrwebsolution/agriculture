import React, { useEffect } from 'react';
import { X, Sprout, MessageSquare, Loader2, Save, LayoutGrid } from 'lucide-react';
import { cn } from '../../../../lib/utils'; // Adjust path if needed

interface CropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: { category: string; remarks: string };
  setFormData: React.Dispatch<React.SetStateAction<{ category: string; remarks: string }>>;
  isSaving: boolean;
  isEdit: boolean;
}

const CropDialog: React.FC<CropDialogProps> = ({ 
  isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit 
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* 🌟 ANIMATED BACKDROP */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={isSaving ? undefined : onClose} 
      />
      
      {/* 🌟 ANIMATED DIALOG BOX */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sprout size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                {isEdit ? 'Update Crop Record' : 'New Crop Record'}
              </h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Gingoog Geographical Unit</p>
            </div>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors focus:outline-none disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><LayoutGrid size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">1. Crop Details</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Crop Category <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400"><Sprout size={16} /></div>
                  <input 
                    type="text" 
                    required 
                    disabled={isSaving}
                    placeholder="e.g. Rice Areas, Corn Areas" 
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 shadow-sm placeholder:text-gray-400/50 placeholder:font-normal" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Remarks & Observations <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-start">
                  <div className="absolute left-4 top-4 text-gray-400"><MessageSquare size={16} /></div>
                  <textarea 
                    rows={4}
                    required 
                    disabled={isSaving}
                    placeholder="Add specific notes, ideal soil conditions, or general remarks..." 
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-700 dark:text-slate-200 resize-none disabled:opacity-50 shadow-sm placeholder:text-gray-400/50 placeholder:font-normal custom-scrollbar" 
                    value={formData.remarks} 
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className={cn(
                "px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95", 
                isSaving && "opacity-50 pointer-events-none"
              )}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isSaving ? 'Processing...' : isEdit ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropDialog;