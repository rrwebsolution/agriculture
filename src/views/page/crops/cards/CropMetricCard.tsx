import React from 'react';
import { cn } from '../../../../lib/utils'; // Make sure this path is correct for your project

interface CropMetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

const CropMetricCard: React.FC<CropMetricCardProps> = ({ icon, title, value, color, bgColor, isLoading }) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden group">
      
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
          <div className="h-full bg-primary w-[40%] animate-progress-loop" />
        </div>
      )}

      <div className={cn(`p-4 rounded-2xl ${bgColor} ${color} transition-all duration-500`, isLoading && "animate-pulse")}>
        {icon}
      </div>
      
      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="space-y-2 animate-pulse w-full">
            <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{value}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropMetricCard;