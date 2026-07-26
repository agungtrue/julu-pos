import React from "react";
import { X, AlertTriangle, ArrowRight, PackageCheck } from "lucide-react";
import { useRouter } from 'next/navigation';

interface StockAlert {
  id: string;
  name: string;
  stock: number;
  minimumStock: number;
  unit: string;
}

interface LowStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockAlerts: StockAlert[];
}

export const LowStockModal: React.FC<LowStockModalProps> = ({
  isOpen,
  onClose,
  stockAlerts = [],
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
                Peringatan Stok Menipis
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Terdapat <strong className="text-amber-600">{stockAlerts.length} bahan baku</strong> yang menyentuh batas minimum.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable List */}
        <div className="p-6 overflow-y-auto divide-y divide-gray-100 space-y-3">
          {stockAlerts.map((item) => {
            // Hitung rasio persentase sisa stok terhadap ambang batas
            const ratio = Math.min(
              Math.round((item.stock / (item.minimumStock * 2 || 1)) * 100),
              100
            );

            return (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">
                      {item.name}
                    </h4>
                    <span className="text-[11px] font-medium text-gray-400">
                      Batas Min: {item.minimumStock?.toLocaleString("id-ID")} {item.unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-red-600 block">
                      {item.stock?.toLocaleString("id-ID")} {item.unit}
                    </span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Sisa Stok
                    </span>
                  </div>
                </div>

                {/* Progress Bar Indikator Kritis */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(ratio, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}

          {stockAlerts.length === 0 && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#0A8F8A]/10 text-[#0A8F8A] flex items-center justify-center mx-auto mb-2">
                <PackageCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">
                Semua Stok Aman!
              </p>
              <p className="text-xs text-gray-400">
                Tidak ada bahan baku yang berada di bawah stok minimum.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/dashboard/cogs')
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0A8F8A] hover:bg-[#087773] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0A8F8A]/20 flex items-center justify-center gap-2"
          >
            <span>Restock / Kelola</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};