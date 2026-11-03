# ScaleReach — Autonomous Viral Short-Form Video Creation Platform
### Personal, Open-Source & 100% Free Clone of [ScaleReach](https://app.scalereach.ai)

An enterprise-grade, standalone personal clone of ScaleReach that converts long-form videos (YouTube, Twitch, Kick, Loom, Google Drive, or local files) into viral 9:16 short-form clips. Featuring autonomous speech-to-text with word-level millisecond timestamps, algorithmic virality hook scoring, 24 professional creator caption presets, 29 B-roll split-screen assets, and a comprehensive in-browser multi-track video editing workstation — **with zero paywalls, no login walls, no subscription meters, and no watermarks**.

---

## ⚡ Zero-Paywall Guarantee

Unlike commercial SaaS alternatives, this application is engineered from the ground up for personal, unrestricted use:
- **No Authentication Required**: Immediate access to the full dashboard, configurator, and workstation without signing up or logging in.
- **No Credit / Minute Limits**: Process unlimited hours of video without credit countdowns or 429 quota exhaustion.
- **No Watermarks**: Native 1080p and 60fps video rendering without watermarks or brand badges.
- **Local SQLite Persistence**: All videos, clips, custom brand presets, and timelines persist in local database storage (`storage/db.json`).

---

## 🚀 Key Features

### 1. Ingestion Subsystem (`/`)
- **12+ Video Platforms Supported**: YouTube (Videos, Shorts, Live VODs), Twitch clips/VODs, Kick, Loom, Google Drive, Vimeo, Dailymotion, Rumble, Twitter/X, and direct MP4/WebM URLs.
- **Drag-and-Drop File Upload**: Direct browser upload supporting MP4, WebM, MOV, and AVI formats with chunked multipart processing for files exceeding 100MB.
- **Pre-flight URL Validation**: Live format validation, video metadata extraction, and platform recognition.

### 2. Pipeline Configurator (`/configure`)
- **Timeframe Dual-Slider Trimmer**: Interactive range slider to specify exact start/end processing windows.
- **15 Clip Type Categories**: Viral Clips, Podcast Banter, Educational Insights, Actionable Tips, Storytelling, Controversial Takes, High-Energy Moments, Product Highlights, Emotional Peaks, Jokes & Memes, Negative Highlights, Memorable Phrases, Interviews, Tutorials, and Custom.
- **5 Duration Targets**: `<30s`, `30s-60s`, `60s-90s`, `90s-3m`, or `any`.
- **AI Hook Prompt Chips**: Quick-activation prompts instructing the virality engine on audience retention focus.

### 3. Professional Creator Caption Engine
- **24 Iconic Creator Presets**:
  - *Alex Hormozi Style*: Uppercase TheBoldFont, 6px stroke, active yellow `#FFE600` pop with spring bounce.
  - *MrBeast Pro*: Ultra-bold Komika Axis, vibrant green `#00FF66` highlight with elastic scale.
  - *GaryVee*: High-contrast red punch with rapid-fire subtitle pacing.
  - *TikTok Native*: Authentic sans-serif with subtle translucent backdrop badge.
  - *Billy*: Playful cartoon style with gentle angle tilt.
  - *19 Additional Styles*: Classic, Blue Glow, Toxic Green, Blue Sheen, Master Pop, Cyan Gloss, Chrome Blue, Green Gloss, Duo Style, Basker, Simple, Neon Pop, Cinematic, Electric Blue, Sunset Fire, Ice Cold, Coral Pop, Midnight Purple, and Georgia Elegance.
- **27 Typography Families**: TheBoldFont, Komika Axis, Montserrat Black, Bebas Neue, Futura Heavy, Anton, Luckiest Guy, Poppins ExtraBold, and more.
- **Dynamic Emoji Insertion**: Automatically binds expressive emojis (🔥, 💰, 🚀, 💀, 📈, 🤯) to high-energy transcript keywords.

### 4. Split-Screen & B-Roll Compositor
- **29 Curated Gameplay & ASMR Assets**:
  - *GTA 5 Gameplay*: 13 high-speed car chases, stunt races, and ramps.
  - *Minecraft Parkour*: 8 spiral towers, lava jumps, and droppers.
  - *Subway Surfers*: 3 classic endless runner tracks.
  - *Relaxing ASMR*: 5 kinetic sand slicing, soap carving, and hydraulic press clips.
