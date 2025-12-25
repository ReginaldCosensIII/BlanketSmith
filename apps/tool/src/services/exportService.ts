
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

    // --- OPTION NORMALIZATION (V2 Spec) ---
    const exportType: ExportType = options.exportType || (options.forceSinglePage ? 'chart-only' : 'pattern-pack');
    const isChartOnly = exportType === 'chart-only';
    const isPatternPack = exportType === 'pattern-pack';

    const branding: BrandingOptions = options.branding || {};

    // Layout Flags
    const includeCoverPage = options.includeCoverPage ?? false;
    const includeOverview = options.includeOverviewPage ?? false;
    // Pattern Pack uses dedicated toggles; Chart-Only uses passed toggle which defaults to false in UI
    const includeYarnRequirements = options.includeYarnRequirements ?? (isPatternPack ? true : false);
    const includeStitchLegend = options.includeStitchLegend ?? (isPatternPack ? true : false);
    const includeColorChart = isPatternPack ? (options.includeColorChart ?? true) : false;
    const includeStitchChart = isPatternPack ? (options.includeStitchChart ?? false) : false;

    // Chart Mode & Visuals
    // For Chart-Only: Use explicit mode ('color', 'stitch', 'hybrid').
    // For Pattern Pack: Mode is derived from the drawing loop (Color vs Stitch).
    const chartOnlyMode = options.chartMode || 'color';

    const chartVisual: ChartVisualOptions = {
        showCellSymbols: options.chartVisual?.showCellSymbols ?? true,
        showCellBackgrounds: options.chartVisual?.showCellBackgrounds ?? true,
        symbolMode: options.chartVisual?.symbolMode ?? 'color-index',
    };

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

    const drawOverviewPage = (customStartY?: number, atlasRegions: AtlasRegion[] = [], labelPrefix: string = "Part") => {
        // Doc page addition handled by caller
        doc.setFontSize(16);
        const titleY = customStartY ?? (margin + 20);
        doc.text("Pattern Overview", margin, titleY);

        // V2 MVP: Simplified one-page centered grid
        // P2 Fix: Anchor Footer to Bottom
        const footerSpace = 60;
        const availW = pageW - margin * 2;
        const availH = pageH - titleY - 20 - footerSpace; // titleY + 20 is top of grid

        const cellW = availW / gridData.width;
        const cellH = availH / gridData.height;
        const size = Math.min(cellW, cellH);

        const startX = margin + (availW - (gridData.width * size)) / 2;
        const startY = titleY + 20;

        // Draw simple colored grid
        // PERFORMANCE: If grid is massive (100x200), drawing thousands of rects is slow.
        // But for 60x60 (3600), it's fine.
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

        // P2 Fix: Atlas Overlays
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

                // Draw Page Number (Center of Box)
                // P2 Polish: Simple Number, Bold, Large
                const label = String(i + 1); // just "1", "2"

                // Check if box is big enough for text?
                if (rW > 15 && rH > 10) {
                    doc.setFont("helvetica", "bold");
                    // Dynamic size? Or just big.
                    // Max size that fits box? Or fixed large.
                    doc.setFontSize(24); // Bold and visible

                    // Center
                    doc.text(label, rX + rW / 2, rY + rH / 2, { align: 'center', baseline: 'middle' });

                    // Reset font
                    doc.setFont("helvetica", "normal");
                }
            });

            // Reset
            doc.setDrawColor(0);
            doc.setTextColor(0);
            doc.setLineWidth(1);
        }

        // Stats Metadata (Anchored to Bottom)
        doc.setFontSize(10);
        doc.setTextColor(100);
        const metaY = pageH - margin - 30; // 30pt from bottom margin
        doc.text(`Dimensions: ${gridData.width} x ${gridData.height}`, margin, metaY);
        doc.text(`Colors: ${yarnPalette.length}`, margin, metaY + 15);
        doc.setTextColor(0);
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

    // --- MAIN EXECUTION LOGIC ---

    // 1. Cover Page
    let hasContent = false;

    if (includeCoverPage) {
        // Always first
        drawCoverPage();
        hasContent = true;
    }

    if (isChartOnly) {
        // --- CHART ONLY LAYOUT ---
        // Page 1 is currently either the Cover Page (if drawn) or a fresh page.

        if (includeCoverPage) {
            // Fix: Cover Page is P1. Force P2 for Chart layout.
            doc.addPage();
            hasContent = true;
        } else {
            // Fix: No Cover Page. Header is on P1.
            // Check if we need a new page? No, we just started P1 roughly.
            hasContent = true;
        }

        const availHeight = pageH - margin * 2 - 40; // Title margin
        let startY = margin + 40;
        let chartStartY = startY;

        // Branding Header (if no cover page)
        if (!includeCoverPage) {
            chartStartY = drawProjectHeader(margin + 20);
        } else {
            // Cover page exists and we already successfully added P2.
            // Start fresh at top margin.
            chartStartY = margin + 20;
        }

        // P2: Overview Page Integration (Chart-Only)
        if (includeOverview) {
            // 1. Calculate Future Layout to know about Atlas
            const testAvailW = pageW - margin * 2 - 40;
            const testAvailH = pageH - chartStartY - margin;

            // Replicate Sizing Choice
            const cellW = testAvailW / gridData.width;
            const cellH = testAvailH / gridData.height;
            let testCellSize = Math.min(cellW, cellH);

            // Logic Matches Line 873
            // If shrinking below threshold, assume atlas (clamped to minCellSize)
            const minSingle = PDF_CONFIG.minSinglePageCellSize || 12;
            let isAtlas = false;

            if (testCellSize < minSingle) {
                // Check Fresh Page Candidate (P2.2) logic...
                const freshAvailH = pageH - margin * 2 - PDF_CONFIG.headerHeight;
                const freshCellH = freshAvailH / gridData.height;
                const freshCellSize = Math.min(cellW, freshCellH);

                if (freshCellSize >= minSingle) {
                    // Will fit fresh. Not Atlas.
                    isAtlas = false;
                } else {
                    // Will fall back to Atlas.
                    isAtlas = true;
                    testCellSize = PDF_CONFIG.minCellSize; // 18
                }
            }

            // 2. Calculate Regions if Atlas
            let regions: AtlasRegion[] = [];
            if (isAtlas) {
                // P2.3: Force Fresh Page logic implies startOnFreshPage is true for atlas if yarn is present.
                // Or if we ran out of space.
                // Simplification: In Chart Only, if we hit Atlas, we usually assume flow.
                // But calculateAtlasRegions needs explicit start.
                // We pass 'includeYarnRequirements' as proxy for "Will Force Fresh Page".
                // Even if no Yarn, we effectively start at "chartStartY" which is top-of-area.
                // And calculateAtlasRegions handles the "first page shorter" logic if passed startOnFreshPage=false.
                // So:
                const effectiveStartOnFresh = includeYarnRequirements ? true : false;

                regions = calculateAtlasRegions(
                    gridData.width,
                    gridData.height,
                    testAvailW,
                    pageH,
                    margin,
                    PDF_CONFIG.headerHeight,
                    testCellSize,
                    effectiveStartOnFresh,
                    chartStartY
                );
            }

            // 3. Render Overview
            // If Cover Page exists, we are on P2. If not, P1.
            // drawOverviewPage assumes we are on the correct page.
            // But wait, if Cover Page exists, we just added P2 above (Line 801).
            // So we are good.

            // If no Cover Page, we are on P1.
            // So existing content (header) is there.
            // drawOverviewPage(customStartY) handles titleY.

            drawOverviewPage(chartStartY, regions, "Chart - Part");

            // 4. Force Page Break for Next Section (Yarn or Chart)
            // Overview takes a full page usually.
            doc.addPage();
            chartStartY = margin + 20; // Reset for next content

            // If No Cover, we might need to redraw header?
            // "If includeCoverPage is false, Overview should still be page 1... or page 2"
            // If P1 has header -> Overview -> New Page.
            // The Next Page (P2) needs a header if it's Yarn/Chart?
            // Usually internal pages get standard header. 
            // Our logic handles internal pages?
            // Yarn Legend handles bounds.
            // Chart handles bounds.
            // So we just reset chartStartY to top margin.
        }


        if (includeYarnRequirements) {
            const legendH = measureYarnLegendHeight();
            const spaceRemaining = pageH - chartStartY - margin;

            // Draw Legend
            // Fix: Use Hybrid Legend if chart mode is hybrid
            let newY = 0;
            if (chartOnlyMode === 'hybrid') {
                newY = drawHybridLegend(chartStartY);
            } else {
                newY = drawYarnLegend(chartStartY);
            }

            const remainingForChart = pageH - newY - margin;

            // If remaining space is very small (e.g. < 200pt), page break.
            if (remainingForChart < 200) {
                doc.addPage();
                chartStartY = margin + 40;
            } else {
                chartStartY = newY + 20;
            }
        }

        // Draw The One Chart
        const availChartW = pageW - margin * 2 - 40; // -40 for row numbers
        const availChartH = pageH - chartStartY - margin;

        // Calculate Cell Size to fit
        const cellW = availChartW / gridData.width;
        const cellH = availChartH / gridData.height;
        let cellSize = Math.min(cellW, cellH);

        // Fix: P1 Fit-to-Page Logic & P1.5 Atlas Support
        const candidateSize = Math.floor(cellSize);
        let forceSinglePage = false;

        if (candidateSize >= PDF_CONFIG.minSinglePageCellSize) {
            // Fit-to-Page Success
            cellSize = candidateSize;
            forceSinglePage = true;
        } else {
            // P2.2: Legend Forcing Atlas Fix
            // Calculate candidate if we force a fresh page
            const fullPageH = pageH - margin * 2 - PDF_CONFIG.headerHeight; // Standard Page Height for Fresh Page
            const freshCellW = (pageW - margin * 2 - 40) / gridData.width;
            const freshCellH = fullPageH / gridData.height;
            const freshCandidate = Math.floor(Math.min(freshCellW, freshCellH));

            if (freshCandidate >= PDF_CONFIG.minSinglePageCellSize) {
                doc.addPage();
                chartStartY = margin + PDF_CONFIG.headerHeight; // Reset StartY for fresh page
                cellSize = freshCandidate;
                forceSinglePage = true;
            } else {
                // P1.5: Atlas Fallback
                // If we can't fit on one page at 12pt, we use Atlas at standard min size (18pt)
                cellSize = Math.max(PDF_CONFIG.minCellSize, Math.min(cellW, cellH));
            }
        }

        if (forceSinglePage) {
            // Single Page Render
            drawConfiguredChart(
                chartOnlyMode,
                0, 0, gridData.width, gridData.height,
                cellSize,
                "", // No sub-title
                chartStartY
            );
        } else {
            // Multi-Page Atlas Render
            const finalCellSize = cellSize;

            // P2.3: Force Fresh Page if Yarn Requirements present
            if (includeYarnRequirements) {
                doc.addPage();
                chartStartY = margin + PDF_CONFIG.headerHeight;
            }

            // Calculate Layout
            const availW = availChartW;

            // Heights MUST account for the new 30pt Title Band in drawConfiguredChart
            const titleBand = 30;

            // Page 1 Height
            const page1H = pageH - chartStartY - margin - titleBand;
            // Subsequent Page Height
            const fullPageH = pageH - margin * 2 - PDF_CONFIG.headerHeight - titleBand;

            // Tiles
            const cellsPerW = Math.floor(availW / finalCellSize);
            const cellsPerH_P1 = Math.floor(page1H / finalCellSize);
            const cellsPerH_Full = Math.floor(fullPageH / finalCellSize);

            let currentY = 0; // Grid row index
            let pageIndex = 0;

            while (currentY < gridData.height) {
                const isFirstRowOfTiles = (currentY === 0);
                // Note: If we Forced Fresh Page, Page 1 behaves like a Full Page conceptually, 
                // but our variable `page1H` handles the `chartStartY` (which we reset to headerHeight).
                // So the logic holds.

                const tileRowsH = (currentY === 0) ? cellsPerH_P1 : cellsPerH_Full;
                const rowsToRender = Math.min(tileRowsH, gridData.height - currentY);
                if (rowsToRender <= 0) break;

                // Iterate Columns
                let currentX = 0;
                while (currentX < gridData.width) {
                    const colsToRender = Math.min(cellsPerW, gridData.width - currentX);

                    if (currentY > 0 || currentX > 0) {
                        doc.addPage();
                    }

                    // Determine Draw Y
                    // P2.3: drawConfiguredChart adds the band internally. 
                    // We just pass the Top of Region.
                    const drawY = (currentY === 0) ? chartStartY : margin + PDF_CONFIG.headerHeight;

                    // Title
                    const tileLabel = `Chart - Part ${pageIndex + 1}`;

                    // Draw
                    drawConfiguredChart(
                        chartOnlyMode,
                        currentX, currentY,
                        currentX + colsToRender,
                        currentY + rowsToRender,
                        finalCellSize,
                        tileLabel,
                        drawY
                    );

                    currentX += colsToRender;
                    pageIndex++;
                }

                currentY += rowsToRender;
            }
        }

        if (includeStitchLegend) {
            drawStitchLegend();
        }

    } else {
        // --- PATTERN PACK LAYOUT ---
        // Cover -> Overview -> Yarn -> Charts -> Legends

        let packCursorY = margin + 20;

        if (!includeCoverPage) {
            // If no cover page, we are on Page 1. Draw header.
            packCursorY = drawProjectHeader(margin + 20);
            hasContent = true;
        } else {
            // Fix: Cover Page exists (P1). We MUST add P2 now.
            doc.addPage();
            packCursorY = margin + 20;
            hasContent = true;
        }

        // 2. Pattern Overview
        if (includeOverview) {
            let overviewY = margin + 20;

            if (!includeCoverPage && hasContent) {
                // No cover page, Header drawn on P1.
                overviewY = packCursorY + 10;
            } else if (includeCoverPage && hasContent) {
                // Cover page exists. Logic above (Line ~1070) ALREADY added a page (P2).
                // So we are currently at the top of P2.
                // DO NOT add another page here.
                overviewY = margin + 20;
            }

            // P2: Pattern Pack Atlas regions calculation
            let regions: AtlasRegion[] = [];
            let labelPrefix = "Part";

            // Priority for Overlay: Color Chart > Stitch Chart
            // Only if validation passed (e.g. stitches exist)
            const canDoColor = includeColorChart;
            const canDoStitch = includeStitchChart && gridData.includeStitches;

            let simAvailH = pageH - margin * 2 - 40; // Full page assumption for Charts (they break page)
            const simAvailW = pageW - margin * 2 - 40;

            // Beta Stability Rule: Charts start on Fresh Page. 
            // So we use simAvailH = full page height (minus header).
            const startOnFresh = true;
            const simStartY = margin + PDF_CONFIG.headerHeight;

            if (canDoColor) {
                labelPrefix = "Color";
                // Simulate Color Chart Layout
                // Logic: Line 1160+
                // Calculate Cell Size
                const cellW = simAvailW / gridData.width;
                const cellH = simAvailH / gridData.height;
                let testCellSize = Math.min(cellW, cellH);

                // Atlas Logic Check
                const minSingle = PDF_CONFIG.minSinglePageCellSize || 12;
                let isAtlas = false;

                // Fit check logic mirrors Line 1160 Fit-On-Fresh check
                if (testCellSize < minSingle) {
                    // Atlas fallback
                    isAtlas = true;
                    testCellSize = PDF_CONFIG.minCellSize; // 18
                }

                if (isAtlas) {
                    regions = calculateAtlasRegions(
                        gridData.width,
                        gridData.height,
                        simAvailW,
                        pageH,
                        margin,
                        PDF_CONFIG.headerHeight,
                        testCellSize,
                        startOnFresh,
                        simStartY
                    );
                }

            } else if (canDoStitch) {
                labelPrefix = "Stitch";
                // Simulate Stitch Chart Layout
                // Logic: Line 1290+
                const cellW = simAvailW / gridData.width;
                const cellH = simAvailH / gridData.height;
                let testCellSize = Math.min(cellW, cellH);

                const minSingle = PDF_CONFIG.minSinglePageCellSize || 12;
                let isAtlas = false;

                if (testCellSize < minSingle) {
                    isAtlas = true;
                    testCellSize = PDF_CONFIG.minCellSize;
                }

                if (isAtlas) {
                    regions = calculateAtlasRegions(
                        gridData.width,
                        gridData.height,
                        simAvailW,
                        pageH,
                        margin,
                        PDF_CONFIG.headerHeight,
                        testCellSize,
                        startOnFresh,
                        simStartY
                    );
                }
            }

            drawOverviewPage(overviewY, regions, labelPrefix);
            hasContent = true;

            // Mark page as used
            packCursorY = pageH - margin;
        }

        // 3. Yarn Requirements
        // 3. Yarn Requirements (Or Materials & Stitch Key for Hybrid)
        if (includeYarnRequirements) {
            let yarnY = margin + 20;
            let shouldAddPage = false;

            // Check for Effective Hybrid Mode in Pattern Pack
            // Criteria: Include Color Chart AND Symbols Enabled AND Mode is Stitch-Symbol
            const isHybridEffective = includeColorChart &&
                chartVisual.showCellSymbols &&
                chartVisual.symbolMode === 'stitch-symbol';

            if (packCursorY < pageH - margin - 100) {
                // Suggests we have space on current page?
                // PackCursorY is only set by Header or Overview.
                // If Overview ran, it's full.
                // If Header ran (no Overview), we have space.
                yarnY = packCursorY + 10;
            } else if (hasContent) {
                shouldAddPage = true;
            }

            if (shouldAddPage) {
                doc.addPage();
                yarnY = margin + 20;
            }

            let endY = 0;
            if (isHybridEffective) {
                endY = drawHybridLegend(yarnY);
            } else {
                endY = drawYarnLegend(yarnY);
            }

            packCursorY = endY;
            hasContent = true;
        }

        // 4. Color Charts (Color or Hybrid)
        if (includeColorChart) {
            // Check if we can fit at least one row of chart?
            // Need to estimate cell size.
            const availW = pageW - margin * 2 - 40;
            const availH_Full = pageH - margin * 2 - 60;

            // Preliminary calculation of cell size to see if it fits remaining space
            let predictedCellSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / gridData.width, availH_Full / gridData.height));

            // If multi-page atlas needed, we likely want a fresh page to start?
            // But user says: "if we can fit the Yarn Requirement section and the next chart on the same page we should do so".
            // So let's check remaining height.
            const spaceRemaining = pageH - packCursorY - margin;

            // If we have > 30% of page, try to fit?
            // Or check if grid height * predictedCellSize fits?
            const neededH = (gridData.height * predictedCellSize) + 60; // + title/margin

            if (hasContent && (spaceRemaining < 200 || neededH > spaceRemaining)) {
                doc.addPage();
                packCursorY = margin + 20;
            } else {
                // Fit on current page
                packCursorY += 20;
            }

            // Now run the loop, but constrained by startY?
            // The Atlas Loop below assumes full page logic for multi-page.
            // If we fit on one page, great.
            // If we need multi-page, we should probably start fresh page unless the FIRST part fits?
            // Let's adapt the atlas loop to use `packCursorY` as startY for the FIRST iteration.

            let finalCellSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / gridData.width, (pageH - packCursorY - margin) / gridData.height));

            // Fix: P1 Fit-to-Page Logic (Color Chart)
            const fitCandidate = Math.floor(Math.min(availW / gridData.width, (pageH - packCursorY - margin) / gridData.height));
            let forceSinglePage = false;

            if (fitCandidate >= PDF_CONFIG.minSinglePageCellSize) {
                finalCellSize = fitCandidate;
                forceSinglePage = true;
            }

            // Recalculate if it falls below min (and not forced)
            if (!forceSinglePage && finalCellSize < PDF_CONFIG.minCellSize) {
                // Too small for remaining space. 
                // If we were trying to fit on current page, give up and add page.
                // If we already added page, then it's just a multi-page large chart.
                if (packCursorY > margin + 50) { // If not fresh page
                    doc.addPage();
                    packCursorY = margin + 20;
                    // Recalculate for full page
                    finalCellSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / gridData.width, availH_Full / gridData.height));

                    // Re-check Fit-to-Page on full fresh page
                    const fitCandidateFresh = Math.floor(Math.min(availW / gridData.width, availH_Full / gridData.height));
                    if (fitCandidateFresh >= PDF_CONFIG.minSinglePageCellSize) {
                        finalCellSize = fitCandidateFresh;
                        forceSinglePage = true;
                    }
                }
            }

            if (finalCellSize < PDF_CONFIG.minCellSize && !forceSinglePage) {
                finalCellSize = PDF_CONFIG.minCellSize; // enforce min, use Atlas
            }

            const cellsPerW = Math.floor(availW / finalCellSize);
            const cellsPerH = Math.floor((pageH - margin * 2 - 60) / finalCellSize); // Use full page height for slicing calc

            // First page might have less height if we are appending?
            // This complicates Atlas significantly. 
            // Simplified approach: If it fits in one block, use packCursorY.
            // If it requires splitting, ALWAYS Start fresh page for consistent tiling.

            let isMultiPage = false;
            if (!forceSinglePage) {
                isMultiPage = (gridData.width > cellsPerW || gridData.height > Math.floor((pageH - packCursorY - margin) / finalCellSize));
            }

            if (isMultiPage && packCursorY > margin + 50) {
                doc.addPage();
                packCursorY = margin + 20;
            }

            // Re-calc atlas vars with final decision
            const availH_Current = pageH - packCursorY - margin;
            const cellsPerH_Current = Math.floor(availH_Current / finalCellSize);
            // Note: If multi-page, subsequent pages use full height.
            // This loop needs to handle variable height? 
            // V2 Atlas logic usually assumes uniform pages.
            // A truly robust "Flowing Atlas" is complex. 
            // I will use "Start new page if MultiPage". 
            // "Fit on current page if SinglePage".

            // ... (Logic simplified for reliability) ...

            // Re-calculate simply:
            const fitOnCurrent = !isMultiPage;
            const startY = packCursorY;

            let pagesX = Math.ceil(gridData.width / cellsPerW);
            let pagesY = Math.ceil(gridData.height / (fitOnCurrent ? cellsPerH_Current : Math.floor((pageH - margin * 2 - 60) / finalCellSize)));

            // Correction: If we accepted to fit on current, pagesY should be 1.
            if (fitOnCurrent) pagesY = 1;

            const effectiveMode = (chartVisual.symbolMode === 'stitch-symbol' && chartVisual.showCellSymbols) ? 'hybrid' : 'color';

            for (let py = 0; py < pagesY; py++) {
                for (let px = 0; px < pagesX; px++) {
                    const isFirstOfBlock = (px === 0 && py === 0);
                    if (!isFirstOfBlock) doc.addPage();

                    // If strictly new page needed (not first block OR first block but we forced new page above)
                    // The above logic handled doc.addPage() for fresh start.
                    // But if pagesY > 1, subsequent rows need new page.

                    const currentTitleY = (isFirstOfBlock) ? startY + 20 : margin + 40;
                    // drawConfiguredChart takes yOffset (top of chart area).

                    const thisPageCellsH = (isFirstOfBlock) ? cellsPerH_Current : Math.floor((pageH - margin * 2 - 60) / finalCellSize);

                    const startX_Idx = px * cellsPerW;
                    const endX_Idx = Math.min(startX_Idx + cellsPerW, gridData.width);

                    // Atlas indexing calc is tricky if pages differ. 
                    // To simplify: If MultiPage, we forced New Page above, so all pages are uniform height.
                    // If SinglePage, there is only 1 page.
                    // So we can assume uniform height *except* if fitOnCurrent=true (which means pagesY=1).

                    // If fitOnCurrent, standard loops work (py=0). 
                    // If !fitOnCurrent, we forced full page.
                    // So standard logic applies.

                    const stdCellsPerH = Math.floor((pageH - margin * 2 - 60) / finalCellSize);
                    const sY = py * stdCellsPerH;
                    const eY = Math.min(sY + stdCellsPerH, gridData.height);
                    const sX = px * cellsPerW;
                    const eX = Math.min(sX + cellsPerW, gridData.width);

                    const title = (pagesX > 1 || pagesY > 1) ? `Color Chart - Page ${py * pagesX + px + 1}` : "Color Chart";

                    // If fitOnCurrent, use startY (packCursorY). Else use margin+40 (fresh page).
                    const drawY = (fitOnCurrent) ? startY + 20 : margin + 40;

                    drawConfiguredChart(effectiveMode, sX, sY, eX, eY, finalCellSize, title, drawY);

                    if (isFirstOfBlock) {
                        // Update cursor only for the *last* block rendered?
                        // If multi-page, this is loop.
                    }
                }
            }

            // Update packCursorY after chart
            if (fitOnCurrent) {
                packCursorY = startY + 20 + (gridData.height * finalCellSize) + 20;
            } else {
                packCursorY = pageH - margin;
            }
            hasContent = true;
        }

        // 5. Stitch Charts
        if (includeStitchChart) {
            // Logic identical to Color Chart copy-paste
            // Check space for Single Page Fit
            const availW = pageW - margin * 2 - 40;
            const availH_Full = pageH - margin * 2 - 60;
            let finalCellSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / gridData.width, availH_Full / gridData.height));

            const spaceRemaining = pageH - packCursorY - margin;

            // Check needed height
            const neededH = (gridData.height * finalCellSize) + 60;

            if (hasContent && (spaceRemaining < 200 || neededH > spaceRemaining)) {
                doc.addPage();
                packCursorY = margin + 20;
            } else {
                packCursorY += 20;
            }

            // Recalc size based on new constraint (packCursorY)
            let constrainedMaxH = pageH - packCursorY - margin;
            // But if we are starting fresh page, maxH is full.
            // If we appended, maxH is smaller.

            let currentSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / gridData.width, constrainedMaxH / gridData.height));

            // Fix: P1 Fit-to-Page Logic (Stitch Chart)
            const fitStitchCandidate = Math.floor(Math.min(availW / gridData.width, constrainedMaxH / gridData.height));
            let forceSinglePageStitch = false;

            if (fitStitchCandidate >= PDF_CONFIG.minSinglePageCellSize) {
                currentSize = fitStitchCandidate;
                forceSinglePageStitch = true;
            }

            if (!forceSinglePageStitch && currentSize < PDF_CONFIG.minCellSize) {
                // Too small for remaining space. Force new page if we haven't already.
                if (packCursorY > margin + 50) {
                    doc.addPage();
                    packCursorY = margin + 20;
                    // Recalc standard full page size
                    currentSize = Math.max(PDF_CONFIG.minCellSize, Math.min(availW / gridData.width, availH_Full / gridData.height));

                    // Check Fit on Fresh Page
                    const fitFresh = Math.floor(Math.min(availW / gridData.width, availH_Full / gridData.height));
                    if (fitFresh >= PDF_CONFIG.minSinglePageCellSize) {
                        currentSize = fitFresh;
                        forceSinglePageStitch = true;
                    }
                }
            }

            if (currentSize < PDF_CONFIG.minCellSize && !forceSinglePageStitch) {
                currentSize = PDF_CONFIG.minCellSize;
            }
            finalCellSize = currentSize;

            const cellsPerW = Math.floor(availW / finalCellSize);
            const stdCellsPerH = Math.floor((pageH - margin * 2 - 60) / finalCellSize);

            let isMultiPage = false;
            if (!forceSinglePageStitch) {
                isMultiPage = (gridData.width > cellsPerW || gridData.height > Math.floor((pageH - packCursorY - margin) / finalCellSize));
            }

            if (isMultiPage && packCursorY > margin + 50) {
                doc.addPage();
                packCursorY = margin + 20;
                // Now it's full page multi-page
            }

            const fitOnCurrent = !isMultiPage;

            if (fitOnCurrent) {
                drawConfiguredChart('stitch', 0, 0, gridData.width, gridData.height, finalCellSize, "Stitch Chart", packCursorY + 20);
                packCursorY = packCursorY + 20 + (gridData.height * finalCellSize) + 20;
            } else {
                let pagesX = Math.ceil(gridData.width / cellsPerW);
                let pagesY = Math.ceil(gridData.height / stdCellsPerH);
                for (let py = 0; py < pagesY; py++) {
                    for (let px = 0; px < pagesX; px++) {
                        if (px > 0 || py > 0) doc.addPage();
                        const sY = py * stdCellsPerH;
                        const eY = Math.min(sY + stdCellsPerH, gridData.height);
                        const sX = px * cellsPerW;
                        const eX = Math.min(sX + cellsPerW, gridData.width);
                        const title = `Stitch Chart - Page ${py * pagesX + px + 1}`;
                        drawConfiguredChart('stitch', sX, sY, eX, eY, finalCellSize, title, margin + 40);
                    }
                }
                packCursorY = pageH - margin;
            }
            hasContent = true;
        }

        // 6. Stitch Legend
        if (includeStitchLegend) {
            // Check space
            const count = new Set(gridData.grid.filter(c => c.stitchId).map(c => c.stitchId)).size;
            if (count > 0) {
                const neededH = 50 + (count * 30);
                const spaceRemaining = pageH - packCursorY - margin;
                let legendY = packCursorY + 20;

                if (hasContent && neededH > spaceRemaining) {
                    doc.addPage();
                    legendY = margin + 40;
                }

                // Manually call specialized render logic or refactored helper?
                // Helper was NOT refactored in previous step because I missed it.
                // I will inline the logic here to avoid signature mismatch risk.

                doc.setFontSize(14);
                doc.text("Stitch Legend", margin, legendY);

                let currY = legendY + 30;
                const swatchSize = 20;
                doc.setFontSize(10);

                doc.setFont("helvetica", "bold");
                doc.text("Symbol", margin, currY);
                doc.text("Stitch Name", margin + 60, currY);
                doc.text("Abbreviation", margin + 250, currY);
                doc.setFont("helvetica", "normal");
                currY += 20;

                const usedStitches = new Set<string>();
                gridData.grid.forEach(cell => { if (cell.stitchId) usedStitches.add(cell.stitchId); });

                usedStitches.forEach(stitchId => {
                    const stitch = stitchMap.get(stitchId);
                    if (!stitch) return;

                    if (currY > pageH - margin) {
                        doc.addPage();
                        currY = margin + 40;
                    }

                    doc.rect(margin, currY, swatchSize, swatchSize);
                    doc.setFontSize(12);
                    doc.text(stitch.symbol, margin + swatchSize / 2, currY + 14, { align: 'center' });
                    doc.setFontSize(10);
                    doc.text(stitch.name, margin + 60, currY + 14);
                    doc.text(stitch.id.toUpperCase(), margin + 250, currY + 14);
                    currY += 30;
                });
            }
        }
    }

    if (options.preview) {
        const pdfBlob = doc.output('bloburl');
        window.open(pdfBlob, '_blank');
    } else {
        doc.save(`${projectName}.pdf`);
    }
};
