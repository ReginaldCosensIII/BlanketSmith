import React, { useState, useRef, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { PixelGridData, YarnColor, CellData, Symmetry, ContextMenuItem, ExportType, ExportOptions, InstructionDoc } from '../types';
import { useProject } from '../context/ProjectContext';
import { PixelGridEditor } from '../components/PixelGridEditor';
import { exportPixelGridToPDF, exportPixelGridToImage } from '../services/exportService';
import { getDefaultChartOnlyExportOptionsV3, getDefaultPatternPackExportOptionsV3 } from '../services/exportDefaultsV3';

import { processImageToGrid, findClosestYarnColor } from '../services/projectService';
import { Button, Icon, ContextMenu, Modal } from '../components/ui/SharedComponents';
import { InstructionsEditorModal } from '../components/InstructionsEditorModal';
import { PIXEL_FONT } from '../constants';
import { useCanvasLogic } from '../hooks/useCanvasLogic';
import { useFloatingSelection } from '../context/FloatingSelectionContext';
import { DEFAULT_STITCH_LIBRARY, StitchDefinition } from '../data/stitches';

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
    const project = state.project?.type === 'pixel' ? state.project : null;

    // --- PERSISTENT STATE INITIALIZATION ---
    const [primaryColorId, setPrimaryColorId] = useState<string | null>(() => localStorage.getItem('editor_primaryColorId') || null);
    const [secondaryColorId, setSecondaryColorId] = useState<string | null>(() => localStorage.getItem('editor_secondaryColorId') || null);
    const [isPanelOpen, setIsPanelOpen] = useState(() => localStorage.getItem('editor_isPanelOpen') === 'true');
    const [activeTool, setActiveTool] = useState<Tool>(() => (localStorage.getItem('editor_activeTool') as Tool) || 'brush');

    const [isProcessing, setIsProcessing] = useState(false);
    const [showGridLines, setShowGridLines] = useState(() => localStorage.getItem('editor_showGridLines') !== 'false'); // Default true
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const fullScreenCanvasRef = useRef<HTMLCanvasElement>(null);
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

    // --- RESTORED SELECTION STATE ---
    const [floatingSelection, setFloatingSelection] = useState<{ x: number, y: number, w: number, h: number, data: CellData[], isRotated: boolean } | null>(null);
    const [preRotationState, setPreRotationState] = useState<{ grid: CellData[], selection: { x: number, y: number, w: number, h: number } } | null>(null);
    const [toolbarPosition, setToolbarPosition] = useState<{ x: number, y: number } | null>(null);

    const { setHasFloatingSelection, registerUndoHandler, registerRedoHandler } = useFloatingSelection();

    // Sync floating selection presence with global context
    useEffect(() => {
        setHasFloatingSelection(!!floatingSelection);
    }, [floatingSelection, setHasFloatingSelection]);

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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [previewGrid, setPreviewGrid] = useState<PixelGridData | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(1);

    // --- EXPORT STATE ---
    const [selectedExportType, setSelectedExportType] = useState<ExportType>('pattern-pack');
    const [exportDesignerName, setExportDesignerName] = useState<string>('');
    const [exportWebsite, setExportWebsite] = useState<string>('');
    const [exportCopyright, setExportCopyright] = useState<string>('');
    const [exportShowCellSymbols, setExportShowCellSymbols] = useState<boolean>(true);
    const [showCellBackgrounds, setShowCellBackgrounds] = useState<boolean>(true);
    const [symbolMode, setSymbolMode] = useState<'color-index' | 'stitch-symbol' | 'hybrid'>('color-index'); // Only used for visual overrides if any

    // Commit 2: Explicit Isolated State
    // Chart-Only Defaults (V3)
    const [coDefaults] = useState(() => getDefaultChartOnlyExportOptionsV3());
    const [coMode, setCoMode] = useState<'color' | 'stitch' | 'hybrid'>(coDefaults.chartOnlyMode || 'color');
    const [coOverviewMode, setCoOverviewMode] = useState<'auto' | 'always' | 'never'>(coDefaults.overviewMode || 'auto');
    const [coIncludeCover, setCoIncludeCover] = useState(coDefaults.includeCoverPage || false);
    const [coIncludeYarn, setCoIncludeYarn] = useState(coDefaults.includeYarnRequirements || false);

    // Pattern Pack Defaults (V3)
    const [ppDefaults] = useState(() => getDefaultPatternPackExportOptionsV3());
    const [ppIncludeColor, setPpIncludeColor] = useState(ppDefaults.includeColorChart || false);
    const [ppIncludeStitch, setPpIncludeStitch] = useState(ppDefaults.includeStitchChart || false);
    const [ppIncludeHybrid, setPpIncludeHybrid] = useState(ppDefaults.includeHybridChart || false);
    const [ppOverviewMode, setPpOverviewMode] = useState<'auto' | 'always' | 'never'>(ppDefaults.overviewMode || 'auto');
    const [ppIncludeCover, setPpIncludeCover] = useState(ppDefaults.includeCoverPage || false);
    const [ppIncludeYarn, setPpIncludeYarn] = useState(ppDefaults.includeYarnRequirements || false);

    // Instructions (Pattern Pack)
    const [ppIncludeInstructions, setPpIncludeInstructions] = useState(ppDefaults.includeInstructions || false);

    // Removed: Default Layout Options Effect (caused leakage)

    // Hydrate export settings from project
    useEffect(() => {
        if (project?.settings?.export) {
            const settings = project.settings.export;
            if (settings.defaultExportType) setSelectedExportType(settings.defaultExportType);
            if (settings.branding) {
                setExportDesignerName(settings.branding.designerName || '');
                setExportWebsite(settings.branding.website || '');
                setExportCopyright(settings.branding.copyrightLine || '');
            }
            if (settings.showCellSymbols !== undefined) setExportShowCellSymbols(settings.showCellSymbols);
            // Hydration logic could be expanded here if we saved per-mode settings,
            // but for now we rely on defaults or simple mapping.
            if (settings.includeColorChart !== undefined) setPpIncludeColor(settings.includeColorChart);
            if (settings.includeStitchChart !== undefined) setPpIncludeStitch(settings.includeStitchChart);
        }
    }, [project?.settings?.export]);

    // --- STITCH SYSTEM STATE ---
    const [primaryStitchId, setPrimaryStitchId] = useState<string | null>("sc");
    const [secondaryStitchId, setSecondaryStitchId] = useState<string | null>("ch");
    const [isComboPaintMode, setIsComboPaintMode] = useState<boolean>(false);
    const [isStitchPaletteOpen, setIsStitchPaletteOpen] = useState(false);

    // Build stitch map for lookups
    const stitchMap = useMemo(
        () => new Map(DEFAULT_STITCH_LIBRARY.map(s => [s.id, s] as const)),
        []
    );

    const primaryStitch = primaryStitchId ? stitchMap.get(primaryStitchId) : undefined;
    const secondaryStitch = secondaryStitchId ? stitchMap.get(secondaryStitchId) : undefined;


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

    // Commit 5: State Persistence for Visuals
    // Track previous coMode to detect transitions
    const prevCoModeRef = useRef<typeof coMode>(coMode);
    // Store non-stitch visual settings to restore them when leaving stitch mode
    const lastNonStitchVisualRef = useRef<{ showSymbols: boolean; showBackgrounds: boolean } | null>(null);

    // --- TOOL CHANGE HANDLER (Transition Logic) ---
    const handleToolChange = (newTool: Tool) => {
        if (floatingSelection) {
            handleCommit();
        }
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

    // --- PAINTING LOGIC (Color + Stitch) ---
    interface PaintParams {
        colorId: string | null;
        stitchId: string | null;
        comboMode: boolean;
    }

    const applyPaintToCell = (cell: CellData, params: PaintParams): CellData => {
        const { colorId, stitchId, comboMode } = params;

        if (!comboMode) {
            // In non-combo mode (Color Only), we clear the stitch
            return { ...cell, colorId, stitchId: null };
        }

        // Paint both color and stitch
        return { ...cell, colorId, stitchId };
    };

    // --- SELECTION ACTIONS ---
    const handleCommit = useCallback(() => {
        if (!floatingSelection || !projectData) return;

        const newGrid = [...projectData.grid];
        const { x, y, w, h, data } = floatingSelection;

        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                const destX = x + col;
                const destY = y + row;
                if (destX >= 0 && destX < projectData.width && destY >= 0 && destY < projectData.height) {
                    const srcIdx = row * w + col;
                    const destIdx = destY * projectData.width + destX;
                    if (data[srcIdx].colorId) {
                        newGrid[destIdx] = data[srcIdx];
                    }
                }
            }
        }

        updateGrid(newGrid);
        setFloatingSelection(null);
    }, [floatingSelection, projectData, updateGrid]);

    const handleFloatingSelectionChange = (newFloating: { x: number, y: number, w: number, h: number, data: CellData[], isRotated: boolean } | null) => {
        setFloatingSelection(newFloating);
        if (newFloating) {
            setSelection({ x: newFloating.x, y: newFloating.y, w: newFloating.w, h: newFloating.h });
        }
    };

    const handleSelectionChangeWrapper = (newSel: { x: number, y: number, w: number, h: number } | null) => {
        if (floatingSelection) {
            handleCommit();
        }
        setSelection(newSel);
    };

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

        if (floatingSelection) {
            handleCommit();
        }

        // Switch to select tool if not already active
        if (activeTool !== 'select') {
            setActiveTool('select');
        }

        // Always center the paste
        const startX = Math.floor((projectData.width - clipboard.width) / 2);
        const startY = Math.floor((projectData.height - clipboard.height) / 2);

        const newFloating = {
            x: startX,
            y: startY,
            w: clipboard.width,
            h: clipboard.height,
            data: clipboard.data,
            isRotated: false
        };

        setFloatingSelection(newFloating);
        setSelection({
            x: startX,
            y: startY,
            w: clipboard.width,
            h: clipboard.height
        });

        // Register Undo/Redo handlers for this floating selection state

        // Undo: Clear the floating selection
        registerUndoHandler(() => {
            setFloatingSelection(null);
            setSelection(null);
        });

        // Redo: Restore the floating selection
        registerRedoHandler(() => {
            setFloatingSelection(newFloating);
            setSelection({
                x: startX,
                y: startY,
                w: clipboard.width,
                h: clipboard.height
            });
        });
    };

    const handleClearSelection = useCallback(() => {
        if (!selection || !projectData) return;
        if (floatingSelection) {
            setFloatingSelection(null);
            setSelection(null);
            return;
        }
        const newGrid = [...projectData.grid];
        const { x, y, w, h } = selection;
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                const idx = (y + row) * projectData.width + (x + col);
                newGrid[idx] = { colorId: null };
            }
        }
        updateGrid(newGrid);
    }, [selection, projectData, floatingSelection, updateGrid]);

    const handleCut = () => { handleCopy(); handleClearSelection(); };

    const handleFlipSelection = (direction: 'horizontal' | 'vertical') => {
        if (!selection || !projectData) return;
        if (floatingSelection) {
            const { w, h, data } = floatingSelection;
            const flippedData = flipSubGrid(data, w, h, direction);
            setFloatingSelection({ ...floatingSelection, data: flippedData });
            return;
        }
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

    // --- ROTATION SESSION STATE ---
    interface RotationSession {
        baseRect: { x: number, y: number, w: number, h: number };
        baseCells: CellData[];
        boundingBox: { x: number, y: number, w: number, h: number };
        boundingBoxCells: CellData[];
        currentRect: { x: number, y: number, w: number, h: number }; // Track current rotation position
        step: 0 | 1 | 2 | 3;
    }
    const [rotationSession, setRotationSession] = useState<RotationSession | null>(null);
    const isRotatingRef = useRef(false);

    // Reset rotation session if selection changes externally
    useEffect(() => {
        if (isRotatingRef.current) {
            isRotatingRef.current = false;
            return;
        }
        setRotationSession(null);
    }, [selection, projectData]);

    const rotateBaseCells = (baseCells: CellData[], w: number, h: number, step: 0 | 1 | 2 | 3): { cells: CellData[], newW: number, newH: number } => {
        if (step === 0) {
            return { cells: [...baseCells], newW: w, newH: h };
        }

        let newW = w;
        let newH = h;
        if (step === 1 || step === 3) {
            newW = h;
            newH = w;
        }

        const rotated = new Array(newW * newH).fill({ colorId: null });

        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                const srcIdx = r * w + c;
                let destCol = 0;
                let destRow = 0;

                if (step === 1) {
                    destCol = r;
                    destRow = w - 1 - c;
                } else if (step === 2) {
                    destCol = w - 1 - c;
                    destRow = h - 1 - r;
                } else if (step === 3) {
                    destCol = h - 1 - r;
                    destRow = c;
                }

                const destIdx = destRow * newW + destCol;
                rotated[destIdx] = baseCells[srcIdx];
            }
        }
        return { cells: rotated, newW, newH };
    };

    const calculateRotationBoundingBox = (baseRect: { x: number, y: number, w: number, h: number }) => {
        const { x, y, w, h } = baseRect;
        const positions = [];

        for (let step = 0; step < 4; step++) {
            let newW = w;
            let newH = h;
            if (step === 1 || step === 3) {
                newW = h;
                newH = w;
            }

            const newX = x + Math.trunc((w - newW) / 2);
            const newY = y + Math.trunc((h - newH) / 2);

            positions.push({ x: newX, y: newY, w: newW, h: newH });
        }

        const minX = Math.min(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxX = Math.max(...positions.map(p => p.x + p.w));
        const maxY = Math.max(...positions.map(p => p.y + p.h));

        return {
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY
        };
    };

    const handleRotateSelection = () => {
        if (!selection || !projectData) return;
        if (floatingSelection) {
            handleCommit();
        }

        let currentSession = rotationSession;

        if (!currentSession ||
            currentSession.baseRect.x !== selection.x ||
            currentSession.baseRect.y !== selection.y ||
            currentSession.baseRect.w !== selection.w ||
            currentSession.baseRect.h !== selection.h) {

            const { x, y, w, h } = selection;

            const baseCells: CellData[] = [];
            for (let row = 0; row < h; row++) {
                for (let col = 0; col < w; col++) {
                    baseCells.push(projectData.grid[(y + row) * projectData.width + (x + col)]);
                }
            }

            const boundingBox = calculateRotationBoundingBox({ x, y, w, h });

            // Capture bounding box cells
            // IMPORTANT: We treat the area covered by the *initial selection* (baseRect) as "empty" (null)
            // in the snapshot. This allows us to "erase" the selection when it moves during rotation.
            // Areas outside baseRect are captured as-is (preserving background).
            const boundingBoxCells: CellData[] = [];
            for (let row = 0; row < boundingBox.h; row++) {
                for (let col = 0; col < boundingBox.w; col++) {
                    const gridX = boundingBox.x + col;
                    const gridY = boundingBox.y + row;

                    // Check if this pixel is inside the base selection
                    const inBaseRect =
                        gridX >= x && gridX < x + w &&
                        gridY >= y && gridY < y + h;

                    if (gridX >= 0 && gridX < projectData.width && gridY >= 0 && gridY < projectData.height) {
                        if (inBaseRect) {
                            // It's the selection itself -> capture as NULL so we can "clear" it later
                            boundingBoxCells.push({ colorId: null });
                        } else {
                            // It's background -> capture as-is
                            boundingBoxCells.push(projectData.grid[gridY * projectData.width + gridX]);
                        }
                    } else {
                        boundingBoxCells.push({ colorId: null });
                    }
                }
            }

            currentSession = {
                baseRect: { x, y, w, h },
                baseCells,
                boundingBox,
                boundingBoxCells,
                currentRect: { x, y, w, h }, // Initialize currentRect with initial selection
                step: 0
            };
        }

        const nextStep = ((currentSession.step + 1) % 4) as 0 | 1 | 2 | 3;

        const { cells: rotatedCells, newW, newH } = rotateBaseCells(
            currentSession.baseCells,
            currentSession.baseRect.w,
            currentSession.baseRect.h,
            nextStep
        );

        const { x: baseX, y: baseY, w: baseW, h: baseH } = currentSession.baseRect;

        let newX = baseX + Math.trunc((baseW - newW) / 2);
        let newY = baseY + Math.trunc((baseH - newH) / 2);

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + newW > projectData.width) newX = projectData.width - newW;
        if (newY + newH > projectData.height) newY = projectData.height - newH;

        const newGrid = [...projectData.grid];

        // FIRST: Clear the PREVIOUS rotation position (currentRect)
        // We restore the background from the boundingBox snapshot for the area covered by currentRect
        // This ensures we don't leave "ghosts" of the previous rotation
        const { currentRect, boundingBox, boundingBoxCells } = currentSession;

        for (let row = 0; row < currentRect.h; row++) {
            for (let col = 0; col < currentRect.w; col++) {
                const gridX = currentRect.x + col;
                const gridY = currentRect.y + row;

                if (gridX >= 0 && gridX < projectData.width && gridY >= 0 && gridY < projectData.height) {
                    // Calculate position in bounding box to restore background
                    const bbCol = gridX - boundingBox.x;
                    const bbRow = gridY - boundingBox.y;

                    if (bbCol >= 0 && bbCol < boundingBox.w && bbRow >= 0 && bbRow < boundingBox.h) {
                        const gridIdx = gridY * projectData.width + gridX;
                        const bbIdx = bbRow * boundingBox.w + bbCol;
                        newGrid[gridIdx] = boundingBoxCells[bbIdx];
                    }
                }
            }
        }

        // If returning to step 0, we might want to ensure the *entire* bounding box is clean
        // just to be absolutely safe against any floating point drifts or edge cases,
        // although the per-step clearing above should theoretically handle it.
        // Let's keep the full restore on step 0 as a safety net.
        if (nextStep === 0) {
            for (let row = 0; row < boundingBox.h; row++) {
                for (let col = 0; col < boundingBox.w; col++) {
                    const gridX = boundingBox.x + col;
                    const gridY = boundingBox.y + row;
                    if (gridX >= 0 && gridX < projectData.width && gridY >= 0 && gridY < projectData.height) {
                        const gridIdx = gridY * projectData.width + gridX;
                        const bbIdx = row * boundingBox.w + col;
                        newGrid[gridIdx] = boundingBoxCells[bbIdx];
                    }
                }
            }
        }

        // Write rotated content
        for (let r = 0; r < newH; r++) {
            for (let c = 0; c < newW; c++) {
                const destX = newX + c;
                const destY = newY + r;

                if (destX >= 0 && destX < projectData.width && destY >= 0 && destY < projectData.height) {
                    const gridIdx = destY * projectData.width + destX;
                    const rotIdx = r * newW + c;
                    newGrid[gridIdx] = rotatedCells[rotIdx];
                }
            }
        }

        updateGrid(newGrid);

        isRotatingRef.current = true;
        setSelection({ x: newX, y: newY, w: newW, h: newH });
        setRotationSession({
            ...currentSession,
            step: nextStep,
            currentRect: { x: newX, y: newY, w: newW, h: newH }
        });
    };

    const handleSelectAll = () => {
        if (!projectData) return;
        if (floatingSelection) handleCommit();
        setSelection({ x: 0, y: 0, w: projectData.width, h: projectData.height });
    };

    const handleOpenContextMenu = (x: number, y: number) => {
        setContextMenu({ x, y });
    };

    const handleReplace = () => {
        if (!projectData || replaceFromColor === undefined || replaceToColor === undefined) return;

        const newGrid = [...projectData.grid];
        let changed = false;

        const paintParams: PaintParams = {
            colorId: replaceToColor,
            stitchId: primaryStitchId, // Use primary stitch for replace all in combo mode
            comboMode: isComboPaintMode
        };

        for (let i = 0; i < newGrid.length; i++) {
            if (newGrid[i].colorId === replaceFromColor) {
                newGrid[i] = applyPaintToCell(newGrid[i], paintParams);
                changed = true;
            }
        }

        if (changed) {
            updateGrid(newGrid);
        }
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

    const buildExportOptions = (preview: boolean): ExportOptions => {
        if (!projectData) {
            return { preview };
        }

        const exportType: ExportType = selectedExportType;

        // V2 Spec: Explicit Logical Constraints
        // In V2, we remove symbol drop down from specific views, but if we need to force it:
        let effectiveSymbolMode = symbolMode; // Default to current visual setting

        // For Chart-Only Stitch/Hybrid, we force stitch symbols
        if (exportType === 'chart-only') {
            if (coMode === 'stitch' || coMode === 'hybrid') {
                effectiveSymbolMode = 'stitch-symbol';
            }
        }

        if (exportType === 'pattern-pack') {
            return {
                exportType,
                preview,
                chartMode: 'color', // Ignored by engine generally for pattern pack, but safe default

                // Pattern Pack Options
                includeColorChart: ppIncludeColor,
                includeStitchChart: ppIncludeStitch,
                includeHybridChart: ppIncludeHybrid,

                includeYarnRequirements: ppIncludeYarn,
                includeCoverPage: ppIncludeCover,
                overviewMode: ppOverviewMode,

                // Instructions
                includeInstructions: ppIncludeInstructions,
                instructionDoc: ppIncludeInstructions ? (project?.instructionDoc || null) : null,

                branding: {
                    designerName: exportDesignerName || undefined,
                    website: exportWebsite || undefined,
                    copyrightLine: exportCopyright || undefined,
                },
                chartVisual: {
                    showCellSymbols: exportShowCellSymbols,
                    showCellBackgrounds: showCellBackgrounds,
                    symbolMode: effectiveSymbolMode,
                },
            };
        } else {
            // Chart Only
            return {
                exportType,
                preview,
                chartMode: coMode,
                chartOnlyMode: coMode,
                forceSinglePage: true,

                // Chart-Only Options
                includeCoverPage: coIncludeCover,
                includeYarnRequirements: coIncludeYarn,
                overviewMode: coOverviewMode,

                // Inherit pattern pack options for unused fields or explicit overrides if needed
                includeColorChart: coMode === 'color',
                includeStitchChart: coMode === 'stitch' || coMode === 'hybrid',
                includeHybridChart: coMode === 'hybrid',

                branding: {
                    designerName: exportDesignerName || undefined,
                    website: exportWebsite || undefined,
                    copyrightLine: exportCopyright || undefined,
                },
                chartVisual: {
                    showCellSymbols: exportShowCellSymbols,
                    showCellBackgrounds: showCellBackgrounds,
                    symbolMode: effectiveSymbolMode,
                },
            };
        }
    };

    // Commit 3: Restore Defaults Helpers
    const applyChartOnlyDefaults = () => {
        const d = getDefaultChartOnlyExportOptionsV3();
        // Commit 4a: Do NOT reset coMode (preserve user selection)

        if (d.overviewMode) setCoOverviewMode(d.overviewMode);
        setCoIncludeCover(d.includeCoverPage || false);
        setCoIncludeYarn(d.includeYarnRequirements || false);

        // Commit 4: Mode-aware visual defaults (uses CURRENT coMode)
        if (coMode === 'stitch') {
            setExportShowCellSymbols(true);
            setShowCellBackgrounds(false);
        } else {
            setExportShowCellSymbols(d.chartVisual?.showCellSymbols ?? false);
            setShowCellBackgrounds(d.chartVisual?.showCellBackgrounds ?? true);
        }
    };

    const applyPatternPackDefaults = () => {
        const d = getDefaultPatternPackExportOptionsV3();
        // Commit 4a: Pattern Pack defaults to ALL charts enabled
        setPpIncludeColor(true);
        setPpIncludeStitch(true);
        setPpIncludeHybrid(true);

        if (d.overviewMode) setPpOverviewMode(d.overviewMode);
        setPpIncludeCover(d.includeCoverPage || false);
        setPpIncludeYarn(d.includeYarnRequirements || false);

        // Reset Instructions
        setPpIncludeInstructions(d.includeInstructions || false);
    };


    const handleConfirmExport = () => {
        if (!projectData) return;
        const options = buildExportOptions(false);
        exportPixelGridToPDF(
            project?.name || 'pattern',
            projectData,
            project?.yarnPalette || [],
            yarnUsage,
            options,
            project?.settings,
            isLeftHanded
        );
    };

    const handlePreviewExport = () => {
        if (!projectData) return;
        const options = buildExportOptions(true);
        exportPixelGridToPDF(
            project?.name || 'pattern',
            projectData,
            project?.yarnPalette || [],
            yarnUsage,
            options,
            project?.settings,
            isLeftHanded
        );
    };

    const handleExportImage = () => {
        if (!projectData) return;
        exportPixelGridToImage(project?.name || 'Project', projectData, project?.yarnPalette || []);
    };

    const handleGridChange = (newGrid: CellData[]) => { if (!project || !project.data || !('grid' in project.data)) return; updateGrid(newGrid); };

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
        const stitchToApply = isRightClick ? secondaryStitchId : primaryStitchId;

        const paintParams: PaintParams = {
            colorId: colorToApply,
            stitchId: stitchToApply,
            comboMode: isComboPaintMode
        };

        let newGrid = [...grid];
        let changed = false;

        // --- FLOOD FILL ALGORITHM ---
        const floodFill = (startX: number, startY: number, targetColor: string | null) => {
            const replacementColor = paintParams.colorId;
            if (targetColor === replacementColor && !paintParams.comboMode) return;
            // In combo mode, we might be applying a stitch even if color is same, so we continue.
            // But standard flood fill usually stops if target == replacement. 
            // For now, let's assume if color matches AND stitch matches (or we don't care about stitch), we stop.
            // But to be safe and simple: if targetColor === replacementColor AND !comboMode, return.

            // Actually, if we are in combo mode, we want to fill even if color is same, IF stitch is different.
            // But flood fill logic relies on color boundary. 
            // Let's stick to color-based flood fill for now, but apply stitch too.
            if (targetColor === replacementColor && !paintParams.comboMode) return;

            const queue: [number, number][] = [[startX, startY]];
            const visited = new Set<number>();

            while (queue.length > 0) {
                const [x, y] = queue.pop()!;
                const idx = y * width + x;

                if (visited.has(idx)) continue;
                visited.add(idx);

                if (newGrid[idx].colorId === targetColor) {
                    newGrid[idx] = applyPaintToCell(newGrid[idx], paintParams);
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
                    for (let i = 0; i < rowFillSize; i++) { const currentY = startY + i; if (currentY >= 0 && currentY < height) { for (let x = 0; x < width; x++) { const idx = currentY * width + x; if (newGrid[idx].colorId !== paintParams.colorId || (paintParams.comboMode && newGrid[idx].stitchId !== paintParams.stitchId)) { newGrid[idx] = applyPaintToCell(newGrid[idx], paintParams); changed = true; } } } }
                } else {
                    const offset = Math.floor((colFillSize - 1) / 2); const startX = point.x - offset;
                    for (let i = 0; i < colFillSize; i++) { const currentX = startX + i; if (currentX >= 0 && currentX < width) { for (let y = 0; y < height; y++) { const idx = y * width + currentX; if (newGrid[idx].colorId !== paintParams.colorId || (paintParams.comboMode && newGrid[idx].stitchId !== paintParams.stitchId)) { newGrid[idx] = applyPaintToCell(newGrid[idx], paintParams); changed = true; } } } }
                }
            });
        };

        if (activeTool === 'fill') {
            floodFill(gridX, gridY, clickedColorId);
        } else if (activeTool === 'text') {
            let currentX = gridX; textToolInput.toUpperCase().split('').forEach(char => { const charData = PIXEL_FONT[char]; if (charData) { charData.forEach((row, yOffset) => { row.forEach((pixel, xOffset) => { if (pixel === 1) { for (let scaleY = 0; scaleY < textSize; scaleY++) { for (let scaleX = 0; scaleX < textSize; scaleX++) { const finalX = currentX + (xOffset * textSize) + scaleX; const finalY = gridY + (yOffset * textSize) + scaleY; if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) { const idx = finalY * width + finalX; if (newGrid[idx].colorId !== paintParams.colorId || (paintParams.comboMode && newGrid[idx].stitchId !== paintParams.stitchId)) { newGrid[idx] = applyPaintToCell(newGrid[idx], paintParams); changed = true; } } } } } }); }); currentX += (charData[0].length * textSize) + (1 * textSize); } });
        } else if (activeTool === 'fill-row' || activeTool === 'fill-column') {
            const pointsToFill = [{ x: gridX, y: gridY }];
            if (activeTool === 'fill-row') {
                if (symmetry.horizontal) pointsToFill.push({ x: gridX, y: height - 1 - gridY }); if (symmetry.vertical) pointsToFill.push({ x: width - 1 - gridX, y: gridY }); if (symmetry.vertical && symmetry.horizontal) pointsToFill.push({ x: width - 1 - gridX, y: height - 1 - gridY });
            } else { if (symmetry.vertical) pointsToFill.push({ x: width - 1 - gridX, y: gridY }); if (symmetry.horizontal) pointsToFill.push({ x: gridX, y: height - 1 - gridY }); if (symmetry.vertical && symmetry.horizontal) pointsToFill.push({ x: width - 1 - gridX, y: height - 1 - gridY }); }
            const uniquePoints = Array.from(new Set(pointsToFill.map(p => `${p.x},${p.y}`))).map(s => { const [x, y] = s.split(',').map(Number); return { x, y }; }); applyFill(uniquePoints, activeTool);
        } else { return; }
        if (changed) { updateGrid(newGrid); }
    };
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.target;
        if (!fileInput.files || fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        setImportFile(file);
        setIsGenerateModalOpen(true);
        fileInput.value = '';
    };

    const generatePreview = useCallback(async () => {
        if (!importFile || !projectData || !project) return;
        setIsGeneratingPreview(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setIsGeneratingPreview(false);
                    return;
                }
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const newGridData = await processImageToGrid(imageData, projectData.width, projectData.height, maxImportColors, project.yarnPalette);
                setPreviewGrid(newGridData as PixelGridData);
                setIsGeneratingPreview(false);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(importFile);
    }, [importFile, maxImportColors, projectData?.width, projectData?.height, project?.yarnPalette]);

    useEffect(() => {
        if (isGenerateModalOpen && importFile) {
            const timer = setTimeout(() => {
                generatePreview();
            }, 500); // Debounce
            return () => clearTimeout(timer);
        }
    }, [generatePreview, isGenerateModalOpen, importFile]);

    // Canvas rendering for preview
    useEffect(() => {
        if (!previewGrid) return;

        const renderToCanvas = (canvas: HTMLCanvasElement, includeGridLines: boolean = false, scale: number = 1) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size based on scale
            const scaledWidth = previewGrid.width * scale;
            const scaledHeight = previewGrid.height * scale;

            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // Clear canvas
            ctx.clearRect(0, 0, scaledWidth, scaledHeight);

            // Draw pixels
            previewGrid.grid.forEach((cell, i) => {
                if (cell.colorId) {
                    const x = (i % previewGrid.width) * scale;
                    const y = Math.floor(i / previewGrid.width) * scale;
                    const color = yarnColorMap.get(cell.colorId);
                    if (color) {
                        ctx.fillStyle = color.hex;
                        ctx.fillRect(x, y, scale, scale);
                    }
                }
            });

            // Draw grid lines for full-screen preview
            if (includeGridLines) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = Math.max(1, scale * 0.05); // At least 1px, scales with cell size

                // Vertical lines
                for (let x = 0; x <= previewGrid.width; x++) {
                    ctx.beginPath();
                    ctx.moveTo(x * scale, 0);
                    ctx.lineTo(x * scale, scaledHeight);
                    ctx.stroke();
                }

                // Horizontal lines
                for (let y = 0; y <= previewGrid.height; y++) {
                    ctx.beginPath();
                    ctx.moveTo(0, y * scale);
                    ctx.lineTo(scaledWidth, y * scale);
                    ctx.stroke();
                }
            }
        };

        if (isGenerateModalOpen && previewCanvasRef.current) {
            renderToCanvas(previewCanvasRef.current, false, 1);
        }

        if (isPreviewFullScreen && fullScreenCanvasRef.current) {
            // Calculate scale for full-screen preview (10px base * zoom)
            const scale = 10 * previewZoom;
            const showGridLines = scale >= 5; // Show grid lines if cells are >= 5px
            renderToCanvas(fullScreenCanvasRef.current, showGridLines, scale);
        }
    }, [previewGrid, isGenerateModalOpen, isPreviewFullScreen, yarnColorMap, previewZoom]);

    // Reset zoom when opening full screen
    useEffect(() => {
        if (isPreviewFullScreen && previewGrid) {
            // Calculate initial zoom to fit ~80% of screen
            const screenW = window.innerWidth * 0.8;
            const screenH = window.innerHeight * 0.8;
            const gridW = previewGrid.width * 10; // Base 10px per cell
            const gridH = previewGrid.height * 10;

            const scaleW = screenW / gridW;
            const scaleH = screenH / gridH;
            const fitZoom = Math.min(scaleW, scaleH);

            // Ensure minimum zoom so grid lines are visible (cell size >= 5px)
            const minZoomForGridLines = 0.5; // 10px * 0.5 = 5px per cell

            // Use the larger of: fit zoom or minimum zoom for grid lines
            const initialZoom = Math.max(fitZoom, minZoomForGridLines);

            setPreviewZoom(Math.max(0.1, initialZoom));
        }
    }, [isPreviewFullScreen, previewGrid]);

    // Commit 5: Transition-Aware Stitch Mode Visual Lock
    useEffect(() => {
        if (selectedExportType !== 'chart-only') {
            // Reset refs if we leave chart-only mode entirely, ensuring fresh state next time
            prevCoModeRef.current = coMode;
            // Optional: lastNonStitchVisualRef.current = null; // We could clear it or keep it. Keeping it might be nice.
            return;
        }

        const prevMode = prevCoModeRef.current;
        const currentMode = coMode;

        // Transition INTO Stitch Mode
        if (currentMode === 'stitch' && prevMode !== 'stitch') {
            // Snapshot current visuals before locking
            // Only snapshot if we have valid non-locked values (i.e., not coming from some other weird state)
            lastNonStitchVisualRef.current = {
                showSymbols: exportShowCellSymbols,
                showBackgrounds: showCellBackgrounds
            };

            // Enforce Lock
            setExportShowCellSymbols(true);
            setShowCellBackgrounds(false);
        }
        // Transition OUT OF Stitch Mode
        else if (currentMode !== 'stitch' && prevMode === 'stitch') {
            if (lastNonStitchVisualRef.current) {
                // Restore from snapshot
                setExportShowCellSymbols(lastNonStitchVisualRef.current.showSymbols);
                setShowCellBackgrounds(lastNonStitchVisualRef.current.showBackgrounds);
            } else {
                // Fallback to defaults if no snapshot (shouldn't happen in normal flow but safe)
                const d = getDefaultChartOnlyExportOptionsV3();
                setExportShowCellSymbols(d.chartVisual?.showCellSymbols ?? false);
                setShowCellBackgrounds(d.chartVisual?.showCellBackgrounds ?? true);
            }
        }
        // Edge case: Initial load into Stitch mode (no transition)
        // Ensure lock is enforced if we land directly on stitch (e.g. from defaults)
        else if (currentMode === 'stitch' && (!exportShowCellSymbols || showCellBackgrounds)) {
            setExportShowCellSymbols(true);
            setShowCellBackgrounds(false);
        }

        // Update Ref
        prevCoModeRef.current = currentMode;
    }, [selectedExportType, coMode, exportShowCellSymbols, showCellBackgrounds]);


    const handleImportConfirm = () => {
        if (previewGrid) {
            dispatch({ type: 'UPDATE_PROJECT_DATA', payload: previewGrid });
            setIsGenerateModalOpen(false);
            setImportFile(null);
            setPreviewGrid(null);
        }
    };
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
        <Button
            variant={activeTool === tool ? 'active' : 'secondary'}
            onClick={() => handleToolChange(tool)}
            className={`text-xs justify-center flex-col h-16 w-16 ${activeTool === tool ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
            title={label}
        >
            {icon && <Icon name={icon} size="toolbar" className="mb-1" />}
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

            {/* Export Modal */}
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Export Center"
                footer={
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Icon name="info" size="md" />
                            <span>You can preview your PDF before downloading.</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={handlePreviewExport} disabled={!projectData || (selectedExportType === 'chart-only' && coMode !== 'stitch' && !exportShowCellSymbols && !showCellBackgrounds)}>
                                <Icon name="eye" size="md" className="mr-1" /> Preview PDF
                            </Button>
                            <Button variant="primary" onClick={handleConfirmExport} disabled={!projectData || (selectedExportType === 'chart-only' && coMode !== 'stitch' && !exportShowCellSymbols && !showCellBackgrounds)}>
                                <Icon name="download-pdf" size="md" className="mr-1" /> Export PDF
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-3">
                        Choose an export format and options. You can preview your PDF before downloading.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => setSelectedExportType('pattern-pack')}
                            className={`border rounded-lg p-3 text-left flex flex-col gap-1 transition-colors ${selectedExportType === 'pattern-pack' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-sm font-semibold">Pattern Pack (PDF)</span>
                            <span className="text-xs text-gray-600">
                                Professional booklet with multi-page charts, legends, and cover.
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedExportType('chart-only')}
                            className={`border rounded-lg p-3 text-left flex flex-col gap-1 transition-colors ${selectedExportType === 'chart-only' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-sm font-semibold">Chart Only (PDF)</span>
                            <span className="text-xs text-gray-600">
                                Single diagram focus. Ideal for working copies or quick prints.
                            </span>
                        </button>
                    </div>

                    {/* Restore Defaults Button Area */}
                    <div className="flex justify-end -mt-2 mb-4">
                        <button
                            onClick={selectedExportType === 'pattern-pack' ? applyPatternPackDefaults : applyChartOnlyDefaults}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
                            title={`Reset ${selectedExportType === 'pattern-pack' ? 'Pattern Pack' : 'Chart-Only'} options to V3 defaults`}
                        >
                            <Icon name="redo" size={12} className="mr-1 transform rotate-180 scale-x-[-1]" />
                            Restore {selectedExportType === 'pattern-pack' ? 'Pattern Pack' : 'Chart-Only'} Defaults
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* SECTION A: CHART STYLE */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Chart Style</h4>
                            {selectedExportType === 'pattern-pack' ? (
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center cursor-pointer text-sm p-2 border rounded hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="mr-3 h-4 w-4 text-indigo-600"
                                            checked={ppIncludeColor}
                                            onChange={(e) => setPpIncludeColor(e.target.checked)}
                                        />
                                        <div>
                                            <span className="font-medium">Include Color Chart</span>
                                            <p className="text-xs text-gray-500">Standard colored grid.</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center cursor-pointer text-sm p-2 border rounded hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="mr-3 h-4 w-4 text-indigo-600"
                                            checked={ppIncludeStitch}
                                            onChange={(e) => setPpIncludeStitch(e.target.checked)}
                                        />
                                        <div>
                                            <span className="font-medium">Include Stitch Chart</span>
                                            <p className="text-xs text-gray-500">Black & white symbol chart.</p>
                                        </div>
                                    </label>
                                    {/* Commit 2: Added Hybrid Toggle */}
                                    <label className="flex items-center cursor-pointer text-sm p-2 border rounded hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="mr-3 h-4 w-4 text-indigo-600"
                                            checked={ppIncludeHybrid}
                                            onChange={(e) => setPpIncludeHybrid(e.target.checked)}
                                        />
                                        <div>
                                            <span className="font-medium">Include Hybrid Chart</span>
                                            <p className="text-xs text-gray-500">Color background + symbols.</p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    <label className={`flex items-center cursor-pointer text-sm p-2 border rounded ${coMode === 'color' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="coMode"
                                            className="mr-3 h-4 w-4 text-indigo-600"
                                            checked={coMode === 'color'}
                                            onChange={() => setCoMode('color')}
                                        />
                                        <div>
                                            <span className="font-medium">Color Chart</span>
                                            <p className="text-xs text-gray-500">Colored blocks. Best for Mosaic/Intarsia.</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center cursor-pointer text-sm p-2 border rounded ${coMode === 'stitch' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="coMode"
                                            className="mr-3 h-4 w-4 text-indigo-600"
                                            checked={coMode === 'stitch'}
                                            onChange={() => setCoMode('stitch')}
                                        />
                                        <div>
                                            <span className="font-medium">Stitch Chart</span>
                                            <p className="text-xs text-gray-500">Symbols only (B&W). Best for Lace/Texture.</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-center cursor-pointer text-sm p-2 border rounded ${coMode === 'hybrid' ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="coMode"
                                            className="mr-3 h-4 w-4 text-indigo-600"
                                            checked={coMode === 'hybrid'}
                                            onChange={() => setCoMode('hybrid')}
                                        />
                                        <div>
                                            <span className="font-medium">Hybrid Chart</span>
                                            <p className="text-xs text-gray-500">Color background + Symbols overlay.</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* SECTION B: CELL APPEARANCE (Chart-Only) */}
                        {selectedExportType === 'chart-only' && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Cell Appearance</h4>
                                <div className="space-y-3 pl-1">
                                    {coMode === 'stitch' ? (
                                        <div className="text-sm text-gray-500 italic p-2 bg-gray-50 border rounded">
                                            Cell appearance is locked for Stitch charts.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center cursor-pointer text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2 rounded text-indigo-600"
                                                        checked={exportShowCellSymbols}
                                                        onChange={(e) => setExportShowCellSymbols(e.target.checked)}
                                                    />
                                                    Show symbols in cells
                                                </label>
                                            </div>

                                            <label className="flex items-center cursor-pointer text-sm">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2 rounded text-indigo-600"
                                                    checked={showCellBackgrounds}
                                                    onChange={(e) => setShowCellBackgrounds(e.target.checked)}
                                                />
                                                Show background colors
                                            </label>

                                            {!exportShowCellSymbols && !showCellBackgrounds && (
                                                <div className="text-xs text-red-600 font-medium">
                                                    Select symbols or background colors to avoid a blank chart.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SECTION C: LAYOUT OPTIONS */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Layout Options</h4>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 pl-1">
                                {selectedExportType === 'pattern-pack' ? (
                                    <>
                                        <div className="col-span-2 flex items-center gap-2 mb-1">
                                            <span className="text-sm text-gray-700">Pattern Overview:</span>
                                            <select
                                                className="text-sm border rounded px-2 py-1 bg-white"
                                                value={ppOverviewMode}
                                                onChange={(e) => setPpOverviewMode(e.target.value as any)}
                                            >
                                                <option value="auto">Auto (If multi-page)</option>
                                                <option value="always">Always Include</option>
                                                <option value="never">Never Include</option>
                                            </select>
                                        </div>

                                        <label className="flex items-center cursor-pointer text-sm">
                                            <input type="checkbox" className="mr-2 rounded text-indigo-600" checked={ppIncludeCover} onChange={(e) => setPpIncludeCover(e.target.checked)} />
                                            Include Cover Page
                                        </label>
                                        <label className="flex items-center cursor-pointer text-sm">
                                            <input type="checkbox" className="mr-2 rounded text-indigo-600" checked={ppIncludeYarn} onChange={(e) => setPpIncludeYarn(e.target.checked)} />
                                            Include Materials & Stitch Key
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-2 flex items-center gap-2 mb-1">
                                            <span className="text-sm text-gray-700">Overview:</span>
                                            <select
                                                className="text-sm border rounded px-2 py-1 bg-white"
                                                value={coOverviewMode}
                                                onChange={(e) => setCoOverviewMode(e.target.value as any)}
                                            >
                                                <option value="auto">Auto (If multi-page)</option>
                                                <option value="always">Always Include</option>
                                                <option value="never">Never Include</option>
                                            </select>
                                        </div>

                                        <label className="flex items-center cursor-pointer text-sm">
                                            <input type="checkbox" className="mr-2 rounded text-indigo-600" checked={coIncludeCover} onChange={(e) => setCoIncludeCover(e.target.checked)} />
                                            Include Cover Page
                                        </label>
                                        <label className="flex items-center cursor-pointer text-sm">
                                            <input type="checkbox" className="mr-2 rounded text-indigo-600" checked={coIncludeYarn} onChange={(e) => setCoIncludeYarn(e.target.checked)} />
                                            Include Materials & Stitch Key
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SECTION E: INSTRUCTIONS (Pattern Pack Only) */}
                        {selectedExportType === 'pattern-pack' && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Instructions</h4>
                                <div className="pl-1">
                                    <label className="flex items-center cursor-pointer text-sm mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2 rounded text-indigo-600"
                                            checked={ppIncludeInstructions}
                                            onChange={(e) => setPpIncludeInstructions(e.target.checked)}
                                        />
                                        <div>
                                            <span className="font-medium">Include Instructions</span>
                                            <p className="text-xs text-gray-500">Adds a printable Instructions section before charts. Never shares pages with the Overview or charts.</p>
                                        </div>
                                    </label>

                                    {ppIncludeInstructions && (
                                        <div className="ml-6 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                                            <p className="mb-2 italic">Customize the instructions that appear in your Pattern Pack.</p>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsInstructionsModalOpen(true)}
                                                className="w-full justify-center text-xs"
                                            >
                                                <Icon name="edit" size={12} className="mr-1" />
                                                Edit Instructions...
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SECTION D: BRANDING */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Branding</h4>
                            <div className="space-y-2 pl-1">
                                <input
                                    type="text"
                                    className="border rounded px-3 py-2 text-sm w-full"
                                    placeholder="Designer Name"
                                    value={exportDesignerName}
                                    onChange={(e) => setExportDesignerName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="border rounded px-3 py-2 text-sm w-full"
                                    placeholder="Website / Shop URL"
                                    value={exportWebsite}
                                    onChange={(e) => setExportWebsite(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="border rounded px-3 py-2 text-sm w-full"
                                    placeholder="Copyright Line (e.g., © 2024 Your Name)"
                                    value={exportCopyright}
                                    onChange={(e) => setExportCopyright(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Instructions Editor Modal */}
            <InstructionsEditorModal
                isOpen={isInstructionsModalOpen}
                onClose={() => setIsInstructionsModalOpen(false)}
                doc={project?.instructionDoc}
                onSave={(doc) => dispatch({ type: 'UPDATE_INSTRUCTION_DOC', payload: doc })}
                project={project}
            />

            {/* Generate Pattern Modal */}
            < Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Generate Pattern from Image" >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Upload Image</label>
                        <input type="file" ref={imageUploadRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <div className="flex gap-2">
                            <Button onClick={() => imageUploadRef.current?.click()} variant="secondary">
                                <Icon name="upload" size="sm" className="mr-2" /> Choose File
                            </Button>
                            <span className="text-sm text-gray-500 self-center">{importFile ? importFile.name : 'No file chosen'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Max Colors: {maxImportColors}</label>
                        <input type="range" min="2" max="32" value={maxImportColors} onChange={(e) => setMaxImportColors(Number(e.target.value))} className="w-full" />
                        <p className="text-xs text-gray-500">More colors = more detail, but harder to crochet.</p>
                    </div>

                    <div className="border rounded p-4 bg-gray-50 h-[300px] flex items-center justify-center relative group">
                        {isGeneratingPreview ? (
                            <div className="text-gray-500 flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                                Generating Preview...
                            </div>
                        ) : previewGrid ? (
                            <div className="text-center relative w-full h-full flex items-center justify-center">
                                {/* Canvas Preview */}
                                <canvas
                                    ref={previewCanvasRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        imageRendering: 'pixelated'
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {previewGrid.width}x{previewGrid.height}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <Button variant="secondary" onClick={() => setIsPreviewFullScreen(true)}><Icon name="maximize" size="sm" className="mr-2" /> Full Screen</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">Upload an image to see preview</div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleImportConfirm} disabled={!previewGrid}>Import Pattern</Button>
                    </div>
                </div>
            </Modal >

            {/* Full Screen Preview Modal */}
            {
                isPreviewFullScreen && previewGrid && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4">
                        <div className="flex justify-between items-center mb-4 text-white">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-bold">Pattern Preview</h3>
                                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-1">
                                    <span className="text-xs text-gray-400">Zoom:</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="5"
                                        step="0.1"
                                        value={previewZoom}
                                        onChange={(e) => setPreviewZoom(Number(e.target.value))}
                                        className="w-32"
                                    />
                                    <span className="text-xs w-8 text-right">{previewZoom.toFixed(1)}x</span>
                                </div>
                            </div>
                            <Button variant="secondary" onClick={() => setIsPreviewFullScreen(false)}><Icon name="close" size="sm" className="mr-2" /> Close</Button>
                        </div>
                        <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                            <canvas
                                ref={fullScreenCanvasRef}
                                style={{
                                    imageRendering: 'pixelated',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                }}
                            />
                        </div>
                    </div>
                )
            }

            <main className="flex-1 relative min-w-0">
                <PixelGridEditor
                    data={projectData}
                    yarnPalette={project.yarnPalette}
                    stitchMap={stitchMap}
                    primaryColorId={primaryColorId}
                    secondaryColorId={secondaryColorId}
                    primaryStitchId={primaryStitchId}
                    secondaryStitchId={secondaryStitchId}
                    isComboPaintMode={isComboPaintMode}
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
                    onSelectionChange={handleSelectionChangeWrapper}
                    floatingSelection={floatingSelection}
                    onFloatingSelectionChange={handleFloatingSelectionChange}
                    onContextMenu={handleOpenContextMenu}
                />

                {activeTool === 'select' && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-xl flex gap-2 border border-gray-200 z-30">
                        <Button variant="secondary" onClick={handleSelectAll} title="Select All (Ctrl+A)">
                            <Icon name="select-all" size="sm" />
                        </Button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <Button variant="secondary" onClick={handleCopy} disabled={!selection} title="Copy (Ctrl+C)">
                            <Icon name="copy" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handleCut} disabled={!selection} title="Cut (Ctrl+X)">
                            <Icon name="cut" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handlePaste} disabled={!clipboard} title="Paste (Ctrl+V)">
                            <Icon name="paste" className="w-4 h-4" />
                        </Button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <Button variant="secondary" onClick={() => handleFlipSelection('horizontal')} disabled={!selection} title="Flip Horizontal">
                            <Icon name="selection-flip-horizontal" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={() => handleFlipSelection('vertical')} disabled={!selection} title="Flip Vertical">
                            <Icon name="selection-flip-vertical" className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handleRotateSelection} disabled={!selection} title="Rotate 90°">
                            <Icon name="rotate-right" className="w-4 h-4" />
                        </Button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <Button variant="secondary" onClick={handleClearSelection} disabled={!selection} title="Clear (Del)">
                            <Icon name="clear-selection" className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </main>

            <aside className={`bg-white border-l shadow-xl z-20 transition-all duration-300 flex flex-col ${isPanelOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Tools</h3>
                    <Button variant="secondary" onClick={() => setIsPanelOpen(false)}><Icon name="close" size="sm" /></Button>
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
                            <ToolButton tool="select" label="Select" icon="select" />
                            <ToolButton tool="text" label="Text" icon="text" />
                            <ToolButton tool="fill-row" label="Row" icon="row" />
                            <ToolButton tool="fill-column" label="Col" icon="column" />
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
                                <button onClick={() => setReplaceTarget('from')} className={`w-6 h-6 border rounded relative overflow-hidden ${replaceTarget === 'from' ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: replaceFromColor ? yarnColorMap.get(replaceFromColor)?.hex : 'transparent' }} title="Click to set from palette/canvas">
                                    {replaceFromColor === null && (
                                        <>
                                            <div className="absolute inset-0 bg-white opacity-50" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }}></div>
                                            <Icon name="transparency-color" size={20} className="absolute inset-0 m-auto text-red-500 opacity-80" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span>To:</span>
                                <button onClick={() => setReplaceTarget('to')} className={`w-6 h-6 border rounded relative overflow-hidden ${replaceTarget === 'to' ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: replaceToColor ? yarnColorMap.get(replaceToColor)?.hex : 'transparent' }} title="Click to set from palette/canvas">
                                    {replaceToColor === null && (
                                        <>
                                            <div className="absolute inset-0 bg-white opacity-50" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }}></div>
                                            <Icon name="transparency-color" size={20} className="absolute inset-0 m-auto text-red-500 opacity-80" />
                                        </>
                                    )}
                                </button>
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
                                className={`w-8 h-8 rounded border-2 relative overflow-hidden ${primaryColorId === null ? 'ring-2 ring-brand-midBlue ring-offset-1 z-10' : 'border-gray-200'} ${secondaryColorId === null ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                                title="Eraser (Left: Primary, Right: Secondary)"
                            >
                                <div className="absolute inset-0 bg-white opacity-50" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }}></div>
                                <Icon name="transparency-color" size={24} className="absolute inset-0 m-auto text-red-500 opacity-80" />
                            </button>
                            {project.yarnPalette.map(yarn => (
                                <button
                                    key={yarn.id}
                                    onClick={(e) => handlePaletteClick(yarn.id, e)}
                                    onContextMenu={(e) => handlePaletteClick(yarn.id, e)}
                                    className={`w-8 h-8 rounded border-2 ${primaryColorId === yarn.id ? 'ring-2 ring-brand-midBlue ring-offset-1 z-10' : 'border-gray-200'} ${secondaryColorId === yarn.id ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                                    style={{ backgroundColor: yarn.hex }}
                                    title={`${yarn.name} (${yarn.brand})`}
                                />
                            ))}
                            <button onClick={() => setIsColorPickerOpen(true)} className="w-8 h-8 rounded border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 hover:bg-gray-100" title="Add Custom Color">
                                <Icon name="plus" size="sm" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 mt-3">
                            {/* Primary (Left) */}
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="font-bold text-gray-500 text-xs">L:</span>
                                    {primaryColorId ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: yarnColorMap.get(primaryColorId)?.hex }}></div>
                                            <span className="text-sm truncate font-medium">{yarnColorMap.get(primaryColorId)?.name}</span>
                                        </>
                                    ) : <span className="text-sm text-gray-500 italic">Eraser</span>}
                                </div>
                                {isComboPaintMode ? (
                                    primaryStitch && (
                                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded border border-gray-300 font-bold text-lg shadow-sm" title={`Stitch: ${primaryStitch.name}`}>
                                            {primaryStitch.symbol}
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded border border-gray-200 text-gray-300" title="Stitch disabled (Enable Combo Paint Mode)">
                                        <Icon name="ban" size="sm" />
                                    </div>
                                )}
                            </div>

                            {/* Secondary (Right) */}
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="font-bold text-gray-500 text-xs">R:</span>
                                    {secondaryColorId ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: yarnColorMap.get(secondaryColorId)?.hex }}></div>
                                            <span className="text-sm truncate font-medium">{yarnColorMap.get(secondaryColorId)?.name}</span>
                                        </>
                                    ) : <span className="text-sm text-gray-500 italic">Eraser</span>}
                                </div>
                                {isComboPaintMode ? (
                                    secondaryStitch && (
                                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded border border-gray-300 font-bold text-lg shadow-sm" title={`Stitch: ${secondaryStitch.name}`}>
                                            {secondaryStitch.symbol}
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded border border-gray-200 text-gray-300" title="Stitch disabled (Enable Combo Paint Mode)">
                                        <Icon name="ban" size="sm" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-3 space-y-2 border-t pt-2 border-gray-100">
                            <label className="flex items-center justify-between text-sm text-gray-700 cursor-pointer select-none p-1 hover:bg-gray-50 rounded">
                                <span className="font-medium">Combo Paint Mode</span>
                                <input
                                    type="checkbox"
                                    checked={isComboPaintMode}
                                    onChange={(e) => setIsComboPaintMode(e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                            </label>
                            <Button variant="secondary" onClick={() => setIsStitchPaletteOpen(true)} className="w-full justify-center text-xs h-8">
                                <Icon name="manage-stitches" size={12} className="mr-1" /> Manage Stitches
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Symmetry</h4>
                        <div className="flex gap-2">
                            <Button
                                variant={symmetry.vertical ? 'active' : 'secondary'}
                                onClick={() => toggleSymmetry('vertical')}
                                className={`flex-1 justify-center ${symmetry.vertical ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                            >
                                <Icon name="symmetry-vertical" size="sm" className="mr-2" /> Vert
                            </Button>
                            <Button
                                variant={symmetry.horizontal ? 'active' : 'secondary'}
                                onClick={() => toggleSymmetry('horizontal')}
                                className={`flex-1 justify-center ${symmetry.horizontal ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                            >
                                <Icon name="symmetry-horizontal" size="sm" className="mr-2" /> Horiz
                            </Button>
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

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Generate Pattern</h4>
                        <Button onClick={() => setIsGenerateModalOpen(true)} className="w-full justify-center"><Icon name="generate-pattern" size="sm" className="mr-2" /> Generate Pattern</Button>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Instructions</h4>
                        <Button onClick={() => setIsInstructionsModalOpen(true)} className="w-full justify-center"><Icon name="edit-instructions" size="sm" className="mr-2" /> Edit Instructions</Button>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Export</h4>
                        <Button
                            variant="primary"
                            onClick={() => setIsExportModalOpen(true)}
                            className="w-full justify-center mb-2"
                        >
                            <Icon name="export-project" size="sm" className="mr-2" /> Export Project...
                        </Button>
                        <p className="text-xs text-gray-600">
                            Create printable PDFs with charts, yarn requirements, and optional branding. You can preview your export before downloading.
                        </p>
                    </div>


                </div>
                <div className="p-4 border-t bg-gray-50">
                    <Button variant="primary" onClick={openSettingsModal} className="w-full justify-center"><Icon name="settings" size="sm" className="mr-2" /> Settings</Button>
                </div>
            </aside>

            {
                !isPanelOpen && (
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        <Button onClick={() => setIsPanelOpen(true)} className="shadow-lg"><Icon name="brush" size="md" className="mr-2" /> Tools</Button>
                    </div>
                )
            }

            {/* Modals */}
            <Modal isOpen={isStitchPaletteOpen} onClose={() => setIsStitchPaletteOpen(false)} title="Stitch Library">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                        {DEFAULT_STITCH_LIBRARY.map(stitch => (
                            <div key={stitch.id} className="border rounded p-2 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-xl font-bold">
                                        {stitch.symbol}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{stitch.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{stitch.shortCode}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant={primaryStitchId === stitch.id ? 'active' : 'secondary'}
                                        onClick={() => setPrimaryStitchId(stitch.id)}
                                        className="text-xs px-2 py-1"
                                    >
                                        Set L
                                    </Button>
                                    <Button
                                        variant={secondaryStitchId === stitch.id ? 'active' : 'secondary'}
                                        onClick={() => setSecondaryStitchId(stitch.id)}
                                        className="text-xs px-2 py-1"
                                    >
                                        Set R
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Project Settings">
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
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
                        <h4 className="font-medium text-gray-900 mb-2">Gauge & Yarn Settings</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unit</label>
                                <select
                                    value={settingsForm.unit}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, unit: e.target.value })}
                                    className="mt-1 w-full border rounded px-2 py-1"
                                >
                                    <option value="in">Inches (in)</option>
                                    <option value="cm">Centimeters (cm)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stitches per unit</label>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={settingsForm.stitchesPerUnit}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, stitchesPerUnit: Number(e.target.value) })}
                                    className="mt-1 w-full border rounded px-2 py-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rows per unit</label>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={settingsForm.rowsPerUnit}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, rowsPerUnit: Number(e.target.value) })}
                                    className="mt-1 w-full border rounded px-2 py-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Yarn per stitch (inches)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settingsForm.yarnPerStitch}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, yarnPerStitch: Number(e.target.value) })}
                                    className="mt-1 w-full border rounded px-2 py-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hook / needle size (optional)</label>
                                <input
                                    type="text"
                                    value={settingsForm.hookSize}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, hookSize: e.target.value })}
                                    className="mt-1 w-full border rounded px-2 py-1"
                                    placeholder="e.g., 5mm, H/8"
                                />
                            </div>
                            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                {physicalSizeString ? (
                                    <span>✓ Estimated size: <strong>{physicalSizeString}</strong></span>
                                ) : (
                                    <span>Set stitches per unit and rows per unit to see the estimated size.</span>
                                )}
                            </div>
                        </div>
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

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={saveSettings}>Save Settings</Button>
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
                        <Button
                            variant={pickerMode === 'HEX' ? 'active' : 'secondary'}
                            onClick={() => setPickerMode('HEX')}
                            className={`flex-1 justify-center ${pickerMode === 'HEX' ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                        >
                            HEX
                        </Button>
                        <Button
                            variant={pickerMode === 'RGB' ? 'active' : 'secondary'}
                            onClick={() => setPickerMode('RGB')}
                            className={`flex-1 justify-center ${pickerMode === 'RGB' ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                        >
                            RGB
                        </Button>
                        <Button
                            variant={pickerMode === 'HSL' ? 'active' : 'secondary'}
                            onClick={() => setPickerMode('HSL')}
                            className={`flex-1 justify-center ${pickerMode === 'HSL' ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`}
                        >
                            HSL
                        </Button>
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
        </div >
    );
};
