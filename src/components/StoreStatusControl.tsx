"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../config/enpoints";
import api from "../lib/api";
import {
  Store,
  Power,
  X,
  Loader2,
  CalendarX,
  CalendarCheck,
} from "lucide-react";

interface StoreStatusControlProps {
  initialIsOpen?: boolean;
  tenantOperatingDays?: number[]; // [1,2,3,4,5] (0 = Min, 1 = Sen, dst)
  onStatusChange?: (isOpen: boolean, reason?: string) => Promise<void>;
}

const CLOSE_PRESET_REASONS = [
  "Bahan Baku / Stok Habis",
  "Mati Listrik / Kendala Teknis",
  "Acara Keluarga / Internal",
  "Kantin / Area Operasional Libur",
];

const OPEN_PRESET_REASONS = [
  "Event Khusus / Bazaar",
  "Buka Extra / Overtime Weekend",
  "Menggantikan Libur Sebelumnya",
  "Operasional Normal Kembali",
];

export default function StoreStatusControl({
  initialIsOpen,
  tenantOperatingDays,
  onStatusChange,
}: StoreStatusControlProps) {
  const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen ?? true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetAction, setTargetAction] = useState<"OPEN" | "CLOSE" | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const fetchTodayStatus = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayDow = new Date().getDay(); // 0 = Minggu, 1 = Senin, ...

    try {
      // Menggunakan client api.get sesuai standar app
      const response = await api.get(endpoints.tenants.storeStatus.get(`date=${todayStr}`));
      const specialDay = response?.data;

      return specialDay;
    } catch (error) {
      console.warn("Gagal mengecek status toko hari ini:", error);
      
      // Fallback jika API error / record belum ada
      if (tenantOperatingDays && tenantOperatingDays.length > 0) {
        setIsOpen(tenantOperatingDays.includes(todayDow));
      }
      return null;
    }
  };

  // 🟢 2. Custom Hook useQuery dengan alias isLoading -> isCheckingStatus
  const { data: todayStatusData, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["todayStatus", tenantOperatingDays],
    queryFn: fetchTodayStatus,
  });

  useEffect(() => {
    const todayDow = new Date().getDay()

    if (todayStatusData && typeof todayStatusData.isOpen === "boolean") {
        // A. Prioritas 1: Gunakan status override dari store_special_days
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(todayStatusData.isOpen);
      } else if (tenantOperatingDays && tenantOperatingDays.length > 0) {
        // B. Prioritas 2: Fallback ke baseline operating_days
        setIsOpen(tenantOperatingDays.includes(todayDow));
      } else if (typeof initialIsOpen === "boolean") {
        setIsOpen(initialIsOpen);
      }
    // setIsOpen
  }, [todayStatusData, isOpen, tenantOperatingDays, initialIsOpen])

