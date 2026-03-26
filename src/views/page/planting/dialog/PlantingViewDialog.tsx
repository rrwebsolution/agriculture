import React, { useState } from 'react';
import axios from '../../../../plugin/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { 
  X, User, MapPin, Wheat, 
  Calendar, Clock, BarChart as BarChartIcon, Leaf, History, CheckCircle2, Trash2, Loader2
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useAppDispatch } from '../../../../store/hooks';
import { updatePlantingRecord } from '../../../../store/slices/plantingSlice';

interface PlantingViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planting: any;
  onUpdateRecord: (updatedRecord: any) => void;
}

const getStatusBadge = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('seedling')) return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  if (s.includes('vegetative')) return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
  if (s.includes('flowering')) return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
  if (s.includes('maturity') || s.includes('harvest')) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
  if (s.includes('destroy') || s.includes('damage')) return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
  return "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400"; 
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown Date';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PlantingViewDialog: React.FC<PlantingViewDialogProps> = ({ isOpen, onClose, planting, onUpdateRecord }) => {
  const dispatch = useAppDispatch();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (!isOpen || !planting) return null;

  // 🌟 BULLETPROOF FALLBACK LOGIC
  const rawHistory = planting.status_history || [];
  
  const displayHistory = rawHistory.length > 0 
    ? rawHistory 
    : [
        {
          id: 'fallback_default', 
          status: planting.status, 
          created_at: planting.updated_at || planting.created_at || new Date().toISOString(),
          remarks: "Current recorded growth status."
        }
      ];

  const handleDeleteHistory = async (historyId: number | string) => {
    if (historyId === 'fallback_default' || displayHistory.length <= 1) {
      return toast.warning("Cannot delete the only existing status record.");
    }

    const result = await Swal.fire({
      title: 'Delete this status?',
      text: "This will remove the status log and revert the crop's current status.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      setDeletingId(historyId as number);
      try {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const res = await axios.delete(`/planting-history/${historyId}`, { headers });
        
        dispatch(updatePlantingRecord(res.data.data));
        onUpdateRecord(res.data.data);
        
        toast.success("Status history deleted.");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete status.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* HEADER */}
        <div className="bg-primary p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Leaf size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none">Planting Record Details</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Record ID: #{planting.id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">1. Farmer & Location</h3>
              <ViewField icon={<User size={16}/>} label="Farmer Name" value={`${planting.farmer?.first_name || ''} ${planting.farmer?.last_name || ''}`} />
              <ViewField icon={<MapPin size={16}/>} label="Barangay Location" value={planting.barangay?.name || 'N/A'} />
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Crop Specifics</h3>
              <ViewField icon={<Wheat size={16}/>} label="Crop Category" value={planting.crop?.category || 'N/A'} />
              <ViewField icon={<BarChartIcon size={16}/>} label="Area Size" value={`${parseFloat(planting.area).toFixed(2)} Hectares`} />
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-slate-800" />

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">3. Overall Timeline</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                 <div className="text-emerald-500"><Calendar size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-0.5">Date Planted</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatDate(planting.date_planted)}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                 <div className="text-amber-500"><Clock size={20} /></div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 mb-0.5">Estimated Harvest</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{formatDate(planting.est_harvest)}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-slate-800" />

          {/* 🌟 Growth Status History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2 text-gray-800 dark:text-slate-200">
                 <History size={18} className="text-primary" />
                 <h3 className="text-sm font-black uppercase tracking-widest">Growth Status History</h3>
               </div>
            </div>
            
            <div className="relative pl-3 border-l-2 border-gray-100 dark:border-slate-800 space-y-6 ml-3">
               {displayHistory.map((historyItem: any, index: number) => {
                 const isLatest = index === 0; 
                 const logDate = historyItem.created_at || historyItem.updated_at;
                 const timeString = logDate ? new Date(logDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

                 return (
                   <div key={historyItem.id || index} className="relative pl-6 group">
                     <div className={cn("absolute -left-2.75 top-4 w-5 h-5 rounded-full ring-4 ring-white dark:ring-slate-900 flex items-center justify-center", isLatest ? "bg-primary text-white" : "bg-gray-200 dark:bg-slate-700 text-transparent")}>
                        {isLatest && <CheckCircle2 size={12} />}
                     </div>
                     
                     <div className={cn("p-5 rounded-2xl border transition-all", isLatest ? "bg-white dark:bg-slate-800 border-primary/20 shadow-sm" : "bg-gray-50/50 dark:bg-slate-800/30 border-gray-100 dark:border-slate-700 opacity-80")}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                           
                           <div className="flex items-center gap-3">
                             <span className={cn("px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border w-max", getStatusBadge(historyItem.status))}>
                                {historyItem.status}
                             </span>
                             
                             {/* DELETE BUTTON */}
                             {displayHistory.length > 1 && historyItem.id !== 'fallback_default' && (
                               <button 
                                 onClick={() => handleDeleteHistory(historyItem.id)}
                                 disabled={deletingId === historyItem.id}
                                 className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
                                 title="Delete this status record"
                               >
                                 {deletingId === historyItem.id ? <Loader2 className="animate-spin" size={14}/> : <Trash2 size={14}/>}
                               </button>
                             )}
                           </div>

                           <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                             <Clock size={12} />
                             {formatDate(logDate)} {timeString && `• ${timeString}`}
                           </div>
                        </div>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                           {historyItem.remarks || "Status updated manually."}
                        </p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
          <button type="button" onClick={onClose} className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase text-[10px] hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-sm">
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewField = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
    <div className="text-primary/60 mt-0.5">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

export default PlantingViewDialog;