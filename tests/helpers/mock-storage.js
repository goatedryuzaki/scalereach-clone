/**
 * ScaleReach Mock Storage & Database Engine
 * Isolated in-memory repository for zero-dependency execution
 */

class MockStorage {
  constructor() {
    this.reset();
  }

  reset() {
    this.workspace = {
      id: 'ws_local_zero_paywall',
      name: 'Personal Studio',
      plan: 'unlimited_pro',
      role: 'owner',
      minutesRemaining: Infinity,
      minutesTotal: Infinity,
      watermarkEnabled: false,
      export1080pUnlocked: true,
      export60fpsUnlocked: true,
      unlimitedExports: true
    };
    this.videos = new Map();
    this.clips = new Map();
    this.captions = new Map();
    this.exportJobs = new Map();
  }

  // Workspace
  getWorkspace() {
    return { ...this.workspace };
  }

  // Videos
  createVideo(data) {
    const id = data.id || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const video = {
      id,
      title: data.title || 'Untitled Video',
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl || '',
      filePath: data.filePath || '',
      duration: data.duration || 180,
      status: 'pending',
      progress: 0,
      clipConfig: data.clipConfig || {},
      expiresAt: null, // Permanent local storage guarantee
      createdAt: new Date().toISOString()
    };
    this.videos.set(id, video);
    return video;
  }

  getVideo(id) {
    return this.videos.get(id) || null;
  }

  updateVideo(id, updates) {
    const video = this.videos.get(id);
    if (!video) return null;
    Object.assign(video, updates);
    return video;
  }

  // Clips
  createClip(data) {
    const id = data.id || `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clip = {
      id,
      videoId: data.videoId,
      title: data.title || 'Viral Clip',
      startTime: data.startTime || 0,
      endTime: data.endTime || 30,
      duration: Number(((data.endTime || 30) - (data.startTime || 0)).toFixed(2)),
      viralityScore: data.viralityScore !== undefined ? data.viralityScore : 88,
      viralityReason: data.viralityReason || 'High impact soundbite with strong punchline',
      improvementSuggestion: data.improvementSuggestion || 'Tighten initial hook',
      hooks: data.hooks || ['Curiosity Gap'],
      emotions: data.emotions || ['Surprised'],
      recommendedPlatforms: data.recommendedPlatforms || ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
      aspectRatio: data.aspectRatio || '9:16',
      templateId: data.templateId || 'classic'
    };
    this.clips.set(id, clip);
    return clip;
  }

  getClip(id) {
    return this.clips.get(id) || null;
  }

  listClipsForVideo(videoId) {
    return Array.from(this.clips.values()).filter(c => c.videoId === videoId);
  }

  // Captions
  saveCaptions(clipId, captionData) {
    this.captions.set(clipId, captionData);
    return captionData;
  }

  getCaptions(clipId) {
    return this.captions.get(clipId) || null;
  }

  // Exports
  createExportJob(data) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job = {
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
      createdAt: new Date().toISOString()
    };
    this.exportJobs.set(jobId, job);
    return job;
  }

  getExportJob(jobId) {
    return this.exportJobs.get(jobId) || null;
  }

  updateExportJob(jobId, updates) {
    const job = this.exportJobs.get(jobId);
    if (!job) return null;
    Object.assign(job, updates);
    return job;
  }
}

module.exports = {
  MockStorage
};
