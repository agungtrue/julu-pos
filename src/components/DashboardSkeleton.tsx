import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 p-9 animate-pulse">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-300 rounded-xl p-5 space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-300 rounded w-1/3"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-300 rounded w-2/3"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-72 bg-gray-200 dark:bg-gray-300 rounded-xl p-5 space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-300 rounded w-1/3"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-300 rounded w-2/3"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}