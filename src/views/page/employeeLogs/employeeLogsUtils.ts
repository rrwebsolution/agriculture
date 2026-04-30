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

const getExifAscii = (view: DataView, start: number, length: number) => {
  let output = '';
  for (let i = 0; i < length; i += 1) {
    const value = view.getUint8(start + i);
    if (value === 0) break;
    output += String.fromCharCode(value);
  }
  return output;
};

const getExifString = (view: DataView, tiffStart: number, entryStart: number, count: number, littleEndian: boolean) => {
  if (count <= 4) {
    return getExifAscii(view, entryStart + 8, count);
  }
  const valueOffset = view.getUint32(entryStart + 8, littleEndian);
  return getExifAscii(view, tiffStart + valueOffset, count);
};

const parseExifDateTime = (value: string) => {
  const trimmed = String(value || '').trim().replace(/\0/g, '');
  const match = trimmed.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, hh, mm, ss] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const toDecimalDegrees = (dms: number[], ref: string) => {
  const [deg = 0, min = 0, sec = 0] = dms;
  let decimal = deg + min / 60 + sec / 3600;
  if (ref === 'S' || ref === 'W') decimal *= -1;
  return decimal;
};

const readRational = (view: DataView, offset: number, littleEndian: boolean) => {
  const numerator = view.getUint32(offset, littleEndian);
  const denominator = view.getUint32(offset + 4, littleEndian);
  if (!denominator) return 0;
  return numerator / denominator;
};

const getGpsCoordinatesFromExif = (buffer: ArrayBuffer) => {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset, false);
    const segmentLength = view.getUint16(offset + 2, false);

    if (marker === 0xffe1) {
      const exifStart = offset + 4;
      const exifHeader = getExifAscii(view, exifStart, 6);
      if (exifHeader !== 'Exif') return null;

      const tiffStart = exifStart + 6;
      const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
      const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
      const ifd0Start = tiffStart + firstIfdOffset;
      const ifd0Entries = view.getUint16(ifd0Start, littleEndian);

      let gpsIfdOffset = 0;
      for (let i = 0; i < ifd0Entries; i += 1) {
        const entryStart = ifd0Start + 2 + i * 12;
        const tag = view.getUint16(entryStart, littleEndian);
        if (tag === 0x8825) {
          gpsIfdOffset = view.getUint32(entryStart + 8, littleEndian);
          break;
        }
      }
      if (!gpsIfdOffset) return null;

      const gpsIfdStart = tiffStart + gpsIfdOffset;
      const gpsEntries = view.getUint16(gpsIfdStart, littleEndian);

      let latRef = '';
      let lngRef = '';
      let latVals: number[] = [];
      let lngVals: number[] = [];

      for (let i = 0; i < gpsEntries; i += 1) {
        const entryStart = gpsIfdStart + 2 + i * 12;
        const tag = view.getUint16(entryStart, littleEndian);
        const type = view.getUint16(entryStart + 2, littleEndian);
        const count = view.getUint32(entryStart + 4, littleEndian);
        const valueOffset = view.getUint32(entryStart + 8, littleEndian);

        if (tag === 0x0001 && type === 2) {
          latRef = getExifAscii(view, entryStart + 8, Math.min(count, 4));
        } else if (tag === 0x0003 && type === 2) {
          lngRef = getExifAscii(view, entryStart + 8, Math.min(count, 4));
        } else if (tag === 0x0002 && type === 5 && count >= 3) {
          const base = tiffStart + valueOffset;
          latVals = [readRational(view, base, littleEndian), readRational(view, base + 8, littleEndian), readRational(view, base + 16, littleEndian)];
        } else if (tag === 0x0004 && type === 5 && count >= 3) {
          const base = tiffStart + valueOffset;
          lngVals = [readRational(view, base, littleEndian), readRational(view, base + 8, littleEndian), readRational(view, base + 16, littleEndian)];
        }
      }

      if (!latRef || !lngRef || latVals.length < 3 || lngVals.length < 3) return null;
      const lat = toDecimalDegrees(latVals, latRef);
      const lng = toDecimalDegrees(lngVals, lngRef);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return { lat, lng };
    }

    if ((marker & 0xff00) !== 0xff00) break;
    offset += 2 + segmentLength;
  }

  return null;
};

export const getLocationFromPhotoExif = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const gps = getGpsCoordinatesFromExif(buffer);
  if (!gps) return null;

  const { lat, lng } = gps;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return { lat, lng, address: data.display_name || `Coordinates: ${lat}, ${lng}` };
  } catch {
    return { lat, lng, address: `Coordinates: ${lat}, ${lng}` };
  }
};

export const getPhotoDateTimeFromExif = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset, false);
    const segmentLength = view.getUint16(offset + 2, false);

    if (marker === 0xffe1) {
      const exifStart = offset + 4;
      const exifHeader = getExifAscii(view, exifStart, 6);
      if (exifHeader !== 'Exif') return null;

      const tiffStart = exifStart + 6;
      const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
      const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
      const ifd0Start = tiffStart + firstIfdOffset;
      const ifd0Entries = view.getUint16(ifd0Start, littleEndian);

      let exifIfdOffset = 0;
      for (let i = 0; i < ifd0Entries; i += 1) {
        const entryStart = ifd0Start + 2 + i * 12;
        const tag = view.getUint16(entryStart, littleEndian);
        if (tag === 0x8769) {
          exifIfdOffset = view.getUint32(entryStart + 8, littleEndian);
          break;
        }
      }
      if (!exifIfdOffset) return null;

      const exifIfdStart = tiffStart + exifIfdOffset;
      const exifEntries = view.getUint16(exifIfdStart, littleEndian);

      for (let i = 0; i < exifEntries; i += 1) {
        const entryStart = exifIfdStart + 2 + i * 12;
        const tag = view.getUint16(entryStart, littleEndian);
        const type = view.getUint16(entryStart + 2, littleEndian);
        const count = view.getUint32(entryStart + 4, littleEndian);

        if ((tag === 0x9003 || tag === 0x0132) && type === 2 && count > 0) {
          const rawDateTime = getExifString(view, tiffStart, entryStart, count, littleEndian);
          const parsed = parseExifDateTime(rawDateTime);
          if (parsed) return parsed;
        }
      }
      return null;
    }

    if ((marker & 0xff00) !== 0xff00) break;
    offset += 2 + segmentLength;
  }

  return null;
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

export const isLikelyNetworkError = (error: any) => {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  const hasNoResponse = !error?.response;

  return (
    hasNoResponse ||
    code === 'err_network' ||
    code === 'ecconaborted' ||
    message.includes('network error') ||
    message.includes('failed to fetch') ||
    message.includes('timeout')
  );
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
  // Prefer device-captured verification time (EXIF-based) over server created_at.
  return log?.face_verified_at || log?.created_at || (log?.log_date ? `${log.log_date}T00:00:00` : '');
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
