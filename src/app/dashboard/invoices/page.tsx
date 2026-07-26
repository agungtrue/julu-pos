"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import api from "../../../lib/api";
import { endpoints } from "../../../config/enpoints";

export default function AdminInvoicesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // BACA FILTER DARI URL SEARCH PARAMS (Default: "pending")
  const activeStatus = searchParams.get("paymentStatus")?.toLowerCase() || "pending";

  // HANDLER GANTI TAB (UPDATE URL)
  const handleTabChange = (status: "pending" | "paid") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("paymentStatus", status);
    router.push(`${pathname}?${params.toString()}`);
  };

  // FETCH LIST INVOICE (DYNAMIC BERDASARKAN STATUS)
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["adminInvoices", activeStatus],
    queryFn: async () => {
      const url = endpoints.subscriptions.invoiceList;
      // Mengirimkan status query parameter ke backend (?status=PENDING atau ?status=PAID)
      const res = await api.get(url, {
        params: { status: activeStatus.toUpperCase() },
      });
      return res.data?.data || res.data;
    },
    refetchInterval: activeStatus === "pending" ? 5000 : false, // Auto-refresh hanya di tab pending
  });

  // MUTATION APPROVE PEMBAYARAN
  const approveMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return await api.patch(endpoints.subscriptions.approve(invoiceId));
    },
    onSuccess: () => {
      setSelectedInvoice(null);
      // Invalidate query agar data pending & paid langsung ter-update
      queryClient.invalidateQueries({ queryKey: ["adminInvoices"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Gagal mengonfirmasi pembayaran.");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#0A8F8A] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-500 mt-3">Memuat data invoice...</p>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* HEADER HALAMAN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b sm:border-0 border-gray-200 pb-3 sm:pb-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Verifikasi & Riwayat Invoice
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Kelola konfirmasi pembayaran masuk dan riwayat transaksi Julu POS.
            </p>
          </div>

          {/* Counter Badge Antrean (Hanya jika di tab pending) */}
          {activeStatus === "pending" && invoices && invoices.length > 0 && (
            <div className="self-start sm:self-auto px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>{invoices.length} Menunggu Approval</span>
            </div>
          )}
        </div>

        {/* 🗂️ TAB FILTER STATUS (PENDING vs PAID) */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
          <button
            onClick={() => handleTabChange("pending")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeStatus === "pending"
                ? "bg-[#0A8F8A] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Menunggu Verifikasi (Pending)
          </button>

          <button
            onClick={() => handleTabChange("paid")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeStatus === "paid"
                ? "bg-[#0A8F8A] text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            Riwayat Lunas (Paid)
          </button>
        </div>

        {/* MOBILE VIEW (CARD STACK) - Tampil di Layar HP & Tablet (< lg) */}
        <div className="block lg:hidden space-y-3.5">
          {invoices && invoices.length > 0 ? (
            invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3"
              >
                {/* Header Card: Invoice & Date */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                      No. Invoice
                    </span>
                    <span className="text-xs font-mono font-black text-gray-800">
                      {inv.invoiceNumber}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                    {new Date(inv.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Body Card: Tenant & Plan Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                      Nama Tenant
                    </span>
                    <p className="font-bold text-gray-800 truncate">
                      {inv.tenant?.name || "Tenant Tanpa Nama"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                      Paket Dipesan
                    </span>
                    <p className="font-semibold text-gray-700 truncate">
                      {inv.plan?.name}
                    </p>
                  </div>
                </div>

                {/* Nominal Tagihan */}
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500">
                    Total Tagihan:
                  </span>
                  <span className="text-base font-black text-[#0A8F8A]">
                    Rp {Number(inv.amount).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Action / Status Badge untuk Mobile */}
                {inv.status === "PAID" || activeStatus === "paid" ? (
                  <div className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1">
                    <span>✓ Lunas & Aktif</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    disabled={approveMutation.isPending}
                    className="w-full py-3 bg-[#0A8F8A] hover:bg-[#087773] active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>✓ Approve & Aktifkan Paket</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
              {activeStatus === "pending"
                ? "Tidak ada antrean pembayaran saat ini."
                : "Belum ada riwayat transaksi lunas."}
            </div>
          )}
        </div>

        {/* DESKTOP VIEW (TABLE) - Tampil Khusus Layar Laptop / Desktop (≥ lg) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100/70 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
              <tr>
                <th className="p-4">No. Invoice</th>
                <th className="p-4">Nama Tenant / Outlet</th>
                <th className="p-4">Paket Dipesan</th>
                <th className="p-4">Total Nominal</th>
                <th className="p-4">Tanggal Checkout</th>
                <th className="p-4 text-center">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/80 transition-all"
                  >
                    <td className="p-4 font-mono font-bold text-gray-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 font-semibold text-gray-700">
                      {inv.tenant?.name || "Tenant Tanpa Nama"}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {inv.plan?.name}
                    </td>
                    <td className="p-4 font-bold text-[#0A8F8A]">
                      Rp {Number(inv.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(inv.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      {inv.status === "PAID" || activeStatus === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl">
                          ✓ Lunas
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          disabled={approveMutation.isPending}
                          className="px-4 py-2 bg-[#0A8F8A] hover:bg-[#087773] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          ✓ Approve / Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    {activeStatus === "pending"
                      ? "Tidak ada antrean pembayaran saat ini."
                      : "Belum ada riwayat transaksi lunas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛡️ MODAL KONFIRMASI APPROVAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          {/* Box Modal */}
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-gray-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up">
            {/* Header Modal */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-black text-lg flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  Konfirmasi Pembayaran
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pastikan dana transfer sudah benar-benar masuk ke rekening.
                </p>
              </div>
            </div>

            {/* Ringkasan Data */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">No. Invoice:</span>
                <span className="font-mono font-bold text-gray-800">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Nama Tenant:</span>
                <span className="font-bold text-gray-800">
                  {selectedInvoice.tenant?.name || "Tenant"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Paket Dipesan:</span>
                <span className="font-semibold text-gray-700">
                  {selectedInvoice.plan?.name}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-600 font-bold">Total Diterima:</span>
                <span className="font-black text-[#0A8F8A] text-sm">
                  Rp {Number(selectedInvoice.amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setSelectedInvoice(null)}
                disabled={approveMutation.isPending}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={() => approveMutation.mutate(selectedInvoice.id)}
                disabled={approveMutation.isPending}
                className="w-full py-3 bg-[#0A8F8A] hover:bg-[#087773] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {approveMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Proses...</span>
                  </>
                ) : (
                  <span>Ya, Setujui</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}