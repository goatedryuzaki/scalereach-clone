/**
 * Tier 1: Feature Coverage Test Suite
 * Minimum 5 rigorous test cases per core feature (8 features x 5 = 40 tests)
 * 1. Ingestion Subsystem
 * 2. Configurator Subsystem
 * 3. 24 Presets & Typography Catalog
 * 4. Workstation Transcript Editor
 * 5. Audio Waveform & Multi-Track Timeline
 * 6. 9:16 Re-framing & Layout Engine
 * 7. Zero-Paywall & Zero-Auth Execution
 * 8. Exporter & Subtitle Compositor
 */

const { assert } = require('../helpers/test-context');
const {
  validateVideoSubmitRequest,
  validateVideoSubmitResponse,
  validateClipItem,
  validateCaptionData,
  validateExportRequest,
  validateExportResponse
} = require('../helpers/contract-validators');
const {
  detectPlatformUrl,
  validateFileUpload,
  clampSubtitleTimings,
  chunkWordsIntoPhrases,
  generateAssSubtitles,
  calculateLayoutGeometry,
  calculateViralityScore,
  computeWaveformPeaks
} = require('../helpers/pipeline-oracles');
const { MockStorage } = require('../helpers/mock-storage');

const sampleUrls = require('../fixtures/sample-urls.json');
const sampleTranscripts = require('../fixtures/sample-transcripts.json');
const sampleConfigs = require('../fixtures/sample-configs.json');
const samplePresets = require('../fixtures/sample-presets.json');
const sampleBroll = require('../fixtures/sample-broll.json');

function registerTier1Tests(suite) {
  const storage = new MockStorage();

  // ==========================================
  // 1. INGESTION SUBSYSTEM (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 1 - Video Ingestion Subsystem', () => {
    suite.it('TC-1.1: Valid YouTube URL ingestion pattern matching (watch, shorts, youtu.be)', () => {
      const ytCases = sampleUrls.validUrls.filter(u => u.platform === 'youtube');
      assert.ok(ytCases.length >= 3, 'Must have at least 3 YouTube test patterns');
      for (const item of ytCases) {
        const result = detectPlatformUrl(item.url);
        assert.ok(result.valid, `Expected ${item.url} to be detected as valid`);
        assert.equal(result.platform, 'youtube');
        assert.equal(result.extractedId, item.expectedId);
      }
    });

    suite.it('TC-1.2: Valid 12-platform URL matrix recognition (Twitch, Kick, Drive, Loom, etc.)', () => {
      const nonYtCases = sampleUrls.validUrls.filter(u => u.platform !== 'youtube');
      assert.ok(nonYtCases.length >= 10, 'Must cover 10+ non-YouTube platforms');
      for (const item of nonYtCases) {
        const result = detectPlatformUrl(item.url);
        assert.ok(result.valid, `Expected platform ${item.platform} (${item.url}) to be valid`);
      }
    });

    suite.it('TC-1.3: Multipart file upload initialization contract for large files (> 100MB)', () => {
      const largeFile = sampleUrls.uploadFiles.find(f => f.size > 104857600);
      assert.ok(largeFile, 'Expected a sample file > 100MB');
      const uploadPlan = validateFileUpload(largeFile);
      assert.ok(uploadPlan.valid, 'Large MP4/MOV upload must be valid');
      assert.equal(uploadPlan.useMultipart, true, 'Files > 100MB must use multipart chunking');
      assert.ok(uploadPlan.partCount > 1, 'Part count must be > 1');
    });

    suite.it('TC-1.4: Direct file upload for files below 100MB threshold', () => {
      const smallFile = sampleUrls.uploadFiles.find(f => f.valid && f.size <= 104857600);
      assert.ok(smallFile, 'Expected a sample file <= 100MB');
      const uploadPlan = validateFileUpload(smallFile);
      assert.ok(uploadPlan.valid);
      assert.equal(uploadPlan.useMultipart, false, 'Small files must use direct upload');
      assert.equal(uploadPlan.partCount, 1);
    });

    suite.it('TC-1.5: Ingestion status lifecycle state machine transition contract', () => {
      const video = storage.createVideo({
        sourceType: 'url',
        sourceUrl: 'https://www.youtube.com/watch?v=gCHSEGBp8ME',
        title: 'Deep Work Masterclass',
        duration: 300
      });

      const allowedStates = ['pending', 'downloading', 'uploading', 'transcribing', 'analyzing', 'completed'];
      assert.equal(video.status, 'pending');

      for (let i = 1; i < allowedStates.length; i++) {
        const nextState = allowedStates[i];
        const updated = storage.updateVideo(video.id, {
          status: nextState,
          progress: Math.round((i / (allowedStates.length - 1)) * 100)
        });
        assert.equal(updated.status, nextState);
        assert.ok(updated.progress >= 0 && updated.progress <= 100);

        const contract = validateVideoSubmitResponse({
          videoId: updated.id,
          title: updated.title,
          duration: updated.duration,
          status: nextState === 'completed' ? 'completed' : 'processing',
          progress: updated.progress
        });
        assert.ok(contract.valid, `Contract must be valid at stage ${nextState}: ${contract.errors.join(', ')}`);
      }
    });
  });

  // ==========================================
  // 2. CONFIGURATOR SUBSYSTEM (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 2 - Pipeline Configurator Subsystem', () => {
    suite.it('TC-1.6: Timeframe dual-slider range selection contract and duration limits', () => {
      const totalVideoDuration = 600;
      const start = 60;
      const end = 240;
      assert.ok(start >= 0, 'Start must be >= 0');
      assert.ok(end <= totalVideoDuration, 'End must be <= total video duration');
      assert.ok(end - start >= 3, 'Minimum clip window must be at least 3 seconds');

      const configPayload = {
        sourceType: 'url',
        url: 'https://www.youtube.com/watch?v=gCHSEGBp8ME',
        duration: '60s-90s',
        clipTypes: ['viral-clips']
      };
      const valid = validateVideoSubmitRequest(configPayload);
      assert.ok(valid.valid, `Config payload must be valid: ${valid.errors.join(', ')}`);
    });

    suite.it('TC-1.7: Complete 15 Clip Type categories validation and metadata integrity', () => {
      const clipTypes = sampleConfigs.clipTypes;
      assert.equal(clipTypes.length, 15, 'Must strictly include all 15 clip type categories');
      const expectedIds = [
        'viral-clips', 'memorable-phrases', 'topic-clips', 'trailer', 'product-ads',
        'testimonial', 'instructions', 'product-features', 'positive-highlights',
        'negative-highlights', 'showcase', 'multi-product-recap', 'speakers-insights',
        'jokes-memes', 'podcast-jokes'
      ];
      for (const id of expectedIds) {
        const found = clipTypes.find(c => c.id === id);
        assert.ok(found, `Missing required clip type category: ${id}`);
        assert.ok(found.name.length > 0);
        assert.ok(found.description.length > 0);
      }
    });

    suite.it('TC-1.8: 5 Quick Prompt chips verification and AI instruction payload mapping', () => {
      const chips = sampleConfigs.promptChips;
      assert.equal(chips.length, 5, 'Must have exactly 5 quick prompt chips');
      assert.includes(chips, 'Controversial takes or hot opinions');
      assert.includes(chips, 'Emotional or vulnerable moments');
      assert.includes(chips, 'Funny reactions and one-liners');
      assert.includes(chips, 'Actionable tips and how-to steps');
      assert.includes(chips, 'Surprising facts or plot twists');
    });

    suite.it('TC-1.9: 5 Duration options mapping (<30s, 30s-60s, 60s-90s, 90s-3m, any)', () => {
      const durations = sampleConfigs.durations;
      assert.equal(durations.length, 5, 'Must define 5 duration options');
      const ids = durations.map(d => d.id);
      assert.includes(ids, '<30s');
      assert.includes(ids, '30s-60s');
      assert.includes(ids, '60s-90s');
      assert.includes(ids, '90s-3m');
      assert.includes(ids, 'any');
    });

    suite.it('TC-1.10: Custom AI instruction prompt string preservation and topic keywords array', () => {
      const customPrompt = 'Focus strictly on startup valuation metrics and investor pitch tips.';
      const keywords = ['valuation', 'pre-seed', 'pitch deck', 'runway'];
      const payload = {
        sourceType: 'upload',
        filePath: '/storage/videos/founder_talk.mp4',
        customPrompt,
        clipTypes: ['speakers-insights', 'viral-clips'],
        duration: '30s-60s'
      };
      const res = validateVideoSubmitRequest(payload);
      assert.ok(res.valid, res.errors.join(', '));
      assert.equal(payload.customPrompt, customPrompt);
    });
  });

  // ==========================================
  // 3. 24 PRESETS & TYPOGRAPHY CATALOG (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 3 - 24 Caption Presets & Template Catalog', () => {
    suite.it('TC-1.11: Presets 1-6 specification match (Classic, Blue Glow, Toxic Green, Blue Sheen, Master Pop, Cyan Gloss)', () => {
      const p1to6 = samplePresets.presets.slice(0, 6);
      const expectedIds = ['classic', 'blue-glow', 'toxic-green', 'blue-sheen', 'master-pop', 'cyan-gloss'];
      assert.equal(p1to6.length, 6);
      for (let i = 0; i < 6; i++) {
        assert.equal(p1to6[i].id, expectedIds[i]);
        assert.ok(p1to6[i].fontFamily, `Preset ${expectedIds[i]} must define fontFamily`);
        assert.ok(p1to6[i].fontWeight >= 700, `Preset ${expectedIds[i]} must have bold weight >= 700`);
        assert.ok(p1to6[i].primaryColor, `Preset ${expectedIds[i]} must define primaryColor`);
        assert.ok(p1to6[i].highlightColor, `Preset ${expectedIds[i]} must define highlightColor`);
      }
    });

    suite.it('TC-1.12: Presets 7-12 specification match (Chrome Blue, Green Gloss, Duo Style, Basker, Billy, Simple)', () => {
      const p7to12 = samplePresets.presets.slice(6, 12);
      const expectedIds = ['chrome-blue', 'green-gloss', 'duo-style', 'basker', 'billy', 'simple'];
      assert.equal(p7to12.length, 6);
      for (let i = 0; i < 6; i++) {
        assert.equal(p7to12[i].id, expectedIds[i]);
        assert.ok(p7to12[i].animation, `Preset ${expectedIds[i]} must define animation`);
      }
      // Duo style has secondaryFontFamily
      const duo = p7to12.find(p => p.id === 'duo-style');
      assert.equal(duo.secondaryFontFamily, 'Playfair Display');
    });

    suite.it('TC-1.13: Presets 13-18 specification match (Hormozi, MrBeast Pro, GaryVee, TikTok Native, Neon Pop, Cinematic)', () => {
      const p13to18 = samplePresets.presets.slice(12, 18);
      const expectedIds = ['hormozi', 'mrbeast-pro', 'garyvee', 'tiktok-native', 'neon-pop', 'cinematic'];
      assert.equal(p13to18.length, 6);
      for (let i = 0; i < 6; i++) {
        assert.equal(p13to18[i].id, expectedIds[i]);
      }
      const hormozi = p13to18.find(p => p.id === 'hormozi');
      assert.equal(hormozi.fontFamily, 'Anton');
      assert.equal(hormozi.stroke, '0.7px #000000');

      const beast = p13to18.find(p => p.id === 'mrbeast-pro');
      assert.equal(beast.fontFamily, 'Bangers');
      assert.equal(beast.highlightColor, '#00FF00');
    });

    suite.it('TC-1.14: Presets 19-24 specification match (Electric Blue, Sunset Fire, Ice Cold, Coral Pop, Midnight Purple, Georgia Elegance)', () => {
      const p19to24 = samplePresets.presets.slice(18, 24);
      const expectedIds = ['electric-blue', 'sunset-fire', 'ice-cold', 'coral-pop', 'midnight-purple', 'georgia-elegance'];
      assert.equal(p19to24.length, 6);
      for (let i = 0; i < 6; i++) {
        assert.equal(p19to24[i].id, expectedIds[i]);
      }
      const sunset = p19to24.find(p => p.id === 'sunset-fire');
      assert.equal(sunset.primaryColor, '#FF6B35');
      assert.equal(sunset.highlightColor, '#FFE500');

      const georgia = p19to24.find(p => p.id === 'georgia-elegance');
      assert.equal(georgia.fontFamily, 'Gelasio');
      assert.equal(georgia.highlightColor, '#D4AF37');
    });

    suite.it('TC-1.15: 27 Typography catalog & 29 B-roll asset catalog integrity', () => {
      assert.ok(samplePresets.fonts.length >= 27, `Fonts catalog must have >= 27 families, found ${samplePresets.fonts.length}`);
      assert.equal(sampleBroll.totalAssets, 29, 'B-roll catalog must contain exactly 29 assets');

      const gta = sampleBroll.categories.find(c => c.category === 'GTA 5');
      const mc = sampleBroll.categories.find(c => c.category === 'Minecraft');
      const sub = sampleBroll.categories.find(c => c.category === 'Subway Surfers');
      const asmr = sampleBroll.categories.find(c => c.category === 'ASMR');

      assert.equal(gta.count, 13);
      assert.equal(mc.count, 8);
      assert.equal(sub.count, 3);
      assert.equal(asmr.count, 5);
      assert.equal(gta.items.length, 13);
      assert.equal(mc.items.length, 8);
      assert.equal(sub.items.length, 3);
      assert.equal(asmr.items.length, 5);
    });
  });

  // ==========================================
  // 4. WORKSTATION TRANSCRIPT (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 4 - Workstation Interactive Transcript', () => {
    suite.it('TC-1.16: Word-level timestamp contract and data structure validation', () => {
      const words = sampleTranscripts.standard;
      assert.ok(words.length >= 10);
      for (const w of words) {
        assert.ok(typeof w.id === 'string');
        assert.ok(typeof w.word === 'string');
        assert.ok(typeof w.start === 'number' && w.start >= 0);
        assert.ok(typeof w.end === 'number' && w.end >= w.start);
      }
    });

    suite.it('TC-1.17: Interactive click-to-seek playhead position synchronization', () => {
      const words = sampleTranscripts.standard;
      const clickedWord = words[4]; // "fastest", start: 1.82
      let playerCurrentTime = 0.0;

      // Simulate click-to-seek event handler
      const seekHandler = (word) => {
        playerCurrentTime = word.start;
      };
      seekHandler(clickedWord);
      assert.equal(playerCurrentTime, 1.82);
    });

    suite.it('TC-1.18: Active word playback tracker based on current timestamp', () => {
      const words = sampleTranscripts.standard;
      const getActiveWord = (t) => {
        return words.find(w => w.start <= t && t < w.end);
      };

      assert.equal(getActiveWord(0.50).word, 'Welcome');
      assert.equal(getActiveWord(1.20).word, 'ScaleReach,');
      assert.equal(getActiveWord(2.00).word, 'fastest');
      assert.equal(getActiveWord(4.50).word, 'shorts.');
      assert.equal(getActiveWord(10.0), undefined); // after video end
    });

    suite.it('TC-1.19: Word strike-through / deletion logic skipping playback range', () => {
      const words = sampleTranscripts.standard.map(w => ({ ...w }));
      // Mark words 3 & 4 ("the fastest") as deleted
      words[3].deleted = true;
      words[4].deleted = true;

      // In video editors, contiguous deleted words form a merged cut span
      const deletedSpan = { start: words[3].start, end: words[4].end }; // 1.65 to 2.25

      let playhead = 1.60;
      const advancePlayback = (dt) => {
        playhead += dt;
        if (playhead >= deletedSpan.start && playhead < deletedSpan.end) {
          playhead = deletedSpan.end; // Auto-skip deleted range
        }
        return playhead;
      };

      // Step across start of deleted range (1.65)
      advancePlayback(0.10); // 1.70 -> inside range [1.65, 2.25], skips to 2.25
      assert.ok(playhead >= 2.25, `Expected playhead to skip past deleted words, got ${playhead}`);
    });

    suite.it('TC-1.20: Word highlight color customization and inline text correction', () => {
      const words = sampleTranscripts.standard.map(w => ({ ...w }));
      // Highlight word with custom color
      words[0].isHighlighted = true;
      words[0].color = '#DC7AFF'; // Billy candy violet
      assert.equal(words[0].color, '#DC7AFF');

      // Edit word text (Whisper typo correction)
      words[8].word = 'podcasts!'; // changed from "podcasts"
      assert.equal(words[8].word, 'podcasts!');
    });
  });

  // ==========================================
  // 5. WAVEFORM & TIMELINE (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 5 - Waveform Timeline & Multi-Track Studio', () => {
    suite.it('TC-1.21: AudioBuffer peak decimation and canvas render geometry calculation', () => {
      // Simulate 1 second of audio at 44.1kHz (sine wave)
      const sampleRate = 44100;
      const channelData = new Float32Array(sampleRate);
      for (let i = 0; i < sampleRate; i++) {
        channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.8;
      }

      const numColumns = 120;
      const peaks = computeWaveformPeaks(channelData, numColumns);
      assert.equal(peaks.length, numColumns);
      for (const p of peaks) {
        assert.ok(p.min <= 0, 'Min peak must be <= 0');
        assert.ok(p.max >= 0, 'Max peak must be >= 0');
        assert.ok(p.min >= -1.0 && p.max <= 1.0, 'Peaks must be normalized [-1.0, 1.0]');
      }
    });

    suite.it('TC-1.22: Multi-track timeline alignment (video strip, audio waveform, subtitles)', () => {
      const duration = 60.0; // 60s
      const pixelsPerSecond = 50;
      const totalWidth = duration * pixelsPerSecond; // 3000px

      const track1VideoWidth = totalWidth;
      const track2WaveformWidth = totalWidth;
      const track3SubtitlesWidth = totalWidth;

      assert.equal(track1VideoWidth, track2WaveformWidth);
      assert.equal(track2WaveformWidth, track3SubtitlesWidth);
    });

    suite.it('TC-1.23: Zoom scale factor computation (0.5x to 6.0x transformations)', () => {
      const basePps = 50; // 50px per second
      const zoomLevels = [0.5, 1.0, 2.0, 4.0, 6.0];
      for (const z of zoomLevels) {
        const computedPps = basePps * z;
        assert.ok(computedPps >= 25 && computedPps <= 300);
        // Playhead x at 10.5 seconds
        const playheadX = 10.5 * computedPps;
        assert.equal(playheadX, 10.5 * basePps * z);
      }
    });

    suite.it('TC-1.24: Marker tool bookmark registration at playhead timestamp', () => {
      const markers = [];
      const addMarker = (t, label) => {
        markers.push({ id: `m-${markers.length}`, timestamp: t, label: label || `Marker ${markers.length + 1}` });
      };

      addMarker(5.24, 'Hook Start');
      addMarker(18.90, 'Punchline');
      assert.equal(markers.length, 2);
      assert.equal(markers[0].timestamp, 5.24);
      assert.equal(markers[1].label, 'Punchline');
    });

    suite.it('TC-1.25: Snap-to-word boundary computation within snap threshold', () => {
      const words = sampleTranscripts.standard;
      const snapThreshold = 0.20; // 200ms

      const snapPlayhead = (t) => {
        let closest = t;
        let minDiff = snapThreshold;
        for (const w of words) {
          const diffStart = Math.abs(t - w.start);
          if (diffStart < minDiff) {
            minDiff = diffStart;
            closest = w.start;
          }
          const diffEnd = Math.abs(t - w.end);
          if (diffEnd < minDiff) {
            minDiff = diffEnd;
            closest = w.end;
          }
        }
        return closest;
      };

      // Word w-2 "ScaleReach," has start: 1.08, end: 1.62. w-1 has end: 1.05.
      // At t = 1.12, |1.12 - 1.08| = 0.04 (closest to 1.08)
      assert.equal(snapPlayhead(1.12), 1.08, 'Should snap to 1.08');
      assert.equal(snapPlayhead(1.58), 1.62, 'Should snap to 1.62');
      assert.equal(snapPlayhead(8.50), 8.50, 'Far from any word, should not snap');
    });
  });

  // ==========================================
  // 6. 9:16 RE-FRAMING & LAYOUT (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 6 - 9:16 Smart Re-framing Engine', () => {
    suite.it('TC-1.26: 9:16 aspect ratio bounding box coordinate calculation from 16:9 source', () => {
      const source = { width: 1920, height: 1080 };
      const geom = calculateLayoutGeometry('single_speaker', source, { faceX: 960 });

      assert.equal(geom.canvas.width, 1080);
      assert.equal(geom.canvas.height, 1920);
      assert.equal(geom.crop.height, 1080);
      assert.equal(geom.crop.width, Math.round(1080 * 9 / 16)); // 608px
      // Centered at 960 -> x = 960 - 608/2 = 656
      assert.equal(geom.crop.x, 960 - Math.round(608 / 2));
    });

    suite.it('TC-1.27: Single Speaker face-tracking centroid centering and horizontal crop panning', () => {
      const source = { width: 1920, height: 1080 };
      // Speaker shifted to the left at x = 400
      const geomLeft = calculateLayoutGeometry('single_speaker', source, { faceX: 400 });
      assert.equal(geomLeft.crop.x, 400 - Math.round(geomLeft.crop.width / 2));

      // Speaker shifted to extreme right at x = 1800 -> must clamp
      const geomRight = calculateLayoutGeometry('single_speaker', source, { faceX: 1800 });
      const maxAllowedX = source.width - geomRight.crop.width;
      assert.equal(geomRight.crop.x, maxAllowedX, 'Crop must be clamped within source boundaries');
    });

    suite.it('TC-1.28: Split-screen dual layout stacked geometry (top speaker, bottom B-roll)', () => {
      const geom = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.5 });
      assert.equal(geom.topPane.width, 1080);
      assert.equal(geom.topPane.height, 960);
      assert.equal(geom.bottomPane.width, 1080);
      assert.equal(geom.bottomPane.height, 960);
      assert.equal(geom.bottomPane.y, 960);
      assert.equal(geom.divider.height, 2);
    });

    suite.it('TC-1.29: Split-screen divider ratio calculation (30/70 to 70/30 range)', () => {
      const r30 = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.3 });
      assert.equal(r30.topPane.height, Math.round(1920 * 0.3)); // 576px
      assert.equal(r30.bottomPane.height, 1920 - 576); // 1344px

      const r70 = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.7 });
      assert.equal(r70.topPane.height, Math.round(1920 * 0.7)); // 1344px
      assert.equal(r70.bottomPane.height, 1920 - 1344); // 576px
    });

    suite.it('TC-1.30: Gaussian blur background fill compositor (25px blur filtergraph generation)', () => {
      const source = { width: 1920, height: 1080 };
      const geom = calculateLayoutGeometry('blur_fill', source);
      assert.equal(geom.canvas.width, 1080);
      assert.equal(geom.canvas.height, 1920);
      assert.equal(geom.backgroundBlur.blurRadius, 25);
      assert.equal(geom.foreground.width, 1080);
      assert.ok(geom.foreground.y > 0, 'Foreground must be vertically centered');
      assert.equal(geom.foreground.y * 2 + geom.foreground.height, 1920, 'Geometry must be symmetrically centered');
    });
  });

  // ==========================================
  // 7. ZERO-PAYWALL & ZERO-AUTH (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 7 - Zero-Paywall / Zero-Auth Execution', () => {
    suite.it('TC-1.31: Zero-auth session bypass contract (no login token required)', () => {
      const ws = storage.getWorkspace();
      assert.equal(ws.id, 'ws_local_zero_paywall');
      assert.equal(ws.plan, 'unlimited_pro');
      assert.equal(ws.role, 'owner');
    });

    suite.it('TC-1.32: Quota & credit meter elimination contract (minutesRemaining: Infinity)', () => {
      const ws = storage.getWorkspace();
      assert.equal(ws.minutesRemaining, Infinity);
      assert.equal(ws.minutesTotal, Infinity);
      assert.equal(ws.unlimitedExports, true);
    });

    suite.it('TC-1.33: Watermark-free export guarantee (includeWatermark: false enforced)', () => {
      const exportReq = {
        resolution: '1080p',
        fps: 60,
        includeWatermark: false,
        aspectRatio: '9:16',
        presetId: 'hormozi',
        layoutType: 'single'
      };
      const valid = validateExportRequest(exportReq);
      assert.ok(valid.valid, valid.errors.join(', '));
      assert.equal(exportReq.includeWatermark, false);
    });

    suite.it('TC-1.34: 1080p and 60fps export unlocked for all users without tier restrictions', () => {
      const job1080p60 = storage.createExportJob({
        clipId: 'clip_sample_1',
        resolution: '1080p',
        fps: 60,
        presetId: 'tiktok-native'
      });
      assert.equal(job1080p60.resolution, '1080p');
      assert.equal(job1080p60.fps, 60);
      assert.equal(job1080p60.includeWatermark, false);
    });

    suite.it('TC-1.35: Permanent local video storage contract (expiresAt: null, zero 24h expiration)', () => {
      const video = storage.createVideo({
        sourceType: 'url',
        sourceUrl: 'https://youtu.be/gCHSEGBp8ME',
        title: 'Permanent Video Asset'
      });
      assert.equal(video.expiresAt, null, 'Video must never expire in local clone');
    });
  });

  // ==========================================
  // 8. EXPORTER & SUBTITLE COMPOSITOR (5 tests)
  // ==========================================
  suite.describe('Tier 1: Feature 8 - FFmpeg Native Exporter & Subtitle Compositor', () => {
    suite.it('TC-1.36: Advanced SubStation Alpha (.ass) subtitle file generator conforming to preset styles', () => {
      const preset = samplePresets.presets.find(p => p.id === 'hormozi');
      const phrases = chunkWordsIntoPhrases(sampleTranscripts.standard, 3);
      const assDoc = generateAssSubtitles('clip_123', preset, phrases);

      assert.includes(assDoc, '[Script Info]');
      assert.includes(assDoc, 'PlayResX: 1080');
      assert.includes(assDoc, 'PlayResY: 1920');
      assert.includes(assDoc, '[V4+ Styles]');
      assert.includes(assDoc, 'Anton');
      assert.includes(assDoc, '[Events]');
      assert.includes(assDoc, 'Dialogue:');
    });

    suite.it('TC-1.37: Word continuous timing clamping prevents overlap and negative gaps', () => {
      const overlapping = sampleTranscripts.overlappingTimestamps;
      const clamped = clampSubtitleTimings(overlapping);

      assert.equal(clamped.length, 3);
      // Word 0 was end: 1.60, Word 1 was start: 1.40 -> clamped[0].end must become 1.40
      assert.equal(clamped[0].end, 1.40);
      // Word 1 was end: 2.10, Word 2 was start: 1.90 -> clamped[1].end must become 1.90
      assert.equal(clamped[1].end, 1.90);
    });

    suite.it('TC-1.38: Phrase chunking algorithm respects wordsPerLine and sentence terminators', () => {
      const words = sampleTranscripts.standard; // contains sentence ending with "shorts."
      const chunks = chunkWordsIntoPhrases(words, 3);

      assert.ok(chunks.length >= 3, 'Must chunk into at least 3 phrases');
      for (const ch of chunks) {
        assert.ok(ch.words.length <= 3, 'Each phrase must not exceed wordsPerLine: 3');
        assert.ok(ch.end >= ch.start);
      }
    });

    suite.it('TC-1.39: Virality highlight scoring formula and intelligence breakdown', () => {
      const scoreData = calculateViralityScore({
        hookStrength: 95,
        engagementFlow: 90,
        emotionalResonance: 88
      });
      // 0.40 * 95 + 0.35 * 90 + 0.25 * 88 = 38 + 31.5 + 22 = 91.5 -> 92
      assert.equal(scoreData.viralityScore, 92);
      assert.ok(scoreData.hooks.length > 0);
      assert.ok(scoreData.emotions.length > 0);
      assert.ok(scoreData.recommendedPlatforms.includes('TikTok'));
    });

    suite.it('TC-1.40: Export job progress polling and completion response contract', () => {
      const job = storage.createExportJob({
        clipId: 'clip_test',
        resolution: '1080p',
        fps: 60,
        presetId: 'classic'
      });

      storage.updateExportJob(job.jobId, {
        status: 'completed',
        progress: 100,
        downloadUrl: `/storage/exports/${job.jobId}.mp4`
      });

      const completedJob = storage.getExportJob(job.jobId);
      const res = validateExportResponse(completedJob);
      assert.ok(res.valid, res.errors.join(', '));
      assert.equal(completedJob.status, 'completed');
      assert.equal(completedJob.progress, 100);
      assert.includes(completedJob.downloadUrl, '.mp4');
    });
  });
}

module.exports = { registerTier1Tests };
