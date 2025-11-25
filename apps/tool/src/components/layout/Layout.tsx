import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { Button, Icon } from '../ui/SharedComponents';
import { MIN_ZOOM, MAX_ZOOM } from '../../constants';

export const Header: React.FC<{ isSidebarVisible: boolean; onToggleSidebar: () => void; }> = ({ isSidebarVisible, onToggleSidebar }) => {
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

    const DropdownLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => (
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
                {state.project && <Button onClick={saveCurrentProject}><Icon name="save" className="w-4 h-4" /> Save</Button>}
                <Button variant="secondary" onClick={() => navigate('/projects')}>My Projects</Button>
            </div>
        </header>
    );
};

const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
    <NavLink to={to} className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-500'}`}>
        <Icon name={icon} className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </NavLink>
);

export const Sidebar: React.FC = () => (
    <aside className="bg-indigo-600 p-2 flex flex-col gap-2 h-full overflow-y-auto">
        <NavItem to="/" icon="grid" label="Pixel" />
        <NavItem to="/c2c" icon="c2c" label="C2C" />
        <NavItem to="/stripes" icon="stripes" label="Stripes" />
        <NavItem to="/granny" icon="granny" label="Granny" />
    </aside>
);

export const Footer: React.FC<{ zoom: number, onZoomChange: (newZoom: number) => void }> = ({ zoom, onZoomChange }) => {
    const { state, dispatch } = useProject();
    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    const handleZoomIn = () => onZoomChange(Math.min(zoom * 1.25, MAX_ZOOM));
    const handleZoomOut = () => onZoomChange(Math.max(zoom / 1.25, MIN_ZOOM));
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => { onZoomChange(Number(e.target.value) / 100); };

    return (
        <footer className="bg-gray-100 p-2 flex justify-between items-center z-20 border-t">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={() => dispatch({ type: 'UNDO' })} disabled={!canUndo}><Icon name="undo" className="w-4 h-4" /> Undo</Button>
                <Button variant="secondary" onClick={() => dispatch({ type: 'REDO' })} disabled={!canRedo}><Icon name="redo" className="w-4 h-4" /> Redo</Button>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleZoomOut} className="p-2"><Icon name="zoom-out" className="w-4 h-4" /></Button>
                <input type="range" min={MIN_ZOOM * 100} max={MAX_ZOOM * 100} value={zoom * 100} onChange={handleSliderChange} className="w-24 md:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                <Button variant="secondary" onClick={handleZoomIn} className="p-2"><Icon name="zoom-in" className="w-4 h-4" /></Button>
                <span className="text-sm font-mono text-gray-600 w-16 text-center">{Math.round(zoom * 100)}%</span>
            </div>
        </footer>
    );
};
