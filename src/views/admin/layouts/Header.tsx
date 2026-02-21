import React, { useState, useEffect, useRef } from "react";
import { Clock, Menu, Monitor, Moon, Sun, ChevronDown, User, Settings, LogOut } from "lucide-react";
import type { Theme } from "../AgricultureLayout";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  isCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, isSidebarOpen, setSidebarOpen, isCollapsed }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }).format(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setIsThemeOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <header className={`fixed top-0 right-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 transition-all duration-300
      left-0 
      ${isCollapsed ? 'lg:left-20' : 'lg:left-64'}
    `}>
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
          <Menu size={20} className="text-gray-500" />
        </button>
        <div className="block">
          <h2 className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-widest">
            Dashboard Overview
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">Agriculture • LGU Gingoog</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* PH Time */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
          <Clock size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-mono font-bold text-gray-700 dark:text-slate-300">{currentTime || '00:00:00'}</span>
        </div>

        {/* Theme */}
        <div className="relative" ref={themeRef}>
          <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:border-primary transition-all shadow-sm">
            {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
          </button>
          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                <button key={t} onClick={() => { setTheme(t); setIsThemeOpen(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${theme === t ? 'text-primary bg-primary/5' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                  {t} Mode
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:border-primary transition-all shadow-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="P" className="w-full h-full object-cover" />
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="bg-primary p-4 text-white">
                <p className="text-[10px] font-black uppercase opacity-80">Admin</p>
                <p className="text-sm font-bold truncate">Juan Dela Cruz</p>
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><User size={16} className="text-primary" /> My Profile</button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Settings size={16} className="text-primary" /> Settings</button>
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-slate-800">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={16} /> Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;