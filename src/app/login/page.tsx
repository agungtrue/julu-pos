'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JuluLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (email === 'syuhadadwiagung@gmail.com' && password === '@123') {
      // SET COOKIE SIMULASI (Masa aktif 1 hari)
      const exactDay = 1 * 24 * 60 * 60 * 1000;
      const expires = new Date(Date.now() + exactDay).toUTCString();
        
      // Menyimpan token bajakan untuk mengelabui middleware selama FE dev
      document.cookie = `julu_session_token=mock-token-agung; expires=${expires}; path=/;`;

      // Baru arahkan ke dashboard
      router.push('/dashboard');
    } else {
      setError('Email atau password salah, Mas Agung. Cek kembali.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-julu-bg min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden">
        
        {/* Dekorasi Aksen Lingkaran Warna Julu */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-julu-yellow/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-julu-orange/5 rounded-full blur-xl"></div>

        {/* HEADER BRAND PORTAL */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-julu-tosca text-white font-black text-2xl shadow-md shadow-julu-tosca/20 mb-4">
            J
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            JULU <span className="text-julu-orange">COFFEE</span> & SNACKS
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">
            Owner & Admin Portal v1.0
          </p>
        </div>

        {/* NOTIFIKASI ERROR JIKA SALAH INPUT */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-4 rounded-xl mb-6 font-medium animate-in fade-in duration-200">
            ⚠️ {error}
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* INPUT EMAIL */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Akses
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email admin"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-julu-tosca focus:bg-white transition-colors"
            />
          </div>

          {/* INPUT PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-julu-tosca focus:bg-white transition-colors"
            />
          </div>

          {/* BUTTON SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-julu-tosca text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-julu-tosca/10 hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Masuk ke Dashboard ➔'
            )}
          </button>

        </form>

        {/* FOOTER NOTA PROTEKSI */}
        <div className="mt-8 text-center border-t border-gray-100 pt-4">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Sistem terenkripsi secara internal. Hak cipta milik Julu Coffee Group. Jangan membagikan token kredensial kepada pihak luar.
          </p>
        </div>

      </div>
    </div>
  );
}