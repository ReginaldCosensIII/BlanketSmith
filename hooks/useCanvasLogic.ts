
import { useCallback } from 'react';
import { Symmetry } from '../types';

export const useCanvasLogic = (
    width: number,
    height: number,
    symmetry: Symmetry
) => {
    // Calculate all points affected by symmetry for a given grid coordinate
    const getSymmetryPoints = useCallback((gridX: number, gridY: number) => {
        const points = [{x: gridX, y: gridY}];
        
        if (symmetry.vertical) {
            points.push({ x: width - 1 - gridX, y: gridY });
        }
        if (symmetry.horizontal) {
            points.push({ x: gridX, y: height - 1 - gridY });
        }
        if (symmetry.vertical && symmetry.horizontal) {
            points.push({ x: width - 1 - gridX, y: height - 1 - gridY });
        }
        
        // Deduplicate points (handles center lines)
        const uniquePoints: {x: number, y: number}[] = [];
        const seen = new Set<string>();
        
        points.forEach(p => {
            const key = `${p.x},${p.y}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniquePoints.push(p);
            }
        });
        
        return uniquePoints;
    }, [width, height, symmetry]);

    // Calculate pixels covered by a brush at a specific point
    const getBrushPoints = useCallback((centerX: number, centerY: number, brushSize: number) => {
        const points: {x: number, y: number}[] = [];
        const offset = Math.floor((brushSize - 1) / 2);
        const startX = centerX - offset;
        const startY = centerY - offset;

        for (let i = 0; i < brushSize; i++) {
            for (let j = 0; j < brushSize; j++) {
                const currentX = startX + i;
                const currentY = startY + j;

                if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
                    points.push({ x: currentX, y: currentY });
                }
            }
        }
        return points;
    }, [width, height]);

    return { getSymmetryPoints, getBrushPoints };
};
