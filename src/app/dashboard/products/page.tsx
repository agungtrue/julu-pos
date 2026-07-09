'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { endpoints } from "../../../config/enpoints";
import api from "../../../lib/api";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Globe, Coffee, CupSoda, Cookie, Plus, Edit, Search } from 'lucide-react';
interface Product {
  id: string;
  name: string;
  price: number;
  type: 'coffee' | 'non_coffee' | 'snacks';
  size: string;
  cogs: number;
  isActive: boolean;
  productIngredients: []
}

interface ProductItem {
  sub_total_cost: number
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'non_coffee' | 'snacks'>('all');
  const [newProduct, setNewProduct] = useState<{
      name: string;
      price: number;
      type: string;
      size: string;
      cogs: number;
      isActive: true;
    }>({
    name: "",
    price: 0,
    type: "",
    size: "",
    cogs: 0,
    isActive: true,
  });

  const [editProduct, setEditProduct] = useState<Product>({
    id: "",
    name: "",
    price: 0,
    type: "coffee",
    size: "",
    cogs: 0,
    isActive: true,
    productIngredients: []
  });

  // get product
  const fetchProductData = async () => {
    const url = endpoints.products.getWithIngredients;

    const response = await api.get(url);
    return response?.data?.data
  };

  const { data: productData, isLoading: isLoadingProductData } = useQuery({
    queryKey: ['productData'],
    queryFn: fetchProductData,
  });

  const products = productData ?? []

  const calculateMargin = (price: number, hpp: number) => {
    const profit = price - hpp;
    return ((profit / price) * 100).toFixed(1);
  };

  const calculateCogs = (product: Product) => {
    const cogs = product?.productIngredients?.reduce(
      (acc, item: ProductItem) => acc + item.sub_total_cost,
      0,
    );

    return cogs
  }

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Logika Pemfilteran Data Produk Dinamis
  const filteredProducts = products?.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const queryClient = useQueryClient();

  interface SaveNewProduct {
    name: string;
    price: number;
    type: string;
    size: string;
    cogs: number,
    isActive: boolean,
  }

  interface EditProduct {
    id: string;
    name: string;
    price: number;
    type: string;
    size: string;
    cogs: number,
    isActive: boolean,
  }

