import { create } from 'zustand';


interface TenantInfo {
  id: string;
  name: string;
  subdomain?: string;
  subscriptions?: any[]
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'OWNER_ADMIN' | 'EMPLOYEE';
  tenantId?: string;
  tenant?: TenantInfo | null;
}

interface AuthState {
  user: UserProfile | null;
  isInitialized: boolean;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  setInitialized: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setInitialized: (status) => set({ isInitialized: status }),
}));