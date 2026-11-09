import { NextRequest, NextResponse } from 'next/server';
import { detectPlatformUrl } from '@/lib/media/ingestion';

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) {
    return NextResponse.json({ valid: false, error: 'Missing url parameter' }, { status: 400 });
  }

  const result = detectPlatformUrl(url);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error || 'Invalid or unsupported video URL' }, { status: 400 });
  }

  let title = `Video from ${result.platform ? result.platform.toUpperCase() : 'Web'}`;
  let channelName = result.platform ? result.platform.charAt(0).toUpperCase() + result.platform.slice(1) : 'Creator';
  let thumbnail = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60';
  let duration = 214; // Default estimate in seconds (3:34)

  if (result.platform === 'youtube' && result.extractedId) {
    thumbnail = `https://i.ytimg.com/vi/${result.extractedId}/hqdefault.jpg`;
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) title = data.title;
        if (data.author_name) channelName = data.author_name;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch {
      // Graceful fallback to extracted ID title
      title = `YouTube Video (${result.extractedId})`;
    }
  } else if (result.platform === 'direct_video') {
    const filename = url.split('/').pop()?.split('?')[0] || 'Direct Video';
    title = decodeURIComponent(filename).replace(/\.[^/.]+$/, '');
  }

  return NextResponse.json({
    valid: true,
    platform: result.platform,
    sourceId: result.extractedId,
    title,
    channelName,
    duration,
    thumbnail,
    language: 'en',
  });
}
