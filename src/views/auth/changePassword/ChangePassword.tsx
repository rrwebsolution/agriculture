import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Eye, EyeOff, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import { isAdminRoleName, normalizePermissionsList, pathPermissionMap, permissionMatches } from '../../../lib/permissions';

const REDIRECT_HIERARCHY = Object.entries(pathPermissionMap).map(([path, permission]) => ({ path, permission }));

const ChangePassword = () => {
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper function for redirection
  const getFirstAccessiblePath = (userData: any) => {
    if (isAdminRoleName(userData.role?.name)) return "/page/page-dashboard";
    const userPermissions = normalizePermissionsList(userData.role?.permissions || []);
    const firstMatch = REDIRECT_HIERARCHY.find(item => permissionMatches(userPermissions, item.permission));
    return firstMatch ? firstMatch.path : "/page/page-dashboard";
  };

  // CHECK TOKEN: Kick out if no token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate('/login');
    }
  }, [navigate]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validations
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill out both password fields.");
      return;
    }
    if (newPassword === 'Gingoog@2026') {
      setErrorMessage("New password must be different from the default password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // 2. Get Token & User
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setIsLoading(true);

    try {
      // 3. API CALL
      const response = await axios.post('update-password', {
        current_password: 'Gingoog@2026', 
        password: newPassword,
        password_confirmation: confirmPassword
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Remove the "must change" flag if you implemented the gatekeeper logic
        localStorage.removeItem('must_change_password');
        
        toast.success('Security Updated! Entering Portal...');
        
        // 4. Redirect Logic
        if (user.role === null) {
          navigate('/no-role');
        } else {
          const targetPath = getFirstAccessiblePath(user);
          navigate(targetPath, { replace: true });
        }
      }

    } catch (err: any) {
      console.error("Update Error:", err);
      if (err.response?.status === 401) {
        setErrorMessage("Session expired. Please login again.");
      } else {
        const msg = err.response?.data?.message || "Failed to update password.";
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2500&auto=format&fit=crop')` }}
    >
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
          
          {/* Header Section */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse"></div>
              <ShieldCheck size={40} className="text-primary" />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-md border border-gray-100 dark:border-slate-700">
                <KeyRound size={14} className="text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
              Security Check
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 font-medium px-4 leading-relaxed">
              You are currently using the default access code. For your protection, please create a new, strong password to continue.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleResetSubmit} className="px-8 pb-10 space-y-5">
            
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                 <div className="min-w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500" />
                 <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  placeholder="Enter your new password"
                  className="w-full pl-11 pr-12 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 placeholder:font-normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  disabled={isLoading}
                  placeholder="Re-type your new password"
                  className="w-full pl-11 pr-12 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 placeholder:font-normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(!showConfirm)} 
                  className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-primary hover:opacity-90 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-primary/25 transform transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span className="text-xs tracking-[0.2em]">Update & Enter Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          {/* Bottom Bar Decoration */}
          <div className="h-1.5 w-full bg-linear-to-r from-primary/40 via-primary to-primary/40"></div>
        </div>

        <div className="mt-6 text-center">
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium">LGU Gingoog City &bull; Agriculture System</p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
