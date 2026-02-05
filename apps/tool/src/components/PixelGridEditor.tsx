
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { PixelGridData, PatternColor, Symmetry, CellData } from '../types';
import { PIXEL_FONT, MIN_ZOOM, MAX_ZOOM } from '../constants';
import { useCanvasLogic } from '../hooks/useCanvasLogic';
import { GridRenderer } from './editor/GridRenderer';
import { Rulers } from './editor/Rulers';
import { EditorOverlay } from './editor/EditorOverlay';

import { Button, Icon } from './ui/SharedComponents';

type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column' | 'eyedropper' | 'text' | 'select';

import { StitchDefinition } from '../data/stitches';

interface PixelGridEditorProps {
    data: PixelGridData;
    yarnPalette: PatternColor[];
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
    floatingSelection: { x: number, y: number, w: number, h: number, data: CellData[], isRotated: boolean, sourceBounds?: { x: number, y: number, w: number, h: number } } | null;
    onFloatingSelectionChange: (sel: { x: number, y: number, w: number, h: number, data: CellData[], isRotated: boolean, sourceBounds?: { x: number, y: number, w: number, h: number } } | null) => void;
    onLiftSelection: () => void;
    onContextMenu: (x: number, y: number) => void;
    isZoomLocked: boolean;
    onToggleZoomLock: () => void;
}

const RULER_SIZE = 2;

/**
 * Calculates the new scroll position to keep a specific point on the screen (focusPoint)
 * anchored to the same point on the content (SVG) after zooming.
 * This unifies Pinch, Wheel, and Footer zoom logic coordinate systems.
 */
