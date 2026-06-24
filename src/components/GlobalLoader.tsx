import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoaderProps {
  message?: string;
}

export default function GlobalLoader({ message = 'Memuat Data Julu...' }: GlobalLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-teal-600 dark:text-teal-400" speed={1} />
        
        <span className="absolute h-3 w-3 rounded-full bg-[#EF5B2B] animate-ping" />
      </div>
      
      <p className="mt-4 text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200 animate-pulse">
        {message}
      </p>
    </div>
  );
}