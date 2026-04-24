import React, { useEffect } from 'react';
import { MapPin, X, Users, Calendar, FileText, Mail } from 'lucide-react';

// 🌟 Added local interfaces to replace the deleted ClusterTable import
export interface ClusterUser {
  id: number;
  name: string;
  email: string;
  status: string;
}

export interface ClusterData {
  id: number;
  name: string;
  description: string;
  status: string;
  staffCount?: number;
  users?: ClusterUser[];
  updated_at?: string; // Added to make the date dynamic
}

interface ClusterViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cluster: ClusterData | any | null; // Used 'any' as fallback just in case your API returns extra fields
}

const ClusterViewDialog: React.FC<ClusterViewDialogProps> = ({ isOpen, onClose, cluster }) => {
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    
    // Cleanup on unmount
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !cluster) return null;

  // 🌟 Make the date dynamic instead of hardcoded
  const formattedDate = cluster.updated_at 
    ? new Date(cluster.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* MODAL CONTAINER */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        
        {/* HEADER */}
        <div className="h-28 bg-primary relative flex items-end p-8">
           <div className="absolute top-6 right-6">
              <button 
                onClick={onClose} 
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
           </div>
           <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center absolute -bottom-6 left-8 border-4 border-white dark:border-slate-900 text-primary">
              <MapPin size={28} />
           </div>
        </div>

        {/* CONTENT BODY */}
        <div className="pt-10 p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* TITLE & STATUS */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                {cluster.name}
              </h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                Cluster / Department / Work Location
              </p>
            </div>
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${
                cluster.status === 'Active' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20'
            }`}>
                {cluster.status}
            </span>
          </div>

          {/* DESCRIPTION BOX */}
          <div className="p-5 bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-3 text-gray-400">
                <FileText size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Reference Description</span>
             </div>
             <p className="text-xs font-medium text-gray-600 dark:text-slate-400 italic leading-relaxed">
               {cluster.description ? `"${cluster.description}"` : "No description provided."}
             </p>
          </div>

          {/* ASSIGNED PERSONNEL */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <Users size={18} className="text-primary" />
                <h4 className="text-[11px] font-black text-gray-800 dark:text-white uppercase tracking-widest">
                  Assigned Personnel ({cluster.staffCount || cluster.users?.length || 0})
                </h4>
             </div>

             <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cluster.users && cluster.users.length > 0 ? (
                    cluster.users.map((member: ClusterUser) => (
                        <div key={member.id} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-primary/30 transition-all shadow-sm">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 shrink-0">
                                 {member.name?.substring(0,2).toUpperCase() || "U"}
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-sm font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight line-clamp-1">
                                    {member.name}
                                 </p>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 line-clamp-1">
                                       <Mail size={10}/> {member.email}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className={`w-2 h-2 rounded-full ${member.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-slate-600'}`} />
                              <span className="text-[8px] font-black text-gray-400 uppercase">{member.status || 'Unknown'}</span>
                           </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center bg-gray-50/50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                        <Users className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={40} />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No staff members found</p>
                    </div>
                )}
             </div>
          </div>

          {/* FOOTER METADATA */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar size={12} className="text-primary/60" />
                Updated: {formattedDate}
             </div>
             <p className="text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase italic">
                ID: CLU-{String(cluster.id).padStart(3, '0')}
             </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ClusterViewDialog;
