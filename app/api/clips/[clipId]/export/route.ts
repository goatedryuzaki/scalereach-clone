import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { renderClip } from '@/lib/media/exporter';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
) {
  try {
    const { clipId } = await params;
    let clip = db.getClip(clipId);
    if (!clip) {
      // Auto-create clip entity in database for new videos
      clip = db.createClip({
        id: clipId,
        videoId: 'video_new',
        title: 'Exported Viral Clip',
        duration: 35.7,
        startTime: 0,
        endTime: 35.7,
        aspectRatio: '9:16',
        templateId: 'hormozi',
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Forceful zero-paywall enforcement: includeWatermark is ALWAYS false
    const includeWatermark = false;

    // Fallbacks for resolutions and options
    let resolution: '1080p' | '720p' | '4k' = '1080p';
    if (['1080p', '720p', '4k'].includes(body.resolution)) {
      resolution = body.resolution;
    }

    let fps: 30 | 60 = 60;
    if (body.fps === 30 || body.fps === 60) {
      fps = body.fps;
    }

    let aspectRatio: '9:16' | '16:9' | '1:1' = '9:16';
    if (['9:16', '16:9', '1:1'].includes(body.aspectRatio)) {
      aspectRatio = body.aspectRatio;
    } else if (clip.aspectRatio) {
      aspectRatio = clip.aspectRatio;
    }

    let layoutType: 'single' | 'split' | 'blur_fill' = 'single';
    if (['single', 'split', 'blur_fill'].includes(body.layoutType)) {
      layoutType = body.layoutType;
    }

    const presetId = body.presetId || clip.templateId || 'classic';

    const job = await renderClip(clipId, {
      resolution,
      fps,
      aspectRatio,
      presetId,
      layoutType,
    });

    return NextResponse.json(
      {
        jobId: job.jobId,
        status: job.status,
        downloadUrl: job.downloadUrl || undefined,
        progress: job.progress,
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
) {
  try {
    const { clipId } = await params;
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    const isDownload = url.searchParams.get('download') === 'true';

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
    }

    const job = db.getExportJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    if (isDownload) {
      const filePath =
        job.outputPath || path.join(process.cwd(), 'storage', 'exports', `${jobId}.mp4`);

      if (fs.existsSync(filePath)) {
        const fileStat = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);
        return new NextResponse(fileStream as any, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': fileStat.size.toString(),
            'Content-Disposition': `attachment; filename="${clipId}-1080p.mp4"`,
          },
        });
      }
    }

    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      includeWatermark: false,
      resolution: job.resolution,
      fps: job.fps,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
