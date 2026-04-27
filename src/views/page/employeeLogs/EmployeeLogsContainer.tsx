import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardList,
  MapPinned,
  RefreshCw,
  Search,
  X,
  Loader2,
  Calendar,
  User,
  MapPin,
  ShieldCheck,
  StickyNote,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  Lock,
  Crosshair,
  Map,
  Clock3,
  Building2,
  BriefcaseBusiness,
  LocateFixed,
  FlipHorizontal2,
  Trash2,
  Eye,
} from 'lucide-react';
import axios from '../../../plugin/axios';
import Swal from 'sweetalert2';
import { cn } from '../../../lib/utils';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setTechnicianLogData,
  setTechnicianLogLoading,
  upsertTechnicianLog,
  deleteTechnicianLogRecord,
} from '../../../store/slices/technicianLogSlice';
import { ensureFaceRecognitionReady, verifyFaceMatch } from '../../../lib/faceRecognition';
import {
  EMPLOYEE_LOG_DETAILS_PERMISSION,
  MANAGE_EMPLOYEE_LOGS_PERMISSION,
  VIEW_EMPLOYEE_LOGS_PERMISSION,
  hasPermission,
  isAdminRoleName,
} from '../../../lib/permissions';
import {
  defaultLog,
  formatLogDateTime,
  formatLogTime,
  getCurrentUser,
  getGeoLocation,
  getCameraAccessErrorMessage,
  getApiErrorMessage,
  isMissingEmployeeLogError,
  sanitizeLocationName,
} from './employeeLogsUtils';
import {
  MetricCard,
  InfoStripCard,
  HistoryDetailCard,
  HistoryInfoRow,
  MobileInfoBlock,
  ProgressLoader,
  EmployeeRowSkeleton,
  EmployeeMobileCardSkeleton,
  StyledSelect,
} from './EmployeeLogsComponents';

