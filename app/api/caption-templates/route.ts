import { NextResponse } from 'next/server';
import { CAPTION_PRESETS } from '@/lib/presets-catalog';

export async function GET() {
  return NextResponse.json({
    presets: CAPTION_PRESETS,
  });
}
