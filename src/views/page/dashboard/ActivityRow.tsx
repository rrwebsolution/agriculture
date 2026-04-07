import React from 'react';
import { MapPin } from 'lucide-react';

interface ActivityRowProps {
  name: string;
  loc: string;
  task: string;
  sector: string;
  time: string;
}

const ActivityRow: React.FC<ActivityRowProps> = ({ name, loc, task, sector, time }) => (
  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-6 py-5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
        {name.split(' ')[0]?.[0] || '?'}{name.split(' ')[1]?.[0] || ''}
      </div>
      <p className="text-xs font-black text-gray-700 dark:text-slate-300">{name}</p>
    </td>
    <td className="px-6 py-5">
       <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
          <MapPin size={10} />
          <p className="text-[11px] font-bold uppercase">{loc}</p>
       </div>
    </td>
    <td className="px-6 py-5">
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{task}</p>
    </td>
    <td className="px-6 py-5">
      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
        sector === 'Farming' ? 'bg-emerald-100 text-emerald-600' : 
        sector === 'Fishery' ? 'bg-blue-100 text-blue-600' : 
        'bg-gray-100 text-gray-500'
      }`}>
        {sector}
      </span>
    </td>
    <td className="px-6 py-5 text-right">
      <p className="text-[10px] font-bold text-gray-400">{time}</p>
    </td>
  </tr>
);

export default ActivityRow;