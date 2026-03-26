import axios from 'axios';
import { store } from '@/src/store';
import { logout, updateToken } from '@/src/store/slices/authSlice';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_BE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
});

// ✅ REQUEST INTERCEPTOR - Auto inject token from Redux store
api.interceptors.request.use(
    (config) => {
        // Skip auth if explicitly set (e.g., login, register)
        if ((config as any).skipAuth) {
            return config;
        }

        const token = store.getState().auth.token;
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ✅ RESPONSE INTERCEPTOR - Handle 401 Unauthorized with Auto Token Refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry && !(originalRequest as any).skipAuth) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = store.getState().auth.refreshToken;

            if (!refreshToken) {
                // No refresh token, logout immediately
                isRefreshing = false;
                store.dispatch(logout());
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                // Call refresh token endpoint
                const response = await axios.post(`${api.defaults.baseURL}/iam-service/api/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

                // Update Redux store with new tokens
                store.dispatch(updateToken({ token: newToken, refreshToken: newRefreshToken }));

                // Update the failed request with new token and retry
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Process queued requests
                processQueue(null, newToken);
                isRefreshing = false;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                processQueue(refreshError, null);
                isRefreshing = false;
                store.dispatch(logout());
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function redirectToLogin() {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const segments = path.split('/');
        const locale = (segments.length > 1 && (segments[1] === 'vi' || segments[1] === 'en')) ? segments[1] : 'vi';
        window.location.href = `/${locale}/auth/login`;
    }
}

export default api;
