'use client';

import React, { useState } from 'react';
import {
  Type,
  Crop,
  Layers,
  Image as ImageIcon,
  Info,
  Sparkles,
  Palette,
  Sliders,
  Check,
  Plus,
  Trash2,
  Copy,
  TrendingUp,
  Share2,
  ShieldCheck,
  Flame,
  Award,
} from 'lucide-react';
import { CAPTION_PRESETS, CaptionPreset } from '@/lib/presets-catalog';
import { FONTS_CATALOG, WORD_ANIMATIONS } from '@/lib/fonts-catalog';
import { BROLL_CATEGORIES, BRollItem } from '@/lib/broll-catalog';
import { ClipEntity, CaptionStyle } from '@/lib/db';
import {
  AspectRatio,
  LayoutMode,
  SpeakerCrop,
  TextOverlayItem,
  ImageOverlayItem,
} from './types';

interface InspectorTabsProps {
  clip: ClipEntity | null;
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
  watermarkUnlocked: boolean; // always true
  onSelectPreset: (preset: CaptionPreset) => void;
  onUpdateCaptionStyle: (updates: Partial<CaptionStyle>) => void;
  onUpdateAspectRatio: (ratio: AspectRatio) => void;
  onUpdateLayoutMode: (mode: LayoutMode) => void;
  onUpdateSplitRatio: (ratio: number) => void;
  onSelectBrollAsset: (assetId: string) => void;
  onUpdateSpeakerCrop: (crop: SpeakerCrop) => void;
  onUpdateSubtitlesPosition: (pos: number) => void;
  onAddTextOverlay: () => void;
  onUpdateTextOverlay: (id: string, updates: Partial<TextOverlayItem>) => void;
  onDeleteTextOverlay: (id: string) => void;
  onAddImageOverlay: (url?: string) => void;
  onUpdateImageOverlay: (id: string, updates: Partial<ImageOverlayItem>) => void;
  onDeleteImageOverlay: (id: string) => void;
  onSelectOverlay: (id: string | null) => void;
}

