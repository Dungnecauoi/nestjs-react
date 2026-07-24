/// <reference types="vite/client" />
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseUrl = () => {
  try {
    return (import.meta as any).env?.VITE_API_URL || '/api';
  } catch {
    return '/api';
  }
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // HttpOnly RefreshToken cookie support
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach AccessToken directly from RAM memory
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh via HttpOnly Cookie on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Don't retry if the failed request was already auth login or auth refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${getBaseUrl()}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const data = refreshRes.data?.data || refreshRes.data;
        if (data && data.accessToken && data.user) {
          useAuthStore.getState().setAuth(data.accessToken, data.user);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
