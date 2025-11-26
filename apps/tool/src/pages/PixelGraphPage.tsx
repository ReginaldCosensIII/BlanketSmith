import React, { useState, useRef, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { PixelGridData, YarnColor, CellData, Symmetry, ContextMenuItem } from '../types';
import { useProject } from '../context/ProjectContext';
import { PixelGridEditor } from '../components/PixelGridEditor';
import { processImageToGrid, findClosestYarnColor } from '../services/projectService';
import { Button, Icon, ContextMenu, Modal } from '../components/ui/SharedComponents';
import { PIXEL_FONT } from '../constants';
import { useCanvasLogic } from '../hooks/useCanvasLogic';

// Helper functions
const hexToRgb = (hex: string): [number, number, number] => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export const PixelGraphPage: React.FC<{ zoom: number; onZoomChange: (newZoom: number) => void; isLeftHanded: boolean; onToggleLeftHanded: () => void; }> = ({ zoom, onZoomChange, isLeftHanded, onToggleLeftHanded }) => {
    type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column' | 'eyedropper' | 'text' | 'select';
    type MirrorDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
    type ColorMode = 'HEX' | 'RGB' | 'HSL';

    const { state, dispatch } = useProject();

    // --- PERSISTENT STATE INITIALIZATION ---
    const [primaryColorId, setPrimaryColorId] = useState<string | null>(() => localStorage.getItem('editor_primaryColorId') || null);
    const [secondaryColorId, setSecondaryColorId] = useState<string | null>(() => localStorage.getItem('editor_secondaryColorId') || null);
    const [isPanelOpen, setIsPanelOpen] = useState(() => localStorage.getItem('editor_isPanelOpen') === 'true');
    const [activeTool, setActiveTool] = useState<Tool>(() => (localStorage.getItem('editor_activeTool') as Tool) || 'brush');

    const [isProcessing, setIsProcessing] = useState(false);
    const [showGridLines, setShowGridLines] = useState(() => localStorage.getItem('editor_showGridLines') !== 'false'); // Default true
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [maxImportColors, setMaxImportColors] = useState(() => Number(localStorage.getItem('editor_maxImportColors')) || 16);

    const [brushSize, setBrushSize] = useState(() => Number(localStorage.getItem('editor_brushSize')) || 1);
    const [rowFillSize, setRowFillSize] = useState(() => Number(localStorage.getItem('editor_rowFillSize')) || 1);
    const [colFillSize, setColFillSize] = useState(() => Number(localStorage.getItem('editor_colFillSize')) || 1);
    const [textToolInput, setTextToolInput] = useState(() => localStorage.getItem('editor_textToolInput') || 'Text');
    const [textSize, setTextSize] = useState(() => Number(localStorage.getItem('editor_textSize')) || 1);

    const [symmetry, setSymmetry] = useState<Symmetry>(() => {
        const saved = localStorage.getItem('editor_symmetry');
        return saved ? JSON.parse(saved) : { vertical: false, horizontal: false };
    });

    // --- PERSISTENCE EFFECTS ---
    useEffect(() => { if (primaryColorId) localStorage.setItem('editor_primaryColorId', primaryColorId); }, [primaryColorId]);
    useEffect(() => { if (secondaryColorId) localStorage.setItem('editor_secondaryColorId', secondaryColorId); }, [secondaryColorId]);
    useEffect(() => { localStorage.setItem('editor_isPanelOpen', String(isPanelOpen)); }, [isPanelOpen]);
    useEffect(() => { localStorage.setItem('editor_activeTool', activeTool); }, [activeTool]);

    useEffect(() => { localStorage.setItem('editor_showGridLines', String(showGridLines)); }, [showGridLines]);
    useEffect(() => { localStorage.setItem('editor_maxImportColors', String(maxImportColors)); }, [maxImportColors]);
    useEffect(() => { localStorage.setItem('editor_brushSize', String(brushSize)); }, [brushSize]);
    useEffect(() => { localStorage.setItem('editor_rowFillSize', String(rowFillSize)); }, [rowFillSize]);
    useEffect(() => { localStorage.setItem('editor_colFillSize', String(colFillSize)); }, [colFillSize]);
    useEffect(() => { localStorage.setItem('editor_textToolInput', textToolInput); }, [textToolInput]);
    useEffect(() => { localStorage.setItem('editor_textSize', String(textSize)); }, [textSize]);
    useEffect(() => { localStorage.setItem('editor_symmetry', JSON.stringify(symmetry)); }, [symmetry]);
    const [mirrorConfirm, setMirrorConfirm] = useState<{ isOpen: boolean, direction: MirrorDirection | null }>({ isOpen: false, direction: null });
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({ unit: 'in', stitchesPerUnit: 4, rowsPerUnit: 4, hookSize: '', yarnPerStitch: 1 });
    const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const [clipboard, setClipboard] = useState<{ width: number, height: number, data: CellData[] } | null>(null);
    const [showCenterGuides, setShowCenterGuides] = useState(() => localStorage.getItem('editor_showCenterGuides') === 'true');

    useEffect(() => { localStorage.setItem('editor_showCenterGuides', String(showCenterGuides)); }, [showCenterGuides]);
    const [replaceFromColor, setReplaceFromColor] = useState<string | null | undefined>(undefined);
    const [replaceToColor, setReplaceToColor] = useState<string | null | undefined>(undefined);
    const [replaceTarget, setReplaceTarget] = useState<'from' | 'to' | null>(null);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [tempCustomColor, setTempCustomColor] = useState('#FF0000');
    const [pickerMode, setPickerMode] = useState<ColorMode>('HEX');
    const [hsl, setHsl] = useState<[number, number, number]>([0, 100, 50]);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

    const project = state.project?.type === 'pixel' ? state.project : null;
    const projectData = project?.data as PixelGridData | undefined;

    const yarnColorMap = useMemo(() => {
        if (!project) return new Map<string, YarnColor>();
        return new Map(project.yarnPalette.map(yc => [yc.id, yc]));
    }, [project]);

    const [newWidth, setNewWidth] = useState(project?.data && 'width' in project.data ? project.data.width : 50);
    const [newHeight, setNewHeight] = useState(project?.data && 'height' in project.data ? project.data.height : 50);

    const { rotateSubGrid, flipSubGrid } = useCanvasLogic(projectData?.width || 0, projectData?.height || 0, symmetry);
    const projectStateRef = useRef(state);
    useEffect(() => { projectStateRef.current = state; }, [state]);

    // --- TOOL CHANGE HANDLER (Transition Logic) ---
    const handleToolChange = (newTool: Tool) => {
        if (activeTool === 'select' && newTool !== 'select') {
            setSelection(null);
        }
        if (newTool === 'replace') {
            setReplaceTarget('from');
        } else {
            setReplaceTarget(null);
        }
        setActiveTool(newTool);
    };

    const updateGrid = useCallback((newGrid: CellData[]) => {
        const usedYarnSet = new Set<string>();
        newGrid.forEach(cell => { if (cell.colorId) usedYarnSet.add(cell.colorId); });
        dispatch({ type: 'UPDATE_PROJECT_DATA', payload: { grid: newGrid, palette: Array.from(usedYarnSet) } });
    }, [dispatch]);

    // --- SELECTION ACTIONS ---
    const handleCopy = () => {
        if (!selection || !projectData) return;
        const { x, y, w, h } = selection;
        const data: CellData[] = [];
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                const idx = (y + row) * projectData.width + (x + col);
                data.push(projectData.grid[idx]);
            }
        }
        setClipboard({ width: w, height: h, data });
    };
    const handlePaste = () => {
        if (!clipboard || !projectData) return;
        const startX = selection ? selection.x : 0;
        const startY = selection ? selection.y : 0;
        const newGrid = [...projectData.grid];
        for (let row = 0; row < clipboard.height; row++) {
            for (let col = 0; col < clipboard.width; col++) {
                const destX = startX + col;
                const destY = startY + row;
                if (destX < projectData.width && destY < projectData.height) {
                    const srcIdx = row * clipboard.width + col;
                    const destIdx = destY * projectData.width + destX;
                    newGrid[destIdx] = clipboard.data[srcIdx];
                }
            }
        }
        updateGrid(newGrid);
    };
    const handleClearSelection = () => {
        if (!selection || !projectData) return;
        const newGrid = [...projectData.grid];
        const { x, y, w, h } = selection;
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                const idx = (y + row) * projectData.width + (x + col);
                newGrid[idx] = { colorId: null };
            }
        }
        updateGrid(newGrid);
    };
    const handleCut = () => { handleCopy(); handleClearSelection(); };
    const handleFlipSelection = (direction: 'horizontal' | 'vertical') => {
        if (!selection || !projectData) return;
        const { x, y, w, h } = selection;
        const subGrid: CellData[] = [];
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                subGrid.push(projectData.grid[(y + row) * projectData.width + (x + col)]);
            }
        }
        const flipped = flipSubGrid(subGrid, w, h, direction);
        const newGrid = [...projectData.grid];
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                const idx = (y + row) * projectData.width + (x + col);
                newGrid[idx] = flipped[row * w + col];
            }
        }
        updateGrid(newGrid);
    };
    const handleRotateSelection = () => {
        if (!selection || !projectData) return;
        const { x, y, w, h } = selection;
        if (w !== h) { if (!window.confirm("Rotation is currently best supported for square selections. Continue?")) return; }
        const subGrid: CellData[] = [];
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                subGrid.push(projectData.grid[(y + row) * projectData.width + (x + col)]);
            }
        }
        const rotated = rotateSubGrid(subGrid, w, h);
        if (w === h) {
            const newGrid = [...projectData.grid];
            for (let row = 0; row < h; row++) {
                for (let col = 0; col < w; col++) {
                    const idx = (y + row) * projectData.width + (x + col);
                    newGrid[idx] = rotated[row * w + col];
                }
            }
            updateGrid(newGrid);
        }
    };

    // --- SELECTION HANDLERS ---
    const handleSelectAll = () => {
        if (!projectData) return;
        setSelection({ x: 0, y: 0, w: projectData.width, h: projectData.height });
    };

    // --- CONTEXT MENU HANDLER ---
    const getContextMenuOptions = (): ContextMenuItem[] => {
        const options: ContextMenuItem[] = [];

        options.push({ label: 'Select All', action: handleSelectAll, shortcut: 'Ctrl+A' });
        options.push({ label: 'Separator', action: () => { }, separator: true });

        options.push({
            label: 'Copy',
            action: handleCopy,
            shortcut: 'Ctrl+C',
            disabled: !selection
        });
        options.push({
            label: 'Cut',
            action: handleCut,
            shortcut: 'Ctrl+X',
            disabled: !selection
        });

        options.push({
            label: 'Paste',
            action: handlePaste,
            shortcut: 'Ctrl+V',
            disabled: !clipboard
        });

        options.push({ label: 'Separator', action: () => { }, separator: true });

        options.push({
            label: 'Flip Horizontal',
            action: () => handleFlipSelection('horizontal'),
            disabled: !selection
        });
        options.push({
            label: 'Flip Vertical',
            action: () => handleFlipSelection('vertical'),
            disabled: !selection
        });
        options.push({
            label: 'Rotate 90°',
            action: handleRotateSelection,
            disabled: !selection
        });

        options.push({ label: 'Separator', action: () => { }, separator: true });

        options.push({
            label: 'Clear Area',
            action: handleClearSelection,
            shortcut: 'Del',
            disabled: !selection
        });

        return options;
    };

    const handleOpenContextMenu = (x: number, y: number) => {
        // Always open if we have options (which we now always do because of Select All)
        if (getContextMenuOptions().length > 0) {
            setContextMenu({ x, y });
        }
    };

    // ... KEYBOARD SHORTCUTS ...
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const key = e.key.toLowerCase();
            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && key === 'z') { e.preventDefault(); dispatch({ type: 'UNDO' }); return; }
            if (isCtrl && key === 'y') { e.preventDefault(); dispatch({ type: 'REDO' }); return; }
            if (isCtrl && key === 'c') { e.preventDefault(); handleCopy(); return; }
            if (isCtrl && key === 'v') { e.preventDefault(); handlePaste(); return; }
            if (isCtrl && key === 'x') { e.preventDefault(); handleCut(); return; }
            if (isCtrl && key === 'a') { e.preventDefault(); handleSelectAll(); return; }
            if (key === 'delete' || key === 'backspace') { handleClearSelection(); return; }

            switch (key) {
                case 'b': handleToolChange('brush'); break;
                case 'f': handleToolChange('fill'); break;
                case 'e': handleToolChange('eyedropper'); break;
                case 'r': handleToolChange('replace'); break;
                case 't': handleToolChange('text'); break;
                case 's': handleToolChange('select'); break;
                case 'c': setShowCenterGuides(prev => !prev); break;
                case 'x': { if (!isCtrl) { const temp = primaryColorId; setPrimaryColorId(secondaryColorId); setSecondaryColorId(temp); } break; }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [primaryColorId, secondaryColorId, dispatch, selection, clipboard]);

    useEffect(() => { if (project && !primaryColorId) { if (project.yarnPalette.length > 0) setPrimaryColorId(project.yarnPalette[0].id); } }, [project]);
    useEffect(() => { if (isColorPickerOpen) { const rgb = hexToRgb(tempCustomColor); setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2])); } }, [isColorPickerOpen]);
    useEffect(() => { if (project?.data && 'width' in project.data) { setNewWidth(project.data.width); setNewHeight(project.data.height); } }, [project]);

    const handleGridChange = (newGrid: CellData[]) => { if (!project || !project.data || !('grid' in project.data)) return; updateGrid(newGrid); };
    const handleFillCanvas = () => { if (!projectData || primaryColorId === undefined) return; const newGrid = Array.from({ length: projectData.width * projectData.height }, () => ({ colorId: primaryColorId })); updateGrid(newGrid); };
    const handleReplace = () => { if (!projectData || replaceFromColor === undefined || replaceToColor === undefined) return; const newGrid = projectData.grid.map(cell => cell.colorId === replaceFromColor ? { ...cell, colorId: replaceToColor } : cell); updateGrid(newGrid as CellData[]); setReplaceFromColor(undefined); setReplaceToColor(undefined); };
    const handleCanvasClick = (gridX: number, gridY: number, isRightClick: boolean) => {
        if (!projectData) return;
        const { width, height, grid } = projectData;
        const index = gridY * width + gridX;
        const clickedColorId = grid[index].colorId;

        if (activeTool === 'eyedropper') { if (isRightClick) { setSecondaryColorId(clickedColorId); } else { setPrimaryColorId(clickedColorId); } handleToolChange('brush'); return; }

        if (activeTool === 'replace') {
            if (replaceTarget === 'from') {
                setReplaceFromColor(clickedColorId);
                setReplaceTarget('to');
            } else if (replaceTarget === 'to') {
                setReplaceToColor(clickedColorId);
                setReplaceTarget(null);
            }
            return;
        }

        const colorToApply = isRightClick ? secondaryColorId : primaryColorId;
        let newGrid = [...grid];
        let changed = false;

        // --- FLOOD FILL ALGORITHM ---
        const floodFill = (startX: number, startY: number, targetColor: string | null, replacementColor: string | null) => {
            if (targetColor === replacementColor) return;

            const queue: [number, number][] = [[startX, startY]];
            const visited = new Set<number>();

            while (queue.length > 0) {
                const [x, y] = queue.pop()!;
                const idx = y * width + x;

                if (visited.has(idx)) continue;
                visited.add(idx);

                if (newGrid[idx].colorId === targetColor) {
                    newGrid[idx] = { ...newGrid[idx], colorId: replacementColor };
                    changed = true;

                    if (x + 1 < width) queue.push([x + 1, y]);
                    if (x - 1 >= 0) queue.push([x - 1, y]);
                    if (y + 1 < height) queue.push([x, y + 1]);
                    if (y - 1 >= 0) queue.push([x, y - 1]);
                }
            }
        };

        const applyFill = (points: { x: number, y: number }[], tool: 'fill-row' | 'fill-column') => {
            points.forEach(point => {
                if (tool === 'fill-row') {
                    const offset = Math.floor((rowFillSize - 1) / 2); const startY = point.y - offset;
                    for (let i = 0; i < rowFillSize; i++) { const currentY = startY + i; if (currentY >= 0 && currentY < height) { for (let x = 0; x < width; x++) { const idx = currentY * width + x; if (newGrid[idx].colorId !== colorToApply) { newGrid[idx] = { ...newGrid[idx], colorId: colorToApply }; changed = true; } } } }
                } else {
                    const offset = Math.floor((colFillSize - 1) / 2); const startX = point.x - offset;
                    for (let i = 0; i < colFillSize; i++) { const currentX = startX + i; if (currentX >= 0 && currentX < width) { for (let y = 0; y < height; y++) { const idx = y * width + currentX; if (newGrid[idx].colorId !== colorToApply) { newGrid[idx] = { ...newGrid[idx], colorId: colorToApply }; changed = true; } } } }
                }
            });
        };

        if (activeTool === 'fill') {
            floodFill(gridX, gridY, clickedColorId, colorToApply);
        } else if (activeTool === 'text') {
            let currentX = gridX; textToolInput.toUpperCase().split('').forEach(char => { const charData = PIXEL_FONT[char]; if (charData) { charData.forEach((row, yOffset) => { row.forEach((pixel, xOffset) => { if (pixel === 1) { for (let scaleY = 0; scaleY < textSize; scaleY++) { for (let scaleX = 0; scaleX < textSize; scaleX++) { const finalX = currentX + (xOffset * textSize) + scaleX; const finalY = gridY + (yOffset * textSize) + scaleY; if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) { const idx = finalY * width + finalX; if (newGrid[idx].colorId !== colorToApply) { newGrid[idx] = { ...newGrid[idx], colorId: colorToApply }; changed = true; } } } } } }); }); currentX += (charData[0].length * textSize) + (1 * textSize); } });
        } else if (activeTool === 'fill-row' || activeTool === 'fill-column') {
            const pointsToFill = [{ x: gridX, y: gridY }];
            if (activeTool === 'fill-row') {
                if (symmetry.horizontal) pointsToFill.push({ x: gridX, y: height - 1 - gridY }); if (symmetry.vertical) pointsToFill.push({ x: width - 1 - gridX, y: gridY }); if (symmetry.vertical && symmetry.horizontal) pointsToFill.push({ x: width - 1 - gridX, y: height - 1 - gridY });
            } else { if (symmetry.vertical) pointsToFill.push({ x: width - 1 - gridX, y: gridY }); if (symmetry.horizontal) pointsToFill.push({ x: gridX, y: height - 1 - gridY }); if (symmetry.vertical && symmetry.horizontal) pointsToFill.push({ x: width - 1 - gridX, y: height - 1 - gridY }); }
            const uniquePoints = Array.from(new Set(pointsToFill.map(p => `${p.x},${p.y}`))).map(s => { const [x, y] = s.split(',').map(Number); return { x, y }; }); applyFill(uniquePoints, activeTool);
        } else { return; }
        if (changed) { updateGrid(newGrid); }
    };
    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => { const fileInput = e.target; if (!fileInput.files || fileInput.files.length === 0 || !project || !projectData) return; const file = fileInput.files[0]; const reader = new FileReader(); reader.onload = (event) => { const img = new Image(); img.onload = async () => { setIsProcessing(true); const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext('2d'); if (!ctx) { setIsProcessing(false); return; } ctx.drawImage(img, 0, 0); const imageData = ctx.getImageData(0, 0, img.width, img.height); const newGridData = await processImageToGrid(imageData, projectData.width, projectData.height, maxImportColors, project.yarnPalette); dispatch({ type: 'UPDATE_PROJECT_DATA', payload: newGridData }); setIsProcessing(false); }; img.src = event.target?.result as string; }; reader.readAsDataURL(file); fileInput.value = ''; };
    const handleResize = () => { if (!projectData || !project || newWidth <= 0 || newHeight <= 0) return; if (projectData.width === newWidth && projectData.height === newHeight) return; const oldWidth = projectData.width; const oldHeight = projectData.height; const oldGrid = projectData.grid; const newGrid = Array.from({ length: newWidth * newHeight }, () => ({ colorId: null })); const offsetX = Math.floor((newWidth - oldWidth) / 2); const offsetY = Math.floor((newHeight - oldHeight) / 2); for (let y = 0; y < oldHeight; y++) { for (let x = 0; x < oldWidth; x++) { const newX = x + offsetX; const newY = y + offsetY; if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) { const oldIndex = y * oldWidth + x; const newIndex = newY * newWidth + newX; newGrid[newIndex] = oldGrid[oldIndex]; } } } dispatch({ type: 'UPDATE_PROJECT_DATA', payload: { width: newWidth, height: newHeight, grid: newGrid as CellData[] } }); };
    const confirmationMessages = { 'left-to-right': 'This will overwrite the right half of the pattern with a mirrored copy of the left half.', 'right-to-left': 'This will overwrite the left half of the pattern with a mirrored copy of the right half.', 'top-to-bottom': 'This will overwrite the bottom half of the pattern with a mirrored copy of the top half.', 'bottom-to-top': 'This will overwrite the top half of the pattern with a mirrored copy of the bottom half.' };
    const requestMirror = (direction: MirrorDirection) => { setMirrorConfirm({ isOpen: true, direction }); };
    const confirmMirrorCanvas = useCallback(() => { const direction = mirrorConfirm.direction; if (!direction) return; const currentProjectState = projectStateRef.current; const projectToMirror = currentProjectState.project; if (!projectToMirror || projectToMirror.type !== 'pixel') { setMirrorConfirm({ isOpen: false, direction: null }); return; } const projectData = projectToMirror.data as PixelGridData; const { width, height, grid: originalGrid } = projectData; const newGrid = [...originalGrid]; switch (direction) { case 'left-to-right': for (let y = 0; y < height; y++) { for (let x = 0; x < Math.ceil(width / 2); x++) { const sourceIndex = y * width + x; const destIndex = y * width + (width - 1 - x); newGrid[destIndex] = originalGrid[sourceIndex]; } } break; case 'right-to-left': for (let y = 0; y < height; y++) { for (let x = 0; x < Math.ceil(width / 2); x++) { const sourceIndex = y * width + (width - 1 - x); const destIndex = y * width + x; newGrid[destIndex] = originalGrid[sourceIndex]; } } break; case 'top-to-bottom': for (let y = 0; y < Math.ceil(height / 2); y++) { for (let x = 0; x < width; x++) { const sourceIndex = y * width + x; const destIndex = (height - 1 - y) * width + x; newGrid[destIndex] = originalGrid[sourceIndex]; } } break; case 'bottom-to-top': for (let y = 0; y < Math.ceil(height / 2); y++) { for (let x = 0; x < width; x++) { const sourceIndex = (height - 1 - y) * width + x; const destIndex = y * width + x; newGrid[destIndex] = originalGrid[sourceIndex]; } } break; } updateGrid(newGrid); setMirrorConfirm({ isOpen: false, direction: null }); }, [mirrorConfirm.direction, updateGrid]);
    const yarnUsage = useMemo(() => { if (!projectData || !project) return new Map<string, number>(); const counts = new Map<string, number>(); projectData.grid.forEach(cell => { if (cell.colorId) counts.set(cell.colorId, (counts.get(cell.colorId) || 0) + 1); }); return counts; }, [project]);
    const openSettingsModal = () => { setSettingsForm({ unit: project?.settings?.unit || 'in', stitchesPerUnit: project?.settings?.stitchesPerUnit || 4, rowsPerUnit: project?.settings?.rowsPerUnit || 4, hookSize: project?.settings?.hookSize || '', yarnPerStitch: project?.settings?.yarnPerStitch || 1 }); setIsSettingsModalOpen(true); };
    const saveSettings = () => { dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: settingsForm }); setIsSettingsModalOpen(false); };
    const physicalSizeString = useMemo(() => { if (!projectData || !project?.settings) return null; const sts = Number(project.settings.stitchesPerUnit); const rows = Number(project.settings.rowsPerUnit); const unit = project.settings.unit || 'in'; if (!sts || !rows) return null; const pWidth = (projectData.width / sts).toFixed(1); const pHeight = (projectData.height / rows).toFixed(1); return `${pWidth} x ${pHeight} ${unit}`; }, [projectData, project?.settings]);
    const handlePaletteClick = (colorId: string | null, e: React.MouseEvent) => {
        e.preventDefault();
        if (activeTool === 'replace') {
            if (replaceTarget === 'from') {
                setReplaceFromColor(colorId);
                setReplaceTarget('to');
                return;
            }
            if (replaceTarget === 'to') {
                setReplaceToColor(colorId);
                setReplaceTarget(null);
                return;
            }
        }

        if (e.type === 'contextmenu') {
            setSecondaryColorId(colorId);
        } else {
            setPrimaryColorId(colorId);
        }
    };
    const handleConfirmAddColor = () => { const hex = tempCustomColor; const newColor: YarnColor = { id: `custom-${Date.now()}`, brand: 'Custom', name: `Custom ${hex}`, hex: hex, rgb: [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)], skeinLength: 295 }; const newPalette = [...(project?.yarnPalette || []), newColor]; dispatch({ type: 'SET_PALETTE', payload: newPalette }); setPrimaryColorId(newColor.id); setIsColorPickerOpen(false); };
    const updateColorFromHsl = (h: number, s: number, l: number) => { setHsl([h, s, l]); const rgb = hslToRgb(h, s, l); setTempCustomColor(rgbToHex(rgb[0], rgb[1], rgb[2])); };

    if (!project || !projectData) return <div className="p-4">No Pixel Art project loaded.</div>;

    const hasSizeChanged = projectData.width !== newWidth || projectData.height !== newHeight;
    const ToolButton = ({ tool, label, icon }: { tool: Tool, label: string, icon?: string }) => (
        <Button variant={activeTool === tool ? 'primary' : 'secondary'} onClick={() => handleToolChange(tool)} className="text-xs justify-center flex-col h-14" title={label}>
            {icon && <Icon name={icon} className="w-5 h-5 mb-1" />}
            <span>{label}</span>
        </Button>
    );
    const toggleSymmetry = (mode: 'vertical' | 'horizontal') => { setSymmetry(prev => ({ ...prev, [mode]: !prev[mode] })); }

    return (
        <div className="flex-1 flex h-full overflow-hidden relative">
            {isProcessing && <div className="absolute inset-0 bg-white/70 z-30 flex items-center justify-center"><div className="text-lg font-semibold">Processing Image...</div></div>}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={getContextMenuOptions()}
                    onClose={() => setContextMenu(null)}
                />
            )}

            <main className="flex-1 relative min-w-0">
                <PixelGridEditor
                    data={projectData}
                    yarnPalette={project.yarnPalette}
                    primaryColorId={primaryColorId}
                    secondaryColorId={secondaryColorId}
                    onGridChange={handleGridChange}
                    showGridLines={showGridLines}
                    activeTool={activeTool}
                    onCanvasClick={handleCanvasClick}
                    brushSize={brushSize}
                    rowFillSize={rowFillSize}
                    colFillSize={colFillSize}
                    textToolInput={textToolInput}
                    textSize={textSize}
                    symmetry={symmetry}
                    zoom={zoom}
                    onZoomChange={onZoomChange}
                    showCenterGuides={showCenterGuides}
                    selection={selection}
                    onSelectionChange={setSelection}
                    onContextMenu={handleOpenContextMenu}
                />

                {activeTool === 'select' && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-xl flex gap-2 border border-gray-200 z-30">
                        <Button variant="secondary" onClick={handleSelectAll} title="Select All (Ctrl+A)">
                            <Icon name="grid" className="w-4 h-4" />
                        </Button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <Button variant="secondary" onClick={handleCopy} disabled={!selection} title="Copy (Ctrl+C)">
                            <Icon name="edit" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handleCut} disabled={!selection} title="Cut (Ctrl+X)">
                            <Icon name="trash" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handlePaste} disabled={!clipboard} title="Paste (Ctrl+V)">
                            <Icon name="download" className="w-4 h-4" />
                        </Button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <Button variant="secondary" onClick={() => handleFlipSelection('horizontal')} disabled={!selection} title="Flip Horizontal">
                            <Icon name="symmetry-horizontal" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={() => handleFlipSelection('vertical')} disabled={!selection} title="Flip Vertical">
                            <Icon name="symmetry-vertical" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handleRotateSelection} disabled={!selection} title="Rotate 90°">
                            <Icon name="redo" className="w-4 h-4" />
                        </Button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <Button variant="secondary" onClick={handleClearSelection} disabled={!selection} title="Clear (Del)">
                            <Icon name="close" className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </main>

            <aside className={`bg-white border-l shadow-xl z-20 transition-all duration-300 flex flex-col ${isPanelOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Tools</h3>
                    <Button variant="secondary" onClick={() => setIsPanelOpen(false)}><Icon name="close" className="w-4 h-4" /></Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Drawing</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <ToolButton tool="brush" label="Brush" icon="brush" />
                            <ToolButton tool="fill" label="Fill" icon="fill" />
                            <ToolButton tool="replace" label="Replace" icon="replace" />
                            <ToolButton tool="eyedropper" label="Pick" icon="eyedropper" />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Shapes & Text</h4>
                        <div className="grid grid-cols-4 gap-2">
                            <ToolButton tool="fill-row" label="Row" icon="row" />
                            <ToolButton tool="fill-column" label="Col" icon="column" />
                            <ToolButton tool="text" label="Text" icon="text" />
                            <ToolButton tool="select" label="Select" icon="select" />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Symmetry</h4>
                        <div className="flex gap-2">
                            <Button variant={symmetry.vertical ? 'primary' : 'secondary'} onClick={() => toggleSymmetry('vertical')} className="flex-1 justify-center"><Icon name="symmetry-vertical" className="w-4 h-4 mr-2" /> Vert</Button>
                            <Button variant={symmetry.horizontal ? 'primary' : 'secondary'} onClick={() => toggleSymmetry('horizontal')} className="flex-1 justify-center"><Icon name="symmetry-horizontal" className="w-4 h-4 mr-2" /> Horiz</Button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Generate Pattern</h4>
                        <input type="file" ref={imageUploadRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <Button onClick={() => imageUploadRef.current?.click()} className="w-full justify-center"><Icon name="upload" className="w-4 h-4 mr-2" /> Upload Image</Button>
                        <div className="mt-2">
                            <label className="text-xs text-gray-500">Max Colors: {maxImportColors}</label>
                            <input type="range" min="2" max="32" value={maxImportColors} onChange={(e) => setMaxImportColors(Number(e.target.value))} className="w-full" />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Mirror Canvas</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="secondary" onClick={() => requestMirror('left-to-right')}>Left → Right</Button>
                            <Button variant="secondary" onClick={() => requestMirror('right-to-left')}>Right → Left</Button>
                            <Button variant="secondary" onClick={() => requestMirror('top-to-bottom')}>Top → Bottom</Button>
                            <Button variant="secondary" onClick={() => requestMirror('bottom-to-top')}>Bottom → Top</Button>
                        </div>
                    </div>

                    {activeTool === 'brush' && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Brush Size: {brushSize}</h4>
                            <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full" />
                        </div>
                    )}

                    {(activeTool === 'fill-row' || activeTool === 'fill-column') && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Thickness: {activeTool === 'fill-row' ? rowFillSize : colFillSize}</h4>
                            <input type="range" min="1" max="10" value={activeTool === 'fill-row' ? rowFillSize : colFillSize} onChange={(e) => activeTool === 'fill-row' ? setRowFillSize(Number(e.target.value)) : setColFillSize(Number(e.target.value))} className="w-full" />
                        </div>
                    )}

                    {activeTool === 'text' && (
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Text</label>
                                <input type="text" value={textToolInput} onChange={(e) => setTextToolInput(e.target.value)} className="w-full border rounded px-2 py-1 mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Size: {textSize}</label>
                                <input type="range" min="1" max="5" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full" />
                            </div>
                        </div>
                    )}

                    {activeTool === 'replace' && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <p className="mb-2 font-semibold text-yellow-800">Color Replacement</p>
                            <div className="flex items-center justify-between mb-1">
                                <span>From:</span>
                                <button onClick={() => setReplaceTarget('from')} className={`w-6 h-6 border rounded ${replaceTarget === 'from' ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: replaceFromColor ? yarnColorMap.get(replaceFromColor)?.hex : 'transparent' }} title="Click to set from palette/canvas"></button>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span>To:</span>
                                <button onClick={() => setReplaceTarget('to')} className={`w-6 h-6 border rounded ${replaceTarget === 'to' ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: replaceToColor ? yarnColorMap.get(replaceToColor)?.hex : 'transparent' }} title="Click to set from palette/canvas"></button>
                            </div>
                            <Button onClick={handleReplace} disabled={replaceFromColor === undefined || replaceToColor === undefined} className="w-full justify-center">Replace All</Button>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Palette</h4>
                        <div className="grid grid-cols-5 gap-1 mb-2">
                            <button
                                onClick={(e) => handlePaletteClick(null, e)}
                                onContextMenu={(e) => handlePaletteClick(null, e)}
                                className={`w-8 h-8 rounded border-2 relative ${primaryColorId === null ? 'border-black z-10' : 'border-gray-200'} ${secondaryColorId === null ? 'ring-2 ring-red-500 ring-offset-1' : ''}`}
                                title="Eraser (Left: Primary, Right: Secondary)"
                            >
                                <div className="absolute inset-0 bg-white opacity-50" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px' }}></div>
                                <Icon name="close" className="w-4 h-4 absolute inset-0 m-auto text-red-500" />
                            </button>
                            {project.yarnPalette.map(yarn => (
                                <button
                                    key={yarn.id}
                                    onClick={(e) => handlePaletteClick(yarn.id, e)}
                                    onContextMenu={(e) => handlePaletteClick(yarn.id, e)}
                                    className={`w-8 h-8 rounded border-2 ${primaryColorId === yarn.id ? 'border-black z-10' : 'border-gray-200'} ${secondaryColorId === yarn.id ? 'ring-2 ring-red-500 ring-offset-1' : ''}`}
                                    style={{ backgroundColor: yarn.hex }}
                                    title={`${yarn.name} (${yarn.brand})`}
                                />
                            ))}
                            <button onClick={() => setIsColorPickerOpen(true)} className="w-8 h-8 rounded border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:bg-gray-100" title="Add Custom Color">
                                <Icon name="plus" className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>L: {primaryColorId ? yarnColorMap.get(primaryColorId)?.name : 'Eraser'}</span>
                            <span>R: {secondaryColorId ? yarnColorMap.get(secondaryColorId)?.name : 'Eraser'}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {!isPanelOpen && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <Button onClick={() => setIsPanelOpen(true)} className="shadow-lg"><Icon name="brush" className="w-5 h-5 mr-2" /> Tools</Button>
                    <Button variant="secondary" onClick={openSettingsModal} className="shadow-lg"><Icon name="settings" className="w-5 h-5 mr-2" /> Settings</Button>
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pattern Dimensions</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="number" value={newWidth} onChange={(e) => setNewWidth(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                            <span>x</span>
                            <input type="number" value={newHeight} onChange={(e) => setNewHeight(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                            <Button onClick={handleResize} disabled={!hasSizeChanged} variant="secondary" className="ml-2">Resize</Button>
                        </div>
                        {hasSizeChanged && <p className="text-xs text-red-500 mt-1">Warning: Resizing may crop the pattern.</p>}
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Display Options</h4>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={showGridLines} onChange={(e) => setShowGridLines(e.target.checked)} />
                            <span className="text-sm text-gray-700">Show Grid Lines</span>
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={showCenterGuides} onChange={(e) => setShowCenterGuides(e.target.checked)} />
                            <span className="text-sm text-gray-700">Show Center Guides</span>
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={isLeftHanded} onChange={onToggleLeftHanded} />
                            <span className="text-sm text-gray-700">Left-Handed Mode</span>
                        </label>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={mirrorConfirm.isOpen} onClose={() => setMirrorConfirm({ isOpen: false, direction: null })} title="Confirm Mirror">
                <p className="text-gray-600 mb-4">{mirrorConfirm.direction && confirmationMessages[mirrorConfirm.direction]}</p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setMirrorConfirm({ isOpen: false, direction: null })}>Cancel</Button>
                    <Button variant="danger" onClick={confirmMirrorCanvas}>Confirm</Button>
                </div>
            </Modal>

            <Modal isOpen={isColorPickerOpen} onClose={() => setIsColorPickerOpen(false)} title="Add Custom Color">
                <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <Button variant={pickerMode === 'HEX' ? 'primary' : 'secondary'} onClick={() => setPickerMode('HEX')} className="flex-1 justify-center">HEX</Button>
                        <Button variant={pickerMode === 'RGB' ? 'primary' : 'secondary'} onClick={() => setPickerMode('RGB')} className="flex-1 justify-center">RGB</Button>
                        <Button variant={pickerMode === 'HSL' ? 'primary' : 'secondary'} onClick={() => setPickerMode('HSL')} className="flex-1 justify-center">HSL</Button>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-24 h-24 rounded border shadow-inner" style={{ backgroundColor: tempCustomColor }}></div>
                        <div className="flex-1 space-y-2">
                            {pickerMode === 'HEX' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Hex Code</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-400">#</span>
                                        <input
                                            ref={colorInputRef}
                                            type="text"
                                            value={tempCustomColor.replace('#', '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                    setTempCustomColor(`#${val.toUpperCase()}`);
                                                    if (val.length === 6) {
                                                        const rgb = hexToRgb(`#${val}`);
                                                        setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2]));
                                                    }
                                                }
                                            }}
                                            className="w-full border rounded px-2 py-1 font-mono"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            )}
                            {pickerMode === 'HSL' && (
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Hue ({hsl[0]}°)</label>
                                        <input type="range" min="0" max="360" value={hsl[0]} onChange={(e) => updateColorFromHsl(Number(e.target.value), hsl[1], hsl[2])} className="w-full accent-indigo-600" />
                                        <div className="h-2 rounded w-full" style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}></div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Saturation ({hsl[1]}%)</label>
                                        <input type="range" min="0" max="100" value={hsl[1]} onChange={(e) => updateColorFromHsl(hsl[0], Number(e.target.value), hsl[2])} className="w-full accent-indigo-600" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Lightness ({hsl[2]}%)</label>
                                        <input type="range" min="0" max="100" value={hsl[2]} onChange={(e) => updateColorFromHsl(hsl[0], hsl[1], Number(e.target.value))} className="w-full accent-indigo-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleConfirmAddColor}>Add Color</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
