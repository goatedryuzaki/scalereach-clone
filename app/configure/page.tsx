'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SplitScreenSelector } from '@/components/split-screen-selector';
import { useScaleReachStore } from '@/lib/state-store';
import { CAPTION_PRESETS } from '@/lib/presets-catalog';
import {
  Sparkles,
  Sliders,
  Clock,
  Scissors,
  Layers,
  Flame,
  Check,
  Video,
  ArrowRight,
  HelpCircle,
  Wand2,
  ChevronRight,
  Info,
} from 'lucide-react';

const CLIP_TYPES = [
  { id: 'viral-clips', name: 'Viral Clips', description: 'Highest engagement short clips with immediate hooks and cliffhangers' },
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
  { id: '<30s', label: '< 30s', subtitle: 'Quick punchy TikToks & Shorts' },
  { id: '30s-60s', label: '30s - 60s', subtitle: 'Standard high-retention reel' },
  { id: '60s-90s', label: '60s - 90s', subtitle: 'In-depth tutorial or story' },
  { id: '90s-3m', label: '90s - 3m', subtitle: 'Extended breakdown / FB Reels' },
  { id: 'any', label: 'Any duration', subtitle: 'AI chooses optimal conversational cut' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ConfigurePage() {
  const router = useRouter();
  const {
    activeVideo,
    clipTypes,
    toggleClipType,
    durationOption,
    setDurationOption,
    timeframe,
    setTimeframe,
    customPrompt,
    setCustomPrompt,
    selectedPresetId,
    setSelectedPresetId,
  } = useScaleReachStore();

  const totalDuration = activeVideo?.duration || 480;
  const [startSec, endSec] = timeframe;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, endSec - 3));
    setTimeframe(clamped, endSec);
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.max(startSec + 3, Math.min(val, totalDuration));
    setTimeframe(startSec, clamped);
  };

  const handleChipClick = (chip: string) => {
    if (customPrompt.includes(chip)) return;
    const newPrompt = customPrompt ? `${customPrompt.trim()}, ${chip.toLowerCase()}` : chip;
    setCustomPrompt(newPrompt);
  };

  const handleGenerateClips = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      router.push('/clips/ADWzEcKDfeqMZ1beA7BQX');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Ingestion</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-indigo-400 font-semibold">Clip Configurator</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Configure AI Clipping Pipeline
            </h1>
          </div>

          <button
            type="button"
            onClick={handleGenerateClips}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
          >
            {isGenerating ? (
              <>
                <Wand2 className="h-4 w-4 animate-spin" />
                <span>Processing Video Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Clips</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Video Target Card */}
        {activeVideo && (
          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 rounded-xl bg-[#161926] border border-[#24283B] flex items-center justify-center text-slate-500 overflow-hidden flex-shrink-0">
                <Video className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-0.5">
                  Selected Source Video
                </span>
                <h2 className="font-bold text-sm text-white line-clamp-1">{activeVideo.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Duration: {formatTime(totalDuration)}</span>
                  <span>&bull;</span>
                  <span className="truncate max-w-[260px] text-slate-400 font-mono text-[11px]">
                    {activeVideo.sourceUrl}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold">
                Ready for Analysis
              </span>
            </div>
          </div>
        )}

        {/* 1. Timeframe Trimmer Dual Slider */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Scissors className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Timeframe Trimming Window</h3>
                <p className="text-xs text-slate-400">
                  Select the exact start and end slice of the video for the AI to examine
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/25">
              Window: {formatTime(endSec - startSec)} ({formatTime(startSec)} &rarr; {formatTime(endSec)})
            </div>
          </div>

          {/* Visual Timeline Bar with Range */}
          <div className="relative pt-6 pb-2">
            <div className="h-3 w-full bg-[#090A0F] rounded-full relative overflow-hidden border border-[#24283B]">
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{
                  left: `${(startSec / totalDuration) * 100}%`,
                  width: `${((endSec - startSec) / totalDuration) * 100}%`,
                }}
              />
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Start Marker: <span className="text-indigo-400 font-mono">{formatTime(startSec)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={totalDuration - 3}
                  value={startSec}
                  onChange={(e) => handleStartChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#161926] rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-[#24283B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  End Marker: <span className="text-indigo-400 font-mono">{formatTime(endSec)}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={totalDuration}
                  value={endSec}
                  onChange={(e) => handleEndChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#161926] rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-[#24283B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. 15 Clip Type Categories */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Clip Type Categories (15 Modes)</h3>
                <p className="text-xs text-slate-400">
                  Select one or multiple extraction models to guide hook and retention analysis
                </p>
              </div>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">
              {clipTypes.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CLIP_TYPES.map((cat) => {
              const isSelected = clipTypes.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleClipType(cat.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-[#161926] shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                      : 'border-[#24283B] bg-[#090A0F]/60 hover:border-slate-600 hover:bg-[#161926]/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      {cat.name}
                    </span>
                    <div
                      className={`h-4 w-4 rounded-md flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-[#24283B] bg-[#13151F]'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Duration Selectors & Prompt Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration Selector */}
          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Target Clip Duration</h3>
                <p className="text-xs text-slate-400">Choose preferred short-form duration bounds</p>
              </div>
            </div>

            <div className="space-y-2">
              {DURATION_OPTIONS.map((d) => {
                const isSelected = durationOption === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setDurationOption(d.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-[#161926] ring-1 ring-indigo-500/40 shadow-sm'
                        : 'border-[#24283B] bg-[#090A0F]/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{d.label}</span>
                      <span className="text-[11px] text-slate-400">{d.subtitle}</span>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-[#24283B]'
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom AI Instructions & Quick Chips */}
          <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Wand2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Custom AI Prompt & Focus</h3>
                <p className="text-xs text-slate-400">Give custom instructions for specific themes</p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Focus on pricing strategies, startup fundraising mistakes, or controversial hot takes..."
                rows={3}
                className="w-full rounded-xl bg-[#090A0F] border border-[#24283B] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Quick Prompt Chips (Click to apply):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#161926] hover:bg-[#1C1F2E] border border-[#24283B] hover:border-indigo-500/40 text-slate-300 transition-all active:scale-95 text-left"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Split-Screen Gameplay / ASMR Lower Screen Selector */}
        <SplitScreenSelector />

        {/* 5. Subtitle Style Preset Quick Bar */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Caption Preset Style</h3>
                <p className="text-xs text-slate-400">
                  Select initial typography and animation preset for generated subtitles
                </p>
              </div>
            </div>
            <a
              href="/brand-template/new"
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Browse all 24 presets &rarr;
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {CAPTION_PRESETS.slice(0, 12).map((p) => {
              const isSelected = selectedPresetId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPresetId(p.id)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-[#161926] text-white ring-1 ring-indigo-500/40'
                      : 'border-[#24283B] bg-[#090A0F]/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{p.name}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{p.fontFamily}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
          >
            {isGenerating ? (
              <>
                <Wand2 className="h-4 w-4 animate-spin" />
                <span>Launching Media Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Clips Now</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
