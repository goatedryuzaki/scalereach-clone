# ScaleReach Test Infrastructure Specification (`TEST_INFRA.md`)

## 1. Executive Overview

ScaleReach Personal Clone is engineered with a **Dual Track Testing Infrastructure**. The testing harness operates completely independent of external SaaS APIs, paywalls, or third-party cloud infrastructure. All 100 test cases run locally in pure Node.js (v18+) without requiring external npm packages or running server daemons.

The test suite systematically verifies:
- Complete removal of authentication barriers, paywalls, usage meters, and watermark overlays.
- 1:1 fidelity with the commercial ScaleReach platform across all 24 Caption Presets, 27 Typography Fonts, and 29 Split-Screen B-roll Video Assets.
- Multi-platform video ingestion contracts across 12 source platforms and direct video uploads.
- Full mathematical and coordinate geometry calculations for 9:16 vertical re-framing (single speaker, 50/50 split-screen, and 25px Gaussian blur pillarbox fill).
- SubStation Alpha (.ass) and HTML5 Canvas subtitle compositing, word-level continuous timing clamping, and adversarial string escaping.

---

## 2. Test Architecture & Runner Invocation

### 2.1 Master Standalone Test Runner

The master test runner is located at `tests/run-all-tests.js`. It features an in-house, zero-dependency test context providing ANSI colored reporting, execution timers, deep assertion validation, and flexible CLI filters.

#### Basic Invocations:
```bash
# Execute the complete 100-test suite across all 4 tiers
node tests/run-all-tests.js

# Execute a specific test tier (1, 2, 3, or 4)
node tests/run-all-tests.js --tier=1
node tests/run-all-tests.js --tier=2
node tests/run-all-tests.js --tier=3
node tests/run-all-tests.js --tier=4

# Filter tests by description or suite pattern
node tests/run-all-tests.js --filter="Hormozi"
node tests/run-all-tests.js --filter="Zero-Paywall"

# Verbose output with full error stack traces
node tests/run-all-tests.js --verbose

# Stop immediately upon first encountered failure
node tests/run-all-tests.js --bail

# Output machine-readable JSON results for CI/CD pipelines
node tests/run-all-tests.js --json
```

---

## 3. The 4-Tier Test Suite Specification

The suite implements a 4-tier systematic verification model containing exactly **100 test cases**:

```
ScaleReach E2E Test Suite (100 Tests)
├── Tier 1: Feature Coverage (40 Tests - 8 Features x 5 Tests)
│   ├── Feature 1: Ingestion Subsystem (TC-1.1 - TC-1.5)
│   ├── Feature 2: Pipeline Configurator (TC-1.6 - TC-1.10)
│   ├── Feature 3: 24 Presets & Template Catalog (TC-1.11 - TC-1.15)
│   ├── Feature 4: Workstation Interactive Transcript (TC-1.16 - TC-1.20)
│   ├── Feature 5: Waveform Timeline Studio (TC-1.21 - TC-1.25)
│   ├── Feature 6: 9:16 Smart Re-framing Engine (TC-1.26 - TC-1.30)
│   ├── Feature 7: Zero-Paywall / Zero-Auth System (TC-1.31 - TC-1.35)
│   └── Feature 8: Native Exporter & Compositor (TC-1.36 - TC-1.40)
│
├── Tier 2: Boundary & Corner Cases (40 Tests - 8 Features x 5 Tests)
│   ├── Ingestion Boundaries (TC-2.1 - TC-2.5)
│   ├── Configurator Boundaries (TC-2.6 - TC-2.10)
│   ├── Preset Fallbacks & Extremes (TC-2.11 - TC-2.15)
│   ├── Transcript Edge Cases & Unicode (TC-2.16 - TC-2.20)
│   ├── Waveform Silence & Clipping (TC-2.21 - TC-2.25)
│   ├── Aspect Ratio & Extreme Centroid (TC-2.26 - TC-2.30)
│   ├── Zero-Paywall Security & Bypass (TC-2.31 - TC-2.35)
│   └── ASS Escaping & Sanitization (TC-2.36 - TC-2.40)
│
├── Tier 3: Cross-Feature Combinations (15 Tests)
│   └── Pairwise Interactions (TC-3.1 - TC-3.15)
│
└── Tier 4: Real-World Application Scenarios (5 Tests)
    ├── Scenario 1: 5-Minute Long-Form Podcast to 3 Viral 9:16 Shorts
    ├── Scenario 2: Viral TikTok Meme Creator Workflow (B-Roll Split-Screen)
    ├── Scenario 3: Gaming Commentary Multi-Speaker Studio Workflow
    ├── Scenario 4: Multilingual Global Creator Workflow (Spanish & Hindi)
    └── Scenario 5: Direct Response Marketing Product Ad Workflow
```

---

## 4. Authoritative Sources of Expected Outputs

Every test assertion in the ScaleReach E2E suite derives strictly from the project's authoritative requirements documents:

