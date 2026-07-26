"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { formatJuluDate } from "../../../lib/utils";
import { endpoints } from "../../../config/enpoints";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Eye, EyeClosed, Save } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useAuthStore } from '@/stores/authStore';

interface Users {
  id: string;
  name: string;
  email: string;
  last_login: string;
  isActive: boolean;
  phone: string;
  role: string;
  password: string;
  created_at: string;
  tenantId: string;
}

export default function UserManagementPage() {
  const userLogin = useAuthStore((state) => state.user);

  //   const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State Form Karyawan Baru
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("EMPLOYEE");
  const [tenantId, setTenantId] = useState(userLogin?.tenant?.id ? userLogin.tenant.id : '');
  const [isSubmit, setIsSubmit] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: postAddUsers } = useMutation({
    mutationFn: async (payloads: Users) => {
      const payload = {
        name: payloads.name,
        email: payloads.email,
        phone: payloads.phone,
        role: payloads.role,
        password: payloads.password,
        tenantId: payloads.tenantId,
      };
      return await api.post(endpoints.users.post, payload);
    },
    onSuccess: () => {
      toast.success("User telah Berhasil ditambahkan!", {
        description: "Silahkan coba login menggunakan user baru.",
        className:
          "bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl",
      });

      queryClient.invalidateQueries({ queryKey: ["userListData"] });

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("EMPLOYEE");
      setIsSubmit(false);
      setTenantId('');
    },
  });

  // Submit Handler Tambah Karyawan Baru
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: "",
      name,
      email,
      phone,
      role,
      password,
      last_login: "",
      isActive: true,
      created_at: "",
      tenantId
      //   metrics: { totalOrders: 0, totalSales: 0 },
    };

    setIsSubmit(true);
    postAddUsers(newUser);
  };

  // list tenant
  const fetchTenantListData = async () => {
    const url = endpoints.tenants.get;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: tenantData } = useQuery({
    queryKey: ["tenantListData"],
    queryFn: () => fetchTenantListData(),
  });

  const tenants = tenantData ?? [];

  // list user
  const fetchUserListData = async () => {
    const url = endpoints.users.get;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["userListData"],
    queryFn: () => fetchUserListData(),
  });

  const users = usersData ?? [];

  const filteredUsers = users.filter(
    (user: Users) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm),
  );

  // Toggle Suspend / Aktifkan Akun Tim
  const handleToggleStatus = (id: string) => {
    console.log({ id });
    // setUsers(
    //   users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    // );
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans w-full pb-24 select-none">
      {/* 🏷️ HEADER SECTION */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Manajemen Karyawan
          </h1>
          <p className="text-xs text-gray-750 font-semibold mt-1 leading-relaxed">
            Pantau performa nota, riwayat masuk, dan kendali penuh hak akses
            kasir Julu POS.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2.5 bg-[#0A8F8A] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all shrink-0"
        >
          {isFormOpen ? "Tutup" : "+ Karyawan"}
        </button>
      </div>

      {/* 📥 INLINE FORM DRAWER TAMBAH KARYAWAN (Mobile-First Accordion) */}
      {isFormOpen && (
        <form
          onSubmit={handleAddUser}
          className="bg-white p-4 rounded-2xl border-2 border-[#0A8F8A]/30 shadow-md mb-5 flex flex-col gap-3.5 animate-scale-up"
        >
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
            Registrasi Staf Baru
          </h3>

          <input
            type="text"
            placeholder="Nama Lengkap Karyawan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800"
            required
          />
          <input
            type="email"
            placeholder="Alamat Email Akun"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800"
            required
          />
          <input
            type="tel"
            placeholder="Nomor WhatsApp Aktif"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800"
            required
          />

          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1.5">
              Pilih Tenant / Tempat Bisnis
            </label>
            <select
              disabled={!!userLogin?.tenant?.id}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800 font-bold cursor-pointer"
              required
            >
              <option value="" disabled>
                -- Pilih Tenant Mitra --
              </option>
              {tenants &&
                tenants.map((tenant: any) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.subdomain})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-600 uppercase mb-1.5">
              Tingkat Hak Akses / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none text-gray-800 font-bold"
            >
              <option value="EMPLOYEE">
                EMPLOYEE (Hanya Menu Kasir & Stok)
              </option>
              <option value="OWNER_ADMIN">
                ADMIN (Owner - Akses Semua Laporan Finansial)
              </option>
            </select>
          </div>

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password User"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3.5 pr-12 py-3 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800"
              required
            />

            {/* Tombol Toggle Intip Password (Posisi Kanan Dalam Input) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[10px] font-black uppercase tracking-wider text-gray-750 active:scale-95 transition-all"
            >
              {showPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#EF5B2B] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all mt-1"
          >
            {isSubmit ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="flex flex-1 gap-2 justify-center items-center">
                <Save className="w-4 h-4" />
                Simpan & Aktifkan Akun Staf
              </span>
            )}
          </button>
        </form>
      )}

      {/* 🔍 SEARCH BAR DENGAN KONTRAS TINGGI */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs mb-5 flex items-center">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari kasir berdasarkan nama, email, atau nomor HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800 font-bold"
          />
        </div>
      </div>

      {/* 📱 USER LIST LAYOUT (Mobile Stacking Vertical Card System) */}
      <div className="flex flex-col gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user: Users) => (
            <div
              key={user.id}
              className={`p-4 rounded-2xl bg-white border flex flex-col gap-3.5 shadow-sm transition-all ${
                user.isActive
                  ? "border-gray-200"
                  : "border-gray-200 bg-gray-50/70 opacity-80"
              }`}
            >
              {/* Seksi Atas: Nama, Email & Tombol Aksi Suspend */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-gray-900 text-base leading-tight">
                      {user.name}
                    </h4>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider ${
                        user.role === "ADMIN"
                          ? "bg-[#EF5B2B]/10 text-[#EF5B2B] border border-[#EF5B2B]/20"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-semibold">
                    {user.email} • {user.phone}
                  </p>
                </div>

                {/* Tombol Kontrol Suspend (Jempol Kanan Mudah Dijangkau) */}
                <button
                  onClick={() => handleToggleStatus(user.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all active:scale-95 shrink-0 ${
                    user.isActive
                      ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                      : "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  {user.isActive ? "Suspend" : "Aktifkan"}
                </button>
              </div>

              {/* Seksi Tengah: Metrik Performa Kerja Karyawan */}
              {/* <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-150">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-gray-600 uppercase block">Nota Diproses</span>
                  <span className="font-black text-gray-850 text-sm mt-0.5 block">
                    {user.metrics.totalOrders} <span className="text-xs font-medium text-gray-600">Transaksi</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-600 uppercase block">Total Omzet Kasir</span>
                  <span className="font-black text-[#0A8F8A] text-sm mt-0.5 block">
                    Rp {user.metrics.totalSales.toLocaleString('id-ID')}
                  </span>
                </div>
              </div> */}

              {/* Seksi Bawah: Metadata Audit Trail (Tanggal Join & Last Login) */}
              <div className="flex items-center justify-between text-[11px] text-gray-700 font-semibold pt-1 border-t border-gray-100 flex-wrap gap-y-1">
                <div>
                  📅 Join:{" "}
                  <span className="text-gray-900 font-bold">
                    {formatJuluDate(user.created_at)}
                  </span>
                </div>
                <div className="text-right">
                  Login terakhir:{" "}
                  <span className="text-gray-950 font-black">
                    {formatJuluDate(user.last_login)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-sm text-gray-700 font-bold">
              Karyawan tidak ditemukan
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Periksa kembali ejaan kata kunci pencarian Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
