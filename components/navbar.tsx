'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Sliders,
  Palette,
  Film,
  Infinity as InfinityIcon,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/configure', label: 'Configure', icon: Sliders },
    { href: '/brand-template/new', label: 'Brand Templates', icon: Palette },
    { href: '/clips/ADWzEcKDfeqMZ1beA7BQX', label: 'Clip Studio', icon: Film },
  ];

  return (
    <header className="border-b border-[#24283B] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Edition */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                ScaleReach
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Personal Clone
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#161926]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Badges & Indicators */}
        <div className="flex items-center gap-3">
          {/* Zero-Login Local Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Zero-Login / Local Mode</span>
          </div>

          {/* Unlimited Free Quota Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-sm">
            <InfinityIcon className="h-3.5 w-3.5" />
            <span>Unlimited Quota</span>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