| Component / Subsystem | Authoritative Source Document | Reference Section |
|---|---|---|
| Zero-Paywall & Free Clone Guarantee | `ORIGINAL_REQUEST.md` | Requirements R1 & R2, Acceptance Criteria |
| 12-Platform URL Detection Matrix | Survey Report 3 (`pipeline_report.md`) | § 1.1 Video Ingestion Subsystem |
| Direct Multipart Upload (>100MB) | Survey Report 3 (`pipeline_report.md`) | § 1.1.B Uppy Multipart Engine |
| 15 Clip Type Categories | Survey Report 1 (`survey_report.md`) | § 2.2 The 15 Clip Type Categories |
| 5 Quick Prompt Chips & Durations | Survey Report 1 (`survey_report.md`) | § 2.2 Prompt Chips & Duration Selectors |
| 24 Caption Presets (Verbatim CSS) | Survey Report 1 (`survey_report.md`) | § 2.1 The 24 Caption Styles |
| 29 B-Roll Video Asset Catalog | Survey Report 1 (`survey_report.md`) | § 2.3 Split-Screen Layouts & 29 Background Assets |
| 27 Google Fonts Catalog | Survey Report 1 (`survey_report.md`) | § 1.2 Typography Hierarchy |
| Word Clamping (`segment[i].endTime <= segment[i+1].startTime`) | Survey Report 3 (`pipeline_report.md`) | § 1.2 Caption Grouping / Phrase Chunking |
| 9:16 Re-framing & Gaussian Blur (25px) | Survey Report 3 (`pipeline_report.md`) | § 1.4 Vertical 9:16 Re-framing |
| Interface Contracts (`/api/videos/submit`, `/api/clips`, `/export`) | `PROJECT.md` | § Interface Contracts 1–4 |

---

## 5. Reference Oracles & Contract Validators

The test harness incorporates dedicated reference oracles to validate mathematical and domain correctness without external server dependencies:

### 5.1 `tests/helpers/pipeline-oracles.js`
- **`detectPlatformUrl(url)`**: Validates regex and URL format patterns across YouTube, Twitch VOD, Kick, Google Drive, Dropbox, Loom, Rumble, Dailymotion, Streamable, Wistia, Vidyard, and direct media links. Rejects Twitch channel live streams and malformed URI schemes.
- **`validateFileUpload(file)`**: Enforces allowed MIME types (`video/mp4`, `video/webm`, `video/quicktime`), 0-byte corrupt file rejection, and multipart threshold (> 100MB chunking).
- **`clampSubtitleTimings(words)`**: Enforces continuous word timing clamping:
  $$\text{segment}[i].\text{endTime} = \min(\text{segment}[i].\text{endTime}, \text{segment}[i+1].\text{startTime})$$
  Ensures words have a minimum of 50ms display duration.
- **`chunkWordsIntoPhrases(words, wordsPerLine)`**: Algorithmic chunking respecting punctuation terminators `/[.!?]$/` and line width constraints.
- **`escapeAssText(text)`**: Escapes ASS meta-characters (`{` $\to$ `\{`, `}` $\to$ `\}`, `\` $\to$ `\\`) and strips malicious HTML/XSS markup.
- **`calculateLayoutGeometry(mode, source, options)`**: Computes pixel coordinates for 1080x1920 9:16 viewports:
  - Single speaker centroid clamping: $\text{clamp}(\text{faceX} - \text{cropWidth}/2, 0, \text{sourceWidth} - \text{cropWidth})$
  - Split-screen divider ratio calculations (30/70 to 70/30).
  - Gaussian blur pillarbox centering with 25px blur radius.
- **`calculateViralityScore(metrics)`**: Computes composite score from weighted formula:
  $$\text{Score} = \text{round}(0.40 \cdot \text{Hook} + 0.35 \cdot \text{Engagement} + 0.25 \cdot \text{Emotion})$$
- **`computeWaveformPeaks(channelData, numColumns)`**: Decimates raw AudioBuffer float values into normalized min/max peaks for canvas rendering.

### 5.2 `tests/helpers/contract-validators.js`
Strict structural schema validation enforcing TypeScript interface contracts from `PROJECT.md`:
- `validateVideoSubmitRequest(req)`
- `validateVideoSubmitResponse(res)`
- `validateClipItem(clip)`
- `validateCaptionData(caption)`
- `validateExportRequest(req)`
- `validateExportResponse(res)`

### 5.3 `tests/helpers/mock-storage.js`
In-memory persistence layer simulating the zero-paywall workspace profile (`minutesRemaining: Infinity`, `plan: 'unlimited_pro'`, `watermarkEnabled: false`), video lifecycle state transitions, clip repository, and export job queue.

---

## 6. Directory Layout & Fixtures

```
tests/
├── run-all-tests.js                  # Master test runner script (executable)
├── fixtures/
│   ├── sample-urls.json              # Valid/invalid URL matrix across 12 platforms
│   ├── sample-transcripts.json       # Standard, rapid, overlapping, Unicode, and edge transcripts
│   ├── sample-configs.json           # 15 clip types, prompt chips, and duration definitions
│   ├── sample-presets.json           # All 24 caption presets & 27 fonts catalog
│   └── sample-broll.json             # Complete 29 background video assets catalog
├── helpers/
│   ├── test-context.js               # Zero-dependency test context & assertions
│   ├── contract-validators.js        # Strict domain schema validators
│   ├── pipeline-oracles.js           # Authoritative reference calculation engine
│   └── mock-storage.js               # In-memory zero-paywall storage engine
└── e2e/
    ├── tier1-features.test.js        # Tier 1: 40 feature coverage tests
    ├── tier2-boundaries.test.js      # Tier 2: 40 boundary & corner tests
    ├── tier3-combinations.test.js    # Tier 3: 15 cross-feature tests
    └── tier4-scenarios.test.js       # Tier 4: 5 real-world user journey tests
```

---

## 7. Verification Results

Running the master test suite yields 100% pass across all tiers:
```
======================================================
 ScaleReach E2E & Integration Test Suite Summary
======================================================
Total Tests Run:  100
Passed:           100
Failed:           0
Skipped:          0
Total Time:       0.15s
======================================================
 ALL TESTS PASSED (100% SUCCESS)
```
