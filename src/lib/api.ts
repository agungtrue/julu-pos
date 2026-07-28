import axios from 'axios';
import { getAuthToken, removeAuthCookie } from '@/app/actions/auth';
import { useAuthStore } from '@/stores/authStore';

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

//   const currentUser = useAuthStore.getState().user;
//   if (currentUser) {
//     console.log({ hitApi: currentUser })
//     if (currentUser.role !== 'SUPER_ADMIN' && currentUser?.tenant?.id) {
//       config.headers['x-tenant-id'] = currentUser.tenant.id;
//     }
//   }
  return config;
});

// Interceptor Response (for 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      await removeAuthCookie();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      const clearUser = useAuthStore((state) => state.clearUser);
      clearUser()
    }

    // require payment
    if (status === 402 || status === 403 || data?.errorCode?.startsWith('SUBSCRIPTION_')) {
    //   console.log({ status, data })

      if (typeof window !== 'undefined' && window.location.pathname !== '/billing') {
        window.location.href = data?.redirectTo || '/billing';
        return;
      }
    }
    return Promise.reject(error);
  }
);

export default api;