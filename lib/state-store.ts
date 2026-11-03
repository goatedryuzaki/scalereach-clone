/**
 * ScaleReach Zustand Client State Store
 *
 * Manages active video ingestion state, configurator parameters,
 * caption presets, timeframe trimming dual sliders, and split-screen settings.
 */

import { create } from 'zustand';

export interface VideoItem {
  id: string;
  title: string;
  duration: number; // in seconds
  sourceUrl: string;
  sourceType: 'url' | 'upload';
  thumbnailUrl?: string;
  status?: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

export interface SplitScreenConfig {
  enabled: boolean;
  assetId: string | null;
  category: string;
  ratio: number; // 30 to 70, default 50
}

export interface BrandTemplateConfig {
  name: string;
  captionTemplateId: string;
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  highlightColor: string;
  strokeWidth: number;
  shadowBlur: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  logoOpacity?: number;
}

export interface ScaleReachState {
  // Video Ingestion
  activeVideo: VideoItem | null;
  recentVideos: VideoItem[];
  setActiveVideo: (video: VideoItem | null) => void;
  addRecentVideo: (video: VideoItem) => void;

  // Configuration Pipeline
  selectedPresetId: string;
  setSelectedPresetId: (presetId: string) => void;

  clipTypes: string[];
  setClipTypes: (types: string[]) => void;
  toggleClipType: (type: string) => void;

  durationOption: '<30s' | '30s-60s' | '60s-90s' | '90s-3m' | 'any';
  setDurationOption: (duration: '<30s' | '30s-60s' | '60s-90s' | '90s-3m' | 'any') => void;

  timeframe: [number, number]; // [startTime, endTime] in seconds
  setTimeframe: (start: number, end: number) => void;

  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;

  // Split Screen
  splitScreen: SplitScreenConfig;
  setSplitScreen: (config: Partial<SplitScreenConfig>) => void;

  // Aspect Ratio
  aspectRatio: '9:16' | '16:9' | '1:1';
  setAspectRatio: (ratio: '9:16' | '16:9' | '1:1') => void;

  // Custom Brand Template
  brandTemplate: BrandTemplateConfig;
  updateBrandTemplate: (config: Partial<BrandTemplateConfig>) => void;

  // Reset
  resetConfig: () => void;
}

const DEFAULT_BRAND_TEMPLATE: BrandTemplateConfig = {
  name: 'Default Viral Brand',
  captionTemplateId: 'classic',
  fontFamily: 'Poppins',
  fontSize: 44,
  primaryColor: '#FFFFFF',
  highlightColor: '#FFFF00',
  strokeWidth: 5,
  shadowBlur: 2,
  aspectRatio: '9:16',
  logoOpacity: 0.9,
  logoPosition: 'top-right',
};

const DEFAULT_VIDEO: VideoItem = {
  id: 'demo-podcast-1',
  title: 'How Anyone Can Build a $10M SaaS In 12 Months',
  duration: 480, // 8 minutes
  sourceUrl: 'https://www.youtube.com/watch?v=gCHSEGBp8ME',
  sourceType: 'url',
  thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60',
  status: 'completed',
  progress: 100,
};

export const useScaleReachStore = create<ScaleReachState>((set) => ({
  activeVideo: DEFAULT_VIDEO,
  recentVideos: [
    DEFAULT_VIDEO,
    {
      id: 'demo-interview-2',
      title: 'Stop Building Features Nobody Wants',
      duration: 360,
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      sourceType: 'url',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&auto=format&fit=crop&q=60',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'demo-reaction-3',
      title: 'Top 5 AI Tools That Feel Illegal To Know',
      duration: 620,
      sourceUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      sourceType: 'url',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      status: 'completed',
      progress: 100,
    },
  ],
  setActiveVideo: (video) => set({ activeVideo: video, timeframe: video ? [0, video.duration] : [0, 300] }),
  addRecentVideo: (video) =>
    set((state) => ({
      recentVideos: [video, ...state.recentVideos.filter((v) => v.id !== video.id)].slice(0, 10),
    })),

  selectedPresetId: 'classic',
  setSelectedPresetId: (presetId) => set({ selectedPresetId: presetId }),

  clipTypes: ['viral-clips'],
  setClipTypes: (types) => set({ clipTypes: types }),
  toggleClipType: (type) =>
    set((state) => {
      const exists = state.clipTypes.includes(type);
      if (exists) {
        if (state.clipTypes.length === 1) return state; // keep at least one
        return { clipTypes: state.clipTypes.filter((t) => t !== type) };
      } else {
        return { clipTypes: [...state.clipTypes, type] };
      }
    }),

  durationOption: '30s-60s',
  setDurationOption: (duration) => set({ durationOption: duration }),

  timeframe: [0, 480],
  setTimeframe: (start, end) => set({ timeframe: [start, end] }),

  customPrompt: '',
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  splitScreen: {
    enabled: false,
    assetId: 'gta-1',
    category: 'GTA 5',
    ratio: 50,
  },
  setSplitScreen: (config) =>
    set((state) => ({
      splitScreen: { ...state.splitScreen, ...config },
    })),

  aspectRatio: '9:16',
  setAspectRatio: (aspectRatio) =>
    set((state) => ({
      aspectRatio,
      // If changing away from 9:16, disable split-screen safely
      splitScreen: aspectRatio !== '9:16' ? { ...state.splitScreen, enabled: false } : state.splitScreen,
    })),

  brandTemplate: DEFAULT_BRAND_TEMPLATE,
  updateBrandTemplate: (config) =>
    set((state) => ({
      brandTemplate: { ...state.brandTemplate, ...config },
    })),

  resetConfig: () =>
    set({
      selectedPresetId: 'classic',
      clipTypes: ['viral-clips'],
      durationOption: '30s-60s',
      customPrompt: '',
      splitScreen: {
        enabled: false,
        assetId: 'gta-1',
        category: 'GTA 5',
        ratio: 50,
      },
      aspectRatio: '9:16',
    }),
}));
