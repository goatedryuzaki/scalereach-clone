/**
 * ScaleReach Reference Oracles
 * Authoritative mathematical and logical reference implementation
 * derived strictly from ORIGINAL_REQUEST.md, PROJECT.md, and Survey Reports 1-3.
 */

const PLATFORM_PATTERNS = {
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
  direct_video: /^https?:\/\/.+\.(mp4|mov|webm)(\?.*)?$/i
};

/**
 * Platform URL Detection Oracle
 */
function detectPlatformUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  // Reject unsupported protocols
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { valid: false, error: 'Invalid protocol: only HTTP/HTTPS URLs are supported.' };
  }

  // Check twitch live stream rejection
  if (PLATFORM_PATTERNS.twitch_live.test(url) && !url.includes('/videos/')) {
    return {
      valid: false,
      platform: 'twitch',
      isLive: true,
      error: 'Live streams are not supported. Please provide a finished VOD URL.'
    };
  }

  // Check playlist rejection
  if (url.includes('list=') && !url.includes('v=')) {
    return { valid: false, error: 'Playlists are not supported. Please provide a direct video URL.' };
  }

  for (const [platform, regex] of Object.entries(PLATFORM_PATTERNS)) {
    if (platform === 'twitch_live') continue;
    const match = url.match(regex);
    if (match) {
      return {
        valid: true,
        platform: platform.replace('_vod', ''),
        extractedId: match[match.length - 1] || match[1]
      };
    }
  }

  return { valid: false, error: 'Unsupported video platform URL.' };
}

/**
 * File Ingestion Upload Oracle
 */
function validateFileUpload(file) {
  const ALLOWED_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const MULTIPART_THRESHOLD = 104857600; // 100MB (0x6400000)
  const MAX_FILE_SIZE = 5368709120; // 5GB

  if (!file || typeof file !== 'object') {
    return { valid: false, error: 'Invalid file object' };
  }

  if (!ALLOWED_MIMES.includes(file.mime)) {
    return {
      valid: false,
      error: `Unsupported MIME type: ${file.mime}. Allowed: ${ALLOWED_MIMES.join(', ')}`
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
    partCount: file.size > MULTIPART_THRESHOLD ? Math.ceil(file.size / (10 * 1024 * 1024)) : 1
  };
}

/**
 * Subtitle Timing Clamping Oracle
 * segment[i].endTime = Math.min(segment[i].endTime, segment[i+1].startTime)
 */
function clampSubtitleTimings(words) {
  if (!Array.isArray(words)) return [];
  const clamped = words.map(w => ({ ...w }));

  for (let i = 0; i < clamped.length; i++) {
    // If end is before or equal to start, give minimum 50ms duration
    if (clamped[i].end <= clamped[i].start) {
      clamped[i].end = Number((clamped[i].start + 0.05).toFixed(3));
    }

    if (i < clamped.length - 1) {
      if (clamped[i].end > clamped[i + 1].start) {
        clamped[i].end = clamped[i + 1].start;
      }
    }
  }

  return clamped;
}

/**
 * Phrase Chunking Oracle
 * Groups words into subtitle chunks based on wordsPerLine (1-6) or punctuation [!?.]$
 */
function chunkWordsIntoPhrases(words, wordsPerLine = 3) {
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    currentChunk.push(word);
    const hasPunctuation = /[.!?]$/.test(word.word.trim());
    const reachedLength = currentChunk.length >= wordsPerLine;

    if (hasPunctuation || reachedLength) {
      const startTime = currentChunk[0].start;
      const endTime = currentChunk[currentChunk.length - 1].end;
      chunks.push({
        id: `chunk-${chunks.length}`,
        text: currentChunk.map(w => w.word).join(' '),
        words: currentChunk,
        start: startTime,
        end: endTime,
        duration: Number((endTime - startTime).toFixed(3))
      });
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    const startTime = currentChunk[0].start;
    const endTime = currentChunk[currentChunk.length - 1].end;
    chunks.push({
      id: `chunk-${chunks.length}`,
      text: currentChunk.map(w => w.word).join(' '),
      words: currentChunk,
      start: startTime,
      end: endTime,
      duration: Number((endTime - startTime).toFixed(3))
    });
  }

  return chunks;
}

/**
 * ASS Subtitle Format & Escaping Oracle
 */
function escapeAssText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\r?\n/g, '\\N')
    .replace(/<[^>]*>/g, ''); // strip html tags
}

function hexToAssColor(hex, alpha = 0) {
  // Hex to BGR ASS color &H[AA][BB][GG][RR]&
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = clean.substring(0, 2);
  const g = clean.substring(2, 4);
  const b = clean.substring(4, 6);
  const a = alpha.toString(16).padStart(2, '0').toUpperCase();
  return `&H${a}${b.toUpperCase()}${g.toUpperCase()}${r.toUpperCase()}&`;
}

function generateAssSubtitles(clipId, preset, phrases) {
  const primaryAssColor = hexToAssColor(preset.primaryColor.startsWith('#') ? preset.primaryColor : '#FFFFFF');
  const highlightAssColor = hexToAssColor(preset.highlightColor.startsWith('#') ? preset.highlightColor : '#FFD700');

  let doc = `[Script Info]
Title: ScaleReach - ${clipId}
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${preset.fontFamily},58,${primaryAssColor},${highlightAssColor},&H00000000&,&H80000000&,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  for (const phrase of phrases) {
    const startStr = formatTime(phrase.start);
    const endStr = formatTime(phrase.end);
    let lineText = '';

    for (const w of phrase.words) {
      const cleanWord = escapeAssText(w.word);
      if (w.isHighlighted) {
        lineText += `{\\c${highlightAssColor}}${cleanWord}{\\c${primaryAssColor}} `;
      } else {
        lineText += `${cleanWord} `;
      }
    }
    doc += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${lineText.trim()}\n`;
  }

  return doc;
}

