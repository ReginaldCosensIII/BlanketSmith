
import React, { useState, useRef, useLayoutEffect } from 'react';
import { PixelGridData, YarnColor, Symmetry, CellData } from '../types';
import { PIXEL_FONT } from '../constants';
import { useCanvasLogic } from '../hooks/useCanvasLogic';

type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column' | 'eyedropper' | 'text' | 'select';

interface PixelGridEditorProps {
  data: PixelGridData;
  yarnPalette: YarnColor[];
  primaryColorId: string | null;
  secondaryColorId: string | null;
  onGridChange: (newGrid: CellData[]) => void;
  showGridLines: boolean;
  activeTool: Tool;
  onCanvasClick: (gridX: number, gridY: number, isRightClick: boolean) => void;
  brushSize: number;
  rowFillSize: number;
  colFillSize: number;
  textToolInput: string;
  textSize: number;
  symmetry: Symmetry;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  showCenterGuides: boolean;
  selection: { x: number, y: number, w: number, h: number } | null;
  onSelectionChange: (sel: { x: number, y: number, w: number, h: number } | null) => void;
  onContextMenu: (x: number, y: number) => void;
}

const RULER_SIZE = 2;

export const PixelGridEditor: React.FC<PixelGridEditorProps> = ({ 
  data, 
  yarnPalette, 
  primaryColorId, 
  secondaryColorId,
  onGridChange, 
  showGridLines, 
  activeTool, 
  onCanvasClick, 
  brushSize, 
  rowFillSize, 
  colFillSize, 
  textToolInput, 
  textSize, 
  symmetry, 
  zoom, 
  onZoomChange,
  showCenterGuides,
  selection,
  onSelectionChange,
  onContextMenu
}) => {
  const { width, height, grid } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pinchDistRef = useRef<number | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingButton, setDrawingButton] = useState<'left' | 'right' | null>(null);
  const [paintedCells, setPaintedCells] = useState<Set<number>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  
  const yarnColorMap = React.useMemo(() => new Map(yarnPalette.map(yc => [yc.id, yc.hex])), [yarnPalette]);
  
  const { getSymmetryPoints, getBrushPoints } = useCanvasLogic(width, height, symmetry);

  // Initial Zoom calculation - FIXED: Added missing logic
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container && zoom === 1) { 
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            const svgTotalWidth = width + RULER_SIZE * 2;
            const svgTotalHeight = height + RULER_SIZE * 2;
            
            // Calculate ratios to fit with padding
            const fitW = (rect.width - 40) / svgTotalWidth;
            const fitH = (rect.height - 40) / svgTotalHeight;
            
            let newZoom = Math.min(fitW, fitH);
            
            // Clamp zoom to reasonable limits
            newZoom = Math.max(0.5, Math.min(newZoom, 20));
            
            // Apply
            if (Math.abs(newZoom - zoom) > 0.1) {
                onZoomChange(newZoom);
            }
        }
    }
  }, [width, height]); // Only re-run if dimensions change
  
  const getMousePosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - CTM.e) / CTM.a,
      y: (clientY - CTM.f) / CTM.d,
    };
  };
  
  const getPinchDist = (e: TouchEvent) => {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      return Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
  }

  const handlePaint = (e: React.MouseEvent | React.TouchEvent, buttonOverride?: 'left' | 'right') => {
    const { x, y } = getMousePosition(e.nativeEvent as any);
    const gridX = Math.floor(x - RULER_SIZE);
    const gridY = Math.floor(y - RULER_SIZE);
    
    if (gridX < -brushSize || gridX >= width + brushSize || gridY < -brushSize || gridY >= height + brushSize) return;

    const newPaintedCells = new Set<number>();
    
    let activeColorId = primaryColorId;
    const button = buttonOverride || drawingButton;
    
    if (button === 'right') {
        activeColorId = secondaryColorId;
    } else if ('touches' in e) {
        activeColorId = primaryColorId;
    }

    const symPoints = getSymmetryPoints(gridX, gridY);

    symPoints.forEach(p => {
        const brushPoints = getBrushPoints(p.x, p.y, brushSize);
        brushPoints.forEach(bp => {
            const index = bp.y * width + bp.x;
             if (grid[index].colorId !== activeColorId && !paintedCells.has(index)) {
                newPaintedCells.add(index);
            }
        });
    });

    if (newPaintedCells.size > 0) {
        setPaintedCells(prev => new Set([...prev, ...newPaintedCells]));
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button === 2) {
        e.preventDefault();
    }

    if ('touches' in e.nativeEvent && e.nativeEvent.touches.length === 2) {
        e.preventDefault();
        pinchDistRef.current = getPinchDist(e.nativeEvent as TouchEvent);
        setIsDrawing(false);
        return;
    }
    
    let isRightClick = false;
    if ('button' in e) {
        if (e.button === 2) isRightClick = true;
    }
    const clickButton = isRightClick ? 'right' : 'left';

    const { x, y } = getMousePosition(e.nativeEvent as any);
    const gridX = Math.floor(x - RULER_SIZE);
    const gridY = Math.floor(y - RULER_SIZE);

    if (activeTool === 'select') {
        if (isRightClick) {
            if ('clientX' in e) {
                onContextMenu(e.clientX, e.clientY);
            }
            return;
        }
        
        if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
            setIsDrawing(true); 
            setSelectionStart({ x: gridX, y: gridY });
            onSelectionChange({ x: gridX, y: gridY, w: 1, h: 1 });
        } else {
            onSelectionChange(null);
        }
        return;
    }

    if (activeTool === 'brush') {
      setIsDrawing(true);
      setDrawingButton(clickButton);
      setPaintedCells(new Set());
      handlePaint(e, clickButton);
    } else {
      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height || activeTool === 'text') {
        onCanvasClick(gridX, gridY, isRightClick);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
     if ('touches' in e.nativeEvent && e.nativeEvent.touches.length === 2 && pinchDistRef.current !== null) {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        
        const newDist = getPinchDist(e.nativeEvent as TouchEvent);
        if (newDist === 0) return;
        
        const scale = newDist / pinchDistRef.current;
        const newZoom = Math.max(0.1, Math.min(zoom * scale, 100));

        const rect = container.getBoundingClientRect();
        const touch1 = e.nativeEvent.touches[0];
        const touch2 = e.nativeEvent.touches[1];
        const pinchCenterX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const pinchCenterY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

        const pointX = (container.scrollLeft + pinchCenterX) / zoom;
        const pointY = (container.scrollTop + pinchCenterY) / zoom;

        const newScrollLeft = pointX * newZoom - pinchCenterX;
        const newScrollTop = pointY * newZoom - pinchCenterY;

        onZoomChange(newZoom);
        pinchDistRef.current = newDist;

        requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.scrollLeft = newScrollLeft;
                containerRef.current.scrollTop = newScrollTop;
            }
        });
        return;
    }

    e.preventDefault();
    const { x, y } = getMousePosition(e.nativeEvent as any);
    const gridX = Math.floor(x - RULER_SIZE);
    const gridY = Math.floor(y - RULER_SIZE);

    if (!hoveredCell || hoveredCell.x !== gridX || hoveredCell.y !== gridY) {
      setHoveredCell({ x: gridX, y: gridY });
    }
    
    if (isDrawing && activeTool === 'select' && selectionStart) {
        const startX = selectionStart.x;
        const startY = selectionStart.y;
        
        const currentX = Math.max(0, Math.min(width - 1, gridX));
        const currentY = Math.max(0, Math.min(height - 1, gridY));
        
        const minX = Math.min(startX, currentX);
        const minY = Math.min(startY, currentY);
        const w = Math.abs(currentX - startX) + 1;
        const h = Math.abs(currentY - startY) + 1;
        
        onSelectionChange({ x: minX, y: minY, w, h });
        return;
    }

    if (isDrawing && activeTool === 'brush') {
      if ('buttons' in e.nativeEvent) {
          if (drawingButton === 'left' && (e.nativeEvent.buttons & 1) === 0) {
              handleMouseUp();
              return;
          }
          if (drawingButton === 'right' && (e.nativeEvent.buttons & 2) === 0) {
              handleMouseUp();
              return;
          }
      }
      handlePaint(e);
    }
  };
  
  const handleMouseUp = () => {
    if (pinchDistRef.current !== null) {
        pinchDistRef.current = null;
    }
    
    if (activeTool === 'select') {
        setIsDrawing(false);
        setSelectionStart(null);
        return;
    }

    if (isDrawing && paintedCells.size > 0 && activeTool === 'brush') {
      const newGrid = [...grid];
      const colorToApply = drawingButton === 'right' ? secondaryColorId : primaryColorId;
      
      paintedCells.forEach(index => {
        newGrid[index] = { ...newGrid[index], colorId: colorToApply };
      });
      onGridChange(newGrid);
    }
    setIsDrawing(false);
    setDrawingButton(null);
    setPaintedCells(new Set());
  };
  
  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
    setHoveredCell(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;

    const prevZoom = zoom;
    const newZoom = e.deltaY < 0 
        ? Math.min(zoom * 1.2, 100)
        : Math.max(zoom / 1.2, 0.1);

    const pointX = (container.scrollLeft + viewportCenterX) / prevZoom;
    const pointY = (container.scrollTop + viewportCenterY) / prevZoom;
    
    const newScrollLeft = pointX * newZoom - viewportCenterX;
    const newScrollTop = pointY * newZoom - viewportCenterY;

    onZoomChange(newZoom);
    
    requestAnimationFrame(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = newScrollLeft;
            containerRef.current.scrollTop = newScrollTop;
        }
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
  }
  
  const temporaryGrid = React.useMemo(() => {
    if (paintedCells.size === 0 || activeTool !== 'brush') return grid;
    const newGrid = [...grid];
    const colorToApply = drawingButton === 'right' ? secondaryColorId : primaryColorId;

    paintedCells.forEach(index => {
        newGrid[index] = { ...newGrid[index], colorId: colorToApply };
    });
    return newGrid;
  }, [grid, paintedCells, drawingButton, primaryColorId, secondaryColorId, activeTool]);
  
  const getStep = (dimension: number, currentZoom: number) => {
    const cellsVisible = dimension / currentZoom;
    if (cellsVisible > 100) return 20;
    if (cellsVisible > 50) return 10;
    if (cellsVisible > 25) return 5;
    if (cellsVisible > 10) return 2;
    return 1;
  };

  const stepX = getStep(width, zoom);
  const stepY = getStep(height, zoom);
  const fontSize = RULER_SIZE * 0.6;
  
  const getCursor = () => {
    if (activeTool === 'select') return 'crosshair';
    if (activeTool === 'brush') return 'crosshair';
    if (activeTool === 'fill-row' || activeTool === 'fill-column') return 'pointer';
    if (activeTool === 'eyedropper' || activeTool === 'replace') return 'copy';
    if (activeTool === 'text') return 'text';
    return 'default';
  }

  const svgTotalWidth = width + RULER_SIZE * 2;
  const svgTotalHeight = height + RULER_SIZE * 2;
  
  const renderBrushPreview = (cellX: number, cellY: number, color: string | undefined, isEraser: boolean) => {
    const elements = [];
    const fillOpacity = isEraser ? 0.4 : 0.6;
    const stroke = isEraser ? '#ff0000' : '#ffffff';
    const points = getBrushPoints(cellX, cellY, brushSize);

    points.forEach(p => {
        elements.push(
            <rect
                key={`hover-${p.x}-${p.y}`}
                x={p.x}
                y={p.y}
                width="1"
                height="1"
                fill={color}
                fillOpacity={fillOpacity}
                stroke={stroke}
                strokeOpacity={0.8}
                strokeWidth={0.05}
            />
        );
    });
    return elements;
  }

  const getHoverPreviews = () => {
    if (!hoveredCell || isDrawing) return null;
    const previews: React.ReactNode[] = [];
    const color = primaryColorId ? yarnColorMap.get(primaryColorId) : '#ff0000';
    const isEraser = primaryColorId === null;
    const fillOpacity = isEraser ? 0.4 : 0.6;
    const addPreview = (previewKey: string, generator: () => React.ReactNode | React.ReactNode[]) => {
      previews.push(<g key={previewKey}>{generator()}</g>);
    };

    if (activeTool === 'brush') {
        const symPoints = getSymmetryPoints(hoveredCell.x, hoveredCell.y);
        symPoints.forEach((p, index) => {
            addPreview(`brush-${index}`, () => renderBrushPreview(p.x, p.y, color, isEraser));
        });
    }
    
    if (activeTool === 'fill-row') {
        const offset = Math.floor((rowFillSize - 1) / 2);
        const mainY = hoveredCell.y - offset;
        const mainRectY = Math.max(0, mainY);
        const mainRectH = Math.min(mainY + rowFillSize, height) - mainRectY;
        if(mainRectH > 0) addPreview('fill-row-main', () => <rect x={0} y={mainRectY} width={width} height={mainRectH} fill={color} fillOpacity={fillOpacity} />);

        if (symmetry.horizontal) {
            const mirroredY = height - 1 - hoveredCell.y - offset;
            const mirroredRectY = Math.max(0, mirroredY);
            const mirroredRectH = Math.min(mirroredY + rowFillSize, height) - mirroredRectY;
            if(mirroredRectH > 0) addPreview('fill-row-mirror-h', () => <rect x={0} y={mirroredRectY} width={width} height={mirroredRectH} fill={color} fillOpacity={fillOpacity} />);
        }
    }

    if (activeTool === 'fill-column') {
        const offset = Math.floor((colFillSize - 1) / 2);
        const mainX = hoveredCell.x - offset;
        const mainRectX = Math.max(0, mainX);
        const mainRectW = Math.min(mainX + colFillSize, width) - mainRectX;
        if(mainRectW > 0) addPreview('fill-col-main', () => <rect x={mainRectX} y={0} width={mainRectW} height={height} fill={color} fillOpacity={fillOpacity} />);

        if (symmetry.vertical) {
            const mirroredX = width - 1 - hoveredCell.x - offset;
            const mirroredRectX = Math.max(0, mirroredX);
            const mirroredRectW = Math.min(mirroredX + colFillSize, width) - mirroredRectX;
            if(mirroredRectW > 0) addPreview('fill-col-mirror-v', () => <rect x={mirroredRectX} y={0} width={mirroredRectW} height={height} fill={color} fillOpacity={fillOpacity} />);
        }
    }
    
    if (activeTool === 'text') {
        addPreview('text-main', () => {
            const textElements: React.ReactNode[] = [];
            let currentX = hoveredCell.x;
            const startY = hoveredCell.y;
            textToolInput.toUpperCase().split('').forEach((char, charIndex) => {
                const charData = PIXEL_FONT[char];
                if (charData) {
                    charData.forEach((row, y) => {
                        row.forEach((pixel, x) => {
                            if (pixel === 1) {
                                const pixelX = currentX + (x * textSize);
                                const pixelY = startY + (y * textSize);
                                textElements.push(
                                    <rect
                                        key={`text-${charIndex}-${y}-${x}`}
                                        x={pixelX}
                                        y={pixelY}
                                        width={textSize}
                                        height={textSize}
                                        fill={color}
                                        fillOpacity={fillOpacity}
                                    />
                                );
                            }
                        });
                    });
                    currentX += (charData[0].length * textSize) + (1 * textSize);
                }
            });
            return textElements;
        });
    }

    return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-200 overflow-auto grid place-items-center touch-none"
      style={{ cursor: getCursor() }}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      <svg
        ref={svgRef}
        width={svgTotalWidth * zoom}
        height={svgTotalHeight * zoom}
        viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}
        shapeRendering="crispEdges"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <defs>
            <pattern id="grid-pattern" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={0.05} />
            </pattern>
            <style>{`
                @keyframes march {
                    to { stroke-dashoffset: -2; }
                }
                .selection-marquee {
                    stroke: #3b82f6; /* indigo-500 */
                    stroke-width: 0.5px;
                    stroke-dasharray: 1, 1;
                    fill: rgba(59, 130, 246, 0.2);
                    vector-effect: non-scaling-stroke;
                    animation: march 1s linear infinite;
                }
            `}</style>
        </defs>

        <rect x={0} y={0} width={svgTotalWidth} height={RULER_SIZE} fill="#f8f9fa" />
        <rect x={0} y={0} width={RULER_SIZE} height={svgTotalHeight} fill="#f8f9fa" />
        <rect x={RULER_SIZE + width} y={0} width={RULER_SIZE} height={svgTotalHeight} fill="#f8f9fa" />
        <rect x={0} y={height + RULER_SIZE} width={svgTotalWidth} height={RULER_SIZE} fill="#f8f9fa" />
        
        <g transform={`translate(${RULER_SIZE}, ${RULER_SIZE})`}>
          <rect x={0} y={0} width={width} height={height} fill="#fff" />
          {temporaryGrid.map((cell, i) => {
            const x = i % width;
            const y = Math.floor(i / width);
            const color = cell.colorId ? yarnColorMap.get(cell.colorId) : 'transparent';
            return color !== 'transparent' && (
              <rect
                key={i}
                x={x}
                y={y}
                width="1"
                height="1"
                fill={color}
              />
            );
          })}
          
          {showGridLines && zoom > 8 &&
              <rect x="0" y="0" width={width} height={height} fill="url(#grid-pattern)" />
          }

          {showCenterGuides && (
              <g pointerEvents="none">
                  <line 
                    x1={width / 2} y1={0} x2={width / 2} y2={height} 
                    stroke="#ec4899" strokeWidth={0.2} strokeDasharray="0.5, 0.5" 
                  />
                  <line 
                    x1={0} y1={height / 2} x2={width} y2={height / 2} 
                    stroke="#ec4899" strokeWidth={0.2} strokeDasharray="0.5, 0.5" 
                  />
              </g>
          )}

          {getHoverPreviews()}

          {selection && (
              <rect 
                x={selection.x} 
                y={selection.y} 
                width={selection.w} 
                height={selection.h} 
                className="selection-marquee"
                pointerEvents="none"
              />
          )}
        </g>
         
        <g>
            <line x1={RULER_SIZE} y1={0} x2={RULER_SIZE} y2={svgTotalHeight} stroke="#ccc" strokeWidth={0.02} />
            <line x1={RULER_SIZE + width} y1={0} x2={RULER_SIZE + width} y2={svgTotalHeight} stroke="#ccc" strokeWidth={0.02} />
            <line x1={0} y1={RULER_SIZE} x2={svgTotalWidth} y2={RULER_SIZE} stroke="#ccc" strokeWidth={0.02} />
            <line x1={0} y1={height + RULER_SIZE} x2={svgTotalWidth} y2={height + RULER_SIZE} stroke="#ccc" strokeWidth={0.02} />

            {Array.from({ length: width }).map((_, i) => {
                const num = i + 1;
                if (num % 2 !== 0) return null; 
                if (num % stepX !== 0 && stepX > 1) return null;
                return (
                    <text
                        key={`ruler-top-${i}`}
                        x={i + 0.5 + RULER_SIZE}
                        y={RULER_SIZE / 2}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}
            
            {Array.from({ length: width }).map((_, i) => {
                const num = i + 1;
                if (num % 2 === 0) return null; 
                if (num % stepX !== 0 && stepX > 1) return null;
                return (
                    <text
                        key={`ruler-bottom-${i}`}
                        x={i + 0.5 + RULER_SIZE}
                        y={height + RULER_SIZE + RULER_SIZE / 2}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}

            {Array.from({ length: height }).map((_, i) => {
                const num = i + 1;
                if (num % 2 === 0) return null; 
                if (num % stepY !== 0) return null;
                return (
                    <text
                        key={`ruler-left-${i}`}
                        x={RULER_SIZE / 2}
                        y={i + 0.5 + RULER_SIZE}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}

            {Array.from({ length: height }).map((_, i) => {
                const num = i + 1;
                if (num % 2 !== 0) return null; 
                if (num % stepY !== 0) return null;
                return (
                    <text
                        key={`ruler-right-${i}`}
                        x={width + RULER_SIZE + RULER_SIZE / 2}
                        y={i + 0.5 + RULER_SIZE}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}
        </g>
      </svg>
    </div>
  );
};
