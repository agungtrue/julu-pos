"use client";

import React, { useState } from 'react';

// Contoh Dummy Data yang merepresentasikan struktur payload backend NestJS Anda
const INITIAL_USERS = [
  { id: '1', name: 'Syuhada Dwi Agung', email: 'agung@julucoffee.com', role: 'SUPER_ADMIN', status: 'ACTIVE', tenantName: 'All Tenants (SaaS)' },
  { id: '2', name: 'Budi Hartono', email: 'budi@roti123.com', role: 'ADMIN', status: 'ACTIVE', tenantName: 'Roti 123' },
  { id: '3', name: 'Siti Aminah', email: 'siti.kasir@julu.com', role: 'EMPLOYEE', status: 'ACTIVE', tenantName: 'Julu Coffee & Snacks' },
  { id: '4', name: 'Andi Wijaya', email: 'andi@kopi.com', role: 'EMPLOYEE', status: 'SUSPENDED', tenantName: 'Kopi Nganu' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper untuk rendering badge Role dengan warna palet Julu
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">Super Master</span>;
      case 'ADMIN':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#0A8F8A]/10 text-[#0A8F8A] border border-[#0A8F8A]/30">Tenant Admin</span>;
      case 'EMPLOYEE':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-300">Employee / Kasir</span>;
      default:
        return null;
    }
  };

  // Helper untuk status keaktifan
  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' 
      ? <span className="flex items-center gap-1.5 text-xs font-medium text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Aktif</span>
      : <span className="flex items-center gap-1.5 text-xs font-medium text-red-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Aktif</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* 🏷️ HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola hak akses pengguna, pemilik tenant, dan staf kasir Julu POS.</p>
        </div>
        
        {/* Tombol Aksi Utama - Orange Julu */}
        <button className="px-5 py-2.5 bg-[#EF5B2B] hover:bg-[#d64a20] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Tambah User Baru
        </button>
      </div>

      {/* 🔍 FILTER & SEARCH BAR - Serupa UI Julu Portal yang Anda Buat */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input 
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A8F8A] focus:bg-white transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400 font-medium">Filter Role:</span>
          <select className="bg-gray-50 border border-gray-200 text-xs rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0A8F8A]">
            <option>Semua Role</option>
            <option>Super Master</option>
            <option>Tenant Admin</option>
            <option>Employee / Kasir</option>
          </select>
        </div>
      </div>

      {/* 📊 DATA TABLE CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Nama Pengguna</th>
                <th className="px-6 py-4">Scope Tenant</th>
                <th className="px-6 py-4">Hak Akses (Role)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {users
                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    {/* Kolom Profil Nama & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0A8F8A]/10 text-[#0A8F8A] font-bold flex items-center justify-center text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Kolom Scope Isolaasi Tenant SaaS */}
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {user.tenantName}
                    </td>
                    
                    {/* Kolom Badge Role Palet Julu */}
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    
                    {/* Kolom Status Aktif */}
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    
                    {/* Tombol Manajemen Modifikasi */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-all" title="Edit User">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all" title="Suspend/Non-Aktifkan">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}