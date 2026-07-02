import { useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from '../plugin/axios';
import { AUTH_TOKEN_KEY, clearAuthSession, hasActiveBrowserSession, isHeartbeatActive } from '../lib/session';

let isShowingSessionPrompt = false;

export default function SessionRecoveryGuard() {
  useEffect(() => {
    const hasToken = !!localStorage.getItem(AUTH_TOKEN_KEY);
    // Skip if: no token, this tab already has an active session,
    // another tab is still running (heartbeat fresh), or dialog already showing.
    if (!hasToken || hasActiveBrowserSession() || isHeartbeatActive() || isShowingSessionPrompt) return;

    isShowingSessionPrompt = true;

    Swal.fire({
      title: 'Previous Session Detected',
      text: 'You closed the page without logging out. Please logout first to keep your data safe.',
      icon: 'warning',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Logout Now',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(async () => {
      try {
        await axios.post('logout');
      } catch (error) {
        console.error('Session cleanup logout error:', error);
      } finally {
        clearAuthSession();
        isShowingSessionPrompt = false;
        window.location.replace('/user-login');
      }
    });
  }, []);

  return null;
}
