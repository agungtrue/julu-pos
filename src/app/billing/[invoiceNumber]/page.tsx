"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { endpoints } from "../../../config/enpoints";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceNumber = params?.invoiceNumber as string;

  const [copied, setCopied] = useState(false);
  const accountNumber = "0840550583";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // LIVE POLLING DETAIL INVOICE
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
      if (status === "PAID") return false;
      return 3000;
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
              className="w-full cursor-pointer text-center text-xs text-gray-500 font-semibold py-2 bg-transparent border border-gray-200 rounded-xl"
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
                {/* <div className="flex gap-3 items-start">
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
                </div> */}

                <div className="flex gap-3.5 items-start">
                  {/* 1. Step Indicator Badge */}
                  <div className="w-7 h-7 rounded-xl bg-[#0A8F8A]/10 text-[#0A8F8A] font-black flex items-center justify-center shrink-0 border border-[#0A8F8A]/20 text-xs shadow-2xs">
                    1
                  </div>

                  {/* 2. Content Area */}
                  <div className="flex-1 space-y-2.5">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Transfer Manual Bank
                      </h4>
                      <p className="text-xs text-gray-500">
                        Lakukan pembayaran sesuai nominal tepat ke rekening
                        berikut:
                      </p>
                    </div>

                    {/* 💳 REKENING CARD IMPROVEMENT */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                      {/* Header Bank & Nama Pemilik */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-md border border-blue-100 uppercase tracking-wider">
                            Bank BCA
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600 font-medium">
                            a.n{" "}
                            <strong className="text-gray-900 font-bold">
                              Syuhada Dwi Agung
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Nomor Rekening & Tombol Copy */}
                      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
                            Nomor Rekening
                          </span>
                          <span className="font-mono text-base font-black text-gray-900 tracking-wider">
                            {accountNumber}
                          </span>
                        </div>

                        {/* BUTTON COPY TO CLIPBOARD */}
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={`px-3 py-1.5 cursor-pointer rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 active:scale-95 ${
                            copied
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-gray-100 hover:bg-[#0A8F8A] text-gray-700 hover:text-white border border-gray-200 hover:border-[#0A8F8A]"
                          }`}
                        >
                          {copied ? (
                            <>
                              {/* Icon Checkmark */}
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              {/* Icon Copy / Clipboard */}
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 002-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
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
                Kirim Bukti Pembayaran via WA
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
