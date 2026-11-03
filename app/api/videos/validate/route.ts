import { NextRequest, NextResponse } from 'next/server';
import { detectPlatformUrl } from '@/lib/media/ingestion';

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) {
    return NextResponse.json({ valid: false, error: 'Missing url parameter' }, { status: 400 });
  }

  const result = detectPlatformUrl(url);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    platform: result.platform,
    sourceId: result.extractedId,
    title: `Imported from ${result.platform ? result.platform.toUpperCase() : 'Video Platform'}`,
    duration: 317,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    language: 'en',
  });
}
