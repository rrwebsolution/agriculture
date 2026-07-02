export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';
export const APP_STATE_KEY = 'appState';
export const BROWSER_SESSION_KEY = 'agri_browser_session_active';
export const HEARTBEAT_KEY = 'agri_session_heartbeat';
const HEARTBEAT_TTL_MS = 12000; // consider active if updated within 12 s

export const markBrowserSessionActive = () => {
  sessionStorage.setItem(BROWSER_SESSION_KEY, 'true');
};

export const hasActiveBrowserSession = () => {
  return sessionStorage.getItem(BROWSER_SESSION_KEY) === 'true';
};

/** Call this periodically while the app is running (any tab). */
export const updateHeartbeat = () => {
  localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
};

/** Returns true when another tab has updated the heartbeat recently. */
export const isHeartbeatActive = () => {
  const ts = localStorage.getItem(HEARTBEAT_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < HEARTBEAT_TTL_MS;
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(APP_STATE_KEY);
  localStorage.removeItem('must_change_password');
  localStorage.removeItem(HEARTBEAT_KEY);
  sessionStorage.removeItem(BROWSER_SESSION_KEY);
};
