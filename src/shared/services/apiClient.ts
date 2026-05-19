import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from '../../services/config';

// ── Token Storage Helpers ──
const TOKEN_KEY = 'volt_access_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeAccessToken(access: string): void {
  localStorage.setItem(TOKEN_KEY, access);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('volt_user');
}

// ── API Client ──
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Crucial for receiving/sending HttpOnly cookies (refresh token)
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 & Automatic Refresh
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or it's a retry of a refresh request, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url === '/refresh/') {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt refresh using HttpOnly cookie (sent automatically because withCredentials is true)
      const res = await axios.post(`${API_BASE}/refresh/`, {}, { withCredentials: true });
      
      const newAccess = res.data?.access_token || res.data?.access;
      if (!newAccess) throw new Error('No token in refresh response');
      
      storeAccessToken(newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      processQueue(null, newAccess);
      
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthTokens();
      // Only redirect if we're not already on the landing page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
