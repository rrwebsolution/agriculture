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
    <div className="relative p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {isLoading && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 z-10 overflow-hidden">
          <div className="w-full h-[40%] bg-primary animate-progress-loop-y" />
        </div>
      )}
      <div className={`p-4 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
      <div className="w-full">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        {isLoading ? (
          <div className="h-6 w-24 bg-gray-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
        ) : (
          <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
        )}
      </div>
    </div>
  );
}
