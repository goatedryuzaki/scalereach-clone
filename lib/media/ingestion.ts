import fs from 'fs';
import path from 'path';
import { db, VideoEntity } from '../db';

export const PLATFORM_PATTERNS = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  twitch_vod: /^(https?:\/\/)?(www\.)?twitch\.tv\/videos\/(\d+)/i,
  twitch_live: /^(https?:\/\/)?(www\.)?twitch\.tv\/([a-zA-Z0-9_]+)$/i,
  kick: /^(https?:\/\/)?(www\.)?kick\.com\/([a-zA-Z0-9_]+)\/videos\/(\d+)/i,
  google_drive: /^(https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  dropbox: /^(https?:\/\/)?(www\.)?dropbox\.com\/(s|scl)\/([a-zA-Z0-9_-]+)/i,
  loom: /^(https?:\/\/)?(www\.)?loom\.com\/share\/([a-zA-Z0-9_-]+)/i,
  rumble: /^(https?:\/\/)?(www\.)?rumble\.com\/(v[a-zA-Z0-9_-]+)/i,
  dailymotion: /^(https?:\/\/)?(www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/i,
  streamable: /^(https?:\/\/)?(www\.)?streamable\.com\/([a-zA-Z0-9]+)/i,
  wistia: /^(https?:\/\/)?([a-zA-Z0-9_-]+)\.wistia\.com\/medias\/([a-zA-Z0-9]+)/i,
  vidyard: /^(https?:\/\/)?(share\.)?vidyard\.com\/watch\/([a-zA-Z0-9]+)/i,
  direct_video: /^https?:\/\/.+\.(mp4|mov|webm)(\?.*)?$/i,
};

export interface PlatformDetectionResult {
  valid: boolean;
  platform?: string;
  extractedId?: string;
  isLive?: boolean;
  error?: string;
}

/**
 * Detects and validates video URL across 12 supported platforms
 */
export function detectPlatformUrl(url: string | null | undefined): PlatformDetectionResult {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = url.trim();

  // Reject unsupported protocols
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, error: 'Invalid protocol: only HTTP/HTTPS URLs are supported.' };
  }

  // Check twitch live stream rejection
  if (PLATFORM_PATTERNS.twitch_live.test(trimmed) && !trimmed.includes('/videos/')) {
    return {
      valid: false,
      platform: 'twitch',
      isLive: true,
      error: 'Live streams are not supported. Please provide a finished VOD URL.',
    };
  }

  // Check playlist rejection
  if (trimmed.includes('list=') && !trimmed.includes('v=')) {
    return { valid: false, error: 'Playlists are not supported. Please provide a direct video URL.' };
  }

  for (const [platform, regex] of Object.entries(PLATFORM_PATTERNS)) {
    if (platform === 'twitch_live') continue;
    const match = trimmed.match(regex);
    if (match) {
      return {
        valid: true,
        platform: platform.replace('_vod', ''),
        extractedId: match[match.length - 1] || match[1],
      };
    }
  }

  return { valid: false, error: 'Unsupported video platform URL.' };
}

export interface FileValidationResult {
  valid: boolean;
  useMultipart?: boolean;
  partCount?: number;
  error?: string;
}

/**
 * Validates local video file upload constraints
 */
export function validateFileUpload(file: { mime: string; size: number; name?: string } | null | undefined): FileValidationResult {
  const ALLOWED_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const MULTIPART_THRESHOLD = 104857600; // 100MB (0x6400000)
  const MAX_FILE_SIZE = 5368709120; // 5GB

  if (!file || typeof file !== 'object') {
    return { valid: false, error: 'Invalid file object' };
  }

  if (!ALLOWED_MIMES.includes(file.mime)) {
    return {
      valid: false,
      error: `Unsupported MIME type: ${file.mime}. Allowed: ${ALLOWED_MIMES.join(', ')}`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File size must be greater than 0 bytes' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds maximum size of 5GB' };
  }

  return {
    valid: true,
    useMultipart: file.size > MULTIPART_THRESHOLD,
    partCount: file.size > MULTIPART_THRESHOLD ? Math.ceil(file.size / (10 * 1024 * 1024)) : 1,
  };
}

/**
 * Initiates ingestion for a video URL or local upload
 */
export async function processVideoIngestion(params: {
  sourceType: 'url' | 'upload';
  url?: string;
  filePath?: string;
  clipConfig?: VideoEntity['clipConfig'];
  workspaceId?: string;
}): Promise<VideoEntity> {
  const { sourceType, url, filePath, clipConfig, workspaceId } = params;

  if (sourceType === 'url') {
    const check = detectPlatformUrl(url);
    if (!check.valid) {
      throw new Error(check.error || 'Invalid video URL');
    }

    const title = `Clips from ${check.platform || 'Online Video'} (${check.extractedId || 'clip'})`;
    const video = db.createVideo({
      workspaceId,
      sourceType: 'url',
      sourceUrl: url,
      title,
      duration: 317, // default estimate
      status: 'pending',
      progress: 0,
      clipConfig,
    });

    return video;
  } else {
    if (!filePath) {
      throw new Error('filePath is required for upload source type');
    }

    const filename = path.basename(filePath);
    const video = db.createVideo({
      workspaceId,
      sourceType: 'upload',
      filePath,
      title: filename.replace(/\.[^/.]+$/, ''),
      duration: 180,
      status: 'pending',
      progress: 0,
      clipConfig,
    });

    return video;
  }
}
