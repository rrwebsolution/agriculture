import React from 'react';
import { X, Sprout, MessageSquare, Loader2, Save, Plus, Edit3 } from 'lucide-react';

interface CropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: { category: string; remarks: string };
  setFormData: React.Dispatch<React.SetStateAction<{ category: string; remarks: string }>>;
  isSaving: boolean;
  isEdit: boolean;
}

const CropDialog: React.FC<CropDialogProps> = ({ isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
        
        <div className="h-28 bg-primary relative flex items-end p-8">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer"><X size={20} /></button>
           <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center absolute -bottom-6 left-8 border-4 border-white dark:border-slate-900 text-primary">
             {isEdit ? <Edit3 size={28} className="stroke-3" /> : <Plus size={28} className="stroke-3" />}
           </div>
        </div>

        <form onSubmit={onSave} className="pt-10 p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
              {isEdit ? 'Edit Land Record' : 'New Land Record'}
            </h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Fill in the crop details below</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Sprout size={12}/> Crop Category</label>
              <input type="text" required placeholder="e.g. Rice Areas" className="w-full py-4 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12}/> Remarks & Observations</label>
              <textarea rows={4} required placeholder="Add specific notes, irrigation status, or yield expectations..." className="w-full py-4 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm resize-none" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})}></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl text-xs font-black uppercase text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {isEdit ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropDialog;