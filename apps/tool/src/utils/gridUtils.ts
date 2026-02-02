import { CellData } from '../types';

/**
 * Rotates a 2D grid of CellData 90 degrees clockwise.
 * Returns the new grid along with its new dimensions.
 * This is a non-destructive operation (no clipping).
 *
 * @param grid - The flat array of CellData representing the grid
 * @param width - The current width of the grid
 * @param height - The current height of the grid
 * @returns Object containing the new grid, newWidth, and newHeight
 */
export const rotateGrid = (
    grid: CellData[],
    width: number,
    height: number
): { grid: CellData[]; newWidth: number; newHeight: number } => {
    const newWidth = height;
    const newHeight = width;
    const newGrid = new Array(newWidth * newHeight).fill({ colorId: null });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Original index
            const oldIndex = y * width + x;

            // 90 degrees clockwise transformation:
            // New X = original Y (reversed if we consider top-left origin standard rotation? No, let's trace it)
            // Standard 90deg CW: (x, y) -> (h - 1 - y, x)

            const newX = height - 1 - y;
            const newY = x;

            const newIndex = newY * newWidth + newX;
            newGrid[newIndex] = grid[oldIndex];
        }
    }

    return { grid: newGrid, newWidth, newHeight };
};
