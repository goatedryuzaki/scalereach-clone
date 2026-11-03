import { ClipEntity, CaptionWord, CaptionStyle, CaptionData, VideoEntity } from '@/lib/db';
import { CaptionPreset } from '@/lib/presets-catalog';

export type AspectRatio = '9:16' | '16:9' | '1:1';
export type LayoutMode = 'single' | 'split' | 'blur_fill';

export interface SpeakerCrop {
  x: number; // horizontal center percentage 0-100, default 50
  y: number; // vertical center percentage 0-100, default 50
  zoom: number; // scale factor 1.0 to 2.5, default 1.0
}

export interface TextOverlayItem {
  id: string;
  type: 'text';
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  opacity: number;
  startTime: number;
  endTime: number;
}

export interface ImageOverlayItem {
  id: string;
  type: 'image';
  url: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0.1 to 1.5
  opacity: number; // 0 to 1
  startTime: number;
  endTime: number;
  positionQuickSnap?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'custom';
}

export interface TimelineMarker {
  id: string;
  time: number;
  label?: string;
  color?: string;
}

export interface WorkstationState {
  clip: ClipEntity | null;
  video: VideoEntity | null;
  captionData: CaptionData | null;
  activePreset: CaptionPreset;
  captionStyle: CaptionStyle;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  aspectRatio: AspectRatio;
  layoutMode: LayoutMode;
  splitRatio: number; // 30 to 70 divider
  brollAssetId: string | null;
  speakerCrop: SpeakerCrop;
  subtitlesPosition: number; // vertical percentage 10 to 90
  timelineZoom: number; // 0.5 to 6.0
  snapToGrid: boolean;
  markers: TimelineMarker[];
  textOverlays: TextOverlayItem[];
  imageOverlays: ImageOverlayItem[];
  selectedOverlayId: string | null;
  isSaving: boolean;
  isExporting: boolean;
}
