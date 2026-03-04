import { ShieldAlert, LogOut, MessageCircle, Tractor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NoRoleFound() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/user-login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <Tractor className="absolute -bottom-10 -right-10 text-primary rotate-12" size={400} />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 p-10 text-center space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Warning Icon */}
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-amber-500 border border-amber-100 dark:border-amber-500/20 shadow-inner">
          <ShieldAlert size={48} />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Access <span className="text-primary italic">Denied</span>
          </h2>
          <p className="text-sm font-bold text-gray-500 dark:text-slate-400 leading-relaxed">
            Your account is authenticated, but <span className="text-red-500 underline decoration-2 underline-offset-4">no system role</span> has been assigned to you yet.
          </p>
        </div>

        {/* Instructions */}
        <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4 text-left">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-500">
            <MessageCircle size={18} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-1">What to do?</h4>
            <p className="text-[11px] font-medium text-blue-700/80 dark:text-blue-300/60 leading-relaxed">
              Please contact your <strong>System Administrator</strong> at the LGU Gingoog Office to configure your permissions and access level.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-primary hover:opacity-90 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          <LogOut size={18} /> Back to Login
        </button>

        <p className="text-[9px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-[0.3em]">
          Agriculture Portal Security System
        </p>
      </div>

      <div className="mt-8 opacity-40">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            built by <span className="text-gray-500 border-b-2 border-primary">RR Web Solution</span>
          </p>
      </div>
    </div>
  );
}

export default NoRoleFound;