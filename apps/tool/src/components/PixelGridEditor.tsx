
import React, { useState, useRef, useEffect } from 'react';
import { PixelGridData, YarnColor, Symmetry, CellData } from '../types';
import { PIXEL_FONT, MIN_ZOOM, MAX_ZOOM } from '../constants';
import { useCanvasLogic } from '../hooks/useCanvasLogic';
import { GridRenderer } from './editor/GridRenderer';
import { Rulers } from './editor/Rulers';
import { EditorOverlay } from './editor/EditorOverlay';

type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column' | 'eyedropper' | 'text' | 'select';

import { StitchDefinition } from '../data/stitches';

interface PixelGridEditorProps {
    data: PixelGridData;
    yarnPalette: YarnColor[];
    stitchMap: Map<string, StitchDefinition>;
    primaryColorId: string | null;
    secondaryColorId: string | null;
    primaryStitchId: string | null;
    secondaryStitchId: string | null;
    isComboPaintMode: boolean;
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
    floatingSelection: { x: number, y: number, w: number, h: number, data: CellData[], isRotated: boolean } | null;
    onFloatingSelectionChange: (sel: { x: number, y: number, w: number, h: number, data: CellData[], isRotated: boolean } | null) => void;
    onContextMenu: (x: number, y: number) => void;
}

const RULER_SIZE = 2;

