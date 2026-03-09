import React from 'react';
import { X, Edit3, Loader2, Check, MapPin, Building2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../components/ui/select';

// Updated classification list as requested
const classifications = ["Urban (Poblacion)", "Rural", "Coastal"];

interface EditBarangayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrgy: any;
  formData: { name: string; type: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; type: string }>>;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
}

const EditBarangayDialog: React.FC<EditBarangayDialogProps> = ({ 
  isOpen, onClose, selectedBrgy, formData, setFormData, onSave, isSaving 
}) => {
  if (!isOpen || !selectedBrgy) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* Decorative Gradient Top Bar */}
        <div className="h-3 bg-linear-to-r from-primary to-emerald-500" />
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Edit3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-gray-800 dark:text-white">Edit Barangay</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Refine Registry Data</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSave} className="p-8 pt-2 space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2">
              <MapPin size={12} /> Barangay Name
            </label>
            <input 
              type="text" 
              required 
              placeholder="Enter barangay name"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all text-gray-700 dark:text-white border border-gray-100 dark:border-slate-700 shadow-inner" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          {/* Classification Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest flex items-center gap-2">
              <Building2 size={12} /> Classification
            </label>
            <Select 
              value={formData.type} 
              onValueChange={(val: string) => setFormData({...formData, type: val})}
            >
              <SelectTrigger className="w-full h-14 px-5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-sm font-bold cursor-pointer border border-gray-100 dark:border-slate-700 shadow-inner focus:ring-2 focus:ring-primary/50">
                <SelectValue placeholder="Select Classification" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-2">
                {classifications.map((t) => (
                  <SelectItem 
                    key={t} 
                    value={t} 
                    className="text-xs font-bold uppercase py-3 px-4 cursor-pointer hover:bg-primary/10 rounded-xl transition-colors"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest py-5 rounded-[1.5rem] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer transition-all"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18}/>
              ) : (
                <><Check size={18}/> Commit Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBarangayDialog;