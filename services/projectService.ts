
import { AnyProject, PatternType, PixelGridData, YarnColor } from '../types';
import { YARN_PALETTE } from '../constants';

const PROJECTS_KEY = 'blanket_generator_projects';

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
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

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

// Image processing
export const processImageToGrid = (
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number,
  numColors: number,
  yarnPalette: YarnColor[]
): Promise<Partial<PixelGridData>> => {
  return new Promise((resolve) => {
    // This is a simplified quantization. A real implementation would use a better algorithm.
    // For now, we'll just average colors in each grid cell.
    const newGrid: (string | null)[] = Array(gridWidth * gridHeight).fill(null);
    const cellWidth = imageData.width / gridWidth;
    const cellHeight = imageData.height / gridHeight;
    const usedYarnSet = new Set<string>();

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const startX = Math.floor(x * cellWidth);
        const startY = Math.floor(y * cellHeight);
        const endX = Math.floor((x + 1) * cellWidth);
        const endY = Math.floor((y + 1) * cellHeight);
        
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let iy = startY; iy < endY; iy++) {
          for (let ix = startX; ix < endX; ix++) {
            const i = (iy * imageData.width + ix) * 4;
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
            count++;
          }
        }
        
        if (count > 0) {
          const avgR = Math.floor(r / count);
          const avgG = Math.floor(g / count);
          const avgB = Math.floor(b / count);
          const closestYarn = findClosestYarnColor([avgR, avgG, avgB], yarnPalette);
          newGrid[y * gridWidth + x] = closestYarn.id;
          usedYarnSet.add(closestYarn.id);
        }
      }
    }

    resolve({
      width: gridWidth,
      height: gridHeight,
      grid: newGrid,
      palette: Array.from(usedYarnSet),
    });
  });
};
