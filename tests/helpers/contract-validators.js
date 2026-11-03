/**
 * ScaleReach Interface Contract Validators
 * Validates domain objects strictly against PROJECT.md schemas
 */

function validateVideoSubmitRequest(req) {
  const errors = [];
  if (!req || typeof req !== 'object') return { valid: false, errors: ['Request must be an object'] };

  if (!['url', 'upload'].includes(req.sourceType)) {
    errors.push(`Invalid sourceType: "${req.sourceType}". Must be 'url' or 'upload'.`);
  }
  if (req.sourceType === 'url') {
    if (!req.url || typeof req.url !== 'string') {
      errors.push('Missing or invalid "url" string for sourceType="url"');
    }
  }
  if (req.sourceType === 'upload') {
    if (!req.filePath || typeof req.filePath !== 'string') {
      errors.push('Missing or invalid "filePath" string for sourceType="upload"');
    }
  }
  if (req.duration && !['<30s', '30s-60s', '60s-90s', '90s-3m', 'any'].includes(req.duration)) {
    errors.push(`Invalid duration: "${req.duration}".`);
  }
  if (req.clipTypes && !Array.isArray(req.clipTypes)) {
    errors.push('"clipTypes" must be an array of strings');
  }

  return { valid: errors.length === 0, errors };
}

function validateVideoSubmitResponse(res) {
  const errors = [];
  if (!res || typeof res !== 'object') return { valid: false, errors: ['Response must be an object'] };

  if (typeof res.videoId !== 'string' || res.videoId.trim() === '') {
    errors.push('videoId must be a non-empty string');
  }
  if (typeof res.title !== 'string') {
    errors.push('title must be a string');
  }
  if (typeof res.duration !== 'number' || isNaN(res.duration) || res.duration < 0) {
    errors.push('duration must be a non-negative number');
  }
  if (!['pending', 'processing', 'completed', 'failed'].includes(res.status)) {
    errors.push(`Invalid status: "${res.status}"`);
  }
  if (typeof res.progress !== 'number' || res.progress < 0 || res.progress > 100) {
    errors.push(`progress must be a number between 0 and 100, got ${res.progress}`);
  }

  return { valid: errors.length === 0, errors };
}

function validateClipItem(clip) {
  const errors = [];
  if (!clip || typeof clip !== 'object') return { valid: false, errors: ['Clip must be an object'] };

  if (typeof clip.id !== 'string') errors.push('id must be string');
  if (typeof clip.videoId !== 'string') errors.push('videoId must be string');
  if (typeof clip.title !== 'string') errors.push('title must be string');
  if (typeof clip.startTime !== 'number' || clip.startTime < 0) errors.push('startTime must be >= 0');
  if (typeof clip.endTime !== 'number' || clip.endTime <= clip.startTime) {
    errors.push(`endTime (${clip.endTime}) must be greater than startTime (${clip.startTime})`);
  }
  if (typeof clip.duration !== 'number' || Math.abs(clip.duration - (clip.endTime - clip.startTime)) > 0.05) {
    errors.push('duration must match endTime - startTime');
  }
  if (typeof clip.viralityScore !== 'number' || clip.viralityScore < 0 || clip.viralityScore > 100) {
    errors.push(`viralityScore must be between 0 and 100, got ${clip.viralityScore}`);
  }
  if (typeof clip.viralityReason !== 'string') errors.push('viralityReason must be string');
  if (typeof clip.improvementSuggestion !== 'string') errors.push('improvementSuggestion must be string');
  if (!Array.isArray(clip.hooks)) errors.push('hooks must be an array of strings');
  if (!Array.isArray(clip.emotions)) errors.push('emotions must be an array of strings');
  if (!Array.isArray(clip.recommendedPlatforms)) errors.push('recommendedPlatforms must be an array of strings');
  if (!['9:16', '16:9', '1:1'].includes(clip.aspectRatio)) {
    errors.push(`Invalid aspectRatio: "${clip.aspectRatio}"`);
  }
  if (typeof clip.templateId !== 'string') errors.push('templateId must be string');

  return { valid: errors.length === 0, errors };
}

