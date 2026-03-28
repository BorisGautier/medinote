import axios from 'axios';
import useAuthStore from '../stores/authStore';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor (Token Refresh) ───────────────
let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Modules ────────────────────────────────────────
export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data),
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

export const hospitalsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/hospitals', { params }),
  getById: (id: string) => api.get(`/hospitals/${id}`),
  getDoctors: (id: string, params?: Record<string, unknown>) =>
    api.get(`/hospitals/${id}/doctors`, { params }),
};

export const doctorsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/doctors', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getAvailability: (id: string, params?: Record<string, unknown>) =>
    api.get(`/doctors/${id}/availability`, { params }),
};

export const appointmentsApi = {
  create: (data: unknown) => api.post('/appointments', data),
  getMine: (params?: Record<string, unknown>) => api.get('/appointments/me', { params }),
  cancel: (id: string, data?: unknown) => api.patch(`/appointments/${id}/cancel`, data),
};

export const specialtiesApi = {
  getAll: () => api.get('/specialties'),
};

export default api;
