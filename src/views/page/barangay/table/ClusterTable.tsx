import React from 'react';
import { MapPin, Edit3, Trash2, Eye, Users, Loader2 } from 'lucide-react';

export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  role?: { name: string };
}

export interface Cluster {
  id: number;
  name: string;
  description: string;
  staffCount: number;
  status: 'Active' | 'Inactive';
  users?: User[];
}

interface ClusterTableProps {
  clusters: Cluster[];
  isLoading: boolean;
  onEdit: (cluster: Cluster) => void;
  onDelete: (id: number) => void;
  onView: (cluster: Cluster) => void;
}

const ClusterTable: React.FC<ClusterTableProps> = ({ 
  clusters, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  return (
    <table className="w-full text-left border-collapse min-w-200">
      <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <th className="px-8 py-5">Cluster Information</th>
          <th className="px-8 py-5">Description</th>
          <th className="px-8 py-5 text-center">Status</th>
          <th className="px-8 py-5 text-right">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
        {isLoading ? (
          <tr>
            <td colSpan={4} className="py-32 text-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updating Cluster List...</p>
              </div>
            </td>
          </tr>
        ) : clusters.length > 0 ? (
          clusters.map((cluster) => (
            <tr key={cluster.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
              <td className="px-8 py-5 align-top">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-sm bg-primary">
                    {cluster.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{cluster.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                      <Users size={10} /> <span>{cluster.staffCount} Staff Members</span>
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-8 py-5 align-top">
                <div className="flex items-center gap-2 pt-1">
                  <MapPin size={14} className="text-primary/60" />
                  <span className="text-xs font-bold text-gray-600 dark:text-slate-400 max-w-xs line-clamp-1">{cluster.description}</span>
                </div>
              </td>

              <td className="px-8 py-5 text-center align-top pt-6">
                 <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-md border ${
                   cluster.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                 }`}>
                   {cluster.status}
                 </span>
              </td>

              <td className="px-8 py-5 text-right align-top pt-5">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onView(cluster)} title="View" className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => onEdit(cluster)} title="Edit" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => onDelete(cluster.id)} title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="py-24 text-center">
               <p className="text-xs font-black uppercase tracking-widest text-gray-400 italic">No Clusters Found</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ClusterTable;
