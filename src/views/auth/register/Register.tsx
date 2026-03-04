import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Lock, Mail, Tractor, Sun, Moon, Monitor, 
  ChevronDown, Clock, Eye, EyeOff, User, CheckCircle, Wand2, ArrowRight, Loader2, Leaf
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../../plugin/axios'; 
import { toast } from 'react-toastify';

type Theme = 'light' | 'dark' | 'system';

interface RegisterProps {
  onGoToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onGoToLogin }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('agri-system-theme');
    return (saved as Theme) || 'light';
  });

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

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let generated = "";
    for (let i = 0; i < 12; i++) generated += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ password: ["Passwords do not match!"] });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('register', {
        name: fullName,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        status: 'inactive'
      });

      toast.success('Registration Successful! Redirecting to login...', {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        if (onGoToLogin) onGoToLogin();
        navigate('/user-login');
      }, 2000);

    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("Registration failed. Please try again.");
      }
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

      {/* Top Bar Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase text-white/80">{currentTime}</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full shadow-lg transition-all active:scale-95">
            {currentThemeIcon}
            <span className="text-[10px] font-black uppercase">{theme}</span>
            <ChevronDown size={14} />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-30">
              {['light', 'dark', 'system'].map((t) => (
                <button key={t} onClick={() => { setTheme(t as Theme); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300">
                  {t} Mode
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 my-10">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 transition-all duration-500">
          
          {/* 🌟 CARD HEADER - MATCHING LOGIN PRIMARY BACKGROUND 🌟 */}
          <div className="bg-primary p-10 text-center text-white relative overflow-hidden">
            <Leaf className="absolute -top-4 -right-4 text-white/10 rotate-45" size={120} />
            <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-white/20">
              <Sprout className="text-primary" size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter italic uppercase">Agri<span className="opacity-80">Culture</span></h2>
            <p className="text-white/70 text-[10px] mt-1 uppercase tracking-[0.4em] font-black">LGU - Gingoog Registration</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            
            {/* FULL NAME */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.name ? 'text-red-500' : 'text-gray-400'}`}>Full Name</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-400' : 'text-gray-300'}`} size={16} />
                <input 
                  type="text" required placeholder="Juan Dela Cruz"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white focus:ring-2 outline-none transition-all ${errors.name ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`}
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {errors.name && <p className="text-[9px] text-red-500 font-bold ml-2 uppercase">{errors.name[0]}</p>}
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.email ? 'text-red-500' : 'text-gray-400'}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-300'}`} size={16} />
                <input 
                  type="email" required placeholder="name@gingoog.gov.ph"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white focus:ring-2 outline-none transition-all ${errors.email ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-[9px] text-red-500 font-bold ml-2 uppercase">{errors.email[0]}</p>}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className={`text-[10px] font-black uppercase tracking-widest ${errors.password ? 'text-red-500' : 'text-gray-400'}`}>Password</label>
                <button type="button" onClick={handleGeneratePassword} className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:opacity-70 transition-all">
                  <Wand2 size={10} /> Auto-Generate
                </button>
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-300'}`} size={16} />
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white focus:ring-2 outline-none transition-all ${errors.password ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} required placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-primary hover:opacity-90 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Register Account <ArrowRight size={16} /></>}
            </button>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
               <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                 Already registered? 
                 <Link to="/user-login" onClick={onGoToLogin} className="text-primary font-bold hover:underline ml-1">Login Here</Link>
               </p>
            </div>
          </form>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-center relative z-10 animate-pulse">
          <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-lg flex items-center justify-center gap-2">
            <Tractor size={16} className="text-primary" />
            built by <span className="text-white border-b-2 border-primary">RR Web Solution</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;