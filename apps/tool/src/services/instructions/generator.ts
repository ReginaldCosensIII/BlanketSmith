import { AnyProject, InstructionDoc, InstructionBlock, PixelGridData, Project } from '../../types';
import { StitchRegistry } from './registry';

export interface InstructionGenerator {
    generate(project: AnyProject): InstructionDoc;
}

/**
 * Generates a discipline-neutral InstructionDoc aimed at Crochet projects.
 * Analyzes the grid to determine used stitches and palette.
 */
export const generateCrochetInstructionDoc = (project: AnyProject): InstructionDoc => {
    const blocks: InstructionBlock[] = [];
    const registry = StitchRegistry.getInstance();

    // 1. Materials & Setup Block
    blocks.push({
        type: 'heading',
        content: ['Materials & Tools']
    });

    const paletteCount = project.yarnPalette.length;
    blocks.push({
        type: 'list-ul',
        content: [
            `Yarn: ${paletteCount} color${paletteCount !== 1 ? 's' : ''} (see Materials Key for details)`,
            'Hook: Recommended size for yarn weight',
            'Scissors',
            'Tapestry Needle'
        ]
    });

    // 2. Stitch Key (Dynamic)
    // We need to check if the project HAS grid data with stitches
    // Supports: PixelGridData (most common)
    // Future: Gradient / C2C might have different data shapes
    let usedStitchIds = new Set<string>();

    // Type Guard for PixelGridData (has 'grid' array)
    const data = project.data as any; // Cast generic data to access potential properties safely
    if (data && Array.isArray(data.grid)) {
        const grid = data.grid;
        grid.forEach((cell: any) => {
            if (cell.stitchId) {
                usedStitchIds.add(cell.stitchId);
            }
        });
    }

    // Checking project settings overrides or explicit enables
    if (project.settings?.stitchesEnabled && Array.isArray(project.settings.stitchesEnabled)) {
        project.settings.stitchesEnabled.forEach(id => usedStitchIds.add(id));
    }

    if (usedStitchIds.size > 0) {
        blocks.push({
            type: 'heading',
            content: ['Stitch Key']
        });

        const stitchList: string[] = [];
        usedStitchIds.forEach(id => {
            const def = registry.getStitch(id);
            if (def) {
                stitchList.push(`${def.name} (${def.shortCode})`);
            } else {
                stitchList.push(`Unknown Stitch: ${id}`);
            }
        });

        if (stitchList.length > 0) {
            blocks.push({
                type: 'list-ul',
                content: stitchList.sort()
            });
        }
    } else {
        // Fallback if no stitches found (e.g. Color only project)
        blocks.push({
            type: 'heading',
            content: ['Pattern Notes']
        });
        blocks.push({
            type: 'paragraph',
            content: ['This pattern is primarily a color chart. Work in Single Crochet (SC) or your preferred stitch method for each pixel unit.']
        });
    }

    // 3. Finishing / Generic
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
