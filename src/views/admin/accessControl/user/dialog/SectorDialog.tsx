import React, { useEffect } from 'react';
import { MapPin, X, Check, FileText } from 'lucide-react';

interface SectorDialogProps {
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
}

const SectorDialog: React.FC<SectorDialogProps> = ({ isOpen, onClose, onSave, formData, setFormData }) => {
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><MapPin size={20} /></div>
            <h3 className="text-lg font-black uppercase tracking-tight">Add New Sector</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="p-8 space-y-5 relative z-10">
          
          {/* Sector Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin size={12} className="text-primary" /> Sector Name
            </label>
            <input 
              type="text" required placeholder="e.g. Sector 5 (San Luis)" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FileText size={12} className="text-primary" /> Description / Main Crop
            </label>
            <textarea 
              rows={2}
              required placeholder="e.g. Coconut & Copra Production Zone" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200 resize-none" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button type="submit" className="w-full px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 cursor-pointer">
            <Check size={18} /> Save Sector
          </button>
        </form>
      </div>
    </div>
  );
};

export default SectorDialog;