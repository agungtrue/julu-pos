"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ScrollToTop from "@/components/ScrollToTop";
import {
  Package,
  CalculatorIcon,
  Edit,
  Plus,
  Save,
  Search,
  PackageCheck,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

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

interface RecipeIngredient {
  id: string;
  ingredient_id: string;
  ingredient: Ingredient;
  qty_used: number;
  unit: string;
  sub_total_cost: number;
}

interface RecipeItem {
  id: number;
  name: string;
  price: number;
  size: string;
  purchase_cost: number;
  ingredientsBreakdown: RecipeIngredient[];
  productIngredients: RecipeIngredient[];
}

export default function HppSystemPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"ingredients" | "recipes">(
    "ingredients",
  ); // Default ke resep agar langsung uji coba edit
  // STATE BARU UNTUK RACIK RESEP
  const [newRecipe, setNewRecipe] = useState<{
    name: string;
    purchase_cost: number;
    conversion_factor: number;
    unit: string;
    stock: number;
    minimumStock: number;
    ingredientsBreakdown: RecipeIngredient[];
  }>({
    name: "",
    purchase_cost: 0,
    conversion_factor: 0,
    unit: "",
    stock: 0,
    minimumStock: 0,
    ingredientsBreakdown: [],
  });

  const [editIngredient, setEditIngredient] = useState<{
    id: string;
    name: string;
    purchase_cost: number;
    conversion_factor: number;
    unit: string;
    stock: number;
    minimumStock: number;
    ingredientsBreakdown: RecipeIngredient[];
  }>({
    id: "",
    name: "",
    purchase_cost: 0,
    conversion_factor: 0,
    unit: "",
    stock: 0,
    minimumStock: 0,
    ingredientsBreakdown: [],
  });

  const queryClient = useQueryClient();

  // get ingredients
  const fetchIngredientsData = async () => {
    const url = endpoints.ingredients.get;
    const response = await api.get(url);

    return response?.data?.data?.[0] || [];
  };

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ["ingredientsData"],
    queryFn: fetchIngredientsData,
  });

  // console.log({ isLoadingIngredients, ingredientsData })

  interface SaveIngredientsPayload {
    name: string;
    purchase_cost: number;
    conversion_factor: number;
    unit: string;
    stock: number;
    minimumStock: number;
  }

  interface UpdateIngredientsPayload {
    id: string;
    name: string;
    purchase_cost: number;
    conversion_factor: number;
    unit: string;
    stock: number;
    minimumStock: number;
  }

  // post ingredients
  const { mutate: handleSaveIngredients, isPending } = useMutation({
    mutationFn: async (payload: SaveIngredientsPayload) => {
      return await api.post(endpoints.ingredients.post, payload);
    },
    onSuccess: () => {
      setIsAddBahanBakuModalOpen(false);
      setIsSaving(false);

      queryClient.invalidateQueries({ queryKey: ["ingredientsData"] });
    },
  });

  // patch ingredients
  const { mutate: patchIngredients } = useMutation({
    mutationFn: async (payload: UpdateIngredientsPayload) => {
      return await api.patch(endpoints.ingredients.patch(payload.id), payload);
    },
    onSuccess: () => {
      setIsEditBahanBakuModalOpen(false);
      setIsSaving(false);
      setAddedStock(0);

      queryClient.invalidateQueries({ queryKey: ["ingredientsData"] });
      queryClient.invalidateQueries({ queryKey: ["productData", "cogs"] });
    },
  });

  const ingredients = ingredientsData;

  // get products
  const fetchProductsData = async () => {
    const url = endpoints.products.getWithIngredients;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["productData", "cogs"],
    queryFn: fetchProductsData,
  });

  const recipes = productsData?.map((data: RecipeItem) => {
    const map = {
      ...data,
      ingredientsBreakdown: data.productIngredients ?? [],
    };
    return map;
  });

  // console.log({ recipes })

  interface SaveRecipePayload {
    product_id: number;
    ingredients: {
      ingredient_id: string;
      qty_used: number;
    }[];
  }

  // post ingredients recipe
  const { mutate: handleSaveRecipe } = useMutation({
    mutationFn: async (payload: SaveRecipePayload) => {
      return await api.post(endpoints.ingredients.recipe.post, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productData", "cogs"] });

      // Tutup modal dengan sukses
      setIsModalOpen(false);
      setEditingRecipe(null);
      setIsSaving(false);
    },
  });

  // STATE MANAGEMENT UNTUK FORM EDIT FORMULA RESEP
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddBahanBakuModalOpen, setIsAddBahanBakuModalOpen] = useState(false);
  const [isEditBahanBakuModalOpen, setIsEditBahanBakuModalOpen] =
    useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeItem | null>(null);
  const [addedStock, setAddedStock] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNewIngredientId, setSelectedNewIngredientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryRecipe, setsSearchQueryRecipe] = useState("");

  const numericAddedStock = Number(addedStock) || 0;
  const previewTotalStock = (editIngredient?.stock || 0) + numericAddedStock;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getRecipeTotalHpp = (items: { sub_total_cost: number }[]) => {
    return items.reduce((acc, curr) => acc + curr.sub_total_cost, 0);
  };

  // Pemicu Pembukaan Modal Edit Formula
  const handleOpenEditModal = (recipe: RecipeItem) => {
    setEditingRecipe(JSON.parse(JSON.stringify(recipe)));
    setIsModalOpen(true);
  };

  // Fungsi LIVE RECALCULATION: Berjalan setiap kali isi input takaran diubah di modal
  const handleQtyChange = (ingredientId: string, newQty: string | number) => {
    if (!editingRecipe) return;

    const targetIngredient = ingredients.find(
      (i: Ingredient) => i.id === ingredientId,
    );
    const costPerUnit = targetIngredient ? targetIngredient.cost_per_unit : 0;
    const numericQty = Math.max(0, parseFloat(String(newQty)) || 0);

    const updatedBreakdown = editingRecipe?.ingredientsBreakdown.map((item) => {
      if (item.ingredient?.id === ingredientId) {
        return {
          ...item,
          qty_used: newQty as unknown as number,
          sub_total_cost: numericQty * costPerUnit,
        };
      }
      return item;
    });

    // console.log({ handleQtyChange_updatedBreakdown: updatedBreakdown })

    setEditingRecipe({
      ...editingRecipe,
      ingredientsBreakdown: updatedBreakdown,
    });
  };

  // FUNGSI UTAMA: SAVE DATA & SINKRONISASI COGS KE TABLE PRODUCT VIA API
  const handleSaveRecipeFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    setIsSaving(true);

    console.log({ editingRecipe });

    handleSaveRecipe({
      product_id: editingRecipe.id,
      ingredients: editingRecipe.ingredientsBreakdown.map((data) => {
        return { ingredient_id: data.ingredient_id, qty_used: data.qty_used };
      }),
    });
  };

  function createRandomStringId(prefix: string = "temp"): string {
    const randomStr = Math.random().toString(36).substring(2, 9);
    const timestampStr = Date.now().toString(36);

    return `${prefix}-${randomStr}-${timestampStr}`;
  }

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    // console.log({selectedNewIngredientId})

    const targetMaster = ingredientsData.find(
      (m: Ingredient) => m.id === selectedNewIngredientId,
    );
    // console.log({ targetMaster, editingRecipe })
    if (!targetMaster) return;

    const newIngredientRow = {
      id: createRandomStringId("ing"),
      ingredient_id: targetMaster.id,
      ingredient: targetMaster,
      product_id: editingRecipe?.id,
      qty_used: 0,
      unit: targetMaster.unit || "GRAM",
      sub_total_cost: 0,
    };

    setEditingRecipe({
      ...editingRecipe,
      ingredientsBreakdown: [
        ...editingRecipe.ingredientsBreakdown,
        newIngredientRow,
      ],
    });

    setSelectedNewIngredientId("");
  };

  const handleOpenAddBahanBakuModalOpen = () => {
    setIsAddBahanBakuModalOpen(true);
  };

  const handleSaveNewRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // console.log({ newRecipe });

    // RENAME newRecipe as ingredients
    handleSaveIngredients({
      name: newRecipe.name,
      purchase_cost: newRecipe.purchase_cost,
      conversion_factor: newRecipe.conversion_factor,
      unit: newRecipe.unit,
      stock: newRecipe.stock,
      minimumStock: newRecipe.minimumStock,
    });
  };

  const handleEditIngredients = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    patchIngredients({
      id: editIngredient.id,
      name: editIngredient.name,
      purchase_cost: editIngredient.purchase_cost,
      conversion_factor: editIngredient.conversion_factor,
      unit: editIngredient.unit,
      stock: editIngredient.stock + addedStock,
      minimumStock: editIngredient.minimumStock,
    });
  };

  const filteredIngredients = ingredients?.filter((p: Ingredient) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const filteredRecipes = recipes?.filter((p: RecipeItem) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQueryRecipe.toLowerCase());

    return matchesSearch;
  });

  // State untuk kalkulator Batch / Prestock
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<
    Array<{ id: string; quantity: number }>
  >([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  // Helper: Tambah baris bahan batch
  const handleAddBatchItem = () => {
    setBatchItems([...batchItems, { id: "", quantity: 0 }]);
  };

  // Helper: Hapus baris bahan batch
  const handleRemoveBatchItem = (index: number) => {
    setBatchItems(batchItems.filter((_, i) => i !== index));
  };

  // Helper: Update item batch
  const handleUpdateBatchItem = (
    index: number,
    field: "id" | "quantity",
    value: any,
  ) => {
    const updated = [...batchItems];
    updated[index] = { ...updated[index], [field]: value };
    setBatchItems(updated);
  };

  // Kalkulasi Total HPP Batch secara Real-time
  const totalBatchCost = batchItems.reduce((acc, item) => {
    const selectedMat = ingredientsData?.find(
      (m: Ingredient) => m.id === item.id,
    );
    if (!selectedMat || !selectedMat.conversion_factor) return acc;
    const costPerUnit =
      selectedMat.purchase_cost / selectedMat.conversion_factor;
    return acc + costPerUnit * (Number(item.quantity) || 0);
  }, 0);

  // Terapkan hasil kalkulasi ke input "Harga Beli"
  const handleApplyBatchCost = () => {
    setNewRecipe({
      ...newRecipe,
      purchase_cost: Math.round(totalBatchCost),
    });
  };

  // Handler Tambah Bahan ke List
  const handleAddSelectedBatchItem = () => {
    if (!selectedBatchId) return;
    setBatchItems([...batchItems, { id: selectedBatchId, quantity: 0 }]);
    setSelectedBatchId(""); // Reset select setelah ditambahkan
  };

  const handleApplyBatchCostToEdit = () => {
    setEditIngredient({
      ...editIngredient,
      purchase_cost: Math.round(totalBatchCost),
    });
  };

  // State Modal Reset Stok
  const [isResetStockModalOpen, setIsResetStockModalOpen] = useState(false);
  const [resetSearchQuery, setResetSearchQuery] = useState("");
  const [selectedResetIds, setSelectedResetIds] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Handler Pilih & Hapus
  const handleSelectForReset = (id: string) => {
    if (!selectedResetIds.includes(id)) {
      setSelectedResetIds([...selectedResetIds, id]);
    }
  };

  const handleRemoveFromReset = (id: string) => {
    setSelectedResetIds(selectedResetIds.filter((itemId) => itemId !== id));
  };

  const handleSelectAllFiltered = (filteredItems: any[]) => {
    const newIds = filteredItems.map((item) => item.id);
    const combined = Array.from(new Set([...selectedResetIds, ...newIds]));
    setSelectedResetIds(combined);
  };

  const { mutate: handleConfirmReset } = useMutation({
    mutationFn: async () => {
      if (selectedResetIds.length === 0) return;
      setIsResetting(true);

      return await api.post(endpoints.ingredientMutation.reset, {
        ids: selectedResetIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientsData"] });
      queryClient.invalidateQueries({ queryKey: ["productData", "cogs"] });
      queryClient.invalidateQueries({ queryKey: ["ingreMutation"] });
      queryClient.invalidateQueries({ queryKey: ["mutationSummaryData"] });

      setSelectedResetIds([]);
      setResetSearchQuery("");
      setIsResetStockModalOpen(false);
      setIsResetting(false);
    },
  });

  if (isLoadingProducts || isLoadingIngredients) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Sistem HPP & COGS
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
            Hitung Modal Bahan Sampai Jadi Menu
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">
            Biar tau modal 1 gelas berapa, jadi harga jual ga asal tebak.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-full sm:w-auto min-w-[340px] max-w-lg font-medium shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("ingredients")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-extrabold whitespace-nowrap transition-all duration-200 active:scale-[0.98] ${
            activeTab === "ingredients"
              ? "bg-[#0F766E] text-white shadow-md shadow-[#0F766E]/20"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
          }`}
        >
          <Package className="w-4 h-4 stroke-[2.2]" />
          <span>Bahan Baku</span>
          <span
            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full transition-colors ${
              activeTab === "ingredients"
                ? "bg-white/20 text-white"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {ingredients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recipes")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider font-extrabold whitespace-nowrap transition-all duration-200 active:scale-[0.98] ${
            activeTab === "recipes"
              ? "bg-[#0F766E] text-white shadow-md shadow-[#0F766E]/20"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
          }`}
        >
          <CalculatorIcon className="w-4 h-4 stroke-[2.2]" />
          <span>Formula Resep</span>
          <span
            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full transition-colors ${
              activeTab === "recipes"
                ? "bg-white/20 text-white"
                : "bg-slate-200/80 text-slate-600"
            }`}
          >
            {recipes.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LIST BAHAN BAKU */}
      {activeTab === "ingredients" && (
        <>
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama bahan baku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsResetStockModalOpen(true)}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50/80 hover:bg-red-100 border border-red-200/60 px-3.5 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reset Stok</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddBahanBakuModalOpen}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#EF5B2B] hover:bg-[#EF5B2B]/90 px-3.5 py-2 rounded-xl active:scale-95 transition-all shadow-md shadow-[#EF5B2B]/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Bahan Baku Baru</span>
            </button>
          </div>
          {/* <button
            onClick={handleOpenAddBahanBakuModalOpen}
            className="lex-1 flex gap-2 text-xs font-black text-[#EF5B2B] bg-[#EF5B2B]/5 px-3 py-1.5 rounded-xl hover:bg-[#EF5B2B]/10 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Bahan Baku Baru
          </button> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIngredients?.map((ing: Ingredient) => {
              // 1. Logic Indikator Stok Menipis
              const isLowStock = Number(ing.stock) <= Number(ing.minimumStock);

              // 2. Kalkulasi % Progress Bar (Berdasarkan rasio terhadap min. stock)
              const targetRef = Number(ing.minimumStock) * 2 || 100;
              const stockPercentage = Math.min(
                Math.round((Number(ing.stock) / targetRef) * 100),
                100,
              );

              return (
                <div
                  key={ing.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                    isLowStock
                      ? "border-red-200 ring-1 ring-red-100"
                      : "border-gray-100"
                  }`}
                >
                  {/* Strip Merah Atas Jika Stok Menipis */}
                  {isLowStock && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                  )}

                  <div>
                    {/* Header Card: Nama & Badge Status */}
                    <div className="flex justify-between items-start gap-2 mb-3.5">
                      <div>
                        <h4 className="font-bold text-gray-900 tracking-tight text-base">
                          {ing.name}
                        </h4>
                        <span className="text-[11px] font-medium text-gray-400">
                          Satuan:{" "}
                          <strong className="text-gray-600">{ing.unit}</strong>
                        </span>
                      </div>

                      {/* Badge Status */}
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Stok Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0A8F8A]/10 text-[#0A8F8A] shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0A8F8A]" />
                          Aman
                        </span>
                      )}
                    </div>

                    {/* Area Highlight Stok & Progress Bar */}
                    <div className="bg-gray-50 rounded-xl p-3.5 mb-3.5 border border-gray-100">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs font-semibold text-gray-500">
                          Sisa Stok:
                        </span>
                        <div className="text-right">
                          <span
                            className={`text-base font-extrabold ${
                              isLowStock ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {ing.stock?.toLocaleString("id-ID")}
                          </span>
                          <span className="text-xs font-medium text-gray-400 ml-1">
                            / min {ing.minimumStock?.toLocaleString("id-ID")}{" "}
                            {ing.unit}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar Stok */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLowStock ? "bg-red-500" : "bg-[#0A8F8A]"
                          }`}
                          style={{ width: `${Math.max(stockPercentage, 4)}%` }}
                        />
                      </div>
                    </div>

                    {/* Grid Mini Stat: Harga Grosir & Modal Per Unit */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          Harga Grosir
                        </span>
                        <div>
                          <span className="font-bold text-gray-800 block">
                            {formatIDR(ing.purchase_cost)}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Isi: {ing.conversion_factor} {ing.unit}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#EF5B2B]/5 p-2.5 rounded-xl border border-[#EF5B2B]/10 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-[#EF5B2B] uppercase tracking-wider block mb-0.5">
                          Cost / {ing.unit}
                        </span>
                        <div>
                          <span className="font-black text-[#EF5B2B] font-mono text-sm block">
                            {formatIDR(ing.cost_per_unit)}
                          </span>
                          <span className="text-[10px] text-[#EF5B2B]/70 block mt-0.5">
                            Modal Racikan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Full Width */}
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditBahanBakuModalOpen(true);
                        setEditIngredient({ ...editIngredient, ...ing });
                      }}
                      className="w-full flex justify-center items-center gap-2 bg-gray-50 hover:bg-[#0A8F8A] text-gray-600 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 border border-gray-200 hover:border-[#0A8F8A] shadow-none"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Bahan Baku
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty State jika data kosong */}
            {filteredIngredients?.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-gray-800">
                  Bahan Baku tidak ditemukan
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Belum ada bahan baku yang ditambahkan atau kata kunci
                  pencarian Anda tidak cocok.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: FORMULA RESEP UTAMA */}
      {activeTab === "recipes" && (
        <>
          {/* <button 
            onClick={handleOpenAddModal}
            className="text-xs font-black text-[#EF5B2B] bg-[#EF5B2B]/5 px-3 py-1.5 rounded-xl hover:bg-[#EF5B2B]/10 transition-colors"
            >
            ➕ Racik Resep Baru
            </button> */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama resep..."
                value={searchQueryRecipe}
                onChange={(e) => setsSearchQueryRecipe(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="space-y-6">
            {filteredRecipes?.map((recipe: RecipeItem) => {
              const totalHpp = getRecipeTotalHpp(recipe.ingredientsBreakdown);
              const grossProfit = recipe.price - totalHpp;
              const marginPercentage = (
                (grossProfit / recipe.price) *
                100
              ).toFixed(1);

              return (
                <div
                  key={recipe.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-black text-gray-800 text-base tracking-tight">
                        {recipe.name} {recipe.size}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {" "}
                        Harga Jual Menu:{" "}
                        <span className="font-bold text-gray-700 font-mono">
                          {formatIDR(recipe.price)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 font-mono text-xs">
                        <div className="bg-gray-50 px-3 py-1.5 rounded-xl text-center">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold">
                            HPP Total
                          </span>
                          <span className="text-gray-800 font-bold">
                            {formatIDR(totalHpp)}
                          </span>
                        </div>
                        <div className="bg-green-50 px-3 py-1.5 rounded-xl text-center">
                          <span className="text-[9px] text-green-600 block uppercase font-bold">
                            Margin
                          </span>
                          <span className="text-green-600 font-black">
                            +{marginPercentage}%
                          </span>
                        </div>
                      </div>
                      {/* TOMBOL EDIT TAKARAN */}
                      <button
                        onClick={() => handleOpenEditModal(recipe)}
                        className="flex flex-1 justify-center items-center gap-2 bg-gray-50 hover:bg-[#0F766E] text-gray-600 hover:text-white font-bold p-2.5 rounded-xl text-xs transition-colors border border-gray-100 active:scale-95"
                        title="Adjust Takaran Resep"
                      >
                        <Edit className="h-4 w-4" />
                        Adjust Formula
                      </button>
                      {/* <button
                        onClick={() => handleOpenEditModal(product)}
                        className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-bold text-xs rounded-xl transition-all active:scale-95"
                      >
                        {product.productIngredients?.length > 0 ? '📝 Adjust Formula' : '➕ Tambah Resep'}
                      </button> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {recipe.ingredientsBreakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100/50"
                      >
                        <span className="font-semibold text-gray-600">
                          {item.ingredient?.name}
                        </span>
                        <span className="font-mono font-bold text-gray-400">
                          {item.qty_used} {item.ingredient?.unit}{" "}
                          {/* {item?.qty_used || 0} gram/ml/pcs */}
                          <span className="text-gray-700 ml-2">
                            ({formatIDR(item.sub_total_cost || 0)})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredRecipes?.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
                <span className="text-3xl block mb-2"></span>
                <h4 className="text-sm font-bold text-gray-700">
                  Formula resep tidak ditemukan
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Coba periksa kembali
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 📱 INTERACTIVE SLIDE-UP MODAL ENGINE FOR ADJuSTING RECIPE */}
      {isModalOpen && editingRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          {/* Deteksi klik luar untuk menutup modal */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isSaving) setIsModalOpen(false);
            }}
          />

          <form
            onSubmit={handleSaveRecipeFormula}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto border border-gray-100 transform translate-y-0 transition-transform duration-300"
          >
            {/* Top Modal Info */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-1">
              <div>
                <span className="text-[10px] bg-[#EF5B2B]/10 text-[#EF5B2B] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Modifikasi Resep
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-2">
                  {editingRecipe.name} {editingRecipe.size}
                </h3>
                <span className="text-[14px] text-gray-400 font-mono pl-1">
                  <span className="text-gray-800 font-bold">
                    {formatIDR(editingRecipe.price)}
                  </span>
                </span>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-mono text-lg p-1 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-1 pt-2">
              <div className="flex flex-col gap-2 bg-gray-50/40 border border-dashed border-gray-200 p-4 rounded-2xl">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Tambah Komponen Bahan Baku
                </label>

                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      e.preventDefault();
                      setSelectedNewIngredientId(e.target.value);
                    }}
                    defaultValue=""
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="" disabled>
                      ── Pilih Bahan Baku ──
                    </option>

                    {/* Filter: Hanya tampilkan bahan yang BELUM dimasukkan ke resep */}
                    {ingredientsData
                      ?.filter(
                        (master: Ingredient) =>
                          !editingRecipe?.ingredientsBreakdown.some(
                            (item) => item.ingredient_id === master.id,
                          ),
                      )
                      .map((master: Ingredient) => (
                        <option key={master.id} value={master.id}>
                          {master.name} ({master.unit})
                        </option>
                      ))}
                  </select>

                  {!selectedNewIngredientId ? (
                    ""
                  ) : (
                    <div
                      className="flex items-center justify-center bg-teal-50 text-[#0F766E] rounded-xl px-4 text-xs font-black uppercase tracking-wider cursor-pointer"
                      onClick={handleAddIngredient}
                    >
                      + Add
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Section: Kolom Input Pengubah Takaran */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {editingRecipe.ingredientsBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50/70 border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-gray-700">
                      {item.ingredient?.name || ""}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Biaya Terhitung:{" "}
                      <span className="text-gray-800 font-bold">
                        {formatIDR(item.sub_total_cost)}
                      </span>
                    </span>
                  </div>

                  {/* INPUT NUMERIK TAKARAN */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={isSaving}
                      value={item.qty_used ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(",", ".");
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          handleQtyChange(item.ingredient.id, val);
                        }
                      }}
                      className="w-24 text-center bg-white border border-gray-200 rounded-xl py-2 px-3 font-mono font-bold text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] text-gray-800 disabled:bg-gray-100"
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase w-10 font-mono">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Recalculation Bar Panel */}
            <div className="bg-[#0F766E] text-white rounded-2xl p-4 my-6 flex justify-between items-center font-mono text-xs shadow-inner shadow-black/10">
              <div>
                <span className="text-[10px] text-white/70 block font-sans font-bold uppercase tracking-wider">
                  Live Total HPP:
                </span>
                <span className="text-lg font-black tracking-tight">
                  {formatIDR(
                    getRecipeTotalHpp(editingRecipe.ingredientsBreakdown),
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/70 block font-sans font-bold uppercase tracking-wider">
                  Estimasi Margin:
                </span>
                <span className="text-base font-black text-amber-300">
                  +
                  {(
                    ((editingRecipe.price -
                      getRecipeTotalHpp(editingRecipe.ingredientsBreakdown)) /
                      editingRecipe.price) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            {/* Action Buttons Submit */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                className="col-span-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="col-span-2 bg-[#0F766E] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#0F766E]/10 hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="flex flex-1 gap-2 justify-center items-center">
                    <Save className="w-4 h-4" />
                    Simpan & Update COGS
                  </span>
                  // Simpan
                  // "Simpan & Update COGS"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📱 INTERACTIVE SLIDE-UP MODAL: BAHAN BAKU BARU */}
      {isAddBahanBakuModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isSaving) setIsAddBahanBakuModalOpen(false);
            }}
          />

          <form
            onSubmit={handleSaveNewRecipe}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto border border-gray-100"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Perhitungan Biaya Bahan Baku
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-1.5">
                  Tambah Bahan Baku
                </h3>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsAddBahanBakuModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Toggle Batch / Prestock Mode */}
            <div className="my-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between transition-all hover:border-[#0F766E]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center text-xs font-black">
                  🧮
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Kalkulator Prestock / Batch
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Hitung HPP otomatis dari racikan beberapa bahan baku
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBatchMode}
                  onChange={(e) => setIsBatchMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>

            {/* Section Calculator (Hanya muncul jika Batch Mode ON) */}
            {isBatchMode && (
              <div className="bg-[#0F766E]/[0.03] border border-dashed border-[#0F766E]/30 rounded-2xl p-4 mb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                {/* Header & Main Single Select Picker */}
                <div className="space-y-2 pb-3 border-b border-dashed border-[#0F766E]/20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E]">
                      Formulasi Batch
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Select Utama dengan Filtering Auto-Exclude */}
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="flex-1 bg-white border border-gray-200/80 rounded-xl py-2 px-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F766E] shadow-sm"
                    >
                      <option value="">-- Pilih Bahan Baku --</option>
                      {ingredientsData
                        ?.filter(
                          (mat: Ingredient) =>
                            !batchItems.some((b) => b.id === mat.id),
                        )
                        .map((mat: Ingredient) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} (Rp{" "}
                            {mat.purchase_cost?.toLocaleString("id-ID")} {" - "}
                            {mat.unit})
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      disabled={!selectedBatchId}
                      onClick={handleAddSelectedBatchItem}
                      className="bg-[#0F766E] disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-black px-3.5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm hover:bg-[#0F766E]/90 transition-all flex items-center gap-1 whitespace-nowrap active:scale-95"
                    >
                      <span>+</span> Tambah
                    </button>
                  </div>
                </div>

                {/* List Item Racikan (Murni Teks + Input Qty) */}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                  {batchItems?.length === 0 ? (
                    <p className="text-center text-[10px] text-gray-400 py-3 italic">
                      Belum ada bahan baku yang dimasukkan ke racikan batch.
                    </p>
                  ) : (
                    batchItems.map((item, idx) => {
                      const selectedMat = ingredientsData?.find(
                        (m: Ingredient) => m.id === item.id,
                      );
                      const itemCost =
                        selectedMat && selectedMat.conversion_factor
                          ? (selectedMat.purchase_cost /
                              selectedMat.conversion_factor) *
                            (item.quantity || 0)
                          : 0;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200"
                        >
                          {/* Tampilan Nama & Detail Bahan (Text Only) */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {selectedMat?.name || "Bahan Baku"}
                            </p>
                            <p className="text-[9px] text-gray-400 font-medium">
                              Rp{" "}
                              {selectedMat?.purchase_cost?.toLocaleString(
                                "id-ID",
                              ) || 0}
                            </p>
                          </div>

                          {/* Input Qty */}
                          <div className="relative w-24">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) =>
                                handleUpdateBatchItem(
                                  idx,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-gray-50 border border-gray-200/80 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#0F766E] focus:bg-white text-right pr-7"
                            />
                            <span className="absolute right-2 top-1.5 text-[9px] text-gray-400 font-semibold pointer-events-none">
                              {selectedMat?.unit || ""}
                            </span>
                          </div>

                          {/* Kalkulasi HPP per item */}
                          <span className="text-[11px] font-mono font-bold text-gray-700 w-20 text-right">
                            Rp {Math.round(itemCost).toLocaleString("id-ID")}
                          </span>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchItem(idx)}
                            className="w-6 h-6 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dotted Separation */}
                <div className="border-b border-dashed border-[#0F766E]/20 pt-1" />

                {/* Result & Apply Action */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      Estimasi HPP Batch
                    </span>
                    <span className="text-base font-mono font-black text-[#0F766E]">
                      Rp {Math.round(totalBatchCost).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyBatchCost}
                    className="bg-[#0F766E] hover:bg-[#0F766E]/90 text-white text-[10px] font-black px-3.5 py-2 rounded-xl uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>↙</span> Gunakan ke Harga Beli
                  </button>
                </div>
              </div>
            )}

            {/* Garis Pembatas Utama */}
            <div className="border-b border-dashed border-gray-200 mb-5" />

            {/* Input Form Utama */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Nama Bahan Baku
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Biang Teh 5L, Milk"
                  value={newRecipe.name}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, name: e.target.value })
                  }
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white font-semibold text-gray-800 transition-all"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Harga Beli (Rp)
                  </label>
                  {isBatchMode && newRecipe.purchase_cost > 0 && (
                    <span className="text-[9px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-1.5 py-0.5 rounded">
                      Auto-calculated
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  placeholder="Ex: 15000"
                  value={
                    newRecipe.purchase_cost === 0 ? "" : newRecipe.purchase_cost
                  }
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      purchase_cost: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white font-mono font-bold text-gray-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Conversion Factor
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 5000 (Isi Bersih)"
                  value={
                    newRecipe.conversion_factor === 0
                      ? ""
                      : newRecipe.conversion_factor
                  }
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      conversion_factor: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white font-mono font-bold text-gray-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Satuan (Unit)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ML / GRAM / PCS"
                  value={newRecipe.unit}
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      unit: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white font-mono font-bold text-gray-800 transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Stok Awal
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 5000"
                  value={newRecipe.stock}
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      stock: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white font-mono font-bold text-gray-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Minimum Stok
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 1000"
                  value={newRecipe.minimumStock}
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      minimumStock: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white font-mono font-bold text-gray-800 transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 mt-auto">
              <button
                type="button"
                onClick={() => setIsAddBahanBakuModalOpen(false)}
                className="col-span-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="col-span-2 bg-[#EF5B2B] hover:bg-[#EF5B2B]/90 active:scale-[0.99] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#EF5B2B]/20 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Simpan Bahan Baku"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* edit bahan baku */}
      {isEditBahanBakuModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isSaving) setIsEditBahanBakuModalOpen(false);
            }}
          />

          <form
            onSubmit={handleEditIngredients}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto border border-gray-100"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Edit Bahan Baku
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-1.5">
                  {editIngredient.name || "Bahan Baku"}
                </h3>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsEditBahanBakuModalOpen(false)}
                className="text-gray-400 font-mono text-lg hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Alert Mutasi Stok */}
            <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm mb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E]">
                  <PackageCheck className="w-4 h-4 shrink-0" />
                  <span>Ingin Tambah / Restock Bahan Baku?</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Penambahan stok & penyesuaian harga beli dilakukan terpusat
                  melalui{" "}
                  <strong className="text-slate-800">Mutasi Stok</strong> agar
                  histori & kalkulasi HPP (WAC) tercatat akurat.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard/stock-mutation?isRestockModal=true");
                }}
                className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#0F766E] hover:bg-[#0d625c] active:scale-95 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-sm"
              >
                <span>Buka Mutasi Stok</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info Stok saat ini */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-gray-500">
                Stok Saat Ini:
              </span>
              <span className="text-sm font-black text-gray-800 font-mono">
                {editIngredient.stock} {editIngredient.unit}
              </span>
            </div>

            {/* Toggle Batch / Prestock Mode */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center text-xs font-black">
                  🧮
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Kalkulator Prestock / Batch?
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Hitung HPP otomatis dari racikan bahan lain
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBatchMode}
                  onChange={(e) => setIsBatchMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
              </label>
            </div>

            {/* Section Calculator (Hanya muncul jika Batch Mode ON) */}
            {isBatchMode && (
              <div className="bg-[#0F766E]/[0.03] border border-dashed border-[#0F766E]/30 rounded-2xl p-4 mb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                {/* Main Single Select Picker */}
                <div className="space-y-2 pb-3 border-b border-dashed border-[#0F766E]/20">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0F766E]">
                      Formulasi Batch
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Select Utama: Auto Exclude bahan yang sedang di-edit & yang sudah di-add */}
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="flex-1 bg-white border border-gray-200/80 rounded-xl py-2 px-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F766E] shadow-sm"
                    >
                      <option value="">-- Pilih Bahan Baku --</option>
                      {ingredientsData
                        ?.filter(
                          (mat: Ingredient) =>
                            mat.id !== editIngredient.id && // Exclude bahan yang sedang di-edit
                            !batchItems.some((b) => b.id === mat.id), // Exclude yang sudah masuk list
                        )
                        .map((mat: Ingredient) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} (Rp{" "}
                            {mat.purchase_cost?.toLocaleString("id-ID")} {" - "}
                            {mat.unit})
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      disabled={!selectedBatchId}
                      onClick={handleAddSelectedBatchItem}
                      className="bg-[#0F766E] disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-black px-3.5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm hover:bg-[#0F766E]/90 transition-all flex items-center gap-1 whitespace-nowrap active:scale-95"
                    >
                      <span>+</span> Tambah
                    </button>
                  </div>
                </div>

                {/* List Item Racikan */}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                  {batchItems.length === 0 ? (
                    <p className="text-center text-[10px] text-gray-400 py-3 italic">
                      Belum ada bahan baku yang dimasukkan ke racikan batch.
                    </p>
                  ) : (
                    batchItems.map((item, idx) => {
                      const selectedMat = ingredientsData?.find(
                        (m: Ingredient) => m.id === item.id,
                      );
                      const itemCost =
                        selectedMat && selectedMat.conversion_factor
                          ? (selectedMat.purchase_cost /
                              selectedMat.conversion_factor) *
                            (item.quantity || 0)
                          : 0;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {selectedMat?.name || "Bahan Baku"}
                            </p>
                            <p className="text-[9px] text-gray-400 font-medium">
                              Rp{" "}
                              {selectedMat?.purchase_cost?.toLocaleString(
                                "id-ID",
                              ) || 0}
                            </p>
                          </div>

                          <div className="relative w-24">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) =>
                                handleUpdateBatchItem(
                                  idx,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-gray-50 border border-gray-200/80 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#0F766E] focus:bg-white text-right pr-7"
                            />
                            <span className="absolute right-2 top-1.5 text-[9px] text-gray-400 font-semibold pointer-events-none">
                              {selectedMat?.unit || ""}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono font-bold text-gray-700 w-20 text-right">
                            Rp {Math.round(itemCost).toLocaleString("id-ID")}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveBatchItem(idx)}
                            className="w-6 h-6 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-b border-dashed border-[#0F766E]/20 pt-1" />

                {/* Result & Apply Action (Target ke editIngredient) */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      Estimasi HPP Batch
                    </span>
                    <span className="text-base font-mono font-black text-[#0F766E]">
                      Rp {Math.round(totalBatchCost).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyBatchCostToEdit}
                    className="bg-[#0F766E] hover:bg-[#0F766E]/90 text-white text-[10px] font-black px-3.5 py-2 rounded-xl uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>↙</span> Gunakan ke Harga Beli
                  </button>
                </div>
              </div>
            )}

            {/* Input Form Utama */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Nama Bahan Baku
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Milk, Beans"
                  value={editIngredient.name}
                  onChange={(e) =>
                    setEditIngredient({
                      ...editIngredient,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-semibold text-gray-800"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">
                    Harga Beli (Rp)
                  </label>
                  {isBatchMode && editIngredient.purchase_cost > 0 && (
                    <span className="text-[9px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-1.5 py-0.5 rounded">
                      Auto-calculated
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  placeholder="Ex: 15000"
                  value={
                    editIngredient.purchase_cost === 0
                      ? ""
                      : editIngredient.purchase_cost
                  }
                  onChange={(e) =>
                    setEditIngredient({
                      ...editIngredient,
                      purchase_cost: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Conversion Factor (gr/ml/pcs)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 1000/500/1200"
                  value={
                    editIngredient.conversion_factor === 0
                      ? ""
                      : editIngredient.conversion_factor
                  }
                  onChange={(e) =>
                    setEditIngredient({
                      ...editIngredient,
                      conversion_factor: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Unit
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: GRAM/ML/PCS"
                  value={editIngredient.unit}
                  onChange={(e) =>
                    setEditIngredient({
                      ...editIngredient,
                      unit: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 1000"
                  value={editIngredient.minimumStock}
                  onChange={(e) =>
                    setEditIngredient({
                      ...editIngredient,
                      minimumStock: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 mt-auto">
              <button
                type="button"
                onClick={() => setIsEditBahanBakuModalOpen(false)}
                className="col-span-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-xs uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="col-span-2 bg-[#EF5B2B] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#EF5B2B]/10 hover:bg-opacity-95 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isResetStockModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isResetting) setIsResetStockModalOpen(false);
            }}
          />

          <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] bg-red-50 text-red-600 font-black tracking-widest uppercase px-2.5 py-1 rounded-md border border-red-100">
                  Stock Adjustment
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-1.5">
                  Reset Stok Bahan Baku
                </h3>
              </div>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetStockModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
              <span className="text-base">⚠️</span>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-amber-900">
                  Perhatian Tindakan Reset
                </p>
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  Stok bahan baku yang dipilih akan langsung diubah menjadi
                  (0). Pastikan data sudah sesuai ya.
                </p>
              </div>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Cari nama bahan baku untuk di-reset..."
                value={resetSearchQuery}
                onChange={(e) => setResetSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                🔍
              </span>
            </div>

            {resetSearchQuery.trim() !== "" && (
              <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-2 max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                {(() => {
                  const filtered = (ingredientsData || []).filter(
                    (mat: Ingredient) =>
                      mat.name
                        .toLowerCase()
                        .includes(resetSearchQuery.toLowerCase()) &&
                      !selectedResetIds.includes(mat.id),
                  );

                  if (filtered.length === 0) {
                    return (
                      <p className="text-center text-[10px] text-gray-400 py-2 italic">
                        Tidak ada bahan baku yang cocok / sudah masuk daftar.
                      </p>
                    );
                  }

                  return (
                    <>
                      <div className="flex justify-between items-center px-2 py-1 border-b border-slate-200/60 mb-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Hasil Pencarian ({filtered.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectAllFiltered(filtered)}
                          className="text-[9px] font-bold text-[#0F766E] hover:underline"
                        >
                          + Pilih Semua Hasil
                        </button>
                      </div>
                      {filtered.map((mat: Ingredient) => (
                        <div
                          key={mat.id}
                          onClick={() => handleSelectForReset(mat.id)}
                          className="flex justify-between items-center p-2 rounded-lg bg-white border border-gray-100 hover:border-[#0F766E]/40 cursor-pointer transition-all active:scale-[0.99]"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-800">
                              {mat.name}
                            </p>
                            <p className="text-[9px] text-gray-400">
                              Stok saat ini: {mat.stock} {mat.unit}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-2 py-1 rounded-md">
                            + Tambah
                          </span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Dotted Divider */}
            <div className="border-b border-dashed border-gray-200 mb-3" />

            {/* Selected Items List Container */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Bahan Baku Terpilih ({selectedResetIds.length})
                </span>
                {selectedResetIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedResetIds([])}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Kosongkan Daftar
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {selectedResetIds.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                    <p className="text-xs font-bold text-gray-400">
                      Belum ada bahan dipilih
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Cari dan klik bahan baku di atas untuk dimasukkan ke
                      daftar reset.
                    </p>
                  </div>
                ) : (
                  selectedResetIds.map((id) => {
                    const mat = (ingredientsData || []).find(
                      (m: Ingredient) => m.id === id,
                    );
                    return (
                      <div
                        key={id}
                        className="flex justify-between items-center bg-red-50/50 border border-red-100 p-2.5 rounded-xl transition-all"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {mat?.name || "Bahan Baku"}
                          </p>
                          <p className="text-[9px] text-red-500 font-semibold">
                            Akan di-reset dari {mat?.stock} {mat?.unit} ➔ 0{" "}
                            {mat?.unit}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromReset(id)}
                          className="w-6 h-6 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100/80 flex items-center justify-center transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 mt-auto">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetStockModalOpen(false)}
                className="col-span-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting || selectedResetIds.length === 0}
                onClick={() => handleConfirmReset()}
                className="col-span-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.99] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  `Konfirmasi Reset (${selectedResetIds.length} Bahan)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ScrollToTop />
    </div>
  );
}
