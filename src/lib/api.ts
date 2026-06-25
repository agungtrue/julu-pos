import axios from 'axios';
import { getAuthToken, removeAuthCookie } from '@/app/actions/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.julucoffee.com';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor Request
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response (for 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeAuthCookie();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;