- **Customizable Layout Ratios**: Adjustable split divider (30/70, 50/50, 60/40, 70/30) with individual audio volume balancing.
- **25px Gaussian Blur Fill**: Cinematic blurred letterboxing for horizontal videos in 9:16 vertical orientation.

### 5. In-Browser Multi-Track Video Workstation (`/clips/[clipId]`)
- **Interactive Multi-Track Timeline**:
  - Video strip track with frame thumbnails.
  - Audio waveform track generated directly via Web Audio API `AudioBuffer`.
  - Word subtitle block track with interactive click-and-drag trimming handles.
  - Playhead scrubbing with frame-accurate seeking and timeline zoom (`0.5x` to `6.0x`).
  - Bookmarking marker tool and snap-to-word grid alignment.
- **WYSIWYG 9:16 Canvas Studio**:
  - Live video playback compositing speaker video, split-screen B-roll, and kinetic subtitles.
  - Drag-and-drop repositioning bounding boxes for facecam, subtitles, and image overlays.
- **Interactive Subtitle Word Inspector**:
  - Click any transcript word to edit spelling, adjust millisecond timestamps, customize highlight colors, or strike through to cut playback.
- **5-Tab Workstation Inspector**:
  - *Captions*: Full preset selector, typography, font size, stroke, and highlight colors.
  - *Reframe*: Single speaker face-tracking, two-speaker dual split, or split-screen B-roll.
  - *Text Overlay*: Custom title badges, headers, and call-to-actions.
  - *Image Overlay*: Brand logos and watermarks with corner snapping.
  - *Clip Info*: Virality scorecard (0-100), key hook breakdown, and social sharing suggestions.

### 6. Media Processing & Export Engine (`lib/media/`)
- **Speech-to-Text**: Whisper ONNX with word-level millisecond cross-attention alignment and Silero VAD silence suppression.
- **Virality Scoring**: Algorithmic NLP evaluator analyzing question hooks, emotional density, sentiment shifts, and optimal retention boundaries.
- **Native FFmpeg Rendering**: Bundled `ffmpeg-static` rendering high-bitrate H.264 MP4 videos with hardcoded ASS (Advanced SubStation Alpha) subtitle filtergraphs without cloud fees or external servers.

---

## 🏛️ System Architecture

```
                       ┌────────────────────────────────────────┐
                       │        User Browser Interface          │
                       │  (Next.js 15 App Router / React 19)    │
                       └───────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         │                                 │                                │
         ▼                                 ▼                                ▼
┌─────────────────┐             ┌────────────────────┐            ┌────────────────────┐
│ Dashboard (/)   │             │ Configurator       │            │ Workstation        │
│ • URL Ingestion │             │ (/configure)       │            │ (/clips/[clipId])  │
│ • Local Upload  │             │ • Dual Slider      │            │ • Canvas Player    │
│ • Recent Videos │             │ • 15 Categories    │            │ • Waveform Timeline│
└────────┬────────┘             │ • 24 Presets       │            │ • Word Inspector   │
         │                      └─────────┬──────────┘            └─────────┬──────────┘
         │                                │                                 │
         └────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
                       ┌────────────────────────────────────────┐
                       │       REST API Route Handlers          │
                       │  /api/videos, /api/clips, /api/export  │
                       └──────────────────┬─────────────────────┘
                                          │
         ┌────────────────────────────────┼────────────────────────────────┐
         │                                │                                │
         ▼                                ▼                                ▼
┌─────────────────┐             ┌────────────────────┐            ┌────────────────────┐
│ Ingestion Engine│             │ AI Virality Engine │            │ Exporter Subsystem │
│ • yt-dlp-exec   │             │ • Whisper STT (DTW)│            │ • FFmpeg Filtergraph│
│ • Multipart Bus │             │ • Silero VAD       │            │ • ASS Compositor   │
│ • Local Storage │             │ • Hook Boundary NLP│            │ • Unwatermarked MP4│
└─────────────────┘             └────────────────────┘            └────────────────────┘
```

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|-----------|-------------|
| **Framework** | Next.js 15.5+ (App Router) | Server components, API routes, optimized static builds |
| **Frontend Library** | React 19 + TypeScript | Full type safety across state and UI |
| **Styling** | Tailwind CSS v3 | Custom dark-theme tokens matching ScaleReach design |
| **State Management** | Zustand 5 | Client-side reactive workstation timeline state |
| **Icons** | Lucide React | Modern vector icon set |
| **Persistence** | SQLite / Local File DB (`lib/db.ts`) | Zero-dependency permanent JSON/SQLite store |
| **Transcription** | Whisper / Speech-to-Text | Word-level timestamp generation and VAD |
| **Video Compositing** | Fluent-FFmpeg + FFmpeg-Static | Native cross-platform MP4 export |
| **Test Suite** | Node.js Test Harness (4 Tiers) | 100 comprehensive automated integration & E2E tests |

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+ / v22+
- **npm**: v9+ (or pnpm / yarn)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/goatedryuzaki/scalereach-clone.git
cd scalereach-clone

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Building for Production

