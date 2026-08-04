import React, { useEffect, useState } from 'react';
import appAxios from '../../../plugin/axios';
import { HardDrive, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface DiskUsage {
  size: string;
  used: string;
  avail: string;
  use_percent: number;
}

const statusFor = (percent: number) => {
  if (percent >= 90) {
    return { label: 'Critical', icon: <AlertOctagon size={14} />, bar: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' };
  }
  if (percent >= 70) {
    return { label: 'Warning', icon: <AlertTriangle size={14} />, bar: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
  }
  return { label: 'Healthy', icon: <CheckCircle2 size={14} />, bar: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
};

const SystemHealthContainer: React.FC = () => {
  const [disk, setDisk] = useState<DiskUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiskUsage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appAxios.get('system/disk-usage');
      setDisk(res.data?.data ?? null);
    } catch {
      setError('Unable to load server disk usage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiskUsage(); }, []);

  const status = statusFor(disk?.use_percent ?? 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
            Server <span className="text-primary italic">Health</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Live storage usage on the production server
          </p>
        </div>

        <button
          onClick={fetchDiskUsage}
          disabled={loading}
          className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-primary transition-all shadow-sm disabled:opacity-50 self-start lg:self-auto"
          title="Refresh"
        >
          <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <HardDrive size={20} className="text-primary" />
          <h2 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">Disk Usage</h2>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <AlertOctagon size={28} className="text-red-300" />
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">{error}</p>
          </div>
        ) : loading && !disk ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl" />)}
            </div>
          </div>
        ) : disk ? (
          <div className="space-y-6">

            {/* Usage bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.text} text-[10px] font-black uppercase tracking-widest`}>
                  {status.icon} {status.label}
                </div>
                <p className="text-sm font-black text-gray-800 dark:text-white">{disk.use_percent}% used</p>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${status.bar} transition-all duration-1000 rounded-full`}
                  style={{ width: `${Math.min(disk.use_percent, 100)}%` }}
                />
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Size</p>
                <p className="text-lg font-black text-gray-800 dark:text-white mt-1">{disk.size}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Used</p>
                <p className="text-lg font-black text-gray-800 dark:text-white mt-1">{disk.used}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Avail</p>
                <p className="text-lg font-black text-gray-800 dark:text-white mt-1">{disk.avail}</p>
              </div>
            </div>

          </div>
        ) : null}
      </section>
    </div>
  );
};

export default SystemHealthContainer;
