'use client';

import React from 'react';
import { CaptionPreset, getPresetCssStyle } from '@/lib/presets-catalog';
import { Check, Sparkles, Type, Flame } from 'lucide-react';

interface PresetCardProps {
  preset: CaptionPreset;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

export function PresetCard({
  preset,
  isSelected,
  onSelect,
  compact = false,
}: PresetCardProps) {
  const normalStyle = getPresetCssStyle(preset, false);
  const highlightStyle = getPresetCssStyle(preset, true);

  // Split sample text into normal words and highlight word
  const sampleParts = (preset.sampleText || 'VIRAL HOOK HERE').split(' ');
  const mainWords = sampleParts.slice(0, Math.max(1, sampleParts.length - 1)).join(' ');
  const highlightWord = sampleParts[sampleParts.length - 1] || 'NOW';
  const emoji = preset.emoji || '🔥';

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col rounded-xl border transition-all cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-indigo-500 bg-[#161926] shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/60 scale-[1.02]'
          : 'border-[#24283B] bg-[#13151F] hover:border-slate-500 hover:bg-[#161926]/90 hover:scale-[1.01]'
      }`}
    >
      {/* Active Selection Badge */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 z-20 h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      )}

      {/* Creator Style / Preset Badge */}
      {preset.creatorStyle && (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-slate-200">
          <span>{emoji}</span>
          <span className="truncate max-w-[100px]">{preset.creatorStyle}</span>
        </div>
      )}

      {/* Preview Simulation Stage */}
      <div
        className={`relative w-full flex items-center justify-center bg-gradient-to-b from-[#0D0E15] via-[#11131F] to-[#090A0F] border-b border-[#24283B]/70 p-4 overflow-hidden select-none ${
          compact ? 'h-24' : 'h-32'
        }`}
      >
        {/* Subtle grid pattern in preview background */}
        <div className="absolute inset-0 bg-[radial-gradient(#24283B_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

        {/* Live Styled Caption Rendering */}
        <div className="relative z-10 text-center flex flex-wrap items-center justify-center gap-1.5 px-2">
          <span
            style={{
              ...normalStyle,
              fontSize: compact ? '16px' : '20px',
              lineHeight: 1.2,
            }}
          >
            {mainWords}
          </span>
          <span
            style={{
              ...highlightStyle,
              fontSize: compact ? '16px' : '20px',
              lineHeight: 1.2,
              transform: preset.highlightScale ? `scale(${Math.min(1.15, preset.highlightScale)})` : undefined,
              display: 'inline-block',
            }}
            className="group-hover:animate-spring-pop inline-flex items-center gap-1"
          >
            <span>{highlightWord}</span>
            <span className="text-sm select-none">{emoji}</span>
          </span>
        </div>

        {/* Hover preview shimmer */}
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Preset Details Footer */}
      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-xs text-white tracking-tight truncate flex items-center gap-1">
            <span>{preset.name}</span>
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#1C1F2E] text-slate-300 border border-[#24283B] flex-shrink-0">
            {preset.wordsPerLine}w/line
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 truncate text-slate-300">
            <Type className="h-3 w-3 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{preset.fontFamily}</span>
          </span>
          <span className="text-[10px] text-indigo-400 font-mono capitalize">
            {preset.animation}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PresetCard;
