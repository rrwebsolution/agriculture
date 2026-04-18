import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  User, Shield, Palette, Lock, Mail,
  Save, Moon, Sun, Monitor, Eye, EyeOff,
  CheckCircle2, ChevronRight, Loader2, KeyRound,
  ShieldCheck, AlertTriangle, Check
} from 'lucide-react';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';

type TabId = 'profile' | 'security' | 'appearance';
type ThemeVal = 'light' | 'dark' | 'system';

// ─── helpers ────────────────────────────────────────────────────────────────

const applyTheme = (t: ThemeVal) => {
  const root = document.documentElement;
  const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  isDark ? root.classList.add('dark') : root.classList.remove('dark');
  localStorage.setItem('agri-system-theme', t);
};

// ─── main component ──────────────────────────────────────────────────────────

const SettingsContainer: React.FC = () => {
  const location = useLocation();
  const initialTab = ((location.state as any)?.tab as TabId) ?? 'profile';

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'profile',    label: 'My Profile', icon: <User size={18} />,       desc: 'Edit your personal info'   },
    { id: 'security',  label: 'Security',   icon: <Shield size={18} />,      desc: 'Update your password'      },
    { id: 'appearance',label: 'Appearance', icon: <Palette size={18} />,     desc: 'Theme & display options'   },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="text-primary" size={18} />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Account</span>
        </div>
        <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
          Profile &amp; <span className="text-primary italic">Settings</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sidebar Nav ── */}
        <aside className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-slate-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest leading-none">{tab.label}</p>
                  <p className={`text-[9px] font-medium mt-0.5 ${activeTab === tab.id ? 'text-white/70' : 'text-gray-400'}`}>{tab.desc}</p>
                </div>
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {activeTab === 'profile'    && <ProfileTab />}
          {activeTab === 'security'   && <SecurityTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
        </main>

      </div>
    </div>
  );
};

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────

