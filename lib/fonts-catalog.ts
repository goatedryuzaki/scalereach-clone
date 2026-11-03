/**
 * ScaleReach 27 Creator Typography Fonts Catalog & 20 Word Animations
 * Reverse-engineered from ScaleReach target application
 */

export interface FontDefinition {
  name: string;
  category: 'display' | 'sans-serif' | 'serif' | 'handwriting' | 'monospace';
  googleFont: string;
}

export const FONTS_CATALOG: string[] = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Anton',
  'Bangers',
  'Bebas Neue',
  'Oswald',
  'Righteous',
  'Russo One',
  'Black Ops One',
  'Permanent Marker',
  'Lilita One',
  'Playfair Display',
  'Libre Baskerville',
  'Gelasio',
  'Georgia',
  'Lora',
  'Roboto',
  'Open Sans',
  'Kanit',
  'Allura',
  'Moji Pop',
  'Depo B',
  'Brishti',
  'Rubik',
  'Outfit',
  'Space Grotesk',
  'Luckiest Guy',
  'TheBoldFont',
  'Komika Axis',
];

export interface WordAnimation {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'glow' | 'motion' | 'fx';
}

export const WORD_ANIMATIONS: WordAnimation[] = [
  { id: 'none', name: 'Static / None', description: 'Crisp subtitle lines without word motion', category: 'standard' },
  { id: 'bounce', name: 'Elastic Bounce', description: 'Active word scales up 115-130% and bounces back', category: 'standard' },
  { id: 'fade', name: 'Sequential Fade', description: 'Words smoothly fade in sequentially', category: 'standard' },
  { id: 'karaoke', name: 'Karaoke Wipe', description: 'Continuous smooth left-to-right color wipe', category: 'standard' },
  { id: 'word-by-word', name: 'Single Word Pop', description: 'Only the active spoken word is visible', category: 'standard' },
  { id: 'duo-style', name: 'Duo Alternating', description: 'Two adjacent words highlight in paired color harmony', category: 'standard' },
  { id: 'green-gloss', name: 'Green Gloss Reflection', description: 'Subtle animated gloss reflection over green keywords', category: 'glow' },
  { id: 'chrome-blue', name: 'Chrome Blue Metallic', description: 'Metallic specular highlight sweep across active letters', category: 'glow' },
  { id: 'cyan-gloss', name: 'Cyan Glass Sheen', description: 'Aqua neon glass shine with swift slide', category: 'glow' },
  { id: 'master-pop', name: 'Master Pop Elastic', description: 'Smooth spring zoom-in on the primary keyword', category: 'motion' },
  { id: 'blue-sheen', name: 'Blue Sheen Swipe', description: 'Horizontal gradient reflection sweep', category: 'glow' },
  { id: 'blue-glow', name: 'Blue Halo Glow', description: 'Pulsing neon blue Gaussian blur shadow behind word', category: 'glow' },
  { id: 'fx-cyan-slide', name: 'Cyan Slide Trail', description: 'Left-to-right slide entry with cyan shadow trail', category: 'fx' },
  { id: 'fx-italic-red', name: 'Italic Red Flash', description: 'Slants dynamically into italics with flash of crimson', category: 'fx' },
  { id: 'fx-red-duo', name: 'Red Glitch Offset', description: 'Dual-layer red and white chromatic offset', category: 'fx' },
  { id: 'fx-cream-blue', name: 'Cream to Sky Blue', description: 'Soft pastel ivory wipe transitioning to sky blue', category: 'fx' },
  { id: 'fx-serif-red', name: 'Serif Blood Accent', description: 'Dramatic serif accentuation with crimson color pulse', category: 'fx' },
  { id: 'fx-green-rise', name: 'Green Float Rise', description: 'Vertical 8px float rise with bright lime reveal', category: 'motion' },
  { id: 'fx-red-spin', name: 'Micro Rotation Spin', description: 'Punchy 3-5 degree tilt with urgent red highlight', category: 'motion' },
  { id: 'fx-violet', name: 'Violet Aura Dissolve', description: 'Deep violet gradient radial dissolve', category: 'glow' },
];

export function getFontByName(name: string): string | undefined {
  return FONTS_CATALOG.find((f) => f.toLowerCase() === name.toLowerCase());
}

export function getAllFontNames(): string[] {
  return FONTS_CATALOG;
}

export function getAnimationById(id: string): WordAnimation | undefined {
  return WORD_ANIMATIONS.find((a) => a.id === id);
}
