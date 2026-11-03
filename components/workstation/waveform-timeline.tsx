'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Bookmark,
  Magnet,
  Scissors,
  Layers,
  Film,
  Music,
  Type,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { CaptionWord, ClipEntity } from '@/lib/db';
import { TimelineMarker } from './types';

interface WaveformTimelineProps {
  clip: ClipEntity | null;
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  words: CaptionWord[];
  splitScreenEnabled: boolean;
  brollName?: string;
  markers: TimelineMarker[];
  zoom: number; // 0.5 to 6.0
  snapToGrid: boolean;
  onSeek: (time: number) => void;
  onUpdateTrim: (startTime: number, endTime: number) => void;
  onAddMarker: (time: number) => void;
  onDeleteMarker: (markerId: string) => void;
  onChangeZoom: (zoom: number) => void;
  onToggleSnap: () => void;
}

export function WaveformTimeline({
  clip,
  duration,
  currentTime,
  startTime,
  endTime,
  words,
  splitScreenEnabled,
  brollName,
  markers,
  zoom,
  snapToGrid,
  onSeek,
  onUpdateTrim,
  onAddMarker,
  onDeleteMarker,
  onChangeZoom,
  onToggleSnap,
}: WaveformTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingTrim, setDraggingTrim] = useState<'start' | 'end' | null>(null);

  // Safe duration calculation
  const totalDuration = Math.max(1, duration || clip?.duration || 30);

  // Base pixels per second (scales with zoom factor 0.5x to 6.0x)
  // At zoom 1.0, 1 second = 30px
  const pixelsPerSecond = 32 * zoom;
  const timelineContentWidth = Math.max(800, totalDuration * pixelsPerSecond);

  // Format time (mm:ss.ms)
  const formatTimecode = (seconds: number) => {
    const s = Math.max(0, isNaN(seconds) ? 0 : seconds);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  // Nearest snap calculation
  const getSnappedTime = useCallback(
    (targetTime: number): number => {
      if (!snapToGrid) return targetTime;
      // Find nearest word boundary within 0.3s
      let nearest = targetTime;
      let minDiff = 0.3;

      for (const w of words) {
        const diffStart = Math.abs(w.start - targetTime);
        if (diffStart < minDiff) {
          minDiff = diffStart;
          nearest = w.start;
        }
        const diffEnd = Math.abs(w.end - targetTime);
        if (diffEnd < minDiff) {
          minDiff = diffEnd;
          nearest = w.end;
        }
      }

      // Also check 0.5s grid
      const gridTime = Math.round(targetTime * 2) / 2;
      if (Math.abs(gridTime - targetTime) < minDiff) {
        nearest = gridTime;
      }

      return Math.max(0, Math.min(totalDuration, nearest));
    },
    [snapToGrid, words, totalDuration]
  );

  // Render Synthetic Audio Waveform onto HTML5 Canvas
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = timelineContentWidth;
    const height = 48; // Track height

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw baseline center divider
    const centerY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Procedural deterministic speech amplitude bars
    // Generates high amplitude during words, subtle ambient noise in between
    const barWidth = 3;
    const barGap = 1.5;
    const totalBars = Math.floor(width / (barWidth + barGap));

    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + barGap);
      const timeAtBar = (x / width) * totalDuration;

      // Check if bar falls inside any spoken word
      const isWordActive = words.some(
        (w) => !w.deleted && timeAtBar >= w.start && timeAtBar <= w.end
      );

      // Amplitude formula combining word speech + sinusoidal modulation
      let amp = 0.15;
      if (isWordActive) {
        const seed = Math.sin(timeAtBar * 18) * Math.cos(timeAtBar * 31);
        amp = 0.45 + Math.abs(seed) * 0.5;
      } else {
        amp = 0.08 + Math.abs(Math.sin(timeAtBar * 7)) * 0.08;
      }

      const barHeight = Math.max(3, amp * (height - 6));
      const topY = centerY - barHeight / 2;

      // Color gradient: Indigo to Violet for active speech
      const isPastPlayhead = timeAtBar <= currentTime;
      if (isPastPlayhead) {
        ctx.fillStyle = isWordActive ? '#818CF8' : '#4F46E5';
      } else {
        ctx.fillStyle = isWordActive ? '#6366F1' : 'rgba(99, 102, 241, 0.35)';
      }

      ctx.beginPath();
      ctx.roundRect(x, topY, barWidth, barHeight, 1.5);
      ctx.fill();
    }
  }, [timelineContentWidth, totalDuration, words, currentTime]);

  // Timeline Mouse Click & Scrubbing
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.trim-handle')) {
      return; // Handled by trim handles
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = containerRef.current?.scrollLeft || 0;
    const clickX = e.clientX - rect.left + scrollLeft;
    const clickedTime = (clickX / timelineContentWidth) * totalDuration;
    const snapped = getSnappedTime(clickedTime);
    onSeek(snapped);
    setIsScrubbing(true);
  };

  // Mouse Move & Up Listeners for Scrubbing and Trimming
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const mouseX = e.clientX - rect.left + scrollLeft;
      const targetTime = Math.max(0, Math.min(totalDuration, (mouseX / timelineContentWidth) * totalDuration));
      const snapped = getSnappedTime(targetTime);

      if (isScrubbing) {
        onSeek(snapped);
      } else if (draggingTrim === 'start') {
        const safeStart = Math.min(snapped, endTime - 1);
        onUpdateTrim(safeStart, endTime);
      } else if (draggingTrim === 'end') {
        const safeEnd = Math.max(snapped, startTime + 1);
        onUpdateTrim(startTime, safeEnd);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingTrim(null);
    };

    if (isScrubbing || draggingTrim) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbing,
    draggingTrim,
    timelineContentWidth,
    totalDuration,
    getSnappedTime,
    onSeek,
    onUpdateTrim,
    startTime,
    endTime,
  ]);

  // Keyboard shortcut: 'M' for drop marker, 'S' for toggle snap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onAddMarker(currentTime);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onToggleSnap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, onAddMarker, onToggleSnap]);

  // Compute positions
  const playheadX = (currentTime / totalDuration) * timelineContentWidth;
  const startTrimX = (startTime / totalDuration) * timelineContentWidth;
  const endTrimX = (endTime / totalDuration) * timelineContentWidth;

  // Generate ruler tick marks
  const renderRulerTicks = () => {
    const ticks: React.ReactNode[] = [];
    // Determine tick interval based on zoom
    const interval = zoom >= 3 ? 1 : zoom >= 1.5 ? 2 : 5;
    const totalTicks = Math.ceil(totalDuration / interval);

    for (let i = 0; i <= totalTicks; i++) {
      const sec = i * interval;
      if (sec > totalDuration) break;
      const x = (sec / totalDuration) * timelineContentWidth;

      ticks.push(
        <div
          key={`tick-${sec}`}
          className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
          style={{ left: `${x}px` }}
        >
          <span className="text-[9px] font-mono font-medium text-slate-500 pl-1">
            {formatTimecode(sec)}
          </span>
          <div className="h-2 w-[1px] bg-white/20" />
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="w-full bg-[#0D0E15] border-t border-[#24283B] flex flex-col select-none">
      {/* Timeline Controls & Tools Bar */}
      <div className="h-10 px-4 bg-[#13151F] border-b border-[#24283B] flex items-center justify-between text-xs text-slate-400">
        {/* Left: Tracks Info & Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Scissors className="h-3.5 w-3.5 text-indigo-400" />
            <span>Multi-Track Timeline</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <span>Trim Range:</span>
            <span className="text-emerald-400 font-semibold">{formatTimecode(startTime)}</span>
            <span>→</span>
            <span className="text-emerald-400 font-semibold">{formatTimecode(endTime)}</span>
            <span className="text-slate-500">({(endTime - startTime).toFixed(1)}s)</span>
          </div>
        </div>

        {/* Right: Zoom & Snap Controls */}
        <div className="flex items-center gap-2">
          {/* Add Marker Tool */}
          <button
            type="button"
            onClick={() => onAddMarker(currentTime)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C1F2E] hover:bg-[#24283B] text-slate-300 text-[11px] font-medium transition-colors"
            title="Add Bookmark Marker at Playhead (M)"
          >
            <Bookmark className="h-3 w-3 text-amber-400" />
            <span className="hidden md:inline">Marker (M)</span>
          </button>

          {/* Snap-to-Grid Toggle */}
          <button
            type="button"
            onClick={onToggleSnap}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              snapToGrid
                ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-[#1C1F2E] text-slate-400 hover:text-slate-200'
            }`}
            title="Snap playhead & trim to word boundaries (S)"
          >
            <Magnet className="h-3 w-3" />
            <span className="hidden md:inline">Snap ({snapToGrid ? 'ON' : 'OFF'})</span>
          </button>

          <div className="h-4 w-[1px] bg-[#24283B] mx-1" />

          {/* Zoom Slider & Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChangeZoom(Math.max(0.5, zoom - 0.5))}
              className="p-1 rounded hover:bg-[#1C1F2E] text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-300 w-8 text-center font-medium">
              {zoom.toFixed(1)}x
            </span>
            <button
              type="button"
              onClick={() => onChangeZoom(Math.min(6.0, zoom + 0.5))}
              className="p-1 rounded hover:bg-[#1C1F2E] text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Track Canvas & Timeline Body */}
      <div
        ref={containerRef}
        onMouseDown={handleTimelineMouseDown}
        className="relative h-48 overflow-x-auto overflow-y-hidden bg-[#0A0B10] cursor-crosshair scrollbar-thin scrollbar-thumb-slate-700"
      >
        <div
          className="relative h-full"
          style={{ width: `${timelineContentWidth}px` }}
        >
          {/* 1. Timecode Ruler Header */}
          <div className="h-6 w-full border-b border-[#24283B] bg-[#11131C] relative">
            {renderRulerTicks()}

            {/* Bookmark Markers along ruler */}
            {markers.map((marker) => {
              const markerX = (marker.time / totalDuration) * timelineContentWidth;
              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(marker.time);
                  }}
                  className="absolute top-0 bottom-0 z-40 group cursor-pointer"
                  style={{ left: `${markerX}px` }}
                >
                  <div className="h-4 w-4 -ml-2 rounded-sm bg-amber-500 text-black flex items-center justify-center text-[9px] font-bold shadow-md hover:scale-125 transition-transform">
                    ▼
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMarker(marker.id);
                    }}
                    className="hidden group-hover:block absolute -top-5 left-1/2 -translate-x-1/2 p-0.5 rounded bg-red-900 text-white text-[8px]"
                    title="Delete marker"
                  >
                    <Trash2 className="h-2 w-2" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* TRACK 1: Video Track Strip with Trim Bounds */}
          <div className="h-10 w-full border-b border-[#1C1F2E] bg-[#131520]/80 relative flex items-center px-1 overflow-hidden">
            <div className="absolute left-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 z-10 pointer-events-none">
              <Film className="h-3 w-3 text-indigo-400" /> Video
            </div>
            {/* Visual Thumbnail Strip Simulation */}
            <div className="w-full h-7 rounded bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between px-2 text-[10px] text-indigo-300/60 font-mono">
              <span>00:00</span>
              <span>1080p 60fps Source Strip</span>
              <span>{formatTimecode(totalDuration)}</span>
            </div>
          </div>

          {/* TRACK 2: B-Roll Track Strip (If Split-screen) */}
          {splitScreenEnabled && (
            <div className="h-8 w-full border-b border-[#1C1F2E] bg-[#141724]/60 relative flex items-center px-1 overflow-hidden">
              <div className="absolute left-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 z-10 pointer-events-none">
                <Layers className="h-3 w-3" /> B-Roll: {brollName || 'Gameplay'}
              </div>
              <div className="w-full h-6 rounded bg-emerald-950/30 border border-emerald-800/40 flex items-center px-2 text-[10px] text-emerald-300/70 font-mono">
                <span>Split-screen bottom layer (GTA 5 / Minecraft)</span>
              </div>
            </div>
          )}

          {/* TRACK 3: Subtitles & Word Blocks Track */}
          <div className="h-10 w-full border-b border-[#1C1F2E] bg-[#11131E] relative flex items-center overflow-hidden">
            <div className="absolute left-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 z-10 pointer-events-none">
              <Type className="h-3 w-3" /> Subtitle Blocks
            </div>

            {/* Word Blocks on Timeline */}
            {words.map((w) => {
              if (w.deleted) return null;
              const wordLeft = (w.start / totalDuration) * timelineContentWidth;
              const wordWidth = Math.max(16, ((w.end - w.start) / totalDuration) * timelineContentWidth);
              const isActive = currentTime >= w.start && currentTime <= w.end;

              return (
                <div
                  key={w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(w.start);
                  }}
                  className={`absolute h-7 rounded px-1.5 flex items-center justify-center text-[10px] font-semibold truncate cursor-pointer transition-colors border ${
                    isActive
                      ? 'bg-amber-500 text-black border-amber-300 font-bold z-20 shadow-md scale-105'
                      : w.isHighlighted
                      ? 'bg-indigo-600/40 text-indigo-200 border-indigo-400/50'
                      : 'bg-[#1C1F2E] text-slate-300 border-[#2A2F45] hover:bg-[#25293D]'
                  }`}
                  style={{
                    left: `${wordLeft}px`,
                    width: `${wordWidth}px`,
                  }}
                  title={`${w.word} (${formatTimecode(w.start)} - ${formatTimecode(w.end)})`}
                >
                  {w.word}
                </div>
              );
            })}
          </div>

          {/* TRACK 4: Audio Waveform Canvas Track */}
          <div className="h-12 w-full bg-[#0D0F18] relative flex items-center overflow-hidden">
            <div className="absolute left-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 z-10 pointer-events-none">
              <Music className="h-3 w-3 text-indigo-400" /> Audio Waveform
            </div>
            <canvas ref={waveformCanvasRef} className="absolute inset-0 pointer-events-none" />
          </div>

          {/* ======================================================== */}
          {/* INTERACTIVE TRIM BOUNDARIES (START & END HANDLES) */}
          {/* ======================================================== */}
          {/* Dimmed Out-of-bounds start overlay */}
          <div
            className="absolute top-6 bottom-0 left-0 bg-black/70 pointer-events-none border-r-2 border-emerald-500/70"
            style={{ width: `${startTrimX}px` }}
          />

          {/* Start Trim Draggable Handle */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggingTrim('start');
            }}
            className="trim-handle absolute top-6 bottom-0 w-3 -ml-1.5 bg-emerald-500 hover:bg-emerald-400 cursor-ew-resize z-45 flex items-center justify-center rounded-r shadow-lg transition-transform hover:scale-110 active:scale-125"
            style={{ left: `${startTrimX}px` }}
            title={`Clip Start Trim: ${formatTimecode(startTime)}`}
          >
            <div className="h-6 w-[2px] bg-black/60 rounded" />
          </div>

          {/* Dimmed Out-of-bounds end overlay */}
          <div
            className="absolute top-6 bottom-0 right-0 bg-black/70 pointer-events-none border-l-2 border-emerald-500/70"
            style={{ left: `${endTrimX}px`, width: `${timelineContentWidth - endTrimX}px` }}
          />

          {/* End Trim Draggable Handle */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggingTrim('end');
            }}
            className="trim-handle absolute top-6 bottom-0 w-3 -ml-1.5 bg-emerald-500 hover:bg-emerald-400 cursor-ew-resize z-45 flex items-center justify-center rounded-l shadow-lg transition-transform hover:scale-110 active:scale-125"
            style={{ left: `${endTrimX}px` }}
            title={`Clip End Trim: ${formatTimecode(endTime)}`}
          >
            <div className="h-6 w-[2px] bg-black/60 rounded" />
          </div>

          {/* ======================================================== */}
          {/* SCRUBBABLE PLAYHEAD NEEDLE */}
          {/* ======================================================== */}
          <div
            className="absolute top-0 bottom-0 z-50 pointer-events-none flex flex-col items-center"
            style={{ left: `${playheadX}px` }}
          >
            {/* Playhead Header Needle Badge */}
            <div className="h-4 w-4 bg-red-500 rounded-sm shadow-md text-white flex items-center justify-center font-bold text-[8px] transform rotate-45 -mt-1 shadow-red-500/50" />
            {/* Playhead Vertical Line */}
            <div className="w-[2px] h-full bg-red-500 shadow-sm shadow-red-500/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default WaveformTimeline;