function validateCaptionData(caption) {
  const errors = [];
  if (!caption || typeof caption !== 'object') return { valid: false, errors: ['Caption must be an object'] };

  if (typeof caption.clipId !== 'string') errors.push('clipId must be string');
  if (typeof caption.presetId !== 'string') errors.push('presetId must be string');
  if (!Array.isArray(caption.words)) {
    errors.push('words must be an array');
  } else {
    caption.words.forEach((w, idx) => {
      if (typeof w.id !== 'string') errors.push(`word[${idx}].id must be string`);
      if (typeof w.word !== 'string') errors.push(`word[${idx}].word must be string`);
      if (typeof w.start !== 'number' || w.start < 0) errors.push(`word[${idx}].start must be >= 0`);
      if (typeof w.end !== 'number' || w.end < w.start) errors.push(`word[${idx}].end must be >= start`);
    });
  }

  if (!caption.style || typeof caption.style !== 'object') {
    errors.push('style must be an object');
  } else {
    const s = caption.style;
    if (typeof s.fontFamily !== 'string') errors.push('style.fontFamily must be string');
    if (typeof s.fontSize !== 'number') errors.push('style.fontSize must be number');
    if (typeof s.textColor !== 'string') errors.push('style.textColor must be string');
    if (typeof s.highlightColor !== 'string') errors.push('style.highlightColor must be string');
    if (typeof s.strokeColor !== 'string') errors.push('style.strokeColor must be string');
    if (typeof s.strokeWidth !== 'number') errors.push('style.strokeWidth must be number');
    if (typeof s.animation !== 'string') errors.push('style.animation must be string');
  }

  return { valid: errors.length === 0, errors };
}

function validateExportRequest(req) {
  const errors = [];
  if (!req || typeof req !== 'object') return { valid: false, errors: ['Request must be an object'] };

  if (!['1080p', '720p', '4k'].includes(req.resolution)) {
    errors.push(`Invalid resolution: "${req.resolution}"`);
  }
  if (![30, 60].includes(req.fps)) {
    errors.push(`Invalid fps: ${req.fps}. Must be 30 or 60.`);
  }
  // Zero-paywall requirement: includeWatermark must ALWAYS be false
  if (req.includeWatermark !== false) {
    errors.push('includeWatermark must strictly be false (zero-paywall unwatermarked guarantee).');
  }
  if (!['9:16', '16:9', '1:1'].includes(req.aspectRatio)) {
    errors.push(`Invalid aspectRatio: "${req.aspectRatio}"`);
  }
  if (typeof req.presetId !== 'string') errors.push('presetId must be string');
  if (!['single', 'split', 'blur_fill'].includes(req.layoutType)) {
    errors.push(`Invalid layoutType: "${req.layoutType}"`);
  }

  return { valid: errors.length === 0, errors };
}

function validateExportResponse(res) {
  const errors = [];
  if (!res || typeof res !== 'object') return { valid: false, errors: ['Response must be an object'] };

  if (typeof res.jobId !== 'string' || res.jobId.trim() === '') {
    errors.push('jobId must be a non-empty string');
  }
  if (!['queued', 'rendering', 'completed', 'failed'].includes(res.status)) {
    errors.push(`Invalid status: "${res.status}"`);
  }
  if (typeof res.progress !== 'number' || res.progress < 0 || res.progress > 100) {
    errors.push(`progress must be between 0 and 100, got ${res.progress}`);
  }
  if (res.status === 'completed' && (!res.downloadUrl || typeof res.downloadUrl !== 'string')) {
    errors.push('downloadUrl is required when status is "completed"');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateVideoSubmitRequest,
  validateVideoSubmitResponse,
  validateClipItem,
  validateCaptionData,
  validateExportRequest,
  validateExportResponse
};
