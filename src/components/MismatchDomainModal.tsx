import React from 'react';

interface MismatchDomainModalProps {
  isOpen: boolean;
  currentDomain: string; // Contoh: "sabana-pos.julucoffee.com"
  targetDomain: string;  // Contoh: "julu-pos.julucoffee.com"
  targetUrl: string;     // Contoh: "https://julu-pos.julucoffee.com/login"
  onLogout?: () => void;
}

export const MismatchDomainModal: React.FC<MismatchDomainModalProps> = ({
  isOpen,
  currentDomain,
  targetDomain,
  targetUrl,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-center transform transition-all">
        
        {/* 1. Icon Badge */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-50 text-[#EF5B2B] flex items-center justify-center border border-orange-100/60 shadow-sm">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>

        {/* 2. Judul Modal */}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Domain Toko Tidak Sesuai
        </h2>

        {/* 3. Deskripsi Singkat */}
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Akun Anda tidak terdaftar di Toko ini. Silakan beralih ke domain Toko yang sesuai dengan akun Anda.
        </p>

        {/* 4. Comparison Box (Memudahkan User Melihat Perbandingan Domain) */}
        <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Domain saat ini:</span>
            <span className="font-mono text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100 line-through">
              {currentDomain}
            </span>
          </div>
          <div className="border-t border-gray-200/60 pt-2 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Domain akun Anda:</span>
            <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {targetDomain}
            </span>
          </div>
        </div>

        {/* 5. Action Buttons */}
        <div className="mt-6 space-y-2.5">
          {/* Tombol Pindah Domain Otomatis */}
          <a
            href={targetUrl}
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#EF5B2B] hover:bg-[#d84e22] text-white font-bold rounded-xl shadow-sm transition-all text-sm active:scale-[0.98]"
          >
            Pindah ke {targetDomain} →
          </a>

          {/* Tombol Keluar / Ganti Akun */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-100 text-gray-600 font-semibold rounded-xl transition-all text-xs"
            >
              Keluar / Gunakan Akun Lain
            </button>
          )}
        </div>

      </div>
    </div>
  );
};