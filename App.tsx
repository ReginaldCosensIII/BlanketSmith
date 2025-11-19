
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

  const value = useMemo(() => ({ state, dispatch, saveCurrentProject }), [state, dispatch, saveCurrentProject]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

const useProject = () => {
  const context = React.useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};

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

    const { state, dispatch } = useProject();
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
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

    const project = state.project?.type === 'pixel' ? state.project : null;
    
    const [newWidth, setNewWidth] = useState(project?.data && 'width' in project.data ? project.data.width : 50);
    const [newHeight, setNewHeight] = useState(project?.data && 'height' in project.data ? project.data.height : 50);
    
    const projectStateRef = useRef(state);
    useEffect(() => {
        projectStateRef.current = state;
    }, [state]);

    const yarnColorMap = useMemo(() => 
        project ? new Map(project.yarnPalette.map(yc => [yc.id, yc])) : new Map(),
    [project]);

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
        if (!projectData || selectedColorId === undefined) return;
        const newGrid = Array.from({ length: projectData.width * projectData.height }, () => ({ colorId: selectedColorId }));
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
    
    const handleCanvasClick = (gridX: number, gridY: number) => {
        const projectData = project?.data as PixelGridData;
        if (!projectData) return;
        const { width, height, grid } = projectData;
        const index = gridY * width + gridX;
        const clickedColorId = grid[index].colorId;

        if (activeTool === 'eyedropper') {
            setSelectedColorId(clickedColorId);
            setActiveTool('brush');
            return;
        }

        if (activeTool === 'replace' && replaceTarget) {
            if (replaceTarget === 'from') setReplaceFromColor(clickedColorId);
            if (replaceTarget === 'to') setReplaceToColor(clickedColorId);
            setReplaceTarget(null);
            return;
        }
        
        if (selectedColorId === undefined) return;
        
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
                                if (newGrid[idx].colorId !== selectedColorId) {
                                    newGrid[idx] = { ...newGrid[idx], colorId: selectedColorId };
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
                                if (newGrid[idx].colorId !== selectedColorId) {
                                    newGrid[idx] = { ...newGrid[idx], colorId: selectedColorId };
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
                                            if (newGrid[idx].colorId !== selectedColorId) {
                                                newGrid[idx] = { ...newGrid[idx], colorId: selectedColorId };
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

        // Clear the input value to allow re-uploading the same file
        fileInput.value = '';
    };

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
    
    // --- SETTINGS MODAL LOGIC ---
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

    const handlePaletteClick = (colorId: string | null) => {
        if (activeTool === 'replace' && replaceTarget) {
            if (replaceTarget === 'from') setReplaceFromColor(colorId);
            if (replaceTarget === 'to') setReplaceToColor(colorId);
            setReplaceTarget(null);
        } else {
            setSelectedColorId(colorId);
        }
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
                    selectedColorId={selectedColorId}
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
                    <div className="space-y-4 pb-4 border-b">
                        <div>
                            <Button variant="secondary" className="w-full" onClick={() => imageUploadRef.current?.click()}>
                                <Icon name="upload" className="w-4 h-4"/> Upload Image
                            </Button>
                            <input type="file" ref={imageUploadRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

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
                            <ToolButton tool="brush" label="Brush" icon="edit"/>
                            <ToolButton tool="fill-row" label="Fill Row"/>
                            <ToolButton tool="fill-column" label="Fill Col"/>
                            <ToolButton tool="fill" label="Fill All"/>
                            <ToolButton tool="replace" label="Replace"/>
                            <ToolButton tool="eyedropper" label="Picker" icon="eyedropper" />
                            <ToolButton tool="text" label="Text" icon="text" />
                        </div>
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
                                <Button onClick={handleFillCanvas} className="w-full" disabled={selectedColorId === undefined}>Fill with Selected</Button>
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
                        <h4 className="font-semibold mb-2 text-gray-700">Color Palette</h4>
                        <div className="grid grid-cols-6 gap-2">
                            {project.yarnPalette.map(color => (
                                <div key={color.id} 
                                    onClick={() => handlePaletteClick(color.id)}
                                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${selectedColorId === color.id && activeTool !== 'replace' ? 'border-indigo-600 ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-200'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                            <div onClick={() => handlePaletteClick(null)}
                                className={`relative w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center bg-gray-100 ${selectedColorId === null && activeTool !== 'replace' ? 'border-indigo-600 ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-200'}`}
                                title="Eraser">
                                <div className="w-8 h-1 bg-red-500 transform rotate-45 absolute"></div>
                            </div>
                        </div>
                    </div>

                    <div>
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
                                <span className="ml-2 text-gray-700">Inches (in)</span>
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
                                <span className="ml-2 text-gray-700">Centimeters (cm)</span>
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
