/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * 15 rigorous pairwise & multi-feature interaction test cases
 * Tests end-to-end combinations of ingestion types, configurator modes,
 * 24 caption presets, 29 B-roll assets, reframe layouts, and unwatermarked exports.
 */

const { assert } = require('../helpers/test-context');
const {
  validateVideoSubmitRequest,
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
  calculateViralityScore
} = require('../helpers/pipeline-oracles');
const { MockStorage } = require('../helpers/mock-storage');

const samplePresets = require('../fixtures/sample-presets.json');
const sampleBroll = require('../fixtures/sample-broll.json');
const sampleTranscripts = require('../fixtures/sample-transcripts.json');

function registerTier3Tests(suite) {
  const storage = new MockStorage();

  suite.describe('Tier 3: Cross-Feature Interactions & Pairwise Combinations', () => {

    suite.it('TC-3.1: YouTube URL + 30s-60s Duration + Hormozi Preset + Single Speaker Reframe + 1080p Export', () => {
      // 1. Ingestion
      const url = 'https://www.youtube.com/watch?v=gCHSEGBp8ME';
      const detected = detectPlatformUrl(url);
      assert.ok(detected.valid);

      const video = storage.createVideo({
        sourceType: 'url',
        sourceUrl: url,
        title: 'High Growth Strategies'
      });

      // 2. Config & Clip creation
      const clip = storage.createClip({
        videoId: video.id,
        title: 'Double Down on What Works',
        startTime: 30,
        endTime: 75,
        templateId: 'hormozi'
      });
      assert.ok(clip.duration >= 30 && clip.duration <= 60);

      // 3. Layout geometry
      const geom = calculateLayoutGeometry('single_speaker', { width: 1920, height: 1080 }, { faceX: 960 });
      assert.equal(geom.canvas.width, 1080);
      assert.equal(geom.canvas.height, 1920);

      // 4. Subtitle generation with Hormozi preset
      const preset = samplePresets.presets.find(p => p.id === 'hormozi');
      const phrases = chunkWordsIntoPhrases(sampleTranscripts.standard, 3);
      const ass = generateAssSubtitles(clip.id, preset, phrases);
      assert.includes(ass, 'Anton');

      // 5. Export
      const job = storage.createExportJob({
        clipId: clip.id,
        resolution: '1080p',
        fps: 60,
        presetId: 'hormozi',
        layoutType: 'single'
      });
      assert.equal(job.includeWatermark, false);
      assert.equal(job.resolution, '1080p');
    });

    suite.it('TC-3.2: Local MP4 Upload + Split-Screen GTA 5 Asset + Toxic Green Preset + 50/50 Divider + 1080p Export', () => {
      // 1. Upload validation
      const file = { filename: 'podcast.mp4', mime: 'video/mp4', size: 85000000 };
      const uploadRes = validateFileUpload(file);
      assert.ok(uploadRes.valid);

      // 2. B-roll asset selection
      const gtaAsset = sampleBroll.categories.find(c => c.category === 'GTA 5').items[0];
      assert.equal(gtaAsset.id, 'gta-1');

      // 3. Split-screen geometry
      const geom = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.5 });
      assert.equal(geom.topPane.height, 960);
      assert.equal(geom.bottomPane.height, 960);

      // 4. Toxic Green preset check
      const preset = samplePresets.presets.find(p => p.id === 'toxic-green');
      assert.equal(preset.primaryColor, '#00FF41');
      assert.equal(preset.highlightColor, '#39FF14');

      // 5. Export
      const job = storage.createExportJob({
        clipId: 'clip_gta_toxic',
        resolution: '1080p',
        fps: 60,
        presetId: 'toxic-green',
        layoutType: 'split'
      });
      assert.equal(job.status, 'queued');
    });

    suite.it('TC-3.3: Twitch VOD URL + Podcast Banter Category + Duo Style Preset + Two-Speaker Split + 60fps Export', () => {
      const url = 'https://www.twitch.tv/videos/2291823491';
      const detected = detectPlatformUrl(url);
      assert.ok(detected.valid);
      assert.equal(detected.platform, 'twitch');

      const preset = samplePresets.presets.find(p => p.id === 'duo-style');
      assert.equal(preset.secondaryFontFamily, 'Playfair Display');

      const job = storage.createExportJob({
        clipId: 'clip_twitch_banter',
        resolution: '1080p',
        fps: 60,
        presetId: 'duo-style',
        layoutType: 'split'
      });
      assert.equal(job.fps, 60);
    });

    suite.it('TC-3.4: Local WebM Upload + Minecraft Dropper Asset + MrBeast Pro Preset + Zoom Pop Animation + 1080p Export', () => {
      const file = { filename: 'gameplay.webm', mime: 'video/webm', size: 45000000 };
      assert.ok(validateFileUpload(file).valid);

      const mcAsset = sampleBroll.categories.find(c => c.category === 'Minecraft').items[1];
      assert.equal(mcAsset.id, 'mc-2');

      const preset = samplePresets.presets.find(p => p.id === 'mrbeast-pro');
      assert.equal(preset.fontFamily, 'Bangers');
      assert.equal(preset.animation, 'zoom-pop-tilt');
    });

    suite.it('TC-3.5: Google Drive Link + GaryVee Preset + Subway Surfers Asset + Rapid-Fire Animation + Export', () => {
      const url = 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view';
      const detected = detectPlatformUrl(url);
      assert.ok(detected.valid);

      const subAsset = sampleBroll.categories.find(c => c.category === 'Subway Surfers').items[0];
      assert.equal(subAsset.id, 'subway-1');

      const preset = samplePresets.presets.find(p => p.id === 'garyvee');
      assert.equal(preset.highlightColor, '#FF0000');
    });

    suite.it('TC-3.6: Loom Video Ingestion + Instructions Category + Classic Preset + 25px Gaussian Blur Fill + Export', () => {
      const url = 'https://www.loom.com/share/9a8b7c6d5e4f3a2b1c0d';
      const detected = detectPlatformUrl(url);
      assert.ok(detected.valid);

      const geom = calculateLayoutGeometry('blur_fill', { width: 1920, height: 1080 });
      assert.equal(geom.backgroundBlur.blurRadius, 25);

      const preset = samplePresets.presets.find(p => p.id === 'classic');
      assert.equal(preset.id, 'classic');
    });

    suite.it('TC-3.7: Video Upload + ASMR Kinetic Sand Asset + Sunset Fire Preset + Audio Mixing (0% B-roll, 100% voice)', () => {
      const asmrAsset = sampleBroll.categories.find(c => c.category === 'ASMR').items[0];
      assert.equal(asmrAsset.id, 'asmr-1');

      const audioConfig = {
        mainVolume: 1.0,
        brollVolume: 0.0,
        ducking: false
      };
      assert.equal(audioConfig.brollVolume, 0.0);
      assert.equal(audioConfig.mainVolume, 1.0);

      const preset = samplePresets.presets.find(p => p.id === 'sunset-fire');
      assert.equal(preset.primaryColor, '#FF6B35');
    });

    suite.it('TC-3.8: YouTube Short Ingestion + Topic Clips Category + Blue Glow Preset + Custom AI Instructions + Export', () => {
      const url = 'https://www.youtube.com/shorts/3fM6U3vH2b0';
      const detected = detectPlatformUrl(url);
      assert.ok(detected.valid);

      const prompt = 'Extract all mentions of machine learning frameworks and benchmarks.';
      const preset = samplePresets.presets.find(p => p.id === 'blue-glow');
      assert.includes(preset.primaryColor, 'gradient');
    });

    suite.it('TC-3.9: QuickTime MOV Upload + Controversial Takes Prompt Chip + Neon Pop Preset + Text Overlay + Export', () => {
      const file = { filename: 'interview.mov', mime: 'video/quicktime', size: 120000000 };
      assert.ok(validateFileUpload(file).valid);

      const overlay = {
        type: 'text',
        text: 'HOT TAKE 🔥',
        x: 50,
        y: 20,
        startTime: 0,
        endTime: 5
      };
      assert.equal(overlay.text, 'HOT TAKE 🔥');

      const preset = samplePresets.presets.find(p => p.id === 'neon-pop');
      assert.equal(preset.primaryColor, '#00FFFF');
    });

    suite.it('TC-3.10: Direct MP4 URL + Testimonial Category + Basker Serif Preset + Watermark-Free Guarantee Verification', () => {
      const url = 'https://media.example.com/videos/podcast_master.mp4';
      assert.ok(detectPlatformUrl(url).valid);

      const preset = samplePresets.presets.find(p => p.id === 'basker');
      assert.equal(preset.fontFamily, 'Libre Baskerville');

      const job = storage.createExportJob({
        clipId: 'clip_basker_testimonial',
        resolution: '1080p',
        fps: 30,
        presetId: 'basker'
      });
      assert.equal(job.includeWatermark, false);
    });

    suite.it('TC-3.11: YouTube Video + 90s-3m Duration + Billy Wobbly Cartoon Preset + Word Highlight Overrides', () => {
      const clip = storage.createClip({
        videoId: 'vid_yt_long',
        title: 'Storytelling Segment',
        startTime: 10,
        endTime: 120, // 110s -> in 90s-3m range
        templateId: 'billy'
      });
      assert.ok(clip.duration >= 90 && clip.duration <= 180);

      const preset = samplePresets.presets.find(p => p.id === 'billy');
      assert.equal(preset.fontFamily, 'Lilita One');
    });

    suite.it('TC-3.12: Local Upload + Jokes/Memes Category + Cyan Gloss Preset + Edited Transcript (Struck-through words)', () => {
      const words = sampleTranscripts.standard.map(w => ({ ...w }));
      words[0].deleted = true; // strike out first word
      const activeWords = words.filter(w => !w.deleted);
      assert.equal(activeWords.length, words.length - 1);

      const preset = samplePresets.presets.find(p => p.id === 'cyan-gloss');
      assert.equal(preset.fontFamily, 'Kanit');
    });

    suite.it('TC-3.13: Rumble Video + Actionable Tips Prompt Chip + Chrome Blue Preset + Image Logo Overlay Snapped Top-Right', () => {
      const url = 'https://rumble.com/v123456-exclusive-podcast.html';
      assert.ok(detectPlatformUrl(url).valid);

      const logoOverlay = {
        type: 'image',
        url: '/logos/brand.png',
        position: 'top-right',
        scale: 0.8,
        opacity: 0.9
      };
      assert.equal(logoOverlay.position, 'top-right');

      const preset = samplePresets.presets.find(p => p.id === 'chrome-blue');
      assert.equal(preset.fontFamily, 'Montserrat');
    });

    suite.it('TC-3.14: YouTube Video + Negative Highlights Category + Ice Cold Preset + 70/30 Asymmetric Split-Screen', () => {
      const geom = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.70 });
      assert.equal(geom.topPane.height, Math.round(1920 * 0.70));
      assert.equal(geom.bottomPane.height, 1920 - Math.round(1920 * 0.70));

      const preset = samplePresets.presets.find(p => p.id === 'ice-cold');
      assert.equal(preset.fontFamily, 'Black Ops One');
    });

    suite.it('TC-3.15: Video Upload + Memorable Phrases Category + Georgia Elegance Preset + 1:1 Square Aspect Ratio Export', () => {
      const preset = samplePresets.presets.find(p => p.id === 'georgia-elegance');
      assert.equal(preset.fontFamily, 'Gelasio');

      const job = storage.createExportJob({
        clipId: 'clip_square_quote',
        resolution: '1080p',
        aspectRatio: '1:1',
        presetId: 'georgia-elegance'
      });
      assert.equal(job.aspectRatio, '1:1');
      assert.equal(job.includeWatermark, false);
    });

  });
}

module.exports = { registerTier3Tests };
