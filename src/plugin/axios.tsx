import axios from 'axios';
import Swal from 'sweetalert2';

// 🚩 Flag aron kausa ra mugawas ang alert box bisan daghan ang dungan nga failed requests
let isAlerting = false;

const deviceFingerprint = () => {
    const platform = (navigator as any).platform || 'unknown';
    const language = navigator.language || 'en';
    return `${navigator.userAgent}|${platform}|${language}`;
};

const pendingRequests = new Map();

const getRequestKey = (config: any) => {
    return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&');
};

const removePendingRequest = (config: any) => {
    const key = getRequestKey(config);
    if (pendingRequests.has(key)) {
        const abortController = pendingRequests.get(key);
        abortController.abort(); 
        pendingRequests.delete(key);
    }
};

const instance = axios.create({
    baseURL: `${import.meta.env.VITE_URL}/api/`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Device-Fingerprint': deviceFingerprint(),
    }
});

// --- REQUEST INTERCEPTOR ---
instance.interceptors.request.use((config) => {
    removePendingRequest(config);

    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(getRequestKey(config), controller);

    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- RESPONSE INTERCEPTOR ---
instance.interceptors.response.use(
    (response) => {
        pendingRequests.delete(getRequestKey(response.config));
        return response;
    },
    (error) => {
        if (axios.isCancel(error)) {
            return new Promise(() => {}); 
        }

        if (error.config) {
            pendingRequests.delete(getRequestKey(error.config));
        }

        try {
            const status = error?.response?.status;
            const message = error?.response?.data?.message || '';
            
            // 🛡️ SECURITY RISK DETECTION
            const isSecurityRisk = 
                status === 401 || 
                status === 403 || 
                message.includes('device mismatch') || 
                message.includes('Security Alert') ||
                message.includes('Token expired');

            if (isSecurityRisk && !isAlerting) {
                isAlerting = true; // I-block ang ubang alerts samtang wala pa ka-confirm ang user

                // 1. Clear tanang session data sa memory
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('appState');

                // 2. Ipakita ang SweetAlert UNA
                Swal.fire({
                    title: 'Security Alert',
                    text: 'Your session is invalid, expired, or accessed from an unrecognized device. For your protection, please log in again.',
                    icon: 'warning',
                    confirmButtonColor: '#10b981', // emerald-500
                    confirmButtonText: 'Back to Login',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    // 3. Human og click sa "Back to Login", ayha pa i-redirect
                    if (result.isConfirmed || result.isDismissed) {
                        isAlerting = false;
                        window.location.href = '/user-login';
                    }
                });
            }
        } catch (e) {
            // silent catch
        }
        
        return Promise.reject(error);
    }
);

export default instance;