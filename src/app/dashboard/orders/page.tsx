"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ScrollToTop from "@/components/ScrollToTop";
import {
  LayoutGrid,
  Coffee,
  Leaf,
  Pizza,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  Apple,
  Wrench,
  Box,
  CupSoda,
  Cookie,
  ReceiptText,
  Lightbulb,
} from "lucide-react";
import { ProductItem, CartItem } from "./types/order.types";
import { Toaster, toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useThermalPrint } from "@/hooks/useThermalPrint";

// later ts strict

const CATEGORY_MAP = {
  all: { label: "Semua", icon: LayoutGrid },
  coffee: { label: "Kopi", icon: Coffee },
  non_coffee: { label: "Non-Kopi", icon: CupSoda },
  snacks: { label: "Cemilan", icon: Cookie },
  topping: { label: "Topping", icon: Sparkles },
  retail: { label: "Retail", icon: ShoppingBag },
  grocery: { label: "Grocery / Sembako", icon: ShoppingCart },
  fresh_produce: { label: "Produk Segar", icon: Apple },
  service: { label: "Jasa & Layanan", icon: Wrench },
  other: { label: "Lainnya", icon: Box },
};

export default function CreateOrderPage() {
  const { printReceipt } = useThermalPrint();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderUuid, setOrderUuid] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [isPrintReceipt, setIsPrintReceipt] = useState(true);
  const [isPayLater, setIsPayLater] = useState(false);
  const [isPreConfirmLoading, setIsPreConfirmLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  // ==========================================
  // INTERACTIVE LOGIC (STATE HANDLERS)
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

  const [orderType, setOrderType] = useState<
    "DINE_IN" | "TAKEAWAY" | "DELIVERY"
  >("DINE_IN");

  const paidAmount =
    paymentMethod === "cash" ? Number(cashReceived) || 0 : totals.totalFinal;

  const changeAmount =
    paymentMethod === "cash"
      ? cashSummary.isShortage
        ? 0
        : cashSummary.change
      : 0;

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
        orderType: orderType,
        paidAmount: paidAmount,
        changeAmount: changeAmount,
        metadata: { items: payloads },
      };
      return await api.post(endpoints.orders.order.init, payload);
    },
    onSuccess: (res) => {
      const uuid = res?.data?.orderUuid;
      setOrderUuid(uuid);
      queryClient.invalidateQueries({ queryKey: ["orderSummaryData"] });
      queryClient.invalidateQueries({ queryKey: ["orderListData"] });
      setIsPreConfirmLoading(false);

      if (isPayLater) {
        toast.success("Transaksi tersimpan!", {
          description:
            "Pesanan telah disimpan, silahkan periksa kembali di Riwayat Transaksi.",
          className:
            "bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl",
        });
        resetAll()
      }
    },
  });

  const handleInitOrders = () => {
    setIsPreConfirmLoading(true);
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
    onSuccess: (res) => {
      toast.success("Transaksi Berhasil!", {
        description:
          "Pesanan telah disimpan, silahkan cek di Riwayat Transaksi.",
        className:
          "bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl",
      });

      queryClient.invalidateQueries({ queryKey: ["orderListData"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummaryData"] });
      queryClient.invalidateQueries({ queryKey: ["ingreMutation"] });
      queryClient.invalidateQueries({ queryKey: ["mutationSummaryData"] });
      setOrderUuid(null);
      setCart([]);
      setCashReceived("");
      playSuccessSound();
      setIsConfirmLoading(false);

      if (isPrintReceipt) {
        getPrintReceipt(res.data);
      }
    },
  });

  const resetAll = () => {
    setOrderUuid(null);
    setCart([]);
    setCashReceived("");
    setIsConfirmLoading(false);
    setIsPayLater(false);
  };

  const getPrintReceipt = (payload: any) => {
    const tenant = {
      name: payload.user.subscription.tenant.name,
      address: payload.user.subscription.tenant.address,
      phone: payload.user.subscription.tenant.phone,
    };

    const order = {
      id: payload.order.id,
      invoiceNo: payload.order.invoiceNo,
      address: payload.user.subscription.tenant.address,
      createdAt: payload.order.createdAt,
      user: {
        name: payload.user.name,
      },
      customerName: payload.order.customerName,
      orderType: payload.order.orderType,
      items: payload.order.items,
      subtotal: payload.order.total,
      discount: 0,
      totalAdjustedPrice: payload.order.total,
      payment_method: payload.order.payment_method.toUpperCase(),
      paidAmount: payload.order.paidAmount,
      changeAmount: payload.order.changeAmount,
      total: payload.order.total,
      receiptFooter: payload.user.subscription.tenant.receiptFooter,
    };

    const receiptData = {
      tenantName: tenant.name || "-",
      tenantAddress: tenant.address || "-",
      tenantPhone: tenant.phone || "-",
      invoiceNo: order.invoiceNo || order.id.slice(0, 8).toUpperCase(),
      createdAt: order.createdAt,
      cashierName: order.user?.name || "Kasir",
      customerName: order.customerName,
      orderType: order.orderType || "DINE_IN",
      items: order.items.map((item: any) => ({
        name: item.product?.name || "Item",
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
        note: item.note,
      })),
      subtotal: order.subtotal || order.total,
      discount: order.discount || 0,
      grandTotal: order.totalAdjustedPrice || order.total,
      paymentMethod: order.payment_method || "CASH",
      paidAmount: order.paidAmount || order.total,
      changeAmount: order.changeAmount || 0,
      footerNote: order.receiptFooter,
    };

    printReceipt(receiptData, "58mm");
  };

  const handleConfirmOrders = () => {
    postConfirmOrders(cart);
    setIsConfirmLoading(true);
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
                className={`bg-white p-5 rounded-2xl border
                     ${
                       isSelected
                         ? "border-2 border-[#0A8F8A] bg-[#0A8F8A]/5 shadow-md scale-[1.01]"
                         : "border-gray-100 shadow-sm"
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
              <h4 className="text-sm font-bold text-gray-700">
                Menu tidak ditemukan
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Coba periksa kembali ejaan atau ganti filter kategori produk
                Anda.
              </p>
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
              placeholder="Isi Nama Pelanggan jika diperlukan..."
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
                      <input
                        type="number"
                        min="1"
                        value={item.qty === 0 ? "" : item.qty}
                        onFocus={(e) => e.target.select()} // ⚡ Auto highlight angka saat diklik
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            return;
                          }
                          const parsed = parseInt(val, 10);
                          if (!isNaN(parsed) && parsed >= 0) {
                            handleUpdateQty(item.id, parsed);
                          }
                        }}
                        onBlur={() => {
                          // Fallback jika kasir meninggalkan input dalam keadaan kosong / <= 0
                          if (!item.qty || item.qty < 1) {
                            handleUpdateQty(item.id, 1);
                          }
                        }}
                        className="w-10 cursor-pointer text-center font-bold text-gray-800 text-xs focus:outline-none bg-transparent py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
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
          {/* 💡 1. PILIHAN TIPE PESANAN (DINE IN / TAKEAWAY) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Tipe Pesanan
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setOrderType("DINE_IN")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  orderType === "DINE_IN"
                    ? "bg-white text-gray-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span></span> Dine In
              </button>
              <button
                type="button"
                onClick={() => setOrderType("TAKEAWAY")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  orderType === "TAKEAWAY"
                    ? "bg-white text-gray-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span></span> Take Away
              </button>
            </div>
          </div>

          {/* 2. RINCIAN TOTAL HARGA */}
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

          {/* 3. PILIHAN METODE PEMBAYARAN */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`py-2.5 bg-white border-2 ${
                paymentMethod === "cash"
                  ? "border-[#0F766E] text-[#0F766E]"
                  : "bg-white border border-gray-200 text-gray-400"
              } font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer`}
              onClick={() => setPaymentMethod("cash")}
            >
              CASH
            </button>
            <button
              className={`py-2.5 bg-white border-2 ${
                paymentMethod === "qris"
                  ? "border-[#0F766E] text-[#0F766E]"
                  : "bg-white border border-gray-200 text-gray-400"
              } font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer`}
              onClick={() => setPaymentMethod("qris")}
            >
              QRIS
            </button>
          </div>

          {/* 4. INPUT METODE CASH */}
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
                  type="button"
                  onClick={() => setCashReceived(totals.totalFinal.toString())}
                  className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-extrabold text-[10px] rounded-lg border border-teal-200 transition-colors uppercase whitespace-nowrap cursor-pointer"
                >
                  Uang Pas
                </button>
              </div>

              {/* Tombol Nominal Cepat */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {[20000, 50000, 100000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    disabled={nominal < totals.totalFinal}
                    onClick={() => setCashReceived(nominal.toString())}
                    className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 border border-gray-200 text-gray-600 font-bold text-[10px] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Rp {nominal.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              {/* Display Uang Kembalian */}
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

          {/* 5. TOGGLE CETAK STRUK OTOMATIS */}
          <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#0F766E]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 000-4H9a2 2 0 000 4zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h14z"
                />
              </svg>
              <span className="text-xs font-bold text-gray-700">
                Cetak Struk
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isPrintReceipt}
              onClick={() => setIsPrintReceipt(!isPrintReceipt)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPrintReceipt ? "bg-[#0F766E]" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isPrintReceipt ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <ReceiptText size={16} />
              <span className="text-xs font-bold text-gray-700">
                Bayar Nanti?
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isPayLater}
              onClick={() => setIsPayLater(!isPayLater)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPayLater ? "bg-[#0F766E]" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isPayLater ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isPayLater && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-start gap-2 animate-scale-up">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-amber-800 font-medium leading-tight">
                <strong className="font-extrabold text-amber-900">
                  Tips Kasir:
                </strong>{" "}
                Isi nama pelanggan, biar gampang cari kalau dia bayar nanti.
              </p>
            </div>
          )}

          {/* 6. ACTION BUTTONS (INIT & CONFIRM) */}
          {isPayLater ? (
            <div className="w-full">
              <button
                onClick={handleInitOrders}
                disabled={
                  cart.length === 0 || !!orderUuid || isPreConfirmLoading
                }
                className="w-full py-4 bg-[#EF5B2B] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#d64e22] disabled:bg-gray-300 disabled:shadow-none transition-all cursor-pointer flex items-center justify-center"
              >
                {isPreConfirmLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Simpan Pesanan"
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleInitOrders}
                disabled={
                  cart.length === 0 || !!orderUuid || isPreConfirmLoading
                }
                className="w-full py-4 bg-[#EF5B2B] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#d64e22] disabled:bg-gray-300 disabled:shadow-none transition-all cursor-pointer flex items-center justify-center"
              >
                {isPreConfirmLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Terima Pesanan"
                )}
              </button>

              <button
                onClick={() => handleConfirmOrders()}
                disabled={
                  !orderUuid ||
                  (paymentMethod === "cash" && cashSummary.isShortage)
                }
                className="w-full py-4 bg-[#EF5B2B] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#d64e22] disabled:bg-gray-300 disabled:shadow-none transition-all cursor-pointer flex items-center justify-center"
              >
                {isConfirmLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Konfirmasi"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <Toaster />
      <ScrollToTop />
    </div>
  );
}
