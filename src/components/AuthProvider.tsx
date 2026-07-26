'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { endpoints } from "../config/enpoints";
import api from "../lib/api";

// Fungsi fetcher menggunakan Axios (otomatis membawa cookie)
const fetchAuthProfile = async () => {
  const { data } = await api.get(endpoints.users.my);
//   console.log({user: data?.data?.[0] || null})
  return data?.data?.[0] || null
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  const isLoginPage = pathname === '/login';

  // 🟢 Manfaatkan React Query untuk ambil data session login
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['auth-profile'],
    queryFn: fetchAuthProfile,
    retry: false,
    enabled: !isLoginPage,
    staleTime: 1000 * 60 * 15, // Anggap profil valid selama 15 menit tanpa fetch ulang
  });

  useEffect(() => {
    if (isLoginPage) {
      setInitialized(true);
      return;
    }
    if (isSuccess && data) {
      setUser(data); // Isi Zustand dengan data profile asli ({ role, tenantId, dll })
      setInitialized(true);
    } else if (isError) {
      clearUser(); // Kosongkan Zustand jika session expired
      setInitialized(true);
      router.push('/login');
    }
  }, [data, isSuccess, isError, setUser, clearUser, setInitialized, isLoginPage, router]);

  // 🟢 UX PROTECTION: Tahan UI agar tidak berkedip (flash) sebelum status auth jelas
  if (isLoading || !isInitialized) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-[9999]">
        <div className="w-8 h-8 border-4 border-[#0A8F8A]/20 border-t-[#0A8F8A] rounded-full animate-spin mb-2" />
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">
          Memuat Julu POS...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}