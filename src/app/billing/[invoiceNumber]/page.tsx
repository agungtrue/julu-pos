"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { endpoints } from "../../../config/enpoints";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceNumber = params?.invoiceNumber as string;

  // 🔄 LIVE POLLING DETAIL INVOICE
  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invoiceDetail", invoiceNumber],
    queryFn: async () => {
      const url = endpoints.subscriptions.invoiceDetail(invoiceNumber);
      const res = await api.get(url);
      return res.data?.data || res.data;
    },
    enabled: !!invoiceNumber,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Jika status invoice SUDAH dibayar, hentikan polling
      if (status === "PAID") return false;
      return 3000; // Refetch setiap 3 detik
    },
  });

  // 🚀 AUTO REDIRECT JIKA INVOICE STATUS SUDAH "PAID"
  useEffect(() => {
    if (invoice?.status === "PAID") {
      window.location.href = "/dashboard";
    }
  }, [invoice]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0A8F8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-600 font-bold">
          Invoice tidak ditemukan atau telah kedaluwarsa.
        </p>
        <button
          onClick={() => router.push("/billing")}
          className="mt-4 px-4 py-2 bg-[#0A8F8A] text-white font-bold rounded-xl"
        >
          Kembali ke Pilihan Paket
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col justify-center items-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-8">
        {/* 🔴 INDIKATOR LIVE POLLING */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Memeriksa Status Invoice #{invoice.invoiceNumber}...
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Sistem akan otomatis masuk ke aplikasi begitu pembayaran
                diverifikasi Admin.
              </p>
            </div>
          </div>
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* DETAILS & INSTRUCTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Detail Tagihan
            </h3>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <p className="text-[11px] font-bold text-gray-400 uppercase">
                Nomor Invoice
              </p>
              <p className="text-sm font-mono font-black text-gray-800 mt-0.5">
                {invoice.invoiceNumber}
              </p>

              <p className="text-[11px] font-bold text-gray-400 uppercase mt-3">
                Paket Perpanjangan
              </p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {invoice.plan?.name}
              </p>

              <p className="text-[11px] font-bold text-gray-400 uppercase mt-3">
                Total Nominal
              </p>
              <p className="text-2xl font-black text-[#0A8F8A] mt-0.5">
                Rp {Number(invoice.amount).toLocaleString("id-ID")}
              </p>
            </div>

            <button
              onClick={() => router.push("/billing")}
              className="w-full text-center text-xs text-gray-500 font-semibold py-2 bg-transparent border border-gray-200 rounded-xl"
            >
              ← Ganti Paket / Buat Tagihan Baru
            </button>
          </div>

          <div className="lg:col-span-3 bg-gray-50/50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                Instruksi Pembayaran Manual
              </h3>

              <div className="flex flex-col gap-4 text-xs text-gray-700">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-[#0A8F8A]/10 text-[#0A8F8A] font-bold flex items-center justify-center shrink-0 border border-[#0A8F8A]/20">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      Setor Tunai Langsung di Booth
                    </p>
                    <p className="text-gray-600 mt-0.5 leading-relaxed">
                      Datang & serahkan pembayaran cash ke kasir/tim di{" "}
                      <b className="text-gray-800">
                        Booth Julu Coffee & Snacks
                      </b>{" "}
                      terdekat.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-[#0A8F8A]/10 text-[#0A8F8A] font-bold flex items-center justify-center shrink-0 border border-[#0A8F8A]/20">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      Transfer Manual Bank
                    </p>
                    <p className="text-gray-700 font-mono mt-1 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs leading-normal">
                      Bank BCA <br />
                      No. Rek:{" "}
                      <span className="font-bold text-gray-900">
                        0840550583
                      </span>{" "}
                      <br />
                      a.n:{" "}
                      <span className="font-bold text-gray-900">
                        Syuhada Dwi Agung
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={invoice.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-center text-sm font-bold rounded-xl transition-all shadow-md block"
              >
                Konfirmasi Pembayaran via WA
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
