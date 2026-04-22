import React from 'react';
import { cn } from '../../../../lib/utils'; 

interface HarvestMetricCardProps {
  isLoading?: boolean;
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
}

export default function HarvestMetricCard({ isLoading, icon, title, value, color, bgColor }: HarvestMetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex items-center gap-5 relative overflow-hidden transition-all hover:shadow-md">
      
      {/* 🌟 NAGDAGAN NGA PROGRESS LOADER SA WALA NGA KILID */}
      {isLoading && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/10 overflow-hidden z-20">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}

      {/* ACTUAL CONTENT */}
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-opacity duration-300 relative z-0", 
        bgColor, color, 
        isLoading && "opacity-40"
      )}>
        {icon}
      </div>
      <div className={cn("transition-opacity duration-300 relative z-0", isLoading && "opacity-40")}>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
          {title}
        </h4>
        <p className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
          {value}
        </p>
      </div>

    </div>
  );
}
