'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-extrabold text-white mb-2">Something went wrong!</h1>
      <p className="text-slate-400 text-sm mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
