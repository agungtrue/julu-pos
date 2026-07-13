"use client";

import React, { useState } from "react";

export default function SubscriptionExpiredPage() {
  const [selectedPackage, setSelectedPackage] = useState("3_MONTHS");

  const packages = [
    {
      id: "1_MONTH",
      name: "Bulanan (Pioneer)",
      duration: "1 Bulan",
      price: 89000,
      normalPrice: 149000,
      savings: "Harga Coret Promo",
      tag: "FLAT 1 TAHUN",
    },
    {
      id: "3_MONTHS",
      name: "Paket Uji Coba",
      duration: "3 Bulan",
      price: 249000,
      normalPrice: 269910,
      savings: "Hemat Rp 20.910",
      tag: "POPULER",
    },
    {
      id: "6_MONTHS",
      name: "Paket Best Value",
      duration: "6 Bulan",
      price: 449000,
      normalPrice: 539820,
      savings: "Hemat Rp 90.820",
      tag: "HEMAT 1 BULAN",
    },
    {
      id: "1_YEAR",
      name: "Paket Juragan",
      duration: "1 Tahun",
      price: 799000,
      normalPrice: 1094635,
      savings: "Hemat Rp 295.635",
      tag: "GRATIS 3 BULAN",
    },
  ];

  const activePack =
    packages.find((p) => p.id === selectedPackage) || packages[1];

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col justify-center items-center p-4 md:p-8 font-sans select-none">
      {/* 🛑 LOGO & HEADER PERINGATAN (Dibuat jauh lebih kontras & tebal) */}
      <div className="text-center mb-8 max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-700 mb-4 shadow-sm">
          <svg
            className="w-8 h-8 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        {/* Naik ke text-gray-900 agar super pekat */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Masa Aktif Julu POS Habis
        </h1>
        {/* Diubah dari gray-400 ke gray-700 untuk keterbacaan tinggi */}
        <p className="text-sm text-gray-700 font-medium mt-2 leading-relaxed">
          Akses masuk kasir dan pencatatan stok sementara terkunci. Silakan
          lakukan perpanjangan langganan untuk melanjutkan jualan.
        </p>
      </div>

      {/* 💳 CONTAINER UTAMA */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 animate-scale-up">
        {/* 👈 KIRI: PILIHAN PAKET BUNDLING */}
        <div className="lg:col-span-3 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
          {/* Judul seksi dinaikkan ke text-gray-700 */}
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
            1. Pilih Paket Perpanjangan
          </h3>

          <div className="flex flex-col gap-3">
            {packages.map((pkg) => {
              const isChosen = selectedPackage === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isChosen
                      ? "border-[#0A8F8A] bg-[#0A8F8A]/5 shadow-md scale-[1.01]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <span
                    className={`absolute -top-2.5 right-4 text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm tracking-wider ${
                      isChosen
                        ? "bg-[#EF5B2B] text-white"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {pkg.tag}
                  </span>

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="subscription_pack"
                      checked={isChosen}
                      onChange={() => setSelectedPackage(pkg.id)}
                      className="w-4 h-4 accent-[#0A8F8A]"
                    />
                    <div>
                      <p
                        className={`text-sm font-bold ${isChosen ? "text-[#0A8F8A]" : "text-gray-800"}`}
                      >
                        {pkg.name}
                      </p>
                      {/* Kontras durasi ditingkatkan */}
                      <p className="text-xs text-gray-600 mt-0.5">
                        Durasi Aktif:{" "}
                        <span className="font-bold text-gray-800">
                          {pkg.duration}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400 line-through font-medium">
                      Rp {pkg.normalPrice.toLocaleString("id-ID")}
                    </p>
                    <p className="text-base font-black text-gray-800 mt-0.5">
                      Rp {pkg.price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      {pkg.savings}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 👉 KANAN: INSTRUKSI PEMBAYARAN MANUAL */}
        <div className="lg:col-span-2 bg-gray-50/70 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
              2. Instruksi Pembayaran
            </h3>

            {/* Box Rangkuman Nominal Belanja */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-5">
              <p className="text-xs font-semibold text-gray-500">
                Total Tagihan Transaksi
              </p>
              <p className="text-2xl font-black text-[#0A8F8A] mt-0.5">
                Rp {activePack.price.toLocaleString("id-ID")}
              </p>
              <div className="mt-2 text-[11px] text-gray-500 font-semibold">
                Sistem aktif otomatis untuk{" "}
                <span className="text-[#0A8F8A] font-bold">
                  {activePack.duration}
                </span>{" "}
                ke depan.
              </div>
            </div>

            {/* Opsi Alur Bayar Manual (Lebih Gelap & Readable) */}
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
                    <b className="text-gray-800">Booth Julu Coffee & Snacks</b>{" "}
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
                      8420xxxxxx
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

          {/* 🚀 AKSI & NOTIFIKASI VALIDASI (Penambahan Fitur Request Anda) */}
          <div className="mt-6 space-y-3">
            <a
              href={`https://wa.me/6287769675686?text=Halo%20Super%20Admin%20Julu%20POS,%20saya%20ingin%20konfirmasi%20perpanjangan%20paket%20${encodeURIComponent(activePack.name)}%20sebesar%20Rp%20${activePack.price.toLocaleString("id-ID")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-center text-sm font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.973 0c3.184.001 6.177 1.242 8.426 3.496 2.249 2.254 3.487 5.251 3.484 8.437-.006 6.625-5.343 11.973-11.918 11.973-2.007-.001-3.98-.507-5.725-1.474L0 24zm6.052-3.414l.394.234c1.649.979 3.535 1.496 5.462 1.498 5.706 0 10.347-4.618 10.352-10.288.002-2.747-1.066-5.328-3.007-7.27C17.37 3.018 14.796 1.95 12.054 1.95c-5.719 0-10.36 4.62-10.366 10.29-.001 1.905.498 3.766 1.446 5.421l.256.445-.999 3.65 3.728-.971z" />
              </svg>
              Konfirmasi Pembayaran via WA
            </a>

            <button
              onClick={() => window.location.reload()}
              className="w-full text-center text-xs text-gray-600 hover:text-gray-900 font-bold py-1 bg-transparent border-0 cursor-pointer transition-all underline"
            >
              Cek Status Perpanjangan Ulang
            </button>

            {/* ✨ 🆕 BOX ALERT: KHUSUS UNTUK USER YANG SUDAH TERVALIDASI */}
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl shadow-xs text-center animate-fade-in mt-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Sudah Transfer & Tervalidasi?
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1 leading-normal">
                Jika pembayaran sudah dikonfirmasi Master Admin, silakan untuk
                masuk kembali.
              </p>
              <a
                href="/login"
                className="inline-block mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs"
              >
                Silakan Masuk / Login Kasir
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
