import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const clips = db.listClipsForVideo(videoId);

    // Map to exact ClipItem contract
    const formattedClips = clips.map(c => ({
      id: c.id,
      videoId: c.videoId,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
      duration: Number((c.endTime - c.startTime).toFixed(2)),
      viralityScore: c.viralityScore,
      viralityReason: c.viralityReason,
      improvementSuggestion: c.improvementSuggestion,
      hooks: c.hooks,
      emotions: c.emotions,
      recommendedPlatforms: c.recommendedPlatforms,
      aspectRatio: c.aspectRatio,
      templateId: c.templateId,
    }));

    return NextResponse.json(formattedClips);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
