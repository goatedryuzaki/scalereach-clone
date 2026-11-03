import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const videos = db.listVideos();
  return NextResponse.json({
    videos,
    total: videos.length,
    page: 1,
    pageSize: 20,
  });
}
