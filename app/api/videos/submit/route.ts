import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { detectPlatformUrl } from '@/lib/media/ingestion';
import { extractViralSegments } from '@/lib/media/virality-scorer';

const DEFAULT_SAMPLE_WORDS = [
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
  { id: 'w-12', word: 'Stop', start: 4.85, end: 5.20, isHighlighted: true, color: '#FF0000' },
  { id: 'w-13', word: 'wasting', start: 5.22, end: 5.60, isHighlighted: false },
  { id: 'w-14', word: 'time', start: 5.62, end: 5.95, isHighlighted: false },
  { id: 'w-15', word: 'editing', start: 5.98, end: 6.45, isHighlighted: false },
  { id: 'w-16', word: 'manually.', start: 6.48, end: 7.10, isHighlighted: false },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both VideoSubmitRequest and legacy/direct body shapes
    const sourceType = body.sourceType || (body.videoUrl ? 'url' : body.filePath ? 'upload' : undefined);
    const url = body.url || body.videoUrl;
    const filePath = body.filePath;
    const clipTypes = body.clipTypes || (body.config?.clipType ? [body.config.clipType] : ['viral-clips']);
    const duration = body.duration || '30s-60s';
    const customPrompt = body.customPrompt || body.config?.customPrompt || '';
    const backgroundAssetId = body.backgroundAssetId;

    if (!sourceType || !['url', 'upload'].includes(sourceType)) {
      return NextResponse.json(
        { error: 'Invalid sourceType. Must be "url" or "upload".' },
        { status: 400 }
      );
    }

    if (sourceType === 'url') {
      if (!url || typeof url !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid "url" string for sourceType="url"' },
          { status: 400 }
        );
      }

      const platformCheck = detectPlatformUrl(url);
      if (!platformCheck.valid) {
        return NextResponse.json(
          { error: platformCheck.error || 'Invalid or unsupported video URL' },
          { status: 400 }
        );
      }

      const title = `Clips from ${platformCheck.platform ? platformCheck.platform.toUpperCase() : 'Video'} (${platformCheck.extractedId || 'clip'})`;
      const video = db.createVideo({
        sourceType: 'url',
        sourceUrl: url,
        title,
        duration: 317,
        status: 'completed',
        progress: 100,
        clipConfig: {
          clipTypes,
          duration,
          customPrompt,
          backgroundAssetId,
        },
      });

      // Generate viral segments
      const segments = extractViralSegments(DEFAULT_SAMPLE_WORDS, {
        targetDuration: duration,
        clipType: clipTypes[0],
        customPrompt,
      });

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const clip = db.createClip({
          videoId: video.id,
          title: seg.title,
          introTitle: seg.introTitle,
          startTime: seg.startTime,
          endTime: seg.endTime,
          duration: seg.duration,
          transcript: seg.transcript,
          viralityScore: seg.virality.viralityScore,
          viralityReason: seg.virality.viralityReason,
          improvementSuggestion: seg.virality.improvementSuggestion,
          hooks: seg.virality.hooks,
          emotions: seg.virality.emotions,
          recommendedPlatforms: seg.virality.recommendedPlatforms,
          aspectRatio: '9:16',
          templateId: 'hormozi',
        });

        db.saveCaptions(clip.id, {
          clipId: clip.id,
          presetId: 'hormozi',
          words: DEFAULT_SAMPLE_WORDS,
          style: {
            fontFamily: 'Anton',
            fontSize: 48,
            textColor: '#FFFFFF',
            highlightColor: '#FFD700',
            strokeColor: '#000000',
            strokeWidth: 5,
            animation: 'punch',
          },
        });
      }

      return NextResponse.json(
        {
          videoId: video.id,
          title: video.title,
          duration: video.duration,
          status: 'completed',
          progress: 100,
        },
        { status: 201 }
      );
    } else {
      if (!filePath || typeof filePath !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid "filePath" string for sourceType="upload"' },
          { status: 400 }
        );
      }

      const video = db.createVideo({
        sourceType: 'upload',
        filePath,
        title: 'Uploaded Video',
        duration: 180,
        status: 'completed',
        progress: 100,
        clipConfig: {
          clipTypes,
          duration,
          customPrompt,
          backgroundAssetId,
        },
      });

      const segments = extractViralSegments(DEFAULT_SAMPLE_WORDS, {
        targetDuration: duration,
      });

      for (const seg of segments) {
        const clip = db.createClip({
          videoId: video.id,
          title: seg.title,
          introTitle: seg.introTitle,
          startTime: seg.startTime,
          endTime: seg.endTime,
          duration: seg.duration,
          transcript: seg.transcript,
          viralityScore: seg.virality.viralityScore,
          viralityReason: seg.virality.viralityReason,
          improvementSuggestion: seg.virality.improvementSuggestion,
          hooks: seg.virality.hooks,
          emotions: seg.virality.emotions,
          recommendedPlatforms: seg.virality.recommendedPlatforms,
          aspectRatio: '9:16',
          templateId: 'classic',
        });

        db.saveCaptions(clip.id, {
          clipId: clip.id,
          presetId: 'classic',
          words: DEFAULT_SAMPLE_WORDS,
          style: {
            fontFamily: 'Poppins',
            fontSize: 44,
            textColor: '#FFFFFF',
            highlightColor: '#FFFF00',
            strokeColor: '#000000',
            strokeWidth: 5,
            animation: 'fade-up',
          },
        });
      }

      return NextResponse.json(
        {
          videoId: video.id,
          title: video.title,
          duration: video.duration,
          status: 'completed',
          progress: 100,
        },
        { status: 201 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
