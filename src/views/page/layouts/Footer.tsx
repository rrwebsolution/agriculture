import React from "react";
import { Tractor } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-8 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">
        © 2026 Agriculture System | LGU - Gingoog City
      </p>
      <div className="flex items-center gap-2">
        <Tractor size={14} className="text-primary animate-bounce" style={{ animationDuration: '3s' }} />
        <p className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-tighter">
          build by <span className="text-primary border-b border-primary/30 pb-0.5">RR Web Solution</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;