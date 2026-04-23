import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, Lock, Mail, Tractor, Leaf, ArrowRight,
  Sun, Moon, Monitor, ChevronDown, Clock, Eye, EyeOff, Loader2, AlertCircle,
  X, CheckCircle2, SendHorizonal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import { isAdminRoleName, pathPermissionMap } from '../../../lib/permissions';

type Theme = 'light' | 'dark' | 'system';

interface LoginProps {
  onGoToRegister?: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const REDIRECT_HIERARCHY = Object.entries(pathPermissionMap).map(([path, permission]) => ({ path, permission }));

const Login: React.FC<LoginProps> = ({ onGoToRegister }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('agri-system-theme') as Theme) || 'light');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const phTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }).format(new Date());
      setCurrentTime(phTime);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('agri-system-theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 🌟 Logic to find the first page the user is allowed to see based on their role
  const getFirstAccessiblePath = (user: any) => {
    if (isAdminRoleName(user.role?.name)) return "/page/page-dashboard";
    const userPermissions = user.role?.permissions || [];
    const firstMatch = REDIRECT_HIERARCHY.find(item => userPermissions.includes(item.permission));
    return firstMatch ? firstMatch.path : "/page/page-dashboard";
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openForgotModal = () => {
    setForgotEmail(email);
    setForgotError(null);
    setForgotSuccess(false);
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    if (forgotLoading) return;
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotError(null);
    setForgotSuccess(false);
  };

  const handleSendResetLink = async () => {
    if (!forgotEmail) { setForgotError('Email is required.'); return; }
    setForgotError(null);
    setForgotLoading(true);
    try {
      await axios.post('forgot-password', { email: forgotEmail });
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Unable to send password reset link.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage(null);
    if (!validateForm()) return; 

    setIsLoading(true);
    try {
      const response = await axios.post('login', { email, password });
      const user = response.data.user;
      const token = response.data.access_token;

      if (user.status === 'inactive') {
        setErrorMessage('Account inactive. Please contact the admin to activate your account.');
        setIsLoading(false);
        return;
      }

      // 1. SAVE BASIC AUTH
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      // 2. CHECK IF DEFAULT PASSWORD (Strict Check)
      if (password.trim() === 'Gingoog@2026') {
        localStorage.setItem('must_change_password', 'true');
        toast.warning('Security Alert: Please update your default password.', { autoClose: 3000 });
        navigate('/change-password', { replace: true });
        return; 
      }

      // 3. IF NOT DEFAULT, CLEAR FLAG AND PROCEED
      localStorage.removeItem('must_change_password');

      toast.success('Login Successfully!', { position: "top-right", autoClose: 2000 });

      if (user.role === null) {
        navigate('/no-role');
      } else {
        const targetPath = getFirstAccessiblePath(user);
        navigate(targetPath);
      }

    } catch (err: any) {
      let msg = "Invalid credentials.";
      if (err.response?.status === 422) {
        msg = err.response.data.message;
        if (err.response.data.errors) setErrors(err.response.data.errors);
      } else if (err.response?.status === 401) {
          msg = "Incorrect email or password.";
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentThemeIcon = theme === 'light' ? <Sun size={14} className="text-yellow-500" /> : theme === 'dark' ? <Moon size={14} className="text-indigo-400" /> : <Monitor size={14} className="text-blue-400" />;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-500"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2500&auto=format&fit=crop')` }}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-[1px]"></div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
         <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase">PH Time:</span>
          <span className="text-xs font-mono">{currentTime}</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            {currentThemeIcon}
            <span className="text-[10px] font-black uppercase tracking-widest">{theme}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTheme(t as Theme); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${theme === t ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                >
                  {t === 'light' ? <Sun size={14}/> : t === 'dark' ? <Moon size={14}/> : <Monitor size={14}/>} {t} Mode
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 transition-all duration-500">

          <div className="bg-primary p-10 text-center text-white relative overflow-hidden">
            <Leaf className="absolute -top-4 -right-4 text-white/10 rotate-45" size={120} />
            <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-white/20 transition-transform hover:rotate-6">
              <Sprout className="text-primary" size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter italic uppercase">Agri<span className="opacity-80">Culture</span></h2>
            <p className="text-white/70 text-[10px] mt-1 uppercase tracking-[0.4em] font-black">LGU - Gingoog City</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5" noValidate>
            
            {errorMessage && !errors.email && !errors.password && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 ${errors.email ? 'text-red-500' : 'text-gray-400'}`}>
                <Mail size={12} className={errors.email ? 'text-red-500' : 'text-primary'} /> Email Address
              </label>
              <input
                type="email"
                placeholder="staff@gingoog.gov.ph"
                disabled={isLoading}
                className={`w-full px-5 py-4 rounded-2xl border bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-slate-900'}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''}); }}
              />
              {errors.email && <p className="text-[9px] font-black text-red-500 uppercase ml-1 animate-in fade-in"><AlertCircle size={10} className="inline mr-1" />{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 ${errors.password ? 'text-red-500' : 'text-gray-400'}`}>
                <Lock size={12} className={errors.password ? 'text-red-500' : 'text-primary'} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full px-5 py-4 rounded-2xl border bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-slate-900'}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: ''}); }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[9px] font-black text-red-500 uppercase ml-1 animate-in fade-in"><AlertCircle size={10} className="inline mr-1" />{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
              <label className="flex items-center gap-2 text-gray-500 dark:text-slate-400 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-800 transition-all cursor-pointer" />
                <span className="group-hover:text-primary transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="uppercase text-primary hover:opacity-80 transition-colors focus:outline-none cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:opacity-90 text-white font-black uppercase py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 transform transition active:scale-95 flex items-center justify-center gap-3 mt-2 disabled:opacity-80 cursor-pointer">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><span className="text-xs tracking-[0.2em]">Sign In to Portal</span><ArrowRight size={18} /></>}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Don't have an account?{' '}
                <Link to="/user-register" onClick={onGoToRegister} className="text-primary hover:underline underline-offset-4 ml-1 transition-all cursor-pointer">Register Staff</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center relative z-10 animate-pulse">
          <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-lg flex items-center justify-center gap-2">
            <Tractor size={16} className="text-primary" />
            built by <span className="text-white border-b-2 border-primary pb-0.5">RR Web Solution</span>
          </p>
        </div>
      </div>

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForgotModal} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-primary px-6 pt-6 pb-8 relative overflow-hidden">
              <Leaf className="absolute -top-3 -right-3 text-white/10 rotate-45" size={80} />
              <button
                type="button"
                onClick={closeForgotModal}
                disabled={forgotLoading}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Forgot Password</h3>
                  <p className="text-white/60 text-[10px] font-bold mt-0.5">We'll send a reset link to your email</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {forgotSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Reset Link Sent!</p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Check your email inbox and follow the instructions to reset your password.</p>
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="mt-2 w-full bg-primary text-white font-black text-[11px] uppercase tracking-widest py-3 rounded-2xl hover:opacity-90 transition active:scale-95 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Mail size={11} className="text-primary" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="staff@gingoog.gov.ph"
                      disabled={forgotLoading}
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendResetLink()}
                      className={`w-full px-4 py-3.5 rounded-2xl border bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all ${forgotError ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-300 dark:border-slate-700 focus:border-primary focus:ring-primary/20'} focus:ring-2`}
                    />
                    {forgotError && (
                      <p className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 animate-in fade-in">
                        <AlertCircle size={10} /> {forgotError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendResetLink}
                    disabled={forgotLoading}
                    className="w-full bg-primary text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <SendHorizonal size={16} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeForgotModal}
                    disabled={forgotLoading}
                    className="w-full text-gray-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest py-2 hover:text-gray-600 dark:hover:text-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