//   console.log({ todayStatusData })

  // 2. Trigger Klik Button Status
  const handleToggleClick = () => {
    if (isOpen) {
      // Mau TUTUP toko
      setTargetAction("CLOSE");
      setSelectedReason(CLOSE_PRESET_REASONS[0]);
    } else {
      // Mau BUKA toko (Sekarang Minta Alasan Juga!)
      setTargetAction("OPEN");
      setSelectedReason(OPEN_PRESET_REASONS[0]);
    }
    setCustomReason("");
    setIsModalOpen(true);
  };

  const { mutate: postStoreStatus } = useMutation({
    mutationFn: async (isNextOpen: boolean) => {
      const payload = {
        isOpen: isNextOpen,
        reason: selectedReason === "Lainnya" ? customReason : selectedReason,
      };
      return await api.patch(endpoints.tenants.storeStatus.post, payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["todayStatus", tenantOperatingDays] });
    },
  });

  // 3. Konfirmasi Submit (Buka atau Tutup)
  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAction) return;

    const finalReason =
      selectedReason === "Lainnya" ? customReason : selectedReason;

    if (!finalReason.trim()) return;

    const isNextOpen = targetAction === "OPEN";

    setIsSubmitting(true);
    try {
      postStoreStatus(isNextOpen)
      if (onStatusChange) {
        await onStatusChange(isNextOpen, finalReason);
      }
    
      setIsOpen(isNextOpen);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal mengubah status toko:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePresets =
    targetAction === "CLOSE" ? CLOSE_PRESET_REASONS : OPEN_PRESET_REASONS;

  return (
    <>
      {/* BUTTON SWITCH STATUS TOKO */}
      <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleToggleClick}
          disabled={isCheckingStatus}
          className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${
            isOpen
              ? "bg-white text-teal-700 shadow-xs hover:bg-teal-50/50"
              : "bg-rose-600 text-white shadow-xs hover:bg-rose-700"
          }`}
        >
          {isCheckingStatus ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOpen ? "bg-emerald-400" : "bg-rose-300"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOpen ? "bg-emerald-500" : "bg-white"
                  }`}
                />
              </span>

              <Store className="w-4 h-4" />
              <span>Status Toko: </span>
              <span className="font-extrabold underline uppercase tracking-wider">
                {isOpen ? "Buka" : "Tutup"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* MODAL KONFIRMASI ALASAN (BUKA & TUTUP) */}
      {isModalOpen && targetAction && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isCheckingStatus && setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    targetAction === "CLOSE"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-teal-50 text-teal-600"
                  }`}
                >
                  {targetAction === "CLOSE" ? (
                    <CalendarX className="w-5 h-5" />
                  ) : (
                    <CalendarCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {targetAction === "CLOSE"
                      ? "Konfirmasi Tutup Toko"
                      : "Konfirmasi Buka Toko"}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {targetAction === "CLOSE"
                      ? "Hari ini akan dicatat sebagai hari libur (OPEX = Rp 0)"
                      : "Hari ini akan dicatat sebagai hari buka (OPEX Dihitung)"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isCheckingStatus}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitStatus} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Pilih Alasan {targetAction === "CLOSE" ? "Tutup" : "Buka"} Toko
                </label>
                <div className="space-y-2">
                  {activePresets.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        selectedReason === reason
                          ? targetAction === "CLOSE"
                            ? "border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-500/20"
                            : "border-teal-500 bg-teal-50/50 text-teal-900 ring-1 ring-teal-500/20"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status_reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className={
                          targetAction === "CLOSE"
                            ? "text-rose-600 focus:ring-rose-500 h-4 w-4"
                            : "text-teal-600 focus:ring-teal-500 h-4 w-4"
                        }
                      />
                      <span>{reason}</span>
                    </label>
                  ))}

                  {/* Custom Reason */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      selectedReason === "Lainnya"
                        ? targetAction === "CLOSE"
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-500/20"
                          : "border-teal-500 bg-teal-50/50 text-teal-900 ring-1 ring-teal-500/20"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_reason"
                      value="Lainnya"
                      checked={selectedReason === "Lainnya"}
                      onChange={() => setSelectedReason("Lainnya")}
                      className={
                        targetAction === "CLOSE"
                          ? "text-rose-600 focus:ring-rose-500 h-4 w-4"
                          : "text-teal-600 focus:ring-teal-500 h-4 w-4"
                      }
                    />
                    <span>Alasan Lainnya...</span>
                  </label>
                </div>
              </div>

              {selectedReason === "Lainnya" && (
                <div className="animate-in fade-in duration-200">
                  <textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder={`Tuliskan alasan ${
                      targetAction === "CLOSE" ? "penutupan" : "pembukaan"
                    } toko secara spesifik...`}
                    className={`w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      targetAction === "CLOSE"
                        ? "focus:ring-rose-500"
                        : "focus:ring-teal-500"
                    }`}
                    required
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCheckingStatus}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCheckingStatus}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                    targetAction === "CLOSE"
                      ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                      : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"
                  }`}
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      <span>
                        {targetAction === "CLOSE"
                          ? "Ya, Tutup Toko"
                          : "Ya, Buka Toko"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}