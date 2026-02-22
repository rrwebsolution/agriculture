import React from 'react';
import { MapPin, Edit3, Trash2, MoreVertical } from 'lucide-react';

// Updated Sector Interface with Active/Inactive status
export interface Sector {
  id: number;
  name: string;
  description: string;
  staffCount: number;
  status: 'Active' | 'Inactive';
}

interface SectorTableProps {
  sectors: Sector[];
}

const SectorTable: React.FC<SectorTableProps> = ({ sectors }) => {
  return (
    <table className="w-full text-left border-collapse min-w-700px animate-in fade-in duration-500">
      <thead>
        <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sector Name</th>
          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</th>
          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
        {sectors.map((sector) => (
          <tr key={sector.id} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-all">
            
            {/* 1. Sector Name */}
            <td className="px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                  <MapPin size={18} />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {sector.name}
                </p>
              </div>
            </td>

            {/* 2. Description */}
            <td className="px-8 py-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 max-w-300px truncate">
                {sector.description}
              </p>
            </td>

            {/* 3. Status (Active / Inactive) */}
            <td className="px-8 py-6">
               <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                 sector.status === 'Active' 
                 ? 'bg-emerald-500/10 text-emerald-500' 
                 : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
               }`}>
                 {sector.status}
               </span>
            </td>

            {/* 4. Actions */}
            <td className="px-8 py-6 text-right">
              <div className="flex items-center justify-end gap-1">
                <button 
                  title="Edit"
                  className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-primary rounded-xl transition-all shadow-sm active:scale-90"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  title="Delete"
                  className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  title="More"
                  className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}

        {/* Empty State */}
        {sectors.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center py-20">
               <MapPin className="mx-auto text-gray-200 dark:text-slate-800 mb-4" size={48} />
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No sectors found</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default SectorTable;