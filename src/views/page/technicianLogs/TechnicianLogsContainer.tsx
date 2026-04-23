import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardList,
  MapPinned,
  RefreshCw,
  Search,
  X,
  Save,
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
import { isAdminRoleName } from '../../../lib/permissions';

const defaultLog = {
  employee_id: '',
  assignment: '',
  notes: '',
  status: 'In Field',
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || '{}');
  } catch {
    return {};
  }
};

const getGeoLocation = (): Promise<{ lat: number; lng: number; address: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (!res.ok) throw new Error('Network response not ok');
          const data = await res.json();
          resolve({ lat, lng, address: data.display_name || `Coordinates: ${lat}, ${lng}` });
        } catch (err) {
          resolve({ lat, lng, address: `Coordinates: ${lat}, ${lng}` });
        }
      },
      (error) => {
        console.error('Geolocation Error:', error);
        reject(new Error('Please enable your device Location/GPS services to check in.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

const getCameraAccessErrorMessage = (error: unknown) => {
  const mediaError = error as DOMException | undefined;
  const pageHost = window.location.hostname;

  if (!window.isSecureContext) {
    return pageHost === 'localhost' || pageHost === '127.0.0.1'
      ? 'Camera access needs a secure browser session. Please reopen this page directly in your local browser tab.'
      : 'Camera access on phone requires HTTPS or a secure browser origin. Please open this system using HTTPS instead of plain HTTP.';
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return 'This browser does not support camera access for face verification.';
  }

  switch (mediaError?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera permission was denied. Please allow camera access in your browser settings, then try again.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera was detected on this device.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The camera is currently being used by another app. Please close the other app and try again.';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'This device could not start the selected camera mode. Please try again.';
    case 'AbortError':
      return 'The camera request was interrupted. Please try again.';
    default:
      return mediaError?.message || 'Unable to start the camera on this device.';
  }
};

const getApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  const fieldErrors = data?.errors;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstEntry = Object.values(fieldErrors).find((value) => Array.isArray(value) && value.length > 0) as string[] | undefined;
    if (firstEntry?.[0]) {
      return firstEntry[0];
    }
  }

  return error?.message || fallback;
};

const sanitizeLocationName = (locationName: string) => {
  const normalized = String(locationName || '').trim().replace(/\s+/g, ' ');
  return normalized.length > 255 ? `${normalized.slice(0, 252)}...` : normalized;
};

export default function TechnicianLogsContainer() {
  const dispatch = useAppDispatch();
  const { logs, employees, isLoaded, isLoading } = useAppSelector((state: any) => state.technicianLogs);

  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [form, setForm] = useState<any>(defaultLog);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreviewMirrored, setIsPreviewMirrored] = useState(true);
  
  // Smart Scanner States
  const [scanStep, setScanStep] = useState<'idle' | 'face' | 'location' | 'saving'>('idle');
  const[faceError, setFaceError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentUser = useMemo(() => getCurrentUser(),[]);
  const isAdmin = isAdminRoleName(currentUser?.role?.name);

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
    return () => {
      stopCamera();
    };
  },[]);

  const selectedEmployee = useMemo(
    () => employees.find((employee: any) => String(employee.id) === String(form.employee_id)) || null,
    [employees, form.employee_id]
  );

  const visibleLogs = useMemo(() => {
    if (isAdmin) return logs;
    if (!matchedEmployee) return [];
    return logs.filter((log: any) => String(log.employee_id) === String(matchedEmployee.id));
  }, [isAdmin, logs, matchedEmployee]);

  const filteredLogs = useMemo(() => {
    const needle = search.toLowerCase();
    return visibleLogs.filter((log: any) =>[
        log.location_name,
        log.assignment,
        log.status,
        log.employee?.first_name,
        log.employee?.last_name,
      ].join(' ').toLowerCase().includes(needle)
    );
  }, [visibleLogs, search]);

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
    const today = new Date().toISOString().split('T')[0];
    return visibleLogs.filter((log: any) => log.log_date === today).length;
  }, [visibleLogs]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsCameraReady(false);
  };

  const openCreate = () => {
    stopCamera();
    setEditingLog(null);
    setFaceError('');
    setScanStep('idle');
    setForm({
      ...defaultLog,
      employee_id: lockedEmployeeId || '',
      assignment: '', // Optional user input
      notes: '',      // Optional user input
    });
    setIsModalOpen(true);
  };

  const openEdit = (log: any) => {
    stopCamera();
    setEditingLog(log);
    setFaceError('');
    setForm({
      employee_id: log.employee_id?.toString() || lockedEmployeeId || '',
      status: log.status || 'Planned',
      notes: log.notes || '',
    });
    setIsModalOpen(true);
  };

  const startCamera = async () => {
    if (!selectedEmployee?.face_reference_image) {
      toast.error('This technician does not have a registered face reference yet.');
      return;
    }

    try {
      setFaceError('');
      setIsCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(async () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');

        const markReady = () => {
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
      }, 0);

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
      // Step 1: Analyze Face
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

      // Step 2: Fetch GPS Location
      setScanStep('location');
      const loc = await getGeoLocation();

      // Step 3: Auto-Save
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

  // Only used for updating the status/notes of an existing log
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    setIsSaving(true);
    try {
      const response = await axios.put(`technician-logs/${editingLog.id}`, {
        status: form.status,
        notes: form.notes,
      });
      dispatch(upsertTechnicianLog({ data: response.data.data, mode: 'edit' }));
      toast.success('Employee log updated.');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLog = async (log: any) => {
    if (!isAdmin) return;

    const result = await Swal.fire({
      title: 'Delete Employee Log?',
      text: `This will permanently remove the log for ${log.employee?.first_name || 'this employee'} ${log.employee?.last_name || ''} on ${log.log_date}.`,
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
      if (editingLog?.id === log.id) {
        setIsModalOpen(false);
      }
    } catch (error: any) {
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
        <button onClick={() => fetchData(true)} disabled={isLoading} className="w-full md:w-auto px-6 h-13 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-[10px] font-black uppercase flex items-center justify-center gap-2 cursor-pointer">
          <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading && <ProgressLoader />}
        <div className="hidden md:grid grid-cols-[1.1fr_1fr_0.9fr_0.9fr_0.8fr] gap-4 px-6 py-4 border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>Employee</span>
          <span>Location</span>
          <span>Assignment</span>
          <span>Date</span>
          <span className="text-right">Verification</span>
        </div>
        <div className="hidden md:block divide-y divide-gray-100 dark:divide-slate-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? Array.from({ length: 6 }).map((_, index) => (
            <TechnicianRowSkeleton key={index} />
          )) : filteredLogs.map((log: any) => (
            <div key={log.id} className="grid grid-cols-[1.1fr_1fr_0.9fr_0.9fr_0.8fr] gap-4 px-6 py-5 hover:bg-gray-50/60 dark:hover:bg-slate-800/30 transition-colors">
              <button onClick={() => openEdit(log)} className="contents text-left cursor-pointer">
              <span className="space-y-1">
                <span className="block text-sm font-black uppercase text-gray-800 dark:text-white">{log.employee?.first_name} {log.employee?.last_name}</span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-primary">{log.employee?.position || 'No position'}</span>
              </span>
              <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300 flex items-start gap-2 line-clamp-2 pr-4">
                <MapPinned size={14} className="shrink-0 mt-0.5 text-blue-500" /> {log.location_name || 'Coordinates Only'}
              </span>
              <span className="text-[11px] font-bold text-gray-600 dark:text-slate-300">{log.assignment}</span>
              <span className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-600 dark:text-slate-300">{log.log_date}</span>
                <span className={cn('inline-flex px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : log.status === 'In Field' ? 'bg-blue-50 text-blue-600' : log.status === 'Deployed' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600')}>
                  {log.status}
                </span>
              </span>
              <span className="text-right">
                <span className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.face_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                  {log.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {log.face_verified ? `${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                </span>
              </span>
              </button>
              {isAdmin && (
                <div className="col-span-full flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {!isLoading && filteredLogs.length === 0 && (
            <div className="p-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">No employee logs found.</div>
          )}
        </div>

        <div className="md:hidden p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? Array.from({ length: 5 }).map((_, index) => (
            <TechnicianMobileCardSkeleton key={index} />
          )) : filteredLogs.map((log: any) => (
            <button
              key={log.id}
              onClick={() => openEdit(log)}
              className="w-full rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 text-left space-y-4 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase text-gray-800 dark:text-white wrap-break-word">
                    {log.employee?.first_name} {log.employee?.last_name}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary wrap-break-word">
                    {log.employee?.position || 'No position'}
                  </p>
                </div>
                <span className={cn('shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.face_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                  {log.face_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {log.face_verified ? `${Number(log.face_match_score || 0).toFixed(0)}%` : 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <MobileInfoBlock
                  icon={<MapPinned size={14} className="text-blue-500 shrink-0 mt-0.5" />}
                  label="Location"
                  value={log.location_name || 'Coordinates Only'}
                />
                <MobileInfoBlock
                  icon={<BriefcaseBusiness size={14} className="text-primary shrink-0 mt-0.5" />}
                  label="Assignment"
                  value={log.assignment || 'No assignment'}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</p>
                  <p className="text-[11px] font-bold text-gray-700 dark:text-slate-200">{log.log_date}</p>
                </div>
                <span className={cn('inline-flex px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest', log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : log.status === 'In Field' ? 'bg-blue-50 text-blue-600' : log.status === 'Deployed' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600')}>
                  {log.status}
                </span>
              </div>
              {isAdmin && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteLog(log);
                    }}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              )}
            </button>
          ))}

          {!isLoading && filteredLogs.length === 0 && (
            <div className="py-12 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">No employee logs found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" onClick={isSaving || scanStep !== 'idle' ? undefined : () => { setIsModalOpen(false); stopCamera(); }} />

          <div className={cn("relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300", editingLog && "max-w-2xl")}>
            <div className="bg-primary p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-white">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  {editingLog ? <ShieldCheck size={20} /> : <Crosshair size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight leading-none">
                    {editingLog ? 'Update Existing Log' : 'Smart Field Check-In'}
                  </h2>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">
                    {editingLog ? 'Modify Status or Notes' : 'Auto Face & Location Verification'}
                  </p>
                </div>
              </div>
              <button type="button" disabled={isSaving || scanStep !== 'idle'} onClick={() => { setIsModalOpen(false); stopCamera(); }} className="p-2 hover:bg-white/10 rounded-2xl text-white cursor-pointer transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
              
              {/* --- EDIT EXISTING LOG --- */}
              {editingLog ? (
                <form id="edit-form" onSubmit={handleEditSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-gray-100 dark:border-slate-800">
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged Location</p>
                       <p className="text-xs font-bold text-gray-800 dark:text-white flex items-start gap-2">
                         <MapPinned size={14} className="mt-0.5 text-primary shrink-0" /> {editingLog.location_name}
                       </p>
                     </div>
                     <div className="space-y-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Match</p>
                       <p className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
                         <Calendar size={14} className="text-primary" /> {editingLog.log_date}
                         <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg ml-2">{editingLog.face_match_score}% Match</span>
                       </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <HistoryDetailCard icon={<User size={16} />} label="Employee" value={`${editingLog.employee?.first_name || ''} ${editingLog.employee?.last_name || ''}`.trim() || 'Unknown employee'} helper={editingLog.employee?.employee_no || 'No employee no.'} />
                    <HistoryDetailCard icon={<BriefcaseBusiness size={16} />} label="Position / Role" value={editingLog.employee?.position || 'No position'} helper={editingLog.employee?.department || editingLog.employee?.division || 'No department'} />
                    <HistoryDetailCard icon={<Building2 size={16} />} label="Work Location" value={editingLog.employee?.work_location || 'No work location'} helper={editingLog.assignment || 'No assignment'} />
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
                              <span>{log.log_date}</span>
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

                      {editingLog.verification_photo && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verification Snapshot</p>
                          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-black">
                            <img src={editingLog.verification_photo} alt="Verification snapshot" className="h-44 w-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <StyledSelect label="Current Status" value={form.status} onChange={(v) => setForm((p: any) => ({ ...p, status: v }))} options={['Planned', 'Deployed', 'In Field', 'Completed']} icon={<ShieldCheck size={16} />} />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supervisor Notes</label>
                      <div className="relative">
                        <StickyNote className="absolute left-4 top-4 text-gray-400" size={16} />
                        <textarea value={form.notes} onChange={(e) => setForm((p: any) => ({ ...p, notes: e.target.value }))} rows={4} className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none resize-none" placeholder="Add updates or remarks..." />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (

              /* --- CREATE NEW SMART LOG --- */
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8">
                  {/* Left panel: Info & Preferences */}
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

                  {/* Right panel: The Scanner */}
                  <div className="flex flex-col rounded-3xl bg-gray-50 dark:bg-slate-800/30 border border-gray-200 dark:border-slate-700 p-2 relative overflow-hidden">
                    
                    <div className="flex-1 bg-black rounded-[1.5rem] relative overflow-hidden min-h-87.5 shadow-inner flex items-center justify-center">
                      {isCameraOpen ? (
                        <>
                          <video ref={videoRef} className={cn('w-full h-full object-cover transition-opacity duration-300', isCameraReady ? 'opacity-100' : 'opacity-40', isPreviewMirrored && '-scale-x-100')} autoPlay muted playsInline />
                          {/* Futurist Scanner Overlay */}
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
                            <button
                              type="button"
                              onClick={() => setIsPreviewMirrored((prev) => !prev)}
                              disabled={scanStep !== 'idle'}
                              className="inline-flex items-center gap-2 rounded-2xl bg-black/45 px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md cursor-pointer disabled:opacity-50"
                            >
                              <FlipHorizontal2 size={14} />
                              {isPreviewMirrored ? 'Unmirror' : 'Mirror'}
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
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={scanStep !== 'idle'}
                          className="mb-4 w-full py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50"
                        >
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

            {/* Modal Footer (Cancel / Save buttons) */}
            <div className="p-6 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button type="button" disabled={isSaving || scanStep !== 'idle'} onClick={() => { setIsModalOpen(false); stopCamera(); }} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Cancel</button>
              
              {editingLog && (
                <>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(editingLog)}
                      disabled={isSaving}
                      className={cn('px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all cursor-pointer hover:bg-rose-100', isSaving && 'opacity-50 cursor-not-allowed')}
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      Delete Log
                    </button>
                  )}
                  <button type="submit" form="edit-form" disabled={isSaving} className={cn('px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95', isSaving && 'opacity-50 cursor-not-allowed')}>
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, tone, isLoading }: any) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 min-h-28 overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {isLoading ? (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse shrink-0" />
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-24" />
            <div className="h-7 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-16" />
          </div>
        </>
      ) : (
        <>
          <div className={cn('p-4 rounded-2xl', tones[tone] || tones.blue)}>{icon}</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
          </div>
        </>
      )}
    </div>
  );
}

function InfoStripCard({ icon, title, value, description, isLoading }: any) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 shadow-sm">
      {isLoading && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10 overflow-hidden z-30">
          <div className="w-full h-[35%] bg-primary/70 rounded-full animate-progress-slide-dashboard" />
        </div>
      )}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 w-10 rounded-2xl bg-gray-200 dark:bg-slate-800" />
          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-6 w-40 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
            <p className="mt-1 text-lg font-black text-gray-800 dark:text-white wrap-break-word">{value}</p>
            <p className="mt-2 text-[11px] font-bold text-gray-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryDetailCard({ icon, label, value, helper }: any) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 px-4 py-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      </div>
      <p className="mt-3 text-sm font-black text-gray-800 dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold text-gray-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

function HistoryInfoRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3', multiline && 'items-start')}>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className={cn('mt-2 text-xs font-bold text-gray-700 dark:text-slate-200', multiline && 'leading-relaxed')}>{value}</p>
    </div>
  );
}

function MobileInfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
          <p className="mt-1 text-[11px] font-bold text-gray-700 dark:text-slate-200 wrap-break-word">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ProgressLoader() {
  return (
    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden z-30">
      <div className="h-full bg-primary w-[40%] animate-progress-loop" />
    </div>
  );
}

function TechnicianRowSkeleton() {
  return (
    <div className="grid grid-cols-[1.1fr_1fr_0.9fr_0.9fr_0.8fr] gap-4 px-6 py-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-36 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded self-center" />
      <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded self-center" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="flex justify-end">
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

function TechnicianMobileCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-4 animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="h-4 w-36 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-16 w-full bg-gray-200 dark:bg-slate-700 rounded-2xl" />
        <div className="h-16 w-full bg-gray-200 dark:bg-slate-700 rounded-2xl" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

function StyledSelect({ label, value, onChange, options, icon, disabled }: { label: string; value: string; onChange: (value: string) => void; options: Array<string | { value: string; label: string }>; icon?: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4 text-gray-400 z-10">{icon}</div>}
        <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className={cn('w-full py-4 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none', icon ? 'pl-11 pr-4' : 'px-4', disabled && 'opacity-70 cursor-not-allowed')}>
          {options.map((option) => {
            if (typeof option === 'string') return <option key={option} value={option}>{option}</option>;
            return <option key={option.value} value={option.value}>{option.label}</option>;
          })}
        </select>
      </div>
    </div>
  );
}
