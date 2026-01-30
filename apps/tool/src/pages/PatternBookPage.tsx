import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnyProject, PatternType, PixelGridData } from '../types';
import { createNewProject, getProjects, saveProject, deleteProject } from '../services/projectService';
import { useProject } from '../context/ProjectContext';
import { BLANKET_SIZES } from '../constants';
import { Button, Modal, Icon } from '../components/ui/SharedComponents';

export const PatternBookPage: React.FC = () => {
    const [projects, setProjects] = useState<AnyProject[]>(getProjects());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const importFileRef = useRef<HTMLInputElement>(null);
    const [modalStep, setModalStep] = useState(1);
    const [selectedProjectType, setSelectedProjectType] = useState<PatternType | null>(null);
    const throwSize = BLANKET_SIZES.find(s => s.name === 'Throw') || { width: 50, height: 60 };
    const [selectedSizeKey, setSelectedSizeKey] = useState('Throw');
    const [customWidth, setCustomWidth] = useState<number | string>(throwSize.width);
    const [customHeight, setCustomHeight] = useState<number | string>(throwSize.height);
    const { dispatch } = useProject();
    const navigate = useNavigate();

    useEffect(() => {
        setProjects(getProjects());
    }, []);

    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const startRenaming = (project: AnyProject) => {
        setEditingProjectId(project.id);
        setEditingName(project.name);
    };

    const cancelRenaming = () => {
        setEditingProjectId(null);
        setEditingName('');
    };

    const saveRenaming = () => {
        if (!editingProjectId || !editingName.trim()) return;
        const project = projects.find(p => p.id === editingProjectId);
        if (project) {
            const updated = { ...project, name: editingName };
            saveProject(updated);
            setProjects(getProjects());
        }
        cancelRenaming();
    };

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
        if (key === 'Custom') {
            // Clear values when switching to custom so user can type fresh
            setCustomWidth('');
            setCustomHeight('');
        } else {
            const size = BLANKET_SIZES.find(s => s.name === key);
            if (size) {
                setCustomWidth(size.width);
                setCustomHeight(size.height);
            }
        }
    }

    const handleCreateProject = () => {
        const width = Number(customWidth);
        const height = Number(customHeight);

        if (newProjectName.trim() && width > 0 && height > 0 && selectedProjectType) {
            const newProject = createNewProject(selectedProjectType, newProjectName, width, height);
            saveProject(newProject);
            setProjects(getProjects());
            setIsModalOpen(false);
            dispatch({ type: 'NEW_PROJECT', payload: newProject });
            navigate('/');
        }
    };

    const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProject(projectId);
            setProjects(getProjects());
        }
    }

    const handleLoadProject = (project: AnyProject) => {
        dispatch({ type: 'LOAD_PROJECT', payload: project });
        navigate('/');
    }

    const handleExportProject = (e: React.MouseEvent, project: AnyProject) => {
        e.stopPropagation();
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
                if (event.target) { event.target.value = ''; }
            }
        };
        reader.readAsText(file);
    };

    const PatternTypeCard: React.FC<{ type: PatternType, icon: string, label: string, enabled: boolean }> = ({ type, icon, label, enabled }) => (
        <div onClick={() => enabled && setSelectedProjectType(type)} className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all duration-200 ${selectedProjectType === type ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500' : 'border-gray-300 bg-white hover:border-indigo-400'} ${!enabled && 'opacity-50 cursor-not-allowed bg-gray-100'}`}>
            <Icon name={icon} size={48} className="mx-auto mb-2 text-indigo-600" />
            <h4 className="font-semibold text-gray-800">{label}</h4>
            {!enabled && <span className="text-xs text-gray-500 block">Coming Soon</span>}
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            <input type="file" ref={importFileRef} className="hidden" accept=".json,.bsmith.json" onChange={handleFileImport} />

            {/* Header Section - Fixed */}
            <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">My Pattern Book</h2>

                {/* Header Buttons - Always visible */}
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => importFileRef.current?.click()}>
                        <Icon name="import" size="md" className="mr-2" /> <span className="hidden md:inline">Import Pattern</span>
                    </Button>
                    <Button onClick={openModal}>
                        <Icon name="create-project" size="md" className="mr-2" /> <span className="hidden md:inline">Create New Pattern</span>
                    </Button>
                </div>
            </div>

            {/* Scrollable Content Section */}
            <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                {projects.length === 0 ? (
                    // Empty State - Simplified
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Icon name="pattern-book" size="xl" className="mb-4 opacity-20" />
                        <h3 className="text-xl font-medium">No patterns yet</h3>
                        <p className="mt-2 text-sm">Create or import a pattern to get started.</p>
                    </div>
                ) : (
                    // Grid View - Wider cards (max 3 cols)
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {projects.map(p => (
                            <div key={p.id} className="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden w-full">
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-2 h-8">
                                        {editingProjectId === p.id ? (
                                            <div className="flex items-center gap-2 w-full mr-2" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={e => setEditingName(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') saveRenaming();
                                                        if (e.key === 'Escape') cancelRenaming();
                                                    }}
                                                    className="flex-1 border border-indigo-300 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    autoFocus
                                                />
                                                <button onClick={saveRenaming} className="text-green-600 hover:text-green-700 p-1"><Icon name="check" size={16} /></button>
                                                <button onClick={cancelRenaming} className="text-red-500 hover:text-red-600 p-1"><Icon name="close" size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2 group/title">
                                                <h3 className="font-bold text-lg text-gray-900 truncate" title={p.name}>{p.name}</h3>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startRenaming(p); }}
                                                    className="opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-indigo-600 transition-opacity p-1"
                                                    title="Rename Pattern"
                                                >
                                                    <Icon name="edit" size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full capitalize shrink-0">{p.type}</span>
                                    </div>
                                    {(p.data as PixelGridData).width && <p className="text-sm text-gray-500">{(p.data as PixelGridData).width} x {(p.data as PixelGridData).height} stitches</p>}
                                    <p className="text-xs text-gray-400 mt-4">Updated: {new Date(p.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="p-2 border-t bg-gray-50 flex gap-2">
                                    <Button variant="secondary" className="flex-1 text-xs justify-center" onClick={() => handleLoadProject(p)}>Open</Button>
                                    <Button variant="secondary" className="p-2" onClick={(e) => handleExportProject(e, p)} title="Export Pattern JSON"> <Icon name="export-json" size={18} /> </Button>
                                    <Button variant="danger" className="p-2" onClick={(e) => handleDeleteProject(e, p.id)} title="Delete Pattern"> <Icon name="trash" size={18} /> </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Pattern">
                {modalStep === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">1. Select Pattern Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <PatternTypeCard type="pixel" icon="grid" label="Graph Pattern" enabled={true} />
                            <PatternTypeCard type="c2c" icon="c2c" label="C2C" enabled={false} />
                            <PatternTypeCard type="stripes" icon="stripes" label="Stripes" enabled={false} />
                            <PatternTypeCard type="granny" icon="granny" label="Granny Square" enabled={false} />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => setModalStep(2)} disabled={!selectedProjectType}>Next</Button>
                        </div>
                    </div>
                )}
                {modalStep === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">2. Project Details</h3>
                        <div>
                            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
                            <input type="text" id="projectName" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Enter project name..." />
                        </div>
                        <div>
                            <label htmlFor="projectSize" className="block text-sm font-medium text-gray-700">Pattern Size</label>
                            <select id="projectSize" value={selectedSizeKey} onChange={handleSizeChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                                {BLANKET_SIZES.map(size => (<option key={size.name} value={size.name}>{size.name} ({size.width} x {size.height})</option>))}
                                <option value="Custom">Custom Size</option>
                            </select>
                        </div>
                        {selectedSizeKey === 'Custom' && (
                            <div className="flex items-center gap-2">
                                <div>
                                    <label htmlFor="customWidth" className="block text-xs font-medium text-gray-500">Width</label>
                                    <input type="number" id="customWidth" value={customWidth} onChange={(e) => setCustomWidth(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div className="pt-5 text-gray-500">x</div>
                                <div>
                                    <label htmlFor="customHeight" className="block text-xs font-medium text-gray-500">Height</label>
                                    <input type="number" id="customHeight" value={customHeight} onChange={(e) => setCustomHeight(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between pt-4">
                            <Button variant="secondary" onClick={() => setModalStep(1)}>Back</Button>
                            <Button onClick={handleCreateProject}>Create Project</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
