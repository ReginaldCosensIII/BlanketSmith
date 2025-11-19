
import React, { useState, useReducer, useCallback, useMemo, ChangeEvent, useRef, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnyProject, PatternType, PixelGridData, ProjectState, ProjectAction, YarnColor, CellData, Symmetry } from './types';
import { createNewProject, getProjects, saveProject, deleteProject, processImageToGrid } from './services/projectService';
import { exportPixelGridToPDF } from './services/exportService';
import { Icon, Button, Modal } from './components/ui/SharedComponents';
import PixelGridEditor from './components/PixelGridEditor';
import { BLANKET_SIZES, PIXEL_FONT } from './constants';

// STATE MANAGEMENT (Context & Reducer)
const ProjectContext = React.createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  saveCurrentProject: () => void;
} | null>(null);

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'NEW_PROJECT':
    case 'LOAD_PROJECT':
      return { project: action.payload, history: [action.payload], historyIndex: 0 };
    case 'UPDATE_PROJECT_DATA': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, data: { ...state.project.data, ...action.payload } };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(updatedProject);
      return { ...state, project: updatedProject, history: newHistory, historyIndex: newHistory.length - 1 };
    }
    case 'UPDATE_PROJECT_NAME': {
        if (!state.project) return state;
        const updatedProject = { ...state.project, name: action.payload };
        return { ...state, project: updatedProject };
    }
    case 'UPDATE_PROJECT_SETTINGS': {
        if (!state.project) return state;
        const updatedProject = { ...state.project, settings: { ...state.project.settings, ...action.payload } };
        return { ...state, project: updatedProject };
    }
    case 'SET_PALETTE': {
        if (!state.project) return state;
        const updatedProject = { ...state.project, yarnPalette: action.payload };
        return { ...state, project: updatedProject };
    }
    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return { ...state, project: state.history[newIndex], historyIndex: newIndex };
      }
      return state;
    }
    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return { ...state, project: state.history[newIndex], historyIndex: newIndex };
      }
      return state;
    }
    default:
      return state;
  }
};

const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, { project: null, history: [], historyIndex: 0 });

  const saveCurrentProject = useCallback(() => {
    if (state.project) {
      saveProject(state.project);
    }
  }, [state.project]);

  // Auto-save functionality
  useEffect(() => {
      const timer = setTimeout(() => {
          if (state.project) {
              saveProject(state.project);
          }
      }, 2000); // Auto-save 2 seconds after last change
      return () => clearTimeout(timer);
  }, [state.project]);

  const value = useMemo(() => ({ state, dispatch, saveCurrentProject }), [state, dispatch, saveCurrentProject]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

const useProject = () => {
  const context = React.useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};

// --- COLOR MATH HELPERS ---
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

// --- HELPER COMPONENTS ---

const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-500'}`}>
    <Icon name={icon} className="w-6 h-6 mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </NavLink>
);

// --- LAYOUT COMPONENTS ---

const Header: React.FC<{ isSidebarVisible: boolean; onToggleSidebar: () => void; }> = ({ isSidebarVisible, onToggleSidebar }) => {
    const { state, saveCurrentProject } = useProject();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const DropdownLink: React.FC<{to: string, children: React.ReactNode}> = ({to, children}) => (
        <Link to={to} onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            {children}
        </Link>
    );

    return (
        <header className="bg-white shadow-md p-2 flex justify-between items-center z-20">
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg p-1">
                    <div className="bg-indigo-600 p-2 rounded-lg flex items-center justify-center w-10 h-10">
                        <span className="text-white font-bold text-lg">BS</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 hidden sm:block">BlanketSmith</h1>
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-30 p-2 space-y-1">
                        <DropdownLink to="/contact">Contact Us</DropdownLink>
                        <DropdownLink to="/partner">Partner With Us</DropdownLink>
                        <div className="border-t my-1"></div>
                        <div className="flex items-center justify-between p-2">
                            <label htmlFor="sidebar-toggle" className="text-sm font-medium text-gray-700">Show Sidebar</label>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isSidebarVisible}
                                id="sidebar-toggle"
                                onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSidebarVisible ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isSidebarVisible ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {state.project && <div className="text-gray-600 font-semibold">{state.project.name}</div>}
            <div className="flex items-center gap-2">
                {state.project && <Button onClick={saveCurrentProject}><Icon name="save" className="w-4 h-4"/> Save</Button>}
                <Button variant="secondary" onClick={() => navigate('/projects')}>
                    My Projects
                </Button>
            </div>
        </header>
    );
};


const Sidebar: React.FC = () => (
  <aside className="bg-indigo-600 p-2 flex flex-col gap-2">
    <NavItem to="/" icon="grid" label="Pixel" />
    <NavItem to="/c2c" icon="c2c" label="C2C" />
    <NavItem to="/stripes" icon="stripes" label="Stripes" />
    <NavItem to="/granny" icon="granny" label="Granny" />
  </aside>
);

const Footer: React.FC<{ zoom: number, onZoomChange: (newZoom: number) => void }> = ({ zoom, onZoomChange }) => {
    const { state, dispatch } = useProject();
    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    const handleZoomIn = () => onZoomChange(Math.min(zoom * 1.25, 100));
    const handleZoomOut = () => onZoomChange(Math.max(zoom / 1.25, 0.1));
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onZoomChange(Number(e.target.value) / 100);
    };

    return (
        <footer className="bg-gray-100 p-2 flex justify-between items-center z-20 border-t">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={() => dispatch({ type: 'UNDO' })} disabled={!canUndo}>
                    <Icon name="undo" className="w-4 h-4"/> Undo
                </Button>
                <Button variant="secondary" onClick={() => dispatch({ type: 'REDO' })} disabled={!canRedo}>
                    <Icon name="redo" className="w-4 h-4"/> Redo
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleZoomOut} className="p-2"><Icon name="zoom-out" className="w-4 h-4"/></Button>
                <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    value={zoom * 100}
                    onChange={handleSliderChange}
                    className="w-24 md:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <Button variant="secondary" onClick={handleZoomIn} className="p-2"><Icon name="zoom-in" className="w-4 h-4"/></Button>
                <span className="text-sm font-mono text-gray-600 w-16 text-center">{Math.round(zoom * 100)}%</span>
            </div>
        </footer>
    );
};

// --- PAGES / TOOLS ---

