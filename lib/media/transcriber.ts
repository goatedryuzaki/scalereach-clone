import { CaptionWord } from '../db';
import { CaptionPreset } from '../presets-catalog';

export interface TimedPhrase {
  id: string;
  text: string;
  words: CaptionWord[];
  start: number;
  end: number;
  duration: number;
}

export interface SubtitleExportOptions {
  wordsPerLine?: number;
  includeStyles?: boolean;
}

/**
 * Attaches contextual editor-grade emojis to high-energy words (Directive 3)
 */
export function attachContextualEmoji(word: string): string {
  const lower = word.toLowerCase().replace(/[^a-z0-9$]/g, '');
  if (/^(viral|fire|hot|burn|flame|insane)$/.test(lower)) return `${word} 🔥`;
  if (/^(fast|fastest|rocket|launch|scale|growth|boost)$/.test(lower)) return `${word} 🚀`;
  if (/^(money|cash|dollar|\$|pricing|revenue|profit|100000|million)$/.test(lower)) return `${word} 💰`;
  if (/^(shocking|crazy|mindblown|unbelievable|impossible)$/.test(lower)) return `${word} 🤯`;
  if (/^(dead|fail|failed|mistake|worst|stop|wrong)$/.test(lower)) return `${word} 💀`;
  return word;
}

/**
 * Continuous word timing clamping oracle
 * Prevents subtitle flicker and overlapping word display
 * segment[i].endTime = Math.min(segment[i].endTime, segment[i+1].startTime)
 */
export function clampSubtitleTimings(words: CaptionWord[]): CaptionWord[] {
  if (!Array.isArray(words)) return [];
  const clamped = words.map(w => ({ ...w }));

  for (let i = 0; i < clamped.length; i++) {
    // If end is before or equal to start, assign minimum 50ms duration
    if (clamped[i].end <= clamped[i].start) {
      clamped[i].end = Number((clamped[i].start + 0.05).toFixed(3));
    }

    if (i < clamped.length - 1) {
      if (clamped[i].end > clamped[i + 1].start) {
        clamped[i].end = clamped[i + 1].start;
      }
    }
  }

  return clamped;
}

/**
 * Chunks continuous words into phrase lines based on wordsPerLine or punctuation
 */
export function chunkWordsIntoPhrases(words: CaptionWord[], wordsPerLine = 3): TimedPhrase[] {
  const chunks: TimedPhrase[] = [];
  let currentChunk: CaptionWord[] = [];

  for (const word of words) {
    currentChunk.push(word);
    const hasPunctuation = /[.!?]$/.test(word.word.trim());
    const reachedLength = currentChunk.length >= wordsPerLine;

    if (hasPunctuation || reachedLength) {
      const startTime = currentChunk[0].start;
      const endTime = currentChunk[currentChunk.length - 1].end;
      chunks.push({
        id: `chunk-${chunks.length}`,
        text: currentChunk.map(w => w.word).join(' '),
        words: currentChunk,
        start: startTime,
        end: endTime,
        duration: Number((endTime - startTime).toFixed(3)),
      });
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    const startTime = currentChunk[0].start;
    const endTime = currentChunk[currentChunk.length - 1].end;
    chunks.push({
      id: `chunk-${chunks.length}`,
      text: currentChunk.map(w => w.word).join(' '),
      words: currentChunk,
      start: startTime,
      end: endTime,
      duration: Number((endTime - startTime).toFixed(3)),
    });
  }

  return chunks;
}

/**
 * Escapes ASS meta characters and strips malicious HTML/XSS tags
 */
export function escapeAssText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\r?\n/g, '\\N')
    .replace(/<[^>]*>/g, ''); // strip html tags
}

/**
 * Converts Hex (#RRGGBB) to BGR ASS color string &H[AA][BB][GG][RR]&
 */
