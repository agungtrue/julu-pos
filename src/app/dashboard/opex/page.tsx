"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { formatDate } from "../../../lib/utils";
import ScrollToTop from "@/components/ScrollToTop";

interface Opex {
  id: string;
  category: string;
  notes: string;
  amount: number;
  title: string;
  type: string;
}

export default function OpexManagementPage() {
  //   const [opexList, setOpexList] = useState(INITIAL_OPEX_COMPONENTS);
  const [simulatedRevenue, setSimulatedRevenue] = useState(500000); // Default target omzet harian Anda (30 cup x 10k)
  const [currentActualRevenue] = useState(604000); // Mock data omzet riil terakhir (Closingan Minggu lalu)

  // Form State untuk tambah komponen baru
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("FIXED");
  const [newCategory, setNewCategory] = useState("UTILITIES");
  const [newNotes, setNewNotes] = useState("");

  const queryClient = useQueryClient();

  const { mutate: postNewOpex, isPending } = useMutation({
    mutationFn: async (payload: Opex) => {
      const { id, ...rest } = payload;
      return await api.post(endpoints.opex.post, rest);
    },
    onSuccess: () => {
      //   setIsSaving(false);
      // add loading
      queryClient.invalidateQueries({ queryKey: ["opexData"] });
      queryClient.invalidateQueries({
        queryKey: ["orderSummaryData"],
      });
    },
    onError: (err) => {
      //   setIsSaving(false);
      //   toast.error("Error!", {
      //     description: err.response?.data?.message || "something went wrong",
      //     className: "bg-emerald-50 border-red-200 text-red-800 rounded-xl",
      //   });
    },
  });

  const { mutate: DeleteOpex } = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(endpoints.opex.delete(id));
    },
    onSuccess: () => {
      //   setIsSaving(false);
      // add loading
      queryClient.invalidateQueries({ queryKey: ["opexData"] });
      queryClient.invalidateQueries({
        queryKey: ["orderSummaryData"],
      });
    },
    onError: (err) => {
      //   setIsSaving(false);
      //   toast.error("Error!", {
      //     description: err.response?.data?.message || "something went wrong",
      //     className: "bg-emerald-50 border-red-200 text-red-800 rounded-xl",
      //   });
    },
  });

  const handleOpexDelete = (id: string) => {
    DeleteOpex(id);
  };

  // GET
  const fetchOpexData = async () => {
    const url = endpoints.opex.get;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: opexData, isLoading: isLoadingOpexData } = useQuery({
    queryKey: ["opexData"],
    queryFn: fetchOpexData,
  });

  console.log({ opexData });

  const opexList = opexData;

  // 🧮 KALKULASI UTAMA (Meticulous Financial Engine)
  const totalDailyOpex = opexList?.reduce((sum: any, item: Opex) => sum + item.amount, 0);

  // Hitung rasio Opex berdasarkan simulasi input manual user
  const opexSimulationRatio =
    simulatedRevenue > 0 ? (totalDailyOpex / simulatedRevenue) * 100 : 0;

  // Hitung rasio Opex berdasarkan data omzet riil hari ini
  const opexActualRatio =
    currentActualRevenue > 0
      ? (totalDailyOpex / currentActualRevenue) * 100
      : 0;

  // Handler Tambah Opex Manual (Trigger Sinkronisasi ke Cache Tenants kelak)
  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
    const newItem = {
      id: "",
      title: newName,
      category: newCategory,
      amount: parseFloat(newAmount),
      type: newType,
      notes: newNotes,
    };

    postNewOpex(newItem);
    // setOpexList([...opexList, newItem]);
    setNewName("");
    setNewAmount("");
  };

  // Helper Penentu Warna Indikator Efisiensi Keuangan
  const getEfficiencyColor = (ratio: number) => {
    if (ratio <= 35)
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        text: "Sangat Efisien (Sehat Walafiat)",
      };
    if (ratio <= 50)
      return {
        bg: "bg-[#0A8F8A]/10 text-[#0A8F8A] border-[#0A8F8A]/20",
        dot: "bg-[#0A8F8A]",
        text: "Normal / Relevan (Batas Aman)",
      };
    return {
      bg: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-500",
      text: "Boros / Bahaya (Makan Margin Laba)",
    };
  };

  const simulatedStatus = getEfficiencyColor(opexSimulationRatio);
  const actualStatus = getEfficiencyColor(opexActualRatio);

  if (isLoadingOpexData) return <DashboardSkeleton />;

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      {/* 🏷️ HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Uang Keluar Wajib Tiap Hari (Opex)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Catat sewa, gaji, listrik. Biar tau sehari harus laku berapa biar ga nombok.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📊 KIRI & TENGAH: SIMULATOR & BREAKDOWN LIST */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* CARD 1: SIMULATOR TARGET EFFICIENCY (Fokus Utama Request Anda) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-[#FBBF24] rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-800">
                Opex Target Simulator
              </h2>
            </div>

            <p className="text-xs text-gray-400 mb-6">
              Kalau sehari laku Rp 300.000, cukup ga buat nutup sewa & gaji?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Input Manual Target Omzet */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Simulasi Omzet Harian (Rp)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-semibold text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={simulatedRevenue}
                    onChange={(e) =>
                      setSimulatedRevenue(
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
                    }
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-lg font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-800"
                    placeholder="Contoh: 300000"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1.5 block">
                  Tip: Coba masukkan <b>300000</b> (Simulasi) vs <b>604000</b>{" "}
                  (Closingan Riil)
                </span>
              </div>

              {/* Box Output Hasil Kalkulasi Persentase */}
              <div
                className={`p-5 rounded-xl border transition-all duration-300 ${simulatedStatus.bg}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Hasil Cek: Masih Untung Atau Nombok?
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {opexSimulationRatio.toFixed(1)}%
                  </span>
                  <span className="text-xs font-medium opacity-80">
                    dari target omzet
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-wide">
                  <span
                    className={`w-2 h-2 rounded-full ${simulatedStatus.dot}`}
                  ></span>
                  {simulatedStatus.text}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: LIST RINCIAN KOMPONEN OPEX */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">
                Daftar Komponen Biaya Harian
              </h3>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">
                  Total Beban Tetap
                </p>
                <p className="text-xl font-black text-[#0A8F8A]">
                  Rp {totalDailyOpex.toLocaleString("id-ID")}
                  <span className="text-xs font-normal text-gray-400">
                    /hari
                  </span>
                </p>
              </div>
            </div>

            <div>
              {/* ================= TAMPILAN MOBILE (HP) ================= */}
              {/* block md:hidden artinya: Muncul di HP, Otomatis Hilang di Layar Desktop */}
              <div className="block md:hidden space-y-3 p-1">
                {opexList.map((item: Opex) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Baris Atas: Judul & Tombol Hapus */}
                    <div className="flex justify-between items-start gap-3 mb-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#EF5B2B] shrink-0"></span>
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {item.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpexDelete(item.id)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all shrink-0"
                        title="Hapus Pengeluaran"
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
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Baris Tengah: Badges (Tipe & Kategori) */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#EF5B2B] text-white">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#0A8F8A] text-white">
                        {item.category}
                      </span>
                    </div>

                    {/* Garis Pembatas Tipis */}
                    <div className="border-t border-gray-50 my-2"></div>

                    {/* Baris Bawah: Catatan & Nominal */}
                    <div className="flex justify-between items-end pt-1 gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Catatan
                        </span>
                        <p className="text-xs text-gray-600 line-clamp-2 break-words">
                          {item.notes || "-"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[16px] font-extrabold text-gray-950 block leading-tight">
                          Rp {item.amount.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          /hari
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= TAMPILAN DESKTOP (TABLE) ================= */}
              {/* hidden md:block artinya: Hilang di HP, Otomatis Muncul di Layar Desktop */}
              <div className="hidden md:block min-h-[300px] max-h-[550px] overflow-auto border border-gray-100 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-sm text-gray-700">
                  <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 shadow-[0_1px_0_0_rgba(243,244,246,1)]">
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Nama Komponen Pengeluaran</th>
                      <th className="px-6 py-4">Tipe</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4 text-right">
                        Nominal Beban Harian
                      </th>
                      <th className="px-6 py-4 text-right">Catatan</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {opexList.map((item: Opex) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/40 transition-all"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF5B2B]"></span>
                          {item.title}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-600">
                          <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#EF5B2B] text-[#ffffff]">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-600">
                          <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#0A8F8A] text-[#ffffff]">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-600">
                          Rp {item.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-600">
                          {item.notes}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpexDelete(item.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                            title="Hapus Pengeluaran"
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
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Nama Komponen Pengeluaran</th>
                    <th className="px-6 py-4">Tipe</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4 text-right">
                      Nominal Beban Harian
                    </th>
                    <th className="px-6 py-4 text-right">Catatan</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {opexList.map((item: Opex) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/40 transition-all"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF5B2B]"></span>
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-600">
                        <span
                          className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#EF5B2B] text-[#ffffff]`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-600">
                        <span
                          className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#0A8F8A] text-[#ffffff]`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-600">
                        Rp {item.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-600">
                        {item.notes}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpexDelete(item.id)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                          title="Hapus Pengeluaran"
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
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}
          </div>
        </div>

        {/* 📥 KANAN: INPUT FORM & REAL CLOSING RATIO */}
        <div className="flex flex-col gap-6">
          {/* INDIKATOR METRIK OPERASIONAL RIIL */}
          {/* <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Live Dashboard Snapshot
            </h3>
            <div className="mb-4">
              <p className="text-xs text-gray-400">Omzet Aktual Terakhir</p>
              <p className="text-2xl font-black text-gray-800">
                Rp {currentActualRevenue.toLocaleString("id-ID")}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl border ${actualStatus.bg} flex flex-col gap-1`}
            >
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">
                Rasio Opex Aktual Saat Ini
              </span>
              <span className="text-2xl font-black">
                {opexActualRatio.toFixed(1)}%
              </span>
              <span className="text-[11px] font-medium mt-1">
                Status Lapangan: <b>{actualStatus.text}</b>
              </span>
            </div>
          </div> */}

          {/* FORM TAMBAH BEPAN OPEX BARU */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-gray-800">Tambah Tagihan Wajib</h3>
            </div>

            <form onSubmit={handleAddComponent} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Nama Pengeluaran
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Listrik & Air Booth"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Tipe Beban
                </label>
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700 font-semibold"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Kategori Beban
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700 font-semibold"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Beban per Hari (Rp)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Catatan (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Contoh: Gaji Harian dll"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700 font-semibold"
                />
              </div>

              {/* Tombol Simpan - Aksen Orange Julu */}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
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
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Simpan & Update Cache
              </button>
            </form>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
