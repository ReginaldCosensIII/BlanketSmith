import { PixelGridData } from '../../types';

export interface InstructionSegment {
    count: number;
    colorId: string;
    stitchId: string; // Defaults to 'sc' if null in data
}

export interface InstructionRow {
    rowNumber: number;
    isRightToLeft: boolean; // Replaces isRightSide for clarity on winding direction
    segments: InstructionSegment[];
}

/**
 * Service to traverse the grid and generate linear instruction rows.
 * Handles:
 * 1. Zig-Zag winding (Standard: Odd L->R, Even R->L)
 * 2. Run-Length Encoding (Grouping identical adjacent stitches)
 */
export class RowWalker {
    /**
     * Converts a 2D PixelGrid into a list of InstructionRows.
     */
    public static convertGridToRows(gridData: PixelGridData, isLeftHanded: boolean = false): InstructionRow[] {
        const rows: InstructionRow[] = [];
        const { width, height, grid } = gridData;

        for (let y = 0; y < height; y++) {
            const rowNumber = y + 1;
            const isOddRow = rowNumber % 2 !== 0;

            // Winding Logic (Matches exportService.ts:generateNumberingData)
            // Standard: Odd=L->R (False), Even=R->L (True)
            // LeftHanded: Odd=R->L (True), Even=L->R (False)
            const isRightToLeft = isLeftHanded ? isOddRow : !isOddRow;

            // Generate X coordinates based on direction
            const xCoordinates = Array.from({ length: width }, (_, i) => i);
            if (isRightToLeft) {
                xCoordinates.reverse();
            }

            const segments: InstructionSegment[] = [];
            let currentSegment: InstructionSegment | null = null;

            for (const x of xCoordinates) {
                const index = y * width + x;
                const cell = grid[index];

                // Null Handling: Skip empty cells
                if (cell.colorId === null) {
                    // Start new segment on next valid cell
                    currentSegment = null;
                    continue;
                }

                // Default stitch to 'sc' if missing
                const stitchId = cell.stitchId || 'sc';
                const colorId = cell.colorId;

                if (currentSegment && currentSegment.colorId === colorId && currentSegment.stitchId === stitchId) {
                    // Extend current segment
                    currentSegment.count++;
                } else {
                    // Start new segment
                    currentSegment = {
                        count: 1,
                        colorId: colorId,
                        stitchId: stitchId
                    };
                    segments.push(currentSegment);
                }
            }

            // Only add rows that have content? Or all rows?
            // Requirement usually implies all rows to maintain count.
            // If a row is entirely empty, segments will be empty.
            rows.push({
                rowNumber,
                isRightToLeft,
                segments
            });
        }

        return rows;
    }
}
