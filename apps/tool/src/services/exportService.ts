
// @ts-nocheck
import { PixelGridData, PatternColor, CellData, ExportType, BrandingOptions, ChartVisualOptions, ExportOptions } from '../types';
import { DEFAULT_STITCH_LIBRARY, StitchDefinition } from '../data/stitches';
import { logger } from './logger';
import { notify } from './notification';

const A4_SPECS = { width: 595.28, height: 841.89 };
const MIN_READABLE_CELL_SIZE = 8; // Absolute minimum we allow in Fixed Mode

export const getValidPageCounts = (gridW: number, gridH: number): number[] => {
    // We want to find all N (1..36) where there exists a topology (R x C = N)
    // such that the resulting cell size is >= MIN_READABLE_CELL_SIZE (8pt).

    // We use standard A4 portrait assumptions for valid check
    // Same margins as PDF_CONFIG
    const margin = 30;
    const headerHeight = 40;
    const titleBand = 30;
    const pageW = A4_SPECS.width;
    const pageH = A4_SPECS.height;

    const availW = pageW - margin * 2 - 40; // -40 for row numbers
    const availH = pageH - margin * 2 - headerHeight - titleBand;

    const validN = new Set<number>();

    // Test all N from 1 to 36
    for (let n = 1; n <= 36; n++) {
        // Find optimal topology for this N that maximizes cell size
        let maxCellSizeForN = 0;

        // Factorize N into r * c
        for (let r = 1; r <= n; r++) {
            if (n % r === 0) {
                const c = n / r;

                // Effective grid size per page
                // We split the total gridW into c cols, and gridH into r rows
                // Each page handles gridW/c width and gridH/r height
                const tileW = gridW / c;
                const tileH = gridH / r;

                // Cell size limited by width or height
                const sizeW = availW / tileW;
                const sizeH = availH / tileH;
                const size = Math.min(sizeW, sizeH);

                if (size > maxCellSizeForN) {
                    maxCellSizeForN = size;
                }
            }
        }

        if (maxCellSizeForN >= MIN_READABLE_CELL_SIZE) {
            validN.add(n);
        }
    }

    return Array.from(validN).sort((a, b) => a - b);
};

// Configuration for PDF layout
const PDF_CONFIG = {
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 30,
    headerHeight: 40,
    minCellSize: 18,
    minSinglePageCellSize: 12,
    fontSize: {
        title: 24,
        header: 14,
        cell: 7,
        legend: 10,
        ruler: 8
    },
    // Commit 1a: Overview Sizing Contract
    // Updated: Target-fill sizing policy
    overview: {
        fillRatio: 0.80,         // Target 80% of available height
        maxHeight: 550,          // Raised max bound for larger overviews
        minHeight: 200,          // Min height to fit on current page
        safetyBuffer: 20,        // Bottom safety margin
        horizontalMargin: 20,    // Reduced margin for more width (vs standard 30pt)
        titleSpace: 30           // Space reserved for title (vs 40pt)
    }
};

