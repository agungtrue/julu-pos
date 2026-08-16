"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { endpoints } from "../../config/enpoints";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { UserPerformanceSection } from "@/components/UserPerformanceSection";
import {
  ProductSalesSummarySection,
  ProductType,
} from "@/components/ProductSalesSummarySection";
import { useAuthStore } from "@/stores/authStore";
import { LowStockModal } from "@/components/LowStockModal";
import { getPeriodLabel, formatDateYMD, formatIndo, getTodayWIB } from "@/lib/utils";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function DashboardPage() {
  type TimeFilterType =
    | "today"
    | "yesterday"
    | "month"
    | "last_month"
    | "custom";

  interface DateRange {
    startDate: string;
    endDate: string;
  }

  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [timeFilter, setTimeFilter] = useState<
    "today" | "month" | "yesterday" | "last_month" | "custom"
  >("today");

  const todayStr = getTodayWIB()

  const [appliedFilter, setAppliedFilter] = useState({
    startDate: todayStr,
    endDate: todayStr,
  });
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: todayStr,
    endDate: todayStr,
  });

  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  const getDateParamsForThisMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return {
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-${day}`,
    };
  };

  const getDateParamsForYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);

    // Kurangi 1 hari dari hari ini
    yesterday.setDate(today.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    // Karena hanya 1 hari, startDate dan endDate nilainya sama
    return {
      startDate: formattedDate,
      endDate: formattedDate,
    };
  };

  const getDateParamsForLastMonth = () => {
    const today = new Date();

    // Trik JS: month - 1 otomatis mundur ke tahun sebelumnya jika sekarang Januari
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    // Trik JS: tanggal 0 otomatis memberikan tanggal terakhir dari bulan sebelumnya
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);

    const startYear = firstDay.getFullYear();
    const startMonth = String(firstDay.getMonth() + 1).padStart(2, "0");
    const startDay = String(firstDay.getDate()).padStart(2, "0");

    const endYear = lastDay.getFullYear();
    const endMonth = String(lastDay.getMonth() + 1).padStart(2, "0");
    const endDay = String(lastDay.getDate()).padStart(2, "0");

    return {
      startDate: `${startYear}-${startMonth}-${startDay}`,
      endDate: `${endYear}-${endMonth}-${endDay}`,
    };
  };

  const fetchSummaryData = async (
    filter: "today" | "month" | "yesterday" | "last_month" | "custom",
  ) => {
    // let url = endpoints.orders.summary.get;
    let url = endpoints.dashboard.summary;

    if (filter === "month") {
      const { startDate, endDate } = getDateParamsForThisMonth();
      url = `${url}?startDate=${startDate}&endDate=${endDate}`;
    } else if (filter === "yesterday") {
      const { startDate, endDate } = getDateParamsForYesterday();
      url = `${url}?startDate=${startDate}&endDate=${endDate}`;
    } else if (filter === "last_month") {
      const { startDate, endDate } = getDateParamsForLastMonth();
      url = `${url}?startDate=${startDate}&endDate=${endDate}`;
    } else if (filter === "custom") {
      url = `${url}?startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
    }

    const response = await api.get(url);
    return response?.data?.data?.[0];
  };

  const handlePresetClick = (filter: TimeFilterType) => {
    if (filter !== "custom") {
      setShowCustomPicker(false);
    } else {
      setShowCustomPicker(!showCustomPicker);
    }
  };

  const handleCustomApply = () => {
    if (customRange.startDate && customRange.endDate) {
      setAppliedFilter((prev) => ({
        ...prev,
        startDate: customRange.startDate,
        endDate: customRange.endDate,
      }));
      setTimeFilter("custom");
      setShowCustomPicker(false);
    }
  };

  const { data: summary, isLoading } = useQuery({
    // queryKey: ["orderSummaryData", timeFilter],
    queryKey: [
      "orderSummaryData",
      {
        timeFilter,
        startDate: appliedFilter.startDate,
        endDate: appliedFilter.endDate,
      },
    ],
    queryFn: () => fetchSummaryData(timeFilter),
    enabled: user?.role !== "SUPER_ADMIN",
  });

  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      router.replace("/dashboard/admin");
    }
  }, [user, router]);

  if (user?.role === "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0A8F8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getRemainingDays = (endDate?: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  //   return <DashboardSkeleton/>
  if (isLoading) return <DashboardSkeleton />;

  //   console.log({ summary })

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const remainingDays =
    getRemainingDays(summary?.tenantSubscription?.endDate) ?? 0;
  const isUrgent = remainingDays <= 3;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative pl-3.5 border-l-4 border-teal-600">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Halo, {user?.name}</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-teal-700 text-lg font-bold">
              Ringkasan Performa
            </span>
          </h1>

          <p className="text-xs text-gray-400 font-medium mt-0.5">
            PERIODE:{" "}
            {timeFilter === "custom"
              ? `Kustom (${formatIndo(new Date(customRange.startDate))} - ${formatIndo(new Date(customRange.endDate))})`
              : getPeriodLabel(timeFilter)}{" "}
            • {user?.tenant?.name}
          </p>
        </div>
        <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 w-fit shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span className="text-xs font-semibold text-gray-600">
            Progress Balik Modal:{" "}
            <span className="text-[#EF5B2B] font-bold">
              {Math.floor(summary?.breakEvenRevenue?.actualVsTargetPercentage)}%
            </span>
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full my-4">
        {/* 1. LEFT SIDE: TIME FILTER + DATE PICKER */}
        <div className="flex flex-wrap items-center bg-gray-100 p-1 rounded-xl w-fit self-start sm:self-center gap-0.5">
          <button
            onClick={() => setTimeFilter("today")}
            className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              timeFilter === "today"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Hari Ini
          </button>

          <button
            onClick={() => setTimeFilter("yesterday")}
            className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              timeFilter === "yesterday"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Kemarin
          </button>

          <button
            onClick={() => setTimeFilter("month")}
            className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              timeFilter === "month"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Bulan Ini
          </button>

          <button
            onClick={() => setTimeFilter("last_month")}
            className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              timeFilter === "last_month"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Bulan Lalu
          </button>

          <button
            onClick={() => handlePresetClick("custom")}
            className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              timeFilter === "custom"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kustom</span>
          </button>
        </div>

        {user?.role === "OWNER_ADMIN" && (
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-teal-50/90 to-emerald-50/80 border border-teal-100/80 px-3.5 py-2 rounded-xl self-end md:self-center shadow-2xs">
            {/* Indicator Dot (Hijau Pulse) */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            <div className="text-xs flex items-center gap-2">
              <span className="font-extrabold text-teal-900 tracking-tight text-[14px]">
                {summary?.tenantSubscription?.plan?.name || "-"}
              </span>
              <span className="text-gray-300">•</span>

              <Link
                href="/billing"
                title="Klik untuk perpanjang langganan"
                className={`font-bold px-2.5 py-0.5 rounded-md text-[14px] transition-all flex items-center gap-1.5 group hover:shadow-sm ${
                  isUrgent
                    ? "bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300 animate-pulse"
                    : "bg-teal-100/60 hover:bg-teal-200/80 text-teal-800"
                }`}
              >
                <span>Sisa {remainingDays} hari lagi</span>
                <span className="text-xs font-black underline group-hover:translate-x-0.5 transition-transform">
                  Perpanjang →
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {user?.role === "OWNER_ADMIN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Total Pendapatan
              </span>
              <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {formatIDR(summary?.revenues)}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Rata-rata Harian:{" "}
              <span className="text-gray-700 font-semibold">
                {formatIDR(summary?.transactionMetrics.avgRevPerDay)}
              </span>
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Target:{" "}
              <span className="text-gray-700 font-semibold">
                {formatIDR(summary?.breakEvenRevenue.targetAmount)}
              </span>
            </p>
            {/* Target Amount: {formatIDR(summary?.breakEvenRevenue.targetAmount)} */}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Total Biaya Bahan Baku (HPP)
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {formatIDR(summary?.revenues - summary?.grossIncomes)}
              </h3>
            </div>
            <p className="text-xs text-[#0F766E] font-bold bg-[#0F766E]/5 px-2.5 py-1 rounded-lg w-fit">
              Rasio HPP: {Math.round(summary?.marginPercentages?.cogsMargin)}%
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Keuntungan Kotor (Gross)
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {formatIDR(summary?.grossIncomes)}
              </h3>
            </div>
            <p className="text-xs text-[#0F766E] font-bold bg-[#0F766E]/5 px-2.5 py-1 rounded-lg w-fit">
              Gross Margin:{" "}
              {Math.round(summary?.marginPercentages?.grossMargin)}%
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Biaya Operasional Harian
              </span>
              <h3 className={`text-2xl font-black tracking-tight text-red-500`}>
                {formatIDR(summary?.totalOpex)}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {/* Sisa target ke profit: <span className="text-red-500 font-bold">{formatIDR(Math.floor(summary?.breakEvenRevenue?.excessRevenueAmount))} lagi</span> */}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Total Loss Bahan Baku/Operasional
              </span>
              <h3 className="text-2xl font-black text-red-500 tracking-tight">
                {formatIDR(Math.abs(summary?.lossMutation?.totalNominal))}
              </h3>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">
                <span className="text-red-500 font-semibold">
                  {summary?.lossMutation?.count}x
                </span>{" "}
                Catatan
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Keuntungan Bersih
              </span>
              <h3
                className={`text-2xl font-black tracking-tight ${summary?.netIncomes < 0 ? "text-red-500" : "text-green-600"}`}
              >
                {formatIDR(summary?.netIncomes)}
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {summary?.breakEvenRevenue?.excessRevenueAmount < 0 ? (
                <>
                  Sisa target ke profit:{" "}
                  <span className="text-red-500 font-bold">
                    {formatIDR(
                      Math.floor(
                        summary?.breakEvenRevenue?.excessRevenueAmount,
                      ),
                    )}{" "}
                    lagi
                  </span>
                </>
              ) : (
                <p className="text-xs text-green-600 font-bold bg-[#0F766E]/5 px-2.5 py-1 rounded-lg w-fit">
                  Profitable:{" "}
                  {Math.floor(
                    summary?.breakEvenRevenue?.excessRevenuePercentage,
                  )}
                  %
                </p>
              )}
            </span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Total Pesanan
              </span>
              <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {summary?.transactions}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {/* Rata-rata Harian: <span className="text-gray-700 font-semibold">{formatIDR(summary?.transactionMetrics.avgRevPerDay)}</span> */}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Item Terjual/Target Item
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {summary?.totalItemsSold}/
                {Math.ceil(summary?.breakEvenRevenue?.targetItemsCount)}
              </h3>
            </div>

            {/* <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Cemilan terjual/Target Cemilan
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {summary?.snacks}/
                {Math.ceil(summary?.breakEvenRevenue?.targetSnackCount)}
              </h3>
            </div> */}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Cash
              </span>
              <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {formatIDR(summary?.paymentMethods?.amounts?.cash)}
              </h3>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                QRIS
              </span>
              <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {formatIDR(summary?.paymentMethods?.amounts?.qris)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE */}
      {user?.role === "EMPLOYEE" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 1: REVENUE */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Total Pendapatan
              </span>
              <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {formatIDR(summary?.revenues)}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Rata-rata Harian:{" "}
              <span className="text-gray-700 font-semibold">
                {formatIDR(summary?.transactionMetrics.avgRevPerDay)}
              </span>
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Target:{" "}
              <span className="text-gray-700 font-semibold">
                {formatIDR(summary?.breakEvenRevenue.targetAmount)}
              </span>
            </p>
            {/* Target Amount: {formatIDR(summary?.breakEvenRevenue.targetAmount)} */}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Orders
              </span>
              <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                {summary?.transactions}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {/* Rata-rata Harian: <span className="text-gray-700 font-semibold">{formatIDR(summary?.transactionMetrics.avgRevPerDay)}</span> */}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Cups/Target Cups
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {summary?.cups.total}/
                {Math.ceil(summary?.breakEvenRevenue?.targetCupsCount)}
              </h3>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Snacks/Target Snacks
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {summary?.snacks}/
                {Math.ceil(summary?.breakEvenRevenue?.targetSnackCount)}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Cash
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {formatIDR(summary?.paymentMethods?.amounts?.cash)}
              </h3>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                QRIS
              </span>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {formatIDR(summary?.paymentMethods?.amounts?.qris)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {user?.role === "OWNER_ADMIN" && (
        <div
          onClick={() => {
            if (summary?.stockAlerts?.length > 0) {
              setIsLowStockModalOpen(true);
            }
          }}
          className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex items-center justify-between group ${
            summary?.stockAlerts?.length > 0
              ? "border-amber-200 bg-amber-50/20 hover:border-amber-300 cursor-pointer"
              : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                summary?.stockAlerts?.length > 0
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "bg-[#0A8F8A]/10 text-[#0A8F8A]"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                Stok Kritis
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-extrabold tracking-tight ${
                    summary?.stockAlerts?.length > 0
                      ? "text-amber-600"
                      : "text-gray-900"
                  }`}
                >
                  {summary?.stockAlerts?.length || 0}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Bahan
                </span>
              </div>
            </div>
          </div>

          {summary?.stockAlerts?.length > 0 ? (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100/60 px-3 py-1.5 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
              <span>Lihat Detail</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A8F8A] bg-[#0A8F8A]/10 px-2.5 py-1 rounded-full">
              Aman
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ProductSalesSummarySection
          categorySales={summary?.categorySales}
          averageBasketSize={summary?.transactionMetrics?.avgTransactionValue}
          txPerDay={summary?.transactionMetrics?.avgTransactionsPerDay}
        />

        {user?.role === "OWNER_ADMIN" && (
          <UserPerformanceSection performances={summary.performances} />
        )}

        <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 border-l-4 border-[#EF5B2B] pl-3">
            Menu Paling Laris (Best Seller)
          </h4>

          <div
            className="h-65 overflow-y-auto pr-2 space-y-4
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
          >
            {/* @ts-ignore */}
            {summary?.bestSellers.map((item, index) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 font-mono">
                    {item.count} Porsi ({Math.ceil(item.percentage)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0
                        ? "bg-[#0F766E]"
                        : index === 1
                          ? "bg-[#EF5B2B]"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${(item.count / 75) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCustomPicker && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowCustomPicker(false)}
        >
          {/* Modal Container */}
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Pilih Rentang Tanggal
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Atur periode transaksi yang ingin dianalisis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body Modal (Form Inputs) */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={customRange.startDate}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {}
                  }}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={customRange.endDate}
                  max={formatDateYMD(new Date())}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {}
                  }}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Footer Modal (Action Buttons) */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCustomApply}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      <LowStockModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        stockAlerts={summary?.stockAlerts || []}
      />
      <ScrollToTop />
    </div>
  );
}