/**
 * 9:16 Video Re-framing Layout Math Oracle
 */
function calculateLayoutGeometry(mode, source, options = {}) {
  const canvasWidth = 1080;
  const canvasHeight = 1920;

  if (mode === 'single_speaker') {
    // 9:16 crop from 16:9 source (1920x1080)
    // crop width at height 1080 is 1080 * 9 / 16 = 607.5px
    const cropHeight = source.height;
    const cropWidth = Math.round(cropHeight * (9 / 16));
    const faceX = options.faceX !== undefined ? options.faceX : source.width / 2;
    // Centroid clamping
    const minX = 0;
    const maxX = source.width - cropWidth;
    const cropX = Math.max(minX, Math.min(maxX, Math.round(faceX - cropWidth / 2)));

    return {
      canvas: { width: canvasWidth, height: canvasHeight },
      crop: { x: cropX, y: 0, width: cropWidth, height: cropHeight },
      scale: { width: canvasWidth, height: canvasHeight }
    };
  }

  if (mode === 'split_screen') {
    const dividerRatio = options.dividerRatio !== undefined ? Math.max(0.2, Math.min(0.8, options.dividerRatio)) : 0.5;
    const topHeight = Math.round(canvasHeight * dividerRatio);
    const bottomHeight = canvasHeight - topHeight;
    const dividerWidth = 2; // 2px accent line

    return {
      canvas: { width: canvasWidth, height: canvasHeight },
      topPane: { x: 0, y: 0, width: canvasWidth, height: topHeight },
      bottomPane: { x: 0, y: topHeight, width: canvasWidth, height: bottomHeight },
      divider: { y: topHeight, height: dividerWidth, color: '#6366F1' }
    };
  }

  if (mode === 'blur_fill') {
    // Original 16:9 centered in 9:16, background blurred by 25px
    const scaledHeight = Math.round(canvasWidth * (source.height / source.width)); // 1080 * (1080/1920) = 608px
    const offsetY = Math.round((canvasHeight - scaledHeight) / 2);

    return {
      canvas: { width: canvasWidth, height: canvasHeight },
      foreground: { x: 0, y: offsetY, width: canvasWidth, height: scaledHeight },
      backgroundBlur: { blurRadius: 25, width: canvasWidth, height: canvasHeight }
    };
  }

  throw new Error(`Unknown layout mode: ${mode}`);
}

/**
 * Virality Score Calculation Oracle
 */
function calculateViralityScore(metrics) {
  const hook = Math.max(0, Math.min(100, metrics.hookStrength || 80));
  const engagement = Math.max(0, Math.min(100, metrics.engagementFlow || 75));
  const emotion = Math.max(0, Math.min(100, metrics.emotionalResonance || 70));

  // Weighted formula: 40% hook, 35% engagement, 25% emotional resonance
  const score = Math.round(0.40 * hook + 0.35 * engagement + 0.25 * emotion);

  let reason = 'Strong opening hook and high engagement pacing.';
  if (score >= 90) reason = 'Exceptional retention potential with an irresistible curiosity gap.';
  else if (score < 75) reason = 'Moderate engagement; pacing could be tightened.';

  let suggestion = 'Consider cutting the first 1.5 seconds to jump directly into the punchline.';
  if (score >= 95) suggestion = 'Flawless pacing. Ready for direct distribution across all platforms.';

  return {
    viralityScore: score,
    hookStrength: hook,
    engagementFlow: engagement,
    emotionalResonance: emotion,
    viralityReason: reason,
    improvementSuggestion: suggestion,
    hooks: score > 85 ? ['Curiosity Gap', 'Shocking Truth'] : ['Value Hook'],
    emotions: score > 85 ? ['Curious', 'Surprised'] : ['Inspired'],
    recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels']
  };
}

/**
 * Audio Waveform Peak Decimation Oracle
 */
function computeWaveformPeaks(channelData, numColumns = 100) {
  if (!channelData || channelData.length === 0) {
    return Array(numColumns).fill({ min: 0, max: 0 });
  }

  const blockSize = Math.floor(channelData.length / numColumns);
  const peaks = [];

  for (let i = 0; i < numColumns; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    let min = 0;
    let max = 0;

    for (let j = start; j < end; j++) {
      const val = channelData[j];
      if (val > max) max = val;
      if (val < min) min = val;
    }

    // Normalized clamping to [-1.0, 1.0]
    peaks.push({
      min: Math.max(-1.0, Math.min(1.0, min)),
      max: Math.max(-1.0, Math.min(1.0, max))
    });
  }

  return peaks;
}

module.exports = {
  detectPlatformUrl,
  validateFileUpload,
  clampSubtitleTimings,
  chunkWordsIntoPhrases,
  escapeAssText,
  hexToAssColor,
  generateAssSubtitles,
  calculateLayoutGeometry,
  calculateViralityScore,
  computeWaveformPeaks
};
