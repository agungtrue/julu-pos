"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";

interface Ingredient {
  id: string;
  name: string;
  conversion_factor: number;
  purchase_cost: number;
  // purchaseSize: number;
  unit: "gram" | "ml" | "pcs";
  cost_per_unit: number;
}

interface RecipeIngredient {
  id: string;
  // ingredientName: string;
  ingredient_id: string;
  ingredient: Ingredient[]
  qty_used: number;
  unit: string;
  sub_total_cost: number;
}

interface RecipeItem {
  id: number;
  name: string;
  price: number;
  purchaseCost: number;
  ingredientsBreakdown: RecipeIngredient[];
}

export default function HppSystemPage() {
  const [activeTab, setActiveTab] = useState<"ingredients" | "recipes">(
    "recipes",
  ); // Default ke resep agar langsung uji coba edit
  // STATE BARU UNTUK RACIK RESEP
  const [newRecipe, setNewRecipe] = useState<{
    menuName: string;
    purchaseCost: number;
    conversionFactor: number;
    unit: string;
    ingredientsBreakdown: RecipeIngredient[];
  }>({
    menuName: "",
    purchaseCost: 0,
    conversionFactor: 0,
    unit: "",
    ingredientsBreakdown: [],
  });

  const queryClient = useQueryClient();

  // get ingredients
  const fetchIngredientsData = async () => {
    const url = endpoints.ingredients.get;

    const response = await api.get(url);
    // return response.data;
    return response?.data?.data?.[0];
  };

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['ingredientsData'],
    queryFn: fetchIngredientsData,
  });

  console.log({ isLoadingIngredients, ingredientsData })


  // post ingredients
  const { mutate: handleSaveIngredients, isPending } = useMutation({
    mutationFn: async (payload) => {
      return await api.post(endpoints.ingredients.post, payload);
    },
    onSuccess: () => {
      setIsAddBahanBakuModalOpen(false)
      // 🔴 Kunci otomatisasi: samakan queryKey ini dengan queryKey yang ada di list data Anda
      queryClient.invalidateQueries({ queryKey: ['ingredientsData'] });

      // Opsional: reset form, tutup modal, atau kasih toast/notifikasi sukses
    },
  });

  const ingredients = ingredientsData

  // 1. State Bahan Baku Grosir Julu Coffee
  // const [ingredients] = useState<Ingredient[]>([
  //   {
  //     id: "b1",
  //     name: "Biji Kopi ELO Blend (KG)",
  //     purchasePrice: 150000,
  //     purchaseSize: 1000,
  //     unit: "gram",
  //     costPerUnit: 150,
  //   },
  //   {
  //     id: "b2",
  //     name: "Susu Pasteurization Premium (L)",
  //     purchasePrice: 19000,
  //     purchaseSize: 1000,
  //     unit: "ml",
  //     costPerUnit: 19,
  //   },
  //   {
  //     id: "b3",
  //     name: "Sirup Gula Aren Cair (L)",
  //     purchasePrice: 25000,
  //     purchaseSize: 1000,
  //     unit: "ml",
  //     costPerUnit: 25,
  //   },
  //   {
  //     id: "b4",
  //     name: "Cup Julu 16oz + Lid",
  //     purchasePrice: 800,
  //     purchaseSize: 1,
  //     unit: "pcs",
  //     costPerUnit: 800,
  //   },
  //   {
  //     id: "b5",
  //     name: "Ice Cream Vanilla Bucket",
  //     purchasePrice: 35000,
  //     purchaseSize: 700,
  //     unit: "gram",
  //     costPerUnit: 50,
  //   },
  // ]);


  // get recipe
  // const fetchRecipesData = async () => {
  //   const url = endpoints.ingredients.recipe.get;

  //   const response = await api.get(url);
  //   // return response.data;
  //   return response?.data?.data?.[0];
  // };

  // const { data: recipesData, isLoading: isLoadingRecipes } = useQuery({
  //   queryKey: ['recipesData'],
  //   queryFn: fetchRecipesData,
  // });


  // get products
  const fetchProductsData = async () => {
    const url = endpoints.products.getWithIngredients;

    const response = await api.get(url);
    return response?.data?.data;
  };

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['productsData'],
    queryFn: fetchProductsData,
  });


  const recipes = productsData?.map(data => {
    const map = {
      ...data,
      ingredientsBreakdown: data.productIngredients ?? []
    }
    return map
  })

  console.log({ recipes })

  // post ingredients recipe
  const { mutate: handleSaveRecipe } = useMutation({
    mutationFn: async (payload) => {
      console.log({ handleSaveRecipe_payload: payload })
      return await api.post(endpoints.ingredients.recipe.post, payload);
    },
    onSuccess: () => {
      // setIsAddBahanBakuModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['productsData'] });

      // Tutup modal dengan sukses
      setIsModalOpen(false);
      setEditingRecipe(null);
      setIsSaving(false);
    },
  });

  // 2. State Master Resep yang bisa dimutasi secara lokal setelah hit API sukses
  // const recipes = recipesData
  // const [recipes, setRecipes] = useState<RecipeItem[]>([
  //   {
  //     id: "r1",
  //     menuName: "Palm Sugar Latte Iced regular",
  //     purchaseCost: 18000,
  //     sellingPrice: 0,
  //     ingredientsBreakdown: [
  //       {
  //         ingredientId: "b1",
  //         ingredientName: "Biji Kopi ELO Blend (KG)",
  //         qtyUsed: 15,
  //         unit: "gram",
  //         subTotalCost: 2250,
  //       },
  //       {
  //         ingredientId: "b2",
  //         ingredientName: "Susu Pasteurization Premium (L)",
  //         qtyUsed: 120,
  //         unit: "ml",
  //         subTotalCost: 2280,
  //       },
  //       {
  //         ingredientId: "b3",
  //         ingredientName: "Sirup Gula Aren Cair (L)",
  //         qtyUsed: 30,
  //         unit: "ml",
  //         subTotalCost: 750,
  //       },
  //       {
  //         ingredientId: "b4",
  //         ingredientName: "Cup Julu 16oz + Lid",
  //         qtyUsed: 1,
  //         unit: "pcs",
  //         subTotalCost: 800,
  //       },
  //     ],
  //   },
  //   {
  //     id: "r2",
  //     menuName: "Ice Cream Based regular",
  //     purchaseCost: 15000,
  //     sellingPrice: 0,
  //     ingredientsBreakdown: [
  //       {
  //         ingredientId: "b5",
  //         ingredientName: "Ice Cream Vanilla Bucket",
  //         qtyUsed: 80,
  //         unit: "gram",
  //         subTotalCost: 4000,
  //       },
  //       {
  //         ingredientId: "b2",
  //         ingredientName: "Susu Pasteurization Premium (L)",
  //         qtyUsed: 20,
  //         unit: "ml",
  //         subTotalCost: 380,
  //       },
  //       {
  //         ingredientId: "b4",
  //         ingredientName: "Cup Julu 16oz + Lid",
  //         qtyUsed: 1,
  //         unit: "pcs",
  //         subTotalCost: 800,
  //       },
  //     ],
  //   },
  // ]);

  // STATE MANAGEMENT UNTUK FORM EDIT FORMULA RESEP
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddBahanBakuModalOpen, setIsAddBahanBakuModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNewIngredientId, setSelectedNewIngredientId] = useState('');

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
    console.log({ handleOpenEditModalrecipe: recipe })
    setEditingRecipe(JSON.parse(JSON.stringify(recipe)));
    setIsModalOpen(true);
  };

  // Fungsi LIVE RECALCULATION: Berjalan setiap kali isi input takaran diubah di modal
  const handleQtyChange = (ingredientId: string, newQty: number) => {
    if (!editingRecipe) return;

    const targetIngredient = ingredients.find((i) => i.id === ingredientId);
    const costPerUnit = targetIngredient ? targetIngredient.cost_per_unit : 0;
    console.log({ targetIngredient, costPerUnit, newQty })


    const updatedBreakdown = editingRecipe?.ingredientsBreakdown.map((item) => {
      if (item.ingredient?.id === ingredientId) {
        const qty = Math.max(0, newQty);
        return {
          ...item,
          qty_used: qty,
          sub_total_cost: qty * costPerUnit,
        };
      }
      return item;
    });

    console.log({ updatedBreakdown })

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

    console.log({ editingRecipe })

    handleSaveRecipe({
      product_id: editingRecipe.id,
      ingredients: editingRecipe.ingredientsBreakdown.map(data => {
        return { ingredient_id: data.ingredient_id, qty_used: data.qty_used }
      })
    })
  };

  function createRandomStringId(prefix: string = 'temp'): string {
    const randomStr = Math.random().toString(36).substring(2, 9);
    const timestampStr = Date.now().toString(36);
    
    return `${prefix}-${randomStr}-${timestampStr}`;
  }

  const handleAddIngredient = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingRecipe) return;

      console.log({selectedNewIngredientId})

      const targetMaster = ingredientsData.find((m) => m.id === selectedNewIngredientId);
      console.log({ targetMaster, editingRecipe })
      if (!targetMaster) return;

      const newIngredientRow = {
        id: createRandomStringId('ing'),
        ingredient_id: targetMaster.id,
        ingredient: targetMaster,
        product_id: editingRecipe?.id,
        qty_used: 0,
        unit: targetMaster.unit || "GRAM",
        sub_total_cost: 0,
      };

      setEditingRecipe({
        ...editingRecipe,
        ingredientsBreakdown: [...editingRecipe.ingredientsBreakdown, newIngredientRow],
      });

      setSelectedNewIngredientId('')
    }


  const handleOpenAddBahanBakuModalOpen = () => {
    setIsAddBahanBakuModalOpen(true);
  };

  // Simpan Resep Baru (Hit POST API Simulation)
  const handleSaveNewRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // console.log({ newRecipe });

    // RENAME newRecipe as ingredients
    handleSaveIngredients({
      name: newRecipe.menuName,
      purchase_cost: newRecipe.purchaseCost,
      conversion_factor: newRecipe.conversionFactor,
      unit: newRecipe.unit
    });
  };

  if (isLoadingProducts || isLoadingIngredients) return <DashboardSkeleton/>

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* 📊 HEADER SYSTEM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Sistem HPP & COGS
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
            Breakdown biaya granular bahan baku hingga kalkulasi otomatis resep
            menu produk
          </p>
        </div>
      </div>

      {/* 🧭 NAVIGATION TAB CONTROLLER */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full max-w-md font-medium">
        <button
          onClick={() => setActiveTab("ingredients")}
          className={`flex-1 py-3 text-center rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === "ingredients"
              ? "bg-[#0F766E] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📦 1. Bahan Baku ({ingredients.length})
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex-1 py-3 text-center rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
            activeTab === "recipes"
              ? "bg-[#0F766E] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🧪 2. Formula Resep ({recipes.length})
        </button>
      </div>

      {/* TAB 1: LIST BAHAN BAKU */}
      {activeTab === "ingredients" && (
        <>
          <button
            onClick={handleOpenAddBahanBakuModalOpen}
            className="text-xs font-black text-[#EF5B2B] bg-[#EF5B2B]/5 px-3 py-1.5 rounded-xl hover:bg-[#EF5B2B]/10 transition-colors"
          >
            ➕ Bahan Baku Baru
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm"
              >
                <h4 className="font-bold text-gray-800 tracking-tight text-sm mb-3">
                  {ing.name}
                </h4>
                <div className="space-y-2 text-xs font-medium text-gray-500">
                  <div className="flex justify-between">
                    <span>Harga Grosir:</span>
                    <span className="text-gray-800 font-bold">
                      {formatIDR(ing.purchase_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="text-gray-700 font-semibold">
                      {ing.conversion_factor} {ing.unit}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Cost Per {ing.unit}:
                    {/* Cost Per gram/ml/pcs */}
                  </span>
                  <span className="text-sm font-black text-[#EF5B2B] font-mono bg-[#EF5B2B]/5 px-2.5 py-1 rounded-xl">
                    {formatIDR(ing.cost_per_unit)}
                  </span>
                </div>
              </div>
            ))}
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
          <div className="space-y-6">
            {recipes.map((recipe) => {
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
                        {recipe.name}
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
                        className="bg-gray-50 hover:bg-[#0F766E] text-gray-600 hover:text-white font-bold p-2.5 rounded-xl text-xs transition-colors border border-gray-100 active:scale-95"
                        title="Adjust Takaran Resep"
                      >
                        ✏️ Adjust Formula
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
                          {item.qtyUsed} {item.ingredient?.unit}{" "}
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
                  {editingRecipe.name}
                </h3>
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

            {/* ➕ 🔴 SEKSI TOMBOL & DROPDOWN TAMBAH BAHAN BAKU BARU */}
            <div className="mt-1 pt-2">
              <div className="flex flex-col gap-2 bg-gray-50/40 border border-dashed border-gray-200 p-4 rounded-2xl">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Tambah Komponen Bahan Baku
                </label>
                
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      e.preventDefault()
                      setSelectedNewIngredientId(e.target.value)
                    }}
                    defaultValue=""
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="" disabled>── Pilih Bahan Baku ──</option>
                    
                    {/* Filter: Hanya tampilkan bahan yang BELUM dimasukkan ke resep */}
                    {ingredientsData
                      ?.filter(master => !editingRecipe?.ingredientsBreakdown.some(item => item.ingredient_id === master.id))
                      .map((master) => (
                        <option key={master.id} value={master.id}>
                          {master.name} ({master.unit})
                        </option>
                      ))
                    }
                  </select>

                 

                  {!selectedNewIngredientId ? (
                      ''
                    ) : (
                      <div className="flex items-center justify-center bg-teal-50 text-[#0F766E] rounded-xl px-4 text-xs font-black uppercase tracking-wider cursor-pointer"
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
                      {item.ingredient?.name || ''}
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
                      type="number"
                      step="any"
                      required
                      disabled={isSaving}
                      value={item.qty_used === 0 ? "" : item.qty_used}
                      onChange={(e) =>
                        handleQtyChange(
                          item.ingredient.id,
                          Number(e.target.value),
                        )
                      }
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
                  "💾 Simpan & Update COGS"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📱 INTERACTIVE SLIDE-UP MODAL: RACIK RESEP BARU */}
      {/* {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isSaving) setIsAddModalOpen(false);
            }}
          />

          <form
            onSubmit={handleSaveNewRecipe}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] border border-gray-100"
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Menu Baru
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-2">
                  Formulasi Formula Resep
                </h3>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ice Aren Latte Large"
                  value={newRecipe.menuName}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, menuName: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 15000"
                  value={
                    newRecipe.sellingPrice === 0 ? "" : newRecipe.sellingPrice
                  }
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      sellingPrice: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 my-2 max-h-[40vh]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Masukkan Takaran Komposisi:
              </label>
              {newRecipe.ingredientsBreakdown.map((item) => (
                <div
                  key={item.ingredientId}
                  className="bg-gray-50/70 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-gray-700">
                      {item.ingredientName}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Cost:{" "}
                      <span className="text-gray-700 font-bold">
                        {formatIDR(item.subTotalCost)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={item.qtyUsed === 0 ? "" : item.qtyUsed}
                      onChange={(e) =>
                        handleNewRecipeQtyChange(
                          item.ingredientId,
                          Number(e.target.value),
                        )
                      }
                      className="w-20 text-center bg-white border border-gray-200 rounded-xl py-1.5 px-2 font-mono font-bold text-xs focus:outline-none focus:border-[#0F766E]"
                    />
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-8 font-mono">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0F766E] text-white rounded-2xl p-4 my-4 flex justify-between items-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-white/70 block font-sans font-bold">
                  LIVE TOTAL HPP:
                </span>
                <span className="text-base font-black">
                  {formatIDR(getRecipeTotalHpp(newRecipe.ingredientsBreakdown))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/70 block font-sans font-bold">
                  ESTIMASI MARGIN:
                </span>
                <span className="text-sm font-black text-amber-300">
                  {newRecipe.sellingPrice > 0
                    ? `+${(((newRecipe.sellingPrice - getRecipeTotalHpp(newRecipe.ingredientsBreakdown)) / newRecipe.sellingPrice) * 100).toFixed(1)}%`
                    : "0.0%"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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
                  "🚀 Rilis Menu Baru"
                )}
              </button>
            </div>
          </form>
        </div>
      )} */}

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
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] border border-gray-100"
          >
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Bahan Baku Baru
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-2">
                  Bahan Baku
                </h3>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsAddBahanBakuModalOpen(false)}
                className="text-gray-400 font-mono text-lg"
              >
                ✕
              </button>
            </div>

            {/* Input Nama Menu & Harga Jual Kasir */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Nama Bahan Baku
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Milk, Beans"
                  value={newRecipe.menuName}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, menuName: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Harga Beli (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 15000"
                  value={
                    newRecipe.purchaseCost === 0 ? "" : newRecipe.purchaseCost
                  }
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      purchaseCost: Number(e.target.value),
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
                    newRecipe.conversionFactor === 0
                      ? ""
                      : newRecipe.conversionFactor
                  }
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      conversionFactor: Number(e.target.value),
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
                  value={newRecipe.unit}
                  onChange={(e) =>
                    setNewRecipe({
                      ...newRecipe,
                      unit: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddBahanBakuModalOpen(false)}
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
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
