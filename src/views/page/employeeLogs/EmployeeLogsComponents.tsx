import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export function MetricCard({ icon, label, value, tone, isLoading, helper }: any) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 min-h-28 overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {isLoading ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
            <div className="h-7 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
          </div>
        </>
      ) : (
        <>
          <div className={cn('p-4 rounded-2xl', tones[tone] || tones.blue)}>{icon}</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
            {helper ? <p className="mt-1 text-[10px] font-bold text-gray-500 dark:text-slate-400">{helper}</p> : null}
          </div>
        </>
      )}
    </div>
  );
}

export function InfoStripCard({ icon, title, value, description, isLoading }: any) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 shadow-sm">
      {isLoading && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 w-10 rounded-2xl bg-gray-200 dark:bg-slate-800" />
          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-6 w-40 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
            <p className="mt-1 text-lg font-black text-gray-800 dark:text-white wrap-break-word">{value}</p>
            <p className="mt-2 text-[11px] font-bold text-gray-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryDetailCard({ icon, label, value, helper }: any) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 px-4 py-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      </div>
      <p className="mt-3 text-sm font-black text-gray-800 dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold text-gray-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

export function HistoryInfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3', multiline && 'items-start')}>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className={cn('mt-2 text-xs font-bold text-gray-700 dark:text-slate-200', multiline && 'leading-relaxed')}>{value}</p>
    </div>
  );
}

export function MobileInfoBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
          <p className="mt-1 text-[11px] font-bold text-gray-700 dark:text-slate-200 wrap-break-word">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function ProgressLoader() {
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
      <div className="h-full bg-primary w-[40%] animate-progress-loop" />
    </div>
  );
}

export function EmployeeRowSkeleton() {
  return (
    <div className="grid grid-cols-[1.1fr_1fr_0.9fr_0.9fr_0.8fr] gap-4 px-6 py-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded self-center" />
      <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded self-center" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="flex justify-end">
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export function EmployeeMobileCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="h-4 w-36 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-16 w-full bg-gray-200 dark:bg-slate-700 rounded-2xl" />
        <div className="h-16 w-full bg-gray-200 dark:bg-slate-700 rounded-2xl" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

export function StyledSelect({
  label,
  value,
  onChange,
  options,
  icon,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4 text-gray-400 z-10">{icon}</div>}
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none',
            icon ? 'pl-11 pr-4' : 'px-4',
            disabled && 'opacity-70 cursor-not-allowed'
          )}
        >
          {options.map((option) => {
            if (typeof option === 'string') return <option key={option} value={option}>{option}</option>;
            return <option key={option.value} value={option.value}>{option.label}</option>;
          })}
        </select>
      </div>
    </div>
  );
}
