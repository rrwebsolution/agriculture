import axios from 'axios';

const deviceFingerprint = () => {
    return navigator.userAgent + '|' + location.hostname;
};

// 🌟 PENDING REQUESTS TRACKER
const pendingRequests = new Map();

const getRequestKey = (config:any) => {
    // Naghimo og unique key base sa Method, URL, ug Data/Params
    return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&');
};

const removePendingRequest = (config:any) => {
    const key = getRequestKey(config);
    if (pendingRequests.has(key)) {
        const abortController = pendingRequests.get(key);
        abortController.abort(); // Cancel ang karaan nga request
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
    // 1. I-cancel ang pending request kung naa nay existing nga parehas
    removePendingRequest(config);

    // 2. Paghimo og bag-ong AbortController para ani nga request
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(getRequestKey(config), controller);

    // 3. Attach Auth Token
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
        // Human sa malampuson nga request, tangtangon sa pending list
        pendingRequests.delete(getRequestKey(response.config));
        return response;
    },
    (error) => {
        // Kung na-cancel lang ang request (duplicate), ayaw i-trigger ang error handling
        if (axios.isCancel(error)) {
            // console.warn('Duplicate request canceled:', error.message);
            return new Promise(() => {}); 
        }

        // Tangtangon gihapon sa pending bisan naay error
        if (error.config) {
            pendingRequests.delete(getRequestKey(error.config));
        }

        try {
            const message = error?.response?.data?.message || error?.message || '';
            
            // Authentication check
            if (message === 'Unauthenticated.' || message === 'Failed to sync with database' || message === 'Token device mismatch') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                // Siguraduhon nga dili mag-loop ang redirect
                if (window.location.pathname !== '/user-login') {
                    window.location.href = '/user-login';
                }
            }
        } catch (e) {
            // silent catch
        }
        
        return Promise.reject(error);
    }
);

export default instance;