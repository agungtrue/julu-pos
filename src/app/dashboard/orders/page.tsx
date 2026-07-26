"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import {
  LayoutGrid,
  Coffee,
  Leaf,
  Pizza,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { ProductItem, CartItem } from "./types/order.types";
import { Toaster, toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

// later ts strict

const CATEGORY_MAP = {
  all: { label: "Semua", icon: LayoutGrid },
  coffee: { label: "Kopi", icon: Coffee },
  non_coffee: { label: "Non-Kopi", icon: Leaf },
  snacks: { label: "Camilan", icon: Pizza },
};

export default function CreateOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderUuid, setOrderUuid] = useState(null);
  const [customerName, setCustomerName] = useState('Walk-in Customer');

  // ==========================================
  // ⚙️ INTERACTIVE LOGIC (STATE HANDLERS)
  // ==========================================

  // 1. Fungsi Tambah ke Keranjang Belanja
  const handleAddToCart = (product: ProductItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Jika barang sudah ada, naikkan qty dan update subtotalnya
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                subtotal: (item.qty + 1) * item.price,
              }
            : item,
        );
      }

      // Jika barang baru pertama kali diklik
      return [...prevCart, { ...product, qty: 1, subtotal: product.price }];
    });
  };

  // 2. Fungsi Mengubah Kuantitas Item di Keranjang ([+] atau [-])
  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      // Jika qty diset 0 atau minus, hapus item dari keranjang
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, qty: newQty, subtotal: newQty * item.price }
          : item,
      ),
    );
  };

  // later change into hooks
  // get product list
  const fetchProductData = async () => {
    const url = endpoints.products.get;

    const response = await api.get(url);
    return response?.data?.data || [];
  };

  const { data: productData, isLoading: isLoadingProductData } = useQuery({
    queryKey: ["productData"],
    queryFn: fetchProductData,
  });

  // 3. 💡 Finansial Calculator Otomatis menggunakan useMemo (Super Enteng)
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = 0; // Tempat naruh logic promo nanti
    const totalFinal = subtotal - discount;

    return { subtotal, discount, totalFinal };
  }, [cart]);

  // 4. Perenggangan Filter Data Katalog Produk
  const filteredProducts = useMemo(() => {
    return productData?.filter((product: ProductItem) => {
      const matchesCategory =
        selectedCategory === "all" || product.type === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, productData]);

  // 1. Tambahkan state baru ini di bagian atas komponen CreateOrderPage Anda
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashReceived, setCashReceived] = useState<string>(""); // Menggunakan string agar input text kosongnya natural

  // 2. 💡 Hitung Kembalian secara otomatis menggunakan useMemo
  const cashSummary = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    const change = received - totals.totalFinal;
    const isShortage = change < 0 && received > 0; // Kondisi jika uang kurang

    return {
      received,
      change: change > 0 ? change : 0,
      isShortage,
      shortageAmount: Math.abs(change),
    };
  }, [cashReceived, totals.totalFinal]);

  const queryClient = useQueryClient();

  //   init order
  const { mutate: postInitOrders } = useMutation({
    mutationFn: async (payloads: CartItem[]) => {
      const total = payloads.reduce(
        (acc, item) => acc + item.price * item.qty,
        0,
      );
      const payload = {
        total,
        payment_method: paymentMethod,
        customerName,
      };
      return await api.post(endpoints.orders.order.init, payload);
    },
    onSuccess: (res) => {
      const uuid = res?.data?.orderUuid;
      setOrderUuid(uuid);
      queryClient.invalidateQueries({ queryKey: ["orderSummaryData"] });
      queryClient.invalidateQueries({ queryKey: ["orderListData"] });
    },
  });

  const handleInitOrders = () => {
    postInitOrders(cart);
  };

  // confirm order
  const { mutate: postConfirmOrders } = useMutation({
    mutationFn: async (payloads: CartItem[]) => {
      const payload = {
        uuid: orderUuid,
        items: payloads.map((data) => {
          return {
            qty: data.qty,
            product_id: data.id,
          };
        }),
      };
      return await api.post(endpoints.orders.order.confirm, payload);
    },
    onSuccess: () => {
      toast.success("Transaksi Berhasil!", {
        description: "Pesanan telah disimpan, silahkan cek di sales page.",
        className:
          "bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl",
      });

      queryClient.invalidateQueries({ queryKey: ["orderListData"] });
      setOrderUuid(null);
      setCart([]);
      setCashReceived('')
      playSuccessSound();
    },
  });

  const handleConfirmOrders = () => {
    postConfirmOrders(cart);
  };

  const playSuccessSound = () => {
    const audio = new Audio("/sounds/kasir_sound.mp3");
    audio.volume = 1.0; // 0.0 to 1.0)

    audio.play().catch((error) => {
      console.warn("Audio playback on hold browser policy", error);
    });
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (isLoadingProductData) return <DashboardSkeleton />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 lg:h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* 🟢 SISI KIRI: KATALOG & FILTER (70%) */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <span className="absolute inset-y-0 left-8 flex items-center text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
          />
        </div>

        {/* Navigasi Kategori */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(CATEGORY_MAP).map(([key, item]) => {
            const Icon = item.icon;
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase rounded-xl border whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#0F766E] text-white border-[#0F766E] shadow-sm"
                    : "bg-white hover:bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Grid Canvas Utama Produk */}
        {/* flex-1 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6 scrollbar-thin
        flex-1 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 content-start gap-4 pb-6 scrollbar-thin */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 content-start gap-4 pb-6 scrollbar-thin">
          {filteredProducts?.map((product: ProductItem) => {
            const cartItem = cart.find((c) => c.id === product.id);

            const isSelected = cartItem ? cartItem.qty : 0;
            return (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className={
                    `bg-white p-5 rounded-2xl border
                     ${isSelected 
                        ? 'border-2 border-[#0A8F8A] bg-[#0A8F8A]/5 shadow-md scale-[1.01]' 
                        : 'border-gray-100 shadow-sm'
                        }
                     hover:border-[#0F766E] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-40 group`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {product.type.replace("_", " ")}
                    </span>
                    {product.size && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {product.size}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-[#0F766E] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-gray-800 font-mono tracking-tight">
                    {formatIDR(product.price)}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredProducts?.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <span className="text-3xl block mb-2"></span>
            <h4 className="text-sm font-bold text-gray-700">Menu tidak ditemukan</h4>
            <p className="text-xs text-gray-400 mt-1">Coba periksa kembali ejaan atau ganti filter kategori produk Anda.</p>
          </div>
        )}
        </div>
      </div>

      {/* 🔴 SISI KANAN: LIVE TICKET / BASKET (30%) */}
      <div className="lg:col-span-3 h-full border-l border-gray-200 bg-white flex flex-col justify-between overflow-hidden shadow-xl">
        {/* Header Summary */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-gray-800 text-base uppercase tracking-tight">
              Detail Pesanan
            </h2>
            <span className="px-2 py-1 bg-orange-50 text-[#EF5B2B] text-[10px] font-black rounded-lg">
              {cart.reduce((sum, item) => sum + item.qty, 0)} ITEMS
            </span>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-xs text-gray-400">
              👤
            </span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer (Guest)"
              className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#EF5B2B] transition-colors"
            />
          </div>
        </div>

        {/* 🛒 RENDER DYNAMIC LIST KERANJANG */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-300">
              <span className="text-4xl">🛒</span>
              <p className="text-xs font-medium text-gray-400">
                Keranjang belanja masih kosong
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <h4 className="font-bold text-gray-800 line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>Rp {item.price.toLocaleString("id-ID")}</span>
                      {item.size && (
                        <span className="uppercase font-extrabold text-[#0F766E]">
                          ({item.size})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kontroler Qty Mini */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-500 transition-colors"
                      >
                        {item.qty === 1 ? (
                          <Trash2 className="w-3 h-3 text-red-500" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>
                      <span className="px-2 font-bold text-gray-700 min-w-[20px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-500 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal Item */}
                    <span className="font-bold text-gray-800 text-right min-w-[65px]">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-700">
                Rp {totals.subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Promo / Diskon</span>
              <span className="font-semibold text-red-500">
                -Rp {totals.discount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-gray-800">
              <span className="font-bold text-sm">Total Akhir</span>
              <span className="font-black text-lg text-[#0F766E]">
                Rp {totals.totalFinal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`py-2.5 bg-white border-2 ${paymentMethod === "cash" ? "border-[#0F766E] text-[#0F766E]" : "bg-white border border-gray-200 text-gray-400"} font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm`}
              onClick={() => setPaymentMethod("cash")}
            >
              CASH
            </button>
            <button
              className={`py-2.5 bg-white border-2 ${paymentMethod === "qris" ? "border-[#0F766E] text-[#0F766E]" : "bg-white border border-gray-200 text-gray-400"} font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm`}
              onClick={() => setPaymentMethod("qris")}
            >
              QRIS
            </button>
          </div>

          {paymentMethod === "cash" && totals.totalFinal > 0 && (
            <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-3 shadow-inner">
              {/* Input Uang Diterima & Tombol Uang Pas */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-2.5 flex items-center text-xs font-bold text-gray-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="Uang diterima..."
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
                <button
                  onClick={() => setCashReceived(totals.totalFinal.toString())}
                  className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-extrabold text-[10px] rounded-lg border border-teal-200 transition-colors uppercase whitespace-nowrap"
                >
                  Uang Pas
                </button>
              </div>

              {/* Tombol Nominal Cepat (Denominasi Rupiah Umum) */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {[20000, 50000, 100000].map((nominal) => (
                  <button
                    key={nominal}
                    disabled={nominal < totals.totalFinal}
                    onClick={() => setCashReceived(nominal.toString())}
                    className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 border border-gray-200 text-gray-600 font-bold text-[10px] rounded-lg transition-colors whitespace-nowrap"
                  >
                    Rp {nominal.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              {/* Display Dinamis Uang Kembalian */}
              {cashSummary.received > 0 && (
                <div className="pt-2 border-t border-dashed border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">
                    {cashSummary.isShortage
                      ? "Uang Kurang:"
                      : "Uang Kembalian:"}
                  </span>
                  <span
                    className={`font-black text-sm ${
                      cashSummary.isShortage
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    Rp{" "}
                    {cashSummary.isShortage
                      ? cashSummary.shortageAmount.toLocaleString("id-ID")
                      : cashSummary.change.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleInitOrders}
              disabled={cart.length === 0 || !!orderUuid}
              className="w-full py-4 bg-[#EF5B2B] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#d64e22] disabled:bg-gray-300 disabled:shadow-none transition-all"
            >
              Init
            </button>
            <button
              onClick={handleConfirmOrders}
              disabled={!orderUuid}
              className="w-full py-4 bg-[#EF5B2B] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#d64e22] disabled:bg-gray-300 disabled:shadow-none transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
