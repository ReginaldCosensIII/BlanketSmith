
// @ts-nocheck
import { PixelGridData, YarnColor, CellData, ExportType, BrandingOptions, ChartVisualOptions, ExportOptions } from '../types';
import { DEFAULT_STITCH_LIBRARY, StitchDefinition } from '../data/stitches';

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
    overview: {
        maxHeight: 400, // Max height clamp
        minHeight: 200, // Min height to fit on current page
    }
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

const buildColorSymbolMap = (yarnPalette: YarnColor[]): Map<string, string> => {
    const map = new Map<string, string>();
    yarnPalette.forEach((yarn, index) => {
        // yarn.id or name; pick a stable key used in cells:
        const key = yarn.id ?? yarn.name ?? String(index);
        const symbol = String(index + 1); // "1", "2", "3", ...
        map.set(key, symbol);
    });
    return map;
};

export const exportPixelGridToImage = (projectName: string, gridData: PixelGridData, yarnPalette: YarnColor[]) => {
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
};

export const exportPixelGridToPDF = (
    projectName: string,
    gridData: PixelGridData,
    yarnPalette: YarnColor[],
    yarnUsage: Map<string, number>,
    options: ExportOptions = {},
    projectSettings: any = {},
    isLeftHanded: boolean = false
) => {
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
        targetGridH: number
    ): AtlasPlan => {
        // Available space on a fresh page
        const availW = pageW - margin * 2 - 40; // -40 for row numbers
        const titleBand = 30; // Copied from internal logic
        const availH = pageH - margin * 2 - PDF_CONFIG.headerHeight - titleBand;

        // 1. Try Single Page Fit
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

        // 2. Atlas Fallback
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

    const drawYarnLegend = (startY: number): number => {
        let legendY = startY;
        doc.setFontSize(14);
        doc.text("Yarn Requirements", margin, legendY);
        legendY += 20;

        const swatchSize = 15;
        doc.setFontSize(10);

        const sortedYarns = gridData.palette
            .sort((a, b) => (yarnUsage.get(b) || 0) - (yarnUsage.get(a) || 0));

        // Header
        doc.setFont("helvetica", "bold");
        doc.text("Symbol", margin, legendY);
        doc.text("Color", margin + 40, legendY);
        doc.text("Details", margin + 165, legendY);
        doc.text("Usage", margin + 365, legendY);
        doc.setFont("helvetica", "normal");
        legendY += 15;

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

            // Symbol Box
            doc.setFillColor(yarn.hex);
            doc.setDrawColor(0);
            const symbol = colorSymbolMap.get(yarn.id) || "?";
            doc.rect(margin, legendY, swatchSize, swatchSize);
            doc.text(symbol, margin + swatchSize / 2, legendY + 11, { align: 'center' });

            // Color Swatch
            const [r, g, b] = yarn.rgb;
            doc.setFillColor(r, g, b);
            doc.rect(margin + 40, legendY, swatchSize, swatchSize, 'F');
            doc.rect(margin + 40, legendY, swatchSize, swatchSize, 'S');

            // Text Info
            doc.text(`${yarn.name}`, margin + 65, legendY + 11);
            doc.setFontSize(8);
            doc.text(`${yarn.brand} | ${yarn.yarnWeight || 'DK'}`, margin + 165, legendY + 11);
            doc.setFontSize(10);
            doc.text(`${count} sts  |  ${totalYards} yds  |  ${skeinsNeeded} skein${skeinsNeeded !== 1 ? 's' : ''}`, margin + 365, legendY + 11);

            legendY += 25;
        });

        return legendY;
    };

    const drawHybridLegend = (startY: number): number => {
        let legendY = startY;
        doc.setFontSize(14);
        doc.text("Materials & Stitch Key", margin, legendY);
        legendY += 20;

        const swatchSize = 15;
        doc.setFontSize(10);

        const sortedYarns = gridData.palette
            .sort((a, b) => (yarnUsage.get(b) || 0) - (yarnUsage.get(a) || 0));

        // Hybrid Header: No "Symbol" Column. Start with Color Swatch.
        doc.setFont("helvetica", "bold");
        // Layout: Swatch(margin) -> Color Name(margin+20) -> Details(margin+130) -> Usage(margin+330)
        doc.text("Color", margin, legendY);
        doc.text("Details", margin + 130, legendY);
        doc.text("Usage", margin + 330, legendY);
        doc.setFont("helvetica", "normal");
        legendY += 15;

        // 1. Yarn Table
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

            // Color Swatch (No Symbol)
            const [r, g, b] = yarn.rgb;
            doc.setFillColor(r, g, b);
            doc.rect(margin, legendY, swatchSize, swatchSize, 'F');
            doc.rect(margin, legendY, swatchSize, swatchSize, 'S'); // Border

            // Text Info
            doc.text(`${yarn.name}`, margin + 25, legendY + 11);
            doc.setFontSize(8);
            doc.text(`${yarn.brand} | ${yarn.yarnWeight || 'DK'}`, margin + 130, legendY + 11);
            doc.setFontSize(10);
            doc.text(`${count} sts  |  ${totalYards} yds  |  ${skeinsNeeded} skein${skeinsNeeded !== 1 ? 's' : ''}`, margin + 330, legendY + 11);

            legendY += 25;
        });

        // 2. Integrated Stitch Key (Compact)
        const usedStitches = new Set<string>();
        gridData.grid.forEach(cell => {
            if (cell.stitchId) usedStitches.add(cell.stitchId);
        });

        if (usedStitches.size > 0) {
            legendY += 10;
            // Check for space
            if (legendY > pageH - margin - 50) { // arbitrary buffer
                doc.addPage();
                legendY = margin;
            }

            doc.setFont("helvetica", "bold");
            doc.text("Stitch Key:", margin, legendY);
            doc.setFont("helvetica", "normal");

            // Inline/Compact list: "X = Single Crochet, % = Double Crochet"
            // Or simple vertical list if space allows. Let's do a simple vertical table for clarity.
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
        const availW = pageW - margin * 2;
        // Commit 1a: Enforce explicit max height constraint
        const availH = maxContentHeight - 40; // -40 for title space (approx)

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
                // Commit 1 Rule: Lock to Reference Chart Page Sequence
                const label = String(region.pageIndex + 1);

                // Check if box is big enough for text
                if (rW > 15 && rH > 10) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(24);
                    doc.text(label, rX + rW / 2, rY + rH / 2, { align: 'center', baseline: 'middle' });
                    doc.setFont("helvetica", "normal");
                }
            });

            // Reset
            doc.setDrawColor(0);
            doc.setTextColor(0);
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
            for (let i = 0; i < sliceW; i++) {
                const gridX = startX + i;
                if (i % 5 === 0 || isChartOnly)
                    doc.text(String(gridX + 1), drawX + (i + 0.5) * cellSize, drawY - 5, { align: 'center' });
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

    // --- MAIN EXECUTION LOGIC (Canonical Flow) ---

    // 0. Pre-Calculation: Used Colors & Atlas Plan
    const usedColorsSet = new Set<string>();
    gridData.grid.forEach(c => { if (c.colorId) usedColorsSet.add(c.colorId); });
    const usedColorCount = usedColorsSet.size;

    // Unified Atlas Plan: Computed ONCE for the reference logic, used for all.
    const atlasPlan = predictAtlasLayout(gridData.width, gridData.height);

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
            // On fresh page, we layout with standard max height
        } else {
            // No Cover. Header is on P1. Check fit.
            const spaceRemaining = pageH - currentY - margin;

            // Commit 1a: Enforce Layout Contract
            if (hasContent && spaceRemaining < PDF_CONFIG.overview.minHeight) {
                // Not enough space -> Force New Page
                doc.addPage();
                overviewStartY = margin + 20;
                currentY = overviewStartY;
                // allowedHeight remains default max
            } else {
                // Fit on current page, but clamp to max
                // Also clamp to remaining space? (If remaining < max, but > min)
                // Actually, if we are here, spaceRemaining >= minHeight.
                // We should use min(spaceRemaining, max) to be safe? 
                // Or just max? If max > spaceRemaining, it might overflow page.
                // Better to clamp to spaceRemaining to be safe, though visually we prefer regular size.
                // Let's use standard logic: 
                allowedHeight = Math.min(spaceRemaining, PDF_CONFIG.overview.maxHeight);
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

    // 4. Yarn Requirements / Legends (Non-Chart)
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

        // Logic for Hybrid Legend selection
        let useHybridLegend = false;
        if (isChartOnly) {
            useHybridLegend = (chartOnlyMode === 'hybrid');
        } else {
            // Pattern Pack: Hybrid Chart OR (Color Chart + Stitch Symbols)
            const isHybridEffective = includeColorChart &&
                chartVisual.showCellSymbols &&
                chartVisual.symbolMode === 'stitch-symbol';
            useHybridLegend = isHybridEffective || includeHybridChart;
        }

        let endY = 0;
        if (useHybridLegend) {
            endY = drawHybridLegend(currentY);
        } else {
            endY = drawYarnLegend(currentY);
        }
        currentY = endY;
        hasContent = true;
    }

    // 5. Instructions (Reserved Slot)
    // if (instructionsMode !== 'none') { ... }

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

    // 7. Stitch Legend (Stable)
    if (includeStitchLegend) {
        drawStitchLegend();
    }

    if (options.preview) {
        const pdfBlob = doc.output('bloburl');
        window.open(pdfBlob, '_blank');
    } else {
        doc.save(`${projectName}.pdf`);
    }
};
