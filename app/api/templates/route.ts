import { NextResponse } from 'next/server';
import { CAPTION_PRESETS } from '@/lib/presets-catalog';
import { FONTS_CATALOG } from '@/lib/fonts-catalog';
import { BROLL_CATEGORIES, ALL_BROLL_ITEMS } from '@/lib/broll-catalog';

const CLIP_TYPES = [
  { id: 'viral-clips', name: 'Viral Clips', description: 'High engagement short clips with immediate hooks' },
  { id: 'memorable-phrases', name: 'Memorable Phrases', description: 'Extracts high-impact standalone quotes' },
  { id: 'topic-clips', name: 'Topic Clips', description: 'Groups related sentences exploring a central theme' },
  { id: 'trailer', name: 'Trailer', description: 'Dynamic fast-paced teaser showcasing dramatic highlights' },
  { id: 'product-ads', name: 'Product Ads', description: 'Product demonstrations, value propositions, and CTAs' },
  { id: 'testimonial', name: 'Testimonial', description: 'User testimonials, endorsements, positive reviews' },
  { id: 'instructions', name: 'Instructions', description: 'Step-by-step how-to instructions, recipes, code snippets' },
  { id: 'product-features', name: 'Product Features', description: 'Specific feature breakdowns, specs, comparisons' },
  { id: 'positive-highlights', name: 'Positive Highlights', description: 'Uplifting, encouraging, enthusiastic moments' },
  { id: 'negative-highlights', name: 'Negative Highlights', description: 'Critiques, counter-arguments, warning points' },
  { id: 'showcase', name: 'Showcase', description: 'Practical use-cases and live demonstrations' },
  { id: 'multi-product-recap', name: 'Multi-Product Recap', description: 'Summarizes lists of multiple reviewed products' },
  { id: 'speakers-insights', name: 'Speaker\'s Insights', description: 'Personal anecdotes, industry secrets, lessons learned' },
  { id: 'jokes-memes', name: 'Jokes, Memes and Funny Moments', description: 'Detects laughter, punchlines, comedic timing' },
  { id: 'podcast-jokes', name: 'Podcast Jokes and Memes', description: 'Multi-speaker banter, interruptions, funny reactions' },
];

const PROMPT_CHIPS = [
  'Controversial takes or hot opinions',
  'Emotional or vulnerable moments',
  'Funny reactions and one-liners',
  'Actionable tips and how-to steps',
  'Surprising facts or plot twists',
];

const DURATIONS = [
  { id: '<30s', min: 0, max: 30 },
  { id: '30s-60s', min: 30, max: 60 },
  { id: '60s-90s', min: 60, max: 90 },
  { id: '90s-3m', min: 90, max: 180 },
  { id: 'any', min: 0, max: 0 },
];

export async function GET() {
  return NextResponse.json({
    presets: CAPTION_PRESETS,
    fonts: FONTS_CATALOG,
    brollCategories: BROLL_CATEGORIES,
    brollItems: ALL_BROLL_ITEMS,
    clipTypes: CLIP_TYPES,
    promptChips: PROMPT_CHIPS,
    durations: DURATIONS,
  });
}
