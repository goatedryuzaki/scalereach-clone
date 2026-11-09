'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { PresetCard } from '@/components/preset-card';
import {
  CAPTION_PRESETS,
  CaptionPreset,
  getPresetById,
  getPresetCssStyle,
} from '@/lib/presets-catalog';
import { FONTS_CATALOG } from '@/lib/fonts-catalog';
import { useScaleReachStore } from '@/lib/state-store';
import {
  Sparkles,
  Palette,
  Type,
  Sliders,
  Check,
  Smartphone,
  Monitor,
  Square,
  Image as ImageIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function BrandTemplatePage() {
  const {
    aspectRatio,
    setAspectRatio,
    selectedPresetId,
    setSelectedPresetId,
    brandTemplate,
    updateBrandTemplate,
  } = useScaleReachStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customText, setCustomText] = useState('THE SECRET TO VIRAL CLIPS');
  const [highlightKeyword, setHighlightKeyword] = useState('VIRAL');
  const [templateName, setTemplateName] = useState('My Brand Preset');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedPreset: CaptionPreset =
    getPresetById(selectedPresetId) || CAPTION_PRESETS[0];

  const filteredPresets =
    activeCategory === 'all'
      ? CAPTION_PRESETS
      : CAPTION_PRESETS.filter((p) => p.category === activeCategory);

  const handleSelectPreset = (preset: CaptionPreset) => {
    setSelectedPresetId(preset.id);
    updateBrandTemplate({
      captionTemplateId: preset.id,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize || 44,
      primaryColor: preset.primaryColor,
      highlightColor: preset.highlightColor,
      strokeWidth: preset.strokeWidth || 5,
    });
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Compute preview aspect ratio styles
  const getContainerDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'w-64 h-[440px]'; // 9:16 portrait
      case '16:9':
        return 'w-[440px] h-64'; // 16:9 widescreen
      case '1:1':
        return 'w-72 h-72'; // 1:1 square
      default:
        return 'w-64 h-[440px]';
    }
  };

  // Render text with highlight
  const words = customText.split(' ');
  const normalStyle = getPresetCssStyle(selectedPreset, false);
  const highlightStyle = getPresetCssStyle(selectedPreset, true);

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Brand Studio</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-indigo-400 font-semibold">New Brand Template</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Caption & Brand Template Customizer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize typography, kinetic animations, logo watermark, and aspect ratio without subscription limits
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Template Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Template</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top Control: Aspect Ratio Switcher */}
        <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Video Format & Aspect Ratio
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose output layout for social media targets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#090A0F] p-1 rounded-xl border border-[#24283B]">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>9:16 Vertical (TikTok/Reels)</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>16:9 Widescreen</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio('1:1')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '1:1'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="h-3.5 w-3.5" />
              <span>1:1 Square</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace: Live Preview & Settings Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Canvas Live Preview */}
          <div className="lg:col-span-5 bg-[#13151F] border border-[#24283B] rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Preview &bull; {selectedPreset.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-[#161926] px-2 py-0.5 rounded border border-[#24283B]">
                {aspectRatio} &bull; 1080p
              </span>
            </div>

            {/* Simulated Mobile/Screen Canvas */}
            <div
              className={`relative ${getContainerDimensions()} rounded-2xl border-2 border-[#24283B] bg-gradient-to-b from-[#161926] via-[#0D0E15] to-[#090A0F] overflow-hidden flex flex-col justify-between p-4 shadow-2xl transition-all duration-300`}
            >
              {/* Subtle background speaker silhouette simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />

              {/* Watermark / Brand Logo Preview */}
              <div className="relative z-10 flex justify-end">
                <div className="px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-slate-300 tracking-wider">
                  SCALE REACH
                </div>
              </div>

              {/* Center Live Caption Renderer */}
              <div className="relative z-20 text-center my-auto px-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {words.map((w, idx) => {
                    const isHigh = w.toUpperCase().includes(highlightKeyword.toUpperCase());
                    const style = isHigh ? highlightStyle : normalStyle;
                    return (
                      <span
                        key={idx}
                        style={{
                          ...style,
                          fontSize: `${Math.min(26, Math.max(16, (selectedPreset.fontSize || 44) / 2))}px`,
                          lineHeight: 1.25,
                        }}
                        className={`transition-all duration-150 ${
                          isHigh ? 'scale-110 drop-shadow-md' : ''
                        }`}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Bottom progress bar simulation */}
              <div className="relative z-10 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-2/3" />
              </div>
            </div>

            {/* Quick Text Input for Preview */}
            <div className="w-full mt-6 space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Sample Preview Text & Highlight Keyword:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="col-span-2 h-9 px-3 rounded-lg bg-[#090A0F] border border-[#24283B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Type subtitle preview..."
                />
                <input
                  type="text"
                  value={highlightKeyword}
                  onChange={(e) => setHighlightKeyword(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#090A0F] border border-[#24283B] text-xs text-amber-400 font-bold placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Keyword..."
                />
              </div>
            </div>
          </div>

          {/* Right: Customization Controls & Parameters */}
          <div className="lg:col-span-7 bg-[#13151F] border border-[#24283B] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#24283B]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Preset Properties</h3>
                  <p className="text-xs text-slate-400">
                    Fine-tune typography, stroke width, and colors
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-400">
                Preset: <span className="text-indigo-400">{selectedPreset.name}</span>
              </div>
            </div>

            {/* Font Family Selector (27 Fonts) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Font Family (27 Creator Fonts)</span>
                <span className="text-[11px] text-indigo-400">{selectedPreset.fontFamily}</span>
              </label>
              <select
                value={selectedPreset.fontFamily}
                onChange={(e) => {
                  const font = e.target.value;
                  updateBrandTemplate({ fontFamily: font });
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#090A0F] border border-[#24283B] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {FONTS_CATALOG.map((fontName) => (
                  <option key={fontName} value={fontName}>
                    {fontName}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Stroke Width Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Font Size</span>
                  <span className="text-indigo-400 font-mono">{selectedPreset.fontSize || 44}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={72}
                  value={selectedPreset.fontSize || 44}
                  onChange={(e) => updateBrandTemplate({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-[#161926] rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-[#24283B]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Stroke Width</span>
                  <span className="text-indigo-400 font-mono">{selectedPreset.strokeWidth || 5}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={selectedPreset.strokeWidth || 5}
                  onChange={(e) => updateBrandTemplate({ strokeWidth: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-[#161926] rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-[#24283B]"
                />
              </div>
            </div>

            {/* Colors: Primary & Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#090A0F] border border-[#24283B] rounded-xl p-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Primary Text Color / Gradient
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-7 w-7 rounded-lg border border-[#24283B] flex-shrink-0"
                    style={{ background: selectedPreset.primaryColor }}
                  />
                  <input
                    type="text"
                    value={selectedPreset.primaryColor}
                    readOnly
                    className="w-full h-8 px-2 rounded bg-[#13151F] border border-[#24283B] text-[11px] font-mono text-slate-300"
                  />
                </div>
              </div>

              <div className="bg-[#090A0F] border border-[#24283B] rounded-xl p-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Active Highlight Color
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-7 w-7 rounded-lg border border-[#24283B] flex-shrink-0"
                    style={{ background: selectedPreset.highlightColor }}
                  />
                  <input
                    type="text"
                    value={selectedPreset.highlightColor}
                    readOnly
                    className="w-full h-8 px-2 rounded bg-[#13151F] border border-[#24283B] text-[11px] font-mono text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Words per line & Animation Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#090A0F] border border-[#24283B] rounded-xl p-3">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Words Per Subtitle Line
                </span>
                <span className="text-sm font-bold text-white">
                  {selectedPreset.wordsPerLine} words / line
                </span>
              </div>

              <div className="bg-[#090A0F] border border-[#24283B] rounded-xl p-3">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Animation Type
                </span>
                <span className="text-sm font-bold text-indigo-400 capitalize">
                  {selectedPreset.animation}
                </span>
              </div>
            </div>

            {/* Watermark Logo Positioning (Zero Paywall) */}
            <div className="bg-[#090A0F] border border-[#24283B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                  Custom Logo Overlay / Watermark
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Fully Unlocked
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
                  const isSelected = brandTemplate.logoPosition === pos;
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => updateBrandTemplate({ logoPosition: pos as any })}
                      className={`p-2 rounded-lg border text-center font-medium capitalize text-[11px] transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                          : 'border-[#24283B] bg-[#161926] text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Complete 29 Caption Presets Grid */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <span>All 29 Caption Animation Presets</span>
              </h2>
              <p className="text-xs text-slate-400">
                Verbatim extracted CSS styles from Alex Hormozi, MrBeast, GaryVee, TikTok, and modern cinema
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-[#13151F] p-1 rounded-xl border border-[#24283B]">
              {['all', 'creator', 'gaming', 'cinematic', 'clean', 'expressive'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 24 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={isSelected}
                  onSelect={() => handleSelectPreset(preset)}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