const calculateCenteredScroll = (
    container: HTMLElement,
    svg: SVGElement,
    focusPoint: { x: number, y: number }, // Client Coordinates (Screen)
    currentZoom: number,
    newZoom: number
) => {
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // 1. Calculate the point on the SVG (unzoomed units) where the user is focusing
    // This relies on getBoundingClientRect() which correctly accounts for CSS centering
    const focusInSVGX = (focusPoint.x - svgRect.left) / currentZoom;
    const focusInSVGY = (focusPoint.y - svgRect.top) / currentZoom;

    // 2. Calculate where that point determines the scroll position relative to container
    // New Scroll = (PointInSVG * NewZoom) - (Offset from Container Top-Left)
    const pinchCtxX = focusPoint.x - containerRect.left;
    const pinchCtxY = focusPoint.y - containerRect.top;

    const newScrollLeft = (focusInSVGX * newZoom) - pinchCtxX;
    const newScrollTop = (focusInSVGY * newZoom) - pinchCtxY;

    return { left: newScrollLeft, top: newScrollTop };
};

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
    onLiftSelection,
    onContextMenu,
    isZoomLocked,
    onToggleZoomLock
}) => {
    const { width, height, grid } = data;
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const pinchDistRef = useRef<number | null>(null);
    const pinchStartRectRef = useRef<{ left: number, top: number } | null>(null);
    const startZoomRef = useRef<number>(zoom);
    const touchMode = useRef<'none' | 'paint' | 'detecting' | 'zooming' | 'panning'>('none');

    // DEFERRED ZOOM ALIGNMENT: 
    // Stores the intent to align a specific point on the SVG (unzoomed x,y) 
    // under a specific screen coordinate (clientX, clientY) AFTER the next render.
    const pendingZoomAlignmentRef = useRef<{ point: { x: number, y: number }, targetScreen: { x: number, y: number } } | null>(null);
    const lastPinchCenter = useRef<{ x: number, y: number } | null>(null);
    const currentZoomRef = useRef<number>(zoom);

    const pendingScrollRef = useRef<{ left: number, top: number } | null>(null);
    const pendingTapRef = useRef<{ x: number, y: number, gridX: number, gridY: number, time: number } | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

    useEffect(() => {
        setIsFullscreenSupported(document.fullscreenEnabled);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error("Error toggling fullscreen:", err);
        }
    };

    // Sync ref when prop changes (e.g. from footer controls)
    useEffect(() => {
        currentZoomRef.current = zoom;
    }, [zoom]);

    // Apply pending scroll immediately after render (synced with new zoom level)
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (pendingZoomAlignmentRef.current) {
            // DEFERRED ALIGNMENT (Touch Pinned Zoom)
            // The render has finished, so the SVG size/pos is now updated for `newZoom`.
            // We can now calculate the exact scroll position to align `targetScreen` with `point`.

            const alignment = pendingZoomAlignmentRef.current;
            const containRect = container.getBoundingClientRect();

            // "point" acts as a normalized coordinate in the SVG space
            // IMPORTANT: We use the CURRENT zoom (which was just applied)
            const currentAppliedZoom = zoom;

            // Calculate where the point WOULD be relative to SVG origin (0,0)
            const pointOffsetInSVG = {
                x: alignment.point.x * currentAppliedZoom,
                y: alignment.point.y * currentAppliedZoom
            };

            // The SVG itself might be centered via CSS.
            // We need to know where the SVG Left/Top is relative to Container, 
            // BUT calculating "SVG Left" directly is circular if we rely on scroll.
            // INSTEAD: We know the standard behavior:
            // ScrollLeft = (PointInSVG_FromOrigin) - (Distance_From_Container_Left_To_Use_Finger) + (SVG_Layout_Offset_If_Any)

            // Simplest way: use calculateCenteredScroll logic inversely? 
            // Actually, we can just use the SVG's *internal* coordinate system since we have the point.

            // Refined Math: 
            // We want [ScreenX] = [ContainerLeft] - [ScrollLeft] + [SVG_Left_Visual_Offset] + [Point_In_SVG_Visual]
            // Solve for ScrollLeft:
            // ScrollLeft = ContainerLeft + SVG_Left_Visual_Offset + Point_In_SVG_Visual - ScreenX

            // But 'SVG_Left_Visual_Offset' depends on... CSS centering (margin: auto).
            // This is determined by `svgRef.current.getBoundingClientRect()`? 
            // scrollLeft affects rect.left...

            // Wait, we need the "Offset from Container Content Box".
            // Let's use `calculateCenteredScroll`? No, that assumes we are transitioning.
            // Here we are ALREADY at the new zoom layout, just wrong scroll.

            if (svgRef.current) {
                // Force Scroll to 0 temporarily to measure "Natural Layout" (CSS Center)?
                // Too jerky.

                // Better: Realize that:
                // SVG_Visual_Left_Relative_To_Container = (ContainerWidth - SVGWidth)/2 (if SVG < Container)
                // OR 0 (if SVG >= Container)

                const svgWidth = width * currentAppliedZoom;
                const svgHeight = height * currentAppliedZoom;

                const containerWidth = containRect.width;
                const containerHeight = containRect.height;

                const cssOffsetX = Math.max(0, (containerWidth - svgWidth) / 2);
                const cssOffsetY = Math.max(0, (containerHeight - svgHeight) / 2);

                const targetScreenX = alignment.targetScreen.x;
                const targetScreenY = alignment.targetScreen.y;

                const relativeFingerX = targetScreenX - containRect.left;
                const relativeFingerY = targetScreenY - containRect.top;

                const newScrollLeft = cssOffsetX + pointOffsetInSVG.x - relativeFingerX;
                const newScrollTop = cssOffsetY + pointOffsetInSVG.y - relativeFingerY;

                container.scrollLeft = newScrollLeft;
                container.scrollTop = newScrollTop;
            }

            pendingZoomAlignmentRef.current = null;

        } else if (pendingScrollRef.current) {
            // ... (Keep existing GESTURE ZOOM fallback or LEGACY)
            // Only used if we have other gesture logic, but now Touch uses AlignmentRef.
            container.scrollLeft = pendingScrollRef.current.left;
            container.scrollTop = pendingScrollRef.current.top;
            pendingScrollRef.current = null;
        } else {
            // EXTERNAL ZOOM (Footer/Shortcuts)
            // ... (Keep existing logic)
            const prevZoom = currentZoomRef.current;
            const newZoom = zoom;

            // Only center if the zoom actually changed significantly (avoid micro-jitter)
            if (Math.abs(newZoom - prevZoom) > 0.001) {
                if (svgRef.current) {
                    const rect = container.getBoundingClientRect();
                    // Default focus: Center of Viewport
                    const focusPoint = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    };

                    const { left, top } = calculateCenteredScroll(
                        container,
                        svgRef.current,
                        focusPoint,
                        prevZoom,
                        newZoom
                    );

                    container.scrollLeft = left;
                    container.scrollTop = top;
                }
            }
        }
        currentZoomRef.current = zoom;
    }, [zoom]);

    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingButton, setDrawingButton] = useState<'left' | 'right' | null>(null);
    const [paintedCells, setPaintedCells] = useState<Set<number>>(new Set());
    // SYNC STROKE TRACKING: Fixes stale closure issues during rapid mouse moves
    const currentStrokeRef = useRef<Set<number>>(new Set());
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
    const [draggingStart, setDraggingStart] = useState<{ x: number, y: number } | null>(null); // For floating selection drag
    const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);


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

    const getMousePosition = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        // We use client coordinates, then transform to SVG
        // But finding the SVG CTM (Current Transformation Matrix) 
        // effectively maps client coords -> SVG coords
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };

        let clientX = 0;
        let clientY = 0;

        // Check Touches first (prioritize first touch)
        if ('touches' in e && e.touches.length > 0) {
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else if ('nativeEvent' in e && 'touches' in (e.nativeEvent as any) && (e.nativeEvent as any).touches.length > 0) {
            const touch = (e.nativeEvent as any).touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else if ('changedTouches' in e && e.changedTouches.length > 0) {
            // For touchEnd, touches is empty, use changedTouches
            const touch = e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else if ('nativeEvent' in e && 'changedTouches' in (e.nativeEvent as any) && (e.nativeEvent as any).changedTouches.length > 0) {
            const touch = (e.nativeEvent as any).changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            // Mouse
            clientX = (e as any).clientX || 0;
            clientY = (e as any).clientY || 0;
        }

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

    const touchPlacementRef = useRef<{ active: boolean, x: number, y: number } | null>(null);

    const checkIsTouch = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        return 'touches' in e || ('nativeEvent' in e && 'touches' in (e.nativeEvent as any));
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (e.cancelable) e.preventDefault();

        if ('button' in e && e.button === 2) {
            e.preventDefault();
        }

        let isRightClick = false;
        if ('button' in e) {
            if (e.button === 2) isRightClick = true;
        }
        const clickButton = isRightClick ? 'right' : 'left';

        const { x, y } = getMousePosition('nativeEvent' in e ? e.nativeEvent : e as any);
        const gridX = Math.floor(x - RULER_SIZE);
        const gridY = Math.floor(y - RULER_SIZE);

        const isTouch = checkIsTouch(e);
        const touchHoverTools = ['text', 'fill-row', 'fill-column'];

        if (activeTool === 'select') {
            // ... (Keep existing select logic)
            // Right click on select tool is now handled by onContextMenu handler
            if (isRightClick) return;

            // Check for floating selection drag


            if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
                // Check if clicking inside floating selection to drag
                if (floatingSelection &&
                    gridX >= floatingSelection.x && gridX < floatingSelection.x + floatingSelection.w &&
                    gridY >= floatingSelection.y && gridY < floatingSelection.y + floatingSelection.h) {
                    setDraggingStart({ x: gridX, y: gridY });
                    return;
                }

                // Check for implicit lift (dragging an existing selection)
                if (selection &&
                    gridX >= selection.x && gridX < selection.x + selection.w &&
                    gridY >= selection.y && gridY < selection.y + selection.h) {
                    onLiftSelection();
                    setDraggingStart({ x: gridX, y: gridY });
                    return;
                }

                setIsDrawing(true);
                setSelectionStart({ x: gridX, y: gridY });
                onSelectionChange({ x: gridX, y: gridY, w: 1, h: 1 });
            } else {
                onSelectionChange(null);
            }
            return;
        }

        if (activeTool === 'brush') {
            // ... (Keep existing brush logic)
            setIsDrawing(true);
            setDrawingButton(clickButton);
            setPaintedCells(new Set());
            // Sync tracking: Clear ref and init
            currentStrokeRef.current = new Set();
            lastGridPos.current = { x: gridX, y: gridY };

            // We pass the ref's current Set to paintAt to mutate it directly
            paintAt(gridX, gridY, clickButton, currentStrokeRef.current);

            if (currentStrokeRef.current.size > 0) {
                setPaintedCells(new Set(currentStrokeRef.current));
            }
        } else {
            // TOUCH OPTIMIZATION for Text/Row/Column Tools
            if (isTouch && touchHoverTools.includes(activeTool) && gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
                // Multi-touch guard (Pinch/Zoom)
                if ('touches' in e && e.touches.length > 1) {
                    // Cancel any active placement if second finger touches down
                    if (touchPlacementRef.current) {
                        touchPlacementRef.current = null;
                        setHoveredCell(null);
                    }
                    return;
                }

                // Prevent ghost mouse events
                if (e.cancelable) e.preventDefault();

                // Defer action to MouseUp (Release)
                // Initialize "Dragging" state for placement to show hover
                touchPlacementRef.current = { active: true, x: gridX, y: gridY };
                // Ensure hover is shown immediately
                if (!hoveredCell || hoveredCell.x !== gridX || hoveredCell.y !== gridY) {
                    setHoveredCell({ x: gridX, y: gridY });
                }
                return;
            }

            // Normal Mouse Behavior (Immediate Click)
            if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height || activeTool === 'text') {
                onCanvasClick(gridX, gridY, isRightClick);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        e.preventDefault();

        // Multi-touch guard (Pinch/Zoom) - Cancel active placement/drawing
        if ('touches' in e && e.touches.length > 1) {
            // Unconditionally clear hover on multi-touch (fixes Brush tool ghosting)
            setHoveredCell(null);

            if (touchPlacementRef.current) {
                touchPlacementRef.current = null;
            }
            if (isDrawing) {
                setIsDrawing(false);
                // active tool specific cleanup if needed
            }
            return;
        }

        const { x, y } = getMousePosition('nativeEvent' in e ? e.nativeEvent : e as any);
        const gridX = Math.floor(x - RULER_SIZE);
        const gridY = Math.floor(y - RULER_SIZE);

        const isTouch = checkIsTouch(e);

        if (!isTouch || touchPlacementRef.current?.active) {
            if (!hoveredCell || hoveredCell.x !== gridX || hoveredCell.y !== gridY) {
                setHoveredCell({ x: gridX, y: gridY });
            }
        } else {
            // Touch event but NOT in placement mode (e.g. Brush tool single finger move)
            // We generally do NOT want a hover cursor on touch unless we are explicitly "placing"
            if (hoveredCell) setHoveredCell(null);
        }

        // Touch Placement Drag Logic
        if (touchPlacementRef.current?.active) {
            touchPlacementRef.current = { ...touchPlacementRef.current, x: gridX, y: gridY };
        }

        // Floating Selection Drag
        if (draggingStart && floatingSelection) {
            const dx = gridX - draggingStart.x;
            const dy = gridY - draggingStart.y;

            if (dx !== 0 || dy !== 0) {
                const minX = -(floatingSelection.w - 1);
                const maxX = width - 1;
                const minY = -(floatingSelection.h - 1);
                const maxY = height - 1;

                const nextX = Math.max(minX, Math.min(floatingSelection.x + dx, maxX));
                const nextY = Math.max(minY, Math.min(floatingSelection.y + dy, maxY));

                if (nextX !== floatingSelection.x || nextY !== floatingSelection.y) {
                    onFloatingSelectionChange({
                        ...floatingSelection,
                        x: nextX,
                        y: nextY
                    });
                }
                setDraggingStart({ x: gridX, y: gridY });
            }
            return;
        }



        if (isDrawing && activeTool === 'select' && selectionStart) {
            // ... (Keep existing selection logic)
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
            // ... (Keep existing brush logic)
            if ('nativeEvent' in e) {
                // React Event (might wrap MouseEvent or TouchEvent)
                const native = e.nativeEvent;
                if ('buttons' in native) {
                    if (drawingButton === 'left' && (native.buttons & 1) === 0) {
                        handleMouseUp();
                        return;
                    }
                    if (drawingButton === 'right' && (native.buttons & 2) === 0) {
                        handleMouseUp();
                        return;
                    }
                }
            } else if ('buttons' in e) {
                // Native MouseEvent
                if (drawingButton === 'left' && ((e as MouseEvent).buttons & 1) === 0) {
                    handleMouseUp();
                    return;
                }
                if (drawingButton === 'right' && ((e as MouseEvent).buttons & 2) === 0) {
                    handleMouseUp();
                    return;
                }
            }

            const button = drawingButton || 'left';

            // Sync tracking: Use the ref instead of state to avoid stale closure
            // We DO NOT clone the set here, we append to the persistent stroke set
            const currentStroke = currentStrokeRef.current;

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
                    paintAt(cx, cy, button, currentStroke);
                    if (cx === x1 && cy === y1) break;
                    const e2 = 2 * err;
                    if (e2 > -dy) { err -= dy; cx += sx; }
                    if (e2 < dx) { err += dx; cy += sy; }
                }
            } else {
                paintAt(gridX, gridY, button, currentStroke);
            }

            lastGridPos.current = { x: gridX, y: gridY };
            // Sync state for rendering
            setPaintedCells(new Set(currentStroke));
        }
    };

    const handleMouseUp = () => {
        if (pinchDistRef.current !== null) {
            pinchDistRef.current = null;
        }

        // TOUCH OPTIMIZATION: Commit placement on release
        if (touchPlacementRef.current?.active) {
            const { x, y } = touchPlacementRef.current;
            // Only fire if valid bounds (should be clamped/checked already, but safety first)
            if (x >= 0 && x < width && y >= 0 && y < height) {
                // Assume Left Click for touch tap release
                onCanvasClick(x, y, false);
            }
            touchPlacementRef.current = null;
            setHoveredCell(null); // Clear preview
            return;
        }



        if (activeTool === 'select') {
            // Priority 1: Check if we were dragging a Floating Selection
            if (draggingStart) {
                setDraggingStart(null);
                return; // Drag finished (even if 0 distance), do not deselect
            }

            // Priority 2: Check for Single Click (Deselect)
            const isSingleCell = selection && selection.w === 1 && selection.h === 1;
            const isSamePos = selection && selectionStart && selection.x === selectionStart.x && selection.y === selectionStart.y;

            if (isSingleCell && isSamePos) {
                // It was a click, not a drag -> Deselect
                onSelectionChange(null);
            }

            // Priority 3: End Selection Creation
            setIsDrawing(false);
            setSelectionStart(null);
            return;
        }

        if (isDrawing && currentStrokeRef.current.size > 0 && activeTool === 'brush') {
            const newGrid = [...grid];
            const colorToApply = drawingButton === 'right' ? secondaryColorId : primaryColorId;
            const stitchToApply = drawingButton === 'right' ? secondaryStitchId : primaryStitchId;

            currentStrokeRef.current.forEach(index => {
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
        currentStrokeRef.current = new Set();
    };

    const handleMouseLeave = () => {
        if (isDrawing) {
            handleMouseUp();
        }
        setHoveredCell(null);
    };

    // --- NEW TOUCH HANDLERS ---

    // Refs to current handlers to allow useEffect binding without stale closures
    const handlersRef = useRef({
        handleTouchStart: (e: TouchEvent) => { },
        handleTouchMove: (e: TouchEvent) => { },
        handleTouchEnd: (e: TouchEvent) => { }
    });

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const { x, y } = getMousePosition(e);
            const gridX = Math.floor(x - RULER_SIZE);
            const gridY = Math.floor(y - RULER_SIZE);

            // CLASSIFY TOOL: Instant vs Continuous
            // Continuous: Brush, Select, Text, Rows, Cols (Drag to operate/place)
            // Instant: Fill, Eyedropper, Replace (Click to operate)
            const continuousTools = ['brush', 'select', 'text', 'fill-row', 'fill-column'];
            const isInstantTool = !continuousTools.includes(activeTool) && !floatingSelection;

            if (isInstantTool) {
                // DEFER ACTION: Wait for clean release (Tap-to-Execute)
                touchMode.current = 'paint'; // Use paint mode for single finger tracking
                pendingTapRef.current = { x, y, gridX, gridY, time: Date.now() };
            } else {
                // CONTINUOUS ACTION: Start immediately
                touchMode.current = 'paint';
                handleMouseDown(e as any);
            }

        } else if (e.touches.length === 2) {
            touchMode.current = 'detecting'; // Start in detecting mode
            if (e.cancelable) e.preventDefault();

            // CANCEL PENDING TAP: If second finger lands, it's a gesture, not a tap
            pendingTapRef.current = null;

            const info = getPinchInfo(e);
            if (info) {
                pinchDistRef.current = info.dist;
                lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                startZoomRef.current = currentZoomRef.current;

                // CACHE LAYOUT STATE for Strict Pinned Zoom
                if (svgRef.current) {
                    const r = svgRef.current.getBoundingClientRect();
                    pinchStartRectRef.current = { left: r.left, top: r.top };
                }
            }

            // ABORT PAINT: If we started drawing with the first finger (stray dot), cancel it!
            setIsDrawing(false);
            setPaintedCells(new Set()); // Discard pending pixels
            setHoveredCell(null);

            // ABORT SELECTION: If we started selecting, cancel it too!
            if (activeTool === 'select') {
                onSelectionChange(null);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchMode.current === 'paint') {
            handleMouseMove(e);
        } else if ((touchMode.current === 'detecting' || touchMode.current === 'zooming' || touchMode.current === 'panning') && e.touches.length === 2) {
            e.preventDefault(); // Critical to prevent browser zoom/pan
            const container = containerRef.current;
            if (!container || pinchDistRef.current === null || !lastPinchCenter.current) return;

            const info = getPinchInfo(e);
            if (!info || info.dist === 0) return;

            const distDelta = Math.abs(info.dist - pinchDistRef.current);
            const dx = info.centerX - lastPinchCenter.current.x;
            const dy = info.centerY - lastPinchCenter.current.y;
            const panDelta = Math.sqrt(dx * dx + dy * dy);

            // --- LOCK LOGIC ---
            if (touchMode.current === 'detecting') {
                const ZOOM_THRESHOLD = 20; // px - Higher to prevent accidental zooms
                const PAN_THRESHOLD = 35;   // px - Prevent initial wobble

                if (distDelta > ZOOM_THRESHOLD) {
                    touchMode.current = 'zooming';
                    // Reset reference to prevent jump
                    pinchDistRef.current = info.dist;
                    lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                    // LOCK STATE: Capture robust state for zoom calc
                    startZoomRef.current = currentZoomRef.current;
                    if (container && svgRef.current) {
                        const r = svgRef.current.getBoundingClientRect();
                        pinchStartRectRef.current = { left: r.left, top: r.top };
                    }
                } else if (panDelta > PAN_THRESHOLD) {
                    touchMode.current = 'panning';
                    // Reset reference to prevent jump
                    lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                }
                return; // Wait for next frame to apply movement once locked
            }

            // --- EXECUTE LOCKED MODE ---

            if (touchMode.current === 'zooming') {
                const startZoom = startZoomRef.current; // Cached Start Zoom
                const scale = info.dist / pinchDistRef.current;
                const newZoom = Math.max(MIN_ZOOM, Math.min(startZoom * scale, MAX_ZOOM));

                // --- ROBUST PINNED ZOOM (Lag-Proof) ---
                // We use cached start state to calculate where the SVG *should* be
                const startRect = pinchStartRectRef.current;

                if (startRect) {
                    // 1. Calculate the point on the image that WAS under the pinch center at start
                    const startPinchX = lastPinchCenter.current.x;
                    const startPinchY = lastPinchCenter.current.y;

                    const pointX = (startPinchX - startRect.left) / startZoom;
                    const pointY = (startPinchY - startRect.top) / startZoom;

                    // 2. DEFER ALIGNMENT:
                    // We don't calculate scroll here. We just say:
                    // "I want (pointX, pointY) to be at (info.centerX, info.centerY) after render."
                    pendingZoomAlignmentRef.current = {
                        point: { x: pointX, y: pointY },
                        targetScreen: { x: info.centerX, y: info.centerY }
                    };
                }

                onZoomChange(newZoom);
            }
            else if (touchMode.current === 'panning') {
                // Strict Pan - NO Zoom
                const dX = info.centerX - lastPinchCenter.current.x;
                const dY = info.centerY - lastPinchCenter.current.y;

                container.scrollLeft -= dX;
                container.scrollTop -= dY;

                lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                // Also update pinchDistRef to avoid jump if we somehow switch (unlikely with strict lock)
                pinchDistRef.current = info.dist;
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchMode.current === 'paint') {
            handleMouseUp();
        }

        if (e.touches.length === 0) {
            // Drop locks
            touchMode.current = 'none';
            pinchDistRef.current = null;
            lastPinchCenter.current = null;
        } else if (e.touches.length < 2 && (touchMode.current === 'detecting' || touchMode.current === 'zooming' || touchMode.current === 'panning')) {
            // Drop locks if less than 2 fingers
            touchMode.current = 'none';
        }
    };

    const handleTouchMove_Native = (e: TouchEvent) => {
        const TAP_TOLERANCE = 5; // px

        if (touchMode.current === 'paint') {
            // CHECK MOVEMENT FOR PENDING TAP
            if (pendingTapRef.current) {
                const { x, y } = getMousePosition(e as any); // Safe cast for helper
                // Note: getMousePosition returns SVG coords. 
                // We should ideally check screen movement for tap tolerance to be zoom-independent,
                // but checking grid movement is "okay" if we are careful. 
                // Better: Check clientX/Y delta!
                const t = e.touches[0];
                // We didn't store initial clientX/Y in pendingTap, let's just abort if we move significantly in GRID coords?
                // Actually, let's be strict. If you drag, it's not a tap.

                // If we had the initial screen coords we could do: dist(start, current) > 10px
                // Since we only stored converted coords, let's verify if grid changed significantly?
                // Or better, just utilize the 'brush' logic: 'handleMouseMove' will be called?
                // No, we SKIPPED handleMouseDown for instant tools, so handleMouseMove might be weird.
                // Let's just invalidate if we move too far.
                const dx = Math.abs(x - pendingTapRef.current.x);
                const dy = Math.abs(y - pendingTapRef.current.y);

                // 10 "Screen Pixels" roughly translates to 10 / Zoom "SVG Units".
                // Let's use a rough heuristic: if we move > 0.5 grid units, it's a drag?
                if (dx > 0.5 || dy > 0.5) {
                    pendingTapRef.current = null;
                }
                return;
            }

            handleMouseMove(e as any);
        } else if ((touchMode.current === 'detecting' || touchMode.current === 'zooming' || touchMode.current === 'panning') && e.touches.length === 2) {
            // CANCEL PENDING TAP
            pendingTapRef.current = null;

            if (e.cancelable) e.preventDefault();
            const container = containerRef.current;
            if (!container || pinchDistRef.current === null || !lastPinchCenter.current) return;

            const info = getPinchInfo(e);
            if (!info || info.dist === 0) return;

            const distDelta = Math.abs(info.dist - pinchDistRef.current);
            const dx = info.centerX - lastPinchCenter.current.x;
            const dy = info.centerY - lastPinchCenter.current.y;
            const panDelta = Math.sqrt(dx * dx + dy * dy);

            // --- LOCK LOGIC ---
            if (touchMode.current === 'detecting') {
                const ZOOM_THRESHOLD = 20; // px
                const PAN_THRESHOLD = 5;   // px

                if (distDelta > ZOOM_THRESHOLD) {
                    touchMode.current = 'zooming';
                    pinchDistRef.current = info.dist;
                    lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                } else if (panDelta > PAN_THRESHOLD) {
                    touchMode.current = 'panning';
                    lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                }
                return;
            }

            // --- EXECUTE LOCKED MODE ---

            if (touchMode.current === 'zooming') {
                const startZoom = startZoomRef.current;
                const scale = info.dist / pinchDistRef.current;
                const newZoom = Math.max(MIN_ZOOM, Math.min(startZoom * scale, MAX_ZOOM));

                // --- ROBUST PINNED ZOOM (Lag-Proof) ---
                // We use cached start state to calculate where the SVG *should* be
                const startRect = pinchStartRectRef.current;

                if (startRect) {
                    // 1. Calculate the point on the image that WAS under the pinch center at start
                    const startPinchX = lastPinchCenter.current.x;
                    const startPinchY = lastPinchCenter.current.y;

                    const pointX = (startPinchX - startRect.left) / startZoom;
                    const pointY = (startPinchY - startRect.top) / startZoom;

                    // 2. DEFER ALIGNMENT:
                    // We don't calculate scroll here. We just say:
                    // "I want (pointX, pointY) to be at (info.centerX, info.centerY) after render."
                    pendingZoomAlignmentRef.current = {
                        point: { x: pointX, y: pointY },
                        targetScreen: { x: info.centerX, y: info.centerY }
                    };
                }

                onZoomChange(newZoom);
            }
            else if (touchMode.current === 'panning') {
                const dX = info.centerX - lastPinchCenter.current.x;
                const dY = info.centerY - lastPinchCenter.current.y;

                container.scrollLeft -= dX;
                container.scrollTop -= dY;

                lastPinchCenter.current = { x: info.centerX, y: info.centerY };
                pinchDistRef.current = info.dist;
            }
        }
    };

    const handleTouchEnd_Native = (e: TouchEvent) => {
        if (touchMode.current === 'paint') {
            // EXECUTE PENDING TAP
            if (pendingTapRef.current) {
                // If we are here, we haven't moved significantly or cancelled
                onCanvasClick(pendingTapRef.current.gridX, pendingTapRef.current.gridY, false);
                pendingTapRef.current = null;
            } else {
                handleMouseUp();
            }
        }

        if (e.touches.length === 0) {
            touchMode.current = 'none';
            pinchDistRef.current = null;
            lastPinchCenter.current = null;
            pendingTapRef.current = null; // Cleanup
        } else if (e.touches.length < 2 && (touchMode.current === 'detecting' || touchMode.current === 'zooming' || touchMode.current === 'panning')) {
            touchMode.current = 'none';
        }
    };

    // Keep handlersRef updated
    useEffect(() => {
        handlersRef.current = {
            handleTouchStart: handleTouchStart,
            handleTouchMove: handleTouchMove_Native,
            handleTouchEnd: handleTouchEnd_Native
        };
    });

    // Attach Non-Passive Listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onStart = (e: TouchEvent) => handlersRef.current.handleTouchStart(e);
        const onMove = (e: TouchEvent) => handlersRef.current.handleTouchMove(e);
        const onEnd = (e: TouchEvent) => handlersRef.current.handleTouchEnd(e);

        container.addEventListener('touchstart', onStart, { passive: false });
        container.addEventListener('touchmove', onMove, { passive: false });
        container.addEventListener('touchend', onEnd, { passive: false });
        container.addEventListener('touchcancel', onEnd, { passive: false });

        return () => {
            container.removeEventListener('touchstart', onStart);
            container.removeEventListener('touchmove', onMove);
            container.removeEventListener('touchend', onEnd);
            container.removeEventListener('touchcancel', onEnd);
        };
    }, []);

    // Helper for safe bounding
    const min = Math.min;

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const svg = svgRef.current;
        if (!svg) return;

        const rect = container.getBoundingClientRect();
        const viewportCenterX = rect.width / 2;
        const viewportCenterY = rect.height / 2;

        const prevZoom = zoom;
        const newZoom = e.deltaY < 0
            ? Math.min(zoom * 1.2, MAX_ZOOM)
            : Math.max(zoom / 1.2, MIN_ZOOM);

        if (newZoom !== prevZoom) {
            const focusPoint = { x: e.clientX, y: e.clientY };

            const { left, top } = calculateCenteredScroll(
                container,
                svg,
                focusPoint,
                prevZoom,
                newZoom
            );

            // Apply updates
            onZoomChange(newZoom);

            // Use requestAnimationFrame for smooth visual update
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    containerRef.current.scrollLeft = left;
                    containerRef.current.scrollTop = top;
                }
            });
        }
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

    // --- WHEEL MECHANICS (Native Listener) ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Check for pinch-zoom (ctrlKey + wheel is typical for trackpad pinch on some browsers,
            // but standard wheel zoom is usually just wheel. We use the matrix definition.)
            // However, browsers treat 'pinch' as Ctrl+Wheel events often.
            // We'll stick to the Requested Matrix:

            // NOTE: Chrome/Firefox use different deltaModes. We assume px (0) or lines (1).
            // A rough normalization:
            const delta = e.deltaY;
            const isShift = e.shiftKey;
            const isCtrl = e.ctrlKey || e.metaKey; // "Mod"

            // 1. GLOBAL: Shift + Wheel = PAN HORIZONTAL
            if (isShift) {
                e.preventDefault();
                container.scrollLeft += delta;
                return;
            }

            // 2. LOGIC MATRIX
            // If LOCKED:
            //   - Wheel = Pan Vertical
            //   - Mod + Wheel = Zoom
            // If UNLOCKED (Default):
            //   - Wheel = Zoom
            //   - Mod + Wheel = Pan Vertical

            let isZoomAction = false;

            if (isZoomLocked) {
                // LOCKED MODE
                if (isCtrl) {
                    isZoomAction = true;
                } else {
                    // Pan Vertical
                    container.scrollTop += delta;
                    e.preventDefault();
                    return;
                }
            } else {
                // UNLOCKED MODE
                if (isCtrl) {
                    // Pan Vertical
                    container.scrollTop += delta;
                    e.preventDefault();
                    return;
                } else {
                    isZoomAction = true;
                }
            }

            // 3. PERFORM ZOOM
            if (isZoomAction) {
                e.preventDefault();
                // Determine direction
                // deltaY > 0 means scrolling DOWN (pulling towards you) -> usually Zoom OUT
                // deltaY < 0 means scrolling UP (pushing away) -> usually Zoom IN
                // Standard mapping:
                const zoomFactor = 1.1; // 10% change
                let newZoom = zoom;

                if (delta < 0) {
                    newZoom = Math.min(zoom * zoomFactor, MAX_ZOOM);
                } else {
                    newZoom = Math.max(zoom / zoomFactor, MIN_ZOOM);
                }

                onZoomChange(newZoom);
            }
        };

        // Non-passive to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [zoom, onZoomChange, isZoomLocked]);

    const getCursor = () => {
        if (activeTool === 'select') {
            if (floatingSelection && hoveredCell) {
                if (hoveredCell.x >= floatingSelection.x && hoveredCell.x < floatingSelection.x + floatingSelection.w &&
                    hoveredCell.y >= floatingSelection.y && hoveredCell.y < floatingSelection.y + floatingSelection.h) {
                    return 'move';
                }
            }
            if (selection && hoveredCell) {
                if (hoveredCell.x >= selection.x && hoveredCell.x < selection.x + selection.w &&
                    hoveredCell.y >= selection.y && hoveredCell.y < selection.y + selection.h) {
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
        <>
            {isFullscreenSupported && (
                <div className="absolute top-4 left-4 z-10" data-role="ui-interaction">
                    <Button variant="secondary" onClick={toggleFullscreen} className="p-2 shadow-md hover:shadow-lg opacity-80 hover:opacity-100 transition-all font-sans font-medium hover:bg-white bg-white/90" aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                        <Icon name={isFullscreen ? "minimize" : "maximize"} size="md" />
                    </Button>
                </div>
            )}
            <div
                ref={containerRef}
                className="w-full h-full bg-gray-200 overflow-hidden grid place-items-center touch-none select-none"
                style={{ cursor: getCursor() }}
                onContextMenu={handleContextMenu}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                data-role="background"
            >
                <svg
                    ref={svgRef}
                    width={svgTotalWidth * zoom}
                    height={svgTotalHeight * zoom}
                    viewBox={`0 0 ${svgTotalWidth} ${svgTotalHeight}`}
                    shapeRendering="crispEdges"
                    data-role="canvas-interaction"
                >
                    <g transform={`translate(${RULER_SIZE}, ${RULER_SIZE})`}>
                        <GridRenderer
                            width={width}
                            height={height}
                            grid={temporaryGrid}
                            yarnColorMap={yarnColorMap}
                            stitchMap={stitchMap}
                            showGridLines={showGridLines}
                            zoom={zoom}
                            floatingSelection={floatingSelection}
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
                    <Rulers
                        width={width}
                        height={height}
                        zoom={zoom}
                        rulerSize={RULER_SIZE}
                        svgTotalWidth={svgTotalWidth}
                        svgTotalHeight={svgTotalHeight}
                    />
                </svg >
            </div >
        </>
    );
};
