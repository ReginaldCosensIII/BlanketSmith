import React, { useState, useReducer, useCallback, useMemo, ChangeEvent, useRef, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnyProject, PatternType, PixelGridData, ProjectState, ProjectAction, YarnColor } from './types';
import { createNewProject, getProjects, saveProject, deleteProject, processImageToGrid } from './services/projectService';
import { exportPixelGridToPDF } from './services/exportService';
import { Icon, Button, Modal } from './components/ui/SharedComponents';
import PixelGridEditor from './components/PixelGridEditor';
import { BLANKET_SIZES } from './constants';

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
        // This is a metadata change, might not need history snapshot
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

const Header: React.FC = () => {
    const { state, saveCurrentProject } = useProject();
    const navigate = useNavigate();

    return (
        <header className="bg-white shadow-md p-2 flex justify-between items-center z-20">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Icon name="grid" className="w-6 h-6 text-white"/>
                </div>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">BlanketGen</h1>
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

const Footer: React.FC = () => {
    const { state, dispatch } = useProject();
    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;

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
        </footer>
    );
};

// --- PAGES / TOOLS ---

const PixelGraphPage: React.FC = () => {
    type Tool = 'brush' | 'fill' | 'replace' | 'fill-row' | 'fill-column';

    const { state, dispatch } = useProject();
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showGridLines, setShowGridLines] = useState(true);
    const imageUploadRef = useRef<HTMLInputElement>(null);

    const [activeTool, setActiveTool] = useState<Tool>('brush');
    const [replaceFromColor, setReplaceFromColor] = useState<string | null>(null);
    const [replaceToColor, setReplaceToColor] = useState<string | null>(null);
    const [replaceTarget, setReplaceTarget] = useState<'from' | 'to' | null>(null);
    const [brushSize, setBrushSize] = useState(1);
    const [rowFillSize, setRowFillSize] = useState(1);
    const [colFillSize, setColFillSize] = useState(1);

    const project = state.project?.type === 'pixel' ? state.project : null;
    const projectData = project?.data as PixelGridData | undefined;
    
    const [newWidth, setNewWidth] = useState(projectData?.width || 50);
    const [newHeight, setNewHeight] = useState(projectData?.height || 50);

    const yarnColorMap = useMemo(() => 
        project ? new Map(project.yarnPalette.map(yc => [yc.id, yc])) : new Map(),
    [project]);

    useEffect(() => {
        if (projectData) {
            setNewWidth(projectData.width);
            setNewHeight(projectData.height);
        }
    }, [projectData?.width, projectData?.height]);

    const updateGrid = (newGrid: (string|null)[]) => {
        const usedYarnSet = new Set<string>();
        newGrid.forEach(cell => {
            if (cell) usedYarnSet.add(cell);
        });
        dispatch({ type: 'UPDATE_PROJECT_DATA', payload: { 
            grid: newGrid, 
            palette: Array.from(usedYarnSet) 
        } });
    };

    const handleGridChange = (newGrid: (string|null)[]) => {
        if (!projectData) return;
        updateGrid(newGrid);
    };
    
    const handleFillCanvas = () => {
        if (!projectData || selectedColorId === null) return;
        const newGrid = Array(projectData.width * projectData.height).fill(selectedColorId);
        updateGrid(newGrid);
    };

    const handleReplace = () => {
        if (!projectData || !replaceFromColor || !replaceToColor) return;
        const newGrid = projectData.grid.map(cellId => (cellId === replaceFromColor ? replaceToColor : cellId));
        updateGrid(newGrid);
        setReplaceFromColor(null);
        setReplaceToColor(null);
    };
    
    const handleCanvasClick = (gridX: number, gridY: number) => {
        if (!projectData || selectedColorId === null) return;
        const { width, height, grid } = projectData;
        let newGrid = [...grid];
        let changed = false;

        if (activeTool === 'fill-row') {
            const offset = Math.floor((rowFillSize - 1) / 2);
            const startY = gridY - offset;
            for (let i = 0; i < rowFillSize; i++) {
                const currentY = startY + i;
                if (currentY >= 0 && currentY < height) {
                    for (let x = 0; x < width; x++) {
                        const index = currentY * width + x;
                        if (newGrid[index] !== selectedColorId) {
                            newGrid[index] = selectedColorId;
                            changed = true;
                        }
                    }
                }
            }
        } else if (activeTool === 'fill-column') {
            const offset = Math.floor((colFillSize - 1) / 2);
            const startX = gridX - offset;
             for (let i = 0; i < colFillSize; i++) {
                const currentX = startX + i;
                if (currentX >= 0 && currentX < width) {
                    for (let y = 0; y < height; y++) {
                        const index = y * width + currentX;
                         if (newGrid[index] !== selectedColorId) {
                            newGrid[index] = selectedColorId;
                            changed = true;
                        }
                    }
                }
            }
        } else {
            return;
        }
        if (changed) {
            updateGrid(newGrid);
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !project || !projectData) return;
        const file = e.target.files[0];
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
                    32, // num colors, placeholder
                    project.yarnPalette
                );
                dispatch({ type: 'UPDATE_PROJECT_DATA', payload: newGridData });
                setIsProcessing(false);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleResize = () => {
        if (!projectData || !project || newWidth <= 0 || newHeight <= 0) return;
        if (projectData.width === newWidth && projectData.height === newHeight) return;

        const oldWidth = projectData.width;
        const oldHeight = projectData.height;
        const oldGrid = projectData.grid;

        const newGrid = Array(newWidth * newHeight).fill(null);

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
                grid: newGrid,
            },
        });
    };
    
    const yarnUsage = useMemo(() => {
        if (!projectData || !project) return new Map<string, number>();
        const counts = new Map<string, number>();
        projectData.grid.forEach(cellId => {
            if (cellId) {
                counts.set(cellId, (counts.get(cellId) || 0) + 1);
            }
        });
        return counts;
    }, [projectData, project]);


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

    const ToolButton = ({ tool, label }: { tool: Tool, label: string }) => (
        <Button
            variant={activeTool === tool ? 'primary' : 'secondary'}
            onClick={() => setActiveTool(tool)}
            className="text-xs justify-center"
        >
            {label}
        </Button>
    );

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {isProcessing && <div className="absolute inset-0 bg-white/70 z-30 flex items-center justify-center"><div className="text-lg font-semibold">Processing Image...</div></div>}

            {/* Backdrop for mobile */}
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
                />

                {/* Mobile Toggle Button */}
                <div className="lg:hidden absolute bottom-4 right-4 z-20">
                    <Button onClick={() => setIsPanelOpen(true)}>
                        <Icon name="palette" className="w-5 h-5" />
                        <span>Tools</span>
                    </Button>
                </div>
            </main>

            <aside className={`w-72 bg-white border-l p-4 flex flex-col transition-transform duration-300 ease-in-out fixed inset-y-0 right-0 z-40 lg:static lg:z-auto lg:translate-x-0 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="font-bold text-lg text-gray-800">Tools & Info</h3>
                    <button 
                        onClick={() => setIsPanelOpen(false)} 
                        className="lg:hidden p-1 text-gray-500 hover:text-gray-800"
                        aria-label="Close tools panel"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto -mr-4 pr-4 space-y-4">
                    <div className="space-y-4 pb-4 border-b">
                        <div>
                            <Button variant="secondary" className="w-full" onClick={() => imageUploadRef.current?.click()}>
                                <Icon name="upload" className="w-4 h-4"/> Upload Image
                            </Button>
                            <input type="file" ref={imageUploadRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-700">Pattern Dimensions</h4>
                            <div className="flex items-center gap-2">
                                <input type="number" aria-label="width" value={newWidth} onChange={e => setNewWidth(parseInt(e.target.value, 10) || 0)} className="w-full text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                                <span className="text-gray-500">x</span>
                                <input type="number" aria-label="height" value={newHeight} onChange={e => setNewHeight(parseInt(e.target.value, 10) || 0)} className="w-full text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                            <Button className="w-full mt-2" onClick={handleResize} disabled={!hasSizeChanged}>Resize Canvas</Button>
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
                            <ToolButton tool="brush" label="Brush" />
                            <ToolButton tool="fill-row" label="Fill Row" />
                            <ToolButton tool="fill-column" label="Fill Col" />
                            <ToolButton tool="fill" label="Fill All" />
                            <ToolButton tool="replace" label="Replace" />
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
                        {activeTool === 'fill' && (
                            <div className="p-2 border rounded-md bg-gray-50">
                                <Button onClick={handleFillCanvas} disabled={selectedColorId === null} className="w-full">Fill with Selected</Button>
                            </div>
                        )}
                        {activeTool === 'replace' && (
                            <div className="p-2 border rounded-md bg-gray-50 space-y-2">
                                <div className="flex items-center justify-around">
                                    <div className="text-center">
                                        <span className="text-xs font-medium text-gray-700">From</span>
                                        <div
                                            onClick={() => setReplaceTarget('from')}
                                            className={`w-10 h-10 rounded-md cursor-pointer border-2 ${replaceTarget === 'from' ? 'border-indigo-600 ring-2' : 'border-gray-300'}`}
                                            style={{ backgroundColor: replaceFromColor ? yarnColorMap.get(replaceFromColor)?.hex : '#eee' }}
                                        />
                                    </div>
                                    <span className="text-gray-500 pt-4">→</span>
                                    <div className="text-center">
                                        <span className="text-xs font-medium text-gray-700">To</span>
                                        <div
                                            onClick={() => setReplaceTarget('to')}
                                            className={`w-10 h-10 rounded-md cursor-pointer border-2 ${replaceTarget === 'to' ? 'border-indigo-600 ring-2' : 'border-gray-300'}`}
                                            style={{ backgroundColor: replaceToColor ? yarnColorMap.get(replaceToColor)?.hex : '#eee' }}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleReplace} disabled={!replaceFromColor || !replaceToColor} className="w-full">Apply Replacement</Button>
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
                                className={`w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center bg-gray-100 ${selectedColorId === null && activeTool !== 'replace' ? 'border-indigo-600 ring-2 ring-offset-2 ring-indigo-500' : 'border-gray-200'}`}
                                title="Eraser">
                                <div className="w-8 h-1 bg-red-500 transform rotate-45 absolute"></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2 text-gray-700">Yarn Usage</h4>
                        <ul className="text-sm space-y-2">
                        {projectData.palette.map(yarnId => {
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
        </div>
    );
};

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<AnyProject[]>(getProjects());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    
    const throwSize = BLANKET_SIZES.find(s => s.name === 'Throw') || { width: 50, height: 60 };
    const [selectedSizeKey, setSelectedSizeKey] = useState('Throw');
    const [customWidth, setCustomWidth] = useState(throwSize.width);
    const [customHeight, setCustomHeight] = useState(throwSize.height);

    const { dispatch } = useProject();
    const navigate = useNavigate();

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
        if (newProjectName.trim() && customWidth > 0 && customHeight > 0) {
            const newProject = createNewProject('pixel', newProjectName, customWidth, customHeight);
            saveProject(newProject);
            setProjects(getProjects());
            setIsModalOpen(false);
            setNewProjectName('');
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

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
                <Button onClick={() => setIsModalOpen(true)}>Create New Project</Button>
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
                             <Button variant="danger" className="p-2" onClick={() => handleDeleteProject(p.id)}><Icon name="trash" className="w-4 h-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
                <div className="space-y-4">
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
                    
                    <Button onClick={handleCreateProject}>Create Project</Button>
                </div>
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


// --- MAIN APP COMPONENT ---

const MainLayout: React.FC = () => {
    const { state } = useProject();
    const location = useLocation();

    // Editor pages handle their own scrolling internally. The main content area
    // should not scroll, to prevent interference (e.g., `overflow-y-auto`
    // adds `overflow-x: hidden`, which breaks the editor's horizontal scroll).
    // Other pages like Projects might need vertical scrolling.
    const isEditorPage = ['/', '/c2c', '/stripes', '/granny'].includes(location.pathname);
    const mainContainerClasses = isEditorPage ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto';

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col">
            <Header/>
            <div className="flex-1 flex overflow-hidden">
                <Sidebar/>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className={mainContainerClasses}>
                        <Routes>
                            <Route path="/" element={<PixelGraphPage />} />
                            <Route path="/c2c" element={<PlaceholderPage title="C2C Pattern Generator" />} />
                            <Route path="/stripes" element={<PlaceholderPage title="Stripe Generator" />} />
                            <Route path="/granny" element={<PlaceholderPage title="Granny Square Planner" />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                        </Routes>
                    </main>
                    {state.project && <Footer/>}
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
