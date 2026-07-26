"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { endpoints } from "../../config/enpoints";
import axios from "axios";
import { setAuthCookie } from "@/app/actions/auth";
import { Eye, EyeClosed, LogIn } from "lucide-react";

export default function JuluLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        email,
        password,
        type: "user",
      };

      const req = await axios.post(endpoints.auth.login, payload);
      if (req?.data?.accessToken) {
        const token = req.data.accessToken;
        if (!token) throw new Error("Token not found");

        await setAuthCookie(token);

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setError("Salah email atau password bray!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-julu-bg min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-julu-yellow/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-julu-orange/5 rounded-full blur-xl"></div>

        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-julu-tosca text-white font-black text-2xl shadow-md shadow-julu-tosca/20 mb-4">
            J
          </div> */}
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            <span className="text-julu-orange">JULU </span>
            {/* JULU <span className="text-julu-orange">POINT OF SALES</span> */}
            POINT OF <span className="text-julu-tosca">SALES </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">
            POS untuk UMKM v1.0
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-4 rounded-xl mb-6 font-medium animate-in fade-in duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Akses
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Phone"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-julu-tosca focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Kata Sandi
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-julu-tosca focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[10px] font-black uppercase text-gray-500 tracking-wider active:scale-95 transition-all"
              >
                {showPassword ? <Eye /> : <EyeClosed />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-julu-tosca text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-julu-tosca/10 hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="flex flex-1 gap-2 justify-center items-center">
                LOGIN
                <LogIn className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-4">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Sistem terenkripsi secara internal. Hak cipta milik Julu POS. Jangan
            membagikan token kredensial kepada pihak luar.
          </p>
        </div>
      </div>
    </div>
  );
}
