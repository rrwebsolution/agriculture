import React, { useEffect } from 'react';
import { MapPin, X, Check, FileText, Loader2 } from 'lucide-react';

interface ClusterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: {
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
  }>>;
  isSaving: boolean;
  isEdit: boolean;
}

const ClusterDialog: React.FC<ClusterDialogProps> = ({ isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (!isEdit) {
        setFormData(prev => ({ ...prev, status: 'Active' }));
      }
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, isEdit, setFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={isSaving ? undefined : onClose} 
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight leading-none">
                {isEdit ? 'Update Cluster' : 'Add New Cluster'}
              </h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Gingoog Geographical Unit</p>
            </div>
          </div>
          <button 
            type="button" 
            disabled={isSaving}
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-8 space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin size={12} className="text-primary" /> Cluster Name
            </label>
            <input 
              type="text" 
              required 
              disabled={isSaving}
              placeholder="e.g. Cluster 5 (San Luis)" 
              className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 shadow-sm" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FileText size={12} className="text-primary" /> Description / Main Crop
            </label>
            <textarea 
              rows={3}
              required 
              disabled={isSaving}
              placeholder="e.g. Coconut & Copra Production Zone" 
              className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200 resize-none disabled:opacity-50 shadow-sm" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            {isSaving ? 'Processing...' : isEdit ? 'Update Changes' : 'Save Cluster'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClusterDialog;
