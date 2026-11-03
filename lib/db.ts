import fs from 'fs';
import path from 'path';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'agency' | 'enterprise' | 'unlimited_pro';
  role: 'owner' | 'admin' | 'member';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  minutesRemaining: number;
  minutesTotal: number;
  watermarkEnabled: boolean;
  export1080pUnlocked: boolean;
  export60fpsUnlocked: boolean;
  unlimitedExports: boolean;
}

export interface VideoEntity {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  duration: number;
  status: 'pending' | 'downloading' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  sourceType: 'url' | 'upload';
  sourceUrl: string;
  filePath?: string;
  thumbnailUrl: string;
  progress: number;
  clipConfig?: {
    clipModel?: string;
    duration?: string;
    clipTypes?: string[];
    customPrompt?: string;
    captionTemplateId?: string;
    aspectRatio?: '9:16' | '16:9' | '1:1';
    backgroundAssetId?: string;
  };
  notes?: string;
  expiresAt: string | null; // null for permanent local storage
  createdAt: string;
  updatedAt: string;
}

export interface ClipEntity {
  id: string;
  videoId: string;
  title: string;
  introTitle?: string | null;
  startTime: number;
  endTime: number;
  duration: number;
  transcript?: string;
  viralityScore: number;
  viralityReason: string;
  improvementSuggestion: string;
  hooks: string[];
  emotions: string[];
  recommendedPlatforms: string[];
  aspectRatio: '9:16' | '16:9' | '1:1';
  templateId: string;
  thumbnailUrl?: string;
  favorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaptionWord {
  id: string;
  word: string;
  start: number;
  end: number;
  isHighlighted?: boolean;
  color?: string;
  emoji?: string;
  deleted?: boolean;
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  animation: string;
  shadowBlur?: number;
  shadowColor?: string;
  wordsPerLine?: number;
  textTransform?: 'uppercase' | 'capitalize' | 'lowercase' | 'none';
  verticalPosition?: number;
}

export interface CaptionData {
  clipId: string;
  presetId: string;
  words: CaptionWord[];
  style: CaptionStyle;
}

export interface ExportJob {
  jobId: string;
  clipId: string;
  resolution: '1080p' | '720p' | '4k';
  fps: 30 | 60;
  includeWatermark: false; // zero-paywall guarantee
  aspectRatio: '9:16' | '16:9' | '1:1';
  presetId: string;
  layoutType: 'single' | 'split' | 'blur_fill';
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string | null;
  outputPath?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandTemplate {
  id: string;
  name: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  captionTemplateId: string;
  logoOverlay?: {
    storageKey: string;
    url: string;
    x: number;
    y: number;
    width: number;
    opacity: number;
  };
  isDefault?: boolean;
  createdAt: string;
}

interface StorageSchema {
  workspace: Workspace;
  videos: Record<string, VideoEntity>;
  clips: Record<string, ClipEntity>;
  captions: Record<string, CaptionData>;
  exportJobs: Record<string, ExportJob>;
  brandTemplates: Record<string, BrandTemplate>;
}

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const DB_FILE = path.join(STORAGE_DIR, 'db.json');

const INITIAL_WORKSPACE: Workspace = {
  id: '0tw4uwrqqbgmw0kuqm9',
  name: "Ryuzaki's Workspace",
  slug: 'goatedryuzaki',
  plan: 'unlimited_pro',
  role: 'owner',
  ownerId: 'local_user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  minutesRemaining: Infinity,
  minutesTotal: Infinity,
  watermarkEnabled: false,
  export1080pUnlocked: true,
  export60fpsUnlocked: true,
  unlimitedExports: true,
};

const SAMPLE_VIDEO_ID = 'NP_YeDf3CshTE1VklsggI';
const SAMPLE_CLIP_ID = 'ADWzEcKDfeqMZ1beA7BQX';

const INITIAL_VIDEOS: Record<string, VideoEntity> = {
  [SAMPLE_VIDEO_ID]: {
    id: SAMPLE_VIDEO_ID,
    workspaceId: INITIAL_WORKSPACE.id,
    title: 'How to Build and Scale Products (Podcast Clip)',
    description: 'Masterclass on growth, product strategy, and content marketing hooks.',
    duration: 317,
    status: 'completed',
    sourceType: 'url',
    sourceUrl: 'https://www.youtube.com/watch?v=gCHSEGBp8ME',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60',
    progress: 100,
    clipConfig: {
      clipModel: 'ClipPro',
      duration: '30s-60s',
      clipTypes: ['viral-clips', 'speakers-insights'],
      customPrompt: 'Focus on high energy counter-intuitive insights',
      captionTemplateId: 'hormozi',
      aspectRatio: '9:16',
    },
    expiresAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const INITIAL_CLIPS: Record<string, ClipEntity> = {
  [SAMPLE_CLIP_ID]: {
    id: SAMPLE_CLIP_ID,
    videoId: SAMPLE_VIDEO_ID,
    title: 'The Uncomfortable Truth About Virality',
    introTitle: 'Stop Making This Mistake!',
    startTime: 18.5,
    endTime: 54.2,
    duration: 35.7,
    transcript: 'Welcome to ScaleReach, the fastest way to turn podcasts into viral shorts. Look at how fast they are talking!',
    viralityScore: 94,
    viralityReason: 'Strong curiosity gap opening followed by rapid punchy insight and high emotional contrast.',
    improvementSuggestion: 'Flawless pacing. Ready for direct distribution across all platforms.',
    hooks: ['Curiosity Gap', 'Shocking Truth', 'Value Hook'],
    emotions: ['Curious', 'Surprised', 'Inspired'],
    recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
    aspectRatio: '9:16',
    templateId: 'hormozi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=60',
    favorited: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'clip_second_sample_98': {
    id: 'clip_second_sample_98',
    videoId: SAMPLE_VIDEO_ID,
    title: 'Why 99% of Content Creators Fail in Year One',
    introTitle: 'Pay Attention to This!',
    startTime: 62.0,
    endTime: 108.5,
    duration: 46.5,
    transcript: 'Everyone thinks consistency means posting every single day, but consistency without high retention is just organized noise.',
    viralityScore: 96,
    viralityReason: 'Contrarian point of view challenging industry common knowledge with explosive retention metrics.',
    improvementSuggestion: 'Flawless pacing. Ready for direct distribution across all platforms.',
    hooks: ['Contrarian Insight', 'Curiosity Gap'],
    emotions: ['Shocked', 'Motivated'],
    recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
    aspectRatio: '9:16',
    templateId: 'mrbeast-pro',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=60',
    favorited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const INITIAL_CAPTIONS: Record<string, CaptionData> = {
  [SAMPLE_CLIP_ID]: {
    clipId: SAMPLE_CLIP_ID,
    presetId: 'hormozi',
    words: [
      { id: 'w-0', word: 'Welcome', start: 0.42, end: 0.88, isHighlighted: false },
      { id: 'w-1', word: 'to', start: 0.90, end: 1.05, isHighlighted: false },
      { id: 'w-2', word: 'ScaleReach,', start: 1.08, end: 1.62, isHighlighted: true, color: '#FFFF00' },
      { id: 'w-3', word: 'the', start: 1.65, end: 1.80, isHighlighted: false },
      { id: 'w-4', word: 'fastest', start: 1.82, end: 2.25, isHighlighted: true, color: '#00FF00' },
      { id: 'w-5', word: 'way', start: 2.28, end: 2.50, isHighlighted: false },
      { id: 'w-6', word: 'to', start: 2.52, end: 2.65, isHighlighted: false },
      { id: 'w-7', word: 'turn', start: 2.68, end: 2.95, isHighlighted: false },
      { id: 'w-8', word: 'podcasts', start: 2.98, end: 3.45, isHighlighted: false },
      { id: 'w-9', word: 'into', start: 3.48, end: 3.70, isHighlighted: false },
      { id: 'w-10', word: 'viral', start: 3.72, end: 4.10, isHighlighted: true, color: '#FFD700' },
      { id: 'w-11', word: 'shorts.', start: 4.12, end: 4.80, isHighlighted: false },
    ],
    style: {
      fontFamily: 'Anton',
      fontSize: 48,
      textColor: '#FFFFFF',
      highlightColor: '#FFD700',
      strokeColor: '#000000',
      strokeWidth: 5,
      animation: 'punch',
    },
  },
};

class LocalDatabase {
  private data: StorageSchema;
  private initialized = false;

  constructor() {
    this.data = {
      workspace: INITIAL_WORKSPACE,
      videos: INITIAL_VIDEOS,
      clips: INITIAL_CLIPS,
      captions: INITIAL_CAPTIONS,
      exportJobs: {},
      brandTemplates: {
        bt_1: {
          id: 'bt_1',
          name: 'My Personal Branding',
          aspectRatio: '9:16',
          captionTemplateId: 'hormozi',
          createdAt: new Date().toISOString(),
        },
      },
    };
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.workspace) this.data.workspace = { ...INITIAL_WORKSPACE, ...parsed.workspace };
        if (parsed.videos) this.data.videos = { ...INITIAL_VIDEOS, ...parsed.videos };
        if (parsed.clips) this.data.clips = { ...INITIAL_CLIPS, ...parsed.clips };
        if (parsed.captions) this.data.captions = { ...INITIAL_CAPTIONS, ...parsed.captions };
        if (parsed.exportJobs) this.data.exportJobs = parsed.exportJobs;
        if (parsed.brandTemplates) this.data.brandTemplates = parsed.brandTemplates;
      } else {
        this.persist();
      }
      this.initialized = true;
    } catch {
      // In-memory fallback if filesystem access fails
      this.initialized = true;
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch {
      // Fallback silently if disk is temporarily locked
    }
  }

  // Workspaces
  getWorkspace(): Workspace {
    return { ...this.data.workspace };
  }

  updateWorkspace(updates: Partial<Workspace>): Workspace {
    this.data.workspace = {
      ...this.data.workspace,
      ...updates,
      // Zero-paywall overrides are strictly enforced
      minutesRemaining: Infinity,
      watermarkEnabled: false,
      export1080pUnlocked: true,
      export60fpsUnlocked: true,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return { ...this.data.workspace };
  }

  // Videos
  getVideo(id: string): VideoEntity | null {
    return this.data.videos[id] ? { ...this.data.videos[id] } : null;
  }

  listVideos(): VideoEntity[] {
    return Object.values(this.data.videos).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createVideo(data: Partial<VideoEntity> & { sourceType: 'url' | 'upload' }): VideoEntity {
    const id = data.id || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const video: VideoEntity = {
      id,
      workspaceId: data.workspaceId || this.data.workspace.id,
      title: data.title || (data.sourceType === 'url' ? 'Imported Video' : 'Uploaded Video'),
      description: data.description || '',
      duration: data.duration !== undefined ? data.duration : 180,
      status: data.status || 'pending',
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl || '',
      filePath: data.filePath || '',
      thumbnailUrl:
        data.thumbnailUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      progress: data.progress !== undefined ? data.progress : 0,
      clipConfig: data.clipConfig,
      notes: data.notes || '',
      expiresAt: null, // Guaranteed permanent storage
      createdAt: now,
      updatedAt: now,
    };

    this.data.videos[id] = video;
    this.persist();
    return { ...video };
  }

  updateVideo(id: string, updates: Partial<VideoEntity>): VideoEntity | null {
    const video = this.data.videos[id];
    if (!video) return null;
    const updated = {
      ...video,
      ...updates,
      expiresAt: null, // Keep permanent
      updatedAt: new Date().toISOString(),
    };
    this.data.videos[id] = updated;
    this.persist();
    return { ...updated };
  }

  deleteVideo(id: string): boolean {
    if (!this.data.videos[id]) return false;
    delete this.data.videos[id];
    // Cascade delete clips
    for (const [clipId, clip] of Object.entries(this.data.clips)) {
      if (clip.videoId === id) {
        delete this.data.clips[clipId];
        delete this.data.captions[clipId];
      }
    }
    this.persist();
    return true;
  }

  // Clips
  getClip(id: string): ClipEntity | null {
    return this.data.clips[id] ? { ...this.data.clips[id] } : null;
  }

  listClipsForVideo(videoId: string): ClipEntity[] {
    return Object.values(this.data.clips)
      .filter(c => c.videoId === videoId)
      .sort((a, b) => b.viralityScore - a.viralityScore);
  }

  createClip(data: Partial<ClipEntity> & { videoId: string }): ClipEntity {
    const id = data.id || `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = data.startTime !== undefined ? data.startTime : 0;
    const endTime = data.endTime !== undefined ? data.endTime : 30;
    const duration = Number((endTime - startTime).toFixed(2));
    const now = new Date().toISOString();

    const clip: ClipEntity = {
      id,
      videoId: data.videoId,
      title: data.title || 'Viral Soundbite',
      introTitle: data.introTitle || null,
      startTime,
      endTime,
      duration,
      transcript: data.transcript || '',
      viralityScore: data.viralityScore !== undefined ? data.viralityScore : 88,
      viralityReason: data.viralityReason || 'High impact soundbite with strong punchline',
      improvementSuggestion: data.improvementSuggestion || 'Consider cutting first 1.5 seconds for punchiness.',
      hooks: data.hooks && data.hooks.length > 0 ? data.hooks : ['Curiosity Gap', 'Value Hook'],
      emotions: data.emotions && data.emotions.length > 0 ? data.emotions : ['Curious', 'Surprised'],
      recommendedPlatforms: data.recommendedPlatforms || ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
      aspectRatio: data.aspectRatio || '9:16',
      templateId: data.templateId || 'classic',
      thumbnailUrl:
        data.thumbnailUrl ||
        'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&auto=format&fit=crop&q=60',
      favorited: data.favorited || false,
      createdAt: now,
      updatedAt: now,
    };

    this.data.clips[id] = clip;
    this.persist();
    return { ...clip };
  }

  updateClip(id: string, updates: Partial<ClipEntity>): ClipEntity | null {
    const clip = this.data.clips[id];
    if (!clip) return null;

    let startTime = updates.startTime !== undefined ? updates.startTime : clip.startTime;
    let endTime = updates.endTime !== undefined ? updates.endTime : clip.endTime;
    if (endTime <= startTime) {
      endTime = startTime + 1;
    }
    const duration = Number((endTime - startTime).toFixed(2));

    const updated: ClipEntity = {
      ...clip,
      ...updates,
      startTime,
      endTime,
      duration,
      updatedAt: new Date().toISOString(),
    };

    this.data.clips[id] = updated;
    this.persist();
    return { ...updated };
  }

  deleteClip(id: string): boolean {
    if (!this.data.clips[id]) return false;
    delete this.data.clips[id];
    delete this.data.captions[id];
    this.persist();
    return true;
  }

  // Captions
  getCaptions(clipId: string): CaptionData | null {
    return this.data.captions[clipId] ? { ...this.data.captions[clipId] } : null;
  }

  saveCaptions(clipId: string, captionData: CaptionData): CaptionData {
    this.data.captions[clipId] = { ...captionData };
    this.persist();
    return { ...captionData };
  }

  updateCaptionWords(clipId: string, words: CaptionWord[]): CaptionData | null {
    const caption = this.data.captions[clipId];
    if (!caption) return null;
    caption.words = [...words];
    this.persist();
    return { ...caption };
  }

  updateCaptionStyle(clipId: string, styleUpdates: Partial<CaptionStyle>): CaptionData | null {
    const caption = this.data.captions[clipId];
    if (!caption) return null;
    caption.style = { ...caption.style, ...styleUpdates };
    this.persist();
    return { ...caption };
  }

  // Export Jobs
  createExportJob(data: Partial<ExportJob> & { clipId: string }): ExportJob {
    const jobId = data.jobId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const job: ExportJob = {
      jobId,
      clipId: data.clipId,
      resolution: data.resolution || '1080p',
      fps: data.fps || 60,
      includeWatermark: false, // strictly false
      aspectRatio: data.aspectRatio || '9:16',
      presetId: data.presetId || 'classic',
      layoutType: data.layoutType || 'single',
      status: 'queued',
      progress: 0,
      downloadUrl: null,
      outputPath: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };

    this.data.exportJobs[jobId] = job;
    this.persist();
    return { ...job };
  }

  getExportJob(jobId: string): ExportJob | null {
    return this.data.exportJobs[jobId] ? { ...this.data.exportJobs[jobId] } : null;
  }

  updateExportJob(jobId: string, updates: Partial<ExportJob>): ExportJob | null {
    const job = this.data.exportJobs[jobId];
    if (!job) return null;
    const updated: ExportJob = {
      ...job,
      ...updates,
      includeWatermark: false, // strictly false
      updatedAt: new Date().toISOString(),
    };
    this.data.exportJobs[jobId] = updated;
    this.persist();
    return { ...updated };
  }

  // Brand Templates
  listBrandTemplates(): BrandTemplate[] {
    return Object.values(this.data.brandTemplates);
  }

  createBrandTemplate(data: Partial<BrandTemplate> & { name: string }): BrandTemplate {
    const id = data.id || `bt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const template: BrandTemplate = {
      id,
      name: data.name,
      aspectRatio: data.aspectRatio || '9:16',
      captionTemplateId: data.captionTemplateId || 'classic',
      logoOverlay: data.logoOverlay,
      isDefault: data.isDefault || false,
      createdAt: new Date().toISOString(),
    };
    this.data.brandTemplates[id] = template;
    this.persist();
    return { ...template };
  }
}

// Global singleton instance
export const db = new LocalDatabase();
