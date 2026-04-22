import React from 'react';
import { cn } from '../../../../lib/utils';

interface FisherfolkMetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | React.ReactNode;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

const FisherfolkMetricCard: React.FC<FisherfolkMetricCardProps> = ({ icon, title, value, color, bgColor, isLoading }) => {
  return (
    <div className="p-6 pl-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden group h-28">
      
      {/* VERTICAL PROGRESS BAR LOADER ON LEFT */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {!isLoading && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30" />}

      <div className={cn(`p-4 rounded-2xl ${bgColor} ${color} transition-all duration-500`, isLoading && "animate-pulse")}>
        {icon}
      </div>
      
      <div className={cn("transition-all duration-300 flex-1 w-full", isLoading && "opacity-60")}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">
          {isLoading ? (
            <div className="h-6 w-12 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
          ) : (
            value
          )}
        </h3>
      </div>
    </div>
  );
};

export default FisherfolkMetricCard;