const hexToRgb = (hex: string): [number, number, number] => {
    if (!hex) return [0, 0, 0];
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const ensurePaletteConsistency = (palette: PatternColor[]) => {
    palette.forEach(color => {
        if (!color.rgb || !Array.isArray(color.rgb) || color.rgb.length !== 3) {
            color.rgb = hexToRgb(color.hex);
        }
    });
};

const getTextColor = (hex: string): string => {
    if (!hex) return '#000000';
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128 ? '#FFFFFF' : '#000000';
};

const generateNumberingData = (grid: CellData[], width: number, height: number, isLeftHanded: boolean): string[] => {
    const numbers = Array(width * height).fill('');
    for (let y = 0; y < height; y++) {
        let count = 0;
        let currentColor = null;

        // Numbering Direction Logic:
        // Standard (Right-Handed):
        //   Row 1 (Odd): Left -> Right (indices increase)
        //   Row 2 (Even): Right -> Left (indices decrease)

        // Left-Handed (Mirrored):
        //   Row 1 (Odd): Right -> Left (indices decrease)
        //   Row 2 (Even): Left -> Right (indices increase)

        const rowNumber = y + 1;
        const isOddRow = rowNumber % 2 !== 0;

        // Determine if we should reverse the x-coordinates (count Right-to-Left)
        // Default: Even rows reverse.
        // Left-Handed: Odd rows reverse.
        const shouldReverse = isLeftHanded ? isOddRow : !isOddRow;

        const xCoordinates = Array.from({ length: width }, (_, i) => i);
        if (shouldReverse) {
            xCoordinates.reverse();
        }

        for (const x of xCoordinates) {
            const index = y * width + x;
            const cellColor = grid[index].colorId;

            if (cellColor === null) {
                count = 0;
                currentColor = null;
                continue;
            }

            if (cellColor === currentColor) {
                count++;
            } else {
                count = 1;
                currentColor = cellColor;
            }
            numbers[index] = String(count);
        }
    }
    return numbers;
};

const buildColorSymbolMap = (yarnPalette: PatternColor[]): Map<string, string> => {
    const map = new Map<string, string>();
    yarnPalette.forEach((yarn, index) => {
        // yarn.id or name; pick a stable key used in cells:
        const key = yarn.id ?? yarn.name ?? String(index);
        const symbol = String(index + 1); // "1", "2", "3", ...
        map.set(key, symbol);
    });
    return map;
};

export const exportPixelGridToImage = (projectName: string, gridData: PixelGridData, yarnPalette: PatternColor[]) => {
    try {
        // Defensive: Ensure RGB values exist
        ensurePaletteConsistency(yarnPalette);

        // Basic implementation to restore functionality
        const canvas = document.createElement('canvas');
        const scale = 20; // Fixed scale for export
        canvas.width = gridData.width * scale;
        canvas.height = gridData.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const yarnColorMap = new Map(yarnPalette.map(yc => [yc.id, yc]));

        gridData.grid.forEach((cell, i) => {
            const x = (i % gridData.width) * scale;
            const y = Math.floor(i / gridData.width) * scale;

            if (cell.colorId) {
                const c = yarnColorMap.get(cell.colorId);
                ctx.fillStyle = c ? c.hex : '#FFFFFF';
                ctx.fillRect(x, y, scale, scale);
            }
        });

        const link = document.createElement('a');
        link.download = `${projectName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        logger.info('Image export successful', { projectName });
    } catch (error) {
        logger.error('Failed to export image', { error, projectName });
        notify.error('Failed to export image.');
    }
};

// --- INSTRUCTIONS (DISCIPLINE-NEUTRAL) ---

interface InstructionBlock {
    type: 'heading' | 'paragraph' | 'list-ul' | 'list-ol';
    content: string[]; // Lines or items
}

interface InstructionDoc {
    title?: string;
    blocks: InstructionBlock[];
}

// Internal Helper for Instructions
const drawInstructionsSection = (
    doc: any, // PDF Instance
    currentY: number,
    pageH: number,
    margin: number,
    layout: any, // RenderLayout
    instructionDoc: InstructionDoc
): number => {
    let y = currentY;
    const lineHeight = 12;
    const headingHeight = 18;
    const listIndent = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // Helper to verify space
    const ensureSpace = (height: number) => {
        if (y + height > pageH - margin) {
            doc.addPage();
            y = margin + 20; // Fresh page top
        }
    };

    // Render Title
    ensureSpace(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(instructionDoc.title || 'Instructions', margin, y + 6);
    y += 24;

    // Render Blocks
    instructionDoc.blocks.forEach((block: InstructionBlock) => {
        doc.setFontSize(10);

        if (block.type === 'heading') {
            ensureSpace(headingHeight + 4);
            doc.setFont('helvetica', 'bold');
            y += 4;
            block.content.forEach((line: string) => {
                doc.text(line, margin, y + 10);
                y += headingHeight;
            });
            y += 2; // Spacing after heading
        }
        else if (block.type === 'paragraph') {
            doc.setFont('helvetica', 'normal');
            block.content.forEach((text: string) => {
                // Determine width
                const lines = doc.splitTextToSize(text, contentWidth);
                const blockHeight = lines.length * lineHeight;

                ensureSpace(blockHeight + 6);
                doc.text(lines, margin, y + 10);
                y += blockHeight + 6;
            });
        }
        else if (block.type === 'list-ul' || block.type === 'list-ol') {
            doc.setFont('helvetica', 'normal');
            block.content.forEach((item: string, index: number) => {
                const listWidth = contentWidth - listIndent;
                const lines = doc.splitTextToSize(item, listWidth);
                const blockHeight = lines.length * lineHeight;

                ensureSpace(blockHeight + 2);

                // Bullet/Number
                const prefix = block.type === 'list-ol' ? `${index + 1}.` : '•';
                doc.text(prefix, margin, y + 10);

                // Text
                doc.text(lines, margin + listIndent, y + 10);
                y += blockHeight + 2;
            });
            y += 4; // Spacing after list
        }
    });

    // Pad end of section
    return y + 20;
};

export const exportPixelGridToPDF = (
    projectName: string,
    gridData: PixelGridData,
    yarnPalette: PatternColor[],
    yarnUsage: Map<string, number>,
    options: ExportOptions = {},
    projectSettings: any = {},
    isLeftHanded: boolean = false

) => {
    try {
        // Defensive: Ensure RGB values exist
        // Note: We modifying the array elements in place, which is generally safe here as PatternColor objects are mutable references
        // and we are normalizing data for export.

        if (yarnPalette) ensurePaletteConsistency(yarnPalette);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = PDF_CONFIG.margin;

        const yarnColorMap = new Map(yarnPalette.map(yc => [yc.id, yc]));
        const stitchMap = new Map(DEFAULT_STITCH_LIBRARY.map(s => [s.id, s]));
        const numbering = generateNumberingData(gridData.grid, gridData.width, gridData.height, isLeftHanded);
        const colorSymbolMap = buildColorSymbolMap(yarnPalette);

        // --- OPTION NORMALIZATION (V2 Spec: Commit 1) ---
        const exportType: ExportType = options.exportType || (options.forceSinglePage ? 'chart-only' : 'pattern-pack');
        const isChartOnly = exportType === 'chart-only';
        const isPatternPack = exportType === 'pattern-pack';

        const branding: BrandingOptions = options.branding || {};

        // Layout Flags
        const includeCoverPage = options.includeCoverPage ?? false;

        // Overview Mode Normalization (Tri-State)
        let overviewMode: 'auto' | 'always' | 'never' = 'auto';
        if (options.overviewMode) {
            overviewMode = options.overviewMode;
        } else if (options.includeOverviewPage === true) {
            overviewMode = 'always';
        }

        // Atlas Options (Exp-003)
        const atlasMode = options.atlasMode || 'auto';
        const atlasPages = options.atlasPages || 1;

        // Pattern Pack Options
        const includeYarnRequirements = options.includeYarnRequirements ?? (isPatternPack ? true : false);
        const includeStitchLegend = options.includeStitchLegend ?? (isPatternPack ? true : false);
        const includeColorChart = isPatternPack ? (options.includeColorChart ?? true) : false;
        const includeStitchChart = isPatternPack ? (options.includeStitchChart ?? false) : false;
        // Hybrid support in Pattern Pack
        const includeHybridChart = isPatternPack ? (options.includeHybridChart ?? false) : false;

        // Placeholder Options (Instructions - Reserved Slot)
        const instructionsMode = options.instructionsMode || 'none';
        // const instructionsText = options.instructionsText || '';

        // Chart Mode & Visuals
        // For Chart-Only: Use explicit mode ('color', 'stitch', 'hybrid').
        // For Pattern Pack: Mode is derived from the drawing loop (Color vs Stitch).
        const chartOnlyMode = options.chartMode || 'color';

        const chartVisual: ChartVisualOptions = {
            showCellSymbols: options.chartVisual?.showCellSymbols ?? true,
            showCellBackgrounds: options.chartVisual?.showCellBackgrounds ?? true,
            symbolMode: options.chartVisual?.symbolMode ?? 'color-index',
        };

        // Helper for Tri-state Overview Logic
        // Logic moved to usage site with AtlasPlan
        // const shouldIncludeOverview = ... (Removed legacy helper)

        // --- LAYOUT HELPERS ---
        interface AtlasRegion {
            pageIndex: number; // 0-based index of the chart pages
            startRow: number;
            endRow: number;
            startCol: number;
            endCol: number;
        }

        const calculateAtlasRegions = (
            gridW: number,
            gridH: number,
            availW: number,
            pageH: number,
            margin: number,
            headerHeight: number,
            cellSize: number,
            startOnFreshPage: boolean,
            startY: number // Used only if !startOnFreshPage (e.g. mixed page 1)
        ): AtlasRegion[] => {
            const regions: AtlasRegion[] = [];

            // P2.3 / Beta Stability Logic Reflection
            // If startOnFreshPage is TRUE, then Page 1 is a Full Page (height-wise).
            // If FALSE, Page 1 uses remaining space.

            // Header Band (30pt) is mandated by P2.3 fix in drawConfiguredChart.
            const titleBand = 30;

            const page1H = startOnFreshPage
                ? pageH - margin * 2 - headerHeight - titleBand
                : Math.max(0, pageH - startY - margin - titleBand);

            const fullPageH = pageH - margin * 2 - headerHeight - titleBand;

            const cellsPerW = Math.floor(availW / cellSize);

            // If we can't fit anything, return empty (safeguard)
            if (cellsPerW <= 0) return regions;

            const cellsPerH_P1 = Math.floor(page1H / cellSize);
            const cellsPerH_Full = Math.floor(fullPageH / cellSize);

            let currentY = 0;
            let pageIndex = 0;

            while (currentY < gridH) {
                // Determine rows for this band of tiles
                const isFirstRowOfTiles = (currentY === 0);

                // If it's the very first row of tiles, it uses page1H (which might encompass full page if fresh).
                // But subsequent tile-rows always use fullPageH.
                const tileRowsH = isFirstRowOfTiles ? cellsPerH_P1 : cellsPerH_Full;

                // If space is too small to render even one row, force to next (logic alignment)
                // But for calculation simulation, we assume usage matches loop.

                const rowsToRender = Math.min(tileRowsH, gridH - currentY);

                if (rowsToRender <= 0) {
                    // Edge Case: First page too small? 
                    // Logic in actual loop: if (rowsToRender <= 0) break;
                    // Ideally this shouldn't happen with "Force Fresh Page" unless single page is tiny.
                    if (isFirstRowOfTiles && rowsToRender <= 0) {
                        // Conceptually skips to next page? 
                        // The export loop breaks. We should break.
                        break;
                    }
                }

                let currentX = 0;
                while (currentX < gridW) {
                    const colsToRender = Math.min(cellsPerW, gridW - currentX);

                    // Logic Check:
                    // Chart-Only Loop (Line 806):
                    // if (currentY > 0 || currentX > 0) doc.addPage();
                    // This means index 0 is Page 1. Index 1 is Page 2.
                    // UNLESS forceFreshPage was used, in which case "Page 1" of the chart is physically a new page.

                    regions.push({
                        pageIndex: pageIndex,
                        startRow: currentY,
                        endRow: currentY + rowsToRender,
                        startCol: currentX,
                        endCol: currentX + colsToRender
                    });

                    currentX += colsToRender;
                    pageIndex++;
                }
                currentY += rowsToRender;
            }

            return regions;
        };





        interface AtlasPlan {
            isMultiPage: boolean;
            regions: AtlasRegion[]; // If single page, contains 1 region covering whole grid
            cellSize: number;
        }

        // Shared Atlas Planner (Internal Helper)
        // Runs ONCE per chart type to determine layout.
        // Enforces strict "Charts start on Fresh Page" rule.
        const predictAtlasLayout = (
            targetGridW: number,
            targetGridH: number,
            atlasMode: 'auto' | 'fixed' = 'auto',
            targetPages: number = 1
        ): AtlasPlan => {
            // Available space on a fresh page
            const availW = pageW - margin * 2 - 40; // -40 for row numbers
            const titleBand = 30; // Copied from internal logic
            const availH = pageH - margin * 2 - PDF_CONFIG.headerHeight - titleBand;

            // 1. Fixed Mode (Exp-003)
            if (atlasMode === 'fixed' && targetPages >= 1) {
                // "Best Fit Topology" Search
                // We want to find factors (r * c = targetPages) that maximize cell size
                let bestR = 1;
                let bestC = targetPages;
                let bestSize = 0;

                for (let r = 1; r <= targetPages; r++) {
                    if (targetPages % r === 0) {
                        const c = targetPages / r;
                        const tileW = targetGridW / c;
                        const tileH = targetGridH / r;
                        const size = Math.min(availW / tileW, availH / tileH);

                        if (size > bestSize) {
                            bestSize = size;
                            bestR = r;
                            bestC = c;
                        }
                    }
                }

                // Validity Check
                if (bestSize >= MIN_READABLE_CELL_SIZE) {
                    // Valid Fixed Plan found
                    // Generate regions for the determined topology
                    // Note: calculateAtlasRegions is designed for "streaming" / "filling"
                    // checking row by row. We need to verify if passing the calculated cell size
                    // into it yields the correct N pages?
                    // actually calculateAtlasRegions figures out page breaks based on cell size.
                    // If we pass the EXACT bestSize, it should break exactly where we expect.

                    const regions = calculateAtlasRegions(
                        targetGridW,
                        targetGridH,
                        availW,
                        pageH,
                        margin,
                        PDF_CONFIG.headerHeight,
                        bestSize,
                        true,
                        0
                    );

                    // Sanity check: verify resulting page count matches target?
                    // Or trust the math. The math says it fits.

                    return {
                        isMultiPage: targetPages > 1,
                        regions,
                        cellSize: bestSize
                    };
                }

                // Fallback: If requested fixed mode is invalid (too small), drop to Auto
                logger.warn('Requested fixed atlas pages resulted in unreadable cells. Falling back to Auto.', { targetPages, bestSize });
            }

            // 2. Auto Mode (Original Logic)

            // Try Single Page Fit
            let testSize = Math.floor(Math.min(availW / targetGridW, availH / targetGridH));
            const minSingle = PDF_CONFIG.minSinglePageCellSize || 12;

            if (testSize >= minSingle) {
                // Fits cleanly on one page
                return {
                    isMultiPage: false,
                    regions: [{
                        pageIndex: 0,
                        startRow: 0,
                        endRow: targetGridH,
                        startCol: 0,
                        endCol: targetGridW
                    }],
                    cellSize: testSize
                };
            }

            // Atlas Fallback
            let atlasSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / targetGridW, availH / targetGridH));
            atlasSize = Math.max(atlasSize, PDF_CONFIG.minCellSize); // Ensure >= 18

            const regions = calculateAtlasRegions(
                targetGridW,
                targetGridH,
                availW,
                pageH,
                margin,
                PDF_CONFIG.headerHeight,
                atlasSize,
                true, // Always start on fresh page
                0
            );

            return {
                isMultiPage: true,
                regions,
                cellSize: atlasSize
            };
        };

        const measureYarnLegendHeight = (): number => {
            // Approximate height calculation only (to decide page breaks)
            // Title (20) + Header (15) + (Rows * 25)
            const sortedYarns = gridData.palette.filter(id => (yarnUsage.get(id) || 0) > 0);
            return 20 + 15 + (sortedYarns.length * 25);
        };

        const drawCoverPage = () => {
            // Ensure we are on page 1 (implicitly true if called first)
            // Draw Project Title
            const centerX = pageW / 2;
            let cursorY = pageH / 2 - 40;

            doc.setFontSize(PDF_CONFIG.fontSize.title);
            doc.text(projectName, centerX, cursorY, { align: 'center' });
            cursorY += 40;

            // Designer / Branding
            doc.setFontSize(14);
            if (branding.designerName) {
                doc.text(`Designed by ${branding.designerName}`, centerX, cursorY, { align: 'center' });
                cursorY += 20;
            }
            if (branding.website) {
                doc.setTextColor(100);
                doc.text(branding.website, centerX, cursorY, { align: 'center' });
                doc.setTextColor(0);
            }

            // Stats
            doc.setFontSize(12);
            doc.text(`Dimensions: ${gridData.width} x ${gridData.height} stitches`, centerX, cursorY + 40, { align: 'center' });

            // Copyright
            if (branding.copyrightLine) {
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(branding.copyrightLine, centerX, pageH - margin, { align: 'center' });
                doc.setTextColor(0);
            }
        };

        // Unified Materials & Stitch Key Section
        // Canonical title: "Materials & Stitch Key"
        // Includes stitch key when: Stitch chart, Hybrid chart, or stitch symbols in use
        const drawMaterialsAndStitchKey = (startY: number, includeStitchKey: boolean, includeColorSymbols: boolean): number => {
            let legendY = startY;
            doc.setFontSize(14);
            doc.text("Materials & Stitch Key", margin, legendY);
            legendY += 20;

            const swatchSize = 15;
            doc.setFontSize(10);

            const sortedYarns = gridData.palette
                .sort((a, b) => (yarnUsage.get(b) || 0) - (yarnUsage.get(a) || 0));

            // Layout Offsets
            const symbolColWidth = includeColorSymbols ? 30 : 0;
            const colColor = margin + symbolColWidth;
            const colDetails = margin + symbolColWidth + 130;
            const colUsage = margin + symbolColWidth + 330;

            // Materials Table Header
            doc.setFont("helvetica", "bold");
            if (includeColorSymbols) {
                doc.text("Sym", margin, legendY);
            }
            doc.text("Color", colColor, legendY);
            doc.text("Details", colDetails, legendY);
            doc.text("Usage", colUsage, legendY);
            doc.setFont("helvetica", "normal");
            legendY += 15;

            // 1. Materials/Yarn Table
            sortedYarns.forEach(yarnId => {
                const yarn = yarnColorMap.get(yarnId);
                const count = yarnUsage.get(yarnId) || 0;
                if (!yarn || count === 0) return;

                const yarnPerStitch = projectSettings?.yarnPerStitch || 1;
                const totalYards = Math.ceil((count * yarnPerStitch) / 36);
                const skeinsNeeded = Math.ceil(totalYards / (yarn.skeinLength || 295));

                if (legendY > pageH - margin) {
                    doc.addPage();
                    legendY = margin;
                }

                // Symbol (if enabled)
                if (includeColorSymbols) {
                    const symbol = colorSymbolMap.get(yarnId) || "?";
                    doc.text(symbol, margin, legendY + 11);
                }

                // Color Swatch
                // Defensive: Ensure RGB is available
                const [r, g, b] = yarn.rgb || hexToRgb(yarn.hex);
                doc.setFillColor(r, g, b);
                doc.rect(colColor, legendY, swatchSize, swatchSize, 'F');
                doc.rect(colColor, legendY, swatchSize, swatchSize, 'S'); // Border

                // Text Info
                doc.text(`${yarn.name}`, colColor + 25, legendY + 11);
                doc.setFontSize(8);
                doc.text(`${yarn.brand} | ${yarn.yarnWeight || 'DK'}`, colDetails, legendY + 11);
                doc.setFontSize(10);
                doc.text(`${count} sts  |  ${totalYards} yds  |  ${skeinsNeeded} skein${skeinsNeeded !== 1 ? 's' : ''}`, colUsage, legendY + 11);

                legendY += 25;
            });

            // 2. Stitch Key (when applicable)
            if (includeStitchKey) {
                const usedStitches = new Set<string>();
                gridData.grid.forEach(cell => {
                    if (cell.stitchId) usedStitches.add(cell.stitchId);
                });

                if (usedStitches.size > 0) {
                    legendY += 10;
                    // Check for space
                    if (legendY > pageH - margin - 50) {
                        doc.addPage();
                        legendY = margin;
                    }

                    doc.setFont("helvetica", "bold");
                    doc.text("Stitch Key:", margin, legendY);
                    doc.setFont("helvetica", "normal");
                    legendY += 15;

                    const stitches = Array.from(usedStitches).map(id => stitchMap.get(id)).filter(s => s);

                    stitches.forEach(stitch => {
                        if (legendY > pageH - margin) {
                            doc.addPage();
                            legendY = margin;
                        }

                        // Draw Symbol
                        doc.rect(margin, legendY - 10, 15, 15);
                        doc.setFontSize(10);
                        doc.text(stitch.symbol, margin + 7.5, legendY, { align: 'center' });

                        // Name
                        doc.text(`=  ${stitch.name} (${stitch.id.toUpperCase()})`, margin + 25, legendY);
                        legendY += 20;
                    });
                }
            }

            return legendY;
        };

        const drawStitchLegend = () => {
            // Collect used stitches
            const usedStitches = new Set<string>();
            gridData.grid.forEach(cell => {
                if (cell.stitchId) usedStitches.add(cell.stitchId);
            });

            if (usedStitches.size === 0) return;

            // Force new page for stitched legend in Pattern Pack or Chart Only (appended)
            doc.addPage();

            doc.setFontSize(14);
            doc.text("Stitch Legend", margin, margin + 20);

            let legendY = margin + 50;
            const swatchSize = 20;
            doc.setFontSize(10);

            doc.setFont("helvetica", "bold");
            doc.text("Symbol", margin, legendY);
            doc.text("Stitch Name", margin + 60, legendY);
            doc.text("Abbreviation", margin + 250, legendY);
            doc.setFont("helvetica", "normal");
            legendY += 20;

            usedStitches.forEach(stitchId => {
                const stitch = stitchMap.get(stitchId);
                if (!stitch) return;

                // Symbol
                doc.rect(margin, legendY, swatchSize, swatchSize);
                doc.setFontSize(12); // Larger symbol
                doc.text(stitch.symbol, margin + swatchSize / 2, legendY + 14, { align: 'center' });

                // Text
                doc.setFontSize(10);
                doc.text(stitch.name, margin + 60, legendY + 14);
                doc.text(stitch.id.toUpperCase(), margin + 250, legendY + 14);

                legendY += 30;
            });
        };

        const drawOverviewPage = (
            customStartY: number | undefined,
            maxContentHeight: number,
            atlasRegions: AtlasRegion[] = [],
            labelPrefix: string = "Part"
        ) => {
            // Doc page addition handled by caller
            doc.setFontSize(16);
            const titleY = customStartY ?? (margin + 20);
            doc.text("Pattern Overview", margin, titleY);

            // V2 MVP: Simplified one-page centered grid
            // Width optimization: Use reduced margins for overview
            const availW = pageW - PDF_CONFIG.overview.horizontalMargin * 2;
            // Commit 1a: Enforce explicit max height constraint
            // Reduced title space for more vertical room
            const availH = maxContentHeight - PDF_CONFIG.overview.titleSpace;

            const cellW = availW / gridData.width;
            const cellH = availH / gridData.height;
            const size = Math.min(cellW, cellH);

            const startX = margin + (availW - (gridData.width * size)) / 2;
            const startY = titleY + 20;

            // Draw simple colored grid
            for (let y = 0; y < gridData.height; y++) {
                for (let x = 0; x < gridData.width; x++) {
                    const index = y * gridData.width + x;
                    const cell = gridData.grid[index];
                    if (cell.colorId) {
                        const c = yarnColorMap.get(cell.colorId);
                        if (c) {
                            doc.setFillColor(c.hex);
                            doc.rect(startX + x * size, startY + y * size, size, size, 'F');
                        }
                    }
                }
            }

            // P2 Fix: Atlas Overlays (Canonical Labels)
            if (atlasRegions.length > 0) {
                doc.setDrawColor(255, 0, 0); // Red
                doc.setLineWidth(1.5);
                doc.setFontSize(14);
                doc.setTextColor(255, 0, 0);

                atlasRegions.forEach((region, i) => {
                    const rX = startX + region.startCol * size;
                    const rY = startY + region.startRow * size;
                    const rW = (region.endCol - region.startCol) * size;
                    const rH = (region.endRow - region.startRow) * size;

                    // Draw Red Box
                    doc.rect(rX, rY, rW, rH);

                    // Draw Page Number (Part 1..N) via pageIndex
                    const label = String(region.pageIndex + 1);

                    // Commit 1b: Ensure Label Visibility (Adaptive Placement)
                    doc.setFont("helvetica", "bold");

                    // Strategy 1: Center if fits
                    // Strategy 2: Scale down if small
                    // Strategy 3: Offset if tiny

                    let fontSize = 24;
                    let fitsInside = (rW > 15 && rH > 10);

                    if (rW < 20 || rH < 15) {
                        fontSize = 12; // Smaller font for small boxes
                        fitsInside = (rW > 8 && rH > 8);
                    }

                    doc.setFontSize(fontSize);

                    if (fitsInside) {
                        doc.text(label, rX + rW / 2, rY + rH / 2, { align: 'center', baseline: 'middle' });
                    } else {
                        // Warning: Region too small, place outside (top-left offset)
                        // Or just force it. On overview, overlapping adjacent cells is better than missing label.
                        // Let's force center but with shadow/stroke if meaningful?
                        // Simple fallback: Force render at center, minimal size 10.
                        doc.setFontSize(10);
                        doc.text(label, rX + rW / 2, rY + rH / 2, { align: 'center', baseline: 'middle' });
                    }
                    doc.setFont("helvetica", "normal");
                });

                // Reset
                doc.setDrawColor(0);
                doc.setTextColor(0);
                doc.setLineWidth(1);
            } else {
                // Single-page pattern: Draw red border around entire overview
                doc.setDrawColor(255, 0, 0); // Red
                doc.setLineWidth(2);
                const gridW = gridData.width * size;
                const gridH = gridData.height * size;
                doc.rect(startX, startY, gridW, gridH);

                // Reset
                doc.setDrawColor(0);
                doc.setLineWidth(1);
            }

            // Commit 1a: Footer metadata removed entirely.
        };

        const drawProjectHeader = (startY: number): number => {
            let cursorY = startY;

            // Title
            doc.setFontSize(24);
            doc.text(projectName, margin, cursorY);
            cursorY += 20;

            // Designer & Mode
            doc.setFontSize(12);
            if (branding.designerName) {
                doc.text(`Designed by ${branding.designerName}`, margin, cursorY);
            }
            if (isLeftHanded) {
                doc.setTextColor(150);
                doc.text('(Left-Handed Mode)', pageW - margin, cursorY, { align: 'right' });
                doc.setTextColor(0);
            }
            cursorY += 15;

            // Website (if exists, put under designer)
            if (branding.website) {
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(branding.website, margin, cursorY);
                doc.setTextColor(0);
                cursorY += 15;
            }

            // Stats
            doc.setFontSize(10);
            doc.text(`Dimensions: ${gridData.width} x ${gridData.height} stitches`, margin, cursorY);
            cursorY += 15;

            // Generated By
            doc.setTextColor(150);
            doc.text("Generated by BlanketSmith", margin, cursorY);
            cursorY += 15;

            // Copyright (Small, gray)
            if (branding.copyrightLine) {
                doc.setFontSize(8);
                doc.text(branding.copyrightLine, margin, cursorY);
                cursorY += 15;
            }

            doc.setTextColor(0);
            return cursorY + 10; // Padding
        };

        // --- CHART DRAWING HELPERS ---

        const drawConfiguredChart = (
            mode: 'color' | 'stitch' | 'hybrid',
            startX: number,
            startY: number,
            endX: number,
            endY: number,
            cellSize: number,
            pageTitle: string,
            yOffset: number
        ) => {
            const sliceW = endX - startX;
            const sliceH = endY - startY;

            // P2.3 Fix: explicit layout. yOffset is TOP of tile region.
            const titleY = yOffset + 10;
            const gridDrawY = yOffset + 30; // Reserve 30pt band for title

            const drawX = margin + 40; // Offset for row numbers
            const drawY = gridDrawY;

            // Title
            doc.setFontSize(10);
            doc.text(pageTitle, margin, titleY);

            // Rulers
            doc.setFontSize(PDF_CONFIG.fontSize.ruler);
            const showRulers = cellSize > 5;
            if (showRulers) {
                // Columns
                // Commit 1b: Unified Column Cadence Policy
                // Rule: Label every column if space allows (>= 10pt/char), else every 5, else 10.
                // cellText width approx: fontSize * 0.6. With '200', that's ~3 chars.
                // Let's use simple logic: if cellSize < 12, step 5. Else step 1.
                const colStep = (cellSize < 12) ? 5 : 1;

                for (let i = 0; i < sliceW; i++) {
                    const gridX = startX + i;
                    const colNum = gridX + 1;

                    // Always show first and multiples of step
                    // Actually, standard is usually "Multiples of X"
                    if (colNum % colStep === 0 || colNum === 1 || colNum === gridData.width) {
                        doc.text(String(colNum), drawX + (i + 0.5) * cellSize, drawY - 5, { align: 'center' });
                    }
                }
                // Rows
                for (let i = 0; i < sliceH; i++) {
                    const gridY = startY + i;
                    const rowNum = gridY + 1;
                    const isOdd = rowNum % 2 !== 0;
                    const showOnLeft = isLeftHanded ? !isOdd : isOdd;

                    if (showOnLeft) {
                        doc.text(String(rowNum), drawX - 5, drawY + (i + 0.5) * cellSize, { align: 'right', baseline: 'middle' });
                    } else {
                        doc.text(String(rowNum), drawX + (sliceW * cellSize) + 5, drawY + (i + 0.5) * cellSize, { align: 'left', baseline: 'middle' });
                    }
                }
            }

            doc.setLineWidth(0.5);
            doc.setDrawColor('#CCCCCC');

            // Draw Cells
            for (let y = 0; y < sliceH; y++) {
                for (let x = 0; x < sliceW; x++) {
                    const gridX = startX + x;
                    const gridY = startY + y;
                    const index = gridY * gridData.width + gridX;
                    const cell = gridData.grid[index];

                    const cx = drawX + x * cellSize;
                    const cy = drawY + y * cellSize;

                    // Background Logic
                    doc.setFillColor(255, 255, 255);
                    const hasColor = cell.colorId;
                    const c = hasColor ? yarnColorMap.get(cell.colorId!) : null;

                    if (mode === 'stitch') {
                        // Stitch Mode: Always white/pale background
                        doc.rect(cx, cy, cellSize, cellSize, 'FD');
                    } else {
                        // Color / Hybrid Mode
                        if (hasColor && c && chartVisual.showCellBackgrounds !== false) {
                            doc.setFillColor(c.hex);
                            doc.rect(cx, cy, cellSize, cellSize, 'FD');
                        } else {
                            doc.rect(cx, cy, cellSize, cellSize, 'S');
                        }
                    }

                    // Content Logic
                    if (chartVisual.showCellSymbols !== false) {
                        let cellText = "";
                        let textColor = "#000000";

                        if (mode === 'stitch') {
                            // Stitch Mode: Always black text, show symbol if stitchId
                            if (cell.stitchId) {
                                const s = stitchMap.get(cell.stitchId);
                                if (s) cellText = s.symbol;
                            }
                        } else if (mode === 'hybrid') {
                            // Hybrid: Show symbol if stitchId
                            if (cell.stitchId) {
                                const s = stitchMap.get(cell.stitchId);
                                if (s) cellText = s.symbol;
                            }
                            // Contrast calculation only if we have a background
                            if (c && chartVisual.showCellBackgrounds !== false) {
                                textColor = getTextColor(c.hex);
                            }
                        } else {
                            // Color Mode
                            if (chartVisual.symbolMode === 'stitch-symbol') {
                                if (cell.stitchId) {
                                    const s = stitchMap.get(cell.stitchId);
                                    if (s) cellText = s.symbol;
                                }
                            } else {
                                // Color Numbers (Default)
                                if (cell.colorId) {
                                    cellText = colorSymbolMap.get(cell.colorId!) || "";
                                }
                            }

                            if (c && chartVisual.showCellBackgrounds !== false) {
                                textColor = getTextColor(c.hex);
                            }
                        }

                        if (cellText) {
                            doc.setTextColor(textColor);
                            // Font Size
                            const fontSize = (mode === 'stitch' || chartVisual.symbolMode === 'stitch-symbol')
                                ? cellSize * 0.7
                                : cellSize * 0.6;
                            doc.setFontSize(Math.max(2, fontSize));

                            doc.text(
                                cellText,
                                cx + cellSize / 2,
                                cy + cellSize / 2,
                                { align: 'center', baseline: 'middle' }
                            );
                        }
                    }
                }
            }
            doc.setTextColor(0);
        };


        // 0. Pre-Calculation: Used Colors & Atlas Plan
        const usedColorsSet = new Set<string>();
        gridData.grid.forEach(c => { if (c.colorId) usedColorsSet.add(c.colorId); });
        const usedColorCount = usedColorsSet.size;

        // Unified Atlas Plan: Computed ONCE for the reference logic, used for all.
        const atlasPlan = predictAtlasLayout(gridData.width, gridData.height, atlasMode, atlasPages);

        // Flow State
        let currentY = margin;
        let hasContent = false;

        // 1. Cover Page
        if (includeCoverPage) {
            drawCoverPage();
            doc.addPage();
            // Now on P2 (Fresh)
            currentY = margin;
            hasContent = false;
        }

        // 2. Project Header (Only on Page 1 if no cover)
        if (!includeCoverPage) {
            // We are on P1.
            currentY = drawProjectHeader(margin + 20);
            hasContent = true;
        }

        // 3. Pattern Overview
        // Tri-State Placement Logic
        const showOverview = (overviewMode === 'always') || (overviewMode === 'auto' && atlasPlan.isMultiPage);

        if (showOverview) {
            let overviewStartY = currentY;
            let allowedHeight = PDF_CONFIG.overview.maxHeight;

            if (includeCoverPage) {
                // Already fresh P2. Just draw.
                overviewStartY = margin + 20;
                // Target-fill: Use 80% of available page height
                const availableHeight = pageH - overviewStartY - margin - PDF_CONFIG.overview.safetyBuffer;
                const targetHeight = availableHeight * PDF_CONFIG.overview.fillRatio;
                allowedHeight = Math.min(targetHeight, PDF_CONFIG.overview.maxHeight);
            } else {
                // No Cover. Header is on P1. Check fit.
                const spaceRemaining = pageH - currentY - margin;

                // Commit 1a: Enforce Layout Contract
                if (hasContent && spaceRemaining < PDF_CONFIG.overview.minHeight) {
                    // Not enough space -> Force New Page
                    doc.addPage();
                    overviewStartY = margin + 20;
                    currentY = overviewStartY;
                    // Target-fill on fresh page
                    const availableHeight = pageH - overviewStartY - margin - PDF_CONFIG.overview.safetyBuffer;
                    const targetHeight = availableHeight * PDF_CONFIG.overview.fillRatio;
                    allowedHeight = Math.min(targetHeight, PDF_CONFIG.overview.maxHeight);
                } else {
                    // Fit on current page with target-fill sizing
                    const availableHeight = spaceRemaining - PDF_CONFIG.overview.safetyBuffer;
                    const targetHeight = availableHeight * PDF_CONFIG.overview.fillRatio;
                    allowedHeight = Math.min(targetHeight, PDF_CONFIG.overview.maxHeight);
                    overviewStartY = currentY + 20;
                }
            }

            drawOverviewPage(overviewStartY, allowedHeight, atlasPlan.isMultiPage ? atlasPlan.regions : [], "Part");

            hasContent = true;
            // Move semantic cursor to bottom to encourage next section to break if needed
            // Current logic: we consumed 'allowedHeight' nominally? 
            // drawOverviewPage doesn't return Y.
            // We assume it takes the space. 
            // Simplest strategy: Set currentY to bottom margin to force next section to break if it relies on flow.
            // (This matches previous logic)
            currentY = pageH - margin;
        }

        // 4. Materials & Stitch Key (Unified Section)
        if (includeYarnRequirements) {
            // Space Check
            const spaceRemaining = pageH - currentY - margin;
            if (hasContent && spaceRemaining < 200) {
                doc.addPage();
                currentY = margin + 20;
            } else if (hasContent) {
                currentY += 20;
            } else {
                // clean start
                currentY = margin + 20;
            }

            // Determine if stitch keys / color symbols should be included
            let includeStitchKey = false;
            let includeColorSymbols = false;

            if (isChartOnly) {
                // Chart-Only
                includeStitchKey = (chartOnlyMode === 'stitch' || chartOnlyMode === 'hybrid');
                includeColorSymbols = (chartOnlyMode === 'color');
            } else {
                // Pattern Pack
                includeStitchKey = includeStitchChart || includeHybridChart;
                includeColorSymbols = includeColorChart;
            }

            const endY = drawMaterialsAndStitchKey(currentY, includeStitchKey, includeColorSymbols);
            currentY = endY;
            hasContent = true;
        }

        // 5. Instructions (Pattern Pack Only)
        // Engine-side Check: Explicitly check for 'includeInstructions' flag
        const includeInstructions = options.includeInstructions === true;

        if (includeInstructions && isPatternPack) {
            // ORPHAN GUARD & PLACEMENT LOGIC
            // Rule: Instructions follow Materials (potentially on same page).
            // Rule: Must have enough space for Header + some content to start.
            // We do NOT unconditionally break for Overview anymore. 
            // If Overview forced a new page, Materials started on that new page.
            // If Materials was short, we share. If long, we wrap.
            const MIN_INSTRUCTIONS_START_SPACE_PT = 140;
            const spaceRemaining = pageH - currentY - margin;

            if (spaceRemaining < MIN_INSTRUCTIONS_START_SPACE_PT) {
                doc.addPage();
                currentY = margin + 20;
            } else {
                // Standard Gap
                currentY += 20;
            }

            const rawDoc = options.instructionDoc;
            // Fallback Logic: Ensure we have a valid doc with blocks
            const effectiveDoc = (rawDoc && rawDoc.blocks && rawDoc.blocks.length > 0)
                ? rawDoc
                : {
                    title: 'Instructions',
                    blocks: [{ type: 'paragraph', content: ['No instructions provided.'] }]
                } as InstructionDoc;

            currentY = drawInstructionsSection(doc, currentY, pageH, margin, atlasPlan, effectiveDoc);
            hasContent = true;
        }

        // 6. Charts
        // Commit 1 Rule: All Charts always start on fresh page.
        type ChartRenderTask = { mode: 'color' | 'stitch' | 'hybrid'; title: string };
        const charts: ChartRenderTask[] = [];

        if (isChartOnly) {
            const title = (chartOnlyMode === 'stitch') ? "Stitch Chart" : "Chart";
            charts.push({ mode: chartOnlyMode, title });
        } else {
            if (includeColorChart) charts.push({ mode: 'color', title: "Color Chart" });
            if (includeStitchChart) charts.push({ mode: 'stitch', title: "Stitch Chart" });
            if (includeHybridChart) charts.push({ mode: 'hybrid', title: "Hybrid Chart" });
        }

        charts.forEach(task => {
            // Strict Fresh Page
            if (hasContent) {
                doc.addPage();
            }

            const regions = atlasPlan.regions;
            const cellSize = atlasPlan.cellSize;
            let lastPageIndex = -1;

            regions.forEach((region) => {
                // Handle Page Breaks within the Atlas
                if (region.pageIndex > lastPageIndex) {
                    if (lastPageIndex !== -1) {
                        doc.addPage();
                    }
                    lastPageIndex = region.pageIndex;
                }

                // Title Generation
                let pageTitle = task.title;
                if (atlasPlan.isMultiPage) {
                    pageTitle += ` - Part ${region.pageIndex + 1}`;
                }

                // Draw on Fresh Page (Standard Position)
                const drawY = margin + PDF_CONFIG.headerHeight;

                drawConfiguredChart(
                    task.mode,
                    region.startCol, region.startRow, region.endCol, region.endRow,
                    cellSize,
                    pageTitle,
                    drawY
                );
            });

            hasContent = true;
        });

        // 7. Stitch Legend (Removed - now integrated into Materials & Stitch Key section)
        // The stitch key is now included inline within the Materials & Stitch Key section
        // when stitch charts (Stitch or Hybrid) are present.

        if (options.preview) {
            const pdfBlob = doc.output('bloburl');
            window.open(pdfBlob, '_blank');
        } else {
            doc.save(`${projectName}.pdf`);
        }
        logger.info('PDF export successful', { projectName });
    } catch (error) {
        logger.error('Failed to export PDF', { error, projectName });
        notify.error('Failed to generate PDF. Please ensure your project data is valid.');
    }
};
