"use client";

import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api'
import { formatJuluDate } from '../../../lib/utils'
import { endpoints } from '../../../config/enpoints'
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { Search } from 'lucide-react';


interface TransactionDetail {
  name: string;
  type: string;
  size: string;
}
interface TransactionItem {
  name: string;
  qty: number;
  price: number;
  product: TransactionDetail
}

interface User {
  name: string
}
interface Transaction {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  items: TransactionItem[];
  discountAmount: number;
  finalAmount: number;
  user: User,
  total: number,
  payment_method: "qris" | "cash";
}

export default function SalesLogPage() {
  const [filterMethod, setFilterMethod] = useState<"ALL" | "qris" | "cash">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [orderTime, setOrderTime] = useState<'today' | ''>('today');

  // State untuk Manajemen Modal Detail Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchOrderListData = async (filter: "today" | "") => {
    let url = endpoints.orders.getAll;

    if (filter === "today") {
      url = `${url}?search=today`;
    }

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["orderListData", orderTime],
    queryFn: () => fetchOrderListData(orderTime),
  });

  if (isLoading) return <DashboardSkeleton/>
  // return <DashboardSkeleton/>

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Hitung total item kumulatif dalam satu invoice untuk display kartu luar
  const getTotalItemsCount = (items: TransactionItem[]) => {
    return items.reduce((acc, curr) => acc + curr.qty, 0);
  };

  // Helper penggabung string nama item untuk ringkasan feed luar
  const getItemsSummaryString = (items: TransactionItem[]) => {
    return items.map((i) => `${i.qty}x ${i.product.name}`).join(", ");
  };

  const handleOpenDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  // Logika Filter Penjualan
  const transactions = transactionsData.filter((tx: Transaction) => {
    const summaryText = getItemsSummaryString(tx.items).toLowerCase();
    const matchesSearch =
      String(tx.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      summaryText.includes(searchQuery.toLowerCase());
    const matchesMethod =
      filterMethod === "ALL" || tx.payment_method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Log Transaksi Penjualan
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
            Aliran data real-time tersinkronisasi langsung dari Julu POS Mobile
            App
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 w-fit shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            POS API: Connected
          </span>
        </div>
      </div>

      <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit self-start sm:self-center">
          <button
            onClick={() => setOrderTime('today')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              orderTime === 'today'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setOrderTime('')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              orderTime === ''
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            All
          </button>
        </div>

      {/* FILTER & SEARCH BAR CONTROLLER */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-4 h-4"/>
          </span>
          <input
            type="text"
            placeholder="Cari No. Invoice atau item pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
          />
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 font-bold text-xs">
          {(["ALL", "qris", "cash"] as const).map((method) => (
            <button
              key={method}
              onClick={() => setFilterMethod(method)}
              className={`px-4 py-2 rounded-lg transition-all ${filterMethod === method ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              {method === "ALL" ? "Semua" : method}
            </button>
          ))}
        </div>
      </div>

      {/* ALIRAN FEED TRANSAKSI LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
          Aliran Feed Transaksi (Ketuk untuk Detail)
        </h3>

        {transactions?.map((tx: Transaction) => (
          <div
            key={tx.id}
            onClick={() => handleOpenDetail(tx)}
            className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-gray-800 tracking-tight group-hover:text-[#0F766E] transition-colors">
                  {tx.id}
                </span>
                <span
                  className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${tx.payment_method === "qris" ? "bg-[#0F766E]/10 text-[#0F766E]" : "bg-[#EF5B2B]/10 text-[#EF5B2B]"}`}
                >
                  {tx.payment_method}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {formatJuluDate(tx.createdAt)} • Operator:{" "}
                <span className="text-gray-600 font-semibold">
                  {tx.user.name}
                </span>
              </p>
            </div>

            <div className="bg-gray-50/60 border border-gray-100/40 rounded-xl p-3 flex-1 md:max-w-xl">
              <span className="text-[9px] text-gray-400 uppercase font-bold block mb-0.5">
                Pesanan ringkas:
              </span>
              <p className="text-xs text-gray-600 font-medium line-clamp-1">
                {getItemsSummaryString(tx.items)}
              </p>
            </div>

            <div className="text-left md:text-right flex md:flex-col justify-between items-center md:items-end border-t border-gray-50 md:border-0 pt-3 md:pt-0">
              <span className="text-[10px] text-gray-400 uppercase font-bold block md:hidden">
                Total:
              </span>
              <div>
                <span className="text-base font-black text-gray-800 font-mono tracking-tight">
                  {formatIDR(tx.total)}
                </span>
                <span className="text-[10px] text-gray-400 block font-medium text-right mt-0.5">
                  ({getTotalItemsCount(tx.items)} item)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📱 SLIDE-UP MODAL ENGINE: STRUK ORDER DETAIL */}
      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto border border-gray-100">
            {/* Header Nota */}
            <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#0F766E] text-white font-black text-lg mb-2 shadow-sm">
                J
              </div>
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wide">
                Julu Coffee & Snacks
              </h3>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                {selectedTx.invoiceNumber}
              </p>
            </div>

            {/* Metadata Kasir & Waktu */}
            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 font-medium font-mono border-b border-gray-100 pb-4 mb-4">
              <div>
                Waktu:{" "}
                <span className="text-gray-800 font-bold block font-sans mt-0.5">
                  {formatJuluDate(selectedTx?.createdAt)}
                </span>
              </div>
              <div className="text-right">
                Kasir:{" "}
                <span className="text-gray-800 font-bold block font-sans mt-0.5">
                  {selectedTx?.user?.name || ''}
                </span>
              </div>
            </div>

            {/* Rincian Item Keranjang Belanja */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 my-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Rincian Belanja:
              </span>
              {selectedTx.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-xs font-medium"
                >
                  <div className="space-y-0.5 pr-4">
                    <h5 className="font-bold text-gray-700">{item.product?.name}</h5>
                    <span className="text-gray-400 font-mono">
                      {item.qty} x {formatIDR(item.price)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-gray-800 mt-0.5">
                    {formatIDR(item.qty * item.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Penghitungan Finansial (Kalkulasi Diskon & Metode Bayar) */}
            <div className="border-t border-dashed border-gray-200 pt-4 mt-4 space-y-2 text-xs font-medium font-mono text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal KOTOR:</span>
                <span className="text-gray-700 font-bold">
                  {formatIDR(
                    selectedTx.items.reduce(
                      (acc, c) => acc + c.qty * c.price,
                      0,
                    ),
                  )}
                </span>
              </div>

              {/* {selectedTx.discountAmount > 0 && (
                <div className="flex justify-between text-[#EF5B2B]">
                  <span>Potongan Promo:</span>
                  <span className="font-bold">
                    -{formatIDR(selectedTx.discountAmount)}
                  </span>
                </div>
              )} */}

              <div className="flex justify-between pt-2 border-t border-gray-100 text-sm">
                <span className="font-sans font-bold text-gray-800">
                  TOTAL BERSIH:
                </span>
                <span className="font-mono font-black text-[#0F766E] text-base">
                  {formatIDR(selectedTx.total)}
                </span>
              </div>
            </div>

            {/* Status & Metode Bayar Badge */}
            <div className="bg-gray-50 border border-gray-100/70 rounded-xl p-3 my-5 flex justify-between items-center text-xs font-bold">
              <span className="text-gray-400">Metode Pembayaran:</span>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-black ${
                  selectedTx.payment_method === "qris"
                    ? "bg-[#0F766E]/10 text-[#0F766E]"
                    : "bg-[#EF5B2B]/10 text-[#EF5B2B]"
                }`}
              >
                💵 {selectedTx?.payment_method}
              </span>
            </div>

            {/* Tombol Tutup Nota */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-[#0F766E] hover:bg-opacity-95 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.99]"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
