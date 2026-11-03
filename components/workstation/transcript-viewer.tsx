'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Undo2,
  Clock,
  Sparkles,
  Palette,
  Smile,
  Check,
  X,
  Plus,
  Flame,
  Zap,
} from 'lucide-react';
import { CaptionWord } from '@/lib/db';

interface TranscriptViewerProps {
  words: CaptionWord[];
  currentTime: number;
  onSeek: (timestamp: number) => void;
  onUpdateWord: (wordId: string, updates: Partial<CaptionWord>) => void;
  onDeleteWord: (wordId: string) => void;
  onRestoreWord: (wordId: string) => void;
  onAddWord: (afterWordId: string) => void;
  onAutoHighlight: () => void;
  onToggleWordCase: () => void;
}

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#FFFF00', bg: 'bg-[#FFFF00]' },
  { label: 'Green', value: '#00FF66', bg: 'bg-[#00FF66]' },
  { label: 'Cyan', value: '#00E5FF', bg: 'bg-[#00E5FF]' },
  { label: 'Purple', value: '#A855F7', bg: 'bg-[#A855F7]' },
  { label: 'Red', value: '#FF1744', bg: 'bg-[#FF1744]' },
  { label: 'None', value: '', bg: 'bg-transparent border border-white/20' },
];

const HIGH_ENERGY_EMOJIS = ['🔥', '💰', '🚀', '💀', '🤯', '📈', '⚡', '👑', '🎯', '💡'];

