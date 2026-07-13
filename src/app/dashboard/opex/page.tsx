"use client";

import React, { useState } from 'react';

// Data komponen opex riil sesuai angka booth kopi Junior Anda (Total: Rp 81.191)
const INITIAL_OPEX_COMPONENTS = [
  { id: '1', name: 'Sewa Tempat (Booth)', dailyAmount: 200000 },
  { id: '2', name: 'Alokasi Gaji & Lain-lain', dailyAmount: 88691 },
];

export default function OpexManagementPage() {
  const [opexList, setOpexList] = useState(INITIAL_OPEX_COMPONENTS);
  const [simulatedRevenue, setSimulatedRevenue] = useState(300000); // Default target omzet harian Anda (30 cup x 10k)
  const [currentActualRevenue] = useState(604000); // Mock data omzet riil terakhir (Closingan Minggu lalu)

  // Form State untuk tambah komponen baru
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // 🧮 KALKULASI UTAMA (Meticulous Financial Engine)
  const totalDailyOpex = opexList.reduce((sum, item) => sum + item.dailyAmount, 0);
  
  // Hitung rasio Opex berdasarkan simulasi input manual user
  const opexSimulationRatio = simulatedRevenue > 0 ? (totalDailyOpex / simulatedRevenue) * 100 : 0;
  
  // Hitung rasio Opex berdasarkan data omzet riil hari ini
  const opexActualRatio = currentActualRevenue > 0 ? (totalDailyOpex / currentActualRevenue) * 100 : 0;

  // Handler Tambah Opex Manual (Trigger Sinkronisasi ke Cache Tenants kelak)
  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;
    const newItem = {
      id: Date.now().toString(),
      name: newName,
      dailyAmount: parseFloat(newAmount),
    };
    setOpexList([...opexList, newItem]);
    setNewName('');
    setNewAmount('');
  };

  // Handler Hapus Komponen Opex
  const handleDeleteComponent = (id: string) => {
    setOpexList(opexList.filter(item => item.id !== id));
  };

  // Helper Penentu Warna Indikator Efisiensi Keuangan
  const getEfficiencyColor = (ratio: number) => {
    if (ratio <= 35) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', text: 'Sangat Efisien (Sehat Walafiat)' };
    if (ratio <= 50) return { bg: 'bg-[#0A8F8A]/10 text-[#0A8F8A] border-[#0A8F8A]/20', dot: 'bg-[#0A8F8A]', text: 'Normal / Relevan (Batas Aman)' };
    return { bg: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500', text: 'Boros / Bahaya (Makan Margin Laba)' };
  };

  const simulatedStatus = getEfficiencyColor(opexSimulationRatio);
  const actualStatus = getEfficiencyColor(opexActualRatio);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* 🏷️ HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Operational Expenditure (Opex)</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola beban biaya tetap harian dan simulasikan rasio efisiensi target laba bersih.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📊 KIRI & TENGAH: SIMULATOR & BREAKDOWN LIST */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* CARD 1: SIMULATOR TARGET EFFICIENCY (Fokus Utama Request Anda) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-[#FBBF24] rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-800">Opex Target Simulator</h2>
            </div>
            
            <p className="text-xs text-gray-400 mb-6">
              Masukkan estimasi/target omzet harian secara manual di bawah ini untuk mengukur kelayakan persentase Opex Anda sebelum rilis menu baru.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Input Manual Target Omzet */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Simulasi Omzet Harian (Rp)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-semibold text-sm">Rp</span>
                  <input 
                    type="number"
                    value={simulatedRevenue}
                    onChange={(e) => setSimulatedRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-lg font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-800"
                    placeholder="Contoh: 300000"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1.5 block">
                  💡 Tip: Coba masukkan <b>300000</b> (Target 30 Cup JJ) vs <b>604000</b> (Closingan Riil)
                </span>
              </div>

              {/* Box Output Hasil Kalkulasi Persentase */}
              <div className={`p-5 rounded-xl border transition-all duration-300 ${simulatedStatus.bg}`}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Rasio Opex Hasil Simulasi</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight">{opexSimulationRatio.toFixed(1)}%</span>
                  <span className="text-xs font-medium opacity-80">dari target omzet</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-wide">
                  <span className={`w-2 h-2 rounded-full ${simulatedStatus.dot}`}></span>
                  {simulatedStatus.text}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: LIST RINCIAN KOMPONEN OPEX */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Daftar Komponen Biaya Harian</h3>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Total Beban Tetap</p>
                <p className="text-xl font-black text-[#0A8F8A]">Rp {totalDailyOpex.toLocaleString('id-ID')}<span className="text-xs font-normal text-gray-400">/hari</span></p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Nama Komponen Pengeluaran</th>
                    <th className="px-6 py-4 text-right">Nominal Beban Harian</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {opexList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/40 transition-all">
                      <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF5B2B]"></span>
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-600">
                        Rp {item.dailyAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDeleteComponent(item.id)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                          title="Hapus Pengeluaran"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 📥 KANAN: INPUT FORM & REAL CLOSING RATIO */}
        <div className="flex flex-col gap-6">
          
          {/* INDIKATOR METRIK OPERASIONAL RIIL */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Dashboard Snapshot</h3>
            <div className="mb-4">
              <p className="text-xs text-gray-400">Omzet Aktual Terakhir</p>
              <p className="text-2xl font-black text-gray-800">Rp {currentActualRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div className={`p-4 rounded-xl border ${actualStatus.bg} flex flex-col gap-1`}>
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">Rasio Opex Aktual Saat Ini</span>
              <span className="text-2xl font-black">{opexActualRatio.toFixed(1)}%</span>
              <span className="text-[11px] font-medium mt-1">Status Lapangan: <b>{actualStatus.text}</b></span>
            </div>
          </div>

          {/* FORM TAMBAH BEPAN OPEX BARU */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-gray-800">Tambah Komponen Opex</h3>
            </div>
            
            <form onSubmit={handleAddComponent} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pengeluaran</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Listrik & Air Booth"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Beban per Hari (Rp)</label>
                <input 
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all text-gray-700 font-semibold"
                  required
                />
              </div>

              {/* Tombol Simpan - Aksen Orange Julu */}
              <button 
                type="submit"
                className="w-full mt-2 py-2.5 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                Simpan & Update Cache
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}