```bash
npm run build
npm run start
```

---

## 🧪 Comprehensive Test Suite (100 Tests)

The repository includes a 4-tier automated test harness verifying every feature, edge case, cross-module interaction, and creator scenario.

```bash
# Run all 100 tests
node tests/run-all-tests.js
```

### Test Suite Structure

```
tests/
├── e2e/
│   ├── tier1-features.test.js      # 40 Tests: Core features across 8 subsystems
│   ├── tier2-boundaries.test.js    # 40 Tests: Edge cases, zero division, escaping, limits
│   ├── tier3-combinations.test.js  # 15 Tests: Cross-feature pairwise interactions
│   └── tier4-scenarios.test.js     #  5 Tests: Real-world creator workflows
├── fixtures/                       # Deterministic test data (presets, B-roll, URLs)
├── helpers/                        # Test context, storage mocks, and contract validators
└── run-all-tests.js                # Dual-track high-performance test runner
```

| Tier | Category | Focus | Test Count | Status |
|------|----------|-------|------------|--------|
| **Tier 1** | Feature Verification | Ingestion, Configurator, 24 Presets, Waveform, Reframe, Zero-Paywall, Export | 40 | ✅ 40/40 Passing |
| **Tier 2** | Boundary & Security | 0-byte uploads, malformed URLs, XML/ASS sanitization, rate limit immunity | 40 | ✅ 40/40 Passing |
| **Tier 3** | Combinations | Platform + Category + Preset + Reframe + Export matrix combinations | 15 | ✅ 15/15 Passing |
| **Tier 4** | Creator Scenarios | Podcasts, TikTok Memes, Gaming, Multilingual, and Marketing Workflows | 5 | ✅ 5/5 Passing |
| **Total** | | | **100** | **✅ 100/100 (100% Pass Rate)** |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/videos/submit` | Ingest video via URL or local multipart file upload |
| `GET` | `/api/videos/[videoId]` | Query video status, metadata, and progress |
| `GET` | `/api/videos/[videoId]/clips` | Retrieve generated clips with virality scores & timestamps |
| `GET` | `/api/clips/[clipId]` | Get clip details, transcript, and timeline data |
| `PATCH` | `/api/clips/[clipId]` | Update clip title, trim boundaries, or aspect ratio |
| `GET` | `/api/clips/[clipId]/captions` | Get word-level captions and styling configuration |
| `PUT` | `/api/clips/[clipId]/captions` | Save edited word text, timing, or highlight overrides |
| `POST` | `/api/clips/[clipId]/export` | Trigger unwatermarked 1080p/60fps FFmpeg export job |
| `GET` | `/api/clips/[clipId]/export` | Poll export render progress and retrieve download URL |
| `GET` | `/api/templates` | Fetch full catalog of 24 caption presets and 29 B-roll assets |
| `GET` | `/api/brand-templates` | List and save custom user creator presets |
| `GET` | `/api/workspace` | Get zero-paywall workspace statistics and storage health |

---

## 📄 License

MIT License — Copyright (c) 2026 ScaleReach Personal Clone Contributors.
Free for personal and commercial usage.
