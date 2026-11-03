/**
 * ScaleReach 9:16 Video Re-Framing & Layout Compositor
 * Normalized coordinates (ne, nt, nr, nn, na, ni) and FFmpeg filtergraph generation
 */

export const PANEL_COORDINATES = {
  ne: [0, 0, 1, 1], // Full Screen / Single Speaker / Center Crop
  nt: [0, 0, 1, 0.5], // Top Half Panel (Dual Split Top, Triple Top)
  nr: [0, 0.5, 1, 0.5], // Bottom Half Panel (Dual Split Bottom)
  nn: [0, 0.5, 0.5, 0.5], // Bottom-Left Quarter (Triple Bottom-Left)
  na: [0.5, 0.5, 0.5, 0.5], // Bottom-Right Quarter (Triple Bottom-Right)
  ni: [
    // Quad 2x2 Grid (4 Speakers)
    [0, 0, 0.5, 0.5], // Top-Left
    [0.5, 0, 0.5, 0.5], // Top-Right
    [0, 0.5, 0.5, 0.5], // Bottom-Left
    [0.5, 0.5, 0.5, 0.5], // Bottom-Right
  ],
};

export interface VideoDimensions {
  width: number;
  height: number;
}

export interface SingleSpeakerGeometry {
  canvas: { width: number; height: number };
  crop: { x: number; y: number; width: number; height: number };
  scale: { width: number; height: number };
}

export interface SplitScreenGeometry {
  canvas: { width: number; height: number };
  topPane: { x: number; y: number; width: number; height: number };
  bottomPane: { x: number; y: number; width: number; height: number };
  divider: { y: number; height: number; color: string };
}

export interface BlurFillGeometry {
  canvas: { width: number; height: number };
  foreground: { x: number; y: number; width: number; height: number };
  backgroundBlur: { blurRadius: number; width: number; height: number };
}

export type LayoutGeometryResult = SingleSpeakerGeometry | SplitScreenGeometry | BlurFillGeometry;

/**
 * Calculates deterministic layout coordinates for 1080x1920 9:16 viewports
 */
export function calculateLayoutGeometry(
  mode: 'single_speaker' | 'split_screen' | 'blur_fill',
  source: VideoDimensions = { width: 1920, height: 1080 },
  options: { faceX?: number; dividerRatio?: number } = {}
): LayoutGeometryResult {
  const canvasWidth = 1080;
  const canvasHeight = 1920;

  if (mode === 'single_speaker') {
    // 9:16 crop from 16:9 source (1920x1080)
    // crop width at height 1080 is 1080 * 9 / 16 = 607.5px (rounded to 608)
    const cropHeight = source.height;
    const cropWidth = Math.round(cropHeight * (9 / 16));
    const faceX = options.faceX !== undefined ? options.faceX : source.width / 2;

    // Centroid clamping
    const minX = 0;
    const maxX = source.width - cropWidth;
    const cropX = Math.max(minX, Math.min(maxX, Math.round(faceX - cropWidth / 2)));

    return {
      canvas: { width: canvasWidth, height: canvasHeight },
      crop: { x: cropX, y: 0, width: cropWidth, height: cropHeight },
      scale: { width: canvasWidth, height: canvasHeight },
    };
  }

  if (mode === 'split_screen') {
    const dividerRatio =
      options.dividerRatio !== undefined ? Math.max(0.2, Math.min(0.8, options.dividerRatio)) : 0.5;
    const topHeight = Math.round(canvasHeight * dividerRatio);
    const bottomHeight = canvasHeight - topHeight;
    const dividerWidth = 2; // 2px accent line

    return {
      canvas: { width: canvasWidth, height: canvasHeight },
      topPane: { x: 0, y: 0, width: canvasWidth, height: topHeight },
      bottomPane: { x: 0, y: topHeight, width: canvasWidth, height: bottomHeight },
      divider: { y: topHeight, height: dividerWidth, color: '#6366F1' },
    };
  }

  if (mode === 'blur_fill') {
    // Original 16:9 centered in 9:16, background blurred by 25px
    const scaledHeight = Math.round(canvasWidth * (source.height / source.width));
    const offsetY = Math.round((canvasHeight - scaledHeight) / 2);

    return {
      canvas: { width: canvasWidth, height: canvasHeight },
      foreground: { x: 0, y: offsetY, width: canvasWidth, height: scaledHeight },
      backgroundBlur: { blurRadius: 25, width: canvasWidth, height: canvasHeight },
    };
  }

  throw new Error(`Unknown layout mode: ${mode}`);
}

/**
 * Builds FFmpeg complex filtergraph for target layout
 */
export function buildLayoutFiltergraph(
  mode: 'single_speaker' | 'split_screen' | 'blur_fill' | 'single' | 'split',
  source: VideoDimensions = { width: 1920, height: 1080 },
  options: {
    faceX?: number;
    dividerRatio?: number;
    hasBRoll?: boolean;
    subtitleAssPath?: string;
  } = {}
): string {
  const normMode = mode === 'single' ? 'single_speaker' : mode === 'split' ? 'split_screen' : mode;
  const geom = calculateLayoutGeometry(normMode as any, source, options);

  let filter = '';

  if (normMode === 'blur_fill') {
    filter =
      '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=25:steps=2,eq=brightness=-0.1[bg];' +
      '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];' +
      '[bg][fg]overlay=(W-w)/2:(H-h)/2[v]';
  } else if (normMode === 'single_speaker') {
    const s = geom as SingleSpeakerGeometry;
    filter = `[0:v]crop=w=${s.crop.width}:h=${s.crop.height}:x=${s.crop.x}:y=${s.crop.y},scale=1080:1920[v]`;
  } else if (normMode === 'split_screen') {
    const sp = geom as SplitScreenGeometry;
    if (options.hasBRoll) {
      filter =
        `[0:v]scale=1080:${sp.topPane.height}:force_original_aspect_ratio=increase,crop=1080:${sp.topPane.height}[top];` +
        `[1:v]scale=1080:${sp.bottomPane.height}:force_original_aspect_ratio=increase,crop=1080:${sp.bottomPane.height}[bottom];` +
        `[top][bottom]vstack[v]`;
    } else {
      filter =
        `[0:v]crop=w=1920:h=540:x=0:y=0,scale=1080:${sp.topPane.height}[top];` +
        `[0:v]crop=w=1920:h=540:x=0:y=540,scale=1080:${sp.bottomPane.height}[bottom];` +
        `[top][bottom]vstack[v]`;
    }
  }

  if (options.subtitleAssPath) {
    const escapedAss = options.subtitleAssPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    filter = filter ? `${filter};[v]ass=${escapedAss}[vout]` : `ass=${escapedAss}`;
  }

  return filter;
}