export default function EmployeeLogsContainer() {
  const dispatch = useAppDispatch();
  const { logs, employees, isLoaded, isLoading } = useAppSelector((state: any) => state.technicianLogs);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isViewingLog, setIsViewingLog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [loadedLogDetailIds, setLoadedLogDetailIds] = useState<number[]>([]);
  const [form, setForm] = useState<any>(defaultLog);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreviewMirrored, setIsPreviewMirrored] = useState(true);

  const [scanStep, setScanStep] = useState<'idle' | 'face' | 'location' | 'saving'>('idle');
  const [faceError, setFaceError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStartTokenRef = useRef(0);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const todayLocal = useMemo(() => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - timezoneOffset).toISOString().split('T')[0];
  }, []);
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
  }, [employees, currentUser]);

  const lockedEmployeeId = !isAdmin && matchedEmployee ? String(matchedEmployee.id) : '';

  const fetchData = async (forceRefresh = false) => {
    if (isLoaded && !forceRefresh) return;
    dispatch(setTechnicianLogLoading(true));
    try {
      const [logsRes, employeesRes] = await Promise.all([
        axios.get('technician-logs'),
        axios.get('employees'),
      ]);
      dispatch(setTechnicianLogData({
        logs: logsRes.data.data || [],
        employees: employeesRes.data.data || [],
      }));
    } catch {
      dispatch(setTechnicianLogLoading(false));
      toast.error('Failed to load employee logs.');
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const selectedEmployee = useMemo(
    () => employees.find((employee: any) => String(employee.id) === String(form.employee_id)) || null,
    [employees, form.employee_id]
  );

  const visibleLogs = useMemo(() => {
    if (isAdmin) return logs;
    if (!matchedEmployee) return [];
    return logs.filter((log: any) => String(log.employee_id) === String(matchedEmployee.id));
  }, [isAdmin, logs, matchedEmployee]);

  const searchedLogs = useMemo(() => {
    const needle = search.toLowerCase();
    return visibleLogs.filter((log: any) =>
      [log.location_name, log.assignment, log.status, log.employee?.first_name, log.employee?.last_name]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [visibleLogs, search]);

  const todaysLogs = useMemo(() => {
    return searchedLogs.filter((log: any) => log.log_date === todayLocal);
  }, [searchedLogs, todayLocal]);

  const historyLogsList = useMemo(() => {
    return searchedLogs.filter((log: any) => log.log_date !== todayLocal);
  }, [searchedLogs, todayLocal]);

  const filteredHistoryLogs = useMemo(() => {
    if (!historyDateFilter) return historyLogsList;
    return historyLogsList.filter((log: any) => log.log_date === historyDateFilter);
  }, [historyDateFilter, historyLogsList]);

  const displayedLogs = activeTab === 'today' ? todaysLogs : filteredHistoryLogs;

  const visibleEmployees = useMemo(() => {
    if (isAdmin) return employees;
    return matchedEmployee ? [matchedEmployee] : [];
  }, [employees, isAdmin, matchedEmployee]);

  const historyLogs = useMemo(() => {
    if (!editingLog?.employee_id) return [];
    return visibleLogs
      .filter((log: any) => log.id !== editingLog.id && String(log.employee_id) === String(editingLog.employee_id))
      .sort((a: any, b: any) => new Date(`${b.log_date}T00:00:00`).getTime() - new Date(`${a.log_date}T00:00:00`).getTime())
      .slice(0, 5);
  }, [editingLog, visibleLogs]);

  const uniqueVisibleLocations = useMemo(() => {
    return new Set(visibleLogs.map((log: any) => log.location_name).filter(Boolean)).size;
  }, [visibleLogs]);

  const todayVisibleLogs = useMemo(() => {
    return visibleLogs.filter((log: any) => log.log_date === todayLocal).length;
  }, [todayLocal, visibleLogs]);

  const stopCamera = () => {
    cameraStartTokenRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      videoRef.current.oncanplay = null;
      videoRef.current.onloadeddata = null;
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsCameraReady(false);
  };

  const waitForVideoElement = async (token: number) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (token !== cameraStartTokenRef.current) return null;
      if (videoRef.current) return videoRef.current;
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }

    return null;
  };

  const openCreate = () => {
    stopCamera();
    setEditingLog(null);
    setFaceError('');
    setScanStep('idle');
    setForm({
      ...defaultLog,
      employee_id: lockedEmployeeId || '',
      assignment: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openView = async (log: any) => {
    stopCamera();
    setEditingLog(log);
    setFaceError('');
    setForm({
      employee_id: log.employee_id?.toString() || lockedEmployeeId || '',
      status: log.status || 'Planned',
      notes: log.notes || '',
    });
    setIsModalOpen(true);

    const hasLoadedDetails =
      loadedLogDetailIds.includes(Number(log.id)) ||
      !!log.verification_photo ||
      !!log.face_verified_at ||
      !!log.created_at ||
      !!log.updated_at;

    if (hasLoadedDetails) return;

    setIsViewingLog(true);
    try {
      const response = await axios.get(`technician-logs/${log.id}`);
      const latestLog = response.data?.data || log;
      setEditingLog(latestLog);
      setForm({
        employee_id: latestLog.employee_id?.toString() || lockedEmployeeId || '',
        status: latestLog.status || 'Planned',
        notes: latestLog.notes || '',
      });
      dispatch(upsertTechnicianLog({ data: latestLog, mode: 'edit' }));
      setLoadedLogDetailIds((prev) =>
        prev.includes(Number(log.id)) ? prev : [...prev, Number(log.id)]
      );
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to load the latest employee log details.'));
    } finally {
      setIsViewingLog(false);
    }
  };

  const startCamera = async () => {
    if (!selectedEmployee?.face_reference_image) {
      toast.error('This technician does not have a registered face reference yet.');
      return;
    }

    try {
      stopCamera();
      setFaceError('');
      setIsCameraReady(false);
      const startToken = cameraStartTokenRef.current + 1;
      cameraStartTokenRef.current = startToken;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (startToken !== cameraStartTokenRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setIsCameraOpen(true);

      const video = await waitForVideoElement(startToken);
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        if (startToken === cameraStartTokenRef.current) {
          setFaceError('Camera started, but the preview element did not load. Please try again.');
        }
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      const markReady = () => {
        if (startToken !== cameraStartTokenRef.current) return;
        if ((video.videoWidth || 0) > 0 && (video.videoHeight || 0) > 0) {
          setIsCameraReady(true);
          setFaceError('');
        }
      };

      video.onloadedmetadata = () => {
        video.play().then(markReady).catch(() => undefined);
      };
      video.oncanplay = markReady;
      video.onloadeddata = markReady;

      try {
        await video.play();
        markReady();
      } catch {
        setFaceError('Camera opened, but the live preview did not start. Tap "Retry Camera" or check if your browser blocked autoplay.');
      }

      ensureFaceRecognitionReady().catch((error) => {
        console.error('Face recognition model load failed:', error);
        setFaceError('Camera is ready, but face verification models failed to load. Please check your internet connection and try again.');
      });
    } catch (error) {
      console.error('Camera access error:', error);
      setFaceError(getCameraAccessErrorMessage(error));
    }
  };

  const handleSmartCheckIn = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedEmployee?.face_reference_image) {
      setFaceError('Camera preview or technician face reference is missing.');
      return;
    }

    if (!isCameraReady || videoRef.current.readyState < 2 || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      setFaceError('Wait for the live camera preview to appear before scanning your face.');
      return;
    }

    setFaceError('');

    try {
      setScanStep('face');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to capture camera frame.');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameCheck = context.getImageData(0, 0, Math.min(canvas.width, 12), Math.min(canvas.height, 12)).data;
      const hasVisiblePixels = frameCheck.some((value, index) => index % 4 !== 3 && value > 12);
      if (!hasVisiblePixels) {
        throw new Error('The camera preview is still blank. Please wait a moment or tap "Retry Camera" before scanning.');
      }

      const capturedPhoto = canvas.toDataURL('image/jpeg', 0.92);
      const verification = await verifyFaceMatch(selectedEmployee.face_reference_image, capturedPhoto);

      if (!verification.isMatch) {
        throw new Error(verification.reason || 'Face verification failed.');
      }

      setScanStep('location');
      const loc = await getGeoLocation();

      setScanStep('saving');
      const payload = {
        employee_id: form.employee_id,
        log_date: new Date().toISOString().split('T')[0],
        location_name: sanitizeLocationName(loc.address),
        latitude: loc.lat.toString(),
        longitude: loc.lng.toString(),
        assignment: form.assignment || 'Routine Field Check-in',
        status: 'In Field',
        notes: form.notes || 'Smart check-in completed securely.',
        face_verified: true,
        face_verified_at: new Date().toISOString(),
        face_match_score: verification.score,
        verification_photo: capturedPhoto,
      };

      const response = await axios.post('technician-logs', payload);
      dispatch(upsertTechnicianLog({ data: response.data.data, mode: 'add' }));

      toast.success('Smart Check-in successful!');
      setIsModalOpen(false);
      stopCamera();
      setScanStep('idle');
    } catch (error: any) {
      setFaceError(getApiErrorMessage(error, 'Check-in failed. Please try again.'));
      setScanStep('idle');
    }
  };

  const handleDeleteLog = async (log: any) => {
    if (!canDeleteTechnicianLogs) return;

    const result = await Swal.fire({
      title: 'Delete Employee Log?',
      text: `This will permanently remove the log for ${log.employee?.first_name || 'this employee'} ${log.employee?.last_name || ''} on ${formatLogDateTime(log)}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsSaving(true);
    try {
      await axios.delete(`technician-logs/${log.id}`);
      dispatch(deleteTechnicianLogRecord(log.id));
      await Swal.fire({
        title: 'Deleted',
        text: 'Employee log deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#16a34a',
      });
      if (editingLog?.id === log.id) setIsModalOpen(false);
    } catch (error: any) {
      if (isMissingEmployeeLogError(error)) {
        dispatch(deleteTechnicianLogRecord(log.id));
        if (editingLog?.id === log.id) setIsModalOpen(false);
        await Swal.fire({
          title: 'Already Deleted',
          text: 'This employee log was already removed from the server. The local list has been refreshed.',
          icon: 'info',
          confirmButtonColor: '#2563eb',
        });
        return;
      }
      Swal.fire({
        title: 'Delete Failed',
        text: getApiErrorMessage(error, 'Failed to delete employee log.'),
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
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
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 cursor-pointer">
          <ScanFace size={18} /> Smart Check-In
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard isLoading={isLoading} icon={<ClipboardList />} label="Movement Logs" value={visibleLogs.length} tone="blue" />
        <MetricCard isLoading={isLoading} icon={<CheckCircle2 />} label="Verified Logs" value={visibleLogs.filter((log: any) => log.face_verified).length} tone="emerald" />
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
              <input
                type="date"
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="w-full md:w-48 h-13 pl-11 pr-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary"
              />
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
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={cn(
                'flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer',
                activeTab === 'today'
                  ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-slate-300 hover:text-primary'
              )}
            >
              <Clock3 size={14} /> Today's Logs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={cn(
                'flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer',
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-slate-300 hover:text-primary'
              )}
            >
              <Calendar size={14} /> History Logs
            </button>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {activeTab === 'today'
              ? `Showing ${todaysLogs.length} log${todaysLogs.length === 1 ? '' : 's'} for today`
              : historyDateFilter
                ? `Showing ${filteredHistoryLogs.length} history log${filteredHistoryLogs.length === 1 ? '' : 's'} for ${historyDateFilter}`
                : `Showing ${filteredHistoryLogs.length} history log${filteredHistoryLogs.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-[1.05fr_0.95fr_0.85fr_0.75fr_0.7fr_0.95fr] gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>Employee</span>
          <span>Location</span>
          <span>Assignment</span>
          <span>Date</span>
          <span>Verification</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="hidden md:block divide-y divide-gray-100 dark:divide-slate-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? Array.from({ length: 6 }).map((_, index) => (
            <EmployeeRowSkeleton key={index} />
          )) : displayedLogs.map((log: any) => (
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
                <span className={cn('inline-flex px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : log.status === 'In Field' ? 'bg-blue-50 text-blue-600' : log.status === 'Deployed' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600')}>
                  {log.status}
                </span>
              </span>
              <span>
                <span className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.face_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                  {log.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {log.face_verified ? `${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                </span>
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                {canViewEmployeeLogDetails && (
                  <button type="button" onClick={() => openView(log)} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                    <Eye size={12} /> View
                  </button>
                )}
                {canDeleteTechnicianLogs && activeTab === 'today' && (
                  <button type="button" onClick={() => handleDeleteLog(log)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer disabled:opacity-50">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {!isLoading && displayedLogs.length === 0 && (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {activeTab === 'today' ? 'No employee logs found for today.' : historyDateFilter ? 'No history logs found for the selected date.' : 'No history logs found.'}
            </div>
          )}
        </div>

        <div className="md:hidden p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? Array.from({ length: 5 }).map((_, index) => (
            <EmployeeMobileCardSkeleton key={index} />
          )) : displayedLogs.map((log: any) => (
            <div key={log.id} className="w-full rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 text-left space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase text-gray-800 dark:text-white wrap-break-word">{log.employee?.first_name} {log.employee?.last_name}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary wrap-break-word">{log.employee?.position || 'No position'}</p>
                </div>
                <span className={cn('shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.face_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                  {log.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {log.face_verified ? `${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <MobileInfoBlock icon={<MapPinned size={14} className="text-blue-500 shrink-0 mt-0.5" />} label="Location" value={log.location_name || 'Coordinates Only'} />
                <MobileInfoBlock icon={<BriefcaseBusiness size={14} className="text-primary shrink-0 mt-0.5" />} label="Assignment" value={log.assignment || 'No assignment'} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</p>
                  <p className="text-[11px] font-bold text-gray-700 dark:text-slate-200">{formatLogDateTime(log)}</p>
                </div>
                <span className={cn('inline-flex px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : log.status === 'In Field' ? 'bg-blue-50 text-blue-600' : log.status === 'Deployed' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600')}>
                  {log.status}
                </span>
              </div>
              <div className="pt-1 flex flex-wrap justify-end gap-2">
                {canViewEmployeeLogDetails && (
                  <button type="button" onClick={() => openView(log)} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                    <Eye size={12} /> View
                  </button>
                )}
                {canDeleteTechnicianLogs && activeTab === 'today' && (
                  <button type="button" onClick={() => handleDeleteLog(log)} disabled={isSaving} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer disabled:opacity-50">
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {!isLoading && displayedLogs.length === 0 && (
            <div className="py-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {activeTab === 'today' ? 'No employee logs found for today.' : historyDateFilter ? 'No history logs found for the selected date.' : 'No history logs found.'}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" onClick={isSaving || scanStep !== 'idle' ? undefined : () => { setIsModalOpen(false); stopCamera(); }} />

          <div className={cn("relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300", editingLog && "max-w-6xl")}>
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-white">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  {editingLog ? <Eye size={20} /> : <Crosshair size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                    {editingLog ? 'Existing Log Details' : 'Smart Field Check-In'}
                  </h2>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">
                    {editingLog ? 'Verified Movement Record Overview' : 'Auto Face & Location Verification'}
                  </p>
                </div>
              </div>
              <button type="button" disabled={isSaving || scanStep !== 'idle'} onClick={() => { setIsModalOpen(false); stopCamera(); }} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 relative">
              {isViewingLog && editingLog && (
                <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] flex items-center justify-center rounded-b-[2.5rem]">
                  <div className="text-center">
                    <Loader2 size={34} className="mx-auto text-primary animate-spin mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Loading Latest Log Details</p>
                    <p className="mt-2 text-[11px] font-bold text-gray-500 dark:text-slate-400">Refreshing Face Verified status and snapshot.</p>
                  </div>
                </div>
              )}

              {editingLog ? (
                <form className="space-y-8">
                  <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="rounded-[2rem] border border-gray-100 dark:border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:p-5">
                      {editingLog.verification_photo ? (
                        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                          <img src={editingLog.verification_photo} alt="Verification snapshot" className="h-112 w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-112 items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 text-center text-white/50">
                          <div>
                            <ScanFace size={34} className="mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-[0.25em]">No Snapshot Available</p>
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className={cn('inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest', editingLog.face_verified ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300')}>
                          {editingLog.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {editingLog.face_verified ? 'Face Verified' : 'Verification Pending'}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/80">
                          <Calendar size={12} /> {formatLogDateTime(editingLog)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/80">
                          <MapPinned size={12} /> {editingLog.location_name || 'Coordinates Only'}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 p-5 sm:p-6 space-y-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Movement Summary</p>
                        <h3 className="mt-2 text-xl font-black tracking-tight text-gray-900 dark:text-white">
                          {`${editingLog.employee?.first_name || ''} ${editingLog.employee?.last_name || ''}`.trim() || 'Unknown Employee'}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                          {editingLog.employee?.position || 'No position'} • {editingLog.employee?.employee_no || 'No employee no.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <HistoryInfoRow label="Match Score" value={editingLog.face_match_score ? `${Number(editingLog.face_match_score).toFixed(0)}%` : 'Not available'} />
                        <HistoryInfoRow label="Current Status" value={editingLog.status || 'Not recorded'} />
                        <HistoryInfoRow label="Assignment" value={editingLog.assignment || 'No assignment'} />
                        <HistoryInfoRow label="Location" value={editingLog.location_name || 'Coordinates only'} />
                      </div>

                      <div className="rounded-3xl border border-primary/10 bg-white dark:bg-slate-900 px-4 py-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logged Location</p>
                        <p className="mt-2 text-sm font-bold text-gray-800 dark:text-white flex items-start gap-2">
                          <MapPinned size={15} className="mt-0.5 text-primary shrink-0" />
                          {editingLog.location_name || 'Coordinates Only'}
                        </p>
                        <p className="mt-3 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                          {editingLog.latitude && editingLog.longitude ? `${Number(editingLog.latitude).toFixed(5)}, ${Number(editingLog.longitude).toFixed(5)}` : 'No coordinates recorded'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <HistoryDetailCard icon={<User size={16} />} label="Employee" value={`${editingLog.employee?.first_name || ''} ${editingLog.employee?.last_name || ''}`.trim() || 'Unknown employee'} helper={editingLog.employee?.employee_no || 'No employee no.'} />
                    <HistoryDetailCard icon={<BriefcaseBusiness size={16} />} label="Position / Role" value={editingLog.employee?.position || 'No position'} helper={editingLog.employee?.department || editingLog.employee?.division || 'No department'} />
                    <HistoryDetailCard icon={<Building2 size={16} />} label="Location" value={editingLog.location_name || 'Coordinates only'} helper={editingLog.employee?.work_location || 'Assigned office not set'} />
                    <HistoryDetailCard icon={<LocateFixed size={16} />} label="Coordinates" value={editingLog.latitude && editingLog.longitude ? `${Number(editingLog.latitude).toFixed(5)}, ${Number(editingLog.longitude).toFixed(5)}` : 'No coordinates'} helper={editingLog.location_name || 'No location name'} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">History Logs</p>
                          <p className="text-sm font-black text-gray-800 dark:text-white">Recent movement records</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {historyLogs.length > 0 ? historyLogs.map((log: any) => (
                          <div key={log.id} className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-black uppercase text-gray-800 dark:text-white line-clamp-1">{log.assignment || 'No assignment'}</p>
                                <p className="mt-1 text-[11px] font-bold text-gray-500 dark:text-slate-400 line-clamp-2">{log.location_name || 'No location recorded'}</p>
                              </div>
                              <span className={cn('shrink-0 inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest', log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : log.status === 'In Field' ? 'bg-blue-50 text-blue-600' : log.status === 'Deployed' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600')}>
                                {log.status}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <span>{formatLogDateTime(log)}</span>
                              <span>{formatLogTime(log)}</span>
                              <span>{log.face_verified ? `Verified ${Number(log.face_match_score || 0).toFixed(0)}%` : 'Verification Pending'}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 px-4 py-6 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                            No other history logs yet for this employee.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 p-5 space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Important Details</p>
                        <p className="mt-1 text-sm font-black text-gray-800 dark:text-white">Verification and audit info</p>
                      </div>
                      <HistoryInfoRow label="Face Verified" value={editingLog.face_verified ? 'Yes' : 'No'} />
                      <HistoryInfoRow label="Match Score" value={editingLog.face_match_score ? `${Number(editingLog.face_match_score).toFixed(0)}%` : 'Not available'} />
                      <HistoryInfoRow label="Verified At" value={editingLog.face_verified_at ? new Date(editingLog.face_verified_at).toLocaleString() : 'Not recorded'} />
                      <HistoryInfoRow label="Created At" value={editingLog.created_at ? new Date(editingLog.created_at).toLocaleString() : 'Not recorded'} />
                      <HistoryInfoRow label="Updated At" value={editingLog.updated_at ? new Date(editingLog.updated_at).toLocaleString() : 'Not recorded'} />
                      <HistoryInfoRow label="Notes" value={editingLog.notes || 'No notes yet'} multiline />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <StyledSelect label="Current Status" value={form.status} onChange={(v) => setForm((p: any) => ({ ...p, status: v }))} options={['Planned', 'Deployed', 'In Field', 'Completed']} icon={<ShieldCheck size={16} />} disabled />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recorded Notes</label>
                      <div className="relative">
                        <StickyNote className="absolute left-4 top-4 text-gray-400" size={16} />
                        <textarea value={form.notes} onChange={(e) => setForm((p: any) => ({ ...p, notes: e.target.value }))} disabled rows={4} className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none resize-none disabled:opacity-80 disabled:cursor-not-allowed" placeholder="No notes recorded." />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8">
                  <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-3xl p-5 flex items-start gap-4">
                      <div className="p-3 bg-amber-500/20 rounded-xl animate-pulse shrink-0"><MapPin size={20} /></div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest">Location Must Be ON</p>
                        <p className="text-[11px] font-bold mt-1.5 opacity-80 leading-relaxed">
                          To successfully check-in, please verify that your device's GPS and Location Services are active. Your location will be automatically scanned along with your face.
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-3xl p-5 flex items-start gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl shrink-0"><ScanFace size={20} /></div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest">Keep Camera Clear</p>
                        <p className="text-[11px] font-bold mt-1.5 opacity-80 leading-relaxed">
                          Make sure your face is bright, centered, and clearly visible. Avoid dark backgrounds, blur, or camera obstruction before tapping scan.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <StyledSelect
                        label="Check-In As"
                        value={form.employee_id}
                        onChange={(value) => { setForm((prev: any) => ({ ...prev, employee_id: value })); stopCamera(); }}
                        disabled={!!lockedEmployeeId || scanStep !== 'idle'}
                        options={[
                          { value: '', label: 'Select your profile' },
                          ...visibleEmployees.map((employee: any) => ({
                            value: employee.id.toString(),
                            label: `${employee.first_name} ${employee.last_name} - ${employee.position}`,
                          })),
                        ]}
                        icon={lockedEmployeeId ? <Lock size={16} /> : <User size={16} />}
                      />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Task / Assignment (Optional)</label>
                        <input value={form.assignment} onChange={(e) => setForm((prev: any) => ({ ...prev, assignment: e.target.value }))} placeholder="e.g. Area Inspection" disabled={scanStep !== 'idle'} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quick Note (Optional)</label>
                        <textarea value={form.notes} onChange={(e) => setForm((prev: any) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Any specific details..." disabled={scanStep !== 'idle'} className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none resize-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-3xl bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 p-2 relative overflow-hidden">
                    <div className="flex-1 bg-black rounded-[1.5rem] relative overflow-hidden min-h-87.5 shadow-inner flex items-center justify-center">
                      {isCameraOpen ? (
                        <>
                          <video ref={videoRef} className={cn('w-full h-full object-cover transition-opacity duration-300', isCameraReady ? 'opacity-100' : 'opacity-40', isPreviewMirrored && '-scale-x-100')} autoPlay muted playsInline />
                          <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div className="w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl opacity-70" />
                              <div className="w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl opacity-70" />
                            </div>
                            <div className="flex justify-between">
                              <div className="w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl opacity-70" />
                              <div className="w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl opacity-70" />
                            </div>
                          </div>

                          {!isCameraReady && scanStep === 'idle' && (
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center px-6">
                              <div className="text-center">
                                <Loader2 size={36} className="mx-auto text-white animate-spin mb-4" />
                                <p className="text-white text-[10px] font-black uppercase tracking-[0.28em]">Starting Camera Preview</p>
                                <p className="mt-2 text-white/75 text-[11px] font-bold">Please wait until your face appears clearly before scanning.</p>
                              </div>
                            </div>
                          )}

                          <div className="absolute top-4 right-4 z-10">
                            <button type="button" onClick={() => setIsPreviewMirrored((prev) => !prev)} disabled={scanStep !== 'idle'} className="inline-flex items-center gap-2 rounded-2xl bg-black/45 px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md cursor-pointer disabled:opacity-50">
                              <FlipHorizontal2 size={14} /> {isPreviewMirrored ? 'Unmirror' : 'Mirror'}
                            </button>
                          </div>

                          {scanStep !== 'idle' && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center flex-col gap-4">
                              <Loader2 size={48} className="text-white animate-spin drop-shadow-lg" />
                              <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-md">
                                <p className="text-white text-xs font-black uppercase tracking-widest animate-pulse">
                                  {scanStep === 'face' ? '1. Analyzing Face...' : scanStep === 'location' ? '2. Grabbing Coordinates...' : '3. Finalizing Check-in...'}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center px-6 py-12">
                          <ScanFace size={50} className="mx-auto text-white/20 mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-6">Scanner Inactive</p>
                          <button type="button" onClick={startCamera} disabled={!form.employee_id} className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest cursor-pointer transition-colors backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed">
                            Turn On Camera
                          </button>
                          {!form.employee_id && <p className="text-[10px] text-rose-400 mt-4 font-bold">Select profile first</p>}
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5">
                      {faceError && (
                        <div className="mb-4 rounded-2xl px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-bold flex items-center gap-2">
                          <AlertCircle size={14} className="shrink-0" /> {faceError}
                        </div>
                      )}
                      {isCameraOpen && !isCameraReady && (
                        <button type="button" onClick={startCamera} disabled={scanStep !== 'idle'} className="mb-4 w-full py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50">
                          Retry Camera
                        </button>
                      )}
                      {isCameraOpen && isCameraReady && (
                        <div className="mb-4 rounded-2xl px-4 py-3 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold flex items-start gap-2">
                          <ScanFace size={14} className="shrink-0 mt-0.5" />
                          Make sure the camera is clear and your face is centered before tapping scan.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleSmartCheckIn}
                        disabled={!isCameraOpen || !isCameraReady || scanStep !== 'idle'}
                        className={cn(
                          'w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-[0.98]',
                          isCameraOpen && isCameraReady ? 'bg-primary text-white shadow-primary/30 hover:opacity-90' : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed shadow-none',
                          scanStep !== 'idle' && 'opacity-70 cursor-wait'
                        )}
                      >
                        {scanStep !== 'idle' ? <Loader2 size={18} className="animate-spin" /> : <Map size={18} />}
                        {scanStep !== 'idle' ? 'Processing...' : !isCameraOpen ? 'Scan & Check-In' : isCameraReady ? 'Scan & Check-In' : 'Waiting For Preview'}
                      </button>
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button type="button" disabled={isSaving || scanStep !== 'idle'} onClick={() => { setIsModalOpen(false); stopCamera(); }} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
              {editingLog && canDeleteTechnicianLogs && (
                <button type="button" onClick={() => handleDeleteLog(editingLog)} disabled={isSaving} className={cn('px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all cursor-pointer hover:bg-rose-100', isSaving && 'opacity-50 cursor-not-allowed')}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Log
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
