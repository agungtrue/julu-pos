"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import GlobalLoader from "@/components/GlobalLoader";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  AlertCircle,
  X,
  Loader2,
  TrendingDown,
  PackageCheck,
  ArrowRight,
  ArrowLeft,
  Flame,
  Package,
} from "lucide-react";
import { formatJuluDate, formatStockValue } from "../../../lib/utils";

// Enums Status Mutasi
type MutationType = "ALL" | "RESTOCK_IN" | "USAGE_OUT" | "LOSS" | "ADJUSTMENT" | "CANCEL";

interface Ingredient {
  id: string;
  name: string;
  conversion_factor: number;
  purchase_cost: number;
  unit: "GRAM" | "ML" | "PCS";
  cost_per_unit: number;
  stock: number;
  minimumStock: number;
}

interface User {
  name: string;
}

interface MutationLog {
  id: string;
  createdAt: string;
  ingredientName: string;
  ingredient: Ingredient;
  unit: string;
  type: MutationType;
  quantity: number;
  previousStock: number;
  currentStock: number;
  cost_per_unit?: number;
  notes?: string;
  totalCost: number;
  operatorName: string;
  user: User;
}

export default function StockMutationPage() {
  // export const StockMutationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MutationType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<
    "RESTOCK" | "LOSS" | "ADJUSTMENT" | null
  >(null);

  const fetchIngMutationListData = async () => {
    const url = endpoints.ingredientMutation.get;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: ingreMutationData, isLoading } = useQuery({
    queryKey: ["ingreMutation"],
    queryFn: () => fetchIngMutationListData(),
  });

  const logs = ingreMutationData;

  // console.log({ ingreMutationData });

  // summary
  const fetchMutationSummary = async () => {
    const url = endpoints.ingredientMutation.summary;

    const response = await api.get(url);
    return response?.data?.data?.[0] || [];
  };

  const { data: mutationSummary, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ["mutationSummaryData"],
    queryFn: () => fetchMutationSummary(),
  });

  // console.log({ mutationSummary });

  // Helper Badge Render
  const renderBadge = (type: MutationType) => {
    switch (type) {
      case "RESTOCK_IN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> Restock
          </span>
        );
      case "USAGE_OUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" /> Penggunaan
          </span>
        );
      case "LOSS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Loss
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Stock Opname
          </span>
        );
      case "CANCEL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <ArrowLeft className="w-3.5 h-3.5 text-amber-600" /> Pembatalan
          </span>
        );
      default:
        return null;
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Cek apakah ada query param ?isRestockModal=true
    if (searchParams.get("isRestockModal") === "true") {
      setActiveModal("RESTOCK");

      // 2. Bersihkan query param dari URL tanpa trigger full reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete("isRestockModal");

      // const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      // router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <div className="p-2.5 sm:p-2 bg-slate-50 min-h-screen font-sans text-slate-800 pb-24 md:pb-6">
      {/* 1. HEADER & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Riwayat Keluar - Masuk Bahan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Cek bahan yang terpakai otomatis dan catat pasokan baru/terbuang
            (info: data masih dibatasi 50 data terbaru)
          </p>
        </div>

        {/* Action Buttons: Grid 2 kolom di HP (Restock & Loss sejajar), Opname di bawahnya */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveModal("RESTOCK")}
            className="flex items-center justify-center gap-1.5 bg-[#0F766E] active:scale-95 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Restock
          </button>
          <button
            onClick={() => setActiveModal("LOSS")}
            className="flex items-center justify-center gap-1.5 bg-rose-600 active:scale-95 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" /> Catat Loss
          </button>
          {/* <button
            onClick={() => setActiveModal("ADJUSTMENT")}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 bg-white active:scale-95 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" /> Stock Opname
          </button> */}
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS (Mobile: Compact Horizontal / Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nilai Restock Bulan Ini
            </p>
            <h3 className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5">
              Rp {mutationSummary?.restock?.totalAmount?.toLocaleString() || 0}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              {mutationSummary?.restock?.count || 0} kali barang masuk
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Operational Loss
            </p>
            <h3 className="text-lg sm:text-xl font-black text-rose-600 mt-0.5">
              Rp{" "}
              {Math.abs(
                mutationSummary?.loss?.totalAmount || 0,
              ).toLocaleString()}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              {mutationSummary?.loss?.count || 0} kali Basi, tumpah dll
            </p>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Mutasi Tercatat
            </p>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">
              {mutationSummary?.totalActivityCount || 0} Aktivitas
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              {/* 0 Hari Terakhir */}
            </p>
          </div>
          <div className="p-2.5 bg-teal-50 rounded-xl text-[#0F766E]">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      {/* <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm mb-5 space-y-3 md:space-y-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {(
              [
                "ALL",
                "RESTOCK_IN",
                "USAGE_OUT",
                "LOSS",
                "ADJUSTMENT",
              ] as MutationType[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-[#0F766E] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "ALL" && "Semua"}
                {tab === "RESTOCK_IN" && "Masuk"}
                {tab === "USAGE_OUT" && "Terpakai"}
                {tab === "LOSS" && "Loss"}
                {tab === "ADJUSTMENT" && "Opname"}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari bahan baku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F766E]"
            />
          </div>
        </div>
      </div> */}

      {/* 4. MUTATION LEDGER (MOBILE CARD VIEW) -> Tampil di Layar HP (< md) */}
      <div className="block md:hidden space-y-3">
        {logs.map((log: MutationLog) => {
          const isLossOrOut =
            log.type === "LOSS" || log.type === "USAGE_OUT" || log.quantity < 0;
          const absCost = Math.abs(log.totalCost || 0);
          const formattedCost = absCost.toLocaleString("id-ID");

          return (
            <div
              key={log.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
            >
              {/* Row 1: Header & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {log.ingredient?.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatJuluDate(log.createdAt)}
                  </span>
                </div>
                <div className="flex-shrink-0">{renderBadge(log.type)}</div>
              </div>

              {/* Row 2: Perubahan Stok & Snapshot Balance (UI NEW GRID 3-KOLOM) */}
              <div className="grid grid-cols-3 gap-2 items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                {/* 1. PERUBAHAN */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Perubahan
                  </p>
                  <p className="font-extrabold font-mono text-sm mt-0.5 whitespace-nowrap">
                    {["CANCEL", "RESTOCK_IN"].includes(log.type) ? (
                      <span className="text-emerald-600">
                        +{formatStockValue(log.quantity)}{" "}
                        <span className="text-[10px] font-bold text-emerald-700/70">
                          {log.ingredient?.unit}
                        </span>
                      </span>
                    ) : (
                      <span className="text-rose-600">
                        -{formatStockValue(log.quantity)}{" "}
                        <span className="text-[10px] font-bold text-rose-700/70">
                          {log.ingredient?.unit}
                        </span>
                      </span>
                    )}
                  </p>
                </div>

                {/* 2. STOK AKHIR (Transisi Stok) */}
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Stok Akhir
                  </p>
                  <div className="font-mono text-xs mt-0.5 whitespace-nowrap flex items-center justify-center gap-1">
                    <span className="text-slate-400 line-through text-[11px] font-normal">
                      {formatStockValue(log.previousStock)}
                    </span>
                    <span className="text-slate-300 font-light">→</span>
                    <span className="font-black text-slate-800">
                      {formatStockValue(log.currentStock)}
                    </span>
                  </div>
                </div>

                {/* 3. BIAYA / VALUASI */}
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Biaya
                  </p>
                  <p className="font-extrabold font-mono text-sm mt-0.5 whitespace-nowrap">
                    {absCost === 0 ? (
                      <span className="text-slate-400 font-medium">Rp 0</span>
                    ) : isLossOrOut ? (
                      <span className="text-rose-600">-Rp {formattedCost}</span>
                    ) : (
                      <span className="text-emerald-600">
                        +Rp {formattedCost}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Row 3: Catatan & Operator */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="truncate max-w-[180px] italic text-slate-400">
                  {log.notes || "Tanpa catatan"}
                </span>
                <span className="font-semibold text-slate-700 flex-shrink-0">
                  {log?.user?.name || "-"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MUTATION LEDGER (DESKTOP TABLE VIEW) -> Tampil di Layar Laptop/PC (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Waktu</th>
                <th className="p-4">Nama Bahan Baku</th>
                <th className="p-4">Tipe Mutasi</th>
                <th className="p-4 text-right">Jumlah / Perubahan</th>
                <th className="p-4 text-right">Stok Sebelum</th>
                <th className="p-4 text-right">Stok Sesudah</th>
                <th className="p-4 text-right">Jumlah (RP)</th>
                <th className="p-4">Catatan / Ref</th>
                <th className="p-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {logs.map((log: MutationLog) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {formatJuluDate(log.createdAt)}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {log.ingredient?.name}
                  </td>
                  <td className="p-4">{renderBadge(log.type)}</td>

                  <td className="p-4 text-right font-extrabold font-mono text-sm">
                    {["CANCEL", "RESTOCK_IN", "ADJUSTMENT"].includes(log.type) ? (
                      <span className="text-emerald-600">
                        +{formatStockValue(log.quantity)} {log.ingredient?.unit}
                      </span>
                    ) : (
                      <span className="text-rose-600">
                        -{formatStockValue(log.quantity)} {log.ingredient?.unit}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right text-slate-400 font-mono">
                    {formatStockValue(log.previousStock)} {log.ingredient?.unit}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800 font-mono">
                    {formatStockValue(log.currentStock)} {log.ingredient?.unit}
                  </td>
                  <td className="p-4 text-right font-extrabold font-mono text-sm">
                    {log.totalCost > 0 && log.type === "LOSS" ? (
                      <span className="text-rose-600">
                        Rp {log.totalCost.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-emerald-600">
                        Rp {log.totalCost.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">
                    {log.notes || "-"}
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {log?.user?.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FORM MODALS */}
      {activeModal === "RESTOCK" && (
        <ModalRestockIn onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "LOSS" && (
        <ModalRecordLoss onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "ADJUSTMENT" && (
        <ModalStockOpname onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

/* ==========================================
   FORM MODAL 1: RESTOCK IN (BARANG MASUK)
========================================== */
interface ModalRestockInProps {
  onClose: () => void;
  // ingredients: string;
}
const ModalRestockIn: React.FC<ModalRestockInProps> = ({ onClose }) => {
  interface Ingredient {
    id: string;
    name: string;
    conversion_factor: number;
    purchase_cost: number;
    unit: "GRAM" | "ML" | "PCS";
    cost_per_unit: number;
    stock: number;
    minimumStock: number;
  }

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    ingredientId: "",
    quantity: 1,
    cost_per_unit: "",
    purchase_cost: "", // Harga per kemasan
    conversion_factor: "", // Isi per kemasan (dalam unit resep)
    referenceId: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. FETCH DAFTAR INGREDIENTS UNTUK DROP-DOWN & DATA HPP LAMA
  const {
    data: ingredientsDropList = [],
    isLoading: isLoadingIngredientsDropList,
  } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const url = endpoints.ingredients.get;
      const res = await api.get(url);
      if (!res.data?.data)
        throw new Error("Gagal mengambil daftar bahan baku.");
      return res?.data?.data?.[0] || [];
    },
  });

  // 3. AMBIL DATA INGREDIENT YANG SEDANG DIPILIH
  const selectedIngredient = useMemo(() => {
    return ingredientsDropList?.find(
      (item: Ingredient) => item.id === formData.ingredientId,
    );
  }, [ingredientsDropList, formData.ingredientId]);

  useEffect(() => {
    if (selectedIngredient) {
      setFormData((prev) => ({
        ...prev,
        purchase_cost: String(selectedIngredient.purchase_cost || ""),
        conversion_factor: String(selectedIngredient.conversion_factor || "1"),
      }));
    }
  }, [selectedIngredient]);

  // 4. LIVE KALKULASI HPP (MOVING AVERAGE)
  const calculation = useMemo(() => {
    if (!selectedIngredient) {
      return {
        totalBaseQuantity: 0,
        newCostPerUnit: 0,
        totalPurchaseAmount: 0,
        previousStock: 0,
        projectedStock: 0,
        oldCost: 0,
        newCost: 0,
        diff: 0,
      };
    }

    const packCount = Number(formData.quantity) || 0;
    const purchaseCost = Number(formData.purchase_cost) || 0;
    const conversionFactor = Number(formData.conversion_factor) || 1;

    // A. Total Qty Masuk dalam Unit Resep (Gram/ML) -> Dikirim ke backend DB
    const totalBaseQuantity = packCount * conversionFactor;

    // B. Total Nominal Belanja (Rp)
    const totalPurchaseAmount = packCount * purchaseCost;

    // C. HPP Beli Batch Ini
    const newCostPerUnit =
      conversionFactor > 0 ? purchaseCost / conversionFactor : 0;

    // D. Moving Average Calculation
    const previousStock = Number(selectedIngredient.stock || 0);
    const oldCost = Number(selectedIngredient.cost_per_unit || 0);
    const projectedStock = previousStock + totalBaseQuantity;

    let newCost = oldCost;
    if (newCostPerUnit > 0 && totalBaseQuantity > 0) {
      if (previousStock <= 0) {
        newCost = newCostPerUnit;
      } else {
        const oldTotalValue = previousStock * oldCost;
        const newTotalValue = totalBaseQuantity * newCostPerUnit;
        newCost = Math.round((oldTotalValue + newTotalValue) / projectedStock);
      }
    }

    const diff = newCost - oldCost;

    return {
      totalBaseQuantity,
      newCostPerUnit,
      totalPurchaseAmount,
      previousStock,
      projectedStock,
      oldCost,
      newCost,
      diff,
    };
  }, [
    selectedIngredient,
    formData.quantity,
    formData.purchase_cost,
    formData.conversion_factor,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    let _value: string | number = value;
    if (name === "quantity") {
      _value = Number(_value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: _value,
    }));
  };

  const restockMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const body = {
        ...payload,
        cost_per_unit:
          Number(payload.purchase_cost) / Number(payload.conversion_factor),
        quantity: Number(payload.quantity) * Number(payload.conversion_factor),
        purchase_cost: Number(payload.purchase_cost),
      };
      const url = endpoints.ingredientMutation.restock;
      await api.post(url, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingreMutation"] });
      queryClient.invalidateQueries({ queryKey: ["mutationSummaryData"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    restockMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Restock Masuk (Kemasan/Grosir)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Input pembelian grosir sesuai nota supplier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={restockMutation.isPending}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {restockMutation.isError && (
          <div className="mx-4 sm:mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{restockMutation.error.message}</span>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto"
        >
          {/* Select Bahan Baku */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Pilih Bahan Baku
            </label>
            <select
              name="ingredientId"
              value={formData.ingredientId}
              onChange={handleChange}
              disabled={isLoadingIngredientsDropList}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0F766E]"
              required
            >
              <option value="">
                --{" "}
                {isLoadingIngredientsDropList
                  ? "Memuat..."
                  : "Pilih Bahan Baku"}{" "}
                --
              </option>
              {ingredientsDropList?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit}) — Stok:{" "}
                  {item.stock.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Form Input Grosir */}
          <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
              <Package className="w-4 h-4 text-[#0F766E]" />
              <span>Rincian Pembelian Kemasan</span>
            </div>

            {/* Row 1: Qty Beli (Kemasan) & Harga Beli Per Kemasan */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Jumlah Kemasan (Beli)
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. 2"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="any"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Harga / Kemasan (Rp)
                </label>
                <input
                  type="number"
                  name="purchase_cost"
                  placeholder="e.g. 120000"
                  value={formData.purchase_cost}
                  onChange={handleChange}
                  min="0"
                  step="any"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                  required
                />
              </div>
            </div>

            {/* Row 2: Conversion Factor */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Faktor Konversi{" "}
                {selectedIngredient
                  ? `(1 Kemasan = ... ${selectedIngredient.unit})`
                  : ""}
              </label>
              <input
                type="number"
                name="conversion_factor"
                placeholder="e.g. 1000"
                value={formData.conversion_factor}
                onChange={handleChange}
                min="0.01"
                step="any"
                className="w-full p-2 bg-[#ffffff00] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                required
                disabled={true}
              />
            </div>
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {selectedIngredient && (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Kalkulasi Otomatis Sistem
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  Total Belanja: Rp{" "}
                  {calculation.totalPurchaseAmount.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Total Qty Masuk Stok
                  </p>
                  <p className="font-extrabold text-slate-900 mt-0.5">
                    +{calculation.totalBaseQuantity.toLocaleString()}{" "}
                    {selectedIngredient.unit}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    HPP Beli Batch Ini
                  </p>
                  <p className="font-extrabold text-slate-900 mt-0.5">
                    Rp {Math.round(calculation.newCostPerUnit).toLocaleString()}{" "}
                    / {selectedIngredient.unit}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">
                  Estimasi HPP Average (WAC):
                </span>
                <div className="flex items-center gap-1 font-extrabold">
                  {calculation.oldCost === calculation.newCost ? (
                    <span className="text-[#0F766E] text-xs">
                      Rp {calculation.newCost.toLocaleString()}
                    </span>
                  ) : (
                    <>
                      <span className="text-slate-500 line-through">
                        Rp {calculation.oldCost.toLocaleString()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-[#0F766E] text-xs">
                        Rp {calculation.newCost.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reference & Notes */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                No. Nota / Ref
              </label>
              <input
                type="text"
                name="referenceId"
                placeholder="INV-2026-001"
                value={formData.referenceId}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0F766E]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catatan
              </label>
              <input
                type="text"
                name="notes"
                placeholder="Supplier Kopi"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={restockMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={restockMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d625c] active:scale-95 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {restockMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Restock"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================
   FORM MODAL 2: RECORD LOSS (CATAT RUSAK/BASI)
========================================== */
interface ModalLossProps {
  onClose: () => void;
}
const ModalRecordLoss: React.FC<ModalLossProps> = ({ onClose }) => {
  interface Ingredient {
    id: string;
    name: string;
    conversion_factor: number;
    purchase_cost: number;
    unit: "GRAM" | "ML" | "PCS";
    cost_per_unit: number;
    stock: number;
    minimumStock: number;
  }

  const queryClient = useQueryClient();

  // 1. FETCH INGREDIENTS LIST
  const { data: ingredients = [], isLoading: isLoadingIngredients } = useQuery<
    Ingredient[]
  >({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const url = endpoints.ingredients.get;
      const res = await api.get(url);
      if (!res.data?.data)
        throw new Error("Gagal mengambil daftar bahan baku.");
      return res?.data?.data?.[0] || [];
    },
  });

  // 2. STATE FORM
  const [formData, setFormData] = useState({
    ingredientId: "",
    quantity: "", // Kuantitas terbuang (dalam Base Unit: Gram/ML/PCS)
    referenceId: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. AMBIL DATA INGREDIENT DIPILIH
  const selectedIngredient = useMemo(() => {
    return ingredients.find((item) => item.id === formData.ingredientId);
  }, [ingredients, formData.ingredientId]);

  // 4. LIVE KALKULASI IMPACT KERUGIAN (NOMINAL & STOK)
  const calculation = useMemo(() => {
    if (!selectedIngredient) {
      return {
        lossQty: 0,
        financialLoss: 0,
        previousStock: 0,
        projectedStock: 0,
        isOverStock: false,
      };
    }

    const lossQty = Number(formData.quantity) || 0;
    const previousStock = Number(selectedIngredient.stock || 0);
    const costPerUnit = Number(selectedIngredient.cost_per_unit || 0);

    // Hitung Estimasi Kerugian Rupiah (HPP * Qty Terbuang)
    const financialLoss = lossQty * costPerUnit;
    const projectedStock = previousStock - lossQty;
    const isOverStock = lossQty > previousStock;

    return {
      lossQty,
      financialLoss,
      previousStock,
      projectedStock,
      isOverStock,
    };
  }, [selectedIngredient, formData.quantity]);

  // 5. REACT QUERY MUTATION
  const lossMutation = useMutation({
    mutationFn: async () => {
      const body = {
        ingredientId: formData.ingredientId,
        quantity: Number(formData.quantity), // Qty terbuang (Base Unit)
        referenceId: formData.referenceId || undefined,
        notes: formData.notes || undefined,
      };
      const url = endpoints.ingredientMutation.loss;
      await api.post(url, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingreMutation"] });
      queryClient.invalidateQueries({ queryKey: ["mutationSummaryData"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummaryData"] });
      onClose();
    },
    onError: (err) => {
      console.log({ err });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculation.isOverStock) return; // Guard jika input melebihi stok
    lossMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3.5 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header Modal (Aksen Rose/Red) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-rose-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Catat Waste & Kerugian
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Pengurangan stok karena rusak, tumpah, atau expired
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={lossMutation.isPending}
            className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {lossMutation.isError && (
          <div className="mx-4 sm:mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {(lossMutation.error as any)?.response?.data?.message ||
                lossMutation.error?.message}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto"
        >
          {/* Select Bahan Baku */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Pilih Bahan Baku
            </label>
            <select
              name="ingredientId"
              value={formData.ingredientId}
              onChange={handleChange}
              disabled={isLoadingIngredients}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
              required
            >
              <option value="">
                -- {isLoadingIngredients ? "Memuat..." : "Pilih Bahan Baku"} --
              </option>
              {ingredients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit}) — Stok:{" "}
                  {item.stock.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Kuantitas Terbuang & Alasan */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Qty Terbuang{" "}
                {selectedIngredient ? `(${selectedIngredient.unit})` : ""}
              </label>
              <input
                type="number"
                name="quantity"
                placeholder="e.g. 200"
                value={formData.quantity}
                onChange={handleChange}
                min="0.01"
                step="any"
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 focus:outline-none ${
                  calculation.isOverStock
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/30"
                    : "border-slate-200 focus:border-rose-500"
                }`}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                No. Shift / Ref (Optional)
              </label>
              <input
                type="text"
                name="referenceId"
                placeholder="SHIFT-PAGI-01"
                value={formData.referenceId}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Peringatan jika Qty Terbuang > Stok Fisik */}
          {calculation.isOverStock && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Jumlah terbuang ({calculation.lossQty}) melebihi stok yang ada (
                {calculation.previousStock}).
              </span>
            </div>
          )}

          {/* 💡 LIVE FINANCIAL IMPACT PREVIEW WIDGET */}
          {selectedIngredient && !calculation.isOverStock && (
            <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Estimasi Kerugian (Cost Impact)
                </span>
                <span className="text-[10px] font-extrabold text-rose-700">
                  Rp {Math.round(calculation.financialLoss).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Pengurangan Stok
                  </p>
                  <div className="flex items-center gap-1 font-extrabold text-slate-800 mt-0.5">
                    <span>{calculation.previousStock.toLocaleString()}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-rose-600">
                      {calculation.projectedStock.toLocaleString()}{" "}
                      {selectedIngredient.unit}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    HPP Referensi (WAC)
                  </p>
                  <p className="font-extrabold text-slate-900 mt-0.5">
                    Rp{" "}
                    {Number(
                      selectedIngredient.cost_per_unit || 0,
                    ).toLocaleString()}{" "}
                    / {selectedIngredient.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Keterangan Detail
              </label>
              <input
                required
                type="text"
                name="notes"
                placeholder="Ex: Susu tersenggol pas steaming"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={lossMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                lossMutation.isPending ||
                calculation.isOverStock ||
                !formData.ingredientId
              }
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {lossMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Catat Kerugian"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==========================================
   FORM MODAL 3: STOCK OPNAME (ADJUSTMENT)
========================================== */
const ModalStockOpname: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Penyesuaian Stock Opname
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Stock Opname Diperbarui!");
            onClose();
          }}
          className="p-5 space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Pilih Bahan Baku
            </label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500">
              <option>Fructose Syrup (Stok Sistem: 5.000 ml)</option>
              <option>Beans Houseblend (Stok Sistem: 2.500 gram)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Stok Fisik Sebenarnya (Hasil Hitung)
            </label>
            <input
              type="number"
              placeholder="Masukkan jumlah aktual..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
            💡 Sistem akan menghitung selisih stok secara otomatis dan
            mencatatnya sebagai mutasi penyesuaian (Adjustment).
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Catatan Opname
            </label>
            <textarea
              placeholder="e.g. Opname rutin akhir minggu"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 h-20"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500"
            >
              Update Opname
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
