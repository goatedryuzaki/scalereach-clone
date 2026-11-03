import React from 'react';

/**
 * ScaleReach 24 Caption Presets Catalog
 *
 * Professional Editor-Grade Subtitle Styles reverse-engineered from
 * the target application with exact creator aesthetics (Hormozi, MrBeast,
 * TikTok Native, GaryVee, Iman Gadzhi, Ali Abdaal, Vox Documentary).
 */

export interface CaptionPreset {
  id: string;
  name: string;
  fontFamily: string;
  secondaryFontFamily?: string;
  fontWeight: number;
  fontStyle?: string;
  fontSize?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  primaryColor: string;
  highlightColor: string;
  secondaryHighlightColor?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeColor?: string;
  shadow?: string;
  shadowBlur?: number;
  shadowColor?: string;
  animation?: string;
  animationType?: string;
  wordsPerLine?: number;
  highlightScale?: number;
  description?: string;
  category?: 'creator' | 'gaming' | 'cinematic' | 'clean' | 'expressive' | string;
  sampleText?: string;
  creatorStyle?: string;
  emoji?: string;
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    fontFamily: 'Poppins',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#FFFF00',
    stroke: '0.6px #000000',
    shadow: '1px 1px 2px rgba(0, 0, 0, 0.85)',
    animation: 'fade-up',
    wordsPerLine: 3,
    sampleText: 'VIRAL CLIPS FAST',
    creatorStyle: 'Ali Abdaal',
    emoji: '💡',
    category: 'creator',
    highlightScale: 1.25,
    description: 'High-contrast bold yellow highlight with crisp black border',
  },
  {
    id: 'blue-glow',
    name: 'Blue Glow',
    fontFamily: 'Inter',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: 'linear-gradient(90deg, #FFFFFF 0%, #D0D0D0 100%)',
    highlightColor: 'linear-gradient(90deg, rgb(30, 144, 255), rgb(168, 222, 255), rgb(30, 144, 255))',
    stroke: 'none',
    shadow: 'drop-shadow(0 0 18px rgb(30, 144, 255))',
    animation: 'glow-pulse',
    wordsPerLine: 3,
    sampleText: 'NEON TECH VISION',
    creatorStyle: 'Tech Minimalist',
    emoji: '⚡',
    category: 'clean',
    highlightScale: 1.15,
    description: 'Modern tech aesthetic with deep neon blue halo glow',
  },
  {
    id: 'toxic-green',
    name: 'Toxic Green',
    fontFamily: 'Anton',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#00FF41',
    highlightColor: '#39FF14',
    stroke: '0.6px #003300',
    shadow: '0 0 10px rgba(57, 255, 20, 0.6)',
    animation: 'scale-pop',
    wordsPerLine: 3,
    sampleText: 'HACKER MODE ENGAGED',
    creatorStyle: 'Gaming Pro',
    emoji: '💀',
    category: 'gaming',
    highlightScale: 1.3,
    description: 'Aggressive gaming/hacker green with pop animation',
  },
  {
    id: 'blue-sheen',
    name: 'Blue Sheen',
    fontFamily: 'Montserrat',
    fontWeight: 900,
    textTransform: 'uppercase',
    primaryColor: 'linear-gradient(90deg, rgb(92, 145, 243), rgb(185, 205, 247), rgb(77, 120, 229))',
    highlightColor: '#FFFFFF',
    stroke: 'none',
    shadow: 'drop-shadow(0 0 8px rgb(92, 124, 250))',
    animation: 'sheen-swipe',
    wordsPerLine: 3,
    sampleText: 'SMOOTH METALLIC SHEEN',
    creatorStyle: 'Iman Gadzhi',
    emoji: '💎',
    category: 'creator',
    highlightScale: 1.18,
    description: 'Metallic blue gradient sweep over bold clean typography',
  },
  {
    id: 'master-pop',
    name: 'Master Pop',
    fontFamily: 'Inter',
    fontWeight: 800,
    textTransform: 'uppercase',
    primaryColor: '#F3F4F6',
    highlightColor: 'radial-gradient(circle, rgb(106, 155, 209) 0%, rgb(241, 235, 217) 100%)',
    stroke: 'none',
    shadow: '2px 2px 0px #000000',
    animation: 'elastic-pop',
    wordsPerLine: 4,
    sampleText: 'SCALE YOUR STARTUP',
    creatorStyle: 'Devin Jatho',
    emoji: '🚀',
    category: 'clean',
    highlightScale: 1.2,
    description: 'Clean educational pop highlight style for podcasts',
  },
  {
    id: 'cyan-gloss',
    name: 'Cyan Gloss',
    fontFamily: 'Kanit',
    fontWeight: 800,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    primaryColor: 'linear-gradient(65deg, rgb(42, 255, 255), rgb(20, 146, 179))',
    highlightColor: '#FFFFFF',
    stroke: 'none',
    shadow: 'drop-shadow(0 0 15px rgba(28, 208, 255, 0.6))',
    animation: 'slide-glare',
    wordsPerLine: 4,
    sampleText: 'LIGHTNING FAST FLOW',
    creatorStyle: 'Velocity Flow',
    emoji: '🌊',
    category: 'expressive',
    highlightScale: 1.15,
    description: 'Glossy bright cyan highlight with modern sans-serif',
  },
  {
    id: 'chrome-blue',
    name: 'Chrome Blue',
    fontFamily: 'Montserrat',
    fontWeight: 900,
    textTransform: 'uppercase',
    primaryColor: 'radial-gradient(circle, rgb(255, 255, 255) 0%, rgb(196, 232, 255) 34%, rgb(43, 174, 255) 74%, rgb(0, 27, 43) 98%)',
    highlightColor: '#FFFFFF',
    stroke: '0.5px rgba(255, 255, 255, 0.7)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    animation: 'metallic-sweep',
    wordsPerLine: 4,
    sampleText: 'CHROME FINISH AUDIO',
    creatorStyle: 'Luxury Metallic',
    emoji: '🛡️',
    category: 'creator',
    highlightScale: 1.2,
    description: 'Chrome metallic finish with sharp electric blue accents',
  },
  {
    id: 'green-gloss',
    name: 'Green Gloss',
    fontFamily: 'Playfair Display',
    fontWeight: 900,
    textTransform: 'none',
    primaryColor: 'linear-gradient(115deg, rgb(159, 255, 4), rgb(83, 179, 2))',
    highlightColor: '#FFFFFF',
    stroke: '0.4px #003300',
    shadow: 'none',
    animation: 'float-glow',
    wordsPerLine: 4,
    sampleText: 'High fashion elegance',
    creatorStyle: 'High Fashion',
    emoji: '✨',
    category: 'cinematic',
    highlightScale: 1.15,
    description: 'Elegant serif typeface with bright fresh green gloss',
  },
  {
    id: 'duo-style',
    name: 'Duo Style',
    fontFamily: 'Anton',
    secondaryFontFamily: 'Playfair Display',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFD400',
    highlightColor: '#FFFFFF',
    stroke: '0.5px #000000',
    shadow: '2px 2px 4px rgba(0,0,0,0.8)',
    animation: 'staggered-bounce',
    wordsPerLine: 4,
    sampleText: 'DOUBLE TONE POWER',
    creatorStyle: 'Two-Tone Creator',
    emoji: '👑',
    category: 'creator',
    highlightScale: 1.25,
    description: 'Two-tone alternating emphasis for punchy quotes',
  },
  {
    id: 'basker',
    name: 'Basker',
    fontFamily: 'Libre Baskerville',
    fontWeight: 700,
    textTransform: 'none',
    primaryColor: '#FFFFF5',
    highlightColor: '#FFF194',
    stroke: '0.36px #000000',
    shadow: '1px 1px 2px rgba(0, 0, 0, 0.85)',
    animation: 'fade-in',
    wordsPerLine: 3,
    sampleText: 'Timeless storytelling tone',
    creatorStyle: 'Editorial Serif',
    emoji: '📜',
    category: 'cinematic',
    highlightScale: 1.2,
    description: 'Warm traditional editorial serif look',
  },
  {
    id: 'billy',
    name: 'Billy',
    fontFamily: 'Lilita One',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#DC7AFF',
    stroke: '0.6px #000000',
    shadow: '2px 3px 0px #000000',
    animation: 'cartoon-bounce',
    wordsPerLine: 1,
    sampleText: 'POW!',
    creatorStyle: 'Cartoon Bounce',
    emoji: '💥',
    category: 'expressive',
    highlightScale: 1.35,
    description: 'Single-word rapid-fire popup with bubbly font',
  },
  {
    id: 'simple',
    name: 'Simple',
    fontFamily: 'Inter',
    fontWeight: 700,
    textTransform: 'none',
    primaryColor: '#FFFFFF',
    highlightColor: '#FFFFFF',
    stroke: '0.6px #000000',
    shadow: '1px 1px 2px rgba(0, 0, 0, 0.9)',
    animation: 'instant-cut',
    wordsPerLine: 3,
    sampleText: 'Clean and straightforward',
    creatorStyle: 'Clean Minimal',
    emoji: '🎯',
    category: 'clean',
    highlightScale: 1.0,
    description: 'Minimalist clean white text with dark outline',
  },
  {
    id: 'hormozi',
    name: 'Hormozi',
    fontFamily: 'Anton',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#FFD700',
    secondaryHighlightColor: '#00FF00',
    stroke: '0.7px #000000',
    shadow: '2px 2px 0px #000000',
    animation: 'punch',
    wordsPerLine: 3,
    sampleText: 'MAKE OFFERS TOO GOOD',
    creatorStyle: 'Alex Hormozi',
    emoji: '💰',
    category: 'creator',
    highlightScale: 1.28,
    description: 'Alex Hormozi signature style: ultra-punchy gold caps',
  },
  {
    id: 'mrbeast-pro',
    name: 'MrBeast Pro',
    fontFamily: 'Bangers',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#00FF00',
    stroke: '0.8px #000000',
    shadow: '3px 3px 0px #000000',
    animation: 'zoom-pop-tilt',
    wordsPerLine: 3,
    sampleText: 'SURVIVE 100 DAYS',
    creatorStyle: 'MrBeast Pro',
    emoji: '🔥',
    category: 'creator',
    highlightScale: 1.35,
    description: 'Comic/hyper-energy font with explosive green popup',
  },
  {
    id: 'garyvee',
    name: 'GaryVee',
    fontFamily: 'Bebas Neue',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#FF0000',
    stroke: '0.6px #000000',
    shadow: '2px 2px 0px #000000',
    animation: 'rapid-fire',
    wordsPerLine: 3,
    sampleText: 'STOP TALKING DO WORK',
    creatorStyle: 'GaryVee',
    emoji: '🗣️',
    category: 'creator',
    highlightScale: 1.25,
    description: 'Tall condensed bold lettering with urgent red highlight',
  },
  {
    id: 'tiktok-native',
    name: 'TikTok Native',
    fontFamily: 'Poppins',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#FE2C55',
    stroke: '0.5px #000000',
    shadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
    animation: 'smooth-opacity',
    wordsPerLine: 3,
    sampleText: 'WAIT UNTIL THE END',
    creatorStyle: 'TikTok Native',
    emoji: '📱',
    category: 'creator',
    highlightScale: 1.25,
    description: 'Exact native TikTok subtitle pink and white color scheme',
  },
  {
    id: 'neon-pop',
    name: 'Neon Pop',
    fontFamily: 'Permanent Marker',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#00FFFF',
    highlightColor: '#FF00FF',
    stroke: '0.6px #000000',
    shadow: '0 0 10px #00FFFF, 0 0 20px #FF00FF',
    animation: 'neon-flicker',
    wordsPerLine: 3,
    sampleText: 'NEON MIDNIGHT GLOW',
    creatorStyle: 'Graffiti Neon',
    emoji: '🎨',
    category: 'expressive',
    highlightScale: 1.25,
    description: 'Handwritten graffiti marker with neon cyan & magenta',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    fontFamily: 'Montserrat',
    fontWeight: 600,
    textTransform: 'none',
    primaryColor: '#F0E6D3',
    highlightColor: '#FFFFFF',
    stroke: '0.3px #000000',
    shadow: '1px 2px 4px rgba(0,0,0,0.6)',
    animation: 'crossfade',
    wordsPerLine: 5,
    sampleText: 'In the heart of the storm',
    creatorStyle: 'Vox Documentary',
    emoji: '🎬',
    category: 'cinematic',
    highlightScale: 1.1,
    description: 'Subdued warm off-white widescreen film subtitle',
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    fontFamily: 'Russo One',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#00FFFF',
    stroke: '0.6px rgb(0, 17, 51)',
    shadow: 'drop-shadow(0 0 8px #00FFFF)',
    animation: 'electric-spark',
    wordsPerLine: 3,
    sampleText: 'MAXIMUM VOLTAGE SURGE',
    creatorStyle: 'Cyberpunk Stream',
    emoji: '⚡',
    category: 'gaming',
    highlightScale: 1.3,
    description: 'Futuristic block font with heavy dark-navy outline',
  },
  {
    id: 'sunset-fire',
    name: 'Sunset Fire',
    fontFamily: 'Bangers',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FF6B35',
    highlightColor: '#FFE500',
    stroke: '0.6px rgb(139, 0, 0)',
    shadow: '2px 2px 4px rgba(139, 0, 0, 0.9)',
    animation: 'heatwave-ripple',
    wordsPerLine: 3,
    sampleText: 'BLAZING SUNSET HEAT',
    creatorStyle: 'Heatwave Creator',
    emoji: '🌋',
    category: 'expressive',
    highlightScale: 1.25,
    description: 'Warm gradient orange and yellow with deep crimson outline',
  },
  {
    id: 'ice-cold',
    name: 'Ice Cold',
    fontFamily: 'Black Ops One',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#B8E8FF',
    highlightColor: '#FFFFFF',
    stroke: '0.48px rgb(44, 95, 124)',
    shadow: '0 0 8px rgba(184, 232, 255, 0.8)',
    animation: 'shiver',
    wordsPerLine: 3,
    sampleText: 'FREEZING COLD ZERO',
    creatorStyle: 'Arctic Stencil',
    emoji: '❄️',
    category: 'gaming',
    highlightScale: 1.2,
    description: 'Stencil military arctic frost aesthetic',
  },
  {
    id: 'coral-pop',
    name: 'Coral Pop',
    fontFamily: 'Lilita One',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#FFFFFF',
    highlightColor: '#FF6B6B',
    stroke: '0.6px rgb(139, 0, 0)',
    shadow: '2px 2px 0px #8B0000',
    animation: 'elastic-hop',
    wordsPerLine: 3,
    sampleText: 'BOUNCY CORAL CRUSH',
    creatorStyle: 'Candy Pop',
    emoji: '🍭',
    category: 'expressive',
    highlightScale: 1.3,
    description: 'Playful rounded font with vibrant coral accent',
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    fontFamily: 'Oswald',
    fontWeight: 700,
    textTransform: 'uppercase',
    primaryColor: '#E8D5FF',
    highlightColor: '#BF40FF',
    stroke: '0.6px rgb(45, 10, 78)',
    shadow: '0 0 10px rgba(191, 64, 255, 0.7)',
    animation: 'purple-aura',
    wordsPerLine: 3,
    sampleText: 'DEEP VIOLET AURA',
    creatorStyle: 'Moody Night',
    emoji: '🔮',
    category: 'cinematic',
    highlightScale: 1.25,
    description: 'Gothic moody condensed font with glowing purple accent',
  },
  {
    id: 'georgia-elegance',
    name: 'Georgia Elegance',
    fontFamily: 'Gelasio',
    fontWeight: 700,
    textTransform: 'none',
    primaryColor: '#FFFFFF',
    highlightColor: '#D4AF37',
    stroke: '0.36px #000000',
    shadow: '1px 1px 3px rgba(0,0,0,0.7)',
    animation: 'literary-slide',
    wordsPerLine: 5,
    sampleText: 'Pure literary eloquence',
    creatorStyle: 'Classic Storyteller',
    emoji: '🖋️',
    category: 'cinematic',
    highlightScale: 1.0,
    description: 'Luxurious classic serif with warm metallic gold tint',
  },
];

