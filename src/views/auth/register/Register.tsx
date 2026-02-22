import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Lock, Mail, Tractor, Leaf, ArrowRight, 
  Sun, Moon, Monitor, ChevronDown, Clock, Eye, EyeOff, User, CheckCircle, Wand2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Theme = 'light' | 'dark' | 'system';

interface RegisterProps {
  onGoToLogin?: () => void; // Call this function to navigate instead of using <a href>
}

const Register: React.FC<RegisterProps> = ({ onGoToLogin }) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('agri-system-theme') as Theme;
    return savedTheme || 'system';
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let generatedPassword = "";
    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  useEffect(() => {
    const updateTime = () => {
      const phTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
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
    const applyTheme = (t: Theme) => {
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme(theme);
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registering...", { fullName, email, password });
  };

  const themeOptions = [
    { id: 'light' as Theme, label: 'Light Theme', icon: <Sun size={14} className="text-yellow-500" /> },
    { id: 'dark' as Theme, label: 'Dark Theme', icon: <Moon size={14} className="text-indigo-400" /> },
    { id: 'system' as Theme, label: 'System Default', icon: <Monitor size={14} className="text-blue-400" /> },
  ];

  const currentThemeOption = themeOptions.find(o => o.id === theme) || themeOptions[2];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-500"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2500&auto=format&fit=crop')` }}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-[1px] transition-colors duration-500"></div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-bold tracking-wider">PH Time:</span>
          <span className="text-xs font-mono">{currentTime}</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full shadow-lg transition-all active:scale-95"
          >
            {currentThemeOption.icon}
            <span className="text-xs font-bold uppercase tracking-tight">{theme}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setTheme(opt.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                    theme === opt.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 transition-all duration-500">
          
          <div className="bg-primary p-8 text-center text-white relative">
            <Leaf className="absolute -top-4 -right-4 text-white/10 rotate-45" size={100} />
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-xl rotate-3 flex items-center justify-center shadow-lg border-2 border-white/20">
                <Sprout className="text-primary" size={24} />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-extrabold tracking-tight italic leading-none">AgriCulture</h2>
                <p className="text-white/70 text-[0.6rem] uppercase tracking-[0.2em] font-bold">Registration</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-primary" /> Full Name
              </label>
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Mail size={14} className="text-primary" /> Email Address
              </label>
              <input
                type="email"
                placeholder="farmer@agri.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock size={14} className="text-primary" /> Password
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider flex items-center gap-1 transition-colors bg-primary/10 px-2 py-1 rounded-md focus:outline-none"
                >
                  <Wand2 size={12} /> Auto-Generate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none bg-transparent"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-10 ${
                    confirmPassword && password !== confirmPassword 
                    ? 'border-red-400 focus:ring-red-400' 
                    : 'border-gray-200 dark:border-slate-700'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none bg-transparent"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1 text-right">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-primary hover:opacity-90 text-white font-black uppercase py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">Create Account</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Changed from <a> to <button> */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/user-login" 
                  type="button" 
                  onClick={onGoToLogin}
                  className="text-primary font-bold hover:underline hover:text-primary/80 transition-colors inline-flex items-center gap-1 focus:outline-none"
                >
                  Login Here
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center relative z-10">
          <p className="text-white text-sm font-medium tracking-wide drop-shadow-lg flex items-center justify-center gap-2">
            <Tractor size={18} className="text-white/80 animate-bounce" style={{ animationDuration: '3s' }} />
            build by <span className="font-black text-white uppercase tracking-wider border-b-2 border-primary pb-0.5">RR Web Solution</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;