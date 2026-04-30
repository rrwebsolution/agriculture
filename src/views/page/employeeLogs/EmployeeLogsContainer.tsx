import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList, MapPinned, RefreshCw, Search, X, Calendar, CheckCircle2,
  AlertCircle, Lock, ScanFace, Clock3, Trash2, Eye
} from 'lucide-react';
import axios from '../../../plugin/axios';
import Swal from 'sweetalert2';
import { cn } from '../../../lib/utils';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setTechnicianLogData, setTechnicianLogLoading, upsertTechnicianLog, deleteTechnicianLogRecord
} from '../../../store/slices/technicianLogSlice';
import {
  EMPLOYEE_LOG_DETAILS_PERMISSION, MANAGE_EMPLOYEE_LOGS_PERMISSION, VIEW_EMPLOYEE_LOGS_PERMISSION,
  hasPermission, isAdminRoleName
} from '../../../lib/permissions';
import {
  formatLogDateTime, getCurrentUser, getApiErrorMessage, isMissingEmployeeLogError, syncOfflineSmartCheckIns
} from './employeeLogsUtils';
import {
  MetricCard, InfoStripCard, ProgressLoader, EmployeeRowSkeleton, EmployeeMobileCardSkeleton
} from './EmployeeLogsComponents';
import SmartCheckInModal from './SmartCheckInModal';
import LogDetailsModal from './LogDetailsModal';


