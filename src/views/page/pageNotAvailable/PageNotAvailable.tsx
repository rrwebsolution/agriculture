import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAdminRoleName, normalizePermissionsList, pathPermissionMap, permissionMatches } from '../../../lib/permissions';

const PageNotAvailable: React.FC = () => {
  const navigate = useNavigate();
  // derive fallback destination based on user permissions
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userPermissions: string[] = normalizePermissionsList(userData.role?.permissions || []);
  const isAdmin = isAdminRoleName(userData.role?.name);

  const getFirstAllowedPath = () => {
    if (isAdmin) return '*';

    // iterate in insertion order and return first matching permission
    for (const [path, perm] of Object.entries(pathPermissionMap)) {
      if (permissionMatches(userPermissions, perm)) return path;
    }
    return '*';
  };

  const fallbackPath = getFirstAllowedPath();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative">
        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-primary p-2 rounded-lg text-white shadow-lg shadow-primary/20">
            <Sprout size={20} />
          </div>
          <h1 className="text-xl font-black text-primary dark:text-white uppercase tracking-tighter">
            Agri<span className="opacity-70">Culture</span>
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-gray-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-500">
          
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 shadow-inner">
              <ShieldAlert size={48} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-800">
              <Lock size={16} className="text-gray-400" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none mb-4">
            Restricted <span className="text-red-500 italic">Access</span>
          </h2>
          
          <p className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest leading-relaxed mb-10 max-w-xs mx-auto">
            You don't have the required <span className="text-gray-600 dark:text-slate-200">permissions</span> to view this module. Please contact your administrator for authorization.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate(fallbackPath)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 group"
            >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Go Back to Dashboard
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center opacity-40">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Security Protocol 403 • LGU Gingoog City
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageNotAvailable;
