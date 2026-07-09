'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeAuthCookie } from '@/app/actions/auth';
import { Home, CircleDollarSign, ArrowLeftRight, Calculator, SquarePen, Search, Coffee, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Daftar Menu Navigasi Portal Julu
  const menuItems = [
    { name: 'Ringkasan Performa', path: '/dashboard', icon: Home },
    { name: 'Orders', path: '/dashboard/orders', icon: ArrowLeftRight },
    { name: 'Sales', path: '/dashboard/sales', icon: CircleDollarSign },
    { name: 'Sistem HPP / COGS', path: '/dashboard/cogs', icon: Calculator },
    { name: 'Daftar Menu & Produk', path: '/dashboard/products', icon: Coffee },
  ];

  const handleLogout = () => {
    removeAuthCookie()
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 font-sans flex flex-col md:flex-row">
      
      {/* 📱 TOP BAR LAYOUT (MOBILE ONLY) */}
      <div className="md:hidden bg-[#0F766E] text-white px-5 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-[#0F766E] font-black flex items-center justify-center text-sm shadow-sm">
            J
          </div>
          <span className="font-bold text-sm tracking-wide uppercase">Julu Portal</span>
        </div>
        
        {/* Tombol Hamburger Menu */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20 transition-colors"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* 🗂️ MOBILE NAVIGATION DRAWER OVERLAY */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />
      )}
      
      <aside className={`
        fixed md:sticky top-0 left-0 bottom-0 z-50
        w-72 bg-[#0F766E] text-white p-6 flex flex-col justify-between shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:h-screen
      `}>
        <div>
          {/* DESKTOP HEADER BRANDING */}
          <div className="hidden md:flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#0F766E] font-black flex items-center justify-center text-xl shadow-md">
              J
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-wider uppercase">JULU COFFEE</h2>
              <p className="text-[10px] text-white/60 tracking-widest uppercase font-medium">Snacks & Booth 01</p>
            </div>
          </div>

          {/* LIST MENU ITEM LINK */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)} // Tutup drawer otomatis di mobile jika link diklik
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all
                    ${isActive 
                      ? 'bg-[#EF5B2B] text-white shadow-md shadow-[#EF5B2B]/20 scale-[1.02]' 
                      : 'hover:bg-white/10 text-white/90'
                    }
                  `}
                >
                  {/* <span className="text-lg">{item.icon}</span> */}
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION: USER CARD & LOGOUT */}
        <div className="border-t border-white/10 pt-6 mt-6">
          <div className="flex items-center gap-3.5 mb-5 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              AG
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Admin</h4>
              <p className="text-[10px] text-white/60">Owner / Operator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-red-600/20 hover:text-red-300 border border-transparent hover:border-red-500/20 text-white/80 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* 💻 MAIN CONTAINER AREA UNTUK ANAK HALAMAN (PAGE CONTENT) */}
      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}