export default function EmployeeLogsContainer() {
  const dispatch = useAppDispatch();
  const { logs, employees, isLoaded, isLoading } = useAppSelector((state: any) => state.technicianLogs);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Modal States
  const [isSmartCheckInOpen, setIsSmartCheckInOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [isViewingLog, setIsViewingLog] = useState(false);
  const[loadedLogDetailIds, setLoadedLogDetailIds] = useState<number[]>([]);

  const currentUser = useMemo(() => getCurrentUser(),[]);
  const todayLocal = useMemo(() => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - timezoneOffset).toISOString().split('T')[0];
  },[]);
  
  const isAdmin = isAdminRoleName(currentUser?.role?.name);
  const canAccessEmployeeLogs = useMemo(
    () => isAdmin || hasPermission(VIEW_EMPLOYEE_LOGS_PERMISSION) || hasPermission(MANAGE_EMPLOYEE_LOGS_PERMISSION),
    [isAdmin]
  );
  const canViewEmployeeLogDetails = useMemo(
    () => canAccessEmployeeLogs || hasPermission(EMPLOYEE_LOG_DETAILS_PERMISSION),
    [canAccessEmployeeLogs]
  );
  const canDeleteTechnicianLogs = useMemo(() => isAdmin, [isAdmin]);

  const matchedEmployee = useMemo(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    if (!email) return null;
    return employees.find((employee: any) => String(employee.email || '').toLowerCase() === email) || null;
  },[employees, currentUser]);

  const lockedEmployeeId = !isAdmin && matchedEmployee ? String(matchedEmployee.id) : '';

  const fetchData = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return;
    dispatch(setTechnicianLogLoading(true));
    try {
      const[logsRes, employeesRes] = await Promise.all([
        axios.get('technician-logs'),
        axios.get('employees'),
      ]);
      dispatch(setTechnicianLogData({
        logs: logsRes.data.data || [],
        employees: employeesRes.data.data ||[],
      }));
    } catch {
      dispatch(setTechnicianLogLoading(false));
      toast.error('Failed to load employee logs.');
    }
  };

  useEffect(() => {
    fetchData(false);
  },[]);

  useEffect(() => {
    let isSyncing = false;

    const syncQueuedLogs = async () => {
      if (isSyncing || !navigator.onLine) return;
      isSyncing = true;
      try {
        const result = await syncOfflineSmartCheckIns();
        if (result.synced.length > 0) {
          await fetchData(true);
          toast.success(`${result.synced.length} offline check-in(s) synced successfully.`);
        }
      } finally {
        isSyncing = false;
      }
    };

    syncQueuedLogs();
    window.addEventListener('online', syncQueuedLogs);
    return () => window.removeEventListener('online', syncQueuedLogs);
  }, []);

  const visibleLogs = useMemo(() => {
    if (isAdmin) return logs;
    if (!matchedEmployee) return[];
    return logs.filter((log: any) => String(log.employee_id) === String(matchedEmployee.id));
  }, [isAdmin, logs, matchedEmployee]);

  const searchedLogs = useMemo(() => {
    const needle = search.toLowerCase();
    return visibleLogs.filter((log: any) =>[log.location_name, log.assignment, log.status, log.employee?.first_name, log.employee?.last_name]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [visibleLogs, search]);

  const todaysLogs = useMemo(() => searchedLogs.filter((log: any) => log.log_date === todayLocal), [searchedLogs, todayLocal]);
  const historyLogsList = useMemo(() => searchedLogs.filter((log: any) => log.log_date !== todayLocal),[searchedLogs, todayLocal]);
  const filteredHistoryLogs = useMemo(() => historyDateFilter ? historyLogsList.filter((log: any) => log.log_date === historyDateFilter) : historyLogsList,[historyDateFilter, historyLogsList]);
  
  const displayedLogs = activeTab === 'today' ? todaysLogs : filteredHistoryLogs;
  const totalEntries = displayedLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return displayedLogs.slice(start, start + pageSize);
  }, [displayedLogs, safeCurrentPage]);
  const startEntry = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = totalEntries === 0 ? 0 : Math.min(safeCurrentPage * pageSize, totalEntries);
  const visibleEmployees = useMemo(() => isAdmin ? employees : (matchedEmployee ? [matchedEmployee] : []),[employees, isAdmin, matchedEmployee]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, historyDateFilter]);

  const historyLogs = useMemo(() => {
    if (!editingLog?.employee_id) return[];
    return visibleLogs
      .filter((log: any) => log.id !== editingLog.id && String(log.employee_id) === String(editingLog.employee_id))
      .sort((a: any, b: any) => new Date(`${b.log_date}T00:00:00`).getTime() - new Date(`${a.log_date}T00:00:00`).getTime())
      .slice(0, 5);
  },[editingLog, visibleLogs]);

  const uniqueVisibleLocations = useMemo(() => new Set(visibleLogs.map((log: any) => log.location_name).filter(Boolean)).size, [visibleLogs]);
  const todayVisibleLogs = useMemo(() => visibleLogs.filter((log: any) => log.log_date === todayLocal).length, [todayLocal, visibleLogs]);
  const verifiedVisibleLogs = useMemo(() => visibleLogs.filter((log: any) => log.face_verified).length, [visibleLogs]);
  const verifiedRate = useMemo(() => {
    if (!visibleLogs.length) return 0;
    return Math.round((verifiedVisibleLogs / visibleLogs.length) * 100);
  }, [verifiedVisibleLogs, visibleLogs.length]);

  const openView = async (log: any) => {
    setEditingLog(log);
    const hasLoadedDetails = loadedLogDetailIds.includes(Number(log.id)) || !!log.verification_photo;
    if (hasLoadedDetails) return;

    setIsViewingLog(true);
    try {
      const response = await axios.get(`technician-logs/${log.id}`);
      const latestLog = response.data?.data || log;
      setEditingLog(latestLog);
      dispatch(upsertTechnicianLog({ data: latestLog, mode: 'edit' }));
      setLoadedLogDetailIds((prev) => [...prev, Number(log.id)]);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to load details.'));
    } finally {
      setIsViewingLog(false);
    }
  };

  const handleDeleteLog = async (log: any) => {
    if (!canDeleteTechnicianLogs) return;
    const result = await Swal.fire({
      title: 'Delete Employee Log?',
      text: `This will permanently remove the log for ${log.employee?.first_name || 'this employee'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    setIsSaving(true);
    try {
      await axios.delete(`technician-logs/${log.id}`);
      dispatch(deleteTechnicianLogRecord(log.id));
      toast.success('Log deleted successfully.');
      if (editingLog?.id === log.id) setEditingLog(null);
    } catch (error: any) {
      if (isMissingEmployeeLogError(error)) {
        dispatch(deleteTechnicianLogRecord(log.id));
        toast.info('Log was already deleted from server.');
      } else {
        toast.error(getApiErrorMessage(error, 'Failed to delete log.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <ClipboardList size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deployment Tracking</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter leading-none">
            Employee <span className="text-primary italic">Logs</span>
          </h2>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {isAdmin ? 'Admin access: all employee logs and movement history.' : 'Personal access: only your own employee log history is visible.'}
          </p>
        </div>
        <button onClick={() => setIsSmartCheckInOpen(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 cursor-pointer">
          <ScanFace size={18} /> Smart Check-In
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard isLoading={isLoading} icon={<ClipboardList />} label="Movement Logs" value={visibleLogs.length} tone="blue" />
        <MetricCard
          isLoading={isLoading}
          icon={<CheckCircle2 />}
          label="Verified Log Records"
          value={`${verifiedVisibleLogs}/${visibleLogs.length}`}
          helper={`${verifiedRate}% verification rate`}
          tone="emerald"
        />
        <MetricCard isLoading={isLoading} icon={<Clock3 />} label="Today's Logs" value={todayVisibleLogs} tone="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoStripCard
          isLoading={isLoading}
          icon={<MapPinned size={18} />}
          title="Tracked Locations"
          value={`${uniqueVisibleLocations}`}
          description={isAdmin ? 'Unique work locations across all visible employee logs.' : 'Unique locations from your personal movement history.'}
        />
        <InfoStripCard
          isLoading={isLoading}
          icon={<Lock size={18} />}
          title="Access Scope"
          value={isAdmin ? `${employees.length} employee profiles` : matchedEmployee ? `${matchedEmployee.first_name} ${matchedEmployee.last_name}` : 'No linked employee'}
          description={isAdmin ? 'Your role can review every employee log entry.' : 'Your account is restricted to your own logs only.'}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, place, or assignment..." className="w-full h-13 pl-12 pr-12 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary" />
          {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 cursor-pointer"><X size={14} /></button>}
        </div>
        <div className="flex w-full md:w-auto gap-3">
          {activeTab === 'history' && (
            <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="date" value={historyDateFilter} onChange={(e) => setHistoryDateFilter(e.target.value)} className="w-full md:w-48 h-13 pl-11 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}
          <button onClick={() => fetchData(true)} disabled={isLoading} className="w-full md:w-auto px-6 h-13 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase flex items-center justify-center gap-2 cursor-pointer">
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} /> Refresh
          </button>
        </div>
      </div>

      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading && <ProgressLoader />}
        <div className="px-4 sm:px-6 pt-5 pb-3 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="inline-flex w-full md:w-auto rounded-2xl bg-gray-100 dark:bg-slate-800 p-1">
            <button onClick={() => setActiveTab('today')} className={cn('flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer', activeTab === 'today' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-gray-500 hover:text-primary')}><Clock3 size={14} /> Today's Logs</button>
            <button onClick={() => setActiveTab('history')} className={cn('flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer', activeTab === 'history' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-gray-500 hover:text-primary')}><Calendar size={14} /> History Logs</button>
          </div>
        </div>

        <div className="hidden md:block max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-[1.05fr_0.95fr_0.85fr_0.75fr_0.7fr_0.95fr] gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 sticky top-0 z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">Employee</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">Location</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">Assignment</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">Date & Time / Status</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">Face Verify</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-300 text-right">Actions</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <EmployeeRowSkeleton key={i} />) : paginatedLogs.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-slate-300">No logs found</p>
              <p className="mt-2 text-xs font-bold text-gray-400 dark:text-slate-500">Try changing search/date filters or refresh the records.</p>
            </div>
          ) : paginatedLogs.map((log: any) => (
            <div key={log.id} className="grid grid-cols-[1.05fr_0.95fr_0.85fr_0.75fr_0.7fr_0.95fr] gap-4 px-6 py-5 hover:bg-gray-50/60 dark:hover:bg-slate-800/30 transition-colors items-start">
              <span className="space-y-1">
                <span className="block text-sm font-black uppercase text-gray-800 dark:text-white">{log.employee?.first_name} {log.employee?.last_name}</span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-primary">{log.employee?.position || 'No position'}</span>
              </span>
              <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300 flex items-start gap-2 line-clamp-2 pr-4">
                <MapPinned size={14} className="shrink-0 mt-0.5 text-blue-500" /> {log.location_name || 'Coordinates Only'}
              </span>
              <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300">{log.assignment}</span>
              <span className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-600 dark:text-slate-300">{formatLogDateTime(log)}</span>
                <span className={cn('inline-flex px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600')}>{log.status}</span>
              </span>
              <span>
                <span className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.face_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                  {log.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {log.face_verified ? `${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                </span>
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                {canViewEmployeeLogDetails && (
                  <button onClick={() => openView(log)} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"><Eye size={12} /> View</button>
                )}
                {canDeleteTechnicianLogs && activeTab === 'today' && (
                  <button onClick={() => handleDeleteLog(log)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer disabled:opacity-50"><Trash2 size={12} /> Delete</button>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="md:hidden p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <EmployeeMobileCardSkeleton key={i} />) : paginatedLogs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 px-4 py-10 text-center">
              <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-slate-300">No logs found</p>
              <p className="mt-2 text-xs font-bold text-gray-400 dark:text-slate-500">Try changing search/date filters or refresh the records.</p>
            </div>
          ) : paginatedLogs.map((log: any) => (
            <div key={log.id} className="rounded-[1.4rem] border border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/30 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase text-gray-800 dark:text-white truncate">{log.employee?.first_name} {log.employee?.last_name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">{log.employee?.position || 'No position'}</p>
                </div>
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0', log.face_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                  {log.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {log.face_verified ? `${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</p>
                  <p className="mt-1 text-[11px] font-bold text-gray-700 dark:text-slate-200">{log.location_name || 'Coordinates Only'}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</p>
                  <p className="mt-1 text-[11px] font-bold text-gray-700 dark:text-slate-200">{formatLogDateTime(log)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                  {log.status}
                </span>
                <div className="flex items-center gap-2">
                  {canViewEmployeeLogDetails && (
                    <button onClick={() => openView(log)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50">
                      <Eye size={12} /> View
                    </button>
                  )}
                  {canDeleteTechnicianLogs && activeTab === 'today' && (
                    <button onClick={() => handleDeleteLog(log)} disabled={isSaving} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 disabled:opacity-50">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && (
          <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/50 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-700 dark:text-slate-300 font-black">{startEntry}</span> to <span className="text-gray-700 dark:text-slate-300 font-black">{endEntry}</span> of <span className="text-primary font-black">{totalEntries}</span> Entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage === 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer active:scale-95"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn('w-8 h-8 rounded-xl text-[11px] font-black transition-all shadow-sm border cursor-pointer active:scale-90', safeCurrentPage === pageNum ? 'bg-primary border-primary text-white scale-105' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-primary/30 hover:text-primary')}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                disabled={safeCurrentPage >= totalPages || totalPages === 0 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 shadow-sm cursor-pointer active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isSmartCheckInOpen && (
        <SmartCheckInModal 
          isOpen={isSmartCheckInOpen} 
          onClose={() => setIsSmartCheckInOpen(false)} 
          visibleEmployees={visibleEmployees} 
          lockedEmployeeId={lockedEmployeeId} 
        />
      )}

      {editingLog && (
        <LogDetailsModal 
          isOpen={!!editingLog} 
          onClose={() => setEditingLog(null)} 
          log={editingLog} 
          historyLogs={historyLogs} 
          isLoadingDetails={isViewingLog} 
        />
      )}
    </div>
  );
}
