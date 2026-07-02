import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Loader2,
  Bell,
  Wifi,
  WifiOff,
  UserPlus,
  Tractor,
  Sprout,
  Wallet,
  ClipboardList,
  CheckCheck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../../plugin/axios";
import type { Theme } from "../AgricultureLayout";
import { clearAuthSession } from "../../../lib/session";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  isCollapsed: boolean;
}

interface Notification {
  type: 'farmer' | 'harvest' | 'expense' | 'nursery' | 'log';
  title: string;
  description: string;
  time: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '/page/page-dashboard':               'Dashboard',
  '/page/farmer-management':            'Farmer Registry',
  '/page/fisherfolk-management':        'Fisherfolk Registry',
  '/page/cooperatives-management':      'Cooperatives',
  '/page/barangaylist-management':      'Barangay Profile',
  '/page/location-management':          'Work Location',
  '/page/danger-zones-management':      'Danger Zones',
  '/page/crop-management':              'Crops',
  '/page/planting-management':          'Planting Logs',
  '/page/harvest-management':           'Harvest Records',
  '/page/nursery-production-management':'Nursery Production',
  '/page/fisheries-management':         'Fishery',
  '/page/livestock-management':         'Livestock',
  '/page/poultry-management':           'Poultry',
  '/page/land-mapping-management':      'Land Mapping',
  '/page/inventory-management':         'Inventory',
  '/page/equipments-management':        'Equipments',
  '/page/expenses-management':          'Expense',
  '/page/reports-management':           'Reports',
  '/page/employees-management':         'Employee Information',
  '/page/employee-logs-management':     'Employee Logs',
  '/page/role-management':              'Role Management',
  '/page/user-management':              'User Management',
  '/page/settings-management':          'Settings',
};

const NOTIF_ICON: Record<string, React.ReactNode> = {
  farmer:  <UserPlus size={14} className="text-emerald-500" />,
  harvest: <ClipboardList size={14} className="text-amber-500" />,
  expense: <Wallet size={14} className="text-rose-500" />,
  nursery: <Sprout size={14} className="text-green-500" />,
  log:     <Tractor size={14} className="text-blue-500" />,
};

const NOTIF_BG: Record<string, string> = {
  farmer:  'bg-emerald-50 dark:bg-emerald-500/10',
  harvest: 'bg-amber-50 dark:bg-amber-500/10',
  expense: 'bg-rose-50 dark:bg-rose-500/10',
  nursery: 'bg-green-50 dark:bg-green-500/10',
  log:     'bg-blue-50 dark:bg-blue-500/10',
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  isSidebarOpen,
  setSidebarOpen,
  isCollapsed
}) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // --- UI STATES ---
  const [currentTime,    setCurrentTime]    = useState('');
  const [isThemeOpen,    setIsThemeOpen]    = useState(false);
  const [isProfileOpen,  setIsProfileOpen]  = useState(false);
  const [isLoggingOut,   setIsLoggingOut]   = useState(false);
  const [isNotifOpen,    setIsNotifOpen]    = useState(false);
  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [notifRead,      setNotifRead]      = useState(true);
  const [isOnline,       setIsOnline]       = useState(true);

  // --- REFS ---
  const themeRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  // --- GET USER DATA FROM STORAGE ---
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

  // --- VALIDATE THEME PROP ---
  const effectiveTheme: Theme = (theme === 'light' || theme === 'dark' || theme === 'system') ? theme : 'light';

  // --- BREADCRUMB: current page label ---
  const pageLabel = ROUTE_LABELS[location.pathname] ?? 'System Dashboard';

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
      if (themeRef.current   && !themeRef.current.contains(e.target as Node))   setIsThemeOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  // --- CONNECTION STATUS: ping every 30s ---
  const checkConnection = useCallback(async () => {
    try {
      await axios.get('user', { timeout: 5000 });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const id = setInterval(checkConnection, 30_000);
    return () => clearInterval(id);
  }, [checkConnection]);

  // --- NOTIFICATIONS: fetch on mount + every 2 min ---
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get('notifications/recent');
      const data: Notification[] = res.data?.data ?? [];
      setNotifications(data);
      setNotifRead(false);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 120_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await axios.post('logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthSession();
      setIsLoggingOut(false);
      window.location.replace('/user-login');
    }
  };

  const unreadCount = notifRead ? 0 : notifications.length;

  return (
    <header className={`fixed top-0 right-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 transition-all duration-300
      left-0
      ${isCollapsed ? 'lg:left-20' : 'lg:left-64'}
    `}>

      {/* Left Section: Mobile Menu & Dynamic Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <Menu size={20} className="text-gray-500" />
        </button>
        <div className="block">
          <h2 className="text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-widest leading-tight">
            {pageLabel}
          </h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase hidden sm:block tracking-tighter">Agriculture • LGU Gingoog</p>
        </div>
      </div>

      {/* Right Section: Status, Time, Theme, Notif, Profile */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Connection Status */}
        <div
          title={isOnline ? 'Connected to server' : 'Server unreachable'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400'
          }`}
        >
          {isOnline
            ? <><Wifi size={11} /><span>Online</span></>
            : <><WifiOff size={11} /><span>Offline</span></>
          }
        </div>

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

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setNotifRead(true); }}
            className="relative p-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full hover:border-primary transition-all shadow-sm"
          >
            <Bell size={18} className={unreadCount > 0 ? 'text-primary' : 'text-gray-500 dark:text-slate-400'} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">Notifications</p>
                  <p className="text-[9px] text-gray-400 font-bold mt-0.5">Recent system activity</p>
                </div>
                <CheckCheck size={15} className="text-gray-300 dark:text-slate-600" />
              </div>

              {/* List */}
              <div className="overflow-y-auto max-h-[340px] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={28} className="mx-auto text-gray-200 dark:text-slate-700 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase">No recent activity</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {notifications.map((n, i) => (
                      <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${NOTIF_BG[n.type]}`}>
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                          {NOTIF_ICON[n.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-gray-800 dark:text-slate-200 leading-snug truncate">{n.title}</p>
                          <p className="text-[9px] text-gray-500 dark:text-slate-400 font-medium truncate mt-0.5">{n.description}</p>
                        </div>
                        <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 shrink-0 mt-0.5">{timeAgo(n.time)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                <p className="text-[9px] text-gray-400 font-bold uppercase text-center tracking-widest">
                  Showing last {notifications.length} activities
                </p>
              </div>
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
