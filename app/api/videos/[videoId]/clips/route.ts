import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const clips = db.listClipsForVideo(videoId);

    const formattedClips = clips.map((c) => ({
      id: c.id,
      videoId: c.videoId,
      title: c.title,
      introTitle: c.introTitle,
      startTime: c.startTime,
      endTime: c.endTime,
      duration: Number((c.endTime - c.startTime).toFixed(2)),
      transcript: c.transcript,
      viralityScore: c.viralityScore,
      viralityReason: c.viralityReason,
      improvementSuggestion: c.improvementSuggestion,
      hooks: c.hooks,
      emotions: c.emotions,
      recommendedPlatforms: c.recommendedPlatforms,
      aspectRatio: c.aspectRatio,
      templateId: c.templateId,
      thumbnailUrl: c.thumbnailUrl,
      favorited: c.favorited || false,
      createdAt: c.createdAt,
    }));

    // If request has header or query param requesting object shape
    const url = new URL(_req.url);
    if (url.searchParams.get('format') === 'object') {
      return NextResponse.json({
        videoId,
        clips: formattedClips,
        count: formattedClips.length,
        filters: { sortBy: 'score', sortOrder: 'desc' },
      });
    }

    return NextResponse.json(formattedClips);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
