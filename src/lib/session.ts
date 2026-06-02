export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';
export const APP_STATE_KEY = 'appState';
export const BROWSER_SESSION_KEY = 'agri_browser_session_active';

export const markBrowserSessionActive = () => {
  sessionStorage.setItem(BROWSER_SESSION_KEY, 'true');
};

export const hasActiveBrowserSession = () => {
  return sessionStorage.getItem(BROWSER_SESSION_KEY) === 'true';
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(APP_STATE_KEY);
  localStorage.removeItem('must_change_password');
  sessionStorage.removeItem(BROWSER_SESSION_KEY);
};
