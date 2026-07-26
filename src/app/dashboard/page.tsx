"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { endpoints } from "../../config/enpoints";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { useAuthStore } from "@/stores/authStore";
import { LowStockModal } from "@/components/LowStockModal";
import { getPeriodLabel } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [timeFilter, setTimeFilter] = useState<
    "today" | "month" | "yesterday" | "last_month"
  >("today");

  const [currentFilterDate, setCurrentFilterDate] = useState({
    startDate: '',
    endDate: '',
  })

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
    filter: "today" | "month" | "yesterday" | "last_month",
  ) => {
    let url = endpoints.orders.summary.get;

    if (filter === "month") {
      const { startDate, endDate } = getDateParamsForThisMonth();
      url = `${url}?startDate=${startDate}&endDate=${endDate}`;
    } else if (filter === "yesterday") {
      const { startDate, endDate } = getDateParamsForYesterday();
      url = `${url}?startDate=${startDate}&endDate=${endDate}`;
    } else if (filter === "last_month") {
      const { startDate, endDate } = getDateParamsForLastMonth();
      url = `${url}?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response?.data?.data?.[0];
  };

  const { data: summary, isLoading } = useQuery({
    queryKey: ["orderSummaryData", timeFilter],
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Halo {user?.name} - Ringkasan Performa
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            PERIODE LAPORAN:{" "}
            {getPeriodLabel(timeFilter)}
              {" "}
            • {user?.tenant?.name}
          </p>
        </div>
        <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 w-fit shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span className="text-xs font-semibold text-gray-600">
            Progress Menuju BEP:{" "}
            <span className="text-[#EF5B2B] font-bold">
              {Math.floor(summary?.breakEvenRevenue?.actualVsTargetPercentage)}%
            </span>
          </span>
        </div>
      </div>
      <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit self-start sm:self-center">
        <button
          onClick={() => setTimeFilter("today")}
          className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            timeFilter === "today"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeFilter("yesterday")}
          className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            timeFilter === "yesterday"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => setTimeFilter("month")}
          className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            timeFilter === "month"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFilter("last_month")}
          className={`px-4 cursor-pointer py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
            timeFilter === "last_month"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Last Month
        </button>
      </div>

      {/* 💰 MAIN FINANCIAL CARDS GRID */}
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

        {/* CARD 2: GROSS INCOME */}
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
            Gross Margin: {Math.floor(summary?.marginPercentages?.grossMargin)}%
          </p>
        </div>

        {/* CARD 3: NET INCOME */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Pendapatan Bersih (Net)
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
                    Math.floor(summary?.breakEvenRevenue?.excessRevenueAmount),
                  )}{" "}
                  lagi
                </span>
              </>
            ) : (
              <p className="text-xs text-green-600 font-bold bg-[#0F766E]/5 px-2.5 py-1 rounded-lg w-fit">
                Profitable:{" "}
                {Math.floor(summary?.breakEvenRevenue?.excessRevenuePercentage)}
                %
              </p>
            )}
          </span>
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

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Daily Opex
            </span>
            <h3 className={`text-2xl font-black tracking-tight text-red-500`}>
              {formatIDR(summary?.opex?.dailyAmount)}
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            {/* Sisa target ke profit: <span className="text-red-500 font-bold">{formatIDR(Math.floor(summary?.breakEvenRevenue?.excessRevenueAmount))} lagi</span> */}
          </p>
        </div>
      </div>

      {/* Stat Box Trigger untuk Dashboard Grid */}
      <div
        onClick={() => {
          // Hanya buka modal jika ada stok yang menipis
          if (summary?.stockAlerts?.length > 0) {
            setIsLowStockModalOpen(true);
          }
          //   setIsLowStockModalOpen(true);
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
              <span className="text-xs font-semibold text-gray-500">Bahan</span>
            </div>
          </div>
        </div>

        {/* Status Indicator / Action Arrow */}
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

      {/* 📊 QUANTITY METRICS & BEST SELLERS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: VOLUME PRODUK TERJUAL */}
        <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 border-l-4 border-[#0F766E] pl-3">
            Volume Distribusi
          </h4>

          <div className="space-y-5">
            {/* CUPS INFO */}
            <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-700">
                  Total Minuman
                </span>
                <span className="text-sm font-black text-[#0F766E] font-mono">
                  {summary?.cups.total} Cups
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200/60 font-medium">
                <div>
                  Kopi:{" "}
                  <span className="text-gray-800 font-bold">
                    {summary?.cups.coffee}
                  </span>
                </div>
                <div>
                  Non-Kopi:{" "}
                  <span className="text-gray-800 font-bold">
                    {summary?.cups.nonCoffee}
                  </span>
                </div>
              </div>
            </div>

            {/* SNACKS INFO */}
            <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">
                Cemilan / Snacks
              </span>
              <span className="text-sm font-black text-[#EF5B2B] font-mono">
                {summary?.snacks} Porsi
              </span>
            </div>

            {/* METRICS SUMMARY */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-500 font-medium">
              <div className="flex justify-between">
                <span>Rata-rata Belanja Pelanggan:</span>
                <span className="text-gray-800 font-bold">
                  {formatIDR(summary?.transactionMetrics?.avgTransactionValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frekuensi Transaksi / Hari:</span>
                <span className="text-gray-800 font-bold">
                  {Math.ceil(
                    summary?.transactionMetrics?.avgTransactionsPerDay,
                  )}{" "}
                  Tx/Hari
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: TOP 5 PRODUCT LEADERBOARD */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
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
                {/* Custom Progress Bar Chart */}
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

      {/* Modal Component */}
      <LowStockModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        stockAlerts={summary?.stockAlerts || []}
      />
    </div>
  );
}
