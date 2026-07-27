"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import { formatDate } from "@/lib/utils";

export default function MyProfilePage() {
  const queryClient = useQueryClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Fetch Profile User
  const { data: user, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const res = await api.get(endpoints.users.my);
      return res.data?.data?.[0] || null;
    },
  });

  // 2. Mutation Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(endpoints.users.changePassword, {
        currentPassword,
        newPassword,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message || "Password berhasil diubah!");
      setErrorMsg("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Re-fetch profile agar flag mustChangePassword terbarui
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (err: any) => {
      setSuccessMsg("");
      setErrorMsg(err.response?.data?.message || "Gagal mengubah password");
    },
  });

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 8) {
      setErrorMsg("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }

    changePasswordMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-[9999]">
          <div className="w-8 h-8 border-4 border-[#0A8F8A]/20 border-t-[#0A8F8A] rounded-full animate-spin mb-2" />
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">
            Memuat profil akun...
          </p>
        </div>
      )}

      {/* Header Page */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Pengaturan Akun
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi data diri dan keamanan sandi Anda.
        </p>
      </div>

      {/* BANNER PERINGATAN FIRST-TIME PASSWORD CHANGE */}
      {user?.mustChangePassword && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
          {/* <span className="text-xl">!</span> */}
          <div>
            <h4 className="text-sm font-bold text-orange-900">
              Perbarui Password Bawaan Anda
            </h4>
            <p className="text-xs text-orange-800 mt-0.5 leading-relaxed">
              Anda saat ini menggunakan password pertama yang dibuatkan oleh
              Admin. Demi keamanan data kedai, mohon segera ganti password Anda
              di bawah ini.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: INFORMASI PROFIL & LANGGANAN */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 flex flex-col justify-between">
          {/* SECTION TOP: AVATAR & AKUN */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#00796B] text-white flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-snug">
                  {user?.name}
                </h3>
                <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-teal-50 text-[#00796B] border border-teal-100/80">
                  {user?.role === "OWNER_ADMIN"
                    ? "Owner Admin"
                    : "Staff / Employee"}
                </span>
              </div>
            </div>

            {/* LIST INFORMASI AKUN & OUTLET */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-medium block">
                  Email Akses:
                </span>
                <span className="font-semibold text-gray-800">
                  {user?.email || "-"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 font-medium block">
                  No. Telepon / WA:
                </span>
                <span className="font-semibold text-gray-800">
                  {user?.phone || "-"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 font-medium block">
                  Tenant / Kedai:
                </span>
                <span className="font-semibold text-gray-800">
                  {user?.tenant?.name || "-"}
                </span>
              </div>

              {/* 📍 OUTLET / CABANG (JIKA ADA) */}
              {user?.outlet && (
                <div>
                  <span className="text-gray-400 font-medium block">
                    Outlet / Cabang:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {user.outlet.name}{" "}
                    {user.outlet.branch ? `(${user.outlet.branch})` : ""}
                  </span>
                </div>
              )}

              <div>
                <span className="text-gray-400 font-medium block">
                  Domain Akses:
                </span>
                <span className="inline-block font-mono text-[11px] text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 mt-0.5">
                  {user?.tenant?.subdomain || "pos"}.julucoffee.com
                </span>
              </div>
            </div>
          </div>

          {/* 💳 SECTION BOTTOM: HIGHLIGHT STATUS LANGGANAN */}
          <div className="pt-4 border-t border-gray-100">
            <div className="p-3.5 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 rounded-xl border border-teal-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  Paket Aktif
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    user?.tenant?.subscriptions?.[0]?.status === "ACTIVE"
                      ? "bg-emerald-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {user?.tenant?.subscriptions?.[0]?.status || "PENDING"}
                </span>
              </div>

              <div>
                <p className="text-sm font-black text-gray-900">
                  {user?.tenant?.subscriptions?.[0]?.plan?.name || "Paket Trial Uji Coba"}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Berakhir:{" "}
                  <strong className="text-gray-700 font-semibold">
                    {formatDate(user?.tenant?.subscriptions?.[0]?.endDate)}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: FORM GANTI PASSWORD */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">
            Ubah Password
          </h2>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>✅</span> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {/* 1. PASSWORD SAAT INI */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00796B] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 2. PASSWORD BARU */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00796B] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showNewPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. KONFIRMASI PASSWORD BARU */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00796B] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#EF5B2B] hover:bg-[#d84e22] text-white font-bold rounded-xl text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {changePasswordMutation.isPending
                  ? "Memproses..."
                  : "Simpan Password Baru"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
