import React, { useEffect } from 'react';
import { UserPlus, X, Check, Loader2, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';

interface UserDialogProps {
  isOpen: boolean; onClose: () => void; onSave: (e: React.FormEvent) => void;
  formData: any; setFormData: any; roles: any[]; clusters: any[]; isSaving: boolean; isEdit: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({ 
    isOpen, onClose, onSave, formData, setFormData, roles, clusters, isSaving, isEdit 
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">{isEdit ? <Edit3 size={20} /> : <UserPlus size={20} />}</div>
            <h3 className="text-lg font-black uppercase tracking-tight">{isEdit ? 'Update User' : 'Register User'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={onSave} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" required placeholder="Juan Dela Cruz" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" required placeholder="name@gingoog.gov.ph" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger className="w-full h-12 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200">
                        <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-xl shadow-xl">
                        {roles.map((r) => (<SelectItem key={r.id} value={r.id.toString()} className="text-xs font-bold uppercase py-3 cursor-pointer">{r.name}</SelectItem>))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                  Assign Cluster <span className='text-gray-400 text-[8px]'>(Optional)</span>
                </label>
                <Select 
                  value={formData.cluster || "none"} 
                  onValueChange={(val) => setFormData({...formData, cluster: val === "none" ? "" : val})}
                >
                    <SelectTrigger className="w-full h-12 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200">
                        <SelectValue placeholder="Select Cluster (Optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 rounded-xl shadow-xl">
                        <SelectItem value="none" className="text-xs font-bold uppercase py-3 cursor-pointer text-gray-400">Select Cluster</SelectItem>
                        {clusters.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()} className="text-xs font-bold uppercase py-3 cursor-pointer">
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full px-6 py-4 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50 cursor-pointer">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isSaving ? 'Processing...' : isEdit ? 'Update Changes' : 'Confirm Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default UserDialog;