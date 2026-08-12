import React from "react";
import { UserCheck, Coffee, Cookie, ReceiptText } from "lucide-react";

interface UserPerformance {
  name: string;
  transactions: number;
  items: {
    cups: number;
    snacks: number;
  };
}

interface UserPerformanceProps {
  performances?: {
    users: UserPerformance[];
  };
}

export function UserPerformanceSection({ performances }: UserPerformanceProps) {
  const users = performances?.users || [];

  // Hitung total transaksi dari seluruh staf untuk kalkulasi persentase kontribusi
  const totalShopTransactions = users.reduce((acc, user) => acc + user.transactions, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 border-l-4 border-[#0A8F8A] pl-3">
            Performa Kasir & Staf
          </h4>
        </div>
        <span className="text-[10.5px] font-semibold text-gray-400">
          {users.length} Staf Aktif
        </span>
      </div>

      <div className="space-y-3">
        {users.length > 0 ? (
          users.map((user, idx) => {
            const totalItems = user.items.cups + user.items.snacks;
            const contributionPercentage =
              totalShopTransactions > 0
                ? Math.round((user.transactions / totalShopTransactions) * 100)
                : 0;

            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 bg-gray-50/70 hover:bg-gray-50 rounded-xl border border-gray-100 space-y-3 transition-all"
              >
                {/* TOP BAR: AVATAR, NAMA & TOTAL TRANSAKSI */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0A8F8A]/10 text-[#0A8F8A] flex items-center justify-center shrink-0 font-bold text-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10.5px] text-gray-400 font-medium mt-0.5">
                        <ReceiptText className="w-3 h-3 text-gray-400" />
                        <span>{user.transactions} Transaksi Selesai</span>
                      </div>
                    </div>
                  </div>

                  {/* BADGE TOTAL ITEM TERJUAL */}
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-black text-gray-900 shadow-2xs">
                      {totalItems} <span className="text-[9.5px] font-normal text-gray-500">Item</span>
                    </span>
                  </div>
                </div>

                {/* BREAKDOWN DUA KOLOM: CUPS vs SNACKS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Minuman / Cups */}
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                      <Coffee className="w-3.5 h-3.5 text-[#0A8F8A]" />
                      <span>Minuman</span>
                    </div>
                    <span className="text-xs font-black text-[#0A8F8A]">
                      {user.items.cups} <span className="text-[9.5px] font-bold text-[#0A8F8A]/70">Cups</span>
                    </span>
                  </div>

                  {/* Cemilan / Snacks */}
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                      <Cookie className="w-3.5 h-3.5 text-[#EF5B2B]" />
                      <span>Cemilan</span>
                    </div>
                    <span className="text-xs font-black text-[#EF5B2B]">
                      {user.items.snacks} <span className="text-[9.5px] font-bold text-[#EF5B2B]/70">Porsi</span>
                    </span>
                  </div>
                </div>

                {/* PROGRESS BAR KONTRIBUSI TRANSAKSI */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>Kontribusi Transaksi</span>
                    <span>{contributionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0A8F8A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${contributionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-xs font-semibold text-gray-400">
              Belum ada data performa staf untuk periode ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}