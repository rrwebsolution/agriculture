import { useEffect } from 'react';
import { X, Mail, MapPin, CheckCircle2 } from 'lucide-react';

const UserViewDialog = ({ isOpen, onClose, user }: any) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-24 bg-primary relative">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"><X size={18} /></button>
           <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-white dark:border-slate-900 text-primary font-black text-2xl">
              {user.name.substring(0,2).toUpperCase()}
           </div>
        </div>
        <div className="pt-12 p-8 text-center space-y-6">
          <div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{user.name}</h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{user.role?.name}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
             <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800">
                <Mail size={16} className="text-blue-500" />
                <p className="text-xs font-bold text-gray-600 dark:text-slate-300">{user.email}</p>
             </div>
             <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800">
                <MapPin size={16} className="text-emerald-500" />
                <p className="text-xs font-bold text-gray-600 dark:text-slate-300">{user.cluster?.name}</p>
             </div>
             <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800">
                <CheckCircle2 size={16} className="text-primary" />
                <p className="text-xs font-bold text-gray-600 dark:text-slate-300">Account Status: {user.status}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserViewDialog;