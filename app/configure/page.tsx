'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useScaleReachStore } from '@/lib/state-store';
import { CAPTION_PRESETS, CaptionPreset, getPresetCssStyle } from '@/lib/presets-catalog';
import { BROLL_CATEGORIES, BRollItem } from '@/lib/broll-catalog';
import {
  Sparkles,
  Sliders,
  Clock,
  Layers,
  Flame,
  Check,
  Video,
  ArrowRight,
  ArrowLeft,
  Wand2,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Split,
  Shuffle,
  Music,
  Globe,
  Ratio,
  Compass,
} from 'lucide-react';

const CLIP_TYPES = [
  { id: 'viral-clips', name: 'Viral Clips', description: 'For several high-impact short videos with immediate hooks' },
  { id: 'memorable-phrases', name: 'Memorable Phrases', description: 'Standalone philosophical quotes, punchy aphorisms, and soundbites' },
  { id: 'topic-clips', name: 'Topic Clips', description: 'Complete topical explanations exploring a central theme across the video' },
  { id: 'trailer', name: 'Trailer', description: 'Fast-paced dramatic teaser showcasing highlights and unanswered questions' },
  { id: 'product-ads', name: 'Product Ads', description: 'Pain point -> solution presentation -> direct response call to action' },
  { id: 'testimonial', name: 'Testimonial', description: 'User reviews, transformation stories, and measurable outcome metrics' },
  { id: 'instructions', name: 'Instructions', description: 'Step-by-step actionable walkthrough of a specific skill or process' },
  { id: 'product-features', name: 'Product Features', description: 'Specific feature breakdowns, software/hardware specs, and demos' },
  { id: 'positive-highlights', name: 'Positive Highlights', description: 'Uplifting, encouraging, and enthusiastic milestone wins' },
  { id: 'negative-highlights', name: 'Negative Highlights', description: 'Critiques, mistakes to avoid, cautionary tales, and controversies' },
  { id: 'showcase', name: 'Showcase', description: 'Real-world practical applications and live portfolio demonstrations' },
  { id: 'multi-product-recap', name: 'Multi-Product Recap', description: 'Summarizes lists of multiple reviewed items or tier lists in succession' },
  { id: 'speakers-insights', name: "Speaker's Insights", description: 'Personal founder anecdotes, contrarian views, and industry secrets' },
  { id: 'jokes-memes', name: 'Jokes & Memes', description: 'Detects punchlines, laughter, comedic timing, and humorous fails' },
  { id: 'podcast-jokes', name: 'Podcast Jokes & Memes', description: 'Multi-speaker conversational banter, interruptions, and reaction memes' },
];

const PROMPT_CHIPS = [
  'Controversial takes or hot opinions',
  'Emotional or vulnerable moments',
  'Funny reactions and one-liners',
  'Actionable tips and how-to steps',
  'Surprising facts or plot twists',
];

const DURATION_OPTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: '0-30s', label: '0 - 30s' },
  { id: '30-60s', label: '30 - 60s' },
  { id: '1-2min', label: '1 - 2 min' },
  { id: '2-3min', label: '2 - 3 min' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ConfigureForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFromQuery = searchParams.get('url') || '';

  const {
    activeVideo,
    setActiveVideo,
    selectedPresetId,
    setSelectedPresetId,
    timeframe,
    setTimeframe,
    customPrompt,
    setCustomPrompt,
  } = useScaleReachStore();

  const [targetUrl, setTargetUrl] = useState(urlFromQuery || activeVideo?.sourceUrl || '');
  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    channelName?: string;
    thumbnail: string;
    duration: number;
    platform?: string;
    valid: boolean;
  }>({
    title: activeVideo?.title || 'Online Video',
    channelName: 'Creator',
    thumbnail:
      activeVideo?.thumbnailUrl ||
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60',
    duration: activeVideo?.duration || 214,
    valid: true,
  });

  const [selectedClipType, setSelectedClipType] = useState('viral-clips');
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [enableCaptions, setEnableCaptions] = useState(true);
  const [captionsSlide, setCaptionsSlide] = useState(0);

  const [enableAutoHook, setEnableAutoHook] = useState(true);
  const [enableSmartReframe, setEnableSmartReframe] = useState(true);
  const [enableAiMusic, setEnableAiMusic] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30-60s');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [language, setLanguage] = useState('en');

  // Split Screen
  const [enableSplitScreen, setEnableSplitScreen] = useState(false);
  const [brollCategory, setBrollCategory] = useState('all');
  const [selectedBrollId, setSelectedBrollId] = useState<string | null>(null);
  const [brollSlide, setBrollSlide] = useState(0);
  const [splitRatio, setSplitRatio] = useState(50);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('Processing Video Pipeline...');
  const [error, setError] = useState<string | null>(null);

  // Validate URL on mount if url query is present
  useEffect(() => {
    if (urlFromQuery) {
      setTargetUrl(urlFromQuery);
      fetch(`/api/videos/validate?url=${encodeURIComponent(urlFromQuery)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setVideoInfo({
              title: data.title,
              channelName: data.channelName,
              thumbnail: data.thumbnail,
              duration: data.duration,
              platform: data.platform,
              valid: true,
            });
            setTimeframe(0, data.duration);
          }
        })
        .catch(() => {});
    }
  }, [urlFromQuery, setTimeframe]);

  const totalDuration = videoInfo.duration || 214;
  const [startSec, endSec] = [
    Math.min(timeframe[0], totalDuration - 5),
    Math.min(timeframe[1] || totalDuration, totalDuration),
  ];

  // Presets carousel partitioning: 8 per slide
  const PRESETS_PER_SLIDE = 8;
  const totalPresetSlides = Math.ceil(CAPTION_PRESETS.length / PRESETS_PER_SLIDE);
  const currentPresets = CAPTION_PRESETS.slice(
    captionsSlide * PRESETS_PER_SLIDE,
    (captionsSlide + 1) * PRESETS_PER_SLIDE
  );

  // B-roll items
  const allBrollItems = BROLL_CATEGORIES.flatMap((c) => c.items);
  const filteredBroll =
    brollCategory === 'all'
      ? allBrollItems
      : allBrollItems.filter((item) =>
          item.category.toLowerCase().includes(brollCategory.toLowerCase())
        );

  const BROLL_PER_SLIDE = 8;
  const totalBrollSlides = Math.ceil(filteredBroll.length / BROLL_PER_SLIDE);
  const currentBroll = filteredBroll.slice(
    brollSlide * BROLL_PER_SLIDE,
    (brollSlide + 1) * BROLL_PER_SLIDE
  );

  const handleGenerateClips = async () => {
    setIsGenerating(true);
    setError(null);

    setGeneratingStatus('Fetching video source & audio stream...');
    await new Promise((r) => setTimeout(r, 600));

    setGeneratingStatus('Aligning speech & words with Whisper Subtitles Pro...');
    await new Promise((r) => setTimeout(r, 700));

    setGeneratingStatus('Scoring emotional hooks & virality patterns...');

    try {
      const res = await fetch('/api/videos/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'url',
          videoUrl: targetUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: videoInfo.title,
          thumbnailUrl: videoInfo.thumbnail,
          duration: totalDuration,
          config: {
            clipType: selectedClipType,
            captionTemplateId: selectedPresetId,
            aspectRatio,
            enableCaptions,
            enableSplitScreen,
            splitScreenBgVideoId: selectedBrollId,
            splitRatio,
            timeframeStart: startSec,
            timeframeEnd: endSec,
            customPrompt,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate clips');
      }

      const data = await res.json();
      const videoId = data.videoId || data.video?.id;

      setGeneratingStatus('Clips created! Loading studio...');
      await new Promise((r) => setTimeout(r, 400));

      router.push(`/videos/${videoId}/clips`);
    } catch (err: any) {
      setError(err.message || 'Error generating clips. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-400 font-semibold">Configure</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#24283B] bg-[#13151F] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Video Target Card with Preview */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-32 rounded-xl bg-black border border-[#24283B] overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-white">
                  {formatTime(totalDuration)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Valid URL
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {videoInfo.channelName} • {formatTime(totalDuration)}
                  </span>
                </div>
                <h2 className="font-extrabold text-base text-white line-clamp-1">
                  {videoInfo.title}
                </h2>
                <span className="text-xs text-slate-400 font-mono line-clamp-1 max-w-md mt-0.5">
                  {targetUrl}
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors self-end sm:self-center font-medium"
            >
              Clear video URL
            </Link>
          </div>
        </div>

        {/* 1. CLIP TYPE SECTION */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">Clip Type</h3>
            <p className="text-xs text-slate-400">Choose what kind of clips to generate</p>
          </div>

          <div className="flex items-center gap-2 border-b border-[#24283B] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Prompt
            </button>
          </div>

          {activeTab === 'templates' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CLIP_TYPES.map((t) => {
                const isSelected = selectedClipType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedClipType(t.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-[#161926] shadow-lg ring-1 ring-indigo-500/50'
                        : 'border-[#24283B] bg-[#0E1017] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{t.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400 stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe exactly what hooks or topics you want the AI to clip..."
                className="w-full p-3.5 rounded-xl bg-[#0E1017] border border-[#24283B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-2">
                {PROMPT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomPrompt(chip)}
                    className="px-2.5 py-1 rounded-lg bg-[#161926] border border-[#24283B] text-[11px] text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. CAPTION PRESETS CAROUSEL (ALL 29 STYLES) */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Captions</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  29 Styles
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Add captions to your clips and choose a starting creator style
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCaptions}
                  onChange={(e) => setEnableCaptions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#24283B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative" />
              </label>

              {/* Carousel Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCaptionsSlide((prev) => Math.max(0, prev - 1))}
                  disabled={captionsSlide === 0}
                  className="p-1.5 rounded-lg border border-[#24283B] bg-[#161926] disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
                  title="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono px-1">
                  {captionsSlide + 1} / {totalPresetSlides}
                </span>
                <button
                  type="button"
                  onClick={() => setCaptionsSlide((prev) => Math.min(totalPresetSlides - 1, prev + 1))}
                  disabled={captionsSlide >= totalPresetSlides - 1}
                  className="p-1.5 rounded-lg border border-[#24283B] bg-[#161926] disabled:opacity-30 text-slate-300 hover:text-white transition-colors"
                  title="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Presets Grid for Current Slide */}
          {enableCaptions && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {currentPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const normalStyle = getPresetCssStyle(preset, false);
                const highlightStyle = getPresetCssStyle(preset, true);

                const sampleWords = (preset.sampleText || 'VIRAL CLIPS FAST').split(' ');
                const mainWords = sampleWords.slice(0, Math.max(1, sampleWords.length - 1)).join(' ');
                const highlightWord = sampleWords[sampleWords.length - 1];

                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`group relative flex flex-col rounded-xl border transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-indigo-500 bg-[#161926] shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/60 scale-[1.02]'
                        : 'border-[#24283B] bg-[#0E1017] hover:border-slate-500 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Active Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-20 h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Creator Style / Preset Badge */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-bold text-slate-200">
                      <span>{preset.emoji || '🔥'}</span>
                      <span className="truncate max-w-[80px]">{preset.creatorStyle || preset.name}</span>
                    </div>

                    {/* Preview Simulation Stage */}
                    <div className="relative w-full h-24 flex items-center justify-center bg-gradient-to-b from-[#0D0E15] via-[#11131F] to-[#090A0F] border-b border-[#24283B]/70 p-3 overflow-hidden select-none">
                      <div className="absolute inset-0 bg-[radial-gradient(#24283B_1px,transparent_1px)] [background-size:10px_10px] opacity-40" />

                      {/* Live Styled Caption Rendering */}
                      <div className="relative z-10 text-center flex flex-wrap items-center justify-center gap-1 px-1">
                        <span style={{ ...normalStyle, fontSize: '15px', lineHeight: 1.2 }}>
                          {mainWords}
                        </span>
                        <span
                          style={{
                            ...highlightStyle,
                            fontSize: '15px',
                            lineHeight: 1.2,
                            transform: preset.highlightScale ? `scale(${Math.min(1.15, preset.highlightScale)})` : undefined,
                            display: 'inline-block',
                          }}
                          className="group-hover:animate-spring-pop inline-flex items-center gap-1"
                        >
                          <span>{highlightWord}</span>
                        </span>
                      </div>
                    </div>

                    {/* Preset Footer */}
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {preset.fontFamily}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/brand-template/new"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Fine-tune in Brand Studio</span>
              <ChevronRight className="h-3 w-3" />
            </Link>

            <span className="text-[11px] text-slate-400">
              Selected:{' '}
              <span className="text-white font-bold">
                {CAPTION_PRESETS.find((p) => p.id === selectedPresetId)?.name || 'Classic'}
              </span>
            </span>
          </div>
        </div>

        {/* 3. AI ENHANCEMENTS (HOOK, REFRAME, MUSIC) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-white">Auto Hook</span>
                <Flame className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                AI hook title banner at the top of every clip
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableAutoHook}
              onChange={(e) => setEnableAutoHook(e.target.checked)}
              className="h-4 w-4 rounded border-[#24283B] text-indigo-600 focus:ring-0"
            />
          </div>

          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-white">Smart AI Reframing</span>
                <Scissors className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Automatic 9:16 face tracking & speaker crop
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableSmartReframe}
              onChange={(e) => setEnableSmartReframe(e.target.checked)}
              className="h-4 w-4 rounded border-[#24283B] text-indigo-600 focus:ring-0"
            />
          </div>

          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-white">AI Background Music</span>
                <Music className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Adaptive background soundtrack under speech
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableAiMusic}
              onChange={(e) => setEnableAiMusic(e.target.checked)}
              className="h-4 w-4 rounded border-[#24283B] text-indigo-600 focus:ring-0"
            />
          </div>
        </div>

        {/* 4. DURATION & ASPECT RATIO */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-bold text-white block mb-2">Clip Duration</span>
              <div className="grid grid-cols-5 gap-1.5">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDuration(d.id)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-colors ${
                      selectedDuration === d.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#161926] text-slate-400 hover:text-white border border-[#24283B]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-white block mb-2">Aspect Ratio</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 text-center rounded-lg text-xs font-bold transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#161926] text-slate-400 hover:text-white border border-[#24283B]'
                    }`}
                  >
                    {ratio === '9:16' ? '9:16 Portrait' : ratio === '16:9' ? '16:9 Landscape' : '1:1 Square'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-white block mb-2">Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-[#161926] border border-[#24283B] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="auto">Auto-Detect</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. TIMEFRAME TRIMMER */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Processing Timeframe
              </h3>
              <p className="text-xs text-slate-400">Select which part of the video to process</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              Processing {formatTime(endSec - startSec)} of {formatTime(totalDuration)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-12 font-mono">{formatTime(startSec)}</span>
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={endSec}
                onChange={(e) => setTimeframe(startSec, Math.max(startSec + 5, Number(e.target.value)))}
                className="w-full h-1.5 bg-[#24283B] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs text-slate-400 w-12 font-mono text-right">
                {formatTime(endSec)}
              </span>
            </div>
          </div>
        </div>

        {/* 6. LAYOUT & SPLIT SCREEN (B-ROLL PREVIEWS) */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Split Screen</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  100% Free Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Add engaging background videos like Subway Surfers, GTA 5, and Minecraft to boost retention
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSplitScreen}
                onChange={(e) => setEnableSplitScreen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-[#24283B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative" />
            </label>
          </div>

          {enableSplitScreen && (
            <div className="space-y-4 pt-2 border-t border-[#24283B]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['all', 'GTA 5', 'Minecraft', 'Subway Surfers', 'ASMR'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setBrollCategory(cat);
                        setBrollSlide(0);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        brollCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#161926] text-slate-400 hover:text-white border border-[#24283B]'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBrollSlide((p) => Math.max(0, p - 1))}
                    disabled={brollSlide === 0}
                    className="p-1 rounded-lg border border-[#24283B] bg-[#161926] disabled:opacity-30 text-slate-300"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {brollSlide + 1} / {Math.max(1, totalBrollSlides)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBrollSlide((p) => Math.min(totalBrollSlides - 1, p + 1))}
                    disabled={brollSlide >= totalBrollSlides - 1}
                    className="p-1 rounded-lg border border-[#24283B] bg-[#161926] disabled:opacity-30 text-slate-300"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* B-roll cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentBroll.map((item) => {
                  const isSelected = selectedBrollId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedBrollId(isSelected ? null : item.id)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-[#161926] ring-2 ring-indigo-500/50 scale-[1.02]'
                          : 'border-[#24283B] bg-[#0E1017] hover:border-slate-500'
                      }`}
                    >
                      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                        <img
                          src={item.preview}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[11px] font-bold text-white text-center p-1">
                          {item.name}
                        </div>
                      </div>
                      <div className="p-2 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300 truncate">{item.name}</span>
                        <span className="text-slate-500 text-[10px]">{item.duration}s</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Split Ratio Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">
                    Split Ratio: <span className="font-bold text-white">{splitRatio}% Main Video / {100 - splitRatio}% Background</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={70}
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#24283B] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SUBMIT ACTION BAR */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#24283B]">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span>
              All clips will be generated locally in 1080p vertical 9:16 format with zero watermarks.
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerateClips}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
          >
            {isGenerating ? (
              <>
                <Wand2 className="h-4 w-4 animate-spin" />
                <span>{generatingStatus}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Get Clips</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex items-center justify-center">
          <Wand2 className="h-6 w-6 text-indigo-400 animate-spin" />
        </div>
      }
    >
      <ConfigureForm />
    </Suspense>
  );
}
