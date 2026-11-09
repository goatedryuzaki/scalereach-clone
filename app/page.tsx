'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Video,
  UploadCloud,
  Youtube,
  Folder,
  Star,
  Settings,
  Key,
  HelpCircle,
  AlertCircle,
  Share2,
  Calendar,
  Zap,
  BarChart2,
  Trash2,
  RotateCw,
  Loader2,
} from 'lucide-react';
import { VideoEntity } from '@/lib/db';

export default function ScaleReachDashboard() {
  const router = useRouter();

  // Dashboard Data State
  const [videos, setVideos] = useState<VideoEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Ingestion Input State
  const [inputUrl, setInputUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Video Options Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch videos from local API
  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos/my-videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle URL Submission
  const handleGetClips = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsValidating(true);
    setInputError(null);

    try {
      // Validate with validate API
      const valRes = await fetch(`/api/videos/validate?url=${encodeURIComponent(inputUrl.trim())}`);
      const valData = await valRes.json();

      if (!valRes.ok || !valData.valid) {
        setInputError(valData.error || 'Please enter a valid video link (YouTube, Twitch, Drive, etc.)');
        setIsValidating(false);
        return;
      }

      // Navigate directly to configure pipeline
      router.push(`/configure?url=${encodeURIComponent(inputUrl.trim())}`);
    } catch (err) {
      // If validation network error, still route to configure with graceful fallback
      router.push(`/configure?url=${encodeURIComponent(inputUrl.trim())}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Delete Video
  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  // Filtered videos based on search
  const filteredVideos = videos.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      (v.description && v.description.toLowerCase().includes(q)) ||
      (v.sourceUrl && v.sourceUrl.toLowerCase().includes(q))
    );
  });

  const latestVideoId = videos.length > 0 ? videos[0].id : 'lirl3b5hSPN5OINTZJTGd';

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex overflow-x-hidden font-sans">
      {/* ======================================================== */}
      {/* 1:1 SCALEREACH LEFT SIDEBAR NAVIGATION                     */}
      {/* ======================================================== */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } transition-all duration-200 border-r border-[#24283B] bg-[#0D0E15] flex flex-col justify-between flex-shrink-0 z-30 min-h-screen select-none`}
      >
        <div>
          {/* Workspace Switcher */}
          <div className="p-4 border-b border-[#24283B] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
                R
              </div>
              {sidebarOpen && (
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">Ryuzaki&apos;s Workspace</div>
                  <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Owner</div>
                </div>
              )}
            </div>
            {sidebarOpen && <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6">
            {/* Main Section */}
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <Video className="h-4 w-4 text-indigo-400" />
                  {sidebarOpen && <span>Home</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] bg-indigo-600/30 px-1.5 py-0.5 rounded text-indigo-200 font-mono">
                    {videos.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Library Section */}
            <div>
              {sidebarOpen && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Library
                </div>
              )}
              <div className="space-y-1">
                <Link
                  href={`/videos/${latestVideoId}/clips`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161926] text-xs font-medium transition-colors"
                  title="All Clips"
                >
                  <Film className="h-4 w-4 text-slate-400" />
                  {sidebarOpen && <span>All Clips</span>}
                </Link>

                <Link
                  href={`/videos/${latestVideoId}/clips`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161926] text-xs font-medium transition-colors"
                  title="Favorites"
                >
                  <Star className="h-4 w-4 text-slate-400" />
                  {sidebarOpen && <span>Favorites</span>}
                </Link>
              </div>
            </div>

            {/* Tools Section */}
            <div>
              {sidebarOpen && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tools
                </div>
              )}
              <div className="space-y-1">
                <Link
                  href="/brand-template/new"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161926] text-xs font-medium transition-colors"
                  title="Brand Templates"
                >
                  <Palette className="h-4 w-4 text-slate-400" />
                  {sidebarOpen && <span>Brand Templates</span>}
                </Link>

                <Link
                  href="/configure"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161926] text-xs font-medium transition-colors"
                  title="Clip Configurator"
                >
                  <Sliders className="h-4 w-4 text-slate-400" />
                  {sidebarOpen && <span>Clip Configurator</span>}
                </Link>

                <Link
                  href="/clips/ADWzEcKDfeqMZ1beA7BQX"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161926] text-xs font-medium transition-colors"
                  title="Workstation Studio"
                >
                  <Sparkles className="h-4 w-4 text-slate-400" />
                  {sidebarOpen && <span>Workstation Studio</span>}
                </Link>
              </div>
            </div>

            {/* Unlimited Minutes Section */}
            <div className="pt-2">
              {sidebarOpen && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Usage
                </div>
              )}
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/20 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-300">Minutes</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">∞ Unlimited</span>
                </div>
                {sidebarOpen && (
                  <>
                    <div className="w-full h-1.5 rounded-full bg-[#161926] overflow-hidden my-2">
                      <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Zero Watermark • Pro Edition</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#24283B] space-y-2">
          {sidebarOpen && (
            <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer">API Keys</span>
              <span>&bull;</span>
              <span className="hover:text-slate-300 cursor-pointer">Settings</span>
              <span>&bull;</span>
              <span className="hover:text-slate-300 cursor-pointer">Help</span>
            </div>
          )}

          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[#13151F] border border-[#24283B]">
            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              R
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Ryuzaki</div>
                <div className="text-[10px] text-slate-500 truncate">goatedryuzaki@gmail.com</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT / DASHBOARD CONTENT                        */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-[#24283B] bg-[#0D0E15]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border border-[#24283B] text-slate-400 hover:text-white hover:bg-[#161926] transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <nav className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span className="text-white font-semibold">Videos</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Pro (Unlimited)</span>
            </span>
          </div>
        </header>

        {/* Dashboard Main Area */}
        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>👋 Hey, Ryuzaki</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Generate high-retention viral clips with 29 creator presets, verbatim kinetic subtitles, and auto-zoom reframing.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="text-xs font-medium text-slate-400 bg-[#13151F] px-3 py-1.5 rounded-xl border border-[#24283B]">
                Minutes remaining: <span className="text-emerald-400 font-bold">∞ Uncapped</span>
              </span>
            </div>
          </div>

          {/* YouTube Connect One-Click Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#13151F] to-[#13151F] border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                <Youtube className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Connect your YouTube channel to import videos in one click
                </h4>
                <p className="text-[11px] text-slate-400">
                  Instant import from published videos, podcasts, and livestreams
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setInputUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all self-end sm:self-auto flex items-center gap-1.5"
            >
              <span>Connect</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* VIDEO INGESTION CARD (PASTE LINK OR UPLOAD FILE)         */}
          {/* ======================================================== */}
          <div className="p-6 rounded-3xl bg-[#13151F] border border-[#24283B] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleGetClips} className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="Paste a YouTube, Twitch, Drive, Dropbox or video link"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    className={`w-full px-4 py-3.5 rounded-2xl bg-[#090A0F] border ${
                      inputError ? 'border-red-500/80' : 'border-[#24283B]'
                    } text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner transition-colors`}
                  />
                  {inputError && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{inputError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isValidating || !inputUrl.trim()}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Validating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Get clips</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/configure"
                    className="px-4 py-3.5 rounded-2xl bg-[#1C1F2E] hover:bg-[#24283B] border border-[#24283B] text-slate-300 hover:text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
                  >
                    <UploadCloud className="h-4 w-4 text-indigo-400" />
                    <span>Upload file</span>
                  </Link>
                </div>
              </div>

              {/* Supported Platforms Notice */}
              <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Works with:</span>
                <span className="text-indigo-400 font-medium">YouTube (free)</span>
                <span>&bull;</span>
                <span className="text-slate-400">Pro unlocked:</span>
                <span className="text-slate-300">Twitch</span>
                <span>&bull;</span>
                <span className="text-slate-300">Kick</span>
                <span>&bull;</span>
                <span className="text-slate-300">Google Drive</span>
                <span>&bull;</span>
                <span className="text-slate-300">Dropbox</span>
                <span>&bull;</span>
                <span className="text-slate-300">Loom</span>
                <span>&bull;</span>
                <span className="text-slate-300">Rumble</span>
                <span>&bull;</span>
                <span className="text-slate-300">Streamable</span>
                <span>&bull;</span>
                <span className="text-slate-300">+ .mp4/.mov links</span>
              </div>
            </form>
          </div>

          {/* ======================================================== */}
          {/* VIDEOS LIST & GRID WORKBENCH                             */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#24283B]">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">Videos ({videos.length})</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#13151F] border border-[#24283B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center p-0.5 rounded-lg border border-[#24283B] bg-[#13151F]">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                <span className="text-xs">Loading videos...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredVideos.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-[#24283B] bg-[#13151F] space-y-3">
                <Video className="h-8 w-8 text-indigo-400 mx-auto opacity-60" />
                <h3 className="text-base font-bold text-white">No videos found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Paste a link above or upload a video file to generate high-retention clips.
                </p>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE: LIST TABLE                                    */}
            {/* ======================================================== */}
            {!isLoading && viewMode === 'list' && filteredVideos.length > 0 && (
              <div className="rounded-2xl border border-[#24283B] bg-[#13151F] overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#24283B] text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0D0E15]">
                      <th className="py-3 px-4">Thumbnail</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Video Type</th>
                      <th className="py-3 px-4">Ratio</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24283B] text-xs">
                    {filteredVideos.map((video) => {
                      const mins = Math.floor(video.duration / 60);
                      const secs = Math.floor(video.duration % 60);
                      const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
                      const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <tr
                          key={video.id}
                          className="hover:bg-[#161926] transition-colors group cursor-pointer"
                          onClick={() => router.push(`/videos/${video.id}/clips`)}
                        >
                          {/* Thumbnail Column */}
                          <td className="py-3.5 px-4 w-36">
                            <div className="relative aspect-video w-32 rounded-xl bg-black overflow-hidden border border-[#24283B]">
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white font-bold">
                                {formattedDuration}
                              </span>
                            </div>
                          </td>

                          {/* Description Column */}
                          <td className="py-3.5 px-4">
                            <div className="max-w-md">
                              <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-0.5">
                                {video.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{formattedDate}</span>
                                <span>&bull;</span>
                                <span className="text-slate-500 truncate max-w-[200px]">
                                  {video.description || 'Full Length Video'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Source Column */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-[11px]">
                              <Youtube className="h-3 w-3" />
                              <span>YouTube</span>
                            </span>
                          </td>

                          {/* Video Type Column */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-bold text-[11px]">
                              <Flame className="h-3 w-3" />
                              <span>Viral Clips</span>
                            </span>
                          </td>

                          {/* Ratio Column */}
                          <td className="py-3.5 px-4">
                            <span className="text-slate-400 font-mono text-[11px] bg-[#161926] px-2 py-0.5 rounded border border-[#24283B]">
                              9:16
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="py-3.5 px-4 text-right">
                            <div
                              className="inline-flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={`/videos/${video.id}/clips`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                              >
                                <span>View clips</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Link>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === video.id ? null : video.id)}
                                  className="p-1.5 rounded-lg border border-[#24283B] text-slate-400 hover:text-white hover:bg-[#1C1F2E] transition-colors"
                                  title="Video options"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>

                                {openMenuId === video.id && (
                                  <div className="absolute right-0 top-8 w-44 rounded-xl bg-[#161926] border border-[#24283B] shadow-2xl p-1.5 z-30 space-y-1">
                                    <Link
                                      href={`/configure?url=${encodeURIComponent(video.sourceUrl)}`}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-[#1C1F2E] transition-colors"
                                    >
                                      <RotateCw className="h-3.5 w-3.5 text-indigo-400" />
                                      <span>Re-run clips</span>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteVideo(video.id, e)}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete video</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW MODE: GRID CARDS                                    */}
            {/* ======================================================== */}
            {!isLoading && viewMode === 'grid' && filteredVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const mins = Math.floor(video.duration / 60);
                  const secs = Math.floor(video.duration % 60);
                  const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

                  return (
                    <div
                      key={video.id}
                      onClick={() => router.push(`/videos/${video.id}/clips`)}
                      className="rounded-2xl border border-[#24283B] bg-[#13151F] hover:border-indigo-500/50 p-4 transition-all hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {/* 16:9 Thumbnail */}
                        <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden border border-[#24283B] mb-3">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white font-bold">
                            {formattedDuration}
                          </span>
                        </div>

                        {/* Title & Metadata */}
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                          {video.title}
                        </h4>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25 font-bold">
                            YouTube
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-bold">
                            Viral Clips
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#24283B] flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">9:16 Reframe</span>
                        <Link
                          href={`/videos/${video.id}/clips`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>View clips</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
