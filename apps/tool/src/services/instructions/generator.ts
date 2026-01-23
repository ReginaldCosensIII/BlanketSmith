import { AnyProject, InstructionDoc, InstructionBlock, PixelGridData, YarnColor } from '../../types';
import { StitchRegistry } from './registry';
import { RowWalker, InstructionRow, InstructionSegment } from './rowWalker';

/**
 * Generates a single text line for a row of instructions.
 * e.g. "With Color A, 5 sc, switch to Color B, 2 dc. Turn."
 */
const generateInstructionTextForRow = (
    row: InstructionRow,
    yarnPalette: YarnColor[],
    registry: StitchRegistry,
    isLastRow: boolean
): string => {
    const parts: string[] = [];
    let currentColorId: string | null = null;

    // Helper to get safe color name
    const getColorName = (id: string): string => {
        const color = yarnPalette.find(c => c.id === id);
        if (color && color.name && color.name.trim().length > 0) {
            return color.name;
        }
        // Fallback
        const index = yarnPalette.findIndex(c => c.id === id);
        if (index >= 0) return `Color ${index + 1}`;
        return `Unknown Color (${id})`;
    };

    row.segments.forEach((segment, index) => {
        const isFirstSegment = index === 0;

        // Color Change Logic
        if (segment.colorId !== currentColorId) {
            const colorName = getColorName(segment.colorId);
            if (isFirstSegment) {
                parts.push(`With ${colorName}`);
            } else {
                parts.push(`switch to ${colorName}`);
            }
            currentColorId = segment.colorId;
        }

        // Stitch Text Logic
        const stitchDef = registry.getStitch(segment.stitchId);
        const count = segment.count;
        let stitchName = segment.stitchId; // Fallback

        if (stitchDef) {
            if (count === 1) {
                stitchName = stitchDef.instruction || stitchDef.name.toLowerCase();
            } else {
                stitchName = stitchDef.instructionPlural ||
                    (stitchDef.instruction ? `${stitchDef.instruction}s` : `${stitchDef.name.toLowerCase()}s`);
            }
        } else {
            // Fallback pluralization for unknown stitches
            stitchName = count === 1 ? stitchName : `${stitchName}s`;
        }

        parts.push(`${count} ${stitchName}`);
    });

    // Join parts with commas and spaces
    let rowText = parts.join(', ');

    // Turning Logic
    if (!isLastRow) {
        rowText += '. Turn.';
    } else {
        rowText += '.';
    }

    return rowText;
};

/**
 * Generates a discipline-neutral InstructionDoc aimed at Crochet projects.
 * Analyzes the grid to determine used stitches and palette.
 */
export const generateCrochetInstructionDoc = (project: AnyProject): InstructionDoc => {
    const blocks: InstructionBlock[] = [];
    const registry = StitchRegistry.getInstance();
    const projectData = project.data as PixelGridData; // Assuming PixelGridData for crochet

    // Safety check for grid data
    if (!projectData || !Array.isArray(projectData.grid)) {
        return {
            title: project.name || 'Pattern Instructions',
            blocks: [{
                type: 'paragraph',
                content: ['Error: No valid grid data found for this project.']
            }]
        };
    }

    // 1. Materials & Setup Block
    blocks.push({
        type: 'heading',
        content: ['Materials & Tools']
    });

    // Calculate actual usage for Yarn count
    const usedColorIds = new Set<string>();
    projectData.grid.forEach((cell) => {
        if (cell.colorId) usedColorIds.add(cell.colorId);
    });

    const colorCount = usedColorIds.size;

    blocks.push({
        type: 'list-ul',
        content: [
            `Yarn: ${colorCount} color${colorCount !== 1 ? 's' : ''} (see Materials Key for details)`,
            'Hook: Recommended size for yarn weight',
            'Scissors',
            'Tapestry Needle'
        ]
    });

    // 2. Pattern Notes
    blocks.push({
        type: 'heading',
        content: ['Pattern Notes']
    });

    // Check strict left-handed mode from somewhere? 
    // Usually passed in props or context, but here we generate static doc.
    // For now, we assume Standard (Right-Handed) unless we pull a setting from project?
    // Project doesn't store 'isLeftHanded' (it's a UI preference usually).
    // so we document Standard behavior.
    blocks.push({
        type: 'list-ul',
        content: [
            'Row 1 is the Right Side (RS).',
            'Odd numbered rows are worked Right-to-Left (Standard).',
            'Even numbered rows are worked Left-to-Right.',
            'Chain 1 at the start of each row (does not count as a stitch) unless otherwise specified.'
        ]
    });

    // 3. Instructions (Row-by-Row)
    blocks.push({
        type: 'heading',
        content: ['Instructions']
    });

    const instructionRows = RowWalker.convertGridToRows(projectData, false); // Standard winding
    const rowLines: string[] = [];

    instructionRows.forEach((instRow, index) => {
        const isLastRow = index === instructionRows.length - 1;
        const text = generateInstructionTextForRow(instRow, project.yarnPalette, registry, isLastRow);

        const sideLabel = instRow.rowNumber % 2 !== 0 ? 'RS' : 'WS';
        rowLines.push(`Row ${instRow.rowNumber} (${sideLabel}): ${text}`);
    });

    if (rowLines.length > 0) {
        blocks.push({
            type: 'list-ol', // Ordered list for rows
            content: rowLines
        });
    } else {
        blocks.push({
            type: 'paragraph',
            content: ['No printable rows generated. Grid may be empty.']
        });
    }

    // 4. Finishing
    blocks.push({
        type: 'heading',
        content: ['Finishing']
    });

    blocks.push({
        type: 'list-ul',
        content: [
            'Weave in all ends securely.',
            'Block your finished piece to the desired measurements.',
            'Add a border if desired (optional).'
        ]
    });

    return {
        title: project.name || 'Pattern Instructions',
        blocks: blocks
    };
};
