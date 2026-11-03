'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { IngestionCard } from '@/components/ingestion-card';
import { useScaleReachStore } from '@/lib/state-store';
import { CAPTION_PRESETS } from '@/lib/presets-catalog';
import {
  Sparkles,
  Flame,
  Layers,
  Download,
  Film,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
  Sliders,
  Palette,
} from 'lucide-react';

export default function HomePage() {
  const { recentVideos } = useScaleReachStore();

  const featuredClips = [
    {
      id: 'clip-1',
      title: 'The Brutal Truth About Silicon Valley Startups',
      source: 'Podcast Masterclass #142',
      duration: '0:48',
      viralityScore: 96,
      hook: 'Most founders burn $2M before talking to customers.',
      platforms: ['TikTok', 'Shorts', 'Reels'],
      viewsEstimate: '250K - 1M',
      preset: 'Hormozi',
      color: 'from-amber-500/20 to-orange-500/10',
    },
    {
      id: 'clip-2',
      title: 'Stop Relying on Motivation — Build Systems',
      source: 'Deep Work Workshop',
      duration: '0:34',
      viralityScore: 92,
      hook: 'If you need motivation to do it, you already lost.',
      platforms: ['Shorts', 'TikTok'],
      viewsEstimate: '100K - 500K',
      preset: 'MrBeast Pro',
      color: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      id: 'clip-3',
      title: 'How To Close Any Deal In Under 60 Seconds',
      source: 'Sales Mastery Series',
      duration: '0:52',
      viralityScore: 89,
      hook: 'The client already decided before you opened your mouth.',
      platforms: ['Reels', 'TikTok', 'LinkedIn'],
      viewsEstimate: '80K - 300K',
      preset: 'Classic',
      color: 'from-indigo-500/20 to-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ScaleReach Personal Edition &bull; 100% Free & Unlimited</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Turn Long Videos Into Viral{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Shorts In Seconds
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Automated speech-to-text, virality hook scoring, 24 kinetic caption presets, and split-screen gameplay reframing. Zero paywalls, zero login restrictions, unlimited exports.
          </p>
        </div>

        {/* Video Ingestion Card */}
        <div className="mb-14">
          <IngestionCard />
        </div>

        {/* Recent Generated Clips Showcase */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <span>Featured High-Virality Clips</span>
              </h2>
              <p className="text-xs text-slate-400">
                Extracted with algorithmic hook scoring and 9:16 layout re-framing
              </p>
            </div>
            <Link
              href="/clips/ADWzEcKDfeqMZ1beA7BQX"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>Open Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredClips.map((clip) => (
              <div
                key={clip.id}
                className="bg-[#13151F] border border-[#24283B] rounded-2xl p-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${clip.color} rounded-full blur-2xl pointer-events-none`} />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{clip.viralityScore}/100 Virality</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-[#161926] px-2 py-0.5 rounded border border-[#24283B]">
                      {clip.duration}
                    </span>
                  </div>

                  {/* Title & Hook */}
                  <h3 className="font-bold text-sm text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors">
                    {clip.title}
                  </h3>
                  <div className="bg-[#090A0F] border border-[#24283B] rounded-xl p-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Detected Hook
                    </span>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      &ldquo;{clip.hook}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-[#24283B] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[10px] bg-[#1C1F2E] px-2 py-0.5 rounded border border-[#24283B]">
                      {clip.preset}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                      {clip.platforms.join(' &bull; ')}
                    </span>
                  </div>

                  <Link
                    href={`/clips/ADWzEcKDfeqMZ1beA7BQX`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <span>Edit</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Pillars of ScaleReach Platform */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 hover:border-indigo-500/40 transition-colors shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">24 Kinetic Caption Presets</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Hormozi, MrBeast Pro, TikTok Native, GaryVee, Toxic Green, and 19 others rendered with verbatim creator styles, word-by-word animation, and 27 typography families.
            </p>
            <Link
              href="/brand-template/new"
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Explore presets</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 hover:border-purple-500/40 transition-colors shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">15 AI Extraction Models</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Viral Clips, Memorable Phrases, Topic Clips, Trailers, Product Ads, and Banter modes designed to isolate the highest retention moments automatically.
            </p>
            <Link
              href="/configure"
              className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Configure pipeline</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Native 1080p FFmpeg Exporter</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Runs hardware-accelerated rendering on your machine. Watermarks permanently disabled, 60fps export, zero monthly subscriptions.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              <span>Unlimited Pro Unlocked</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#24283B] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>ScaleReach Local Clone</span>
            <span>&bull;</span>
            <span>Next.js 15 App Router</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-medium">Zero-Paywall Guarantee</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/configure" className="text-slate-400 hover:text-indigo-400 transition-colors">
              Clip Configurator
            </Link>
            <Link href="/brand-template/new" className="text-slate-400 hover:text-indigo-400 transition-colors">
              Brand Template Studio
            </Link>
            <Link href="/clips/ADWzEcKDfeqMZ1beA7BQX" className="text-slate-400 hover:text-indigo-400 transition-colors">
              Workstation Studio
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
