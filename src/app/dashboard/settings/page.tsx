"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import {
  Building2,
  CalendarDays,
  DollarSign,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Store,
  Lightbulb,
} from "lucide-react";
import { Toaster, toast } from "sonner";

interface TenantSettings {
  id: string;
  name: string;
  daily_opex: number;
  operating_days: number[];
  receiptFooter: string;
}

const DAYS_MAP = [
  { id: 1, label: "Senin", short: "Sen" },
  { id: 2, label: "Selasa", short: "Sel" },
  { id: 3, label: "Rabu", short: "Rab" },
  { id: 4, label: "Kamis", short: "Kam" },
  { id: 5, label: "Jumat", short: "Jum" },
  { id: 6, label: "Sabtu", short: "Sab" },
  { id: 0, label: "Minggu", short: "Min" },
];

export default function TenantSettingsPage() {
  // Tab State untuk Ekstensi Menu Pengaturan di Masa Depan
  const [activeTab, setActiveTab] = useState<
    "operasional" | "profil" | "struk"
  >("operasional");

  // Form State
  const [dailyOpex, setDailyOpex] = useState<number>(0);
  const [operatingDays, setOperatingDays] = useState<number[]>([]);
  const [receiptFooter, setReceiptFooter] = useState<string>("");

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const fetchSettings = async () => {
    const url = endpoints.tenants.settings.get;
    const response = await api.get(url);
    return response?.data;
  };

  const { data: settingData, isLoading } = useQuery({
    queryKey: ["settingData"],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (settingData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOperatingDays(settingData.operating_days ?? []);
    }
  }, [settingData]);

  const initialDays = React.useMemo(() => {
    return settingData?.operating_days ?? [];
  }, [settingData])

//   console.log({ operatingDays, initialDays });

  const toggleDay = (dayId: number) => {
    setOperatingDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // Minimal 1 hari buka
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId].sort((a, b) => a - b);
      }
    });
  };

  const applyPreset = React.useCallback((preset: "weekdays" | "all") => {
  if (preset === "weekdays") {
    setOperatingDays([1, 2, 3, 4, 5]);
  } else if (preset === "all") {
    setOperatingDays([1, 2, 3, 4, 5, 6, 0]);
  }
}, []);

  const isDaysChanged = React.useMemo(() => {
    if (operatingDays.length !== initialDays.length) return true;
    const sortedCurrent = [...operatingDays].sort((a, b) => a - b);
    const sortedInitial = [...initialDays].sort((a, b) => a - b);
    return sortedCurrent.some((day, index) => day !== sortedInitial[index]);
  }, [operatingDays, initialDays]);

  const { mutate: postTenantSettings } = useMutation({
    mutationFn: async () => {
      const payload = {
        operating_days: operatingDays,
      };
      return await api.patch(endpoints.tenants.settings.post, payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["settingData"] });
      setIsSaving(false);
      toast.success("Data Tersimpan!", {
        description: "Hari Operasional berhasil di perbarui!",
        className:
          "bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    postTenantSettings();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER PAGE (Standar Julu POS) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative pl-3.5 border-l-4 border-teal-600">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Pengaturan Toko</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-teal-700 text-lg font-bold">
              Konfigurasi System & Operasional
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Atur parameter operasional, hari buka, dan tampilan toko kamu.
          </p>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {statusMsg && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold ${
            statusMsg.type === "success"
              ? "bg-teal-50 text-teal-800 border border-teal-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {statusMsg.text}
        </div>
      )}

      {/* TOP TAB NAVIGATION (Standar Julu POS Container) */}
      <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("operasional")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === "operasional"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hari Operasional</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === "profil"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Profil Toko</span>
        </button>

        {/* <button
          type="button"
          onClick={() => setActiveTab('struk')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'struk'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Format Struk</span>
        </button> */}
      </div>

      {/* TAB CONTENT 1: OPERASIONAL & OPEX */}
      {activeTab === "operasional" && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Hari Operasional */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4 border-b border-slate-100 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-l-4 border-[#EF5B2B] pl-3">
                    Jadwal Hari Operasional
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Centang hari apa saja toko kamu buka supaya hitungan untung
                    bersih di laporan makin pas.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:inline">
                    Pilihan Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPreset("weekdays")}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-transparent text-gray-600 transition-all cursor-pointer active:scale-95"
                  >
                    Senin - Jumat
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("all")}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-transparent text-gray-600 transition-all cursor-pointer active:scale-95"
                  >
                    Setiap Hari
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                    Tips Hitung Biaya Harian (OPEX):
                  </span>
                  <p className="text-amber-800/90 leading-relaxed font-medium">
                    Bagi total pengeluaran rutin sebulan (sewa tempat, listrik,
                    gaji) dengan jumlah hari kamu buka toko. Pas hari libur,
                    biaya harian otomatis diset{" "}
                    <strong className="font-bold text-amber-950">Rp0</strong>{" "}
                    biar laporan laba bersih kamu nggak tekor.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Days Button */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {DAYS_MAP.map((day) => {
                const isActive = operatingDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`flex flex-col items-center justify-center rounded-2xl p-4 border transition-all cursor-pointer ${
                      isActive
                        ? "border-teal-600 bg-teal-50/60 text-[#0F766E] font-bold shadow-xs ring-1 ring-teal-600/30"
                        : "border-slate-200/80 bg-gray-50/60 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold">{day.label}</span>
                    <span
                      className={`mt-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-teal-600 text-white"
                          : "bg-gray-200/70 text-gray-400"
                      }`}
                    >
                      {isActive ? "Buka" : "Libur"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: OPEX Harian */}
          {/* <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-l-4 border-[#0F766E] pl-3">
                Biaya Operasional Harian (Daily OPEX)
              </h4>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Alokasi rutin biaya sewa, gaji, listrik, dan kebersihan yang diperhitungkan setiap hari toko beroperasi.
              </p>
            </div>

            <div className="max-w-xs space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                Nominal OPEX / Hari
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <span className="text-xs font-extrabold text-teal-700">Rp</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={dailyOpex}
                  onChange={(e) => setDailyOpex(Number(e.target.value))}
                  className="w-full text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  placeholder="50000"
                />
              </div>
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100/80 text-xs text-teal-900 mt-3">
                <span className="text-gray-500 font-medium">Estimasi Beban Bulan Ini ({operatingDays.length * 4} Hari Kerja):</span>{' '}
                <strong className="font-black text-[#0F766E] block text-sm mt-0.5">
                  Rp {(dailyOpex * operatingDays.length * 4).toLocaleString('id-ID')}
                </strong>
              </div>
            </div>
          </div> */}

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || !isDaysChanged}
              className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT 2: PROFIL TOKO (Slot Pengembangan Next Feature) */}
      {activeTab === "profil" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
          <Store className="w-10 h-10 text-teal-600 mx-auto opacity-40" />
          <h3 className="text-base font-bold text-gray-800">
            Profil & Identitas Toko
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Halaman pengaturan nama outlet, alamat, logo, dan kontak usaha akan
            hadir di tab ini pada rilis mendatang.
          </p>
        </div>
      )}

      {/* TAB CONTENT 3: STRUK (Slot Pengembangan Next Feature) */}
      {activeTab === "struk" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
          <Receipt className="w-10 h-10 text-[#EF5B2B] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-gray-800">
            Pengaturan Pesan Struk
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Fitur untuk mengatur catatan kaki (*receipt footer*) dan opsi cetak
            printer thermal Bluetooth/LAN.
          </p>
        </div>
      )}
      <Toaster />
    </div>
  );
}
