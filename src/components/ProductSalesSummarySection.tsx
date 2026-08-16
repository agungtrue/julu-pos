import React, { useState, useMemo } from "react";
import {
  Coffee,
  CupSoda,
  Cookie,
  Sparkles,
  ShoppingBag,
  Store,
  Apple,
  Wrench,
  Package,
  Layers,
} from "lucide-react";

// 1. Enum Definition
export enum ProductType {
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

// 2. Props & Data Types
export interface CategorySaleItem {
  type: ProductType | string;
  count: number;
  subCategories?: { label: string; count: number }[]; // Opsional: e.g. Kopi vs Non-Kopi di bawah Minuman
}

export interface ProductSalesSummaryProps {
  categorySales: CategorySaleItem[];
  averageBasketSize?: number; // e.g. 25870
  txPerDay?: number; // e.g. 18
}

// 3. Metadata Dictionary per Category (Icon, Label, Unit, Color)
const CATEGORY_META: Record<
  string,
  {
    label: string;
    unit: string;
    icon: React.ElementType;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  [ProductType.COFFEE]: {
    label: "Kopi",
    unit: "Cups",
    icon: Coffee,
    textColor: "text-[#0A8F8A]",
    bgColor: "bg-[#0A8F8A]/10",
    borderColor: "border-[#0A8F8A]/20",
  },
  [ProductType.NON_COFFEE]: {
    label: "Non-Kopi",
    unit: "Cups",
    icon: CupSoda,
    textColor: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  [ProductType.SNACKS]: {
    label: "Cemilan",
    unit: "Porsi",
    icon: Cookie,
    textColor: "text-[#EF5B2B]",
    bgColor: "bg-[#EF5B2B]/10",
    borderColor: "border-[#EF5B2B]/20",
  },
  [ProductType.TOPPING]: {
    label: "Topping",
    unit: "Pcs",
    icon: Sparkles,
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  [ProductType.RETAIL]: {
    label: "Retail",
    unit: "Pcs",
    icon: ShoppingBag,
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  [ProductType.GROCERY]: {
    label: "Grocery",
    unit: "Pack",
    icon: Store,
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  [ProductType.FRESH_PRODUCE]: {
    label: "Bahan Segar",
    unit: "Kg",
    icon: Apple,
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  [ProductType.SERVICE]: {
    label: "Jasa",
    unit: "Tx",
    icon: Wrench,
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  [ProductType.OTHER]: {
    label: "Lainnya",
    unit: "Pcs",
    icon: Package,
    textColor: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
  },
};

export function ProductSalesSummarySection({
  categorySales = [],
  averageBasketSize = 0,
  txPerDay = 0,
}: ProductSalesSummaryProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Filter & Agregasi Data
  const filteredData = useMemo(() => {
    if (selectedFilter === "ALL") {
      return categorySales;
    }
    return categorySales.filter((item) => item.type === selectedFilter);
  }, [categorySales, selectedFilter]);

  // Hitung Total Item Terjual Berdasarkan Filter
  const totalItemsSold = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [filteredData]);

  // Daftar Kategori yang Memiliki Data (Untuk Filter Options)
  const availableTypes = useMemo(() => {
    const typesInData = new Set(categorySales.map((item) => item.type));
    return Object.values(ProductType).filter((type) => typesInData.has(type));
  }, [categorySales]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#0A8F8A] rounded-full" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Produk Terjual
            </h3>
          </div>
          <span className="text-[10.5px] font-bold text-gray-400">
            {totalItemsSold.toLocaleString("id-ID")} Total Item
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          {/* Option: SEMUA */}
          <button
            type="button"
            onClick={() => setSelectedFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all shrink-0 flex items-center gap-1 border ${
              selectedFilter === "ALL"
                ? "bg-[#0A8F8A] text-white border-[#0A8F8A] shadow-2xs"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Semua</span>
          </button>

          {/* Dynamic Options Based on Enum */}
          {availableTypes.map((type) => {
            const meta = CATEGORY_META[type] || CATEGORY_META[ProductType.OTHER];
            const Icon = meta.icon;
            const isActive = selectedFilter === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all shrink-0 flex items-center gap-1 border ${
                  isActive
                    ? "bg-[#0A8F8A] text-white border-[#0A8F8A] shadow-2xs"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5 no-scrollbar">
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => {
            const meta =
              CATEGORY_META[item.type] || CATEGORY_META[ProductType.OTHER];
            const Icon = meta.icon;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${meta.bgColor} ${meta.borderColor} space-y-2 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg bg-white/80 ${meta.textColor} shadow-2xs`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-gray-800">
                      {meta.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-black ${meta.textColor}`}>
                      {item.count.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 ml-1">
                      {meta.unit}
                    </span>
                  </div>
                </div>

                {/* Sub-breakdown jika ada (misal: Kopi vs Non-Kopi) */}
                {item.subCategories && item.subCategories.length > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 text-[10.5px] text-gray-500 font-semibold">
                    {item.subCategories.map((sub, sIdx) => (
                      <span key={sIdx}>
                        {sub.label}:{" "}
                        <strong className="text-gray-800">{sub.count}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-xs text-gray-400 font-medium">
            Tidak ada transaksi untuk kategori ini.
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-400 font-medium">
            Rata-rata Belanja Pelanggan:
          </span>
          <span className="font-extrabold text-gray-800">
            Rp {Number(averageBasketSize).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-400 font-medium">
            Frekuensi Transaksi / Hari:
          </span>
          <span className="font-extrabold text-gray-800">
            {txPerDay} Tx/Hari
          </span>
        </div>
      </div>
    </div>
  );
}