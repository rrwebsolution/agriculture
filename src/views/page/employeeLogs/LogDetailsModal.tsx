import { Eye, X, Loader2, ScanFace, CheckCircle2, AlertCircle, Calendar, MapPinned, BriefcaseBusiness, LocateFixed, ClipboardList, ShieldCheck, StickyNote } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatLogDateTime, formatLogTime } from './employeeLogsUtils';

interface LogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
  historyLogs: any[];
  isLoadingDetails: boolean;
}

export default function LogDetailsModal({ isOpen, onClose, log, historyLogs, isLoadingDetails }: LogDetailsModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" onClick={isLoadingDetails ? undefined : onClose} />

      <div className="relative w-full max-w-6xl bg-gray-50 dark:bg-slate-950 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-gray-800 dark:text-white">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Verified Log Record</h2>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Smart Check-In Details</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isLoadingDetails} className="p-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 cursor-pointer">
            <X size={20} className="text-gray-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 relative">
          {isLoadingDetails && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center rounded-b-[2.5rem]">
              <div className="text-center">
                <Loader2 size={40} className="mx-auto text-primary animate-spin mb-4 drop-shadow-md" />
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Syncing Log Details</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Glassmorphism Photo Showcase */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl bg-slate-900 border border-slate-800 h-125 flex items-center justify-center">
                {log.verification_photo ? (
                  <>
                    <img src={log.verification_photo} alt="Verification" className="w-full h-full object-cover opacity-90 transition-opacity" />
                    
                    {/* Floating Match Score Badge */}
                    <div className={cn("absolute top-5 right-5 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl", 
                      log.face_verified ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    )}>
                      {log.face_verified ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span className="text-xs font-black uppercase tracking-widest">
                        {log.face_verified ? `Match ${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                      </span>
                    </div>

                    {/* Gradient Overlay for Details */}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/80 to-transparent pt-24 pb-6 px-6">
                      <h3 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
                        {`${log.employee?.first_name || ''} ${log.employee?.last_name || ''}`.trim() || 'Unknown'}
                      </h3>
                      <p className="text-primary text-xs font-black uppercase tracking-widest mt-1 mb-4 drop-shadow-md">
                        {log.employee?.position || 'Employee'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/10">
                          <Calendar size={12} /> {formatLogDateTime(log)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/20 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-200 border border-blue-500/20">
                          <MapPinned size={12} /> Checked In Field
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white/40">
                    <ScanFace size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-[0.25em]">No Snapshot Found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Information Cards */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Task & Status Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-2xl"><BriefcaseBusiness size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assignment</p>
                    <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white leading-tight">{log.assignment || 'Routine Check-In'}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
                    <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white leading-tight">{log.status || 'Recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Location Highlight */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 rounded-[2rem] p-6 border border-blue-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <LocateFixed size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/80 dark:text-blue-400">Recorded GPS Location</p>
                    <h4 className="text-base font-black text-gray-800 dark:text-white tracking-tight">{log.location_name || 'Coordinates Only'}</h4>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-black/20 rounded-2xl px-4 py-3 flex justify-between items-center border border-white/50 dark:border-white/5">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Lat / Lng</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200 font-mono">
                    {log.latitude && log.longitude ? `${Number(log.latitude).toFixed(5)}, ${Number(log.longitude).toFixed(5)}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <StickyNote className="absolute -right-4 -bottom-4 text-gray-50 dark:text-slate-800/50" size={100} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 relative z-10">Recorded Field Notes</p>
                <p className="text-sm font-bold text-gray-700 dark:text-slate-300 leading-relaxed relative z-10">
                  {log.notes || 'No extra notes recorded for this deployment.'}
                </p>
              </div>

              {/* Mini History List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <ClipboardList size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Recent Movement</p>
                </div>
                {historyLogs.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {historyLogs.map((hlog: any) => (
                      <div key={hlog.id} className="min-w-55 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shrink-0 shadow-sm">
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-800 dark:text-slate-200 line-clamp-1">{hlog.assignment || 'No assignment'}</p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{hlog.location_name}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md">{formatLogTime(hlog)}</span>
                          <span className={cn('h-2 w-2 rounded-full', hlog.face_verified ? 'bg-emerald-500' : 'bg-rose-500')} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">No prior recent logs found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}