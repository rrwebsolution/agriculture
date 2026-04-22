import { type ReactNode } from 'react';

interface ReportMetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

export default function ReportMetricCard({ icon, title, value, color, bgColor, isLoading }: ReportMetricCardProps) {
  return (
    <div className="relative p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all overflow-hidden h-28">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/10 z-10 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        ) : (
          <div className="w-full h-full bg-primary/30" />
        )}
      </div>

      <div className={`p-4 rounded-2xl ${bgColor} ${color} ${isLoading ? 'animate-pulse opacity-60' : ''}`}>{icon}</div>

      <div className="w-full">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-2.5 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
          </>
        )}
      </div>
    </div>
  );
}
