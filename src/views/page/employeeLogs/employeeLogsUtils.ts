import axios from '../../../plugin/axios';

export const defaultLog = {
  employee_id: '',
  assignment: '',
  notes: '',
  status: 'In Field',
};

const OFFLINE_SMART_CHECK_IN_KEY = 'offline_smart_checkins_v1';

export interface OfflineSmartCheckInPayload {
  local_id: string;
  queued_at: string;
  employee_id: string;
  log_date: string;
  location_name: string;
  latitude: string;
  longitude: string;
  assignment: string;
  status: string;
  notes: string;
  face_verified: boolean;
  face_verified_at: string;
  face_match_score: number;
  verification_photo: string;
}

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || '{}');
  } catch {
    return {};
  }
};

export const getGeoLocation = (): Promise<{ lat: number; lng: number; address: string }> => {
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
        } catch {
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

export const getCameraAccessErrorMessage = (error: unknown) => {
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

export const getApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  const fieldErrors = data?.errors;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (fieldErrors && typeof fieldErrors === 'object') {
    const firstEntry = Object.values(fieldErrors).find(
      (value) => Array.isArray(value) && value.length > 0
    ) as string[] | undefined;
    if (firstEntry?.[0]) {
      return firstEntry[0];
    }
  }

  return error?.message || fallback;
};

export const isMissingEmployeeLogError = (error: any) => {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || error?.message || '');
  return status === 404 || message.includes('No query results for model [App\\Models\\TechnicianLog]');
};

export const sanitizeLocationName = (locationName: string) => {
  const normalized = String(locationName || '').trim().replace(/\s+/g, ' ');
  return normalized.length > 255 ? `${normalized.slice(0, 252)}...` : normalized;
};

export const getOfflineSmartCheckIns = (): OfflineSmartCheckInPayload[] => {
  try {
    const value = localStorage.getItem(OFFLINE_SMART_CHECK_IN_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveOfflineSmartCheckIns = (items: OfflineSmartCheckInPayload[]) => {
  localStorage.setItem(OFFLINE_SMART_CHECK_IN_KEY, JSON.stringify(items));
};

export const queueOfflineSmartCheckIn = (payload: Omit<OfflineSmartCheckInPayload, 'local_id' | 'queued_at'>) => {
  const items = getOfflineSmartCheckIns();
  const queuedItem: OfflineSmartCheckInPayload = {
    ...payload,
    local_id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queued_at: new Date().toISOString(),
  };
  items.push(queuedItem);
  saveOfflineSmartCheckIns(items);
  return queuedItem;
};

export const syncOfflineSmartCheckIns = async () => {
  const queued = getOfflineSmartCheckIns();
  if (!queued.length || !navigator.onLine) {
    return { synced: [], failed: queued.length };
  }

  const remaining: OfflineSmartCheckInPayload[] = [];
  const synced: any[] = [];

  for (const item of queued) {
    try {
      const { local_id, queued_at, ...payload } = item;
      const response = await axios.post('technician-logs', payload);
      synced.push(response?.data?.data || null);
    } catch {
      remaining.push(item);
    }
  }

  saveOfflineSmartCheckIns(remaining);
  return { synced: synced.filter(Boolean), failed: remaining.length };
};

const getLogTimestamp = (log: any) => {
  return log?.created_at || log?.face_verified_at || (log?.log_date ? `${log.log_date}T00:00:00` : '');
};

export const formatLogDateTime = (log: any) => {
  const timestamp = getLogTimestamp(log);
  if (!timestamp) return 'No date recorded';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return log?.log_date || 'No date recorded';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatLogTime = (log: any) => {
  const timestamp = getLogTimestamp(log);
  if (!timestamp) return 'No time recorded';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'No time recorded';

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};