export function InspectorTabs({
  clip,
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
  watermarkUnlocked,
  onSelectPreset,
  onUpdateCaptionStyle,
  onUpdateAspectRatio,
  onUpdateLayoutMode,
  onUpdateSplitRatio,
  onSelectBrollAsset,
  onUpdateSpeakerCrop,
  onUpdateSubtitlesPosition,
  onAddTextOverlay,
  onUpdateTextOverlay,
  onDeleteTextOverlay,
  onAddImageOverlay,
  onUpdateImageOverlay,
  onDeleteImageOverlay,
  onSelectOverlay,
}: InspectorTabsProps) {
  const [activeTab, setActiveTab] = useState<'captions' | 'reframe' | 'text' | 'image' | 'info'>('captions');
  const [presetCategory, setPresetCategory] = useState<string>('all');
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  // Copy title to clipboard
  const handleCopyTitle = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTitle(text);
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  // Filter presets
  const filteredPresets = presetCategory === 'all'
    ? CAPTION_PRESETS
    : CAPTION_PRESETS.filter((p) => p.category === presetCategory);

  return (
    <div className="flex flex-col h-full bg-[#0D0E15] border-l border-[#24283B] select-none text-slate-300">
      {/* 5-Tab Header Navigation */}
      <div className="flex items-center border-b border-[#24283B] bg-[#13151F] px-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('captions')}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'captions'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="h-3.5 w-3.5" />
          <span>Captions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reframe')}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'reframe'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crop className="h-3.5 w-3.5" />
          <span>Reframe</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'text'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Text Overlay</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'image'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="h-3.5 w-3.5 text-amber-400" />
          <span>Clip Info</span>
        </button>
      </div>

      {/* Main Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {/* ======================================================== */}
        {/* TAB 1: CAPTIONS */}
        {/* ======================================================== */}
        {activeTab === 'captions' && (
          <div className="space-y-5">
            {/* 24 Caption Presets Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Caption Presets (24 Pro Styles)
                </span>
                {/* Category Filter Pills */}
                <select
                  value={presetCategory}
                  onChange={(e) => setPresetCategory(e.target.value)}
                  className="bg-[#1C1F2E] border border-[#24283B] rounded px-2 py-0.5 text-[11px] text-slate-300 outline-none"
                >
                  <option value="all">All Presets (24)</option>
                  <option value="creator">Creator Style</option>
                  <option value="gaming">Gaming</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="clean">Clean</option>
                  <option value="expressive">Expressive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = activePreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                          : 'bg-[#161926] border-[#24283B] hover:border-slate-500 hover:bg-[#1C1F2E]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                        {preset.emoji && <span className="text-xs">{preset.emoji}</span>}
                      </div>

                      {/* Visual Mini Subtitle Preview Banner */}
                      <div
                        className="w-full py-1 px-1.5 rounded bg-black/60 text-center text-[10px] font-extrabold truncate"
                        style={{
                          fontFamily: preset.fontFamily,
                          color: preset.highlightColor.startsWith('#') ? preset.highlightColor : '#FFFF00',
                          textTransform: (preset.textTransform || 'uppercase') as any,
                        }}
                      >
                        {preset.sampleText || 'VIRAL SHORTS'}
                      </div>

                      {preset.creatorStyle && (
                        <span className="text-[9px] text-slate-400 mt-1 font-medium truncate">
                          Style: {preset.creatorStyle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography & Font Family Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Font Family (27 Google & Creator Fonts)
              </label>
              <select
                value={captionStyle.fontFamily || activePreset.fontFamily}
                onChange={(e) => onUpdateCaptionStyle({ fontFamily: e.target.value })}
                className="w-full bg-[#161926] border border-[#24283B] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                {FONTS_CATALOG.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Words Per Line */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Font Size</span>
                  <span className="font-mono text-white">{captionStyle.fontSize || 42}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="72"
                  step="2"
                  value={captionStyle.fontSize || 42}
                  onChange={(e) => onUpdateCaptionStyle({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Words / Line</span>
                  <span className="font-mono text-white">{captionStyle.wordsPerLine || 3}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={captionStyle.wordsPerLine || 3}
                  onChange={(e) => onUpdateCaptionStyle({ wordsPerLine: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
                />
              </div>
            </div>

            {/* Subtitle Vertical Position */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Vertical Offset Position</span>
                <span className="font-mono text-white">{subtitlesPosition}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                step="1"
                value={subtitlesPosition}
                onChange={(e) => onUpdateSubtitlesPosition(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
              />
            </div>

            {/* Word Animation Style Selector (20 Types) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Word Animation (20 Kinetic Presets)
              </label>
              <select
                value={captionStyle.animation || activePreset.animation || 'bounce'}
                onChange={(e) => onUpdateCaptionStyle({ animation: e.target.value })}
                className="w-full bg-[#161926] border border-[#24283B] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                {WORD_ANIMATIONS.map((anim) => (
                  <option key={anim.id} value={anim.id}>
                    {anim.name} — {anim.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Colors: Primary Text & Keyword Highlight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Primary Text Color</label>
                <div className="flex items-center gap-2 bg-[#161926] border border-[#24283B] rounded-lg p-1.5">
                  <input
                    type="color"
                    value={captionStyle.textColor?.startsWith('#') ? captionStyle.textColor : '#FFFFFF'}
                    onChange={(e) => onUpdateCaptionStyle({ textColor: e.target.value })}
                    className="h-6 w-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-300 uppercase">
                    {captionStyle.textColor || '#FFFFFF'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Keyword Highlight Color</label>
                <div className="flex items-center gap-2 bg-[#161926] border border-[#24283B] rounded-lg p-1.5">
                  <input
                    type="color"
                    value={captionStyle.highlightColor?.startsWith('#') ? captionStyle.highlightColor : '#FFFF00'}
                    onChange={(e) => onUpdateCaptionStyle({ highlightColor: e.target.value })}
                    className="h-6 w-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-300 uppercase">
                    {captionStyle.highlightColor || '#FFFF00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stroke Thickness & Glow Shadow */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Stroke Width</span>
                  <span className="font-mono text-white">{captionStyle.strokeWidth || 4}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={captionStyle.strokeWidth || 4}
                  onChange={(e) => onUpdateCaptionStyle({ strokeWidth: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Shadow Glow Blur</span>
                  <span className="font-mono text-white">{captionStyle.shadowBlur || 3}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={captionStyle.shadowBlur || 3}
                  onChange={(e) => onUpdateCaptionStyle({ shadowBlur: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REFRAME */}
        {/* ======================================================== */}
        {activeTab === 'reframe' && (
          <div className="space-y-5">
            {/* Aspect Ratio Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => onUpdateAspectRatio(ratio)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-400'
                        : 'bg-[#161926] border-[#24283B] text-slate-400 hover:text-white'
                    }`}
                  >
                    {ratio === '9:16' ? '9:16 (Shorts)' : ratio === '16:9' ? '16:9 (Landscape)' : '1:1 (Square)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Mode Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                Layout Framing Mode
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onUpdateLayoutMode('single')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    layoutMode === 'single'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-[#161926] border-[#24283B] text-slate-300 hover:bg-[#1C1F2E]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">Single Speaker (Face Tracking)</div>
                    <div className="text-[11px] text-slate-400">Dynamic AI face tracking centered on speaker</div>
                  </div>
                  {layoutMode === 'single' && <Check className="h-4 w-4 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateLayoutMode('split')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    layoutMode === 'split'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-[#161926] border-[#24283B] text-slate-300 hover:bg-[#1C1F2E]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">Split Screen (Gameplay / ASMR B-Roll)</div>
                    <div className="text-[11px] text-slate-400">Top speaker facecam + bottom background gameplay</div>
                  </div>
                  {layoutMode === 'split' && <Check className="h-4 w-4 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateLayoutMode('blur_fill')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    layoutMode === 'blur_fill'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-[#161926] border-[#24283B] text-slate-300 hover:bg-[#1C1F2E]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">25px Gaussian Blur Fill</div>
                    <div className="text-[11px] text-slate-400">Letterbox centered with blurred backdrop</div>
                  </div>
                  {layoutMode === 'blur_fill' && <Check className="h-4 w-4 text-indigo-400" />}
                </button>
              </div>
            </div>

            {/* Split Screen Ratio Slider (If Split) */}
            {layoutMode === 'split' && (
              <div className="space-y-3 p-3 rounded-xl bg-[#161926] border border-[#24283B]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Split-Screen Ratio Divider</span>
                  <span className="font-mono text-indigo-400">{splitRatio}% / {100 - splitRatio}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="75"
                  step="1"
                  value={splitRatio}
                  onChange={(e) => onUpdateSplitRatio(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
                />

                {/* 29 Split-screen B-Roll Asset Selector */}
                <div className="space-y-2 pt-2 border-t border-[#24283B]">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Choose B-Roll Video Asset (29 Available)
                  </span>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {BROLL_CATEGORIES.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {cat.category} ({cat.count})
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {cat.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => onSelectBrollAsset(item.id)}
                              className={`p-1.5 rounded-lg border text-left text-[11px] transition-all flex items-center gap-1.5 ${
                                brollAssetId === item.id
                                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                  : 'bg-[#1C1F2E] border-[#2A2F45] text-slate-300 hover:bg-[#25293D]'
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <span className="truncate">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Speaker Framing & Zoom */}
            <div className="space-y-3 p-3 rounded-xl bg-[#161926] border border-[#24283B]">
              <span className="text-xs font-bold text-slate-300 block">
                Facecam Manual Crop & Zoom
              </span>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Speaker Zoom</span>
                  <span className="font-mono text-white">{speakerCrop.zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={speakerCrop.zoom}
                  onChange={(e) =>
                    onUpdateSpeakerCrop({ ...speakerCrop, zoom: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 h-1.5 bg-[#24283B] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TEXT OVERLAY */}
        {/* ======================================================== */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Custom Text Callouts
              </span>
              <button
                type="button"
                onClick={onAddTextOverlay}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="h-3 w-3" /> Add Text
              </button>
            </div>

            {textOverlays.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#161926] border border-dashed border-[#24283B] text-center text-slate-500 text-xs">
                No custom text overlays added yet. Click &quot;Add Text&quot; to insert hook titles or headers.
              </div>
            ) : (
              <div className="space-y-3">
                {textOverlays.map((ov) => (
                  <div
                    key={ov.id}
                    onClick={() => onSelectOverlay(ov.id)}
                    className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                      selectedOverlayId === ov.id
                        ? 'bg-[#1C1F2E] border-indigo-500 ring-1 ring-indigo-400'
                        : 'bg-[#161926] border-[#24283B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Text Header</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTextOverlay(ov.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete text overlay"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={ov.text}
                      onChange={(e) => onUpdateTextOverlay(ov.id, { text: e.target.value })}
                      className="w-full bg-[#11131E] border border-[#24283B] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Size ({ov.fontSize}px)</label>
                        <input
                          type="range"
                          min="16"
                          max="64"
                          value={ov.fontSize}
                          onChange={(e) =>
                            onUpdateTextOverlay(ov.id, { fontSize: parseInt(e.target.value, 10) })
                          }
                          className="w-full accent-indigo-500 h-1 bg-[#24283B] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Opacity ({Math.round(ov.opacity * 100)}%)</label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={ov.opacity}
                          onChange={(e) =>
                            onUpdateTextOverlay(ov.id, { opacity: parseFloat(e.target.value) })
                          }
                          className="w-full accent-indigo-500 h-1 bg-[#24283B] rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: IMAGE OVERLAY / LOGO */}
        {/* ======================================================== */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Logo & Brand Image
              </span>
              <button
                type="button"
                onClick={() => onAddImageOverlay()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="h-3 w-3" /> Add Logo
              </button>
            </div>

            {/* Zero-Paywall Watermark Guarantee Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
              <div>
                <span className="text-xs font-bold block">100% Unwatermarked Exports</span>
                <span className="text-[11px] text-emerald-200/80">
                  ScaleReach exports never inject promotional watermarks. Watermarks are fully unlocked and disabled by default.
                </span>
              </div>
            </div>

            {imageOverlays.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#161926] border border-dashed border-[#24283B] text-center text-slate-500 text-xs">
                No custom logos added. Click &quot;Add Logo&quot; to insert your channel branding.
              </div>
            ) : (
              <div className="space-y-3">
                {imageOverlays.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onSelectOverlay(img.id)}
                    className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                      selectedOverlayId === img.id
                        ? 'bg-[#1C1F2E] border-indigo-500 ring-1 ring-indigo-400'
                        : 'bg-[#161926] border-[#24283B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Brand Logo</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteImageOverlay(img.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete logo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <img src={img.url} alt="Logo" className="h-8 w-8 object-contain rounded bg-black/40 p-1" />
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => onUpdateImageOverlay(img.id, { url: e.target.value })}
                        className="flex-1 bg-[#11131E] border border-[#24283B] rounded px-2 py-1 text-xs text-white"
                        placeholder="Image URL"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Scale ({(img.scale * 100).toFixed(0)}%)</label>
                        <input
                          type="range"
                          min="0.2"
                          max="1.5"
                          step="0.05"
                          value={img.scale}
                          onChange={(e) =>
                            onUpdateImageOverlay(img.id, { scale: parseFloat(e.target.value) })
                          }
                          className="w-full accent-indigo-500 h-1 bg-[#24283B] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Opacity ({(img.opacity * 100).toFixed(0)}%)</label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={img.opacity}
                          onChange={(e) =>
                            onUpdateImageOverlay(img.id, { opacity: parseFloat(e.target.value) })
                          }
                          className="w-full accent-indigo-500 h-1 bg-[#24283B] rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: CLIP INFO & VIRALITY SCORECARD */}
        {/* ======================================================== */}
        {activeTab === 'info' && (
          <div className="space-y-5">
            {/* Virality Scorecard Radial Meter */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161926] to-[#11131E] border border-[#24283B] flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> Virality Scorecard
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">High Viral Potential</h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-[200px]">
                  {clip?.viralityReason || 'Strong curiosity gap opening with rapid punchy insight.'}
                </p>
              </div>

              {/* Radial Meter Badge */}
              <div className="relative h-18 w-18 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-xl font-black text-emerald-400 leading-none">
                    {clip?.viralityScore || 94}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-300/80 uppercase">/100</span>
                </div>
              </div>
            </div>

            {/* Sub-Score Breakdown Meters */}
            <div className="space-y-3 p-3.5 rounded-xl bg-[#161926] border border-[#24283B]">
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Audience Retention Metrics
              </span>

              {/* Hook Score */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Hook Strength (Opening 3s)</span>
                  <span className="font-mono text-emerald-400 font-bold">96/100</span>
                </div>
                <div className="h-1.5 w-full bg-[#24283B] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>

              {/* Flow Score */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Pacing & Flow Score</span>
                  <span className="font-mono text-indigo-400 font-bold">92/100</span>
                </div>
                <div className="h-1.5 w-full bg-[#24283B] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              {/* Engagement Resonance */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Emotional Resonance</span>
                  <span className="font-mono text-amber-400 font-bold">95/100</span>
                </div>
                <div className="h-1.5 w-full bg-[#24283B] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>

            {/* AI Generated Viral Titles */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Catchy Viral Titles
              </span>
              <div className="space-y-1.5">
                {[
                  clip?.title || 'The Uncomfortable Truth About Virality',
                  'Stop Making This Mistake If You Want 1M Views',
                  'Why 99% Of People Fail At Scaling Short Form Content',
                ].map((title, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#161926] border border-[#24283B] flex items-center justify-between group hover:border-slate-500 transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-200 line-clamp-1">{title}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyTitle(title)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedTitle === title ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Platforms */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Distribution Platforms
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(clip?.recommendedPlatforms || ['TikTok', 'YouTube Shorts', 'Instagram Reels']).map((platform) => (
                  <span
                    key={platform}
                    className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Improvement Suggestion */}
            <div className="p-3 rounded-xl bg-[#161926] border border-[#24283B] text-xs text-slate-300 space-y-1">
              <div className="font-bold text-indigo-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Editor Recommendation
              </div>
              <p className="text-slate-400 leading-relaxed">
                {clip?.improvementSuggestion ||
                  'Pacing is optimal. We recommend using high-energy emojis on key contrast words like "viral" and "mistake" to boost 3-second hold rate.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default InspectorTabs;
