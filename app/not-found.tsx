import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold text-white mb-2">404 — Page Not Found</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-md">
        The requested clip or workstation project does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
      >
        Return to Dashboard &rarr;
      </Link>
    </div>
  );
}
