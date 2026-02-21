import React, { useEffect } from 'react';
import { UserPlus, X, Check } from 'lucide-react';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: {
    name: string;
    email: string;
    role: string;
    sector: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    role: string;
    sector: string;
  }>>;
}

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, onSave, formData, setFormData }) => {
  
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
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><UserPlus size={20} /></div>
            <h3 className="text-lg font-black uppercase tracking-tight">Register User</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" required placeholder="John Doe" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" required placeholder="name@gingoog.gov.ph" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 dark:text-slate-200" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Role & Sector */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-700 dark:text-slate-200"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Encoder">Encoder</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Sector</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-700 dark:text-slate-200"
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                >
                  <option value="Main Office">Main Office</option>
                  <option value="Sector 1">Sector 1</option>
                  <option value="Sector 2">Sector 2</option>
                  <option value="Sector 3">Sector 3</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Check size={18} /> Confirm Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDialog;