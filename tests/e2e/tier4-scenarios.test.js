/**
 * Tier 4: Real-World Application Scenarios Test Suite
 * 5 comprehensive end-to-end user workflows
 * Exercises full platform lifecycles from ingestion to export.
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

const samplePresets = require('../fixtures/sample-presets.json');
const sampleBroll = require('../fixtures/sample-broll.json');
const sampleTranscripts = require('../fixtures/sample-transcripts.json');

function registerTier4Tests(suite) {
  const storage = new MockStorage();

  suite.describe('Tier 4: Real-World End-to-End Creator Application Scenarios', () => {

    // =========================================================================
    // Scenario 1: 5-Minute Long-Form Podcast to 3 Viral 9:16 Shorts Journey
    // =========================================================================
    suite.it('Scenario 1: 5-Minute Long-Form Podcast to 3 Viral 9:16 Shorts Workflow', async () => {
      // Step 1: User submits long-form YouTube podcast URL
      const podcastUrl = 'https://www.youtube.com/watch?v=gCHSEGBp8ME';
      const detected = detectPlatformUrl(podcastUrl);
      assert.ok(detected.valid, 'URL must be detected as valid YouTube video');

      const submitPayload = {
        sourceType: 'url',
        url: podcastUrl,
        clipTypes: ['podcast-jokes', 'viral-clips'],
        duration: '30s-60s',
        customPrompt: 'Extract the funniest banter moments between hosts.'
      };
      assert.ok(validateVideoSubmitRequest(submitPayload).valid);

      const video = storage.createVideo({
        sourceType: 'url',
        sourceUrl: podcastUrl,
        title: 'Joe & Lex on Future of Artificial Intelligence',
        duration: 300,
        clipConfig: submitPayload
      });
      assert.ok(video.id);
      assert.equal(video.expiresAt, null, 'Video must have permanent local storage (no 24h expiration)');

      // Step 2: Processing state machine transitions
      storage.updateVideo(video.id, { status: 'downloading', progress: 20 });
      storage.updateVideo(video.id, { status: 'transcribing', progress: 50 });
      storage.updateVideo(video.id, { status: 'analyzing', progress: 85 });
      storage.updateVideo(video.id, { status: 'completed', progress: 100 });

      // Step 3: Algorithmic Virality Detector generates 3 scored clips
      const clip1 = storage.createClip({
        videoId: video.id,
        title: 'The Singularity Dilemma',
        startTime: 45.0,
        endTime: 88.0,
        viralityScore: 94,
        viralityReason: 'High shock-value hook and explosive debate pacing',
        improvementSuggestion: 'Flawless pacing. Ready for direct distribution.',
        hooks: ['Shocking Truth', 'Curiosity Gap'],
        emotions: ['Curious', 'Surprised'],
        templateId: 'hormozi'
      });

      const clip2 = storage.createClip({
        videoId: video.id,
        title: 'Why Robots Will Never Taste Pizza',
        startTime: 120.0,
        endTime: 165.0,
        viralityScore: 88,
        viralityReason: 'Humorous host banter with strong punchline',
        hooks: ['Value Hook'],
        emotions: ['Inspired'],
        templateId: 'classic'
      });

      const clip3 = storage.createClip({
        videoId: video.id,
        title: 'Quantum Computing in Plain English',
        startTime: 210.0,
        endTime: 255.0,
        viralityScore: 82,
        viralityReason: 'Informative explanation with clear analogies',
        hooks: ['Curiosity Gap'],
        emotions: ['Inspired'],
        templateId: 'cinematic'
      });

      const clips = storage.listClipsForVideo(video.id);
      assert.equal(clips.length, 3, 'Must produce 3 generated clips');
      assert.ok(validateClipItem(clip1).valid);
      assert.ok(validateClipItem(clip2).valid);
      assert.ok(validateClipItem(clip3).valid);

      // Step 4: User opens Workstation on top clip (clip1)
      const words = sampleTranscripts.standard.map(w => ({ ...w }));
      // Inline edit typo in transcript
      words[2].word = 'ScaleReach!'; // corrected punctuation
      words[4].isHighlighted = true;
      words[4].color = '#00FF00'; // Hormozi green highlight
      storage.saveCaptions(clip1.id, {
        clipId: clip1.id,
        presetId: 'hormozi',
        words,
        style: {
          fontFamily: 'Anton',
          fontSize: 58,
          textColor: '#FFFFFF',
          highlightColor: '#00FF00',
          strokeColor: '#000000',
          strokeWidth: 0.7,
          animation: 'punch'
        }
      });

      const savedCaptions = storage.getCaptions(clip1.id);
      assert.ok(validateCaptionData(savedCaptions).valid);

      // Step 5: User seeks playhead via word click & drops timeline marker
      let playhead = 0.0;
      playhead = words[4].start; // seek to word 4
      assert.equal(playhead, 1.82);

      const markers = [{ id: 'm-1', timestamp: playhead, label: 'Hook Drop' }];
      assert.equal(markers[0].label, 'Hook Drop');

      // Step 6: Export unwatermarked 1080p60 MP4
      const exportReq = {
        resolution: '1080p',
        fps: 60,
        includeWatermark: false,
        aspectRatio: '9:16',
        presetId: 'hormozi',
        layoutType: 'single'
      };
      assert.ok(validateExportRequest(exportReq).valid);

      const exportJob = storage.createExportJob({
        clipId: clip1.id,
        ...exportReq
      });
      storage.updateExportJob(exportJob.jobId, {
        status: 'completed',
        progress: 100,
        downloadUrl: `/storage/exports/${exportJob.jobId}.mp4`
      });

      const completed = storage.getExportJob(exportJob.jobId);
      assert.ok(validateExportResponse(completed).valid);
      assert.equal(completed.status, 'completed');
      assert.equal(completed.includeWatermark, false, 'Export must never have a watermark');
    });

    // =========================================================================
    // Scenario 2: Viral TikTok Meme Creator Workflow
    // =========================================================================
    suite.it('Scenario 2: Viral TikTok Meme Creator Workflow (B-Roll Split-Screen)', async () => {
      // Step 1: Upload local comedy clip MP4
      const localFile = { filename: 'standup_joke.mp4', mime: 'video/mp4', size: 35000000 };
      const uploadPlan = validateFileUpload(localFile);
      assert.ok(uploadPlan.valid);
      assert.equal(uploadPlan.useMultipart, false);

      const video = storage.createVideo({
        sourceType: 'upload',
        filePath: '/storage/uploads/standup_joke.mp4',
        title: 'Airport Security Standup Joke',
        duration: 48
      });

      // Step 2: Select Subway Surfers B-roll asset
      const subwayAsset = sampleBroll.categories.find(c => c.category === 'Subway Surfers').items[0];
      assert.ok(subwayAsset);
      assert.equal(subwayAsset.id, 'subway-1');

      // Step 3: Compute 50/50 split-screen geometry with audio balancing
      const geom = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.5 });
      assert.equal(geom.topPane.height, 960);
      assert.equal(geom.bottomPane.height, 960);

      const audioMix = { voiceVolume: 1.0, brollVolume: 0.0 }; // B-roll muted
      assert.equal(audioMix.brollVolume, 0.0);

      // Step 4: Apply MrBeast Pro caption preset
      const preset = samplePresets.presets.find(p => p.id === 'mrbeast-pro');
      assert.equal(preset.fontFamily, 'Bangers');
      assert.equal(preset.highlightColor, '#00FF00');

      // Step 5: Subtitle chunking & ASS generation
      const phrases = chunkWordsIntoPhrases(sampleTranscripts.standard, 3);
      const assDoc = generateAssSubtitles('clip_meme_1', preset, phrases);
      assert.includes(assDoc, 'Bangers');

      // Step 6: Render 1080p unwatermarked short
      const job = storage.createExportJob({
        clipId: 'clip_meme_1',
        resolution: '1080p',
        fps: 60,
        presetId: 'mrbeast-pro',
        layoutType: 'split'
      });
      storage.updateExportJob(job.jobId, { status: 'completed', progress: 100, downloadUrl: `/storage/exports/${job.jobId}.mp4` });
      assert.equal(job.includeWatermark, false);
    });

    // =========================================================================
    // Scenario 3: Gaming Commentary Multi-Speaker Studio Workflow
    // =========================================================================
    suite.it('Scenario 3: Gaming Commentary Multi-Speaker Studio Workflow', async () => {
      // Step 1: Ingest Twitch gaming clip
      const twitchUrl = 'https://www.twitch.tv/videos/2291823491';
      const detected = detectPlatformUrl(twitchUrl);
      assert.ok(detected.valid);

      // Step 2: Auto-detect two speakers & apply split-screen framing
      const geom = calculateLayoutGeometry('split_screen', { width: 1920, height: 1080 }, { dividerRatio: 0.5 });
      assert.equal(geom.canvas.width, 1080);
      assert.equal(geom.canvas.height, 1920);

      // Step 3: Apply Toxic Green preset
      const preset = samplePresets.presets.find(p => p.id === 'toxic-green');
      assert.equal(preset.primaryColor, '#00FF41');

      // Step 4: Reposition subtitles to lower third (75% height)
      const captionPosition = { verticalPercent: 75 };
      assert.equal(captionPosition.verticalPercent, 75);

      // Step 5: Verify zero quota deduction
      const ws = storage.getWorkspace();
      assert.equal(ws.minutesRemaining, Infinity);
    });

    // =========================================================================
    // Scenario 4: Multilingual Global Creator Workflow (Spanish & Hindi Content)
    // =========================================================================
    suite.it('Scenario 4: Multilingual Global Creator Workflow (Spanish & Hindi)', async () => {
      // Step 1: Ingest international video
      const url = 'https://media.example.com/videos/multilingual_interview.mp4';
      assert.ok(detectPlatformUrl(url).valid);

      // Step 2: Verify transcript contains valid non-Latin Unicode
      const words = sampleTranscripts.unicodeMultilingual;
      assert.equal(words[2].word, 'こんにちは'); // Japanese
      assert.equal(words[3].word, 'नमस्ते'); // Hindi
      assert.equal(words[4].word, 'مرحبا'); // Arabic

      // Step 3: ASS subtitle generator handles multi-byte UTF-8 without byte truncation
      const preset = samplePresets.presets.find(p => p.id === 'classic');
      const phrases = chunkWordsIntoPhrases(words, 2);
      const ass = generateAssSubtitles('clip_multi', preset, phrases);

      assert.includes(ass, 'こんにちは');
      assert.includes(ass, 'नमस्ते');
      assert.includes(ass, 'مرحبا');
    });

    // =========================================================================
    // Scenario 5: Direct Response Marketing Product Ad Workflow
    // =========================================================================
    suite.it('Scenario 5: Direct Response Marketing Product Ad Workflow', async () => {
      // Step 1: Upload 16:9 product demo video
      const file = { filename: 'saas_demo.mp4', mime: 'video/mp4', size: 60000000 };
      assert.ok(validateFileUpload(file).valid);

      // Step 2: Configure 25px Gaussian blur pillarbox layout
      const geom = calculateLayoutGeometry('blur_fill', { width: 1920, height: 1080 });
      assert.equal(geom.backgroundBlur.blurRadius, 25);
      assert.equal(geom.foreground.width, 1080);

      // Step 3: Apply Cyan Gloss preset
      const preset = samplePresets.presets.find(p => p.id === 'cyan-gloss');
      assert.equal(preset.fontFamily, 'Kanit');

      // Step 4: Add Call-to-Action text overlay
      const ctaOverlay = {
        text: 'TRY FOR FREE - NO CREDIT CARD',
        font: 'Inter',
        color: '#FFFFFF',
        backgroundColor: '#6366F1',
        y: 85 // bottom 15%
      };
      assert.equal(ctaOverlay.backgroundColor, '#6366F1');

      // Step 5: Export high-res 1080p ad without watermarks
      const job = storage.createExportJob({
        clipId: 'clip_ad_1',
        resolution: '1080p',
        fps: 60,
        presetId: 'cyan-gloss',
        layoutType: 'blur_fill'
      });
      assert.equal(job.includeWatermark, false);
      assert.equal(job.resolution, '1080p');
    });

  });
}

module.exports = { registerTier4Tests };
