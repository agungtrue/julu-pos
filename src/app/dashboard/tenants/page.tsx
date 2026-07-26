"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { formatDate } from "../../../lib/utils";
import {
  Globe,
  Coffee,
  CupSoda,
  Cookie,
  Plus,
  Edit,
  Search,
} from "lucide-react";

enum PlanType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY', // 3 Bulan
  SEMI_ANNUALLY = 'SEMI_ANNUALLY', // 6 Bulan
  YEARLY = 'YEARLY', // 12 Bulan
  CUSTOM = 'CUSTOM', // Fleksibel
}

interface User {
  name: string;
  phone: string;
  email: string;
}

interface Plan {
  name: string;
  price: number;
  email: string;
  durationDays: number
}

interface subscriptionInvoices {
  name: string;
  phone: string;
  email: string;
}

interface Subscriptions {
  plan: Plan;
  status: string;
  startDate: string;
  endDate: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  daily_opex: number;
  status: string;
  expiredAt: string;
  created_at: string;
  user?: User[] | null;
  subscriptions: Subscriptions[],
  subscriptionInvoices: subscriptionInvoices,
}

interface PostTenant {
  name: string;
  subdomain: string;
  daily_opex: number;
}

export default function TenantsManagementPage() {
  //   const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [chosenPlan, setChosenPlan] = useState("3_MONTHS");

  const queryClient = useQueryClient();

  const { mutate: postNewTenant } = useMutation({
    mutationFn: async (payload: PostTenant) => {
      return await api.post(endpoints.tenants.post, payload);
    },
    onSuccess: () => {
      setIsModalAddTenantOpen(false);
      resetForm();
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ["tenantData"] });
    },
    onError(error) {
      setIsSaving(false);
      if ((error as any)?.response?.data?.message) {
        setErrorMsg((error as any).response?.data?.message)
      }
    },
  });

  // get product
  const fetchTenantData = async () => {
    const url = endpoints.tenants.get;

    const response = await api.get(url);
    return response?.data?.data;
  };

  const { data: tenantData, isLoading: isLoadingTenantData } = useQuery({
    queryKey: ["tenantData"],
    queryFn: fetchTenantData,
  });

  const tenants = tenantData ?? [];
  console.log({ tenants });

  // form add tenant
  const [isModalAddTenantOpen, setIsModalAddTenantOpen] = useState(false);

  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [dailyOpex, setDailyOpex] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🟢 3. Fungsi Reset Form saat modal ditutup atau sukses submit
  const resetForm = () => {
    setName("");
    setSubdomain("");
    setDailyOpex("0");
    setErrorMsg("");
  };

  const handleClose = () => {
    resetForm();
    setIsModalAddTenantOpen(false);
  };

  // 🟢 4. Fungsi Handler Submit ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    const payload = {
      name,
      subdomain: subdomain.toLowerCase().trim(),
      daily_opex: parseInt(dailyOpex, 10) || 0,
    };

    postNewTenant(payload);
  };

  // Helper Badge Status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
            Aktif
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{" "}
            Expired
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-fit">
            Blokir
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
            Uji Coba
          </span>
        );
    }
  };

  // Trigger Aksi Buka Modal Perpanjangan
  const openRenewModal = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  // Handler Update Masa Aktif (Simulasi Hit API NestJS)
  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    

    setIsModalOpen(false);
  };

  if (isLoadingTenantData) return <DashboardSkeleton />;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      {/* 🏷️ HEADER SECTION */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Master Tenant SaaS
        </h1>
        <p className="text-sm text-gray-700 font-medium mt-1">
          Kelola portofolio bisnis, monitoring performa opex, dan aktivasi masa
          tenggang lisensi Julu POS.
        </p>
      </div>

      <div className="w-full sm:w-auto flex justify-end">
        <button
          onClick={() => setIsModalAddTenantOpen(true)}
          className="w-full mb-2 sm:w-auto px-5 py-2.5 bg-[#0A8F8A] hover:bg-[#08736f] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 group"
        >
          <svg
            className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Tambah Tenant
        </button>
      </div>

      {/* 🔍 SEARCH BAR - Jempol Kanan HP */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-4 flex items-center">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
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
            placeholder="Cari nama warung, pemilik, atau subdomain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800 font-semibold"
          />
        </div>
      </div>

      {/* 📱 VIEW 1: MOBILE LIST CARDS (Default Render di Handphone Kasir) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {tenants
          .filter(
            (t: Tenant) =>
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              //   t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((tenant: Tenant) => (
            <div
              key={tenant.id}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base">
                    {tenant.name}
                  </h4>
                  <p className="text-xs font-mono text-[#0A8F8A] mt-0.5">
                    https://{tenant.subdomain}.julucoffee.com
                  </p>
                </div>
                {getStatusBadge(tenant.status)}
              </div>

              <hr className="border-gray-100" />

              {/* Grid Data All Possibility Columns */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs text-gray-700">
                <div>
                  <span className="font-bold text-gray-900">Pemilik:</span>{" "}
                  {tenant?.user?.[0]?.name}
                </div>
                <div>
                  <span className="font-bold text-gray-900">HP:</span>{" "}
                  {tenant?.user?.[0]?.phone}
                </div>
                <div>
                  <span className="font-bold text-gray-900">Daily Opex:</span>{" "}
                  Rp {tenant.daily_opex.toLocaleString("id-ID")}
                </div>
                <div>
                  <span className="font-bold text-gray-900">Paket Aktif:</span>{" "}
                  {tenant?.subscriptions?.[0]?.plan?.name}
                </div>
                <div className="col-span-2 p-2 rounded-lg font-semibold text-gray-800 mt-1">
                  Gabung Sejak:{" "}
                  <span
                    className={
                      tenant.status === "EXPIRED"
                        ? "text-red-650 font-bold"
                        : "text-gray-900"
                    }
                  >
                    {formatDate(tenant.created_at)}
                  </span>
                </div>
                <div className="col-span-2 p-2 bg-gray-50 rounded-lg border border-gray-150 font-semibold text-gray-800 mt-1">
                  Expired Pada:{" "}
                  <span
                    className={
                      tenant.status === "EXPIRED"
                        ? "text-red-650 font-bold"
                        : "text-gray-900"
                    }
                  >
                    {formatDate(tenant?.subscriptions?.[0]?.endDate)}
                  </span>
                </div>
              </div>

              {/* Tombol Eksekusi Aksi */}
              {/* <button
                onClick={() => openRenewModal(tenant)}
                className="w-full mt-1 py-2.5 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Perpanjang Paket
              </button> */}
            </div>
          ))}
      </div>

      {/* 🖥️ VIEW 2: DESKTOP TABLE (Otomatis muncul di Layar Besar Monitor) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <th className="px-6 py-4">Informasi Bisnis</th>
                <th className="px-6 py-4">Kontak Owner</th>
                <th className="px-6 py-4">Metrik Finansial</th>
                <th className="px-6 py-4">Status & Paket</th>
                <th className="px-6 py-4">Masa Berlaku</th>
                <th className="px-6 py-4 text-center">Aksi Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm text-gray-800">
              {tenants
                .filter(
                  (t: Tenant) =>
                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    //   t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.subdomain
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )
                .map((tenant: Tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-gray-50/50 transition-all"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">
                        {tenant.name}
                      </p>
                      <p className="text-xs font-mono text-[#0A8F8A] mt-0.5">
                        https://{tenant.subdomain}.julucoffee.com
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {tenant?.user?.[0]?.name}
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        {tenant?.user?.[0]?.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-700">Daily Opex:</p>
                      <p className="font-bold text-gray-900">
                        Rp {tenant.daily_opex.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(tenant.status)}
                        <span className="text-[10px] font-extrabold text-gray-700 uppercase">
                          {tenant?.subscriptions?.[0]?.plan?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {formatDate(tenant?.subscriptions?.[0]?.endDate)}
                      </p>
                      <p className="text-[10px] text-gray-700 font-medium">
                        Gabung Sejak: {formatDate(tenant.created_at)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* {tenant.status !== "ACTIVE" && (
                        <button
                          onClick={() => openRenewModal(tenant)}
                          className="px-4 py-2 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 mx-auto"
                        >
                          Perpanjang
                        </button>
                      )} */}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalAddTenantOpen && (
        <div
          onClick={() => setIsModalAddTenantOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all animate-scale-up"
          >
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  Registrasi Tenant Baru
                </h3>
                <p className="text-[10px] text-gray-550 font-medium">
                  Buat space bisnis baru untuk mitra Julu POS
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Alert Error jika submit gagal */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Input 1: Nama Bisnis */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-700 tracking-wider">
                  Nama Bisnis / Brand
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Julu Coffee & Snacks"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Input 2: Subdomain */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-700 tracking-wider">
                  Subdomain Aplikasi
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="julu-coffee"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    className="w-full pl-3.5 pr-28 py-2.5 bg-gray-50 border border-gray-200 text-xs font-mono font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800 placeholder-gray-400"
                    required
                  />
                  <span className="absolute right-3 text-[10px] font-bold text-gray-400 bg-gray-200/60 px-2 py-1 rounded-md pointer-events-none">
                    .julucoffee.com
                  </span>
                </div>
              </div>

              {/* Input 3: Daily Opex */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-700 tracking-wider">
                  Opex Harian Awal (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={dailyOpex}
                  onChange={(e) => setDailyOpex(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Footer / Aksi Tombol */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#EF5B2B] hover:bg-[#d64f22] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Simpan Bisnis"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
