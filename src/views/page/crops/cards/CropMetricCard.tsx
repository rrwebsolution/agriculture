import React from 'react';
import { cn } from '../../../../lib/utils'; 

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
    <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center gap-4 shadow-sm relative overflow-hidden h-28 group">
      
      {/* 🌟 VERTICAL PROGRESS LOADER ON THE LEFT EDGE */}
      {isLoading && (
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[40%] bg-primary animate-progress-loop-y" />
        </div>
      )}

      {/* ICON SECTION */}
      <div className={cn(
        "p-4 rounded-2xl transition-all duration-500 shrink-0",
        bgColor,
        color,
        isLoading && "animate-pulse opacity-50"
      )}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      
      {/* TEXT CONTENT */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="space-y-2 animate-pulse w-full">
            <div className="h-2.5 bg-gray-200 dark:bg-slate-800 rounded w-24"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-16"></div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
              {title}
            </p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none truncate">
              {value}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropMetricCard;