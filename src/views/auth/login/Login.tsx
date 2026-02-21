import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Lock, Mail, Tractor, Leaf, ArrowRight, Sun, Moon, Monitor, ChevronDown, Clock } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // 1. Initialize state from Local Storage (defaults to 'system' if empty)
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('agri-system-theme') as Theme;
    return savedTheme || 'system';
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Live Philippines Clock Logic ---
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

  // --- Theme Logic: Applying Classes and Saving to LocalStorage ---
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Save to local storage whenever theme changes
    localStorage.setItem('agri-system-theme', theme);

    const applyTheme = (t: Theme) => {
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    
    applyTheme(theme);

    // If 'system' is selected, listen for OS theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Handle Outside Click for Dropdown
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
    console.log("Logging in...", { email, password });
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
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2500&auto=format&fit=crop')` 
      }}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-[1px] transition-colors duration-500"></div>

      {/* --- Header Bar: Time & Theme Switcher --- */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        
        {/* PH Time Label */}
        <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-bold tracking-wider">PH Time:</span>
          <span className="text-xs font-mono">{currentTime}</span>
        </div>

        {/* Theme Dropdown */}
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
                    theme === opt.id 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
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

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 transition-all duration-500">
          
          <div className="bg-primary p-10 text-center text-white relative">
            <Leaf className="absolute -top-4 -right-4 text-white/10 rotate-45" size={120} />
            <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-white/20">
              <Sprout className="text-primary" size={32} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Agriculture System</h2>
            <p className="text-white/70 text-xs mt-1 uppercase tracking-[0.25em] font-bold text-center">LGU - Gingoog City</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} className="text-primary" /> Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer group">
                <input type="checkbox" className="rounded-md border-gray-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-800" />
                <span className="group-hover:text-primary transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-primary font-bold hover:underline underline-offset-4">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg uppercase">Login to</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
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

export default Login;