export function getPresetById(id: string): CaptionPreset {
  return CAPTION_PRESETS.find(p => p.id === id) || CAPTION_PRESETS[0];
}

export function getDefaultPreset(): CaptionPreset {
  return CAPTION_PRESETS[0];
}

export function getPresetsByCategory(category: string): CaptionPreset[] {
  if (category === 'all') return CAPTION_PRESETS;
  return CAPTION_PRESETS.filter(p => p.category === category);
}

/**
 * Returns React inline CSS style for live preset rendering and preview cards
 */
export function getPresetCssStyle(preset: CaptionPreset, isHighlight: boolean = false): React.CSSProperties {
  const color = isHighlight ? preset.highlightColor : preset.primaryColor;
  const isGradient = color.includes('gradient');

  const baseStyle: React.CSSProperties = {
    fontFamily: `var(--font-${preset.fontFamily.toLowerCase().replace(/\s+/g, '-')}), '${preset.fontFamily}', sans-serif`,
    fontWeight: preset.fontWeight,
    fontStyle: preset.fontStyle as any,
    textTransform: preset.textTransform || 'uppercase',
    letterSpacing: '0.02em',
    paintOrder: 'stroke fill',
  };

  if (isGradient) {
    baseStyle.backgroundImage = color;
    baseStyle.WebkitBackgroundClip = 'text';
    baseStyle.WebkitTextFillColor = 'transparent';
    baseStyle.color = 'transparent';
  } else {
    baseStyle.color = color;
  }

  if (preset.stroke && preset.stroke !== 'none') {
    (baseStyle as any).WebkitTextStroke = preset.stroke;
  }

  if (preset.shadow && preset.shadow.startsWith('drop-shadow')) {
    baseStyle.filter = preset.shadow;
  } else if (preset.shadow && preset.shadow !== 'none') {
    baseStyle.textShadow = preset.shadow;
  }

  if (isHighlight) {
    baseStyle.transform = preset.highlightScale ? `scale(${preset.highlightScale})` : 'scale(1.15)';
    baseStyle.display = 'inline-block';
  }

  return baseStyle;
}
