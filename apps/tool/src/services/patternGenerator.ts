
import * as imageq from 'image-q';
import { CellData, YarnColor } from '../types';

export interface GenerationOptions {
  maxColors: number;
  paletteMode: 'extract' | 'match';
  targetPalette?: YarnColor[];
  dithering?: boolean;
}

export interface GenerationResult {
  grid: CellData[];
  usedPalette: YarnColor[];
}

/**
 * Converts raw pixel data into a quantized pattern grid.
 */
export const generatePattern = async (
  imageData: ImageData,
  options: GenerationOptions
): Promise<GenerationResult> => {
  if (!imageData || imageData.width === 0 || imageData.height === 0) {
    throw new Error('Invalid image data for pattern generation.');
  }
  if (options.maxColors < 1) {
    throw new Error('maxColors must be at least 1.');
  }

  // 1. Prepare PointContainer from ImageData
  const pointContainer = imageq.utils.PointContainer.fromImageData(imageData);

  let finalPalette: imageq.utils.Palette;

  // 2. Determine Palette based on mode
  if (options.paletteMode === 'extract') {
    // EXTRACT MODE: Generate optimal palette from image
    const metric = new imageq.distance.Euclidean();
    // Use WuQuant for high quality extraction
    const quantizer = new imageq.palette.WuQuant(metric, options.maxColors);
    quantizer.sample(pointContainer);
    // Use synchronous quantization
    finalPalette = quantizer.quantizeSync();
  } else {
    // MATCH MODE: Use provided fixed palette
    if (!options.targetPalette || options.targetPalette.length === 0) {
      throw new Error('Target palette is required for "match" mode.');
    }

    // Convert YarnColor[] to imageq.utils.Palette
    finalPalette = new imageq.utils.Palette();
    options.targetPalette.forEach(yarn => {
      // Point.createByQuadruplet takes an array [r, g, b, a]
      finalPalette.add(imageq.utils.Point.createByQuadruplet([
        yarn.rgb[0],
        yarn.rgb[1],
        yarn.rgb[2],
        255
      ]));
    });
  }

  // 3. Image Quantization (Mapping pixels to palette)
  const distanceCalculator = new imageq.distance.Euclidean();

  let outputPointContainer: imageq.utils.PointContainer;

  if (options.dithering) {
    // Use ErrorDiffusionArray with FloydSteinberg kernel
    const imageQuantizer = new imageq.image.ErrorDiffusionArray(
      distanceCalculator,
      imageq.image.ErrorDiffusionArrayKernel.FloydSteinberg
    );
    // quantizeSync returns PointContainer
    outputPointContainer = imageQuantizer.quantizeSync(pointContainer, finalPalette);
  } else {
    // Use NearestColor
    const imageQuantizer = new imageq.image.NearestColor(distanceCalculator);
    outputPointContainer = imageQuantizer.quantizeSync(pointContainer, finalPalette);
  }

  // 4. Convert Output to CellData[]
  const pointArray = outputPointContainer.getPointArray();
  const grid: CellData[] = [];
  const usedColorIds = new Set<string>();

  // Map imageq Points back to IDs
  const paletteLookup = new Map<string, string>();

  if (options.paletteMode === 'match') {
    options.targetPalette?.forEach(yarn => {
      const key = `${yarn.rgb[0]},${yarn.rgb[1]},${yarn.rgb[2]}`;
      paletteLookup.set(key, yarn.id);
    });
  } else {
    // For 'extract', use the final palette points
    const palettePoints = finalPalette.getPointContainer().getPointArray();
    palettePoints.forEach((p, index) => {
      const r = p.r, g = p.g, b = p.b;
      const key = `${r},${g},${b}`;
      const stableId = `auto-gen-${index}`;
      paletteLookup.set(key, stableId);
    });
  }

  // Build temporary Source Palette for lookup
  let sourcePaletteEnv: YarnColor[] = [];
  if (options.paletteMode === 'match' && options.targetPalette) {
    sourcePaletteEnv = options.targetPalette;
  } else {
    // Build from extracted
    const extractedPoints = finalPalette.getPointContainer().getPointArray();
    sourcePaletteEnv = extractedPoints.map((p, index) => {
      const r = Math.round(p.r);
      const g = Math.round(p.g);
      const b = Math.round(p.b);
      const toHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      const id = `auto-gen-${index}`;
      return {
        id,
        brand: 'Generated',
        name: `Auto Color ${index + 1}`,
        hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
        rgb: [r, g, b],
      };
    });
    // Ensure lookup matches exactly
    paletteLookup.clear();
    sourcePaletteEnv.forEach(y => {
      const key = `${y.rgb[0]},${y.rgb[1]},${y.rgb[2]}`;
      paletteLookup.set(key, y.id);
    });
  }

  // Iterate pixels
  for (const point of pointArray) {
    const r = Math.round(point.r);
    const g = Math.round(point.g);
    const b = Math.round(point.b);

    let bestId: string | null = null;
    let minDiff = Number.MAX_VALUE;

    // Fast lookup
    const key = `${r},${g},${b}`;
    if (paletteLookup.has(key)) {
      bestId = paletteLookup.get(key)!;
    } else {
      // Fallback distance check
      for (const yarn of sourcePaletteEnv) {
        const dr = yarn.rgb[0] - r;
        const dg = yarn.rgb[1] - g;
        const db = yarn.rgb[2] - b;
        // Weighted distance optional, but Euclidean fine here
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDiff) {
          minDiff = dist;
          bestId = yarn.id;
        }
      }
    }

    if (bestId) {
      usedColorIds.add(bestId);
      grid.push({ colorId: bestId });
    } else {
      grid.push({ colorId: null });
    }
  }

  const usedPalette = sourcePaletteEnv.filter(y => usedColorIds.has(y.id));

  return {
    grid,
    usedPalette
  };
};
