import React from 'react';

interface BarangayMetricCardProps {
  isLoading: boolean;
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  bgColor: string;
}

export const BarangayMetricCard: React.FC<BarangayMetricCardProps> = ({ 
  isLoading, icon, title, value, color, bgColor 
}) => {
  if (isLoading) {
    return (
      <div className="relative p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm overflow-hidden h-28">
        {/* 🌟 Vertical Progress Bar on the left edge */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
        
        {/* Skeleton content */}
        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
          <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm h-28 overflow-hidden group hover:border-primary/20 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30" />
      <div className={`p-4 rounded-2xl ${bgColor} ${color} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">{value}</h3>
      </div>
    </div>
  );
};