const ProfileTab: React.FC = () => {
  const raw = localStorage.getItem('user_data') || '{}';
  const storedUser = JSON.parse(raw);

  const [name,    setName]    = useState(storedUser.name  || '');
  const [email,   setEmail]   = useState(storedUser.email || '');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required.'); return; }
    if (!email.trim()) { toast.error('Email is required.'); return; }

    setSaving(true);
    setSuccess(false);
    try {
      const payload = {
        name:       name.trim(),
        email:      email.trim(),
        role_id:    storedUser.role?.id    ?? null,
        cluster_id: storedUser.cluster?.id ?? null,
        status:     storedUser.status      ?? 'active',
      };
      const res = await axios.put(`users-update/${storedUser.id}`, payload);
      const updated = res.data.data;

      // sync localStorage
      const merged = { ...storedUser, name: updated.name, email: updated.email };
      localStorage.setItem('user_data', JSON.stringify(merged));

      setSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <form onSubmit={handleSave} className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">

      {/* Avatar + Identity */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100 dark:border-slate-800">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-3xl bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-white text-4xl font-black select-none uppercase">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <Check size={10} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{storedUser.name || '—'}</h3>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mt-0.5">
            {storedUser.role?.name || 'No Role Assigned'}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase">
            {storedUser.cluster?.name ? `Cluster: ${storedUser.cluster.name}` : 'No Cluster Assigned'}
          </p>
        </div>
      </div>

      {/* Read-only Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadonlyField label="Role"    value={storedUser.role?.name    || '—'} icon={<ShieldCheck size={15} />} />
        <ReadonlyField label="Cluster" value={storedUser.cluster?.name || '—'} icon={<Monitor size={15} />} />
      </div>

      {/* Editable Fields */}
      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Editable Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Full Name" icon={<User size={15} />}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={saving}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:font-normal placeholder:text-gray-400"
            />
          </FieldGroup>
          <FieldGroup label="Email Address" icon={<Mail size={15} />}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email address"
              disabled={saving}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:font-normal placeholder:text-gray-400"
            />
          </FieldGroup>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:opacity-90 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          {saving  ? <Loader2 size={15} className="animate-spin" /> :
           success ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
};

// ─── SECURITY TAB ─────────────────────────────────────────────────────────────

const SecurityTab: React.FC = () => {
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showCon,    setShowCon]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const strength = (() => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8)          s++;
    if (/[A-Z]/.test(newPw))        s++;
    if (/[0-9]/.test(newPw))        s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'][strength];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentPw) { setError('Current password is required.'); return; }
    if (newPw.length < 8)  { setError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }

    setSaving(true);
    try {
      await axios.post('update-password', {
        current_password:      currentPw,
        password:              newPw,
        password_confirmation: confirmPw,
      });
      toast.success('Password updated successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">

      {/* Tip Banner */}
      <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-tight">Security Recommendation</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
            Use a strong password — at least 8 characters with uppercase letters, numbers, and symbols.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-800 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          <KeyRound size={12} className="inline mr-1.5" />Change Password
        </p>
        <div className="space-y-4">

          {/* Current */}
          <FieldGroup label="Current Password" icon={<Lock size={15} />}>
            <input
              type={showCur ? 'text' : 'password'}
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Enter current password"
              disabled={saving}
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:font-normal placeholder:text-gray-400"
            />
            <button type="button" onClick={() => setShowCur(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
              {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </FieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New */}
            <FieldGroup label="New Password" icon={<Lock size={15} />}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Enter new password"
                disabled={saving}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:font-normal placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </FieldGroup>

            {/* Confirm */}
            <FieldGroup label="Confirm New Password" icon={<Lock size={15} />}>
              <input
                type={showCon ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-type new password"
                disabled={saving}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:font-normal placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowCon(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                {showCon ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </FieldGroup>
          </div>

          {/* Strength Bar */}
          {newPw && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-100 dark:bg-slate-700'}`} />
                ))}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${strengthColor.replace('bg-', 'text-')}`}>
                {strengthLabel} password
              </p>
            </div>
          )}

        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:opacity-90 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>

    </form>
  );
};

// ─── APPEARANCE TAB ──────────────────────────────────────────────────────────

const AppearanceTab: React.FC = () => {
  const [theme, setThemeState] = useState<ThemeVal>(
    (localStorage.getItem('agri-system-theme') as ThemeVal) || 'system'
  );
  const [saved, setSaved] = useState(false);

  const handleTheme = (t: ThemeVal) => {
    setThemeState(t);
    setSaved(false);
  };

  const handleSave = () => {
    applyTheme(theme);
    setSaved(true);
    toast.success('Appearance saved!');
    setTimeout(() => setSaved(false), 3000);
  };

  const themes: { id: ThemeVal; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: 'light',  label: 'Light',  sub: 'Clean & bright',    icon: <Sun size={28} />     },
    { id: 'dark',   label: 'Dark',   sub: 'Easy on the eyes',  icon: <Moon size={28} />    },
    { id: 'system', label: 'System', sub: 'Follows your OS',   icon: <Monitor size={28} /> },
  ];

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">

      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Display Mode</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTheme(t.id)}
              className={`flex flex-col items-center gap-3 p-7 rounded-2xl border-2 transition-all ${
                theme === t.id
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-md shadow-primary/10'
                  : 'border-gray-100 dark:border-slate-700 text-gray-400 hover:border-gray-200 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {t.icon}
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest leading-none">{t.label}</p>
                <p className={`text-[9px] font-medium mt-1 ${theme === t.id ? 'text-primary/70' : 'text-gray-400'}`}>{t.sub}</p>
              </div>
              {theme === t.id && <CheckCircle2 size={16} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-5 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            {theme === 'light' ? <Sun size={18} className="text-primary" /> :
             theme === 'dark'  ? <Moon size={18} className="text-primary" /> :
             <Monitor size={18} className="text-primary" />}
          </div>
          <div>
            <p className="text-xs font-black text-gray-800 dark:text-white uppercase">{theme} Mode selected</p>
            <p className="text-[9px] text-gray-400 font-medium capitalize">
              {theme === 'system'
                ? 'Will match your operating system preference'
                : `The portal will always appear in ${theme} mode`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'Applied!' : 'Apply Theme'}
        </button>
      </div>

    </div>
  );
};

// ─── SHARED FIELD HELPERS ─────────────────────────────────────────────────────

const FieldGroup = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none">{icon}</div>
      {children}
    </div>
  </div>
);

const ReadonlyField = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 truncate">{value}</span>
      <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-slate-600">Read-only</span>
    </div>
  </div>
);

export default SettingsContainer;
