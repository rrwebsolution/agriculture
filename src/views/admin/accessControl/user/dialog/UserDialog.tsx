import React, { useEffect } from 'react';
import { UserPlus, X, Check } from 'lucide-react';

// 1. Define and Export the type here
export type UserRole = 'Administrator' | 'Supervisor' | 'Encoder' | 'Field Officer' | 'Viewer';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formData: {
    name: string;
    email: string;
    role: UserRole; // Change from string to UserRole
    sector: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    role: UserRole; // Change from string to UserRole
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><UserPlus size={20} /></div>
            <h3 className="text-lg font-black uppercase tracking-tight">Register User</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" required placeholder="Juan Dela Cruz" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" required placeholder="name@gingoog.gov.ph" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-primary/30 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 cursor-pointer"
                  value={formData.role}
                  // 2. Cast the value to UserRole
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Encoder">Encoder</option>
                  <option value="Field Officer">Field Officer</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Sector</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 cursor-pointer"
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                >
                  <option value="Main Office">Main Office</option>
                  <option value="Sector 1 (Poblacion)">Sector 1 (Poblacion)</option>
                  <option value="Sector 2 (Odiongan)">Sector 2 (Odiongan)</option>
                  <option value="Sector 3 (Lunao)">Sector 3 (Lunao)</option>
                  <option value="Sector 4 (Anakan)">Sector 4 (Anakan)</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95">
            <Check size={18} /> Confirm Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDialog;