
import { AnyProject, PatternType, PixelGridData, PatternColor, CellData } from '../types';
import { YARN_PALETTE } from '../constants';
import { LIBRARY_COLORS } from '../data/yarnLibrary';
import { logger } from './logger';
import { notify } from './notification';
import { generatePattern } from './patternGenerator';

const PROJECTS_KEY = 'blanketsmith_projects';

// Helper to migrate legacy string[] grids to CellData[] grids
const migrateProjectData = (project: AnyProject): AnyProject => {
  // ... (no change to migrateProjectData)
  if (project.type === 'pixel' && project.data && 'grid' in project.data) {
    const pData = project.data as any;
    if (pData.grid.length > 0 && (typeof pData.grid[0] === 'string' || pData.grid[0] === null) && !pData.grid[0]?.colorId) {
      pData.grid = pData.grid.map((colorId: string | null) => ({ colorId, iconId: undefined }));
    }
  }
  return project;
};

export const getProjects = (): AnyProject[] => {
  // ... (no change)
  try {
    const projectsJson = localStorage.getItem(PROJECTS_KEY);
    const projects = projectsJson ? JSON.parse(projectsJson) : [];
    return projects.map(migrateProjectData);
  } catch (error) {
    logger.error('Failed to load projects from localStorage', { error });
    notify.error('Failed to load projects. Please check your browser storage settings.');
    return [];
  }
};

export const saveProject = (project: AnyProject): void => {
  // ... (no change)
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  project.updatedAt = new Date().toISOString();
  if (existingIndex > -1) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    logger.debug('Project saved successfully', { projectId: project.id });
  } catch (error) {
    logger.error('Failed to save project to localStorage', { error, projectId: project.id });
    notify.error('Failed to save project. Ensure you have disk space available.');
  }
};

export const deleteProject = (projectId: string): void => {
  // ... (no change)
  let projects = getProjects();
  projects = projects.filter(p => p.id !== projectId);
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    logger.info('Project deleted', { projectId });
  } catch (error) {
    logger.error('Failed to delete project from localStorage', { error, projectId });
    notify.error('Failed to delete project.');
  }
};

export const createNewProject = (
  type: PatternType,
  name: string,
  width: number,
  height: number
): AnyProject => {
  const now = new Date().toISOString();

  // GEN-002: Default to BlanketSmith Essentials
  const defaultPalette = LIBRARY_COLORS
    .filter(c => c.brandId === 'brand_bs_essentials')
    .map(c => ({
      id: c.id,
      brand: 'BlanketSmith Essentials', // Flatten name for pattern usage
      name: c.name,
      hex: c.hex,
      rgb: undefined, // Let valid color derive this if needed or keep undefined
      skeinLength: 295
    } as PatternColor));

  const projectBase = {
    id: `proj-${Date.now()}`,
    name,
    type,
    createdAt: now,
    updatedAt: now,
    settings: {},
    yarnPalette: defaultPalette,
  };

  switch (type) {
    case 'pixel':
      return {
        ...projectBase,
        type: 'pixel',
        data: {
          width,
          height,
          // Initialize with CellData objects
          grid: Array.from({ length: width * height }, () => ({ colorId: null })),
          palette: [],
        }
      };
    // TODO: Add cases for other project types
    default:
      // Default to pixel for now
      return {
        ...projectBase,
        type: 'pixel',
        data: {
          width: 50,
          height: 50,
          grid: Array.from({ length: 2500 }, () => ({ colorId: null })),
          palette: [],
        }
      };
  }
};


// Color utilities
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

export const findClosestYarnColor = (rgb: [number, number, number], yarnPalette: PatternColor[]): PatternColor => {
  let closestColor = yarnPalette[0];
  let minDistance = Infinity;

  for (const yarn of yarnPalette) {
    const distance = colorDistance(rgb, yarn.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = yarn;
    }
  }
  return closestColor;
};

// --- NEW HYBRID IMAGE PROCESSING ---
// --- NEW HYBRID IMAGE PROCESSING ---
export const processImageToGrid = async (
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number,
  options: import('./patternGenerator').GenerationOptions
): Promise<{ gridPart: Partial<PixelGridData>, newColors: PatternColor[] }> => {
  try {
    // 1. Downsample (Average into new Uint8ClampedArray)
    const dsWidth = gridWidth;
    const dsHeight = gridHeight;
    const dsBuffer = new Uint8ClampedArray(dsWidth * dsHeight * 4);

    const cellWidth = imageData.width / gridWidth;
    const cellHeight = imageData.height / gridHeight;

    for (let y = 0; y < dsHeight; y++) {
      for (let x = 0; x < dsWidth; x++) {
        const startX = Math.floor(x * cellWidth);
        const startY = Math.floor(y * cellHeight);
        const endX = Math.min(imageData.width, Math.floor((x + 1) * cellWidth));
        const endY = Math.min(imageData.height, Math.floor((y + 1) * cellHeight));

        let r_sum = 0, g_sum = 0, b_sum = 0, count = 0;
        for (let iy = startY; iy < endY; iy++) {
          for (let ix = startX; ix < endX; ix++) {
            const idx = (iy * imageData.width + ix) * 4;
            r_sum += imageData.data[idx];
            g_sum += imageData.data[idx + 1];
            b_sum += imageData.data[idx + 2];
            count++;
          }
        }

        const destIdx = (y * dsWidth + x) * 4;
        if (count > 0) {
          dsBuffer[destIdx] = Math.round(r_sum / count);
          dsBuffer[destIdx + 1] = Math.round(g_sum / count);
          dsBuffer[destIdx + 2] = Math.round(b_sum / count);
          dsBuffer[destIdx + 3] = 255;
        } else {
          // Transparent/Empty
          dsBuffer[destIdx + 3] = 0;
        }
      }
    }

    const downsampledImage = new ImageData(dsBuffer, dsWidth, dsHeight);

    // 2. Generate Pattern
    const { grid, usedPalette } = await generatePattern(downsampledImage, options);

    // 3. Handle Result based on Mode
    let finalGrid: CellData[] = grid;
    let newColors: PatternColor[] = [];
    let finalPaletteIds: string[] = [];

    if (options.paletteMode === 'extract') {
      // EXTRACT MODE: The generator created new PatternColor objects.
      newColors = usedPalette as PatternColor[];
      finalPaletteIds = usedPalette.map((y: any) => y.id);
    } else {
      // MATCH MODE: The generator used the targetPalette (existing yarns OR external brand).
      // We MUST return these as "newColors" so the UI can decide if they need to be added to the project.
      newColors = usedPalette as PatternColor[];
      finalPaletteIds = usedPalette.map((y: any) => y.id);
    }

    return {
      gridPart: {
        width: gridWidth,
        height: gridHeight,
        grid: finalGrid,
        palette: finalPaletteIds
      },
      newColors
    };

  } catch (error) {
    logger.error('processImageToGrid failed', { error });
    // Return empty result to stop spinner
    return {
      gridPart: {
        width: gridWidth,
        height: gridHeight,
        grid: Array(gridWidth * gridHeight).fill({ colorId: null }),
        palette: []
      },
      newColors: []
    };
  }
};
