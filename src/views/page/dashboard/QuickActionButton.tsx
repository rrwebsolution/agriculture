import React from 'react';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:border-primary hover:text-primary transition-all group cursor-pointer w-full">
    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl mb-2 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
      {icon}
    </div>
    <span className="text-[12px] font-black uppercase tracking-tighter text-center">{label}</span>
  </button>
);

export default QuickActionButton;