'use client';

import React from 'react';

export default function DashboardPage() {
  // Data Riil Julu 01 (01 - 21 Juni 2026)
  const data = {
    transactions: 229,
    revenues: 10062000,
    grossIncomes: 6448571,
    netIncomes: -453940,
    bepPercentage: 93.42,
    cups: { total: 392, coffee: 208, nonCoffee: 184 },
    snacks: 219,
    bestSellers: [
      { name: "Ice Cream Based regular", count: 75, percentage: 12.27 },
      { name: "French Fries regular", count: 68, percentage: 11.12 },
      { name: "Palm Sugar Latte Iced regular", count: 52, percentage: 8.51 },
      { name: "Americano Iced regular", count: 43, percentage: 7.03 },
      { name: "Dimsum regular", count: 41, percentage: 6.71 },
    ],
    metrics: {
      avgTransaction: 43938,
      avgRevenueDay: 479142,
      avgTxDay: 10.9
    }
  };

  // Helper untuk format Rupiah yang rapi
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 📋 WELCOME & DATE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Ringkasan Performa</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
            Periode Laporan: 01 - 21 Juni 2026 • Julu 01
          </p>
        </div>
        {/* BEP Progress Badge */}
        <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 w-fit shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span className="text-xs font-semibold text-gray-600">
            Progress Menuju BEP: <span className="text-[#EF5B2B] font-bold">{data.bepPercentage}%</span>
          </span>
        </div>
      </div>

      {/* 💰 MAIN FINANCIAL CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: REVENUE */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Pendapatan</span>
            <h3 className="text-2xl font-black text-[#0F766E] tracking-tight">{formatIDR(data.revenues)}</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Rata-rata Harian: <span className="text-gray-700 font-semibold">{formatIDR(data.metrics.avgRevenueDay)}</span>
          </p>
        </div>

        {/* CARD 2: GROSS INCOME */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Keuntungan Kotor (Gross)</span>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">{formatIDR(data.grossIncomes)}</h3>
          </div>
          <p className="text-xs text-[#0F766E] font-bold bg-[#0F766E]/5 px-2.5 py-1 rounded-lg w-fit">
            Margin COGS: 64.09% (Sehat)
          </p>
        </div>

        {/* CARD 3: NET INCOME */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pendapatan Bersih (Net)</span>
            <h3 className={`text-2xl font-black tracking-tight ${data.netIncomes < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatIDR(data.netIncomes)}
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Sisa target ke profit: <span className="text-red-500 font-bold">~Rp 708k lagi</span>
          </p>
        </div>

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
                <span className="text-sm font-bold text-gray-700">🥤 Total Minuman</span>
                <span className="text-sm font-black text-[#0F766E] font-mono">{data.cups.total} Cups</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200/60 font-medium">
                <div>☕ Kopi: <span className="text-gray-800 font-bold">{data.cups.coffee}</span></div>
                <div>🍦 Non-Kopi: <span className="text-gray-800 font-bold">{data.cups.nonCoffee}</span></div>
              </div>
            </div>

            {/* SNACKS INFO */}
            <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">🍟 Cemilan / Snacks</span>
              <span className="text-sm font-black text-[#EF5B2B] font-mono">{data.snacks} Porsi</span>
            </div>

            {/* METRICS SUMMARY */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-500 font-medium">
              <div className="flex justify-between">
                <span>Rata-rata Belanja Pelanggan:</span>
                <span className="text-gray-800 font-bold">{formatIDR(data.metrics.avgTransaction)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frekuensi Transaksi / Hari:</span>
                <span className="text-gray-800 font-bold">{data.metrics.avgTxDay} Tx/Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: TOP 5 PRODUCT LEADERBOARD */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 border-l-4 border-[#EF5B2B] pl-3">
            5 Menu Paling Laris (Best Seller)
          </h4>
          
          <div className="space-y-4">
            {data.bestSellers.map((item, index) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-800 font-mono">{item.count} Porsi ({item.percentage}%)</span>
                </div>
                {/* Custom Progress Bar Chart */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-[#0F766E]' : index === 1 ? 'bg-[#EF5B2B]' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(item.count / 75) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}