const PixelGraphPage: React.FC<{ zoom: number; onZoomChange: (newZoom: number) => void; }> = ({ zoom, onZoomChange }) => {
    type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column' | 'eyedropper' | 'text';
    type MirrorDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
    type ColorMode = 'HEX' | 'RGB' | 'HSL';

    const { state, dispatch } = useProject();
    
    // Dual Color System
    const [primaryColorId, setPrimaryColorId] = useState<string | null>(null);
    const [secondaryColorId, setSecondaryColorId] = useState<string | null>(null);
    
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showGridLines, setShowGridLines] = useState(true);
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [maxImportColors, setMaxImportColors] = useState(16);

    const [activeTool, setActiveTool] = useState<Tool>('brush');
    const [replaceFromColor, setReplaceFromColor] = useState<string | null | undefined>(undefined);
    const [replaceToColor, setReplaceToColor] = useState<string | null | undefined>(undefined);
    const [replaceTarget, setReplaceTarget] = useState<'from' | 'to' | null>(null);
    const [brushSize, setBrushSize] = useState(1);
    const [rowFillSize, setRowFillSize] = useState(1);
    const [colFillSize, setColFillSize] = useState(1);
    const [textToolInput, setTextToolInput] = useState('Text');
    const [textSize, setTextSize] = useState(1);
    const [symmetry, setSymmetry] = useState<Symmetry>({ vertical: false, horizontal: false });
    
    const [mirrorConfirm, setMirrorConfirm] = useState<{isOpen: boolean, direction: MirrorDirection | null}>({isOpen: false, direction: null});
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({ unit: 'in', stitchesPerUnit: 4, rowsPerUnit: 4, hookSize: '' });

    // Color Picker Modal State
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [tempCustomColor, setTempCustomColor] = useState('#FF0000');
    const [pickerMode, setPickerMode] = useState<ColorMode>('HEX');
    const [hsl, setHsl] = useState<[number, number, number]>([0, 100, 50]); // h:0-360, s:0-100, l:0-100
    const colorInputRef = useRef<HTMLInputElement>(null);

    const project = state.project?.type === 'pixel' ? state.project : null;
    
    const [newWidth, setNewWidth] = useState(project?.data && 'width' in project.data ? project.data.width : 50);
    const [newHeight, setNewHeight] = useState(project?.data && 'height' in project.data ? project.data.height : 50);
    
    const projectStateRef = useRef(state);
    useEffect(() => {
        projectStateRef.current = state;
    }, [state]);
    
    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            const key = e.key.toLowerCase();
            
            if ((e.ctrlKey || e.metaKey) && key === 'z') {
                e.preventDefault();
                dispatch({ type: 'UNDO' });
                return;
            }
            if ((e.ctrlKey || e.metaKey) && key === 'y') {
                e.preventDefault();
                dispatch({ type: 'REDO' });
                return;
            }
            
            switch(key) {
                case 'b': setActiveTool('brush'); break;
                case 'f': setActiveTool('fill'); break;
                case 'e': setActiveTool('eyedropper'); break;
                case 'r': setActiveTool('replace'); break;
                case 't': setActiveTool('text'); break;
                case 'x': {
                    // Swap colors
                    const temp = primaryColorId;
                    setPrimaryColorId(secondaryColorId);
                    setSecondaryColorId(temp);
                    break;
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [primaryColorId, secondaryColorId, dispatch]);

    const yarnColorMap = useMemo(() => 
        project ? new Map(project.yarnPalette.map(yc => [yc.id, yc])) : new Map(),
    [project]);
    
    // Initialize colors when project loads
    useEffect(() => {
        if (project && !primaryColorId) {
            if (project.yarnPalette.length > 0) {
                setPrimaryColorId(project.yarnPalette[0].id);
            }
        }
    }, [project]);

    // Sync HSL state ONLY when opening modal to avoid feedback loop
    useEffect(() => {
        if (isColorPickerOpen) {
            // Only sync from hex on open. Inside the modal, HSL is the source of truth for sliders.
            const rgb = hexToRgb(tempCustomColor);
            setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2]));
        }
    }, [isColorPickerOpen]); // Removed tempCustomColor dependency

    useEffect(() => {
        if (project?.data && 'width' in project.data) {
            setNewWidth(project.data.width);
            setNewHeight(project.data.height);
        }
    }, [project]);

    const updateGrid = useCallback((newGrid: CellData[]) => {
        const usedYarnSet = new Set<string>();
        newGrid.forEach(cell => {
            if (cell.colorId) usedYarnSet.add(cell.colorId);
        });
        dispatch({ type: 'UPDATE_PROJECT_DATA', payload: { 
            grid: newGrid, 
            palette: Array.from(usedYarnSet) 
        } });
    }, [dispatch]);

    const handleGridChange = (newGrid: CellData[]) => {
        if (!project || !project.data || !('grid' in project.data)) return;
        updateGrid(newGrid);
    };
    
    const handleFillCanvas = () => {
        const projectData = project?.data as PixelGridData;
        if (!projectData || primaryColorId === undefined) return;
        const newGrid = Array.from({ length: projectData.width * projectData.height }, () => ({ colorId: primaryColorId }));
        updateGrid(newGrid);
    };

    const handleReplace = () => {
        const projectData = project?.data as PixelGridData;
        if (!projectData || replaceFromColor === undefined || replaceToColor === undefined) return;
        const newGrid = projectData.grid.map(cell => 
            cell.colorId === replaceFromColor ? { ...cell, colorId: replaceToColor } : cell
        );
        updateGrid(newGrid as CellData[]);
        setReplaceFromColor(undefined);
        setReplaceToColor(undefined);
    };
    
    const handleCanvasClick = (gridX: number, gridY: number, isRightClick: boolean) => {
        const projectData = project?.data as PixelGridData;
        if (!projectData) return;
        const { width, height, grid } = projectData;
        const index = gridY * width + gridX;
        const clickedColorId = grid[index].colorId;

        if (activeTool === 'eyedropper') {
            if (isRightClick) {
                setSecondaryColorId(clickedColorId);
            } else {
                setPrimaryColorId(clickedColorId);
            }
            setActiveTool('brush');
            return;
        }

        if (activeTool === 'replace' && replaceTarget) {
            if (replaceTarget === 'from') setReplaceFromColor(clickedColorId);
            if (replaceTarget === 'to') setReplaceToColor(clickedColorId);
            setReplaceTarget(null);
            return;
        }
        
        const colorToApply = isRightClick ? secondaryColorId : primaryColorId;
        
        let newGrid = [...grid];
        let changed = false;

        const applyFill = (points: {x: number, y: number}[], tool: 'fill-row' | 'fill-column') => {
            points.forEach(point => {
                if (tool === 'fill-row') {
                    const offset = Math.floor((rowFillSize - 1) / 2);
                    const startY = point.y - offset;
                    for (let i = 0; i < rowFillSize; i++) {
                        const currentY = startY + i;
                        if (currentY >= 0 && currentY < height) {
                            for (let x = 0; x < width; x++) {
                                const idx = currentY * width + x;
                                if (newGrid[idx].colorId !== colorToApply) {
                                    newGrid[idx] = { ...newGrid[idx], colorId: colorToApply };
                                    changed = true;
                                }
                            }
                        }
                    }
                } else { // fill-column
                    const offset = Math.floor((colFillSize - 1) / 2);
                    const startX = point.x - offset;
                    for (let i = 0; i < colFillSize; i++) {
                        const currentX = startX + i;
                        if (currentX >= 0 && currentX < width) {
                            for (let y = 0; y < height; y++) {
                                const idx = y * width + currentX;
                                if (newGrid[idx].colorId !== colorToApply) {
                                    newGrid[idx] = { ...newGrid[idx], colorId: colorToApply };
                                    changed = true;
                                }
                            }
                        }
                    }
                }
            });
        };

        if (activeTool === 'text') {
            let currentX = gridX;
            textToolInput.toUpperCase().split('').forEach(char => {
                const charData = PIXEL_FONT[char];
                if (charData) {
                    charData.forEach((row, yOffset) => {
                        row.forEach((pixel, xOffset) => {
                            if (pixel === 1) {
                                for (let scaleY = 0; scaleY < textSize; scaleY++) {
                                    for (let scaleX = 0; scaleX < textSize; scaleX++) {
                                        const finalX = currentX + (xOffset * textSize) + scaleX;
                                        const finalY = gridY + (yOffset * textSize) + scaleY;
                                        if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) {
                                            const idx = finalY * width + finalX;
                                            if (newGrid[idx].colorId !== colorToApply) {
                                                newGrid[idx] = { ...newGrid[idx], colorId: colorToApply };
                                                changed = true;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });
                    currentX += (charData[0].length * textSize) + (1 * textSize);
                }
            });
        } else if (activeTool === 'fill-row' || activeTool === 'fill-column') {
            const pointsToFill = [{x: gridX, y: gridY}];
            
            if (activeTool === 'fill-row') {
                if (symmetry.horizontal) pointsToFill.push({ x: gridX, y: height - 1 - gridY });
                if (symmetry.vertical) pointsToFill.push({x: width - 1 - gridX, y: gridY });
                if (symmetry.vertical && symmetry.horizontal) pointsToFill.push({ x: width - 1 - gridX, y: height - 1 - gridY });
            } else {
                if (symmetry.vertical) pointsToFill.push({ x: width - 1 - gridX, y: gridY });
                if (symmetry.horizontal) pointsToFill.push({ x: gridX, y: height - 1 - gridY });
                if (symmetry.vertical && symmetry.horizontal) pointsToFill.push({ x: width - 1 - gridX, y: height - 1 - gridY });
            }

            const uniquePoints = Array.from(new Set(pointsToFill.map(p => `${p.x},${p.y}`))).map(s => {
                const [x, y] = s.split(',').map(Number);
                return { x, y };
            });

            applyFill(uniquePoints, activeTool);
        } else {
            return;
        }
        if (changed) {
            updateGrid(newGrid);
        }
    };
    
    // ... (Image upload logic remains the same)
    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const projectData = project?.data as PixelGridData;
        const fileInput = e.target;
        if (!fileInput.files || fileInput.files.length === 0 || !project || !projectData) return;
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                setIsProcessing(true);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setIsProcessing(false);
                    return;
                }
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const newGridData = await processImageToGrid(
                    imageData,
                    projectData.width,
                    projectData.height,
                    maxImportColors,
                    project.yarnPalette
                );
                dispatch({ type: 'UPDATE_PROJECT_DATA', payload: newGridData });
                setIsProcessing(false);
            };
            img.src = event.target?.result as string;
        };
        
        reader.readAsDataURL(file);
        fileInput.value = '';
    };
    
    // ... (Resize, Mirror, Settings modal logic remain the same)
    const handleResize = () => {
        const projectData = project?.data as PixelGridData;
        if (!projectData || !project || newWidth <= 0 || newHeight <= 0) return;
        if (projectData.width === newWidth && projectData.height === newHeight) return;

        const oldWidth = projectData.width;
        const oldHeight = projectData.height;
        const oldGrid = projectData.grid;

        const newGrid = Array.from({ length: newWidth * newHeight }, () => ({ colorId: null }));

        const offsetX = Math.floor((newWidth - oldWidth) / 2);
        const offsetY = Math.floor((newHeight - oldHeight) / 2);

        for (let y = 0; y < oldHeight; y++) {
            for (let x = 0; x < oldWidth; x++) {
                const newX = x + offsetX;
                const newY = y + offsetY;

                if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
                    const oldIndex = y * oldWidth + x;
                    const newIndex = newY * newWidth + newX;
                    newGrid[newIndex] = oldGrid[oldIndex];
                }
            }
        }

        dispatch({
            type: 'UPDATE_PROJECT_DATA',
            payload: {
                width: newWidth,
                height: newHeight,
                grid: newGrid as CellData[],
            },
        });
    };
    
    const confirmationMessages = {
        'left-to-right': 'This will overwrite the right half of the pattern with a mirrored copy of the left half.',
        'right-to-left': 'This will overwrite the left half of the pattern with a mirrored copy of the right half.',
        'top-to-bottom': 'This will overwrite the bottom half of the pattern with a mirrored copy of the top half.',
        'bottom-to-top': 'This will overwrite the top half of the pattern with a mirrored copy of the bottom half.',
    };

    const requestMirror = (direction: MirrorDirection) => {
        setMirrorConfirm({ isOpen: true, direction });
    };
    
    const confirmMirrorCanvas = useCallback(() => {
        const direction = mirrorConfirm.direction;
        if (!direction) return;
        
        const currentProjectState = projectStateRef.current;
        const projectToMirror = currentProjectState.project;

        if (!projectToMirror || projectToMirror.type !== 'pixel') {
            setMirrorConfirm({ isOpen: false, direction: null });
            return;
        }

        const projectData = projectToMirror.data as PixelGridData;
        const { width, height, grid: originalGrid } = projectData;
        const newGrid = [...originalGrid];

        switch(direction) {
            case 'left-to-right':
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < Math.ceil(width / 2); x++) {
                        const sourceIndex = y * width + x;
                        const destIndex = y * width + (width - 1 - x);
                        newGrid[destIndex] = originalGrid[sourceIndex];
                    }
                }
                break;
            case 'right-to-left':
                    for (let y = 0; y < height; y++) {
                    for (let x = 0; x < Math.ceil(width / 2); x++) {
                        const sourceIndex = y * width + (width - 1 - x);
                        const destIndex = y * width + x;
                        newGrid[destIndex] = originalGrid[sourceIndex];
                    }
                }
                break;
            case 'top-to-bottom':
                for (let y = 0; y < Math.ceil(height / 2); y++) {
                    for (let x = 0; x < width; x++) {
                        const sourceIndex = y * width + x;
                        const destIndex = (height - 1 - y) * width + x;
                        newGrid[destIndex] = originalGrid[sourceIndex];
                    }
                }
                break;
            case 'bottom-to-top':
                for (let y = 0; y < Math.ceil(height / 2); y++) {
                    for (let x = 0; x < width; x++) {
                        const sourceIndex = (height - 1 - y) * width + x;
                        const destIndex = y * width + x;
                        newGrid[destIndex] = originalGrid[sourceIndex];
                    }
                }
                break;
        }
        
        updateGrid(newGrid);
        setMirrorConfirm({ isOpen: false, direction: null });
    }, [mirrorConfirm.direction, updateGrid]);
    
    const yarnUsage = useMemo(() => {
        const projectData = project?.data as PixelGridData;
        if (!projectData || !project) return new Map<string, number>();
        const counts = new Map<string, number>();
        projectData.grid.forEach(cell => {
            if (cell.colorId) {
                counts.set(cell.colorId, (counts.get(cell.colorId) || 0) + 1);
            }
        });
        return counts;
    }, [project]);
    
    const openSettingsModal = () => {
        setSettingsForm({
            unit: project?.settings?.unit || 'in',
            stitchesPerUnit: project?.settings?.stitchesPerUnit || 4,
            rowsPerUnit: project?.settings?.rowsPerUnit || 4,
            hookSize: project?.settings?.hookSize || ''
        });
        setIsSettingsModalOpen(true);
    };

    const saveSettings = () => {
        dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: settingsForm });
        setIsSettingsModalOpen(false);
    };

    const projectData = project?.data as PixelGridData | undefined;
    
    const physicalSizeString = useMemo(() => {
        if (!projectData || !project?.settings) return null;
        const width = projectData.width;
        const height = projectData.height;
        const sts = Number(project.settings.stitchesPerUnit);
        const rows = Number(project.settings.rowsPerUnit);
        const unit = project.settings.unit || 'in';
        
        if (!sts || !rows) return null;
        
        const pWidth = (width / sts).toFixed(1);
        const pHeight = (height / rows).toFixed(1);
        return `${pWidth} x ${pHeight} ${unit}`;
    }, [projectData, project?.settings]);

    if (!project || !projectData) return <div className="p-4">No Pixel Art project loaded. Go to "My Projects" to create or load one.</div>;

    const hasSizeChanged = projectData.width !== newWidth || projectData.height !== newHeight;

    const handlePaletteClick = (colorId: string | null, e: React.MouseEvent) => {
        if (activeTool === 'replace' && replaceTarget) {
            if (replaceTarget === 'from') setReplaceFromColor(colorId);
            if (replaceTarget === 'to') setReplaceToColor(colorId);
            setReplaceTarget(null);
            return;
        }

        // Left click sets Primary, Right click sets Secondary
        if (e.button === 2) {
            e.preventDefault();
            setSecondaryColorId(colorId);
        } else {
            setPrimaryColorId(colorId);
        }
    };
    
    // --- NEW: Modal-based Color Addition Logic ---
    const handleConfirmAddColor = () => {
        const hex = tempCustomColor;
        const newColor: YarnColor = {
            id: `custom-${Date.now()}`,
            brand: 'Custom',
            name: `Custom ${hex}`,
            hex: hex,
            rgb: [parseInt(hex.slice(1,3), 16), parseInt(hex.slice(3,5), 16), parseInt(hex.slice(5,7), 16)]
        };
        const newPalette = [...project.yarnPalette, newColor];
        dispatch({ type: 'SET_PALETTE', payload: newPalette });
        setPrimaryColorId(newColor.id);
        setIsColorPickerOpen(false);
    };

    const updateColorFromHsl = (h: number, s: number, l: number) => {
        setHsl([h, s, l]);
        const rgb = hslToRgb(h, s, l);
        setTempCustomColor(rgbToHex(rgb[0], rgb[1], rgb[2]));
    };

    const ToolButton = ({ tool, label, icon }: { tool: Tool, label: string, icon?: string }) => (
        <Button
            variant={activeTool === tool ? 'primary' : 'secondary'}
            onClick={() => setActiveTool(tool)}
            className="text-xs justify-center flex-col h-14"
            title={label}
        >
            {icon && <Icon name={icon} className="w-5 h-5 mb-1" />}
            <span>{label}</span>
        </Button>
    );
    
    const toggleSymmetry = (mode: 'vertical' | 'horizontal') => {
        setSymmetry(prev => ({ ...prev, [mode]: !prev[mode] }));
    }

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {isProcessing && <div className="absolute inset-0 bg-white/70 z-30 flex items-center justify-center"><div className="text-lg font-semibold">Processing Image...</div></div>}

            {isPanelOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsPanelOpen(false)}
                    aria-hidden="true"
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
                />

                <div className="lg:hidden absolute bottom-4 right-4 z-20">
                    <Button onClick={() => setIsPanelOpen(true)}>
                        <Icon name="palette" className="w-5 h-5" />
                        <span>Tools</span>
                    </Button>
                </div>
            </main>

            <aside className={`w-72 bg-white border-l flex flex-col transition-transform duration-300 ease-in-out fixed inset-y-0 right-0 z-40 lg:static lg:z-auto lg:translate-x-0 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center mb-0 flex-shrink-0 border-b">
                    <h3 className="font-bold text-lg text-gray-800">Tools & Info</h3>
                    <button 
                        onClick={() => setIsPanelOpen(false)} 
                        className="lg:hidden p-1 text-gray-500 hover:text-gray-800"
                        aria-label="Close tools panel"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {/* ... (Upload, Resize, View Options sections remain same) */}
                    <div className="space-y-4 pb-4 border-b">
                        <div>
                            <Button variant="secondary" className="w-full" onClick={() => imageUploadRef.current?.click()}>
                                <Icon name="upload" className="w-4 h-4"/> Upload Image
                            </Button>
                            <input type="file" ref={imageUploadRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        {/* ... Max Colors, Dimensions, View Options ... */}
                        <div className="space-y-2">
                            <label htmlFor="max-colors" className="flex items-center justify-between text-sm font-medium text-gray-700">
                                <span>Max Colors for Import</span>
                                <span className="font-mono bg-white px-2 py-0.5 rounded border">{maxImportColors}</span>
                            </label>
                            <input
                                id="max-colors"
                                type="range"
                                min="2"
                                max="64"
                                value={maxImportColors}
                                onChange={(e) => setMaxImportColors(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-700">Pattern Dimensions</h4>
                            <div className="flex items-center gap-2">
                                <input type="number" aria-label="width" value={newWidth} onChange={e => setNewWidth(parseInt(e.target.value, 10) || 0)} className="w-full text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                                <span className="text-gray-500">x</span>
                                <input type="number" aria-label="height" value={newHeight} onChange={e => setNewHeight(parseInt(e.target.value, 10) || 0)} className="w-full text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                            <Button className="w-full mt-2" onClick={handleResize} disabled={!hasSizeChanged}>Resize Canvas</Button>

                            <div className="mt-4 pt-3 border-t border-dashed">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-500">Est. Physical Size</span>
                                    <button onClick={openSettingsModal} className="text-xs text-indigo-600 hover:underline">Edit Gauge</button>
                                </div>
                                <div className="text-center font-mono bg-gray-50 text-gray-800 p-1 rounded border text-sm">
                                    {physicalSizeString || 'Set Gauge to Calculate'}
                                </div>
                            </div>
                        </div>

                         <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-700">View Options</h4>
                            <div className="flex items-center justify-between">
                                <label htmlFor="grid-toggle" className="text-sm text-gray-700">Show Grid Lines</label>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={showGridLines}
                                    id="grid-toggle"
                                    onClick={() => setShowGridLines(!showGridLines)}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${showGridLines ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${showGridLines ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pb-4 border-b">
                        <h4 className="font-semibold mb-2 text-gray-700">Advanced Tools</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <ToolButton tool="brush" label="Brush (B)" icon="edit"/>
                            <ToolButton tool="fill-row" label="Row Fill"/>
                            <ToolButton tool="fill-column" label="Col Fill"/>
                            <ToolButton tool="fill" label="Fill (F)"/>
                            <ToolButton tool="replace" label="Rep (R)"/>
                            <ToolButton tool="eyedropper" label="Pick (E)" icon="eyedropper" />
                            <ToolButton tool="text" label="Text (T)" icon="text" />
                        </div>
                        {/* Tool options sections... */}
                        {activeTool === 'brush' && (
                            <div className="p-2 border rounded-md bg-gray-50 space-y-2">
                                <label htmlFor="brush-size" className="flex items-center justify-between text-sm font-medium text-gray-700">
                                    <span>Brush Size</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded">{brushSize}</span>
                                </label>
                                <input
                                    id="brush-size"
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                         {activeTool === 'text' && (
                            <div className="p-2 border rounded-md bg-gray-50 space-y-2">
                                <label htmlFor="text-tool-input" className="text-sm font-medium text-gray-700">Text to Place</label>
                                <input
                                    id="text-tool-input"
                                    type="text"
                                    value={textToolInput}
                                    onChange={(e) => setTextToolInput(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <label htmlFor="text-size" className="flex items-center justify-between text-sm font-medium text-gray-700">
                                    <span>Text Size</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded">{textSize}x</span>
                                </label>

                                <input
                                    id="text-size"
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={textSize}
                                    onChange={(e) => setTextSize(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                        {activeTool === 'fill' && (
                            <div className="p-2 border rounded-md bg-gray-50">
                                <Button onClick={handleFillCanvas} className="w-full" disabled={primaryColorId === undefined}>Fill with Primary</Button>
                            </div>
                        )}
                        {activeTool === 'replace' && (
                            <div className="p-2 border rounded-md bg-gray-50 space-y-2">
                                <p className="text-xs text-center text-gray-600 pb-2">Activate a box, then pick a color from the palette or the canvas.</p>
                                <div className="flex items-center justify-around">
                                    <div className="text-center">
                                        <span className="text-xs font-medium text-gray-700">From</span>
                                        <div
                                            onClick={() => setReplaceTarget('from')}
                                            className={`relative w-10 h-10 rounded-md cursor-pointer border-2 flex items-center justify-center ${replaceTarget === 'from' ? 'border-indigo-600 ring-2' : 'border-gray-300'}`}
                                            style={{ backgroundColor: replaceFromColor ? yarnColorMap.get(replaceFromColor)?.hex : '#eee' }}
                                        >
                                            {replaceFromColor === null && (
                                                <div className="w-8 h-1 bg-red-500 transform rotate-45 absolute"></div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-500 pt-4">→</span>
                                    <div className="text-center">
                                        <span className="text-xs font-medium text-gray-700">To</span>
                                        <div
                                            onClick={() => setReplaceTarget('to')}
                                            className={`relative w-10 h-10 rounded-md cursor-pointer border-2 flex items-center justify-center ${replaceTarget === 'to' ? 'border-indigo-600 ring-2' : 'border-gray-300'}`}
                                            style={{ backgroundColor: replaceToColor ? yarnColorMap.get(replaceToColor)?.hex : '#eee' }}
                                        >
                                            {replaceToColor === null && (
                                                <div className="w-8 h-1 bg-red-500 transform rotate-45 absolute"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleReplace} disabled={replaceFromColor === undefined || replaceToColor === undefined} className="w-full">Apply Replacement</Button>
                            </div>
                        )}
                         {activeTool === 'fill-row' && (
                            <div className="p-2 border rounded-md bg-gray-50 space-y-2">
                                <p className="text-xs text-center text-gray-600 pb-2">Click a row on the canvas to fill.</p>
                                <label htmlFor="row-fill-size" className="flex items-center justify-between text-sm font-medium text-gray-700">
                                    <span>Row Fill Size</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded">{rowFillSize}</span>
                                </label>
                                <input
                                    id="row-fill-size"
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={rowFillSize}
                                    onChange={(e) => setRowFillSize(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                        {activeTool === 'fill-column' && (
                            <div className="p-2 border rounded-md bg-gray-50 space-y-2">
                                <p className="text-xs text-center text-gray-600 pb-2">Click a column on the canvas to fill.</p>
                                <label htmlFor="col-fill-size" className="flex items-center justify-between text-sm font-medium text-gray-700">
                                    <span>Column Fill Size</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded">{colFillSize}</span>
                                </label>
                                <input
                                    id="col-fill-size"
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={colFillSize}
                                    onChange={(e) => setColFillSize(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="pb-4 border-b">
                         {/* ... Symmetry & Mirror sections ... */}
                        <h4 className="font-semibold mb-2 text-gray-700">Drawing Aids</h4>
                        <div className="space-y-2">
                            <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Symmetry Mode</h5>
                                <div className="flex gap-2">
                                    <Button 
                                        variant={symmetry.vertical ? 'primary' : 'secondary'}
                                        onClick={() => toggleSymmetry('vertical')}
                                        className="flex-1 justify-center"
                                        title="Vertical Symmetry"
                                    >
                                        <Icon name="symmetry-vertical" className="w-5 h-5" />
                                    </Button>
                                    <Button 
                                        variant={symmetry.horizontal ? 'primary' : 'secondary'}
                                        onClick={() => toggleSymmetry('horizontal')}
                                        className="flex-1 justify-center"
                                        title="Horizontal Symmetry"
                                    >
                                        <Icon name="symmetry-horizontal" className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Mirror Canvas</h5>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" onClick={() => requestMirror('left-to-right')} className="justify-center" title="Mirror Left to Right"><Icon name="mirror-l-r" className="w-5 h-5"/></Button>
                                    <Button variant="secondary" onClick={() => requestMirror('right-to-left')} className="justify-center" title="Mirror Right to Left"><Icon name="mirror-r-l" className="w-5 h-5"/></Button>
                                    <Button variant="secondary" onClick={() => requestMirror('top-to-bottom')} className="justify-center" title="Mirror Top to Bottom"><Icon name="mirror-t-b" className="w-5 h-5"/></Button>
                                    <Button variant="secondary" onClick={() => requestMirror('bottom-to-top')} className="justify-center" title="Mirror Bottom to Top"><Icon name="mirror-b-t" className="w-5 h-5"/></Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pb-4 border-b">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-700">Color Palette</h4>
                            <div className="flex items-center gap-2">
                                {/* Dual Color Indicators */}
                                <div className="relative w-8 h-8 mr-4">
                                    <div 
                                        className="absolute top-2 right-0 w-6 h-6 border border-gray-400 shadow-sm z-10 flex items-center justify-center bg-white" 
                                        style={{ backgroundColor: secondaryColorId ? yarnColorMap.get(secondaryColorId)?.hex : '#ffffff' }}
                                        title="Secondary Color (Right Click)"
                                    >
                                        {secondaryColorId === null && (
                                            <div className="w-6 h-0.5 bg-red-500 transform rotate-45 absolute"></div>
                                        )}
                                    </div>
                                    <div 
                                        className="absolute top-0 left-0 w-6 h-6 border border-gray-400 shadow-sm z-20 flex items-center justify-center bg-white" 
                                        style={{ backgroundColor: primaryColorId ? yarnColorMap.get(primaryColorId)?.hex : '#ffffff' }}
                                        title="Primary Color (Left Click)"
                                    >
                                        {primaryColorId === null && (
                                            <div className="w-6 h-0.5 bg-red-500 transform rotate-45 absolute"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Left click sets Primary. Right click sets Secondary.</p>

                        <div className="grid grid-cols-6 gap-2">
                            {project.yarnPalette.map(color => (
                                <div key={color.id} 
                                    onMouseDown={(e) => handlePaletteClick(color.id, e)}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${primaryColorId === color.id ? 'ring-2 ring-offset-1 ring-indigo-500 border-indigo-600' : secondaryColorId === color.id ? 'ring-2 ring-offset-1 ring-pink-500 border-pink-600' : 'border-gray-200'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                            <div 
                                onMouseDown={(e) => handlePaletteClick(null, e)}
                                onContextMenu={(e) => e.preventDefault()}
                                className={`relative w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center bg-gray-100 ${primaryColorId === null ? 'ring-2 ring-offset-1 ring-indigo-500 border-indigo-600' : secondaryColorId === null ? 'ring-2 ring-offset-1 ring-pink-500 border-pink-600' : 'border-gray-200'}`}
                                title="Eraser">
                                <div className="w-8 h-1 bg-red-500 transform rotate-45 absolute"></div>
                            </div>
                            
                            {/* Add Custom Color Button - Modal Trigger */}
                            <div 
                                className="relative w-10 h-10 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center hover:border-gray-400 bg-white cursor-pointer" 
                                title="Add Custom Color"
                                onClick={() => setIsColorPickerOpen(true)}
                            >
                                <span className="text-xl text-gray-400 font-bold">+</span>
                            </div>
                        </div>
                    </div>

                    <div>
                         {/* ... Yarn Usage ... */}
                        <h4 className="font-semibold mb-2 text-gray-700">Yarn Usage</h4>
                        <ul className="text-sm space-y-2">
                        {projectData.palette.sort((a,b) => (yarnUsage.get(b) || 0) - (yarnUsage.get(a) || 0) ).map(yarnId => {
                            const yarn = project.yarnPalette.find(y => y.id === yarnId);
                            if (!yarn) return null;
                            return (
                                <li key={yarnId} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: yarn.hex }} />
                                    <span className="flex-1 text-gray-800">{yarn.name}</span>
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">{yarnUsage.get(yarnId) || 0}</span>
                                </li>
                            );
                        })}
                        </ul>
                    </div>
                    
                    <div className="pt-4">
                        <h4 className="font-semibold mb-2 text-gray-700">Export</h4>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => exportPixelGridToPDF(project.name, projectData, project.yarnPalette, yarnUsage)}>PDF</Button>
                        </div>
                    </div>
                </div>
            </aside>
            
            <Modal 
                isOpen={mirrorConfirm.isOpen} 
                onClose={() => setMirrorConfirm({ isOpen: false, direction: null })} 
                title="Confirm Mirror Canvas"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setMirrorConfirm({ isOpen: false, direction: null })}>Cancel</Button>
                        <Button onClick={confirmMirrorCanvas}>Confirm</Button>
                    </>
                }
            >
                <p className="text-gray-700">
                    {mirrorConfirm.direction && confirmationMessages[mirrorConfirm.direction]}
                </p>
                <p className="text-sm text-gray-500 mt-2">This action can be undone.</p>
            </Modal>

            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="Project Settings & Gauge"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsSettingsModalOpen(false)}>Cancel</Button>
                        <Button onClick={saveSettings}>Save Settings</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Measurement Unit</label>
                        <div className="flex mt-1 gap-4">
                            <label className="inline-flex items-center">
                                <input 
                                    type="radio" 
                                    className="form-radio text-indigo-600" 
                                    name="unit" 
                                    value="in" 
                                    checked={settingsForm.unit === 'in'} 
                                    onChange={(e) => setSettingsForm({...settingsForm, unit: e.target.value})}
                                />
                                <span className="ml-2 text-gray-700 text-gray-700">Inches (in)</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input 
                                    type="radio" 
                                    className="form-radio text-indigo-600" 
                                    name="unit" 
                                    value="cm" 
                                    checked={settingsForm.unit === 'cm'} 
                                    onChange={(e) => setSettingsForm({...settingsForm, unit: e.target.value})}
                                />
                                <span className="ml-2 text-gray-700 text-gray-700">Centimeters (cm)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stitches per {settingsForm.unit}</label>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={settingsForm.stitchesPerUnit}
                                onChange={(e) => setSettingsForm({...settingsForm, stitchesPerUnit: parseFloat(e.target.value)})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Horizontal Gauge</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rows per {settingsForm.unit}</label>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={settingsForm.rowsPerUnit}
                                onChange={(e) => setSettingsForm({...settingsForm, rowsPerUnit: parseFloat(e.target.value)})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                             <p className="text-xs text-gray-500 mt-1">Vertical Gauge</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recommended Hook/Needle Size</label>
                        <input
                            type="text"
                            placeholder="e.g. 5.0mm / H-8"
                            value={settingsForm.hookSize}
                            onChange={(e) => setSettingsForm({...settingsForm, hookSize: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </Modal>

            {/* Advanced Custom Color Modal */}
            <Modal
                isOpen={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
                title="Add Custom Color"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsColorPickerOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmAddColor}>Add Color</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Large Preview Swatch */}
                    <div
                        className="w-full h-24 rounded-lg border border-gray-300 shadow-inner transition-colors duration-200"
                        style={{ backgroundColor: tempCustomColor }}
                    />
                    
                    {/* Embedded Color Sliders */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Hue (Rainbow)</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="360" 
                                value={hsl[0]} 
                                onChange={(e) => updateColorFromHsl(Number(e.target.value), hsl[1], hsl[2])}
                                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                                style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Lightness</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={hsl[2]} 
                                    onChange={(e) => updateColorFromHsl(hsl[0], hsl[1], Number(e.target.value))}
                                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, black, hsl(${hsl[0]}, ${hsl[1]}%, 50%), white)` }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Saturation</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={hsl[1]} 
                                    onChange={(e) => updateColorFromHsl(hsl[0], Number(e.target.value), hsl[2])}
                                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs for Input Mode */}
                    <div className="flex border-b">
                        {(['HEX', 'RGB', 'HSL'] as ColorMode[]).map(mode => (
                            <button
                                key={mode}
                                className={`flex-1 py-2 text-sm font-medium ${pickerMode === mode ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setPickerMode(mode)}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="pt-2">
                        {pickerMode === 'HEX' && (
                             <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">#</span>
                                <input
                                    type="text"
                                    value={tempCustomColor.replace('#', '')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^[0-9A-Fa-f]*$/.test(val) && val.length <= 6) {
                                            const newHex = `#${val.toUpperCase()}`;
                                            if (val.length === 6) {
                                                const rgb = hexToRgb(newHex);
                                                setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2]));
                                            }
                                            setTempCustomColor(newHex);
                                        }
                                    }}
                                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono uppercase"
                                    maxLength={6}
                                />
                            </div>
                        )}
                        {pickerMode === 'RGB' && (
                            <div className="flex gap-2">
                                {hexToRgb(tempCustomColor).map((val, i) => (
                                    <div key={i} className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">{['R','G','B'][i]}</label>
                                        <input 
                                            type="number" 
                                            min="0" max="255" 
                                            value={val} 
                                            onChange={(e) => {
                                                const rgb = hexToRgb(tempCustomColor);
                                                rgb[i] = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                                                setTempCustomColor(rgbToHex(rgb[0], rgb[1], rgb[2]));
                                                setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2]));
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {pickerMode === 'HSL' && (
                            <div className="flex gap-2">
                                {[hsl[0], hsl[1], hsl[2]].map((val, i) => (
                                    <div key={i} className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">{['H','S','L'][i]}</label>
                                        <input 
                                            type="number" 
                                            min="0" max={i===0 ? 360 : 100}
                                            value={val} 
                                            onChange={(e) => {
                                                const newHsl = [...hsl] as [number, number, number];
                                                newHsl[i] = Math.min(i===0?360:100, Math.max(0, parseInt(e.target.value) || 0));
                                                updateColorFromHsl(newHsl[0], newHsl[1], newHsl[2]);
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                     {/* Fallback System Picker */}
                     <div className="text-center pt-2">
                         <button 
                            className="text-xs text-gray-400 underline hover:text-gray-600 flex items-center justify-center gap-1 w-full"
                            onClick={() => colorInputRef.current?.click()}
                         >
                             <Icon name="eyedropper" className="w-3 h-3" />
                             <span>Use System Picker</span>
                         </button>
                         <input
                            ref={colorInputRef}
                            type="color"
                            value={tempCustomColor}
                            onChange={(e) => {
                                setTempCustomColor(e.target.value);
                                const rgb = hexToRgb(e.target.value);
                                setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2]));
                            }}
                            className="sr-only"
                            aria-hidden="true"
                        />
                     </div>
                </div>
            </Modal>
        </div>
    );
};

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<AnyProject[]>(getProjects());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);
    const [modalStep, setModalStep] = useState(1);
    const [selectedProjectType, setSelectedProjectType] = useState<PatternType | null>(null);
    
    const throwSize = BLANKET_SIZES.find(s => s.name === 'Throw') || { width: 50, height: 60 };
    const [selectedSizeKey, setSelectedSizeKey] = useState('Throw');
    const [customWidth, setCustomWidth] = useState(throwSize.width);
    const [customHeight, setCustomHeight] = useState(throwSize.height);

    const { dispatch } = useProject();
    const navigate = useNavigate();

    const openModal = () => {
        setModalStep(1);
        setSelectedProjectType(null);
        setNewProjectName('');
        setSelectedSizeKey('Throw');
        setCustomWidth(throwSize.width);
        setCustomHeight(throwSize.height);
        setIsModalOpen(true);
    };

    const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        setSelectedSizeKey(key);
        if (key !== 'Custom') {
            const size = BLANKET_SIZES.find(s => s.name === key);
            if (size) {
                setCustomWidth(size.width);
                setCustomHeight(size.height);
            }
        }
    }

    const handleCreateProject = () => {
        if (newProjectName.trim() && customWidth > 0 && customHeight > 0 && selectedProjectType) {
            const newProject = createNewProject(selectedProjectType, newProjectName, customWidth, customHeight);
            saveProject(newProject);
            setProjects(getProjects());
            setIsModalOpen(false);
            dispatch({ type: 'NEW_PROJECT', payload: newProject });
            navigate('/');
        }
    };
    
    const handleDeleteProject = (projectId: string) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProject(projectId);
            setProjects(getProjects());
        }
    }
    
    const handleLoadProject = (project: AnyProject) => {
        dispatch({ type: 'LOAD_PROJECT', payload: project });
        navigate('/');
    }

    const handleExportProject = (project: AnyProject) => {
        try {
            const projectJson = JSON.stringify(project, null, 2);
            const blob = new Blob([projectJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.bsmith.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export project:", error);
            alert("Failed to export project.");
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not a string");
                const importedProject = JSON.parse(text) as AnyProject;
                
                if (!importedProject.id || !importedProject.name || !importedProject.type || !importedProject.data) {
                    throw new Error("Invalid project file format.");
                }

                importedProject.id = `proj-${Date.now()}`;
                importedProject.name = `${importedProject.name} (Imported)`;
                importedProject.createdAt = new Date().toISOString();
                importedProject.updatedAt = new Date().toISOString();
                
                saveProject(importedProject);
                setProjects(getProjects());
                alert("Project imported successfully!");
            } catch (error) {
                console.error("Failed to import project:", error);
                alert("Failed to import project. The file may be corrupt or in the wrong format.");
            } finally {
                if(event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const PatternTypeCard: React.FC<{type: PatternType, icon: string, label: string, enabled: boolean}> = ({type, icon, label, enabled}) => (
        <div 
            onClick={() => enabled && setSelectedProjectType(type)}
            className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all duration-200 ${selectedProjectType === type ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500' : 'border-gray-300 bg-white hover:border-indigo-400'} ${!enabled && 'opacity-50 cursor-not-allowed bg-gray-100'}`}
        >
            <Icon name={icon} className="w-10 h-10 mx-auto mb-2 text-indigo-600" />
            <h4 className="font-semibold text-gray-800">{label}</h4>
            {!enabled && <span className="text-xs text-gray-500 block">Coming Soon</span>}
        </div>
    );


    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <input
                type="file"
                ref={importFileRef}
                className="hidden"
                accept=".json,.bsmith.json"
                onChange={handleFileImport}
            />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => importFileRef.current?.click()}>Import Project</Button>
                    <Button onClick={openModal}>Create New Project</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map(p => (
                    <div key={p.id} className="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="p-4 flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{p.type} Pattern</p>
                            {(p.data as PixelGridData).width && <p className="text-sm text-gray-500">{(p.data as PixelGridData).width} x {(p.data as PixelGridData).height}</p>}
                            <p className="text-xs text-gray-400 mt-2">Updated: {new Date(p.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="p-2 border-t bg-gray-50 flex gap-2">
                            <Button variant="secondary" className="flex-1 text-xs" onClick={() => handleLoadProject(p)}>Open</Button>
                            <Button variant="secondary" className="p-2" onClick={() => handleExportProject(p)} title="Export Project">
                                <Icon name="download" className="w-4 h-4"/>
                            </Button>
                            <Button variant="danger" className="p-2" onClick={() => handleDeleteProject(p.id)} title="Delete Project">
                                <Icon name="trash" className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
                {modalStep === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">1. Select Pattern Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <PatternTypeCard type="pixel" icon="grid" label="Graph Pattern" enabled={true} />
                            <PatternTypeCard type="c2c" icon="c2c" label="C2C" enabled={false} />
                            <PatternTypeCard type="stripes" icon="stripes" label="Stripes" enabled={false} />
                            <PatternTypeCard type="granny" icon="granny" label="Granny Square" enabled={false} />
                        </div>
                        <Button onClick={() => setModalStep(2)} disabled={!selectedProjectType}>Next</Button>
                    </div>
                )}
                {modalStep === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">2. Project Details</h3>
                        <div>
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
                            <input
                                type="text"
                                id="projectName"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="projectSize" className="block text-sm font-medium text-gray-700">Pattern Size</label>
                             <select
                                id="projectSize"
                                value={selectedSizeKey}
                                onChange={handleSizeChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                {BLANKET_SIZES.map(size => (
                                    <option key={size.name} value={size.name}>{size.name} ({size.width} x {size.height})</option>
                                ))}
                                <option value="Custom">Custom Size</option>
                            </select>
                        </div>

                        {selectedSizeKey === 'Custom' && (
                            <div className="flex items-center gap-2">
                                <div>
                                    <label htmlFor="customWidth" className="block text-xs font-medium text-gray-500">Width</label>
                                    <input
                                        type="number"
                                        id="customWidth"
                                        value={customWidth}
                                        onChange={(e) => setCustomWidth(parseInt(e.target.value, 10) || 0)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="pt-5 text-gray-500">x</div>
                                <div>
                                    <label htmlFor="customHeight" className="block text-xs font-medium text-gray-500">Height</label>
                                    <input
                                        type="number"
                                        id="customHeight"
                                        value={customHeight}
                                        onChange={(e) => setCustomHeight(parseInt(e.target.value, 10) || 0)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <Button variant="secondary" onClick={() => setModalStep(1)}>Back</Button>
                            <Button onClick={handleCreateProject}>Create Project</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const PlaceholderPage: React.FC<{title: string}> = ({title}) => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500">This tool is under construction.</p>
        <p className="mt-4 text-sm bg-yellow-100 text-yellow-800 p-4 rounded-lg">
            <strong>TODO:</strong> Implement the core logic for the {title}. This includes data models, UI components for pattern generation, and specific export formats. The overall app structure is in place.
        </p>
    </div>
);

const ContactPage: React.FC = () => (
    <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h2>
        <p className="text-gray-600 mb-6">Have a question, feedback, or a suggestion? We'd love to hear from you! The best way to reach us is by email.</p>
        <a href="mailto:contact@blanketsmith.com" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Email: contact@blanketsmith.com
        </a>
    </div>
);

const PartnerPage: React.FC = () => (
     <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Partner With Us</h2>
        <p className="text-gray-600 mb-6">Are you a content creator, yarn brand, or designer in the fiber arts community? We're always looking for passionate people to collaborate with. Let's create something amazing together!</p>
         <a href="mailto:partners@blanketsmith.com" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Email: partners@blanketsmith.com
        </a>
    </div>
);


// --- MAIN APP COMPONENT ---

const MainLayout: React.FC = () => {
    const { state } = useProject();
    const location = useLocation();
    const [zoom, setZoom] = useState(1);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    useEffect(() => {
        if (!state.project) {
            setZoom(1);
        }
    }, [state.project]);

    const isEditorPage = ['/', '/c2c', '/stripes', '/granny'].includes(location.pathname);
    const mainContainerClasses = isEditorPage ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto';

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col">
            <Header isSidebarVisible={isSidebarVisible} onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)} />
            <div className="flex-1 flex overflow-hidden">
                {isSidebarVisible && <Sidebar/>}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className={mainContainerClasses}>
                        <Routes>
                            <Route path="/" element={<PixelGraphPage zoom={zoom} onZoomChange={setZoom} />} />
                            <Route path="/c2c" element={<PlaceholderPage title="C2C Pattern Generator" />} />
                            <Route path="/stripes" element={<PlaceholderPage title="Stripe Generator" />} />
                            <Route path="/granny" element={<PlaceholderPage title="Granny Square Planner" />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/partner" element={<PartnerPage />} />
                        </Routes>
                    </main>
                    {state.project && isEditorPage && <Footer zoom={zoom} onZoomChange={setZoom} />}
                </div>
            </div>
        </div>
    );
}

export default function App() {
  return (
    <ProjectProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </ProjectProvider>
  );
}
