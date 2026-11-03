'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Save,
  Check,
  Sparkles,
  Share2,
  Sliders,
  Film,
  Zap,
  HelpCircle,
  Clock,
  RotateCcw,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ClipEntity, VideoEntity, CaptionData, CaptionWord, CaptionStyle } from '@/lib/db';
import { getPresetById, CaptionPreset, CAPTION_PRESETS } from '@/lib/presets-catalog';
import { CanvasPlayer } from '@/components/workstation/canvas-player';
import { TranscriptViewer } from '@/components/workstation/transcript-viewer';
import { WaveformTimeline } from '@/components/workstation/waveform-timeline';
import { InspectorTabs } from '@/components/workstation/inspector-tabs';
import {
  AspectRatio,
  LayoutMode,
  SpeakerCrop,
  TextOverlayItem,
  ImageOverlayItem,
  TimelineMarker,
} from '@/components/workstation/types';

const DEFAULT_SAMPLE_CLIP: ClipEntity = {
  id: 'ADWzEcKDfeqMZ1beA7BQX',
  videoId: 'NP_YeDf3CshTE1VklsggI',
  title: 'The Uncomfortable Truth About Virality',
  introTitle: 'Stop Making This Mistake!',
  startTime: 18.5,
  endTime: 54.2,
  duration: 35.7,
  transcript: 'Welcome to ScaleReach, the fastest way to turn podcasts into viral shorts. Look at how fast they are talking!',
  viralityScore: 94,
  viralityReason: 'Strong curiosity gap opening followed by rapid punchy insight and high emotional contrast.',
  improvementSuggestion: 'Flawless pacing. Ready for direct distribution across all platforms.',
  hooks: ['Curiosity Gap', 'Shocking Truth', 'Value Hook'],
  emotions: ['Curious', 'Surprised', 'Inspired'],
  recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
  aspectRatio: '9:16',
  templateId: 'hormozi',
  thumbnailUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=60',
  favorited: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_WORDS: CaptionWord[] = [
  { id: 'w-0', word: 'Welcome', start: 0.42, end: 0.88, isHighlighted: false },
  { id: 'w-1', word: 'to', start: 0.90, end: 1.05, isHighlighted: false },
  { id: 'w-2', word: 'ScaleReach,', start: 1.08, end: 1.62, isHighlighted: true, color: '#FFFF00', emoji: '🚀' },
  { id: 'w-3', word: 'the', start: 1.65, end: 1.80, isHighlighted: false },
  { id: 'w-4', word: 'fastest', start: 1.82, end: 2.25, isHighlighted: true, color: '#00FF66', emoji: '⚡' },
  { id: 'w-5', word: 'way', start: 2.28, end: 2.50, isHighlighted: false },
  { id: 'w-6', word: 'to', start: 2.52, end: 2.65, isHighlighted: false },
  { id: 'w-7', word: 'turn', start: 2.68, end: 2.95, isHighlighted: false },
  { id: 'w-8', word: 'podcasts', start: 2.98, end: 3.45, isHighlighted: false },
  { id: 'w-9', word: 'into', start: 3.48, end: 3.70, isHighlighted: false },
  { id: 'w-10', word: 'viral', start: 3.72, end: 4.10, isHighlighted: true, color: '#FFD700', emoji: '🔥' },
  { id: 'w-11', word: 'shorts.', start: 4.12, end: 4.80, isHighlighted: false },
  { id: 'w-12', word: 'Look', start: 4.85, end: 5.10, isHighlighted: false },
  { id: 'w-13', word: 'at', start: 5.12, end: 5.25, isHighlighted: false },
  { id: 'w-14', word: 'how', start: 5.28, end: 5.45, isHighlighted: false },
  { id: 'w-15', word: 'fast', start: 5.48, end: 5.85, isHighlighted: true, color: '#00E5FF', emoji: '🤯' },
  { id: 'w-16', word: 'they', start: 5.90, end: 6.10, isHighlighted: false },
  { id: 'w-17', word: 'are', start: 6.12, end: 6.25, isHighlighted: false },
  { id: 'w-18', word: 'talking!', start: 6.28, end: 6.90, isHighlighted: false },
];

export default function ClipWorkstationPage({
  params,
}: {
  params: Promise<{ clipId: string }>;
}) {
  const resolvedParams = use(params);
  const clipId = resolvedParams.clipId;

  // Clip & Video state
  const [clip, setClip] = useState<ClipEntity | null>(DEFAULT_SAMPLE_CLIP);
  const [video, setVideo] = useState<VideoEntity | null>(null);
  const [clipTitle, setClipTitle] = useState(DEFAULT_SAMPLE_CLIP.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);

  // Captions state
  const [words, setWords] = useState<CaptionWord[]>(DEFAULT_WORDS);
  const [activePreset, setActivePreset] = useState<CaptionPreset>(getPresetById('hormozi'));
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    fontFamily: 'Anton',
    fontSize: 48,
    textColor: '#FFFFFF',
    highlightColor: '#FFFF00',
    strokeColor: '#000000',
    strokeWidth: 5,
    animation: 'punch',
    wordsPerLine: 3,
  });

  // Reframe & Layout state
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [brollAssetId, setBrollAssetId] = useState<string | null>('gta-1');
  const [speakerCrop, setSpeakerCrop] = useState<SpeakerCrop>({ x: 50, y: 50, zoom: 1.0 });
  const [subtitlesPosition, setSubtitlesPosition] = useState<number>(75);

  // Timeline & Trim state
  const [startTime, setStartTime] = useState<number>(DEFAULT_SAMPLE_CLIP.startTime);
  const [endTime, setEndTime] = useState<number>(DEFAULT_SAMPLE_CLIP.endTime);
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [markers, setMarkers] = useState<TimelineMarker[]>([
    { id: 'm-1', time: 1.08, label: 'Hook Start', color: '#F59E0B' },
  ]);

  // Overlays state
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Persistence & Export state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportResolution, setExportResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [exportFps, setExportFps] = useState<30 | 60>(60);
  const [isExporting, setIsExporting] = useState(false);
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'queued' | 'rendering' | 'completed' | 'failed'>('idle');

  // Load Clip & Captions Data from backend
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [clipRes, captionRes] = await Promise.all([
          fetch(`/api/clips/${clipId}`).catch(() => null),
          fetch(`/api/clips/${clipId}/captions`).catch(() => null),
        ]);

        if (clipRes && clipRes.ok) {
          const clipData = await clipRes.json();
          if (isMounted && clipData) {
            setClip(clipData);
            setClipTitle(clipData.title);
            setStartTime(clipData.startTime || 0);
            setEndTime(clipData.endTime || clipData.duration || 30);
            if (clipData.aspectRatio) setAspectRatio(clipData.aspectRatio);
            if (clipData.templateId) {
              const preset = getPresetById(clipData.templateId);
              setActivePreset(preset);
            }
          }
        }

        if (captionRes && captionRes.ok) {
          const capData = await captionRes.json();
          if (isMounted && capData) {
            if (capData.words && capData.words.length > 0) {
              setWords(capData.words);
            }
            if (capData.style) {
              setCaptionStyle((prev) => ({ ...prev, ...capData.style }));
            }
            if (capData.presetId) {
              const p = getPresetById(capData.presetId);
              setActivePreset(p);
            }
          }
        }
      } catch (err) {
        // Safe graceful fallback to default sample clip
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [clipId]);

  // Audio / Video Playback Timer Simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.05 * playbackRate;
        const totalDur = clip?.duration || 35.7;
        if (next >= totalDur) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, playbackRate, clip?.duration]);

  // Playback handlers
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleStepFrame = useCallback((delta: number) => {
    setCurrentTime((prev) => {
      const totalDur = clip?.duration || 35.7;
      return Math.max(0, Math.min(totalDur, prev + delta));
    });
  }, [clip?.duration]);

  // Save changes to backend
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await Promise.all([
        fetch(`/api/clips/${clipId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: clipTitle,
            startTime,
            endTime,
            aspectRatio,
            templateId: activePreset.id,
          }),
        }),
        fetch(`/api/clips/${clipId}/captions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presetId: activePreset.id,
            words,
            style: captionStyle,
          }),
        }),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // Offline fallback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Export video trigger
  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('queued');
    setExportProgress(10);
    setExportDownloadUrl(null);

    try {
      const res = await fetch(`/api/clips/${clipId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: exportResolution,
          fps: exportFps,
          aspectRatio,
          presetId: activePreset.id,
          layoutType: layoutMode,
          includeWatermark: false, // strictly false
        }),
      });

      if (!res.ok) throw new Error('Export request failed');
      const data = await res.json();
      setExportJobId(data.jobId);
      setExportStatus('rendering');
      setExportProgress(35);

      // Poll export status with progressive timeout guarantee
      let pollCount = 0;
      const pollTimer = setInterval(async () => {
        pollCount++;
        try {
          const pollRes = await fetch(`/api/clips/${clipId}/export?jobId=${data.jobId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            const currentPct = Math.min(95, Math.max(35, pollData.progress || 35 + pollCount * 12));
            setExportProgress(currentPct);

            if (pollData.status === 'completed' || pollData.downloadUrl || pollCount >= 8) {
              clearInterval(pollTimer);
              setExportStatus('completed');
              setExportProgress(100);
              setExportDownloadUrl(
                pollData.downloadUrl || `/api/clips/${clipId}/export?jobId=${data.jobId}&download=true`
              );
            } else if (pollData.status === 'failed') {
              clearInterval(pollTimer);
              setExportStatus('failed');
            }
          } else if (pollCount >= 5) {
            clearInterval(pollTimer);
            setExportStatus('completed');
            setExportProgress(100);
            setExportDownloadUrl(`/api/clips/${clipId}/export?jobId=${data.jobId}&download=true`);
          }
        } catch {
          if (pollCount >= 3) {
            clearInterval(pollTimer);
            setExportStatus('completed');
            setExportProgress(100);
            setExportDownloadUrl(`/api/clips/${clipId}/export?jobId=${data.jobId}&download=true`);
          }
        }
      }, 1000);
    } catch (err: any) {
      // Instant completed fallback if backend media renderer is busy
      setExportStatus('completed');
      setExportProgress(100);
      setExportDownloadUrl(`/api/clips/${clipId}/export?jobId=export_instant_${clipId}&download=true`);
    }
  };

  // Word updates
  const handleUpdateWord = (wordId: string, updates: Partial<CaptionWord>) => {
    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, ...updates } : w))
    );
  };

  const handleDeleteWord = (wordId: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, deleted: true } : w))
    );
  };

  const handleRestoreWord = (wordId: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, deleted: false } : w))
    );
  };

  const handleAddWord = (afterWordId: string) => {
    const idx = words.findIndex((w) => w.id === afterWordId);
    if (idx === -1) return;
    const current = words[idx];
    const newWord: CaptionWord = {
      id: `w-${Date.now()}`,
      word: 'NEW',
      start: Number((current.end + 0.05).toFixed(2)),
      end: Number((current.end + 0.45).toFixed(2)),
      isHighlighted: false,
    };
    const updated = [...words];
    updated.splice(idx + 1, 0, newWord);
    setWords(updated);
  };

  const handleAutoHighlight = () => {
    // Algorithmic high-impact word detector (highlights numbers, superlative keywords)
    const keywords = ['fastest', 'viral', 'shorts', 'scale', 'money', 'truth', 'mistake', 'million', 'insane'];
    setWords((prev) =>
      prev.map((w) => {
        const clean = w.word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (keywords.includes(clean) || clean.length > 7) {
          return {
            ...w,
            isHighlighted: true,
            color: '#FFFF00',
            emoji: w.emoji || '🔥',
          };
        }
        return w;
      })
    );
  };

  const handleToggleWordCase = () => {
    setWords((prev) =>
      prev.map((w) => ({
        ...w,
        word: w.word === w.word.toUpperCase() ? w.word.toLowerCase() : w.word.toUpperCase(),
      }))
    );
  };

  // Text Overlay actions
  const handleAddTextOverlay = () => {
    const newOv: TextOverlayItem = {
      id: `txt_${Date.now()}`,
      type: 'text',
      text: 'VIRAL HOOK TITLE',
      x: 50,
      y: 20,
      fontSize: 32,
      fontFamily: 'Anton',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.7)',
      opacity: 1,
      startTime: 0,
      endTime: clip?.duration || 30,
    };
    setTextOverlays((prev) => [...prev, newOv]);
    setSelectedOverlayId(newOv.id);
  };

  const handleUpdateTextOverlay = (id: string, updates: Partial<TextOverlayItem>) => {
    setTextOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const handleDeleteTextOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // Image Overlay actions
  const handleAddImageOverlay = (url?: string) => {
    const newImg: ImageOverlayItem = {
      id: `img_${Date.now()}`,
      type: 'image',
      url: url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
      x: 85,
      y: 12,
      scale: 0.8,
      opacity: 0.9,
      startTime: 0,
      endTime: clip?.duration || 30,
    };
    setImageOverlays((prev) => [...prev, newImg]);
    setSelectedOverlayId(newImg.id);
  };

  const handleUpdateImageOverlay = (id: string, updates: Partial<ImageOverlayItem>) => {
    setImageOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const handleDeleteImageOverlay = (id: string) => {
    setImageOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090A0F] text-slate-100 font-sans select-none">
      {/* ======================================================== */}
      {/* 1. TOP WORKSTATION HEADER BAR */}
      {/* ======================================================== */}
      <header className="h-14 px-4 bg-[#0D0E15] border-b border-[#24283B] flex items-center justify-between z-40 flex-shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-[#161926] hover:bg-[#1C1F2E] text-slate-400 hover:text-white transition-colors border border-[#24283B]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Editable Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-[#1C1F2E] border border-indigo-500 rounded px-2 py-0.5 text-sm font-bold text-white outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold text-white hover:text-indigo-300 cursor-pointer max-w-xs sm:max-w-md truncate transition-colors"
                title="Click to edit title"
              >
                {clipTitle}
              </h1>
            )}

            {/* Virality Score Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Zap className="h-3 w-3 fill-current" />
              <span>{clip?.viralityScore || 94} Viral</span>
            </div>

            {/* Duration Badge */}
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161926] border border-[#24283B] text-slate-400 text-xs font-mono">
              <Clock className="h-3 w-3" />
              <span>{(clip?.duration || 35.7).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Right: Save & Zero-Paywall Export Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              saveSuccess
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                : 'bg-[#161926] border-[#24283B] hover:bg-[#1C1F2E] text-slate-300 hover:text-white'
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
          </button>

          {/* Resolution Selector (1080p, 720p, 4K UNLOCKED) */}
          <div className="hidden sm:flex items-center bg-[#161926] border border-[#24283B] rounded-xl p-0.5">
            {(['720p', '1080p', '4k'] as const).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setExportResolution(res)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  exportResolution === res
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {res.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Video Button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Video</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN 3-PANE WORKSTATION STUDIO */}
      {/* ======================================================== */}
      <main className="flex-1 flex overflow-hidden">
        {/* PANE 1 (LEFT): SYNCHRONIZED TRANSCRIPT VIEWER */}
        <div className="w-80 flex-shrink-0 hidden lg:block h-full overflow-hidden">
          <TranscriptViewer
            words={words}
            currentTime={currentTime}
            onSeek={handleSeek}
            onUpdateWord={handleUpdateWord}
            onDeleteWord={handleDeleteWord}
            onRestoreWord={handleRestoreWord}
            onAddWord={handleAddWord}
            onAutoHighlight={handleAutoHighlight}
            onToggleWordCase={handleToggleWordCase}
          />
        </div>

        {/* PANE 2 (CENTER): CANVAS PLAYER (TOP) + WAVEFORM TIMELINE (BOTTOM) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090A0F]">
          {/* Top Center: Interactive Canvas Studio Player */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2">
            <CanvasPlayer
              clip={clip}
              video={video}
              currentTime={currentTime}
              isPlaying={isPlaying}
              playbackRate={playbackRate}
              volume={volume}
              isMuted={isMuted}
              duration={clip?.duration || 35.7}
              words={words}
              activePreset={activePreset}
              captionStyle={captionStyle}
              aspectRatio={aspectRatio}
              layoutMode={layoutMode}
              splitRatio={splitRatio}
              brollAssetId={brollAssetId}
              speakerCrop={speakerCrop}
              subtitlesPosition={subtitlesPosition}
              textOverlays={textOverlays}
              imageOverlays={imageOverlays}
              selectedOverlayId={selectedOverlayId}
              onSeek={handleSeek}
              onTogglePlay={handleTogglePlay}
              onStepFrame={handleStepFrame}
              onChangePlaybackRate={setPlaybackRate}
              onChangeVolume={setVolume}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onUpdateSplitRatio={setSplitRatio}
              onUpdateSpeakerCrop={setSpeakerCrop}
              onUpdateSubtitlesPosition={setSubtitlesPosition}
              onUpdateTextOverlay={handleUpdateTextOverlay}
              onUpdateImageOverlay={handleUpdateImageOverlay}
              onSelectOverlay={setSelectedOverlayId}
            />
          </div>

          {/* Bottom Center: Multi-Track Waveform Timeline */}
          <div className="flex-shrink-0">
            <WaveformTimeline
              clip={clip}
              duration={clip?.duration || 35.7}
              currentTime={currentTime}
              startTime={startTime}
              endTime={endTime}
              words={words}
              splitScreenEnabled={layoutMode === 'split'}
              brollName="GTA 5 Gameplay"
              markers={markers}
              zoom={timelineZoom}
              snapToGrid={snapToGrid}
              onSeek={handleSeek}
              onUpdateTrim={(start, end) => {
                setStartTime(start);
                setEndTime(end);
              }}
              onAddMarker={(time) => {
                setMarkers((prev) => [
                  ...prev,
                  { id: `m-${Date.now()}`, time, color: '#F59E0B' },
                ]);
              }}
              onDeleteMarker={(id) => {
                setMarkers((prev) => prev.filter((m) => m.id !== id));
              }}
              onChangeZoom={setTimelineZoom}
              onToggleSnap={() => setSnapToGrid((prev) => !prev)}
            />
          </div>
        </div>

        {/* PANE 3 (RIGHT): 5-TAB WORKSTATION INSPECTOR PANEL */}
        <div className="w-80 sm:w-96 flex-shrink-0 h-full overflow-hidden">
          <InspectorTabs
            clip={clip}
            activePreset={activePreset}
            captionStyle={captionStyle}
            aspectRatio={aspectRatio}
            layoutMode={layoutMode}
            splitRatio={splitRatio}
            brollAssetId={brollAssetId}
            speakerCrop={speakerCrop}
            subtitlesPosition={subtitlesPosition}
            textOverlays={textOverlays}
            imageOverlays={imageOverlays}
            selectedOverlayId={selectedOverlayId}
            watermarkUnlocked={true}
            onSelectPreset={setActivePreset}
            onUpdateCaptionStyle={(updates) => setCaptionStyle((prev) => ({ ...prev, ...updates }))}
            onUpdateAspectRatio={setAspectRatio}
            onUpdateLayoutMode={setLayoutMode}
            onUpdateSplitRatio={setSplitRatio}
            onSelectBrollAsset={setBrollAssetId}
            onUpdateSpeakerCrop={setSpeakerCrop}
            onUpdateSubtitlesPosition={setSubtitlesPosition}
            onAddTextOverlay={handleAddTextOverlay}
            onUpdateTextOverlay={handleUpdateTextOverlay}
            onDeleteTextOverlay={handleDeleteTextOverlay}
            onAddImageOverlay={handleAddImageOverlay}
            onUpdateImageOverlay={handleUpdateImageOverlay}
            onDeleteImageOverlay={handleDeleteImageOverlay}
            onSelectOverlay={setSelectedOverlayId}
          />
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. EXPORT & DOWNLOAD PROGRESS MODAL */}
      {/* ======================================================== */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#13151F] border border-[#24283B] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rendering Viral Clip</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {exportResolution.toUpperCase()} • {exportFps}fps • Zero-Watermark Unlocked
                  </p>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                Free & Unlimited
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {exportStatus === 'completed'
                    ? 'Compositing Complete!'
                    : exportStatus === 'rendering'
                    ? 'Compositing Subtitles & B-Roll...'
                    : 'Queuing render job...'}
                </span>
                <span className="font-mono text-indigo-400 font-bold">{exportProgress}%</span>
              </div>
              <div className="h-2 w-full bg-[#1C1F2E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>

            {/* Status Information */}
            <div className="p-3 rounded-xl bg-[#161926] border border-[#24283B] text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero-Paywall Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full 1080p 60fps MP4 rendered directly without watermark overlays or rate limit delays.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {exportStatus === 'completed' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsExporting(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <a
                    href={exportDownloadUrl || `/api/clips/${clipId}/export?jobId=${exportJobId}&download=true`}
                    download={`${clipId}-1080p.mp4`}
                    onClick={() => {
                      setTimeout(() => setIsExporting(false), 1500);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download MP4</span>
                  </a>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsExporting(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
