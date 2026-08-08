"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import api from "../../lib/api";
import { endpoints } from "../../config/enpoints";
import { MismatchDomainModal } from "@/components/MismatchDomainModal";
import axios from "axios";
interface CheckoutResponse {
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
  };
  plan: {
    id: string;
    name: string;
  };
  whatsappUrl: string;
}

export default function SubscriptionExpiredPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
//   console.log({ user });
  const [selectedPackage, setSelectedPackage] = useState("3_MONTHS");
  const [mismatchData, setMismatchData] = useState({
    currentDomain: "",
    targetDomain: "",
    targetUrl: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. SMART CHECK: Cek apakah user sebenarnya punya invoice PENDING yang belum dibayar
  const {
    data: tenantInfo,
    isLoading: isCheckingTenant,
    isError,
    error: tenantInfoError,
  } = useQuery({
    queryKey: ["tenantInfo"],
    queryFn: async () => {
      const id = user?.tenant?.id || ''
      const url = endpoints.tenants.status(id);

      const response = await api.get(url);
      return response.data;
    },
    retry: false,
  });

    // console.log({ tenantInfo, isError, tenantInfoError });

  useEffect(() => {
    if (isError && axios.isAxiosError(tenantInfoError)) {
      const errorData = tenantInfoError.response?.data;

      // Tangkap payload JSON yang kita buat di NestJS Guard tadi
      if (
        tenantInfoError.response?.status === 403 &&
        errorData?.code === "TENANT_DOMAIN_MISMATCH"
      ) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMismatchData({
          currentDomain: `${errorData.data.currentSubdomain}.julucoffee.com`,
          targetDomain: `${errorData.data.targetSubdomain}.julucoffee.com`,
          targetUrl: errorData.data.targetUrl,
        });
        setIsModalOpen(true);
      }
    }
  }, [isError, tenantInfoError, setIsModalOpen, setMismatchData]);

  const fetchpackageData = async () => {
    const url = endpoints.subscriptions.plans;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["packagesData"],
    queryFn: () => fetchpackageData(),
  });

  const packages = packagesData ?? [];

  //   console.log({ packages });

  const activePack =
    packages.find((p: any) => p.id === selectedPackage) || packages[1];

  // ⚡ 1. MUTATION: HIT CHECKOUT API
  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post(endpoints.subscriptions.checkout, {
        planId,
        paymentMethod: "BANK_TRANSFER",
      });
      return response.data?.data || response.data;
    },
    onSuccess: (data: CheckoutResponse) => {
      const { invoiceNumber } = data.invoice;
      window.location.href = `/billing/${invoiceNumber}`;
    },
    onError: ({ data }: any) => {
      console.log("onError", { data });
      if (data?.code === "TENANT_DOMAIN_MISMATCH") {
        console.log("in...");
        setIsModalOpen(true);

        setMismatchData({
          currentDomain: `${data.currentSubdomain}.julucoffee.com`,
          targetDomain: `${data.targetSubdomain}.julucoffee.com`,
          targetUrl: data.targetUrl,
        });
      }
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate(activePack?.id);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col justify-center items-center p-4 md:p-8 font-sans select-none">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-[9999]">
          <div className="w-8 h-8 border-4 border-[#0A8F8A]/20 border-t-[#0A8F8A] rounded-full animate-spin mb-2" />
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">
            Loading...
          </p>
        </div>
      )}

      {(user?.tenant?.subscriptions as any[])?.[0]?.status === "EXPIRED" && (
        <div className="mx-auto text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 text-[#EF5B2B] flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* 2. Judul Utama (H1) */}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Akses Kedai Sementara Terkunci
          </h1>

          {/* 3. Penjelasan Utama (Ganti H3 jadi p/subtext agar tidak membentur H1) */}
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Masa aktif langganan Julu POS untuk kedai ini telah berakhir.
          </p>

          {/* 4. Highlight Reassurance (Bikin User Tenang) */}
          <div className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-left flex items-start space-x-2.5">
            <span className="text-emerald-600 text-base">🛡️</span>
            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              <span className="font-bold">Tenang!</span> Seluruh data transaksi,
              stok, dan resep Anda{" "}
              <span className="underline decoration-emerald-300">
                tetap tersimpan aman
              </span>
              .
            </p>
          </div>

          {/* 5. Call To Action Prompt & Button */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              Yuk, perpanjang langganan sekarang agar kasir bisa kembali
              mencatat jualan!
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-scale-up">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
              1. Pilih Paket Perpanjangan
            </h3>

            <div className="flex flex-col gap-3">
              {packages.map((pkg: any) => {
                const isChosen = selectedPackage === pkg.id;
                // Hitung biaya per hari otomatis jika belum ada di data object (Asumsi 1 bulan = 30 hari)
                const days =
                  pkg.durationDays ||
                  (pkg.durationMonths ? pkg.durationMonths * 30 : 30);
                const dailyCost = pkg.dailyCost || Math.round(pkg.price / days);

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isChosen
                        ? "border-[#0A8F8A] bg-[#0A8F8A]/5 shadow-md scale-[1.01]"
                        : pkg.isRecommended
                          ? "border-amber-300/80 bg-amber-50/20 hover:border-amber-400 hover:bg-amber-50/50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    {/* 1. BADGES SECTION (TOP RIGHT) */}
                    <div className="absolute -top-3 right-4 flex items-center gap-1.5">
                      {/* Badge Rekomendasi Utama */}
                      {pkg.isRecommended && (
                        <span className="bg-gradient-to-r from-amber-500 to-[#EF5B2B] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase flex items-center gap-1 animate-pulse">
                          <span>⭐</span> Rekomendasi
                        </span>
                      )}

                      {/* Tag Hemat / Promo */}
                      {pkg.tag && (
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm tracking-wider uppercase ${
                            isChosen
                              ? "bg-[#EF5B2B] text-white"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {pkg.tag}
                        </span>
                      )}
                    </div>

                    {/* 2. LEFT SIDE: Radio & Package Detail */}
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="subscription_pack"
                        checked={isChosen}
                        onChange={() => setSelectedPackage(pkg.id)}
                        className="w-4 h-4 accent-[#0A8F8A] cursor-pointer"
                      />
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isChosen ? "text-[#0A8F8A]" : "text-gray-900"
                          }`}
                        >
                          {pkg.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Durasi Aktif:{" "}
                          <span className="font-bold text-gray-800">
                            {pkg.duration}
                          </span>
                        </p>

                        {/* 💡 BIAYA PER HARI HIGHLIGHT */}
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200/60 text-[10px] font-semibold text-emerald-700">
                          <span>⚡</span>
                          <span>
                            Cuma{" "}
                            <strong className="font-extrabold text-emerald-800">
                              Rp {dailyCost.toLocaleString("id-ID")}
                            </strong>{" "}
                            / hari
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. RIGHT SIDE: Pricing Breakdown */}
                    <div className="text-right">
                      {pkg.normalPrice && (
                        <p className="text-xs text-gray-400 line-through font-medium">
                          Rp {pkg.normalPrice?.toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="text-base font-black text-gray-900 mt-0.5">
                        Rp {pkg.price?.toLocaleString("id-ID")}
                      </p>
                      {pkg.savings && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          {pkg.savings}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-50/70 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                2. Ringkasan Pesanan
              </h3>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-5">
                <p className="text-xs font-semibold text-gray-500">
                  Paket Yang Dipilih
                </p>
                <p className="text-lg font-black text-gray-900 mt-0.5">
                  {activePack?.name}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Total Tagihan
                    </p>
                    <p className="text-2xl font-black text-[#0A8F8A] mt-0.5">
                      Rp {activePack?.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-gray-500 font-semibold">
                  Masa aktif bertambah{" "}
                  <span className="text-[#0A8F8A] font-bold">
                    {activePack?.duration}
                  </span>
                  .
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="w-full py-4 bg-[#0A8F8A] hover:bg-[#087773] active:scale-[0.99] text-white text-center text-sm font-bold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut ke Pembayaran</span>
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <MismatchDomainModal
          isOpen={isModalOpen}
          currentDomain={mismatchData.currentDomain}
          targetDomain={mismatchData.targetDomain}
          targetUrl={mismatchData.targetUrl}
        />
      )}
    </div>
  );
}
