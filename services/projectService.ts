
import { AnyProject, PatternType, PixelGridData, YarnColor } from '../types';
import { YARN_PALETTE } from '../constants';

const PROJECTS_KEY = 'blanketsmith_projects';

export const getProjects = (): AnyProject[] => {
  try {
    const projectsJson = localStorage.getItem(PROJECTS_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  } catch (error) {
    console.error('Failed to load projects from localStorage', error);
    return [];
  }
};

export const saveProject = (project: AnyProject): void => {
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
  } catch (error) {
    console.error('Failed to save project to localStorage', error);
  }
};

export const deleteProject = (projectId: string): void => {
  let projects = getProjects();
  projects = projects.filter(p => p.id !== projectId);
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to delete project from localStorage', error);
  }
};

export const createNewProject = (
  type: PatternType, 
  name: string,
  width: number,
  height: number
): AnyProject => {
  const now = new Date().toISOString();
  const projectBase = {
    id: `proj-${Date.now()}`,
    name,
    type,
    createdAt: now,
    updatedAt: now,
    settings: {},
    yarnPalette: [...YARN_PALETTE],
  };

  switch (type) {
    case 'pixel':
      return {
        ...projectBase,
        type: 'pixel',
        data: {
          width,
          height,
          grid: Array(width * height).fill(null),
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
          grid: Array(2500).fill(null),
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

export const findClosestYarnColor = (rgb: [number, number, number], yarnPalette: YarnColor[]): YarnColor => {
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
export const processImageToGrid = (
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number,
  maxColors: number,
  yarnPalette: YarnColor[]
): Promise<Partial<PixelGridData>> => {
  return new Promise((resolve) => {
    // --- STAGE 1: High-Fidelity Pattern Generation (Cell-by-cell averaging) ---
    const highFidelityGrid: (string | null)[] = Array(gridWidth * gridHeight).fill(null);
    const cellWidth = imageData.width / gridWidth;
    const cellHeight = imageData.height / gridHeight;
    const colorUsageCount = new Map<string, number>();

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        // Calculate average color for the block
        const startX = Math.floor(x * cellWidth);
        const startY = Math.floor(y * cellHeight);
        const endX = Math.min(imageData.width, Math.floor((x + 1) * cellWidth));
        const endY = Math.min(imageData.height, Math.floor((y + 1) * cellHeight));

        let r_sum = 0, g_sum = 0, b_sum = 0;
        let pixel_count = 0;

        for (let iy = startY; iy < endY; iy++) {
          for (let ix = startX; ix < endX; ix++) {
            const i = (iy * imageData.width + ix) * 4;
            r_sum += imageData.data[i];
            g_sum += imageData.data[i + 1];
            b_sum += imageData.data[i + 2];
            pixel_count++;
          }
        }

        if (pixel_count > 0) {
          const avg_r = Math.round(r_sum / pixel_count);
          const avg_g = Math.round(g_sum / pixel_count);
          const avg_b = Math.round(b_sum / pixel_count);

          const closestYarn = findClosestYarnColor([avg_r, avg_g, avg_b], yarnPalette);
          const yarnId = closestYarn.id;
          
          highFidelityGrid[y * gridWidth + x] = yarnId;
          colorUsageCount.set(yarnId, (colorUsageCount.get(yarnId) || 0) + 1);
        }
      }
    }

    // --- STAGE 2: Intelligent Color Reduction ---
    let finalGrid = highFidelityGrid;
    const uniqueColorsUsed = Array.from(colorUsageCount.keys());

    if (uniqueColorsUsed.length > maxColors) {
        // Determine the final palette (top N most used colors)
        const sortedColors = uniqueColorsUsed.sort((a, b) => (colorUsageCount.get(b) || 0) - (colorUsageCount.get(a) || 0));
        const finalPaletteIds = new Set(sortedColors.slice(0, maxColors));
        const finalPaletteYarns = yarnPalette.filter(y => finalPaletteIds.has(y.id));
        
        // Create a map to remap culled colors to their closest color in the final palette
        const remapping = new Map<string, string>();
        
        for (const yarnId of uniqueColorsUsed) {
            if (!finalPaletteIds.has(yarnId)) {
                const originalYarn = yarnPalette.find(y => y.id === yarnId);
                if (originalYarn && finalPaletteYarns.length > 0) {
                    const closestInFinalPalette = findClosestYarnColor(originalYarn.rgb, finalPaletteYarns);
                    remapping.set(yarnId, closestInFinalPalette.id);
                }
            }
        }
        
        // Apply the remapping to the grid
        finalGrid = highFidelityGrid.map(yarnId => {
            if (yarnId && remapping.has(yarnId)) {
                return remapping.get(yarnId)!;
            }
            return yarnId;
        });
    }

    const finalUsedYarnSet = new Set<string>();
    finalGrid.forEach(cell => {
      if (cell) finalUsedYarnSet.add(cell);
    });

    resolve({
      width: gridWidth,
      height: gridHeight,
      grid: finalGrid,
      palette: Array.from(finalUsedYarnSet),
    });
  });
};