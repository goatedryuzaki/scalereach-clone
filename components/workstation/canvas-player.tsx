'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Move,
  Type,
  Image as ImageIcon,
  Crop,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CaptionPreset, getPresetById } from '@/lib/presets-catalog';
import { CaptionWord, CaptionStyle, VideoEntity, ClipEntity } from '@/lib/db';
import { BROLL_CATEGORIES, BRollItem } from '@/lib/broll-catalog';
import { AspectRatio, LayoutMode, SpeakerCrop, TextOverlayItem, ImageOverlayItem } from './types';

interface CanvasPlayerProps {
  clip: ClipEntity | null;
  video: VideoEntity | null;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  duration: number;
  words: CaptionWord[];
  activePreset: CaptionPreset;
  captionStyle: CaptionStyle;
  aspectRatio: AspectRatio;
  layoutMode: LayoutMode;
  splitRatio: number;
  brollAssetId: string | null;
  speakerCrop: SpeakerCrop;
  subtitlesPosition: number;
  textOverlays: TextOverlayItem[];
  imageOverlays: ImageOverlayItem[];
  selectedOverlayId: string | null;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onStepFrame: (deltaSeconds: number) => void;
  onChangePlaybackRate: (rate: number) => void;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  onUpdateSplitRatio: (ratio: number) => void;
  onUpdateSpeakerCrop: (crop: SpeakerCrop) => void;
  onUpdateSubtitlesPosition: (pos: number) => void;
  onUpdateTextOverlay: (id: string, updates: Partial<TextOverlayItem>) => void;
  onUpdateImageOverlay: (id: string, updates: Partial<ImageOverlayItem>) => void;
  onSelectOverlay: (id: string | null) => void;
}

export function CanvasPlayer({
  clip,
  video,
  currentTime,
  isPlaying,
  playbackRate,
  volume,
  isMuted,
  duration,
  words,
  activePreset,
  captionStyle,
  aspectRatio,
  layoutMode,
  splitRatio,
  brollAssetId,
  speakerCrop,
  subtitlesPosition,
  textOverlays,
  imageOverlays,
  selectedOverlayId,
  onSeek,
  onTogglePlay,
  onStepFrame,
  onChangePlaybackRate,
  onChangeVolume,
  onToggleMute,
  onUpdateSplitRatio,
  onUpdateSpeakerCrop,
  onUpdateSubtitlesPosition,
  onUpdateTextOverlay,
  onUpdateImageOverlay,
  onSelectOverlay,
}: CanvasPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFacecamGuide, setShowFacecamGuide] = useState(false);
  const [showSubtitlesGuide, setShowSubtitlesGuide] = useState(false);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isDraggingSubtitles, setIsDraggingSubtitles] = useState(false);
  const [isDraggingFacecam, setIsDraggingFacecam] = useState(false);
  const [dragOverlayId, setDragOverlayId] = useState<string | null>(null);

  // Fallback video source
  const videoSrc = video?.filePath || video?.sourceUrl || '/sample-video.mp4';
  const posterSrc = clip?.thumbnailUrl || video?.thumbnailUrl || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60';

  // Find active B-roll asset
  let activeBroll: BRollItem | undefined;
  if (brollAssetId) {
    for (const cat of BROLL_CATEGORIES) {
      const match = cat.items.find((item) => item.id === brollAssetId);
      if (match) {
        activeBroll = match;
        break;
      }
    }
  }

  // Format time display
  const formatTimecode = (seconds: number) => {
    const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
    const mins = Math.floor(safeSec / 60);
    const secs = Math.floor(safeSec % 60);
    const ms = Math.floor((safeSec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Synchronize HTML5 video with state
  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    if (Math.abs(v.currentTime - currentTime) > 0.3) {
      v.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    if (isPlaying) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts: Space for play/pause, Left/Right for scrub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onStepFrame(e.shiftKey ? -1 : -0.1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onStepFrame(e.shiftKey ? 1 : 0.1);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        onStepFrame(-1);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        onStepFrame(1);
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onStepFrame]);

  // Compute Active Words for Caption Display
  const getActiveWords = useCallback((): {
    displayWords: CaptionWord[];
    activeWordIndex: number;
  } => {
    if (!words || words.length === 0) return { displayWords: [], activeWordIndex: -1 };

    // Find active word
    const currentIndex = words.findIndex(
      (w) => !w.deleted && currentTime >= w.start && currentTime <= w.end
    );

    // If no exact match, find nearest previous or upcoming word
    let targetIndex = currentIndex;
    if (targetIndex === -1) {
      targetIndex = words.findIndex((w) => !w.deleted && w.start > currentTime);
      if (targetIndex > 0) targetIndex -= 1;
      else if (targetIndex === -1) targetIndex = words.length - 1;
    }

    const wordsPerLine = captionStyle.wordsPerLine || activePreset.wordsPerLine || 3;
    // Chunk words around targetIndex
    const startIdx = Math.max(0, Math.floor(targetIndex / wordsPerLine) * wordsPerLine);
    const endIdx = Math.min(words.length, startIdx + wordsPerLine);
    const displayWords = words.slice(startIdx, endIdx);
    const activeWordIndex = displayWords.findIndex((w) => w.id === words[targetIndex]?.id);

    return { displayWords, activeWordIndex };
  }, [words, currentTime, captionStyle.wordsPerLine, activePreset.wordsPerLine]);

  const { displayWords, activeWordIndex } = getActiveWords();

  // Mouse drag handlers for Split-Screen Divider
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  // Mouse drag handlers for Subtitles Vertical Position
  const handleSubtitlesMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSubtitles(true);
  };

  // Mouse drag handlers for Facecam Position
  const handleFacecamMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingFacecam(true);
  };

  // Mouse move and up global listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isDraggingDivider) {
        const relativeY = e.clientY - rect.top;
        const newRatio = Math.round((relativeY / rect.height) * 100);
        const clamped = Math.max(25, Math.min(75, newRatio));
        onUpdateSplitRatio(clamped);
      } else if (isDraggingSubtitles) {
        const relativeY = e.clientY - rect.top;
        const newPos = Math.round((relativeY / rect.height) * 100);
        const clamped = Math.max(10, Math.min(90, newPos));
        onUpdateSubtitlesPosition(clamped);
      } else if (isDraggingFacecam) {
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        const newX = Math.round((relativeX / rect.width) * 100);
        const newY = Math.round((relativeY / rect.height) * 100);
        onUpdateSpeakerCrop({
          ...speakerCrop,
          x: Math.max(10, Math.min(90, newX)),
          y: Math.max(10, Math.min(90, newY)),
        });
      } else if (dragOverlayId) {
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        const newX = Math.round((relativeX / rect.width) * 100);
        const newY = Math.round((relativeY / rect.height) * 100);

        const textItem = textOverlays.find((o) => o.id === dragOverlayId);
        if (textItem) {
          onUpdateTextOverlay(dragOverlayId, {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY)),
          });
        }
        const imgItem = imageOverlays.find((o) => o.id === dragOverlayId);
        if (imgItem) {
          onUpdateImageOverlay(dragOverlayId, {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY)),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      setIsDraggingSubtitles(false);
      setIsDraggingFacecam(false);
      setDragOverlayId(null);
    };

    if (isDraggingDivider || isDraggingSubtitles || isDraggingFacecam || dragOverlayId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDraggingDivider,
    isDraggingSubtitles,
    isDraggingFacecam,
    dragOverlayId,
    onUpdateSplitRatio,
    onUpdateSubtitlesPosition,
    onUpdateSpeakerCrop,
    speakerCrop,
    textOverlays,
    imageOverlays,
    onUpdateTextOverlay,
    onUpdateImageOverlay,
  ]);

  // Aspect ratio class container
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'w-full max-w-3xl aspect-[16/9]';
      case '1:1':
        return 'w-full max-w-lg aspect-square';
      case '9:16':
      default:
        return 'w-full max-w-[360px] aspect-[9/16]';
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-between bg-[#090A0F] p-4 select-none">
      {/* Studio Monitor Top Bar */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#161926] border border-[#24283B] text-slate-300 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            WYSIWYG 9:16 Canvas
          </span>
          <span className="hidden sm:inline-block text-slate-500">•</span>
          <span className="hidden sm:inline-block text-slate-400 font-medium">
            Preset: <span className="text-indigo-400">{activePreset.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Overlay Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowFacecamGuide(!showFacecamGuide)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              showFacecamGuide
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Speaker Facecam Boundary Box"
          >
            <Crop className="h-3 w-3" />
            <span className="hidden md:inline">Facecam Box</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSubtitlesGuide(!showSubtitlesGuide)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              showSubtitlesGuide
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Subtitle Safe Zone Box"
          >
            <Type className="h-3 w-3" />
            <span className="hidden md:inline">Subtitle Guide</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div
        ref={containerRef}
        className={`relative ${getAspectRatioClasses()} rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/80 border border-[#24283B] flex items-center justify-center`}
      >
        {/* LAYOUT 1: SINGLE SPEAKER */}
        {layoutMode === 'single' && (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Native Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-75"
              style={{
                transform: `scale(${speakerCrop.zoom}) translate(${50 - speakerCrop.x}%, ${50 - speakerCrop.y}%)`,
              }}
              playsInline
              loop
            />

            {/* Interactive Facecam Bounding Box Overlay */}
            {showFacecamGuide && (
              <div
                onMouseDown={handleFacecamMouseDown}
                className="absolute inset-x-8 top-12 bottom-36 border-2 border-dashed border-indigo-500/80 rounded-xl bg-indigo-500/10 cursor-move flex flex-col items-center justify-between p-2 z-20 backdrop-blur-[1px]"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-black/60 px-2 py-0.5 rounded">
                  <Move className="h-3 w-3" /> Facecam Crop Centroid ({speakerCrop.x}%, {speakerCrop.y}%)
                </div>
                <div className="text-[10px] text-indigo-200/80 bg-black/50 px-2 py-0.5 rounded">
                  Drag to adjust speaker face tracking • Zoom: {speakerCrop.zoom.toFixed(1)}x
                </div>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT 2: SPLIT-SCREEN (TOP SPEAKER + BOTTOM GAMEPLAY / ASMR B-ROLL) */}
        {layoutMode === 'split' && (
          <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Top Half: Speaker Video */}
            <div
              className="relative w-full overflow-hidden bg-black flex items-center justify-center"
              style={{ height: `${splitRatio}%` }}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${speakerCrop.zoom}) translate(${50 - speakerCrop.x}%, ${50 - speakerCrop.y}%)`,
                }}
                playsInline
                loop
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 border border-white/10 uppercase tracking-wider">
                Speaker Facecam
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              onMouseDown={handleDividerMouseDown}
              className={`h-2.5 w-full bg-[#1C1F2E] border-y border-indigo-500/50 hover:bg-indigo-600 cursor-row-resize flex items-center justify-center z-30 transition-colors shadow-md ${
                isDraggingDivider ? 'bg-indigo-500 shadow-indigo-500/50 ring-2 ring-indigo-400' : ''
              }`}
            >
              <div className="h-1 w-8 rounded-full bg-slate-300 opacity-80" />
            </div>

            {/* Bottom Half: B-Roll Gameplay / ASMR Asset */}
            <div
              className="relative w-full overflow-hidden bg-[#13151F] flex items-center justify-center"
              style={{ height: `${100 - splitRatio}%` }}
            >
              {activeBroll ? (
                <div className="relative w-full h-full">
                  {/* Video or Animated Preview */}
                  <img
                    src={activeBroll.preview}
                    alt={activeBroll.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback placeholder if asset image missing
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" /> {activeBroll.name} ({activeBroll.category})
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <Layers className="h-6 w-6 mb-1 text-slate-400 opacity-60" />
                  <span className="text-xs font-semibold text-slate-300">GTA 5 / Minecraft B-Roll</span>
                  <span className="text-[10px] text-slate-500">Select asset in Reframe tab</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LAYOUT 3: 25PX GAUSSIAN BLUR FILL */}
        {layoutMode === 'blur_fill' && (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
            {/* Background Layer: Scaled and Gaussian Blurred */}
            <div
              className="absolute inset-0 w-full h-full filter blur-[25px] scale-125 opacity-70"
              style={{
                backgroundImage: `url(${posterSrc})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
            {/* Foreground Letterboxed Video */}
            <div className="relative z-10 w-full aspect-video shadow-2xl border-y border-white/10 overflow-hidden">
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc}
                className="w-full h-full object-contain"
                playsInline
                loop
              />
            </div>
            <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300 border border-white/10 uppercase tracking-wider">
              25px Gaussian Blur Fill
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* KINETIC SUBTITLE OVERLAY LAYER (WYSIWYG & REPOSITIONABLE) */}
        {/* ======================================================== */}
        <div
          onMouseDown={handleSubtitlesMouseDown}
          className={`absolute inset-x-3 flex flex-col items-center justify-center z-25 cursor-move pointer-events-auto transition-all ${
            showSubtitlesGuide || isDraggingSubtitles
              ? 'border-2 border-dashed border-amber-400/80 bg-amber-500/10 rounded-xl py-2 shadow-lg backdrop-blur-[1px]'
              : ''
          }`}
          style={{ top: `${subtitlesPosition}%`, transform: 'translateY(-50%)' }}
        >
          {/* Subtitle Drag Indicator Badge */}
          {(showSubtitlesGuide || isDraggingSubtitles) && (
            <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Move className="h-2.5 w-2.5" /> Subtitle Position: {subtitlesPosition}%
            </div>
          )}

          {/* Subtitle Words Rendering */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 text-center max-w-full">
            {displayWords.length > 0 ? (
              displayWords.map((item, idx) => {
                const isActive = idx === activeWordIndex;
                const isCustomHighlighted = item.isHighlighted;
                const highlightColor = item.color || captionStyle.highlightColor || activePreset.highlightColor;
                const textColor = captionStyle.textColor || activePreset.primaryColor;

                // Build inline styles conforming to preset
                const itemStyle: React.CSSProperties = {
                  fontFamily: captionStyle.fontFamily || activePreset.fontFamily,
                  fontWeight: activePreset.fontWeight || 800,
                  fontSize: `${captionStyle.fontSize || 42}px`,
                  textTransform: (captionStyle.textTransform || activePreset.textTransform || 'uppercase') as any,
                  color: isActive || isCustomHighlighted ? highlightColor : textColor,
                  textDecoration: item.deleted ? 'line-through' : 'none',
                  opacity: item.deleted ? 0.4 : 1,
                  transform: isActive ? `scale(${activePreset.highlightScale || 1.18})` : 'scale(1)',
                  transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.12s ease',
                  WebkitTextStroke: `${captionStyle.strokeWidth || 4}px ${captionStyle.strokeColor || '#000000'}`,
                  paintOrder: 'stroke fill',
                  textShadow: captionStyle.shadowBlur
                    ? `0 0 ${captionStyle.shadowBlur}px ${captionStyle.shadowColor || 'rgba(0,0,0,0.85)'}`
                    : activePreset.shadow || '2px 2px 4px rgba(0,0,0,0.9)',
                };

                return (
                  <span
                    key={item.id}
                    className={`relative inline-flex items-center tracking-tight transition-transform ${
                      isActive ? 'z-10' : 'z-0'
                    }`}
                    style={itemStyle}
                  >
                    {/* Attached Emoji */}
                    {item.emoji && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl filter drop-shadow-md animate-bounce">
                        {item.emoji}
                      </span>
                    )}
                    {item.word}
                  </span>
                );
              })
            ) : (
              <span className="text-white/40 italic text-sm font-semibold tracking-wider uppercase">
                {clip?.transcript ? '...' : 'Subtitles Active'}
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TEXT OVERLAYS LAYER (DRAGGABLE & RESIZABLE) */}
        {/* ======================================================== */}
        {textOverlays
          .filter((ov) => currentTime >= ov.startTime && currentTime <= ov.endTime)
          .map((overlay) => {
            const isSelected = selectedOverlayId === overlay.id;
            return (
              <div
                key={overlay.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onSelectOverlay(overlay.id);
                  setDragOverlayId(overlay.id);
                }}
                className={`absolute cursor-move px-2.5 py-1 rounded-md transition-shadow z-28 select-none ${
                  isSelected
                    ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                    : 'hover:ring-1 hover:ring-white/40'
                }`}
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: overlay.backgroundColor || 'transparent',
                  opacity: overlay.opacity,
                }}
              >
                <span
                  style={{
                    fontFamily: overlay.fontFamily,
                    fontSize: `${overlay.fontSize}px`,
                    color: overlay.color,
                    fontWeight: 800,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                  }}
                >
                  {overlay.text}
                </span>
              </div>
            );
          })}

        {/* ======================================================== */}
        {/* IMAGE OVERLAYS / LOGO LAYER (DRAGGABLE) */}
        {/* ======================================================== */}
        {imageOverlays
          .filter((ov) => currentTime >= ov.startTime && currentTime <= ov.endTime)
          .map((overlay) => {
            const isSelected = selectedOverlayId === overlay.id;
            return (
              <div
                key={overlay.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onSelectOverlay(overlay.id);
                  setDragOverlayId(overlay.id);
                }}
                className={`absolute cursor-move p-1 rounded transition-shadow z-28 select-none ${
                  isSelected
                    ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                    : 'hover:ring-1 hover:ring-white/40'
                }`}
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: `translate(-50%, -50%) scale(${overlay.scale})`,
                  opacity: overlay.opacity,
                }}
              >
                <img
                  src={overlay.url}
                  alt="Overlay Logo"
                  className="max-w-[120px] max-h-[80px] object-contain pointer-events-none drop-shadow-md"
                />
              </div>
            );
          })}
      </div>

      {/* Frame-Accurate Playback Controller Bar */}
      <div className="w-full max-w-3xl mt-3 px-4 py-2.5 rounded-xl bg-[#13151F] border border-[#24283B] flex items-center justify-between text-slate-300 shadow-xl">
        {/* Left: Step Back, Play/Pause, Step Forward */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Step Back 1s */}
          <button
            type="button"
            onClick={() => onStepFrame(-1)}
            className="p-1.5 rounded-lg hover:bg-[#1C1F2E] text-slate-400 hover:text-slate-100 transition-colors"
            title="Step Back 1s (J)"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 transition-transform active:scale-95"
            title="Play / Pause (Space / K)"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>

          {/* Step Forward 1s */}
          <button
            type="button"
            onClick={() => onStepFrame(1)}
            className="p-1.5 rounded-lg hover:bg-[#1C1F2E] text-slate-400 hover:text-slate-100 transition-colors"
            title="Step Forward 1s (L)"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Timecode display */}
          <div className="ml-2 font-mono text-xs sm:text-sm text-slate-300 font-semibold tracking-wider">
            <span className="text-white">{formatTimecode(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTimecode(duration)}</span>
          </div>
        </div>

        {/* Right: Playback Speed, Volume, Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Playback Speed Selector */}
          <div className="flex items-center">
            <select
              value={playbackRate}
              onChange={(e) => onChangePlaybackRate(parseFloat(e.target.value))}
              className="bg-[#1C1F2E] border border-[#24283B] text-slate-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 rounded-lg hover:bg-[#1C1F2E] text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                if (isMuted) onToggleMute();
                onChangeVolume(parseFloat(e.target.value));
              }}
              className="w-14 sm:w-18 accent-indigo-500 h-1 rounded bg-[#24283B] cursor-pointer"
              title="Volume Slider"
            />
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-[#1C1F2E] text-slate-400 hover:text-slate-200 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default CanvasPlayer;
