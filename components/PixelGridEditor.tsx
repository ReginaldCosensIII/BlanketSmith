
import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { PixelGridData, YarnColor } from '../types';

type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column' | 'eyedropper';

interface PixelGridEditorProps {
  data: PixelGridData;
  yarnPalette: YarnColor[];
  selectedColorId: string | null;
  onGridChange: (newGrid: (string | null)[]) => void;
  showGridLines: boolean;
  activeTool: Tool;
  onCanvasClick: (gridX: number, gridY: number) => void;
  brushSize: number;
  rowFillSize: number;
  colFillSize: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

const RULER_SIZE = 2; // Units for ruler size

const PixelGridEditor: React.FC<PixelGridEditorProps> = ({ data, yarnPalette, selectedColorId, onGridChange, showGridLines, activeTool, onCanvasClick, brushSize, rowFillSize, colFillSize, zoom, onZoomChange }) => {
  const { width, height, grid } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pinchDistRef = useRef<number | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [paintedCells, setPaintedCells] = useState<Set<number>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  
  const yarnColorMap = React.useMemo(() => new Map(yarnPalette.map(yc => [yc.id, yc.hex])), [yarnPalette]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      const { clientWidth, clientHeight } = container;
      const svgLogicalWidth = width + RULER_SIZE * 2;
      const svgLogicalHeight = height + RULER_SIZE * 2;
      
      const zoomX = clientWidth / svgLogicalWidth;
      const zoomY = clientHeight / svgLogicalHeight;
      
      const initialZoom = Math.min(zoomX, zoomY) * 0.95; 
      onZoomChange(Math.max(0.1, initialZoom));

      requestAnimationFrame(() => {
        if (containerRef.current) {
          const { scrollWidth, scrollHeight, clientWidth, clientHeight } = containerRef.current;
          containerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
          containerRef.current.scrollTop = (scrollHeight - clientHeight) / 2;
        }
      });
    }
  }, [width, height, onZoomChange]);
  
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

  const handlePaint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getMousePosition(e.nativeEvent as any);
    const gridX = Math.floor(x - RULER_SIZE);
    const gridY = Math.floor(y - RULER_SIZE);
    
    if (gridX < -brushSize || gridX >= width + brushSize || gridY < -brushSize || gridY >= height + brushSize) return;

    const newPaintedCells = new Set<number>();
    const offset = Math.floor((brushSize - 1) / 2);
    const startX = gridX - offset;
    const startY = gridY - offset;
    
    for (let i = 0; i < brushSize; i++) {
        for (let j = 0; j < brushSize; j++) {
            const currentX = startX + i;
            const currentY = startY + j;

            if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
                const index = currentY * width + currentX;
                if (grid[index] !== selectedColorId && !paintedCells.has(index)) {
                    newPaintedCells.add(index);
                }
            }
        }
    }

    if (newPaintedCells.size > 0) {
        setPaintedCells(prev => new Set([...prev, ...newPaintedCells]));
    }

  }, [grid, selectedColorId, paintedCells, width, height, brushSize]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e.nativeEvent && e.nativeEvent.touches.length === 2) {
        e.preventDefault();
        pinchDistRef.current = getPinchDist(e.nativeEvent as TouchEvent);
        setIsDrawing(false);
        return;
    }
    e.preventDefault();
    if (activeTool === 'brush') {
      setIsDrawing(true);
      setPaintedCells(new Set());
      handlePaint(e);
    } else { // For all other tools that use single clicks
      const { x, y } = getMousePosition(e.nativeEvent as any);
      const gridX = Math.floor(x - RULER_SIZE);
      const gridY = Math.floor(y - RULER_SIZE);
      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        onCanvasClick(gridX, gridY);
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

    if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
      if (!hoveredCell || hoveredCell.x !== gridX || hoveredCell.y !== gridY) {
        setHoveredCell({ x: gridX, y: gridY });
      }
    } else {
      if (hoveredCell !== null) {
        setHoveredCell(null);
      }
    }

    if (isDrawing && activeTool === 'brush') {
      handlePaint(e);
    }
  };
  
  const handleMouseUp = () => {
    if (pinchDistRef.current !== null) {
        pinchDistRef.current = null;
    }
    if (isDrawing && paintedCells.size > 0 && activeTool === 'brush') {
      const newGrid = [...grid];
      paintedCells.forEach(index => {
        newGrid[index] = selectedColorId;
      });
      onGridChange(newGrid);
    }
    setIsDrawing(false);
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
  
  const temporaryGrid = React.useMemo(() => {
    if (paintedCells.size === 0 || activeTool !== 'brush') return grid;
    const newGrid = [...grid];
    paintedCells.forEach(index => {
        newGrid[index] = selectedColorId;
    });
    return newGrid;
  }, [grid, paintedCells, selectedColorId, activeTool]);
  
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
    if (activeTool === 'brush') {
      return selectedColorId !== undefined ? 'crosshair' : 'default';
    }
    if (activeTool === 'fill-row' || activeTool === 'fill-column') {
      return 'pointer';
    }
    if (activeTool === 'eyedropper' || activeTool === 'replace') {
        return 'copy'; // Good cross-platform cursor for picking
    }
    return 'default';
  }

  const svgTotalWidth = width + RULER_SIZE * 2;
  const svgTotalHeight = height + RULER_SIZE * 2;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-200 overflow-auto grid place-items-center touch-none"
      style={{ cursor: getCursor() }}
      onWheel={handleWheel}
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
        </defs>

        {/* Ruler Backgrounds */}
        <rect x={0} y={0} width={svgTotalWidth} height={RULER_SIZE} fill="#f8f9fa" />
        <rect x={0} y={0} width={RULER_SIZE} height={svgTotalHeight} fill="#f8f9fa" />
        <rect x={RULER_SIZE + width} y={0} width={RULER_SIZE} height={svgTotalHeight} fill="#f8f9fa" />
        <rect x={0} y={height + RULER_SIZE} width={svgTotalWidth} height={RULER_SIZE} fill="#f8f9fa" />
        
        {/* Grid Area */}
        <g transform={`translate(${RULER_SIZE}, ${RULER_SIZE})`}>
          <rect x={0} y={0} width={width} height={height} fill="#fff" />
          {temporaryGrid.map((colorId, i) => {
            const x = i % width;
            const y = Math.floor(i / width);
            const color = colorId ? yarnColorMap.get(colorId) : 'transparent';
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

          {/* Hover Previews */}
          {hoveredCell && !isDrawing && (
            <g style={{ pointerEvents: 'none' }}>
                {(() => {
                    const color = selectedColorId ? yarnColorMap.get(selectedColorId) : '#ff0000';
                    const isEraser = selectedColorId === null;
                    const fillOpacity = isEraser ? 0.4 : 0.6;
                    const stroke = isEraser ? '#ff0000' : '#ffffff';

                    if (activeTool === 'brush') {
                        const elements = [];
                        const offset = Math.floor((brushSize - 1) / 2);
                        const startX = hoveredCell.x - offset;
                        const startY = hoveredCell.y - offset;

                        for (let i = 0; i < brushSize; i++) {
                            for (let j = 0; j < brushSize; j++) {
                                const currentX = startX + i;
                                const currentY = startY + j;

                                if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
                                    elements.push(
                                        <rect
                                            key={`hover-${i}-${j}`}
                                            x={currentX}
                                            y={currentY}
                                            width="1"
                                            height="1"
                                            fill={color}
                                            fillOpacity={fillOpacity}
                                            stroke={stroke}
                                            strokeOpacity={0.8}
                                            strokeWidth={0.05}
                                        />
                                    );
                                }
                            }
                        }
                        return elements;
                    }

                    if (activeTool === 'fill-row') {
                        const offset = Math.floor((rowFillSize - 1) / 2);
                        const startY = hoveredCell.y - offset;
                        const endY = startY + rowFillSize;
                        
                        const rectY = Math.max(0, startY);
                        const rectH = Math.min(endY, height) - rectY;

                        if (rectH > 0) {
                            return (
                                <rect x={0} y={rectY} width={width} height={rectH} fill={color} fillOpacity={fillOpacity} />
                            );
                        }
                    }

                    if (activeTool === 'fill-column') {
                        const offset = Math.floor((colFillSize - 1) / 2);
                        const startX = hoveredCell.x - offset;
                        const endX = startX + colFillSize;

                        const rectX = Math.max(0, startX);
                        const rectW = Math.min(endX, width) - rectX;

                        if (rectW > 0) {
                            return (
                                <rect x={rectX} y={0} width={rectW} height={height} fill={color} fillOpacity={fillOpacity} />
                            );
                        }
                    }
                    
                    return null;
                })()}
            </g>
          )}
        </g>
         
        {/* Rulers and Lines */}
        <g>
            {/* Lines separating rulers from grid */}
            <line x1={RULER_SIZE} y1={0} x2={RULER_SIZE} y2={svgTotalHeight} stroke="#ccc" strokeWidth={0.02} />
            <line x1={RULER_SIZE + width} y1={0} x2={RULER_SIZE + width} y2={svgTotalHeight} stroke="#ccc" strokeWidth={0.02} />
            <line x1={0} y1={RULER_SIZE} x2={svgTotalWidth} y2={RULER_SIZE} stroke="#ccc" strokeWidth={0.02} />
            <line x1={0} y1={height + RULER_SIZE} x2={svgTotalWidth} y2={height + RULER_SIZE} stroke="#ccc" strokeWidth={0.02} />

            {/* Top Ruler (Even Numbers) */}
            {Array.from({ length: width }).map((_, i) => {
                const num = i + 1;
                if (num % 2 !== 0) return null; // Even numbers only
                if (num % stepX !== 0 && stepX > 1) return null;
                
                const text = String(num);
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
                        {text}
                    </text>
                );
            })}
            
            {/* Bottom Ruler (Odd Numbers) */}
            {Array.from({ length: width }).map((_, i) => {
                const num = i + 1;
                if (num % 2 === 0) return null; // Odd numbers only
                if (num % stepX !== 0 && stepX > 1) return null;
                
                const text = String(num);
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
                        {text}
                    </text>
                );
            })}

            {/* Left Ruler (Odd Numbers) */}
            {Array.from({ length: height }).map((_, i) => {
                const num = i + 1;
                if (num % 2 === 0) return null; // Odd numbers only
                if (num % stepY !== 0) return null;
                
                const text = String(num);
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
                        {text}
                    </text>
                );
            })}

            {/* Right Ruler (Even Numbers) */}
            {Array.from({ length: height }).map((_, i) => {
                const num = i + 1;
                if (num % 2 !== 0) return null; // Even numbers only
                if (num % stepY !== 0) return null;
                
                const text = String(num);
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
                        {text}
                    </text>
                );
            })}
        </g>
      </svg>
    </div>
  );
};

export default PixelGridEditor;