export function TranscriptViewer({
  words,
  currentTime,
  onSeek,
  onUpdateWord,
  onDeleteWord,
  onRestoreWord,
  onAddWord,
  onAutoHighlight,
  onToggleWordCase,
}: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [timingWordId, setTimingWordId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<number>(0);
  const [editEnd, setEditEnd] = useState<number>(0);
  const [activeMenuWordId, setActiveMenuWordId] = useState<string | null>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format second to mm:ss.ms
  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds || 0);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${m}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Find active word based on currentTime
  const activeIndex = words.findIndex(
    (w) => !w.deleted && currentTime >= w.start && currentTime <= w.end
  );

  // Auto-scroll active word into view smoothly
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeIndex]);

  // Start editing text
  const startEditing = (word: CaptionWord) => {
    setEditingWordId(word.id);
    setEditText(word.word);
    setActiveMenuWordId(null);
  };

  const saveEdit = (wordId: string) => {
    if (editText.trim()) {
      onUpdateWord(wordId, { word: editText.trim() });
    }
    setEditingWordId(null);
  };

  // Start editing timing
  const startTiming = (word: CaptionWord) => {
    setTimingWordId(word.id);
    setEditStart(Number(word.start.toFixed(2)));
    setEditEnd(Number(word.end.toFixed(2)));
    setActiveMenuWordId(null);
  };

  const saveTiming = (wordId: string) => {
    if (editEnd > editStart) {
      onUpdateWord(wordId, {
        start: Number(editStart),
        end: Number(editEnd),
      });
    }
    setTimingWordId(null);
  };

  // Filter words by search
  const filteredWords = searchQuery.trim()
    ? words.filter((w) => w.word.toLowerCase().includes(searchQuery.toLowerCase()))
    : words;

  return (
    <div className="flex flex-col h-full bg-[#0D0E15] border-r border-[#24283B] select-none">
      {/* Header & Search */}
      <div className="p-3 border-b border-[#24283B] bg-[#13151F]/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Transcript
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {words.length} words
            </span>
          </div>

          {/* Quick Word Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onAutoHighlight}
              className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors"
              title="Automatically highlight high-impact viral hook words"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Auto Hook</span>
            </button>
            <button
              type="button"
              onClick={onToggleWordCase}
              className="px-2 py-1 rounded bg-[#1C1F2E] hover:bg-[#24283B] text-slate-300 text-[11px] font-semibold transition-colors"
              title="Toggle uppercase / capitalize words"
            >
              Aa
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search transcript words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161926] border border-[#24283B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Transcript Flow Scrollable View */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700"
      >
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 leading-relaxed text-sm">
          {filteredWords.map((word, idx) => {
            const isActive = idx === activeIndex;
            const isEditing = editingWordId === word.id;
            const isTiming = timingWordId === word.id;
            const isMenuOpen = activeMenuWordId === word.id;
            const isCustomHighlighted = word.isHighlighted;
            const isDeleted = word.deleted;

            return (
              <div key={word.id} className="relative group inline-block">
                {/* Word Pill Chip */}
                {isEditing ? (
                  <div className="inline-flex items-center gap-1 bg-[#1C1F2E] border border-indigo-500 rounded px-1.5 py-0.5">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(word.id);
                        if (e.key === 'Escape') setEditingWordId(null);
                      }}
                      autoFocus
                      className="bg-transparent text-white font-semibold text-xs outline-none w-20"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(word.id)}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingWordId(null)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span
                    ref={isActive ? activeWordRef : null}
                    onClick={() => onSeek(word.start)}
                    className={`cursor-pointer px-1.5 py-0.5 rounded-md transition-all text-xs font-medium inline-flex items-center gap-1 ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/70 font-bold scale-105 shadow-sm'
                        : isCustomHighlighted
                        ? 'font-bold ring-1'
                        : isDeleted
                        ? 'line-through text-slate-600 bg-red-950/20'
                        : 'text-slate-300 hover:bg-[#1C1F2E] hover:text-white'
                    }`}
                    style={{
                      color: isCustomHighlighted ? word.color || '#FFFF00' : undefined,
                      borderColor: isCustomHighlighted ? word.color || '#FFFF00' : undefined,
                    }}
                    title={`Click to seek (${formatTime(word.start)} - ${formatTime(word.end)})`}
                  >
                    {/* Attached Emoji badge */}
                    {word.emoji && (
                      <span className="text-xs filter drop-shadow">{word.emoji}</span>
                    )}

                    <span>{word.word}</span>

                    {/* Word Action Trigger Dropdown */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuWordId(isMenuOpen ? null : word.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-indigo-400 ml-0.5 p-0.5 rounded transition-opacity"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}

                {/* Popover Action Menu for Selected Word */}
                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-[#161926] border border-[#24283B] rounded-xl p-2.5 shadow-2xl w-56 text-xs text-slate-300 space-y-2 backdrop-blur-md">
                    <div className="flex items-center justify-between pb-1 border-b border-[#24283B]">
                      <span className="font-semibold text-[11px] text-slate-400">
                        {word.word} ({formatTime(word.start)})
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveMenuWordId(null)}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Edit text & Edit timing */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditing(word)}
                        className="flex items-center justify-center gap-1 py-1 rounded bg-[#1C1F2E] hover:bg-[#24283B] text-slate-200 text-[11px] font-medium"
                      >
                        <Edit2 className="h-3 w-3 text-indigo-400" />
                        <span>Edit Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startTiming(word)}
                        className="flex items-center justify-center gap-1 py-1 rounded bg-[#1C1F2E] hover:bg-[#24283B] text-slate-200 text-[11px] font-medium"
                      >
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>Timing</span>
                      </button>
                    </div>

                    {/* Highlight Color Palette */}
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <Palette className="h-2.5 w-2.5" /> Word Highlight Color
                      </div>
                      <div className="flex items-center gap-1">
                        {HIGHLIGHT_COLORS.map((col) => (
                          <button
                            key={col.label}
                            type="button"
                            onClick={() => {
                              onUpdateWord(word.id, {
                                isHighlighted: !!col.value,
                                color: col.value,
                              });
                              setActiveMenuWordId(null);
                            }}
                            className={`h-5 w-5 rounded-full ${col.bg} transition-transform hover:scale-110 flex items-center justify-center`}
                            title={col.label}
                          >
                            {word.color === col.value && <Check className="h-2.5 w-2.5 text-black" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* High-Energy Emoji Attach Picker */}
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <Smile className="h-2.5 w-2.5" /> Attach Viral Emoji
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {HIGH_ENERGY_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              const newEmoji = word.emoji === emoji ? undefined : emoji;
                              onUpdateWord(word.id, { emoji: newEmoji });
                              setActiveMenuWordId(null);
                            }}
                            className={`p-1 text-center rounded hover:bg-[#24283B] text-sm transition-transform hover:scale-125 ${
                              word.emoji === emoji ? 'bg-indigo-600/30 ring-1 ring-indigo-500' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delete / Restore Word Button */}
                    <div className="pt-1 border-t border-[#24283B]">
                      {isDeleted ? (
                        <button
                          type="button"
                          onClick={() => {
                            onRestoreWord(word.id);
                            setActiveMenuWordId(null);
                          }}
                          className="w-full flex items-center justify-center gap-1 py-1 rounded bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 text-[11px] font-medium"
                        >
                          <Undo2 className="h-3 w-3" /> Restore Spoken Word
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteWord(word.id);
                            setActiveMenuWordId(null);
                          }}
                          className="w-full flex items-center justify-center gap-1 py-1 rounded bg-red-950/40 hover:bg-red-950/70 text-red-400 text-[11px] font-medium"
                        >
                          <Trash2 className="h-3 w-3" /> Cut / Delete Word
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Timing Edit Modal / Dialog */}
                {isTiming && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-[#161926] border border-[#24283B] rounded-xl p-3 shadow-2xl w-60 text-xs text-slate-300 space-y-2">
                    <span className="font-semibold text-slate-200">Adjust Timing (Seconds)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Start (s)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={editStart}
                          onChange={(e) => setEditStart(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#1C1F2E] border border-[#24283B] rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">End (s)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={editEnd}
                          onChange={(e) => setEditEnd(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#1C1F2E] border border-[#24283B] rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTimingWordId(null)}
                        className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 text-[11px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveTiming(word.id)}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px]"
                      >
                        Save Timing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Instructions */}
      <div className="p-2.5 border-t border-[#24283B] bg-[#13151F]/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click word to seek playhead</span>
        <span className="font-mono text-slate-500">Auto-sync active</span>
      </div>
    </div>
  );
}
export default TranscriptViewer;