export const PixelGridEditor: React.FC<PixelGridEditorProps> = ({
    data,
    yarnPalette,
    stitchMap,
    primaryColorId,
    secondaryColorId,
    primaryStitchId,
    secondaryStitchId,
    isComboPaintMode,
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
    floatingSelection,
    onFloatingSelectionChange,
    onContextMenu
}) => {
    const { width, height, grid } = data;
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const pinchDistRef = useRef<number | null>(null);
    const touchMode = useRef<'none' | 'paint' | 'gesture'>('none');
    const lastPinchCenter = useRef<{ x: number, y: number } | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingButton, setDrawingButton] = useState<'left' | 'right' | null>(null);
    const [paintedCells, setPaintedCells] = useState<Set<number>>(new Set());
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
    const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
    const [floatingDragStart, setFloatingDragStart] = useState<{ x: number, y: number } | null>(null);

    const yarnColorMap = React.useMemo(() => new Map(yarnPalette.map(yc => [yc.id, yc.hex])), [yarnPalette]);

    const { getSymmetryPoints, getBrushPoints } = useCanvasLogic(width, height, symmetry);

    // --- ROBUST AUTO-ZOOM LOGIC (ResizeObserver) ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleResize = () => {
            if (Math.abs(zoom - 1) < 0.01 || zoom === 1) {
                const rect = container.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 50) {
                    const svgTotalWidth = width + RULER_SIZE * 2;
                    const svgTotalHeight = height + RULER_SIZE * 2;

                    const fitW = (rect.width - 40) / svgTotalWidth;
                    const fitH = (rect.height - 40) / svgTotalHeight;

                    let newZoom = Math.min(fitW, fitH);
                    newZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));

                    if (Math.abs(newZoom - zoom) > 0.05) {
                        onZoomChange(newZoom);
                    }
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(handleResize);
        });

        resizeObserver.observe(container);
        handleResize();

        return () => resizeObserver.disconnect();
    }, [width, height, zoom, onZoomChange]);

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

    const getPinchInfo = (e: React.TouchEvent | TouchEvent) => {
        const touches = 'nativeEvent' in e ? e.nativeEvent.touches : e.touches;
        if (touches.length < 2) return null;

        const t1 = touches[0];
        const t2 = touches[1];
        const dist = Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
        const centerX = (t1.clientX + t2.clientX) / 2;
        const centerY = (t1.clientY + t2.clientY) / 2;
        return { dist, centerX, centerY };
    }

    const lastGridPos = useRef<{ x: number, y: number } | null>(null);

    const paintAt = (gx: number, gy: number, button: 'left' | 'right', currentPainted: Set<number>) => {
        if (gx < -brushSize || gx >= width + brushSize || gy < -brushSize || gy >= height + brushSize) return;

        let activeColorId = primaryColorId;
        if (button === 'right') {
            activeColorId = secondaryColorId;
        }

        const symPoints = getSymmetryPoints(gx, gy);
        symPoints.forEach(p => {
            const brushPoints = getBrushPoints(p.x, p.y, brushSize);
            brushPoints.forEach(bp => {
                const index = bp.y * width + bp.x;
                if (index >= 0 && index < width * height) {
                    const cell = grid[index];
                    const colorChanged = cell.colorId !== activeColorId;

                    let shouldPaint = colorChanged;

                    if (isComboPaintMode) {
                        const activeStitchId = button === 'right' ? secondaryStitchId : primaryStitchId;
                        const stitchChanged = cell.stitchId !== activeStitchId;
                        shouldPaint = colorChanged || stitchChanged;
                    } else {
                        // In non-combo mode, we clear the stitch.
                        // So if there is a stitch, we need to paint (to remove it).
                        if (cell.stitchId !== null && cell.stitchId !== undefined) {
                            shouldPaint = true;
                        }
                    }

                    if (shouldPaint && !currentPainted.has(index)) {
                        currentPainted.add(index);
                    }
                }
            });
        });
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if ('button' in e && e.button === 2) {
            e.preventDefault();
        }

        if ('button' in e && e.button === 2) {
            e.preventDefault();
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
            // Right click on select tool is now handled by onContextMenu handler
            if (isRightClick) return;

            // Check for floating selection drag
            if (floatingSelection) {
                if (gridX >= floatingSelection.x && gridX < floatingSelection.x + floatingSelection.w &&
                    gridY >= floatingSelection.y && gridY < floatingSelection.y + floatingSelection.h) {
                    setFloatingDragStart({ x: gridX, y: gridY });
                    return;
                }
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
            lastGridPos.current = { x: gridX, y: gridY };

            const newPainted = new Set<number>();
            paintAt(gridX, gridY, clickButton, newPainted);
            if (newPainted.size > 0) {
                setPaintedCells(newPainted);
            }
        } else {
            if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height || activeTool === 'text') {
                onCanvasClick(gridX, gridY, isRightClick);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {

        e.preventDefault();
        const { x, y } = getMousePosition(e.nativeEvent as any);
        const gridX = Math.floor(x - RULER_SIZE);
        const gridY = Math.floor(y - RULER_SIZE);

        if (!hoveredCell || hoveredCell.x !== gridX || hoveredCell.y !== gridY) {
            setHoveredCell({ x: gridX, y: gridY });
        }

        if (floatingDragStart && floatingSelection) {
            const dx = gridX - floatingDragStart.x;
            const dy = gridY - floatingDragStart.y;
            if (dx !== 0 || dy !== 0) {
                onFloatingSelectionChange({
                    ...floatingSelection,
                    x: floatingSelection.x + dx,
                    y: floatingSelection.y + dy
                });
                setFloatingDragStart({ x: gridX, y: gridY });
            }
            return;
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

            const button = drawingButton || 'left';
            const newPainted = new Set(paintedCells);

            // Interpolate line from last pos to current pos
            if (lastGridPos.current) {
                const x0 = lastGridPos.current.x;
                const y0 = lastGridPos.current.y;
                const x1 = gridX;
                const y1 = gridY;

                const dx = Math.abs(x1 - x0);
                const dy = Math.abs(y1 - y0);
                const sx = (x0 < x1) ? 1 : -1;
                const sy = (y0 < y1) ? 1 : -1;
                let err = dx - dy;

                let cx = x0;
                let cy = y0;

                while (true) {
                    paintAt(cx, cy, button, newPainted);
                    if (cx === x1 && cy === y1) break;
                    const e2 = 2 * err;
                    if (e2 > -dy) { err -= dy; cx += sx; }
                    if (e2 < dx) { err += dx; cy += sy; }
                }
            } else {
                paintAt(gridX, gridY, button, newPainted);
            }

            lastGridPos.current = { x: gridX, y: gridY };
            setPaintedCells(newPainted);
        }
    };

    const handleMouseUp = () => {
        if (pinchDistRef.current !== null) {
            pinchDistRef.current = null;
        }

        if (floatingDragStart) {
            setFloatingDragStart(null);
            return;
        }

        if (activeTool === 'select') {
            setIsDrawing(false);
            setSelectionStart(null);
            return;
        }

        if (isDrawing && paintedCells.size > 0 && activeTool === 'brush') {
            const newGrid = [...grid];
            const colorToApply = drawingButton === 'right' ? secondaryColorId : primaryColorId;
            const stitchToApply = drawingButton === 'right' ? secondaryStitchId : primaryStitchId;

            paintedCells.forEach(index => {
                const cell = newGrid[index];
                if (isComboPaintMode) {
                    newGrid[index] = { ...cell, colorId: colorToApply, stitchId: stitchToApply };
                } else {
                    // Clear stitch in non-combo mode
                    newGrid[index] = { ...cell, colorId: colorToApply, stitchId: null };
                }
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

    // --- NEW TOUCH HANDLERS ---

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            touchMode.current = 'paint';
            handleMouseDown(e);
        } else if (e.touches.length === 2) {
            touchMode.current = 'gesture';
            e.preventDefault();
            const info = getPinchInfo(e);
            if (info) {
                pinchDistRef.current = info.dist;
                lastPinchCenter.current = { x: info.centerX, y: info.centerY };
            }
            setIsDrawing(false); // Stop any painting
            setHoveredCell(null); // Clear hover
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchMode.current === 'paint') {
            handleMouseMove(e);
        } else if (touchMode.current === 'gesture' && e.touches.length === 2) {
            e.preventDefault(); // Critical to prevent browser zoom/pan
            const container = containerRef.current;
            if (!container || pinchDistRef.current === null || !lastPinchCenter.current) return;

            const info = getPinchInfo(e);
            if (!info || info.dist === 0) return;

            // --- ZOOM LOGIC ---
            const scale = info.dist / pinchDistRef.current;
            const newZoom = Math.max(MIN_ZOOM, Math.min(zoom * scale, MAX_ZOOM));

            // --- PAN LOGIC ---
            const rect = container.getBoundingClientRect();

            // Current center of pinch relative to container viewport
            const pinchCtxX = min(Math.max(0, info.centerX - rect.left), rect.width);
            const pinchCtxY = min(Math.max(0, info.centerY - rect.top), rect.height);

            // Where that point is in "canvas space"
            const scaleCorrection = zoom; // Current zoom
            const pointX = (container.scrollLeft + pinchCtxX) / scaleCorrection;
            const pointY = (container.scrollTop + pinchCtxY) / scaleCorrection;

            // Calculate target scroll to keep that point under fingers @ newZoom
            // New scroll = (CanvasCoord * NewZoom) - ScreenOffset
            let newScrollLeft = pointX * newZoom - pinchCtxX;
            let newScrollTop = pointY * newZoom - pinchCtxY;

            // Subtract movement of fingers (Pan)
            const dx = info.centerX - lastPinchCenter.current.x;
            const dy = info.centerY - lastPinchCenter.current.y;

            newScrollLeft -= dx;
            newScrollTop -= dy;

            onZoomChange(newZoom);

            // Sync Updates
            pinchDistRef.current = info.dist;
            lastPinchCenter.current = { x: info.centerX, y: info.centerY };

            requestAnimationFrame(() => {
                if (containerRef.current) {
                    containerRef.current.scrollLeft = newScrollLeft;
                    containerRef.current.scrollTop = newScrollTop;
                }
            });
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchMode.current === 'paint') {
            handleMouseUp();
        }

        if (e.touches.length === 0) {
            touchMode.current = 'none';
            pinchDistRef.current = null;
            lastPinchCenter.current = null;
        } else if (e.touches.length < 2 && touchMode.current === 'gesture') {
            // If we drop from 2 fingers to 1, end the gesture to avoid jumping
            touchMode.current = 'none';
        }
    };

    // Helper for safe bounding
    const min = Math.min;

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const viewportCenterX = rect.width / 2;
        const viewportCenterY = rect.height / 2;

        const prevZoom = zoom;
        const newZoom = e.deltaY < 0
            ? Math.min(zoom * 1.2, MAX_ZOOM)
            : Math.max(zoom / 1.2, MIN_ZOOM);

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
        e.stopPropagation();
        if (activeTool === 'select') {
            onContextMenu(e.clientX, e.clientY);
        }
    }

    const temporaryGrid = React.useMemo(() => {
        if (paintedCells.size === 0 || activeTool !== 'brush') return grid;
        const newGrid = [...grid];
        const colorToApply = drawingButton === 'right' ? secondaryColorId : primaryColorId;
        const stitchToApply = drawingButton === 'right' ? secondaryStitchId : primaryStitchId;

        paintedCells.forEach(index => {
            const cell = newGrid[index];
            if (isComboPaintMode) {
                newGrid[index] = { ...cell, colorId: colorToApply, stitchId: stitchToApply };
            } else {
                // Clear stitch in non-combo mode
                newGrid[index] = { ...cell, colorId: colorToApply, stitchId: null };
            }
        });
        return newGrid;
    }, [grid, paintedCells, drawingButton, primaryColorId, secondaryColorId, activeTool]);

    const getCursor = () => {
        if (activeTool === 'select') {
            if (floatingSelection && hoveredCell) {
                if (hoveredCell.x >= floatingSelection.x && hoveredCell.x < floatingSelection.x + floatingSelection.w &&
                    hoveredCell.y >= floatingSelection.y && hoveredCell.y < floatingSelection.y + floatingSelection.h) {
                    return 'move';
                }
            }
            return 'crosshair';
        }
        if (activeTool === 'brush' || activeTool === 'fill') return 'crosshair';
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
            if (mainRectH > 0) addPreview('fill-row-main', () => <rect x={0} y={mainRectY} width={width} height={mainRectH} fill={color} fillOpacity={fillOpacity} />);

            if (symmetry.horizontal) {
                const mirroredY = height - 1 - hoveredCell.y - offset;
                const mirroredRectY = Math.max(0, mirroredY);
                const mirroredRectH = Math.min(mirroredY + rowFillSize, height) - mirroredRectY;
                if (mirroredRectH > 0) addPreview('fill-row-mirror-h', () => <rect x={0} y={mirroredRectY} width={width} height={mirroredRectH} fill={color} fillOpacity={fillOpacity} />);
            }
        }

        if (activeTool === 'fill-column') {
            const offset = Math.floor((colFillSize - 1) / 2);
            const mainX = hoveredCell.x - offset;
            const mainRectX = Math.max(0, mainX);
            const mainRectW = Math.min(mainX + colFillSize, width) - mainRectX;
            if (mainRectW > 0) addPreview('fill-col-main', () => <rect x={mainRectX} y={0} width={mainRectW} height={height} fill={color} fillOpacity={fillOpacity} />);

            if (symmetry.vertical) {
                const mirroredX = width - 1 - hoveredCell.x - offset;
                const mirroredRectX = Math.max(0, mirroredX);
                const mirroredRectW = Math.min(mirroredX + colFillSize, width) - mirroredRectX;
                if (mirroredRectW > 0) addPreview('fill-col-mirror-v', () => <rect x={mirroredRectX} y={0} width={mirroredRectW} height={height} fill={color} fillOpacity={fillOpacity} />);
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

        return previews.length ? previews : null;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gray-200 overflow-auto grid place-items-center touch-none"
            style={{ cursor: getCursor() }}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <svg
                ref={svgRef}
                width={svgTotalWidth * zoom}
                height={svgTotalHeight * zoom}
                viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}
                shapeRendering="crispEdges"
            >
                <Rulers
                    width={width}
                    height={height}
                    zoom={zoom}
                    rulerSize={RULER_SIZE}
                    svgTotalWidth={svgTotalWidth}
                    svgTotalHeight={svgTotalHeight}
                />

                <g transform={`translate(${RULER_SIZE}, ${RULER_SIZE})`}>
                    <GridRenderer
                        width={width}
                        height={height}
                        grid={temporaryGrid}
                        yarnColorMap={yarnColorMap}
                        stitchMap={stitchMap}
                        showGridLines={showGridLines}
                        zoom={zoom}
                    />

                    {floatingSelection && (
                        <g transform={`translate(${floatingSelection.x}, ${floatingSelection.y})`}>
                            {floatingSelection.data.map((cell, i) => {
                                const col = i % floatingSelection.w;
                                const row = Math.floor(i / floatingSelection.w);
                                if (!cell.colorId) return null;
                                const color = yarnColorMap.get(cell.colorId);
                                const stitch = cell.stitchId ? stitchMap.get(cell.stitchId) : null;
                                return (
                                    <g key={i}>
                                        <rect
                                            x={col}
                                            y={row}
                                            width={1}
                                            height={1}
                                            fill={color || 'transparent'}
                                        />
                                        {stitch && (
                                            <text
                                                x={col + 0.5}
                                                y={row + 0.75}
                                                fontSize="0.7"
                                                textAnchor="middle"
                                                fill="rgba(0,0,0,0.7)"
                                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                                            >
                                                {stitch.symbol}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    )}

                    <EditorOverlay
                        width={width}
                        height={height}
                        showCenterGuides={showCenterGuides}
                        selection={selection}
                        hoverPreviews={getHoverPreviews()}
                    />
                </g>
            </svg >
        </div >
    );
};
