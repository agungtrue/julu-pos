"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { endpoints } from "../../config/enpoints";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { UserPerformanceSection } from "@/components/UserPerformanceSection";
import { ProductSalesSummarySection } from "@/components/ProductSalesSummarySection";
import { useAuthStore } from "@/stores/authStore";
import { LowStockModal } from "@/components/LowStockModal";
import {
  getPeriodLabel,
  formatDateYMD,
  formatIndo,
  getTodayWIB,
} from "@/lib/utils";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Coffee,
  Banknote,
  QrCode,
  DollarSignIcon,
  LayoutDashboard,
} from "lucide-react";
import { Toaster } from "sonner";
import RevenueTrendChart from "@/components/RevenueTrendChart";
import {
  DonutChartCard,
  DonutChartDataItem,
} from "@/components/DonutChartCard";

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

  type DashboardTab = "summary" | "analytics";

  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [timeFilter, setTimeFilter] = useState<
    "today" | "month" | "yesterday" | "last_month" | "custom"
  >("today");

  const todayStr = getTodayWIB();

  const [appliedFilter, setAppliedFilter] = useState({
    startDate: todayStr,
    endDate: todayStr,
  });
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: todayStr,
    endDate: todayStr,
  });

  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("summary");

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

  const getDateParamsForLast7Days = () => {
    const today = new Date();

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    return {
      startDate: formatDateYMD(sevenDaysAgo),
      endDate: formatDateYMD(today),
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

  const fetchTrendData = async () => {
    let url = endpoints.dashboard.trends;

    const { startDate, endDate } = getDateParamsForLast7Days();
    url = `${url}?startDate=${startDate}&endDate=${endDate}`;

    const response = await api.get(url);
    return response?.data?.data?.[0];
  };

  const { data: trendData } = useQuery({
    queryKey: ["orderTrendData"],
    queryFn: () => fetchTrendData(),
    enabled: user?.role !== "SUPER_ADMIN",
  });

  const orderTrendData = trendData || [];

  // console.log({ orderTrendData })

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

  enum ProductType {
    COFFEE = "coffee",
    NON_COFFEE = "non_coffee",
    SNACKS = "snacks",
    TOPPING = "topping",
    RETAIL = "retail",
    GROCERY = "grocery",
    FRESH_PRODUCE = "fresh_produce",
    SERVICE = "service",
    OTHER = "other",
  }

  const PRODUCT_TYPE_COLORS: Record<ProductType, string> = {
    [ProductType.COFFEE]: "#0284c7", // Sky Blue (Brand utama Julu Coffee)
    [ProductType.NON_COFFEE]: "#0d9488", // Teal
    [ProductType.SNACKS]: "#f97316", // Orange
    [ProductType.TOPPING]: "#ec4899", // Pink/Rose
    [ProductType.RETAIL]: "#8b5cf6", // Purple/Violet
    [ProductType.GROCERY]: "#f59e0b", // Amber/Yellow
    [ProductType.FRESH_PRODUCE]: "#10b981", // Emerald Green
    [ProductType.SERVICE]: "#6366f1", // Indigo
    [ProductType.OTHER]: "#64748b", // Slate Gray
  };

  const getProductTypeColor = (type: ProductType | string): string => {
    const normalizedType = type?.toLowerCase() as ProductType;
    return (
      PRODUCT_TYPE_COLORS[normalizedType] ||
      PRODUCT_TYPE_COLORS[ProductType.OTHER]
    );
  };

  const mapingCategoryData =
    summary?.categorySales?.map((data: any) => {
      return {
        name: data.type,
        value: data.count,
        color: getProductTypeColor(data.type),
      };
    }) || [];

  const categoryData: DonutChartDataItem[] = mapingCategoryData;

  const paymentData: DonutChartDataItem[] = [
    {
      name: "QRIS",
      value: summary?.paymentMethods?.qrisCount || 0,
      color: "#8b5cf6",
    },
    {
      name: "Tunai",
      value: summary?.paymentMethods?.cashCount || 0,
      color: "#22c55e",
    },
  ];

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
  const isProfit = (summary?.netIncomes ?? 0) >= 0;
  const targetItem =
    Math.ceil(summary?.breakEvenRevenue?.targetItemsCount) || 1;
  const itemSold = summary?.totalItemsSold || 0;
  const itemProgress = Math.min(100, Math.round((itemSold / targetItem) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative pl-3.5 border-l-4 border-teal-600">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Halo, {user?.name}</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-teal-700 text-lg font-bold">
              Ringkasan Performa & Analitik
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
            Pencapaian Target Harian:{" "}
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

      <div className="flex items-center justify-between">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "summary"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Ringkasan Performa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "analytics"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Grafik Analitik</span>
          </button>
        </div>
      </div>

      {activeTab === "summary" && (
        <>
          {user?.role === "OWNER_ADMIN" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#0F766E]/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#0F766E]/5 rounded-full blur-2xl group-hover:bg-[#0F766E]/10 transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Pendapatan
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                    {formatIDR(summary?.revenues)}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                  <span className="text-slate-400">
                    Rata-rata:{" "}
                    <strong className="text-slate-700 font-semibold">
                      {formatIDR(summary?.transactionMetrics.avgRevPerDay)}
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    Target:{" "}
                    <strong className="text-slate-700 font-semibold">
                      {formatIDR(summary?.breakEvenRevenue.targetAmount)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Modal Bahan Baku (HPP)
                    </span>
                    {/* Ratio Pill Badge */}
                    <span className="text-[12px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                      Rasio:{" "}
                      {Math.round(summary?.marginPercentages?.cogsMargin)}%
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {formatIDR(summary?.totalCogs)}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  Total modal bahan dari menu terjual
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Keuntungan Kotor
                    </span>
                    <span className="text-[12px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                      Rasio:{" "}
                      {Math.round(summary?.marginPercentages?.grossMargin)}%
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {formatIDR(summary?.grossIncomes)}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  Omset dikurangi modal bahan baku
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Biaya Operasional
                    </span>
                    {/* <span className="text-[12px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Rasio: {Math.round(summary?.marginPercentages?.grossMargin)}%
                </span> */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600`}
                    >
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-red-500">
                    {formatIDR(summary?.totalOpex)}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  Beban rutin (gaji, listrik, sewa, dll)
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Bahan Terbuang/Basi (Loss)
                    </span>
                    <span className="text-[10px] font-bold text-red-500 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      {summary?.lossMutation?.count} {" Catatan"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-red-500">
                    {formatIDR(Math.abs(summary?.lossMutation?.totalNominal))}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  Nilai bahan tumpah, basi, atau rusak
                </p>
              </div>

              <div
                className={`group relative bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isProfit
                    ? "border-slate-200/80 hover:border-emerald-300"
                    : "border-rose-200/80 bg-rose-50/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Keuntungan Bersih
                    </span>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isProfit
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      <DollarSignIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3
                    className={`text-2xl font-black tracking-tight ${
                      isProfit ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatIDR(summary?.netIncomes)}
                  </h3>
                </div>

                {summary?.breakEvenRevenue?.excessRevenueAmount < 0 ? (
                  <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs mt-3">
                    <span className="text-slate-400">Target Profit:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[12px] ${
                        isProfit
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      Butuh{" "}
                      {formatIDR(
                        Math.abs(
                          Math.floor(
                            summary?.breakEvenRevenue?.excessRevenueAmount,
                          ),
                        ),
                      )}{" "}
                      lagi
                    </span>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs mt-3">
                    <span className="text-slate-400">Laba Bersih:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[12px] ${
                        isProfit
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {Math.floor(
                        summary?.breakEvenRevenue?.excessRevenuePercentage,
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>

              <div className="group relative bg-white border border-slate-200/80 hover:border-teal-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Pesanan
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                    {summary?.transactions || 0}
                    <span className="text-sm font-normal text-slate-400 ml-1.5">
                      transaksi
                    </span>
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Status Transaksi
                  </span>
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    Terproses
                  </span>
                </div>
              </div>

              <div className="group bg-white border border-slate-200/80 hover:border-teal-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Penjualan Item
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Coffee className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                      {itemSold}
                    </h3>
                    <span className="text-sm font-semibold text-slate-400">
                      / {targetItem} item
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-medium">
                      Pencapaian Target
                    </span>
                    <span className="font-bold text-[#0F766E]">
                      {itemProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${itemProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Metode Pembayaran
                </span>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Tunai (Cash)</span>
                    </div>
                    <p className="text-sm font-black text-emerald-800 tracking-tight mt-1">
                      {formatIDR(summary?.paymentMethods?.amounts?.cash)}
                    </p>
                  </div>

                  <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-sky-700 text-[10px] font-bold uppercase">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QRIS</span>
                    </div>
                    <p className="text-sm font-black text-sky-800 tracking-tight mt-1">
                      {formatIDR(summary?.paymentMethods?.amounts?.qris)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMPLOYEE */}
          {user?.role === "EMPLOYEE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CARD 1: REVENUE */}
              <div className="group relative bg-white border border-slate-200/80 hover:border-[#0F766E]/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#0F766E]/5 rounded-full blur-2xl group-hover:bg-[#0F766E]/10 transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Pendapatan
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">
                    {formatIDR(summary?.revenues)}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                  <span className="text-slate-400">
                    Rata-rata:{" "}
                    <strong className="text-slate-700 font-semibold">
                      {formatIDR(summary?.transactionMetrics.avgRevPerDay)}
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    Target:{" "}
                    <strong className="text-slate-700 font-semibold">
                      {formatIDR(summary?.breakEvenRevenue.targetAmount)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="group relative bg-white border border-slate-200/80 hover:border-teal-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Pesanan
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                    {summary?.transactions || 0}
                    <span className="text-sm font-normal text-slate-400 ml-1.5">
                      transaksi
                    </span>
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Status Transaksi
                  </span>
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    Terproses
                  </span>
                </div>
              </div>

              <div className="group bg-white border border-slate-200/80 hover:border-teal-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Penjualan Item
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Coffee className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                      {itemSold}
                    </h3>
                    <span className="text-sm font-semibold text-slate-400">
                      / {targetItem} item
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-medium">
                      Pencapaian Target
                    </span>
                    <span className="font-bold text-[#0F766E]">
                      {itemProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${itemProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-40">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Metode Pembayaran
                </span>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Cash</span>
                    </div>
                    <p className="text-sm font-black text-emerald-800 tracking-tight mt-1">
                      {formatIDR(summary?.paymentMethods?.amounts?.cash)}
                    </p>
                  </div>

                  <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-sky-700 text-[10px] font-bold uppercase">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QRIS</span>
                    </div>
                    <p className="text-sm font-black text-sky-800 tracking-tight mt-1">
                      {formatIDR(summary?.paymentMethods?.amounts?.qris)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ProductSalesSummarySection
              categorySales={summary?.categorySales}
              averageBasketSize={
                summary?.transactionMetrics?.avgTransactionValue
              }
              txPerDay={summary?.transactionMetrics?.avgTransactionsPerDay}
            />

            {user?.role === "OWNER_ADMIN" && (
              <UserPerformanceSection performances={summary?.performances} />
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
                {summary?.bestSellers?.map((item, index) => (
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
                {summary?.bestSellers?.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-400 font-medium">
                    Tidak ada transaksi hari ini.
                  </div>
                )}
              </div>
            </div>
          </div>

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
        </>
      )}

      {activeTab === "analytics" && (
        <>
          {user?.role === "OWNER_ADMIN" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DonutChartCard
                  title="Produk Terjual"
                  data={categoryData}
                  centerLabel="Total Item"
                  unit="Cup/Porsi"
                />

                <DonutChartCard
                  title="Metode Pembayaran"
                  data={paymentData}
                  centerLabel="Transaksi"
                  unit="Tx"
                />
              </div>
              <RevenueTrendChart data={orderTrendData} />
            </>
          )}
        </>
      )}

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
      <Toaster />
    </div>
  );
}
