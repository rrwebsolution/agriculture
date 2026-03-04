import React, { useState } from 'react';
import { 
  Settings, User, Shield, Palette, 
  Globe, Lock, Mail, Smartphone, Save, 
  RotateCcw, Moon, Sun, Monitor, Trash2,
  CheckCircle2, Camera, ChevronRight
} from 'lucide-react';

const SettingsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'security' | 'appearance'>('profile');
  const [_isLoading, _setIsLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'system', label: 'System Prefs', icon: <Settings size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="text-primary" size={20} />
            <span className="text-[10px] font-black text-primary dark:text-green-400 uppercase tracking-[0.3em]">Configuration</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Portal <span className="text-primary italic">Settings</span>
          </h2>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-gray-200 active:scale-95">
                <RotateCcw size={18} /> Reset
            </button>
            <button className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-primary/20 active:scale-95">
                <Save size={18} /> Save Changes
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- SETTINGS NAVIGATION (SIDEBAR STYLE) --- */}
        <aside className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white dark:bg-slate-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </div>
              <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </aside>

        {/* --- MAIN SETTINGS CONTENT --- */}
        <main className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {/* 1. PROFILE SECTION */}
            {activeTab === 'profile' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100 dark:border-slate-800">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-primary/30 overflow-hidden">
                         <User size={40} className="text-gray-400" />
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                         <Camera size={16} />
                      </button>
                   </div>
                   <div className="text-center sm:text-left">
                      <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Juan Dela Cruz</h3>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">Administrator • Sector 3</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">Member since Feb 2024</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputGroup label="Full Name" placeholder="Juan Dela Cruz" icon={<User size={16}/>} />
                   <InputGroup label="Email Address" placeholder="juan.admin@gingoog.gov.ph" icon={<Mail size={16}/>} />
                   <InputGroup label="Contact Number" placeholder="+63 912 345 6789" icon={<Smartphone size={16}/>} />
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Sector</label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary">
                         <option>Sector 1 (Anakan)</option>
                         <option>Sector 2 (Odiongan)</option>
                         <option selected>Sector 3 (Lunao)</option>
                         <option>Sector 4 (Poblacion)</option>
                      </select>
                   </div>
                </div>
              </div>
            )}

            {/* 2. SYSTEM PREFERENCES */}
            {activeTab === 'system' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                   <Globe size={18} className="text-primary" /> General Preferences
                </h3>
                <div className="space-y-6">
                   <ToggleGroup label="Automatic Backups" description="Daily system backups at 12:00 AM." defaultChecked />
                   <ToggleGroup label="Email Notifications" description="Receive weekly agricultural yield reports." defaultChecked />
                   <ToggleGroup label="Audit Logging" description="Record every change made to planting data." defaultChecked />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <InputGroup label="Default Unit System" placeholder="Metric (Hectares, Kg)" icon={<Monitor size={16}/>} />
                      <InputGroup label="Fiscal Year Start" placeholder="January" icon={<CalendarIcon size={16}/>} />
                   </div>
                </div>
              </div>
            )}

            {/* 3. SECURITY SECTION */}
            {activeTab === 'security' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-4">
                   <Shield className="text-amber-500" size={24} />
                   <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Security Recommendation: Enable Two-Factor Authentication (2FA) for better protection.</p>
                </div>
                
                <div className="space-y-6">
                   <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Update Password</h3>
                   <div className="grid grid-cols-1 gap-4">
                      <InputGroup label="Current Password" type="password" placeholder="••••••••" icon={<Lock size={16}/>} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InputGroup label="New Password" type="password" placeholder="••••••••" icon={<Lock size={16}/>} />
                         <InputGroup label="Confirm New Password" type="password" placeholder="••••••••" icon={<Lock size={16}/>} />
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                   <button className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest hover:opacity-80">
                      <Trash2 size={16} /> Deactivate Account
                   </button>
                </div>
              </div>
            )}

            {/* 4. APPEARANCE SECTION */}
            {activeTab === 'appearance' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                 <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Display Mode</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ThemeCard active id="light" label="Light Mode" icon={<Sun size={24} />} />
                    <ThemeCard id="dark" label="Dark Mode" icon={<Moon size={24} />} />
                    <ThemeCard id="system" label="System Default" icon={<Monitor size={24} />} />
                 </div>

                 <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                    <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest mb-4">Sidebar Density</h3>
                    <div className="flex gap-4">
                       <button className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Default</button>
                       <button className="px-6 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-slate-700">Compact</button>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </main>
      </div>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, placeholder, icon, type = "text" }: { label: string, placeholder: string, icon: any, type?: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">{icon}</div>
       <input 
         type={type} 
         placeholder={placeholder} 
         className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all" 
       />
    </div>
  </div>
);

const ToggleGroup = ({ label, description, defaultChecked = false }: { label: string, description: string, defaultChecked?: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
    <div>
       <p className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tighter">{label}</p>
       <p className="text-[10px] font-bold text-gray-400 mt-0.5">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
       <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
       <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  </div>
);

const ThemeCard = ({ label, icon, active = false }: { label: string, icon: any, id: string, active?: boolean }) => (
  <button className={`flex flex-col items-center gap-4 p-8 rounded-[2rem] border transition-all ${
    active ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-gray-200'
  }`}>
     {icon}
     <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
     {active && <CheckCircle2 size={16} className="text-primary" />}
  </button>
);

const CalendarIcon = ({ size }: { size: number }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
   </svg>
);

export default SettingsContainer;