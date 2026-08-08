import React from 'react';

interface GlobalLoaderProps {
  message?: string;
}

export default function GlobalLoader({ message = 'Memuat Data Julu POS...' }: GlobalLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none">
      
      {/* 1. Smooth Dual-Ring Spinner */}
      <div className="relative flex items-center justify-center w-12 h-12 mb-3.5">
        
        {/* Soft Ambient Glow di belakang spinner */}
        <div className="absolute inset-0 rounded-full bg-[#0F766E]/20 dark:bg-teal-400/20 blur-lg animate-pulse" />

        {/* Track Ring (Garis Melingkar Tipis) */}
        <div className="absolute inset-0 rounded-full border-[2.5px] border-slate-200/50 dark:border-slate-700/50" />

        {/* Active Spinning Ring */}
        <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#0F766E] border-r-[#0F766E] dark:border-t-teal-400 dark:border-r-teal-400 animate-spin" />

        {/* Center Dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-teal-400 animate-ping opacity-75" />
      </div>

      {/* 2. Loading Message */}
      <p className="text-[11px] font-bold tracking-widest uppercase text-slate-700 animate-pulse drop-shadow-sm">
        {message}
      </p>

      {/* 3. Brand Accent Dots (Teal Green, Orange #EF5B2B, Yellow) */}
      <div className="mt-2 flex gap-1.5 justify-center items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-teal-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF5B2B] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
      </div>

    </div>
  );
}