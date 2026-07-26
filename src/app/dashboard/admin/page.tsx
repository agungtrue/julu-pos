"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import useRouter from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { endpoints } from "../../../config/enpoints";

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTenants: number;
  activeTenants: number;
  expiredTenants: number;
  pendingInvoicesCount: number;
  planBreakdown: {
    planName: string;
    count: number;
    percentage: number;
  }[];
  recentTransactions: {
    id: string;
    invoiceNumber: string;
    tenantName: string;
    planName: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminSuperDashboardPage() {
  // 🔄 FETCH DASHBOARD STATS
  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const res = await api.get(endpoints.subscriptions.admin.dashboarStats);
      return res.data?.data || res.data;
    },
    refetchInterval: 10000, // Refetch otomatis tiap 10 detik
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0A8F8A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500">Memuat Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-xs font-bold text-red-600">Gagal memuat data statistik.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-[#0A8F8A] text-white text-xs font-bold rounded-xl"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const activeTenantPercentage =
    stats.totalTenants > 0
      ? Math.round((stats.activeTenants / stats.totalTenants) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-3.5 sm:p-6 md:p-10 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 🟢 HEADER & SUMMARY ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0A8F8A]/10 text-[#0A8F8A] font-bold text-[10px] tracking-wider uppercase">
                Master Admin
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs font-medium text-gray-500">
                Julu POS Analytics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
              Performa & Omzet SaaS
            </h1>
          </div>

          <Link
            href="/dashboard/invoices"
            className="self-start sm:self-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-2xs hover:bg-gray-50 transition-all flex items-center gap-2 text-xs font-bold text-gray-700 active:scale-[0.98]"
          >
            <span>Daftar Verifikasi Invoice</span>
            {stats.pendingInvoicesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#EF5B2B] text-white text-[10px] font-black animate-pulse">
                {stats.pendingInvoicesCount}
              </span>
            )}
          </Link>
        </div>

        {/* 🚨 ALERT JIKA ADA INVOICE MENUNGGU APPROVAL */}
        {stats.pendingInvoicesCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Ada {stats.pendingInvoicesCount} Pembayaran Menunggu Konfirmasi!
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Segera periksa mutasi rekening dan lakukan verifikasi agar langganan tenant langsung aktif.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/invoices"
              className="w-full sm:w-auto text-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs shrink-0"
            >
              Proses Sekarang →
            </Link>
          </div>
        )}

        {/* 💳 GRID 1: KEY PERFORMANCE INDICATORS (KPI CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          
          {/* Card 1: Total Omzet */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Omzet Diterima
              </p>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
                💰
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                Rp {Number(stats.totalRevenue).toLocaleString("id-ID")}
              </p>
              <p className="text-[10.5px] text-emerald-600 font-bold mt-1">
                Akumulasi seluruh pembayaran valid
              </p>
            </div>
          </div>

          {/* Card 2: Omzet Bulan Ini */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Omzet Bulan Ini
              </p>
              <div className="w-8 h-8 rounded-xl bg-[#0A8F8A]/10 text-[#0A8F8A] flex items-center justify-center font-black text-sm">
                📈
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-[#0A8F8A]">
                Rp {Number(stats.monthlyRevenue).toLocaleString("id-ID")}
              </p>
              <p className="text-[10.5px] text-gray-500 font-medium mt-1">
                Perolehan bulan berjalan
              </p>
            </div>
          </div>

          {/* Card 3: Total Tenant */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Output Tenant
              </p>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                🏪
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-xl sm:text-2xl font-black text-gray-900">
                  {stats.totalTenants}
                </p>
                <span className="text-xs font-bold text-gray-500">Outlet</span>
              </div>
              <p className="text-[10.5px] text-gray-500 font-medium mt-1">
                {stats.activeTenants} Aktif · {stats.expiredTenants} Expired
              </p>
            </div>
          </div>

          {/* Card 4: Health Rate / Active % */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Rasio Tenant Aktif
              </p>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#EF5B2B] flex items-center justify-center font-black text-sm">
                ⚡
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                {activeTenantPercentage}%
              </p>
              {/* Progress Bar Mini */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#0A8F8A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeTenantPercentage}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* 📊 GRID 2: BREAKDOWN PLAN & RECENT TRANSACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          
          {/* 👈 KANAN DEKSTOP / ATAS MOBILE: TRANSAKSI TERAKHIR (3 COLS) */}
          <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Transaksi Langganan Terbaru
              </h3>
              <Link
                href="/dashboard/invoices"
                className="text-[11px] font-bold text-[#0A8F8A] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            {/* List Mobile & Table Desktop */}
            <div className="space-y-2.5">
              {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">
                        {tx.tenantName}
                      </p>
                      <p className="text-[10.5px] text-gray-500 font-mono mt-0.5">
                        {tx.invoiceNumber} · {tx.planName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900">
                        Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                          tx.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-gray-400">
                  Belum ada riwayat transaksi.
                </p>
              )}
            </div>
          </div>

          {/* 👉 KIRI DEKSTOP / BAWAH MOBILE: DISTRIBUSI PAKET (2 COLS) */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Popularitas Paket Langganan
            </h3>

            <div className="space-y-3 pt-1">
              {stats.planBreakdown && stats.planBreakdown.length > 0 ? (
                stats.planBreakdown.map((plan, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-700">{plan.planName}</span>
                      <span className="text-gray-900">
                        {plan.count} Tenant ({plan.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#EF5B2B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${plan.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-gray-400">
                  Data paket belum cukup.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}