import { cn } from '../../../../lib/utils'; 

export const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('seedling')) return 'bg-blue-100 text-blue-600 border-blue-200';
  if (s.includes('harvested')) return 'bg-emerald-100 text-emerald-600 border-emerald-200';
  if (s.includes('damaged') || s.includes('destroyed')) return 'bg-red-100 text-red-600 border-red-200';
  return 'bg-amber-100 text-amber-600 border-amber-200'; // for vegetative, etc.
};

export const InfoRow = ({ label, value, valueClass }: { label: string, value: any, valueClass?: string }) => (
  <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-slate-800/50 last:border-0">
     <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
     <span className={cn("text-[10px] font-black text-gray-800 dark:text-white uppercase text-right truncate max-w-[60%]", valueClass)}>{String(value || 'N/A')}</span>
  </div>
);

export const CardListSkeleton = ({ type }: { type: 'expandable' | 'grid' }) => {
  if (type === 'expandable') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 shrink-0" /><div className="space-y-2"><div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" /><div className="flex gap-2"><div className="h-3 w-20 bg-gray-200 dark:bg-slate-800 rounded" /><div className="h-3 w-16 bg-gray-200 dark:bg-slate-800 rounded" /></div></div></div>
            <div className="flex items-center gap-6"><div className="space-y-2 text-right hidden md:block"><div className="h-2 w-12 bg-gray-200 dark:bg-slate-800 rounded ml-auto" /><div className="h-4 w-16 bg-gray-200 dark:bg-slate-800 rounded ml-auto" /></div><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800" /></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 animate-pulse flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 shrink-0" /><div className="space-y-2 flex-1 mt-2"><div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" /><div className="h-2 w-1/2 bg-gray-200 dark:bg-slate-800 rounded" /></div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState = ({ icon, text }: { icon: any, text: string }) => (
  <div className="py-20 bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-gray-400">
    <div className="mb-4 opacity-20">{icon}</div><p className="text-xs font-black uppercase tracking-widest">{text}</p>
  </div>
);