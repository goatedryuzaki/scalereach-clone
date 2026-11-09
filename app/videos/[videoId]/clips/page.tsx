'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import {
  ArrowLeft,
  Play,
  Pause,
  Download,
  Sliders,
  Share2,
  Heart,
  Sparkles,
  Flame,
  LayoutGrid,
  List,
  Search,
  Check,
  X,
  ExternalLink,
  Clock,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ClipEntity, VideoEntity } from '@/lib/db';

export default function VideoClipsPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const resolvedParams = use(params);
  const videoId = resolvedParams.videoId;
  const router = useRouter();

  const [video, setVideo] = useState<VideoEntity | null>(null);
  const [clips, setClips] = useState<ClipEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClipModal, setActiveClipModal] = useState<ClipEntity | null>(null);
  const [modalTab, setModalTab] = useState<'transcript' | 'viral'>('transcript');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [videoRes, clipsRes] = await Promise.all([
          fetch(`/api/videos/${videoId}`).catch(() => null),
          fetch(`/api/videos/${videoId}/clips`).catch(() => null),
        ]);

        if (videoRes && videoRes.ok) {
          const vData = await videoRes.json();
          if (isMounted) setVideo(vData);
        }

        if (clipsRes && clipsRes.ok) {
          const cData = await clipsRes.json();
          const clipsList = Array.isArray(cData) ? cData : cData.clips || [];
          if (isMounted) setClips(clipsList);
        }
      } catch (err) {
        console.error('Failed to load video and clips:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleFavorite = (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, favorited: !c.favorited } : c))
    );
  };

  const handleShare = (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/clips/${clipId}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(clipId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (clip: ClipEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger download
    const link = document.createElement('a');
    link.href = `/api/clips/${clip.id}/export`;
    link.download = `${clip.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClips = clips.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.introTitle && c.introTitle.toLowerCase().includes(q)) ||
      (c.transcript && c.transcript.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/" className="hover:text-white transition-colors">
            Videos
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-indigo-400 font-semibold">Clips</span>
        </div>

        {/* Back Link & Video Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#24283B]">
          <div className="flex items-start gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl border border-[#24283B] bg-[#13151F] hover:bg-[#161926] text-slate-400 hover:text-white transition-colors flex-shrink-0"
              title="Back to Videos"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {video?.sourceType === 'url' ? 'YouTube' : 'Upload'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1C1F2E] text-slate-300 border border-[#24283B]">
                  9:16 Vertical
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> 100% Free • Unlimited 1080p
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight line-clamp-1">
                {video?.title || 'Generated Viral Clips'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <Link
              href="/configure"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#24283B] bg-[#13151F] hover:bg-[#161926] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Re-configure</span>
            </Link>
          </div>
        </div>

        {/* Search & Layout Toggle Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#13151F] border border-[#24283B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{filteredClips.length}</span> clips
            </span>

            <div className="flex items-center p-0.5 rounded-lg border border-[#24283B] bg-[#13151F]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-2xl bg-[#13151F] border border-[#24283B] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredClips.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-[#24283B] bg-[#13151F] space-y-3">
            <Video className="h-8 w-8 text-indigo-400 mx-auto opacity-60" />
            <h3 className="text-base font-bold text-white">No clips found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No clips match your current search. Try generating new clips from a video link.
            </p>
            <Link
              href="/configure"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Clips</span>
            </Link>
          </div>
        )}

        {/* GRID VIEW */}
        {!isLoading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClips.map((clip) => {
              const formattedDuration = `${Math.floor(clip.duration / 60)}:${Math.floor(
                clip.duration % 60
              )
                .toString()
                .padStart(2, '0')}`;

              return (
                <div
                  key={clip.id}
                  onClick={() => setActiveClipModal(clip)}
                  className="group relative flex flex-col rounded-2xl border border-[#24283B] bg-[#13151F] hover:border-indigo-500/60 overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.99]"
                >
                  {/* 9:16 Video Thumbnail Container */}
                  <div className="relative aspect-[9/16] w-full bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        clip.thumbnailUrl ||
                        video?.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=60'
                      }
                      alt={clip.title}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Dark gradient for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                        {formattedDuration}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-md text-[10px] font-extrabold text-white shadow-lg uppercase tracking-wider">
                        1080p 60fps
                      </span>
                    </div>

                    {/* Center Play Button Overlay */}
                    <div className="relative z-10 h-14 w-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <Play className="h-6 w-6 ml-0.5 fill-black" />
                    </div>

                    {/* Virality Score Badge */}
                    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40">
                      <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                      <span className="text-xs font-black text-amber-300">
                        {clip.viralityScore}
                      </span>
                      <span className="text-[10px] text-amber-200/80">✨✨✨✨✨</span>
                    </div>
                  </div>

                  {/* Clip Details Card Body */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                    <div>
                      {clip.introTitle && (
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                          {clip.introTitle}
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                        {clip.title}
                      </h3>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#24283B]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleFavorite(clip.id, e)}
                          className={`p-2 rounded-lg border border-[#24283B] transition-colors ${
                            clip.favorited
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-[#161926] text-slate-400 hover:text-white'
                          }`}
                          title="Favorite"
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${clip.favorited ? 'fill-rose-400' : ''}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(clip.id, e)}
                          className="p-2 rounded-lg border border-[#24283B] bg-[#161926] text-slate-400 hover:text-white transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === clip.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDownload(clip, e)}
                          className="p-2 rounded-lg border border-[#24283B] bg-[#161926] text-slate-300 hover:text-white transition-colors"
                          title="Download Clip MP4"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clips/${clip.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
                        >
                          <Sliders className="h-3 w-3" />
                          <span>Edit clip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {!isLoading && viewMode === 'list' && (
          <div className="space-y-3">
            {filteredClips.map((clip) => {
              const formattedDuration = `${Math.floor(clip.duration / 60)}:${Math.floor(
                clip.duration % 60
              )
                .toString()
                .padStart(2, '0')}`;

              return (
                <div
                  key={clip.id}
                  onClick={() => setActiveClipModal(clip)}
                  className="p-4 rounded-xl border border-[#24283B] bg-[#13151F] hover:border-indigo-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-[#161926]/80"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-14 rounded-lg bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={
                          clip.thumbnailUrl ||
                          video?.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=60'
                        }
                        alt={clip.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                          <Flame className="h-3 w-3 fill-amber-400" /> Score: {clip.viralityScore}
                        </span>
                        <span className="text-xs text-slate-400">{formattedDuration}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{clip.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-lg mt-0.5">
                        {clip.transcript}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleDownload(clip, e)}
                      className="p-2 rounded-lg border border-[#24283B] bg-[#161926] text-slate-300 hover:text-white transition-colors"
                      title="Download Clip"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/clips/${clip.id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Edit clip</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SCALE REACH FULL CLIP PREVIEW MODAL */}
        {activeClipModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setActiveClipModal(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-[#13151F] border border-[#24283B] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveClipModal(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left Column: 9:16 Video Player Container */}
              <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-6 relative">
                <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-[#090A0F]">
                  {/* Video player */}
                  <video
                    src={video?.sourceUrl?.endsWith('.mp4') ? video.sourceUrl : undefined}
                    poster={activeClipModal.thumbnailUrl || video?.thumbnailUrl}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Top badge */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/30">
                    <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-300">
                      {activeClipModal.viralityScore}
                    </span>
                    <span className="text-[10px] text-amber-200">✨✨✨✨✨</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clip Intelligence & Tabs */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-bold">
                      Viral Clip #{activeClipModal.id.slice(-4)}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                      1080p Ready
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-white leading-snug">
                    {activeClipModal.title}
                  </h2>

                  {/* Tabs */}
                  <div className="flex items-center gap-2 mt-4 border-b border-[#24283B]">
                    <button
                      type="button"
                      onClick={() => setModalTab('transcript')}
                      className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
                        modalTab === 'transcript'
                          ? 'border-indigo-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Transcript
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalTab('viral')}
                      className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 ${
                        modalTab === 'viral'
                          ? 'border-indigo-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Why This Goes Viral
                    </button>
                  </div>

                  {/* Tab Panels */}
                  <div className="py-4">
                    {modalTab === 'transcript' && (
                      <div className="p-3.5 rounded-xl bg-[#161926] border border-[#24283B] text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                        {activeClipModal.transcript ||
                          'Audio transcribed with Whisper Subtitles Pro zero-drift engine.'}
                      </div>
                    )}

                    {modalTab === 'viral' && (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Key Hooks
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeClipModal.hooks?.map((hook, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold"
                              >
                                {hook}
                              </span>
                            )) || <span>Curiosity Gap</span>}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            AI Virality Breakdown
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeClipModal.viralityReason ||
                              'High curiosity opening hook followed by rapid punchy insight with strong emotional contrast.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Modal Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#24283B]">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(activeClipModal, e)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#24283B] bg-[#161926] hover:bg-[#1C1F2E] text-xs font-bold text-white transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/clips/${activeClipModal.id}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      <Sliders className="h-4 w-4" />
                      <span>Open in Studio Editor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