  const { mutate: postNewProduct, isPending } = useMutation({
    mutationFn: async (payload: SaveNewProduct) => {
      return await api.post(endpoints.products.post, payload);
    },
    onSuccess: () => {
      setIsAddProductModalOpen(false)
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ['productData'] });
    },
  });

  const { mutate: patchEditProduct } = useMutation({
    mutationFn: async (payload: EditProduct) => {
      return await api.patch(endpoints.products.patch(payload.id), payload);
    },
    onSuccess: () => {
      setIsEditProductModalOpen(false)
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ['productData'] });
    },
  });

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    postNewProduct({
      name: newProduct.name,
      price: newProduct.price,
      type: newProduct.type,
      size: newProduct.size,
      cogs: 0,
      isActive: true,
    });
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    patchEditProduct({
      id: editProduct.id,
      name: editProduct.name,
      price: editProduct.price,
      type: editProduct.type,
      size: editProduct.size,
      cogs: editProduct.cogs,
      isActive: editProduct.isActive,
    });
  };

  const CATEGORY_MAP = {
    all: { label: 'Semua', icon: Globe },
    coffee: { label: 'Kopi', icon: Coffee },
    non_coffee: { label: 'Non-Kopi', icon: CupSoda }, // Pengganti es krim/sirup
    snacks: { label: 'Cemilan', icon: Cookie },       // Pengganti kentang goreng
  } as const

  if (isLoadingProductData) return <DashboardSkeleton/>
    

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ☕ PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Daftar Menu & Produk</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
            Kelola katalog harga jual, estimasi HPP, dan status ketersediaan booth
          </p>
        </div>
        <button className="w-full sm:w-auto bg-[#0F766E] text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md shadow-[#0F766E]/10 hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          onClick={() => setIsAddProductModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Baru
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-4 h-4"/>
          </span>
          <input
            type="text"
            placeholder="Cari nama menu julu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none font-medium">
          {(['all', 'coffee', 'non_coffee', 'snacks'] as const).map((cat) => {
            const item = CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP];
            const Icon = item.icon;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-xl border whitespace-nowrap transition-all
                  ${selectedCategory === cat 
                    ? 'bg-[#EF5B2B] text-white shadow-sm' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: Product) => {
          const marginPercentage = calculateMargin(product.price, calculateCogs(product));
          
          return (
            <div 
              key={product.id} 
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  product.type === 'coffee' ? 'bg-[#0F766E]/10 text-[#0F766E]' : product.type === 'non_coffee' ? 'bg-amber-500/10 text-amber-600' : 'bg-[#EF5B2B]/10 text-[#EF5B2B]'
                }`}>
                  {product.type}
                </span>
                
                {/* <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.stockStatus === 'TERSEDIA' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                  ● {product.stockStatus}
                </span> */}
              </div>

              <div className="space-y-1 mb-5">
                <h3 className="font-bold text-base text-gray-800 tracking-tight group-hover:text-[#0F766E] transition-colors">
                  {product.name} {product.size}
                </h3>
                <div className="text-xs text-gray-400 font-medium font-mono">
                  {/* Terjual Periode Ini: <span className="text-gray-700 font-bold">{product.salesCount} porsi</span> */}
                </div>
              </div>

              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 space-y-2 mb-4 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-400">Harga Jual:</span>
                  <span className="text-gray-800 font-bold font-mono">{formatIDR(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimasi HPP:</span>
                  <span className="text-gray-500 font-semibold font-mono">{formatIDR(calculateCogs(product))}</span>
                  {/* 0 */}
                </div>
                <div className="flex justify-between pt-1.5 border-t border-gray-200/50 text-[11px]">
                  <span className="text-gray-400">Margin Keuntungan:</span>
                  <span className="text-green-600 font-extrabold font-mono bg-green-50 px-1.5 py-0.5 rounded">
                    +{marginPercentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="flex flex-1 gap-2 justify-center items-center border border-gray-200 text-gray-600 font-bold py-2 px-3 rounded-xl text-xs hover:bg-gray-50 active:scale-[0.98] transition-all"
                  onClick={() => {
                    setIsEditProductModalOpen(true)
                    setEditProduct({ ...editProduct, ...product })
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Menu
                </button>
                {/* <button className="bg-gray-50 hover:bg-amber-500/10 text-gray-500 hover:text-amber-600 font-bold py-2 px-3 rounded-xl text-xs active:scale-[0.98] transition-all">
                  📦 Set Stok
                </button> */}
              </div>

            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <span className="text-3xl block mb-2">☕</span>
            <h4 className="text-sm font-bold text-gray-700">Menu tidak ditemukan</h4>
            <p className="text-xs text-gray-400 mt-1">Coba periksa kembali ejaan atau ganti filter kategori produk Anda.</p>
          </div>
        )}
      </div>

      {isAddProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isSaving) setIsAddProductModalOpen(false);
            }}
          />

          <form
            onSubmit={handleSaveNewProduct}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] border border-gray-100"
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Produk Baru
                </span>
                <h3 className="font-black text-gray-800 text-lg tracking-tight mt-2">
                  Informasi Produk
                </h3>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsAddProductModalOpen(false)}
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
                  placeholder="Ex: Latte"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
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
                    newProduct.price === 0 ? "" : newProduct.price
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Type
                </label>
                <select
                  onChange={(e) => {
                    e.preventDefault()
                    setNewProduct({
                      ...newProduct,
                      type: e.target.value,
                    })
                  }}
                  defaultValue=""
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="" disabled>── Pilih Jenis Produk ──</option>
                  {['coffee', 'non_coffee', 'snacks']
                    .map((master) => (
                      <option key={master} value={master}>
                        {master}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Size
                </label>
                <select
                  onChange={(e) => {
                    e.preventDefault()
                    setNewProduct({
                      ...newProduct,
                      size: e.target.value,
                    })
                  }}
                  defaultValue=""
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="" disabled>── Pilih Jenis Ukuran ──</option>
                  {['small', 'regular', 'large']
                    .map((master) => (
                      <option key={master} value={master}>
                        {master}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
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

      {isEditProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              if (!isSaving) setIsEditProductModalOpen(false);
            }}
          />

          <form
            onSubmit={handleEditProduct}
            className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] border border-gray-100"
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] font-black tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Informasi Produk
                </span>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsEditProductModalOpen(false)}
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
                  placeholder="Ex: Latte"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
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
                    editProduct.price === 0 ? "" : editProduct.price
                  }
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] font-mono font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Type
                </label>
                <select
                  onChange={(e) => {
                    e.preventDefault()
                    setEditProduct({
                      ...editProduct,
                      type: e.target.value as Product['type'],
                    })
                  }}
                  defaultValue={editProduct.type}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="" disabled>── Pilih Jenis Produk ──</option>
                  {['coffee', 'non_coffee', 'snacks']
                    .map((master) => (
                      <option key={master} value={master}>
                        {master}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  Size
                </label>
                <select
                  onChange={(e) => {
                    e.preventDefault()
                    setEditProduct({
                      ...editProduct,
                      size: e.target.value,
                    })
                  }}
                  defaultValue={editProduct.size}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="" disabled>── Pilih Jenis Ukuran ──</option>
                  {['small', 'regular', 'large']
                    .map((master) => (
                      <option key={master} value={master}>
                        {master}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditProductModalOpen(false)}
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