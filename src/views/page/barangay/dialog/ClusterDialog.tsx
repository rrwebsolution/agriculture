import React, { useEffect, useState } from 'react';
import { MapPin, X, FileText, Loader2, Save, LayoutGrid, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';

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

const ClusterDialog: React.FC<ClusterDialogProps> = ({ 
  isOpen, onClose, onSave, formData, setFormData, isSaving, isEdit 
}) => {
  
  // 🌟 VALIDATION STATE
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrors({}); // Reset errors when opening
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // 🌟 VALIDATION HANDLER
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; description?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Cluster name is required.";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please provide a brief description or main crop.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop if there are errors
    }

    setErrors({});
    onSave(e); // Proceed to parent save function
  };

  // Clear error when user types
  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={isSaving ? undefined : onClose} />
      
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                {isEdit ? 'Update Cluster / Department / Work Location' : 'Add Cluster / Department / Work Location'}
              </h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Gingoog Location Reference</p>
            </div>
          </div>
          <button type="button" disabled={isSaving} onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors focus:outline-none disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><LayoutGrid size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">1. Reference Details</span>
              </div>
              
              {/* CLUSTER NAME INPUT */}
              <div className="space-y-1.5">
                <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 transition-colors", errors.name ? "text-red-500" : "text-gray-400")}>
                  Name / Label <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className={cn("absolute left-4 transition-colors", errors.name ? "text-red-500" : "text-gray-400")}><MapPin size={16} /></div>
                  <input 
                    type="text" 
                    disabled={isSaving}
                    placeholder="e.g. Cluster 5, Agriculture Office, San Luis" 
                    className={cn(
                        "w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200 disabled:opacity-50 shadow-sm placeholder:text-gray-400/50",
                        errors.name 
                          ? "border-red-500 ring-4 ring-red-500/10 animate-shake" 
                          : "border-gray-300 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    )} 
                    value={formData.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                {/* 🌟 ERROR MESSAGE */}
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* DESCRIPTION INPUT */}
              <div className="space-y-1.5">
                <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 transition-colors", errors.description ? "text-red-500" : "text-gray-400")}>
                  Description / Notes <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-start">
                  <div className={cn("absolute left-4 top-4 transition-colors", errors.description ? "text-red-500" : "text-gray-400")}><FileText size={16} /></div>
                  <textarea 
                    rows={3}
                    disabled={isSaving}
                    placeholder="e.g. Use this entry for department, cluster, or work location tagging." 
                    className={cn(
                        "w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-slate-200 resize-none disabled:opacity-50 shadow-sm placeholder:text-gray-400/50 custom-scrollbar",
                        errors.description 
                          ? "border-red-500 ring-4 ring-red-500/10 animate-shake" 
                          : "border-gray-300 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    )} 
                    value={formData.description} 
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
                {/* 🌟 ERROR MESSAGE */}
              {errors.description && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={12} /> {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-slate-800" />

            {/* Section 2: Operational Status */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/10 rounded-2xl"><Activity size={14}/></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">2. Operational Status</span>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/50 p-2 rounded-2xl flex border border-gray-100 dark:border-slate-800 shadow-inner">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setFormData({...formData, status: 'Active'})}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50",
                    formData.status === 'Active' 
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-slate-600" 
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  <CheckCircle2 size={16} className={cn(formData.status === 'Active' && "text-emerald-500")} />
                  Active
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setFormData({...formData, status: 'Inactive'})}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50",
                    formData.status === 'Inactive' 
                      ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm border border-gray-200 dark:border-slate-600" 
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  <XCircle size={16} className={cn(formData.status === 'Inactive' && "text-rose-500")} />
                  Inactive
                </button>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className={cn("px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95", isSaving && "opacity-50 pointer-events-none")}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isSaving ? 'Processing...' : isEdit ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClusterDialog;