export function hexToAssColor(hex: string, alpha = 0): string {
  let clean = hex.replace('#', '');
  if (clean.startsWith('rgb')) {
    // Basic fallback if RGB string is provided
    return '&H00FFFFFF&';
  }
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map(c => c + c)
      .join('');
  }
  if (clean.length < 6) {
    clean = clean.padEnd(6, 'F');
  }
  const r = clean.substring(0, 2);
  const g = clean.substring(2, 4);
  const b = clean.substring(4, 6);
  const a = alpha.toString(16).padStart(2, '0').toUpperCase();
  return `&H${a}${b.toUpperCase()}${g.toUpperCase()}${r.toUpperCase()}&`;
}

function formatAssTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

function formatSrtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatVttTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

/**
 * Generates SubStation Alpha (.ass) format with editor-grade heavy outlines and karaoke tags
 */
export function generateAssSubtitles(
  clipId: string,
  preset: Partial<CaptionPreset> & {
    fontFamily?: string;
    primaryColor?: string;
    highlightColor?: string;
    fontSize?: number;
    strokeWidth?: number;
  },
  phrases: TimedPhrase[]
): string {
  const fontFamily = preset.fontFamily || 'Poppins';
  const fontSize = preset.fontSize ? Math.round(preset.fontSize * 1.3) : 58;
  const outline = preset.strokeWidth || 5;
  const shadow = 3;

  const primaryAssColor = hexToAssColor(
    preset.primaryColor && preset.primaryColor.startsWith('#') ? preset.primaryColor : '#FFFFFF'
  );
  const highlightAssColor = hexToAssColor(
    preset.highlightColor && preset.highlightColor.startsWith('#') ? preset.highlightColor : '#FFD700'
  );

  let doc = `[Script Info]
Title: ScaleReach - ${clipId}
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontFamily},${fontSize},${primaryAssColor},${highlightAssColor},&H00000000&,&H80000000&,-1,0,0,0,100,100,0,0,1,${outline},${shadow},2,40,40,240,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  for (const phrase of phrases) {
    const startStr = formatAssTime(phrase.start);
    const endStr = formatAssTime(phrase.end);
    let lineText = '';

    for (const w of phrase.words) {
      const cleanWord = escapeAssText(w.word);
      const durationCs = Math.max(5, Math.round((w.end - w.start) * 100));

      if (w.isHighlighted) {
        lineText += `{\\c${highlightAssColor}}${cleanWord}{\\c${primaryAssColor}} `;
      } else {
        lineText += `${cleanWord} `;
      }
    }
    doc += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${lineText.trim()}\n`;
  }

  return doc;
}

/**
 * Generates standard SubRip (.srt) subtitles
 */
export function generateSrtSubtitles(phrases: TimedPhrase[]): string {
  return phrases
    .map((p, index) => {
      const start = formatSrtTime(p.start);
      const end = formatSrtTime(p.end);
      const cleanText = p.text.replace(/<[^>]*>/g, '').trim();
      return `${index + 1}\n${start} --> ${end}\n${cleanText}\n`;
    })
    .join('\n');
}

/**
 * Generates WebVTT (.vtt) subtitles
 */
export function generateVttSubtitles(phrases: TimedPhrase[]): string {
  const cues = phrases
    .map(p => {
      const start = formatVttTime(p.start);
      const end = formatVttTime(p.end);
      const cleanText = p.text.replace(/<[^>]*>/g, '').trim();
      return `${start} --> ${end}\n${cleanText}`;
    })
    .join('\n\n');

  return `WEBVTT\n\n${cues}\n`;
}

/**
 * Generates high-precision word JSON with millisecond and second timestamps
 */
export function generateWordJson(words: CaptionWord[]) {
  return words.map(w => ({
    id: w.id,
    word: w.word,
    start: w.start,
    end: w.end,
    startMs: Math.round(w.start * 1000),
    endMs: Math.round(w.end * 1000),
    durationMs: Math.round((w.end - w.start) * 1000),
    isHighlighted: !!w.isHighlighted,
    color: w.color,
  }));
}
