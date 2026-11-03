'use client';

import React, { useState } from 'react';
import {
  BROLL_CATEGORIES,
  ALL_BROLL_ASSETS,
  BrollAsset,
  getBrollsByCategory,
} from '@/lib/broll-catalog';
import { useScaleReachStore } from '@/lib/state-store';
import {
  Check,
  Split,
  Sliders,
  VolumeX,
  Volume2,
  Film,
  Sparkles,
  Car,
  Pickaxe,
  Train,
  Headphones,
} from 'lucide-react';

export function SplitScreenSelector() {
  const { splitScreen, setSplitScreen } = useScaleReachStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredAssets = getBrollsByCategory(activeCategory);

  const selectedAsset =
    ALL_BROLL_ASSETS.find((a) => a.id === splitScreen.assetId) || ALL_BROLL_ASSETS[0];

  const categoryIcons: Record<string, React.ReactNode> = {
    'GTA 5': <Car className="h-3.5 w-3.5 text-amber-400" />,
    'Minecraft': <Pickaxe className="h-3.5 w-3.5 text-emerald-400" />,
    'Subway Surfers': <Train className="h-3.5 w-3.5 text-rose-400" />,
    'ASMR': <Headphones className="h-3.5 w-3.5 text-purple-400" />,
  };

  return (
    <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl">
      {/* Header with Enable Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#24283B]">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Split className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Split-Screen Lower Video</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Unlocked Free
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Layer viral gameplay (GTA 5, Minecraft) or satisfying ASMR on lower 9:16 screen
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setSplitScreen({ enabled: !splitScreen.enabled })}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            splitScreen.enabled
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-[#161926] text-slate-400 hover:text-white border border-[#24283B]'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full transition-colors ${
              splitScreen.enabled ? 'bg-white' : 'bg-slate-600'
            }`}
          />
          <span>{splitScreen.enabled ? 'Split-Screen Active' : 'Enable Split-Screen'}</span>
        </button>
      </div>

      {splitScreen.enabled && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* Ratio Slider & Visual Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#090A0F]/60 border border-[#24283B] rounded-xl p-5">
            {/* Visual 9:16 Split Preview */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                9:16 Layout Preview
              </span>
              <div className="relative w-28 h-48 rounded-xl border-2 border-indigo-500/40 bg-[#13151F] overflow-hidden flex flex-col shadow-2xl">
                {/* Top Half: Speaker Facecam */}
                <div
                  className="w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center p-1 transition-all duration-200"
                  style={{ height: `${100 - splitScreen.ratio}%` }}
                >
                  <span className="text-[9px] font-bold text-indigo-300">Speaker Facecam</span>
                  <span className="text-[8px] text-slate-400">{100 - splitScreen.ratio}%</span>
                </div>

                {/* Divider Line */}
                <div className="w-full h-1 bg-indigo-500 shadow-sm shadow-indigo-500/50" />

                {/* Bottom Half: B-Roll Video */}
                <div
                  className="w-full bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center p-1 transition-all duration-200"
                  style={{ height: `${splitScreen.ratio}%` }}
                >
                  <span className="text-[9px] font-bold text-purple-300 truncate max-w-full px-1">
                    {selectedAsset.name}
                  </span>
                  <span className="text-[8px] text-slate-400">{splitScreen.ratio}%</span>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="md:col-span-2 flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  Split Ratio Position
                </span>
                <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {100 - splitScreen.ratio}% Top / {splitScreen.ratio}% Bottom
                </span>
              </div>

              <input
                type="range"
                min={30}
                max={70}
                value={splitScreen.ratio}
                onChange={(e) => setSplitScreen({ ratio: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-[#161926] rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-[#24283B]"
              />

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>30% B-Roll (Speaker Dominant)</span>
                <span className="font-semibold text-slate-400">50/50 Equal</span>
                <span>70% B-Roll (Gameplay Dominant)</span>
              </div>

              {/* Audio Settings Info */}
              <div className="flex items-center gap-4 pt-2 border-t border-[#24283B]/60 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Main Speaker Audio: 100%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>B-Roll Background: Muted (0%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select 1 of 29 B-Roll Video Assets
              </span>
              <span className="text-xs text-slate-500">
                {filteredAssets.length} assets available
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#161926] text-slate-400 hover:text-slate-200 border border-[#24283B]'
                }`}
              >
                All (29)
              </button>
              {BROLL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveCategory(cat.category)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#161926] text-slate-400 hover:text-slate-200 border border-[#24283B]'
                    }`}
                  >
                    {categoryIcons[cat.category]}
                    <span>{cat.category}</span>
                    <span className="text-[10px] opacity-75">({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
            {filteredAssets.map((asset) => {
              const isSelected = splitScreen.assetId === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSplitScreen({ assetId: asset.id, category: asset.category })}
                  className={`group relative rounded-xl border p-2.5 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-[#1C1F2E] ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/20'
                      : 'border-[#24283B] bg-[#161926] hover:border-slate-600 hover:bg-[#1C1F2E]/80'
                  }`}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Thumbnail / Animated Preview Box */}
                  <div className="w-full h-20 rounded-lg bg-[#090A0F] border border-[#24283B] flex items-center justify-center overflow-hidden relative mb-2">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <Film className="h-6 w-6 text-slate-600 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                    <span className="absolute bottom-1 right-1.5 z-20 text-[9px] font-mono text-slate-300 bg-black/60 px-1 rounded">
                      {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white truncate">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{asset.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SplitScreenSelector;
