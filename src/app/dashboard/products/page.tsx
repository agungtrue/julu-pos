'use client';

import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: 'coffee' | 'non-coffee' | 'snack';
  price: number;
  hpp: number; // Harga Pokok Penjualan / COGS
  stockStatus: 'TERSEDIA' | 'HABIS';
  salesCount: number; // Data performa rilis kemarin
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'coffee' | 'non-coffee' | 'snack'>('all');

  // Master Data Menu Riil Julu Coffee & Snacks
  const [products] = useState<Product[]>(
    [
      { id: '1', name: 'Ice Cream Based regular', category: 'non-coffee', price: 15000, hpp: 5200, stockStatus: 'TERSEDIA', salesCount: 75 },
      { id: '2', name: 'French Fries regular', category: 'snack', price: 14000, hpp: 4800, stockStatus: 'TERSEDIA', salesCount: 68 },
      { id: '3', name: 'Palm Sugar Latte Iced regular', category: 'coffee', price: 18000, hpp: 6100, stockStatus: 'TERSEDIA', salesCount: 52 },
      { id: '4', name: 'Americano Iced regular', category: 'coffee', price: 13000, hpp: 3900, stockStatus: 'TERSEDIA', salesCount: 43 },
      { id: '5', name: 'Dimsum regular', category: 'snack', price: 15000, hpp: 5800, stockStatus: 'TERSEDIA', salesCount: 41 },
      { id: '6', name: 'Lemon Tea Iced regular', category: 'non-coffee', price: 12000, hpp: 3500, stockStatus: 'TERSEDIA', salesCount: 32 },
      { id: '7', name: 'Matcha Green Tea Latte', category: 'non-coffee', price: 18000, hpp: 6900, stockStatus: 'HABIS', salesCount: 29 },
    ]
  );

  // Fungsi kalkulator persentase margin kotor per item
  const calculateMargin = (price: number, hpp: number) => {
    const profit = price - hpp;
    return ((profit / price) * 100).toFixed(1);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Logika Pemfilteran Data Produk Dinamis
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        {/* Tombol Aksi Tambah Produk */}
        <button className="w-full sm:w-auto bg-[#0F766E] text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md shadow-[#0F766E]/10 hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
          ✨ Tambah Produk Baru
        </button>
      </div>

      {/* 🔍 SEARCH AND FILTER BAR CONTROLLER */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Input Pencarian */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari nama menu julu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
          />
        </div>
        
        {/* Tabs Filter Kategori */}
        <div className="flex gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none font-medium">
          {(['all', 'coffee', 'non-coffee', 'snack'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all whitespace-nowrap
                ${selectedCategory === cat 
                  ? 'bg-[#EF5B2B] text-white shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                }
              `}
            >
              {cat === 'all' ? '🌐 Semua' : cat === 'coffee' ? '☕ Kopi' : cat === 'non-coffee' ? '🍦 Non-Kopi' : '🍟 Cemilan'}
            </button>
          ))}
        </div>
      </div>

      {/* 📦 PRODUCTS CARD GRID SYSTEM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const marginPercentage = calculateMargin(product.price, product.hpp);
          
          return (
            <div 
              key={product.id} 
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              {/* Badge Kategori & Status Stok */}
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  product.category === 'coffee' ? 'bg-[#0F766E]/10 text-[#0F766E]' : product.category === 'non-coffee' ? 'bg-amber-500/10 text-amber-600' : 'bg-[#EF5B2B]/10 text-[#EF5B2B]'
                }`}>
                  {product.category}
                </span>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.stockStatus === 'TERSEDIA' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                  ● {product.stockStatus}
                </span>
              </div>

              {/* Detail Identitas Menu */}
              <div className="space-y-1 mb-5">
                <h3 className="font-bold text-base text-gray-800 tracking-tight group-hover:text-[#0F766E] transition-colors">
                  {product.name}
                </h3>
                <div className="text-xs text-gray-400 font-medium font-mono">
                  Terjual Periode Ini: <span className="text-gray-700 font-bold">{product.salesCount} porsi</span>
                </div>
              </div>

              {/* Panel Finansial Mikro (HPP & Profit Margin View) */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 space-y-2 mb-4 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-400">Harga Jual:</span>
                  <span className="text-gray-800 font-bold font-mono">{formatIDR(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimasi HPP:</span>
                  <span className="text-gray-500 font-semibold font-mono">{formatIDR(product.hpp)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-gray-200/50 text-[11px]">
                  <span className="text-gray-400">Margin Keuntungan:</span>
                  <span className="text-green-600 font-extrabold font-mono bg-green-50 px-1.5 py-0.5 rounded">
                    +{marginPercentage}%
                  </span>
                </div>
              </div>

              {/* Tombol Manajemen Produk Cepat */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="border border-gray-200 text-gray-600 font-bold py-2 px-3 rounded-xl text-xs hover:bg-gray-50 active:scale-[0.98] transition-all">
                  ✏️ Edit Menu
                </button>
                <button className="bg-gray-50 hover:bg-amber-500/10 text-gray-500 hover:text-amber-600 font-bold py-2 px-3 rounded-xl text-xs active:scale-[0.98] transition-all">
                  📦 Set Stok
                </button>
              </div>

            </div>
          );
        })}

        {/* State jika pencarian menu nihil */}
        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <span className="text-3xl block mb-2">☕</span>
            <h4 className="text-sm font-bold text-gray-700">Menu tidak ditemukan</h4>
            <p className="text-xs text-gray-400 mt-1">Coba periksa kembali ejaan atau ganti filter kategori produk Anda.</p>
          </div>
        )}
      </div>

    </div>
  );
}