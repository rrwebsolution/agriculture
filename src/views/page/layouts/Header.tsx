import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  Menu, 
  Monitor, 
  Moon, 
  Sun, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Loader2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../../plugin/axios"; 
import type { Theme } from "../AgricultureLayout";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  isCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, 
  setTheme, 
  isSidebarOpen, 
  setSidebarOpen, 
  isCollapsed 
}) => {
  const navigate = useNavigate();
  
  // --- UI STATES ---
  const [currentTime, setCurrentTime] = useState('');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // --- REFS ---
  const themeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // --- GET USER DATA FROM STORAGE ---
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

  // --- VALIDATE THEME PROP ---
  const effectiveTheme: Theme = (theme === 'light' || theme === 'dark' || theme === 'system') ? theme : 'light';

  // --- CLOCK LOGIC (Manila Time) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true,
      }).format(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- CLICK OUTSIDE LOGIC ---
  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setIsThemeOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await axios.post('logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('appState');
      setIsLoggingOut(false);
      navigate('/user-login');
    }
  };

  return (
    <header className={`fixed top-0 right-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 transition-all duration-300
      left-0 
      ${isCollapsed ? 'lg:left-20' : 'lg:left-64'}
    `}>
      
      {/* Left Section: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <Menu size={20} className="text-gray-500" />
        </button>
        <div className="block">
          <h2 className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-widest leading-tight">
            System Dashboard
          </h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase hidden sm:block tracking-tighter">Agriculture • LGU Gingoog</p>
        </div>
      </div>

      {/* Right Section: Time, Theme, Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* PH Time Display */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-slate-700 shadow-sm">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-mono font-bold text-gray-600 dark:text-slate-300">
            {currentTime || '00:00:00'}
          </span>
        </div>

        {/* Theme Toggle Dropdown */}
        <div className="relative" ref={themeRef}>
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)} 
            className="p-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full hover:border-primary transition-all shadow-sm"
          >
            {effectiveTheme === 'light' ? <Sun size={18} /> : effectiveTheme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
          </button>
          
          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                <button 
                  key={t} 
                  onClick={() => { setTheme(t); setIsThemeOpen(false); }} 
                  className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    effectiveTheme === t ? 'text-primary bg-primary/5' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t} Mode
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)} 
            className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:border-primary transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 bg-primary flex items-center justify-center text-white text-[10px] font-bold">
              {userData.name ? userData.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">

              {/* ── Hero Banner ── */}
              <div className="relative h-16 bg-linear-to-br from-primary via-primary/90 to-emerald-600 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />
              </div>

              {/* ── Avatar overlapping banner ── */}
              <div className="px-5 pb-4 -mt-8 flex items-end justify-between">
                <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 bg-primary shadow-lg flex items-center justify-center text-white text-xl font-black uppercase select-none">
                  {userData.name ? userData.name.charAt(0) : <User size={22} />}
                </div>
                <span className={`mb-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  userData.status === 'inactive'
                    ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                }`}>
                  ● Active
                </span>
              </div>

              {/* ── User Info ── */}
              <div className="px-5 pb-4">
                <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight truncate leading-tight">
                  {userData.name || 'Anonymous'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold truncate mt-0.5">
                  {userData.email || '—'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/8 dark:bg-primary/15 px-2.5 py-1 rounded-full">
                  <Settings size={10} className="text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                    {userData.role?.name || 'No Role'}
                  </span>
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-4 h-px bg-gray-100 dark:bg-slate-800" />

              {/* ── Menu Items ── */}
              <div className="p-2 space-y-0.5">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/page/settings-management', { state: { tab: 'profile' } }); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <User size={15} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">My Profile</p>
                    <p className="text-[9px] text-gray-400 font-medium">View & edit your info</p>
                  </div>
                </button>

                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/page/settings-management', { state: { tab: 'security' } }); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                    <Settings size={15} className="text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-tight">Settings</p>
                    <p className="text-[9px] text-gray-400 font-medium">Password & preferences</p>
                  </div>
                </button>
              </div>

              {/* ── Sign Out ── */}
              <div className="p-2 pt-0">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                    {isLoggingOut ? <Loader2 size={15} className="animate-spin text-red-500" /> : <LogOut size={15} className="text-red-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
                      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </p>
                    <p className="text-[9px] text-red-400/70 font-medium">End your current session</p>
                  </div>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;