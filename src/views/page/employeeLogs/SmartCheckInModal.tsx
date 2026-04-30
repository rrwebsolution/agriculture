import { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, X, MapPin, ScanFace, Lock, User, FlipHorizontal2, Map, Loader2, AlertCircle, Upload, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import axios from '../../../plugin/axios';
import { toast } from 'react-toastify';
import { cn } from '../../../lib/utils';
import { useAppDispatch } from '../../../store/hooks';
import { upsertTechnicianLog } from '../../../store/slices/technicianLogSlice';
import { ensureFaceRecognitionReady, verifyFaceMatch } from '../../../lib/faceRecognition';
import { defaultLog, getGeoLocation, getCameraAccessErrorMessage, getApiErrorMessage, sanitizeLocationName, queueOfflineSmartCheckIn, getLocationFromPhotoExif, getPhotoDateTimeFromExif, isLikelyNetworkError } from './employeeLogsUtils';
import { StyledSelect } from './EmployeeLogsComponents';
import * as faceapi from 'face-api.js';

interface SmartCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleEmployees: any[];
  lockedEmployeeId: string;
}

export default function SmartCheckInModal({ isOpen, onClose, visibleEmployees, lockedEmployeeId }: SmartCheckInModalProps) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<any>({ ...defaultLog, employee_id: lockedEmployeeId || '', assignment: '', notes: '' });
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const[isPreviewMirrored, setIsPreviewMirrored] = useState(true);
  const [scanStep, setScanStep] = useState<'idle' | 'face' | 'location' | 'saving'>('idle');
  const[faceError, setFaceError] = useState<string>('');
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const [uploadedPhotoLocation, setUploadedPhotoLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [uploadedPhotoTakenAt, setUploadedPhotoTakenAt] = useState<Date | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStartTokenRef = useRef(0);

  const selectedEmployee = useMemo(() => visibleEmployees.find((emp: any) => String(emp.id) === String(form.employee_id)) || null, [visibleEmployees, form.employee_id]);

  const toSquareSelfie = async (imageDataUrl: string) => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Unable to process uploaded image.'));
      img.src = imageDataUrl;
    });

    let sx = 0;
    let sy = 0;
    let size = Math.min(image.width, image.height);

    try {
      await ensureFaceRecognitionReady();
      const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }));

      if (detection?.box) {
        const box = detection.box;
        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;
        const paddedFaceSize = Math.max(box.width, box.height) * 2.1;

        size = Math.min(
          Math.max(paddedFaceSize, box.width * 1.6),
          image.width,
          image.height
        );
        sx = Math.max(0, Math.min(image.width - size, faceCenterX - size / 2));
        sy = Math.max(0, Math.min(image.height - size, faceCenterY - size / 2));
      } else {
        sx = (image.width - size) / 2;
        sy = (image.height - size) / 2;
      }
    } catch {
      sx = (image.width - size) / 2;
      sy = (image.height - size) / 2;
    }

    const outputSize = 640;

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to process uploaded image.');

    ctx.drawImage(image, sx, sy, size, size, 0, 0, outputSize, outputSize);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const getFaceGuidanceMessage = (error: any) => {
    const rawMessage = String(error?.message || '').toLowerCase();
    if (rawMessage.includes('quota')) {
      return 'Photo is too large to save offline. Please retake closer to camera and keep only your face in frame (2x2 style).';
    }
    if (rawMessage.includes('no recognizable face')) {
      return 'Please move closer to the camera and capture a 2x2-style face photo only. Do not include hands or body.';
    }
    return getApiErrorMessage(error, 'Check-in failed.');
  };

  const stopCamera = () => {
    cameraStartTokenRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsCameraReady(false);
  };

  useEffect(() => {
    return () => stopCamera();
  },[]);

  const handleClose = () => {
    if (scanStep !== 'idle') return;
    stopCamera();
    setUploadedPhoto('');
    setUploadedPhotoLocation(null);
    setUploadedPhotoTakenAt(null);
    setFaceError('');
    onClose();
  };

  const startCamera = async () => {
    if (!selectedEmployee?.face_reference_image) {
      toast.error('This technician does not have a registered face reference yet.');
      return;
    }
    try {
      stopCamera();
      setUploadedPhoto('');
      setUploadedPhotoLocation(null);
      setUploadedPhotoTakenAt(null);
      setFaceError('');
      setIsCameraReady(false);
      const startToken = cameraStartTokenRef.current + 1;
      cameraStartTokenRef.current = startToken;

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (startToken !== cameraStartTokenRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }

      streamRef.current = stream;
      setIsCameraOpen(true);

      // Wait for the modal to render the <video> element before attaching stream.
      let video = videoRef.current;
      if (!video) {
        for (let i = 0; i < 10; i += 1) {
          await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
          video = videoRef.current;
          if (video) break;
        }
      }
      if (!video) throw new Error('Unable to initialize camera preview element.');

      video.srcObject = stream;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      const markReady = () => { if (video.videoWidth > 0) setIsCameraReady(true); };
      video.onloadedmetadata = () => video.play().then(markReady).catch(() => {});
      video.oncanplay = markReady;
      video.onloadeddata = markReady;

      ensureFaceRecognitionReady().catch(() => setFaceError('Failed to load face verification models. Check internet connection.'));
    } catch (error) {
      setFaceError(getCameraAccessErrorMessage(error));
    }
  };

  const handleUploadSelfie = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFaceError('Please upload a valid image file.');
      return;
    }

    try {
      const fileAsDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read uploaded image.'));
        reader.readAsDataURL(file);
      });

      const photoLocation = await getLocationFromPhotoExif(file);
      const photoTakenAt = await getPhotoDateTimeFromExif(file);
      if (!photoLocation) {
        setUploadedPhoto('');
        setUploadedPhotoLocation(null);
        setUploadedPhotoTakenAt(null);
        setFaceError('This photo has no GPS location metadata. Enable camera location tag and take the selfie again.');
        return;
      }

      stopCamera();
      setFaceError('');
      const squareSelfie = await toSquareSelfie(fileAsDataUrl);
      setUploadedPhoto(squareSelfie);
      setUploadedPhotoLocation(photoLocation);
      setUploadedPhotoTakenAt(photoTakenAt);
    } catch (error: any) {
      setFaceError(error?.message || 'Failed to load uploaded selfie.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSmartCheckIn = async () => {
    if (!selectedEmployee?.face_reference_image) return;
    try {
      let capturedPhoto = uploadedPhoto;
      if (!capturedPhoto) {
        if (!videoRef.current || !canvasRef.current) throw new Error('Camera preview is not ready yet.');
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Cannot capture camera frame.');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        capturedPhoto = canvas.toDataURL('image/jpeg', 0.92);
      }

      setScanStep('face');
      const verification = await verifyFaceMatch(selectedEmployee.face_reference_image, capturedPhoto);
      if (!verification.isMatch) throw new Error(verification.reason || 'Face verification failed.');

      setScanStep('location');
      const loc = uploadedPhoto ? uploadedPhotoLocation : await getGeoLocation();
      if (!loc) {
        throw new Error('Unable to get location from uploaded photo metadata.');
      }

      setScanStep('saving');
      const capturedAt = uploadedPhoto ? (uploadedPhotoTakenAt || new Date()) : new Date();
      const payload = {
        employee_id: form.employee_id,
        log_date: capturedAt.toISOString().split('T')[0],
        location_name: sanitizeLocationName(loc.address),
        latitude: loc.lat.toString(),
        longitude: loc.lng.toString(),
        assignment: form.assignment || 'Routine Field Check-in',
        status: 'In Field',
        notes: form.notes || 'Smart check-in completed securely.',
        face_verified: true,
        face_verified_at: capturedAt.toISOString(),
        face_match_score: verification.score,
        verification_photo: capturedPhoto,
      };

      if (!navigator.onLine) {
        queueOfflineSmartCheckIn(payload);
        toast.info('No internet connection. Check-in saved offline and will sync automatically once online.');
        handleClose();
        return;
      }

      try {
        const res = await axios.post('technician-logs', payload);
        dispatch(upsertTechnicianLog({ data: res.data.data, mode: 'add' }));
        toast.success('Smart Check-in successful!');
        handleClose();
      } catch (postError: any) {
        if (isLikelyNetworkError(postError)) {
          queueOfflineSmartCheckIn(payload);
          toast.info('Unstable network detected. Check-in saved offline and will sync once connection is stable.');
          handleClose();
          return;
        }
        throw postError;
      }
    } catch (error: any) {
      setFaceError(getFaceGuidanceMessage(error));
      setScanStep('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in" onClick={handleClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-slate-800">
        <div className="bg-primary p-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center"><Crosshair size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase">Smart Field Check-In</h2>
              <p className="text-[10px] text-white/70 font-bold uppercase mt-1">Auto Face & Location Verification</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={scanStep !== 'idle'} className="p-2 hover:bg-white/10 rounded-2xl text-white disabled:opacity-50"><X size={20} /></button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8">
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-3xl p-5 flex gap-4">
              <MapPin size={20} className="shrink-0 animate-pulse mt-1" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Location Must Be ON</p>
                <p className="text-[11px] font-bold mt-1.5 opacity-80">Verify your device GPS is active. Location gets automatically scanned.</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-3xl p-5 flex gap-4">
              <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Face Capture Guide</p>
                <p className="text-[11px] font-bold mt-1.5 opacity-90">
                  Keep your face centered and look straight at the camera. Do not look down or tilt your head upward. Make sure your face is clear and well-lit.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Good
                    </p>
                    <p className="text-[10px] font-bold text-emerald-700 mt-1">Face centered, eyes forward, neutral head position, good lighting.</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 flex items-center gap-1.5">
                      <XCircle size={12} /> Avoid
                    </p>
                    <p className="text-[10px] font-bold text-rose-700 mt-1">Looking down/up, side angle, blurred face, dark or backlit selfie.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <StyledSelect
                label="Check-In As"
                value={form.employee_id}
                onChange={(val) => { setForm({ ...form, employee_id: val }); stopCamera(); }}
                disabled={!!lockedEmployeeId || scanStep !== 'idle'}
                options={[{ value: '', label: 'Select profile' }, ...visibleEmployees.map((e: any) => ({ value: e.id.toString(), label: `${e.first_name} ${e.last_name}` }))]}
                icon={lockedEmployeeId ? <Lock size={16} /> : <User size={16} />}
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assignment</label>
                <input value={form.assignment} onChange={(e) => setForm({ ...form, assignment: e.target.value })} placeholder="e.g. Area Inspection" disabled={scanStep !== 'idle'} className="w-full px-4 py-4 bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-2xl text-sm font-bold" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadSelfie} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!form.employee_id || scanStep !== 'idle'}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload size={14} /> Upload Offline Selfie
              </button>
            </div>
          </div>

          <div className="flex flex-col rounded-3xl bg-gray-50 dark:bg-slate-800/30 border border-gray-200 p-2 relative">
            <div className="flex-1 bg-black rounded-[1.5rem] relative overflow-hidden min-h-87.5 flex items-center justify-center">
              {isCameraOpen ? (
                <>
                  <video ref={videoRef} className={cn('w-full h-full object-cover transition-opacity duration-300', isCameraReady ? 'opacity-100' : 'opacity-40', isPreviewMirrored && '-scale-x-100')} autoPlay muted playsInline />
                  <div className="absolute top-4 right-4 z-10">
                    <button onClick={() => setIsPreviewMirrored(!isPreviewMirrored)} disabled={scanStep !== 'idle'} className="flex gap-2 rounded-2xl bg-black/45 px-4 py-2 text-white text-[10px] font-black uppercase backdrop-blur-md disabled:opacity-50">
                      <FlipHorizontal2 size={14} /> Mirror
                    </button>
                  </div>
                  {scanStep !== 'idle' && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center flex-col gap-4">
                      <Loader2 size={48} className="text-white animate-spin drop-shadow-lg" />
                      <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-md">
                        <p className="text-white text-xs font-black uppercase animate-pulse">
                          {scanStep === 'face' ? '1. Analyzing Face...' : scanStep === 'location' ? '2. Grabbing Coordinates...' : '3. Finalizing Check-in...'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : uploadedPhoto ? (
                <>
                  <img src={uploadedPhoto} alt="Uploaded selfie preview" className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={scanStep !== 'idle'} className="flex gap-2 rounded-2xl bg-black/45 px-3 py-2 text-white text-[10px] font-black uppercase backdrop-blur-md disabled:opacity-50">
                      <Upload size={12} /> Replace
                    </button>
                    <button onClick={() => { setUploadedPhoto(''); setUploadedPhotoLocation(null); setUploadedPhotoTakenAt(null); }} disabled={scanStep !== 'idle'} className="flex gap-2 rounded-2xl bg-black/45 px-3 py-2 text-white text-[10px] font-black uppercase backdrop-blur-md disabled:opacity-50">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                  {scanStep !== 'idle' && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center flex-col gap-4">
                      <Loader2 size={48} className="text-white animate-spin drop-shadow-lg" />
                      <div className="bg-black/60 px-6 py-2 rounded-full backdrop-blur-md">
                        <p className="text-white text-xs font-black uppercase animate-pulse">
                          {scanStep === 'face' ? '1. Analyzing Face...' : scanStep === 'location' ? '2. Grabbing Coordinates...' : '3. Finalizing Check-in...'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center px-6 py-12">
                  <ScanFace size={50} className="mx-auto text-white/20 mb-4" />
                  <button onClick={startCamera} disabled={!form.employee_id} className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase cursor-pointer disabled:opacity-50">Turn On Camera</button>
                </div>
              )}
            </div>

            <div className="p-4">
              {faceError && (
                <div className="mb-4 rounded-2xl px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-bold flex gap-2"><AlertCircle size={14} className="shrink-0" /> {faceError}</div>
              )}
              <button
                onClick={handleSmartCheckIn}
                disabled={(!uploadedPhoto && (!isCameraOpen || !isCameraReady)) || scanStep !== 'idle'}
                className={cn('w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg',
                  (uploadedPhoto || (isCameraOpen && isCameraReady)) ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed', scanStep !== 'idle' && 'opacity-70 cursor-wait'
                )}
              >
                {scanStep !== 'idle' ? <Loader2 size={18} className="animate-spin" /> : <Map size={18} />}
                {scanStep !== 'idle' ? 'Processing...' : uploadedPhoto ? 'Upload & Check-In' : !isCameraOpen ? 'Scan & Check-In' : isCameraReady ? 'Scan & Check-In' : 'Waiting...'}
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
