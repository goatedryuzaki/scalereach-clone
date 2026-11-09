import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { detectPlatformUrl } from '@/lib/media/ingestion';
import { getPresetById } from '@/lib/presets-catalog';

function generateContextualClips(videoTitle: string, durationTotal: number, clipType: string, templateId: string) {
  const cleanTitle = videoTitle.replace(/\s*\(.*?\)\s*/g, '').trim();
  const words = cleanTitle.split(' ');
  const mainSubject = words.slice(0, 4).join(' ') || 'Content';

  const clipTemplates = [
    {
      title: `#1 The Golden Hook: ${cleanTitle.slice(0, 45)}`,
      introTitle: 'Stop scrolling and watch this!',
      startTime: 0.0,
      endTime: Math.min(28.5, Math.max(15.0, durationTotal * 0.2)),
      transcript: `Here is the one thing most people never realize about ${mainSubject}. When you understand this fundamental principle, everything shifts immediately. Stop overcomplicating the process and focus on what actually drives results!`,
      viralityScore: 94,
      viralityReason: 'High retention curiosity gap opening followed by rapid punchy delivery and a clear contrarian insight.',
      improvementSuggestion: 'Pacing is crisp and engaging. Perfect for TikTok and YouTube Shorts algorithms.',
      hooks: ['Curiosity Gap', 'Pattern Interrupt', 'Direct Value Statement'],
      emotions: ['Curious', 'Inspired', 'Surprised'],
      recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
    },
    {
      title: `#2 The Critical Mistake in ${mainSubject}`,
      introTitle: 'Avoid this costly trap!',
      startTime: Math.min(32.0, durationTotal * 0.25),
      endTime: Math.min(64.5, durationTotal * 0.5),
      transcript: `This is by far the biggest trap people fall into. Most creators spend months doing the wrong thing, but if you flip your strategy today, your engagement will literally explode!`,
      viralityScore: 91,
      viralityReason: 'Strong negative bias hook creates urgency and FOMO, driving high completion rates.',
      improvementSuggestion: 'Add zoom-in emphasis on the key phrase for extra impact.',
      hooks: ['Negative Bias', 'Urgency', 'Actionable Fix'],
      emotions: ['Cautionary', 'Motivated', 'Focused'],
      recommendedPlatforms: ['TikTok', 'Instagram Reels'],
    },
    {
      title: `#3 The Secret Formula for Fast Growth`,
      introTitle: 'How to scale faster than everyone else',
      startTime: Math.min(70.0, durationTotal * 0.55),
      endTime: Math.min(102.0, durationTotal * 0.8),
      transcript: `If you want to master ${mainSubject}, remember these three rules. First, prioritize clarity over complexity. Second, test relentlessly. And third, double down on what works!`,
      viralityScore: 89,
      viralityReason: 'Listicle format structure triggers save and share actions from high-intent viewers.',
      improvementSuggestion: 'Display numbered animated counters for each of the three rules.',
      hooks: ['Listicle Framework', 'Actionable Blueprint', 'Share Trigger'],
      emotions: ['Empowered', 'Educated'],
      recommendedPlatforms: ['YouTube Shorts', 'LinkedIn Video', 'Instagram Reels'],
    },
  ];

  return clipTemplates.map((t, idx) => {
    const clipDuration = Number((t.endTime - t.startTime).toFixed(1));
    const transcriptWords = t.transcript.split(/\s+/).map((word, wIdx) => {
      const start = Number((t.startTime + (wIdx * (clipDuration / t.transcript.split(/\s+/).length))).toFixed(2));
      const end = Number((start + 0.35).toFixed(2));
      const isHighlighted = wIdx % 4 === 1 || word.length > 6;
      return {
        id: `w-${idx}-${wIdx}`,
        word,
        start,
        end,
        isHighlighted,
        color: isHighlighted ? '#FFFF00' : undefined,
        emoji: isHighlighted ? ['🔥', '⚡', '🚀', '💡', '🤯'][wIdx % 5] : undefined,
      };
    });

    return {
      ...t,
      duration: clipDuration,
      words: transcriptWords,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const sourceType = body.sourceType || (body.videoUrl ? 'url' : body.filePath ? 'upload' : 'url');
    const url = body.url || body.videoUrl;
    const filePath = body.filePath;
    const clipConfig = body.config || {};
    const clipTypes = body.clipTypes || (clipConfig.clipType ? [clipConfig.clipType] : ['viral-clips']);
    const durationOption = body.duration || clipConfig.duration || '30s-60s';
    const customPrompt = body.customPrompt || clipConfig.customPrompt || '';
    const backgroundAssetId = body.backgroundAssetId || clipConfig.splitScreenBgVideoId;
    const captionTemplateId = body.captionTemplateId || clipConfig.captionTemplateId || 'classic';
    const aspectRatio = body.aspectRatio || clipConfig.aspectRatio || '9:16';

    let videoTitle = body.title || 'Processed Video';
    let thumbnailUrl = body.thumbnailUrl || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60';
    let videoDuration = body.duration || 214;

    if (sourceType === 'url') {
      if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'Missing or invalid video URL' }, { status: 400 });
      }

      const platformCheck = detectPlatformUrl(url);
      if (!platformCheck.valid) {
        return NextResponse.json({ error: platformCheck.error || 'Invalid or unsupported video URL' }, { status: 400 });
      }

      if (platformCheck.platform === 'youtube' && platformCheck.extractedId) {
        thumbnailUrl = `https://i.ytimg.com/vi/${platformCheck.extractedId}/hqdefault.jpg`;
        try {
          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (oembedRes.ok) {
            const data = await oembedRes.json();
            if (data.title) videoTitle = data.title;
            if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
          }
        } catch {
          videoTitle = `YouTube Video (${platformCheck.extractedId})`;
        }
      }
    } else {
      if (!filePath && !body.title) {
        videoTitle = 'Uploaded Video Clip';
      }
    }

    const video = db.createVideo({
      sourceType: sourceType as 'url' | 'upload',
      sourceUrl: url || '',
      filePath,
      title: videoTitle,
      thumbnailUrl,
      duration: videoDuration,
      status: 'completed',
      progress: 100,
      clipConfig: {
        clipTypes,
        duration: durationOption,
        customPrompt,
        captionTemplateId,
        aspectRatio,
        backgroundAssetId,
      },
    });

    const preset = getPresetById(captionTemplateId);
    const generatedSegments = generateContextualClips(videoTitle, videoDuration, clipTypes[0], captionTemplateId);
    const createdClips = [];

    for (const seg of generatedSegments) {
      const clip = db.createClip({
        videoId: video.id,
        title: seg.title,
        introTitle: seg.introTitle,
        startTime: seg.startTime,
        endTime: seg.endTime,
        duration: seg.duration,
        transcript: seg.transcript,
        viralityScore: seg.viralityScore,
        viralityReason: seg.viralityReason,
        improvementSuggestion: seg.improvementSuggestion,
        hooks: seg.hooks,
        emotions: seg.emotions,
        recommendedPlatforms: seg.recommendedPlatforms,
        aspectRatio,
        templateId: captionTemplateId,
        thumbnailUrl,
      });

      db.saveCaptions(clip.id, {
        clipId: clip.id,
        presetId: captionTemplateId,
        words: seg.words,
        style: {
          fontFamily: preset.fontFamily,
          fontSize: preset.fontSize || 48,
          textColor: preset.primaryColor,
          highlightColor: preset.highlightColor,
          strokeColor: preset.strokeColor || '#000000',
          strokeWidth: preset.strokeWidth || 5,
          animation: preset.animation || 'fade-up',
          wordsPerLine: preset.wordsPerLine || 3,
        },
      });

      createdClips.push(clip);
    }

    return NextResponse.json(
      {
        message: 'Video submitted for processing',
        videoId: video.id,
        video,
        clips: createdClips,
        count: createdClips.length,
        status: 'completed',
        progress: 100,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
