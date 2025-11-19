
// @ts-nocheck
// This service uses global objects from CDNs (jspdf)
import { PixelGridData, YarnColor, CellData } from '../types';

const generateNumberingData = (grid: CellData[], width: number, height: number): string[] => {
    const numbers = Array(width * height).fill('');
    for (let y = 0; y < height; y++) {
        let count = 0;
        let currentColor = null;

        // y is 0-indexed. Crochet rows are 1-indexed.
        // Row 1 (y=0) is odd, Row 2 (y=1) is even.
        // Even rows should be numbered right-to-left.
        const isEvenRow = (y + 1) % 2 === 0;

        const xCoordinates = Array.from({ length: width }, (_, i) => i);
        if (isEvenRow) {
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

export const exportPixelGridToPDF = (
    projectName: string,
    gridData: PixelGridData,
    yarnPalette: YarnColor[],
    yarnUsage: Map<string, number>
) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: gridData.width > gridData.height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 30;
  
  const yarnColorMap = new Map(yarnPalette.map(yc => [yc.id, yc]));

  doc.setFontSize(16);
  doc.setTextColor('#000000');
  doc.text(projectName, margin, margin + 10);

  const availableGridW = pageW - margin * 2 - 40; // Space for rulers
  const availableGridH = pageH - margin * 2 - 120; // Space for title and legend
  const cellSize = Math.min(availableGridW / gridData.width, availableGridH / gridData.height);
  const gridWidthPt = gridData.width * cellSize;
  const gridHeightPt = gridData.height * cellSize;

  const startX = (pageW - gridWidthPt) / 2;
  const startY = margin + 40;
  
  const rulerFontSize = Math.max(6, cellSize * 0.7);
  doc.setFontSize(rulerFontSize);
  doc.setTextColor('#555555');
  
  // Rulers
  for (let x = 0; x < gridData.width; x++) {
      const text = String(x + 1);
      const options: any = { 
          align: 'center', 
          baseline: 'middle',
      };
      if (text.length > 1) {
          options.charSpace = -0.35;
      }
      doc.text(text, startX + (x + 0.5) * cellSize, startY + gridHeightPt + cellSize * 1.5, options);
  }
  for (let y = 0; y < gridData.height; y++) {
      const text = String(y + 1);
      const options: any = { 
          align: 'center', 
          baseline: 'middle',
      };
      if (text.length > 1) {
          options.charSpace = -0.35;
      }

      if ((y + 1) % 2 !== 0) {
          doc.text(text, startX - cellSize, startY + (y + 0.5) * cellSize, options);
      } else {
          doc.text(text, startX + gridWidthPt + cellSize, startY + (y + 0.5) * cellSize, options);
      }
  }

  // Grid & Numbers
  const numbering = generateNumberingData(gridData.grid, gridData.width, gridData.height);
  const getTextColor = (hex: string): string => {
    if (!hex) return '#000000';
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128 ? '#FFFFFF' : '#000000';
  };
  
  doc.setFontSize(Math.max(4, cellSize * 0.6));

  for (let y = 0; y < gridData.height; y++) {
    for (let x = 0; x < gridData.width; x++) {
      const index = y * gridData.width + x;
      const cell = gridData.grid[index];
      const colorId = cell.colorId;
      const cellX = startX + x * cellSize;
      const cellY = startY + y * cellSize;
      
      doc.setDrawColor('#BBBBBB');
      doc.rect(cellX, cellY, cellSize, cellSize, 'S');

      if (colorId) {
        const color = yarnColorMap.get(colorId);
        if (color) {
          doc.setFillColor(color.hex);
          doc.rect(cellX, cellY, cellSize, cellSize, 'F');
          
          const textColor = getTextColor(color.hex);
          doc.setTextColor(textColor);
          doc.text(numbering[index], cellX + cellSize / 2, cellY + cellSize / 2, { align: 'center', baseline: 'middle' });
        }
      }
    }
  }

  // Legend
  let legendY = startY + gridHeightPt + cellSize * 2.5 + 20;
  doc.setTextColor('#000000');
  doc.setFontSize(12);
  doc.text('Legend & Yarn Count', margin, legendY);
  legendY += 20;
  doc.setFontSize(9);
  
  let legendX = margin;
  const colorSwatchSize = 10;
  const colWidth = (pageW - margin*2) / 3;
  const rowHeight = 15;
  let colIndex = 0;
  const itemsPerCol = Math.floor((pageH - legendY - margin) / rowHeight);
  let itemCount = 0;

  gridData.palette.sort((a,b) => (yarnUsage.get(b) || 0) - (yarnUsage.get(a) || 0) ).forEach(yarnId => {
    const yarn = yarnColorMap.get(yarnId);
    if (yarn) {
        if(itemCount > 0 && itemCount % itemsPerCol === 0){
            colIndex++;
            legendX = margin + colIndex * colWidth;
            legendY -= itemsPerCol * rowHeight;
        }
        
        doc.setFillColor(yarn.hex);
        doc.setDrawColor('#000000');
        doc.rect(legendX, legendY - colorSwatchSize, colorSwatchSize, colorSwatchSize, 'FD');

        const legendText = `${yarn.name}: ${yarnUsage.get(yarnId) || 0}`;
        doc.text(legendText, legendX + colorSwatchSize + 5, legendY - 1);
        legendY += rowHeight;
        itemCount++;
    }
  });

  doc.save(`${projectName}_pattern.pdf`);
};
