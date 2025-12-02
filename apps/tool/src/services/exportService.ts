
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
        //   Row 1 (Odd): Left -> Right (indices increase) [User Spec: "Odd numbers on Left"]
        //   Row 2 (Even): Right -> Left (indices decrease) [User Spec: "Even numbers on Right"]

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

    // NEW: Derive internal flags
    const exportType: ExportType = options.exportType || (options.forceSinglePage ? 'chart-only' : 'pattern-pack');
    const isChartOnly = exportType === 'chart-only';
    const isPatternPack = exportType === 'pattern-pack';

    const chartVisual: ChartVisualOptions = {
        showCellSymbols: options.chartVisual?.showCellSymbols ?? true,
        symbolMode: options.chartVisual?.symbolMode ?? 'color-index',
        grayscaleFriendly: options.chartVisual?.grayscaleFriendly ?? false,
    };
    const branding: BrandingOptions = options.branding || {};
    const colorSymbolMap = buildColorSymbolMap(yarnPalette);

    // Determine which chart mode to use
    const chartMode = options.chartMode || 'color';

    // Determine which charts to include (Pattern Pack only)
    const includeColorChart = options.includeColorChart ?? true;
    const includeStitchChart = options.includeStitchChart ?? false;
    const includeYarnRequirements = isChartOnly ? (options.includeYarnRequirements ?? false) : true;
    const includeStitchLegend = options.includeStitchLegend ?? false;

    // --- STEP 1: CALCULATE LAYOUT ---
    const availableW = pageW - margin * 2;
    const availableH = pageH - margin * 2 - 60;

    const singlePageCellW = (availableW - 40) / gridData.width;
    const singlePageCellH = (availableH - 40) / gridData.height;
    const singlePageCellSize = Math.min(singlePageCellW, singlePageCellH);

    let pagesX = 1;
    let pagesY = 1;
    let cellSize = singlePageCellSize;

    if (singlePageCellSize < PDF_CONFIG.minCellSize && !options.forceSinglePage) {
        cellSize = PDF_CONFIG.minCellSize;
        const cellsPerW = Math.floor((availableW - 40) / cellSize);
        const cellsPerH = Math.floor((availableH - 40) / cellSize);

        pagesX = Math.ceil(gridData.width / cellsPerW);
        pagesY = Math.ceil(gridData.height / cellsPerH);
    }

    // --- STEP 2: GENERATE COVER PAGE (Pattern Pack Only) ---
    if (isPatternPack) {
        doc.setFontSize(PDF_CONFIG.fontSize.title);
        doc.text(projectName, margin, margin + 20);

        doc.setFontSize(12);
        doc.text(`Dimensions: ${gridData.width} x ${gridData.height} stitches`, margin, margin + 50);
        doc.text(`Generated by BlanketSmith`, margin, margin + 65);

        if (branding.designerName) {
            doc.text(`Designed by ${branding.designerName}`, margin, margin + 35);
        }

        const now = new Date();
        const year = now.getFullYear();
        const copyrightLine = branding.copyrightLine ||
            (branding.designerName ? `© ${year} ${branding.designerName}. All rights reserved.` : `© ${year} BlanketSmith pattern. All rights reserved.`);

        doc.setFontSize(9);
        doc.text(copyrightLine, margin, margin + 80);
        doc.setFontSize(12);
        if (options.forceSinglePage) {
            doc.setTextColor(100);
            doc.text("(Overview Mode)", margin + 200, margin + 20);
            doc.setTextColor(0);
        }
        if (isLeftHanded) {
            doc.setTextColor(100);
            doc.text("(Left-Handed Mode)", margin + 200, margin + 35);
            doc.setTextColor(0);
        }

        // Draw Yarn Legend
        let legendY = margin + 100;
        doc.setFontSize(14);
        doc.text("Yarn Requirements", margin, legendY);
        legendY += 20;

        const swatchSize = 15;
        doc.setFontSize(10);

        const sortedYarns = gridData.palette
            .sort((a, b) => (yarnUsage.get(b) || 0) - (yarnUsage.get(a) || 0));

        // Header for legend
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

            const yarnPerStitch = projectSettings?.yarnPerStitch || 1;
            const totalYards = Math.ceil((count * yarnPerStitch) / 36);
            const skeinsNeeded = Math.ceil(totalYards / (yarn?.skeinLength || 295));

            if (yarn) {
                if (legendY > pageH - margin) {
                    doc.addPage();
                    legendY = margin;
                }

                doc.setFillColor(yarn.hex);
                doc.setDrawColor(0);

                // Draw Symbol
                const symbol = colorSymbolMap.get(yarn.id) || "?";
                doc.rect(margin, legendY, swatchSize, swatchSize); // Symbol box
                doc.text(symbol, margin + swatchSize / 2, legendY + 11, { align: 'center' });

                // Draw Swatch
                // Draw Swatch (fixed to use 'F' mode for correct colors)
                const [r, g, b] = yarn.rgb;
                doc.setFillColor(r, g, b);
                doc.rect(margin + 40, legendY, swatchSize, swatchSize, 'F');
                doc.setDrawColor(0);
                doc.rect(margin + 40, legendY, swatchSize, swatchSize, 'S');

                doc.text(`${yarn.name}`, margin + 65, legendY + 11);
                doc.setFontSize(8);
                doc.text(`${yarn.brand} | ${yarn.yarnWeight || 'DK'}`, margin + 165, legendY + 11);
                doc.setFontSize(10);
                doc.text(`${count} sts  |  ${totalYards} yds  |  ${skeinsNeeded} skein${skeinsNeeded !== 1 ? 's' : ''}`, margin + 365, legendY + 11);

                legendY += 25;
            }
        });

        // Mini Map for Multipage
        if (pagesX > 1 || pagesY > 1) {
            if (legendY + 150 < pageH) {
                const mapY = legendY + 40;
                doc.setFontSize(14);
                doc.text("Pattern Overview", margin, mapY - 10);

                const mapW = Math.min(300, pageW - margin * 2);
                const mapScale = mapW / gridData.width;

                for (let y = 0; y < gridData.height; y++) {
                    for (let x = 0; x < gridData.width; x++) {
                        const cell = gridData.grid[y * gridData.width + x];
                        if (cell.colorId) {
                            const c = yarnColorMap.get(cell.colorId);
                            if (c) {
                                doc.setFillColor(c.hex);
                                doc.rect(margin + x * mapScale, mapY + y * mapScale, mapScale, mapScale, 'F');
                            }
                        }
                    }
                }

                // Grid Overlay
                doc.setDrawColor(0);
                doc.setLineWidth(1);
                const cellsPerW = Math.floor((availableW - 40) / cellSize);
                const cellsPerH = Math.floor((availableH - 40) / cellSize);

                for (let py = 0; py < pagesY; py++) {
                    for (let px = 0; px < pagesX; px++) {
                        const sx = px * cellsPerW;
                        const sy = py * cellsPerH;
                        const w = Math.min(cellsPerW, gridData.width - sx);
                        const h = Math.min(cellsPerH, gridData.height - sy);

                        doc.rect(margin + sx * mapScale, mapY + sy * mapScale, w * mapScale, h * mapScale, 'S');

                        const pageNum = (py * pagesX) + px + 1;
                        doc.setFontSize(10);
                        doc.setTextColor('#FF0000');
                        doc.text(String(pageNum), margin + (sx + w / 2) * mapScale, mapY + (sy + h / 2) * mapScale, { align: 'center', baseline: 'middle' });
                        doc.setTextColor(0);
                    }
                }
            }
        }
    } // End of Pattern Pack cover page

    // --- STEP 3: GENERATE CHART PAGES ---
    // For Chart Only: Single page with one chart
    // For Pattern Pack: Conditional multi-page charts

    // Helper function to draw a color chart page
    const drawColorChart = (
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        cellSize: number,
        pageTitle: string,
        pageInfo: string = ''
    ) => {
        const sliceW = endX - startX;
        const sliceH = endY - startY;
        const drawX = margin + 40;
        const drawY = margin + 30;

        doc.setFontSize(10);
        doc.text(pageTitle, margin, margin);
        if (pageInfo) {
            doc.text(pageInfo, pageW - margin, margin, { align: 'right' });
        }

        doc.setFontSize(PDF_CONFIG.fontSize.ruler);
        const showRulers = cellSize > 5;

        if (showRulers) {
            // Column Numbers (Top)
            for (let i = 0; i < sliceW; i++) {
                const gridX = startX + i;
                if (i % 5 === 0 || isChartOnly)
                    doc.text(String(gridX + 1), drawX + (i + 0.5) * cellSize, drawY - 5, { align: 'center' });
            }

            // Row Numbers (Sides)
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

        const forceNumbers = isChartOnly;
        const renderNumbers = cellSize >= 10 || forceNumbers;

        for (let y = 0; y < sliceH; y++) {
            for (let x = 0; x < sliceW; x++) {
                const gridX = startX + x;
                const gridY = startY + y;
                const index = gridY * gridData.width + gridX;
                const cell = gridData.grid[index];

                const cx = drawX + x * cellSize;
                const cy = drawY + y * cellSize;

                doc.setFillColor(255, 255, 255);
                if (cell.colorId) {
                    const c = yarnColorMap.get(cell.colorId);
                    if (c) doc.setFillColor(c.hex);
                }
                doc.rect(cx, cy, cellSize, cellSize, 'FD');

                if (renderNumbers && cell.colorId) {
                    const c = yarnColorMap.get(cell.colorId);
                    const textColor = c ? getTextColor(c.hex) : '#000000';
                    doc.setTextColor(textColor);

                    const dynamicFontSize = forceNumbers ? Math.max(2, cellSize * 0.7) : cellSize * 0.6;
                    doc.setFontSize(dynamicFontSize);

                    let cellText = "";
                    if (chartVisual.showCellSymbols) {
                        cellText = colorSymbolMap.get(cell.colorId) || "";
                    } else {
                        cellText = numbering[index];
                    }

                    if (cellText) {
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

    // Helper function to draw a stitch chart page
    const drawStitchChart = (
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        cellSize: number,
        pageTitle: string,
        pageInfo: string = ''
    ) => {
        const sliceW = endX - startX;
        const sliceH = endY - startY;
        const drawX = margin + 40;
        const drawY = margin + 30;

        doc.setFontSize(10);
        doc.text(pageTitle, margin, margin);
        if (pageInfo) {
            doc.text(pageInfo, pageW - margin, margin, { align: 'right' });
        }

        doc.setFontSize(PDF_CONFIG.fontSize.ruler);
        const showRulers = cellSize > 5;

        if (showRulers) {
            // Column Numbers (Top)
            for (let i = 0; i < sliceW; i++) {
                const gridX = startX + i;
                if (i % 5 === 0 || isChartOnly)
                    doc.text(String(gridX + 1), drawX + (i + 0.5) * cellSize, drawY - 5, { align: 'center' });
            }

            // Row Numbers (Sides)
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

        const renderSymbols = cellSize >= 10 || isChartOnly;

        for (let y = 0; y < sliceH; y++) {
            for (let x = 0; x < sliceW; x++) {
                const gridX = startX + x;
                const gridY = startY + y;
                const index = gridY * gridData.width + gridX;
                const cell = gridData.grid[index];

                const cx = drawX + x * cellSize;
                const cy = drawY + y * cellSize;

                // Stitch charts have white/pale background
                doc.setFillColor(255, 255, 255);
                doc.rect(cx, cy, cellSize, cellSize, 'FD');

                // Draw stitch symbol if present
                if (renderSymbols && cell.stitchId) {
                    const stitch = stitchMap.get(cell.stitchId);
                    if (stitch) {
                        doc.setTextColor(0, 0, 0); // Black text for stitch symbols

                        const dynamicFontSize = isChartOnly ? Math.max(2, cellSize * 0.7) : cellSize * 0.6;
                        doc.setFontSize(dynamicFontSize);

                        doc.text(
                            stitch.symbol,
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

    // Helper function to draw stitch legend
    const drawStitchLegend = () => {
        doc.addPage();

        // Collect used stitches
        const usedStitches = new Set<string>();
        gridData.grid.forEach(cell => {
            if (cell.stitchId) usedStitches.add(cell.stitchId);
        });

        if (usedStitches.size === 0) return; // No stitches to show

        doc.setFontSize(14);
        doc.text("Stitch Legend", margin, margin + 20);

        let legendY = margin + 45;
        doc.setFontSize(10);

        // Header
        doc.setFont("helvetica", "bold");
        doc.text("Symbol", margin, legendY);
        doc.text("Name", margin + 60, legendY);
        doc.text("Abbreviation", margin + 200, legendY);
        doc.text("Description", margin + 300, legendY);
        doc.setFont("helvetica", "normal");
        legendY += 15;

        // Draw each stitch
        usedStitches.forEach(stitchId => {
            const stitch = stitchMap.get(stitchId);
            if (stitch) {
                if (legendY > pageH - margin) {
                    doc.addPage();
                    legendY = margin;
                }

                doc.setFontSize(16);
                doc.text(stitch.symbol, margin + 15, legendY, { align: 'center' });

                doc.setFontSize(10);
                doc.text(stitch.name, margin + 60, legendY);
                doc.text(stitch.shortCode, margin + 200, legendY);
                if (stitch.description) {
                    doc.text(stitch.description, margin + 300, legendY);
                }

                legendY += 20;
            }
        });
    };

    // --- CHART GENERATION LOGIC ---

    if (isChartOnly) {
        // CHART ONLY MODE: Single page, one chart type
        doc.addPage();

        const singlePageCellW = (availableW - 40) / gridData.width;
        const singlePageCellH = (availableH - 40) / gridData.height;
        const singlePageCellSize = Math.min(singlePageCellW, singlePageCellH);

        if (chartMode === 'stitch') {
            drawStitchChart(0, 0, gridData.width, gridData.height, singlePageCellSize, 'Stitch Chart');
        } else {
            drawColorChart(0, 0, gridData.width, gridData.height, singlePageCellSize, 'Color Chart');
        }
    } else {
        // PATTERN PACK MODE: Conditional multi-page charts

        // Determine if we need multi-page split for color chart
        const needsMultiPage = singlePageCellSize < PDF_CONFIG.minCellSize;

        if (includeColorChart) {
            if (needsMultiPage) {
                // Multi-page color chart
                const cellsPerW = Math.floor((availableW - 40) / cellSize);
                const cellsPerH = Math.floor((availableH - 40) / cellSize);

                for (let py = 0; py < pagesY; py++) {
                    for (let px = 0; px < pagesX; px++) {
                        doc.addPage();

                        const startX = px * cellsPerW;
                        const startY = py * cellsPerH;
                        const endX = Math.min(startX + cellsPerW, gridData.width);
                        const endY = Math.min(startY + cellsPerH, gridData.height);

                        const pageNum = (py * pagesX) + px + 1;
                        const totalPages = pagesX * pagesY;

                        drawColorChart(
                            startX, startY, endX, endY, cellSize,
                            `Color Chart - Page ${pageNum} of ${totalPages}`,
                            `Cols ${startX + 1}-${endX} | Rows ${startY + 1}-${endY}`
                        );
                    }
                }
            }

            // Always add full color chart page for pattern pack
            doc.addPage();
            const fullChartCellW = (availableW - 40) / gridData.width;
            const fullChartCellH = (availableH - 40) / gridData.height;
            const fullChartCellSize = Math.min(fullChartCellW, fullChartCellH);

            drawColorChart(0, 0, gridData.width, gridData.height, fullChartCellSize, 'Full Color Chart');
        }

        if (includeStitchChart) {
            // Add stitch chart page(s)
            if (needsMultiPage) {
                // Multi-page stitch chart
                const cellsPerW = Math.floor((availableW - 40) / cellSize);
                const cellsPerH = Math.floor((availableH - 40) / cellSize);

                for (let py = 0; py < pagesY; py++) {
                    for (let px = 0; px < pagesX; px++) {
                        doc.addPage();

                        const startX = px * cellsPerW;
                        const startY = py * cellsPerH;
                        const endX = Math.min(startX + cellsPerW, gridData.width);
                        const endY = Math.min(startY + cellsPerH, gridData.height);

                        const pageNum = (py * pagesX) + px + 1;
                        const totalPages = pagesX * pagesY;

                        drawStitchChart(
                            startX, startY, endX, endY, cellSize,
                            `Stitch Chart - Page ${pageNum} of ${totalPages}`,
                            `Cols ${startX + 1}-${endX} | Rows ${startY + 1}-${endY}`
                        );
                    }
                }
            }

            // Always add full stitch chart page
            doc.addPage();
            const fullChartCellW = (availableW - 40) / gridData.width;
            const fullChartCellH = (availableH - 40) / gridData.height;
            const fullChartCellSize = Math.min(fullChartCellW, fullChartCellH);

            drawStitchChart(0, 0, gridData.width, gridData.height, fullChartCellSize, 'Full Stitch Chart');
        }

        // Add stitch legend if requested and stitch chart was included
        if (includeStitchLegend && includeStitchChart) {
            drawStitchLegend();
        }
    }

    const fileName = isChartOnly
        ? `${projectName}_chart_only.pdf`
        : `${projectName}_pattern_pack.pdf`;

    if (options.preview) {
        const dataUrl = doc.output('bloburl');
        window.open(dataUrl, '_blank');
    } else {
        doc.save(fileName);
    }
};

export const exportPixelGridToImage = (
    projectName: string,
    gridData: PixelGridData,
    yarnPalette: YarnColor[]
): void => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine scale (ensure it's large enough to be visible, e.g., 10px per cell)
    const scale = 10;
    canvas.width = gridData.width * scale;
    canvas.height = gridData.height * scale;

    const yarnColorMap = new Map(yarnPalette.map(yc => [yc.id, yc]));

    // Draw grid
    for (let y = 0; y < gridData.height; y++) {
        for (let x = 0; x < gridData.width; x++) {
            const cell = gridData.grid[y * gridData.width + x];
            if (cell.colorId) {
                const color = yarnColorMap.get(cell.colorId);
                if (color) {
                    ctx.fillStyle = color.hex;
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `${projectName}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
