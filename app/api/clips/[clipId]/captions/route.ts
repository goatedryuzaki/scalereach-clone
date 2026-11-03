import { NextRequest, NextResponse } from 'next/server';
import { db, CaptionData } from '@/lib/db';
import { getPresetById } from '@/lib/presets-catalog';
import { clampSubtitleTimings } from '@/lib/media/transcriber';

const DEFAULT_WORDS = [
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
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
) {
  try {
    const { clipId } = await params;
    let captions = db.getCaptions(clipId);

    if (!captions) {
      const clip = db.getClip(clipId);
      const presetId = clip?.templateId || 'classic';
      const preset = getPresetById(presetId);

      captions = db.saveCaptions(clipId, {
        clipId,
        presetId,
        words: DEFAULT_WORDS,
        style: {
          fontFamily: preset.fontFamily || 'Poppins',
          fontSize: 44,
          textColor: preset.primaryColor.startsWith('#') ? preset.primaryColor : '#FFFFFF',
          highlightColor: preset.highlightColor.startsWith('#') ? preset.highlightColor : '#FFFF00',
          strokeColor: '#000000',
          strokeWidth: 5,
          animation: preset.animation || 'fade-up',
        },
      });
    }

    // Ensure timings are clamped
    captions.words = clampSubtitleTimings(captions.words);

    return NextResponse.json(captions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
) {
  try {
    const { clipId } = await params;
    const body = await req.json();

    let captions = db.getCaptions(clipId);
    if (!captions) {
      const preset = getPresetById('classic');
      captions = {
        clipId,
        presetId: 'classic',
        words: [],
        style: {
          fontFamily: 'Poppins',
          fontSize: 44,
          textColor: '#FFFFFF',
          highlightColor: '#FFFF00',
          strokeColor: '#000000',
          strokeWidth: 5,
          animation: 'fade-up',
        },
      };
    }

    if (body.words && Array.isArray(body.words)) {
      captions.words = clampSubtitleTimings(body.words);
    }
    if (body.presetId) {
      captions.presetId = body.presetId;
    }
    if (body.style) {
      captions.style = { ...captions.style, ...body.style };
    }

    const saved = db.saveCaptions(clipId, captions);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
) {
  try {
    const { clipId } = await params;
    const body = await req.json();

    let captions = db.getCaptions(clipId);
    if (!captions) {
      return NextResponse.json({ error: 'Captions not found' }, { status: 404 });
    }

    if (body.presetId) {
      captions.presetId = body.presetId;
    }
    if (body.style) {
      captions.style = { ...captions.style, ...body.style };
    }
    if (body.words && Array.isArray(body.words)) {
      captions.words = clampSubtitleTimings(body.words);
    }

    const saved = db.saveCaptions(clipId, captions);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
