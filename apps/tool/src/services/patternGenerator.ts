
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
  const width = imageData.width;
  const height = imageData.height;

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
    finalPalette = quantizer.quantize();
  } else {
    // MATCH MODE: Use provided fixed palette
    if (!options.targetPalette || options.targetPalette.length === 0) {
      throw new Error('Target palette is required for "match" mode.');
    }

    // Convert YarnColor[] to imageq.utils.Palette
    const palettePoints = options.targetPalette.map(yarn => {
      // YarnColor RGB is [r, g, b], image-q Point is usually r, g, b, a
      // We assume full opacity
      return imageq.utils.Point.createByQuadruplet(
        yarn.rgb[0],
        yarn.rgb[1],
        yarn.rgb[2],
        255
      );
    });
    finalPalette = new imageq.utils.Palette();
    // We can't directly assign points, need to add them
    palettePoints.forEach(p => finalPalette.add(p));
  }

  // 3. Image Quantization (Mapping pixels to palette)
  const distanceCalculator = new imageq.distance.Euclidean(); // Standard color distance
  const imageQuantizer = options.dithering
    ? new imageq.image.FloydSteinberg(distanceCalculator, finalPalette.size()) // Dithered
    : new imageq.image.NearestColor(distanceCalculator); // Flat mapping

  const outputPointContainer = await imageQuantizer.quantize(pointContainer, finalPalette);

  // 4. Convert Output to CellData[]
  // The outputPointContainer has the same dimensions as the input
  const pointArray = outputPointContainer.getPointArray();
  const grid: CellData[] = [];
  const usedColorIds = new Set<string>();

  // Map imageq Points back to YarnColors or Generated Colors
  // This step is tricky because image-q returns Points, not original references.
  // We need to match the resulting points back to our internal IDs.

  // Create a fast lookup for the palette points
  const paletteLookup = new Map<string, string>(); // "r,g,b" -> yarnId

  if (options.paletteMode === 'match') {
    // Pre-fill lookup from known target palette
    options.targetPalette?.forEach(yarn => {
      const key = `${yarn.rgb[0]},${yarn.rgb[1]},${yarn.rgb[2]}`;
      // In case of duplicates in palette, first one wins? Or we rely on exact match.
      paletteLookup.set(key, yarn.id);
    });
  } else {
    // For 'extract', we need to create NEW temporary yarn definitions for the result
    // The palette returned by 'wuquant' (finalPalette) contains the colors we used.
    // We should assign them IDs.
    const palettePoints = finalPalette.getPointContainer().getPointArray();
    palettePoints.forEach((p, index) => {
      const r = p.r, g = p.g, b = p.b;
      const key = `${r},${g},${b}`;
      const autoId = `auto-${Date.now()}-${index}`; // Temporary ID, though risk of collision if called fast?
      // Better to rely on index if we can contextually bind it, but unique string is safer.
      // Let's use simplified ID for stability in this session
      const stableId = `auto-gen-${index}`; 
      paletteLookup.set(key, stableId);
    });
  }

  // Helper to get ID for a point
  const getYarnId = (r: number, g: number, b: number): string => {
    const key = `${r},${g},${b}`;
    let id = paletteLookup.get(key);
    
    // If not found (floating point issues?), find closest in our known palette
    if (!id) {
       // Fallback: Find closest in finalPalette
       // This shouldn't happen often if we just quantized TO this palette, 
       // but image-q might shift values slightly?
       // Actually image-q returns points EXACTLY from the palette.
       // EXCEPT if we constructed the palette manually, we need to be careful with types.
       // Let's trust exact match first.
       
       // Note for 'match' mode: The output points ARE the palette points.
       // Note for 'extract' mode: The output points ARE the extracted palette points.
       
       // Handle "close enough" if strict match fails (shouldn't if data flow is correct)
       // For now, return a placeholder or error if critical.
       // Relaxed approach: iterate keys
       console.warn(`Color lookup failed for ${key}, falling back to closest.`);
       id = 'unknown-color'; 
    }
    return id;
  };

  // Re-build "Used Palette" for return
  // If 'extract', we need to construct YarnColor objects.
  // If 'match', we just return the subset of targetPalette that was actually used.
  
  const tempUsedPaletteMap = new Map<string, YarnColor>();

  // Construct "Known Palette" list (Source of Truth)
  // For 'match', it is options.targetPalette
  // For 'extract', we build it from finalPalette points
  let sourcePaletteEnv: YarnColor[] = [];
  
  if (options.paletteMode === 'match' && options.targetPalette) {
    sourcePaletteEnv = options.targetPalette;
  } else {
    // Build fake yarn colors from the extracted palette
    const extractedPoints = finalPalette.getPointContainer().getPointArray();
    sourcePaletteEnv = extractedPoints.map((p, index) => {
       const r = Math.round(p.r);
       const g = Math.round(p.g);
       const b = Math.round(p.b);
       // Use hex helper or simple conversion
       const toHex = (c: number) => {
          const hex = c.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
       };
       return {
         id: `auto-gen-${index}`,
         brand: 'Generated',
         name: `Auto Color ${index + 1}`,
         hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
         rgb: [r, g, b],
         // defaults
       };
    });
    
    // Update lookup for these new generated colors immediately to ensure exact matching
    paletteLookup.clear();
    sourcePaletteEnv.forEach(y => {
       const key = `${y.rgb[0]},${y.rgb[1]},${y.rgb[2]}`;
       paletteLookup.set(key, y.id);
    });
  }

  // Iterate pixels
  for (const point of pointArray) {
    // image-q output points are rgba
    const r = Math.round(point.r);
    const g = Math.round(point.g);
    const b = Math.round(point.b);
    
    // We need to find which ID this corresponds to
    // In 'match' mode, we have to find the closest color in the target palette AGAIN? 
    // No, image-q did the work. The point SHOULD match one in the palette.
    
    // Optimization: The 'outputPointContainer' from image-q simply holds the mapped colors.
    // We need to efficiently map these [r,g,b] values back to the `id` of the color in `sourcePaletteEnv`.
    // Since we might have slight shifts or just need robust lookup:
    
    let bestId: string | null = null;
    let minDiff = Number.MAX_VALUE;
    
    // Try exact text match first (fast)
    const key = `${r},${g},${b}`;
    if (paletteLookup.has(key)) {
        bestId = paletteLookup.get(key)!;
    } else {
        // Fallback: Euclidian distance to find the color it 'snapped' to
        // This handles cases where image-q might return a slightly different object reference or value
        for (const yarn of sourcePaletteEnv) {
            const dr = yarn.rgb[0] - r;
            const dg = yarn.rgb[1] - g;
            const db = yarn.rgb[2] - b;
            const dist = dr*dr + dg*dg + db*db;
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
        // Should not happen
        grid.push({ colorId: null });
    }
  }

  // Final Used Palette
  const usedPalette = sourcePaletteEnv.filter(y => usedColorIds.has(y.id));

  return {
    grid,
    usedPalette
  };
};
