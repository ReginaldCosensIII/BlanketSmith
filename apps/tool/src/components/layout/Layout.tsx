import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useFloatingSelection } from '../../context/FloatingSelectionContext';
import { Button, Icon } from '../ui/SharedComponents';
import { MIN_ZOOM, MAX_ZOOM } from '../../constants';
import '../../styles/footer.css';

import { FeedbackModal } from '../modals/FeedbackModal';

export const Header: React.FC<{ isSidebarVisible: boolean; onToggleSidebar: () => void; }> = ({ isSidebarVisible, onToggleSidebar }) => {
    const { state, saveCurrentProject } = useProject();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        const handleOpenFeedback = () => setIsFeedbackOpen(true);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener('blanketsmith:open-feedback', handleOpenFeedback);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('blanketsmith:open-feedback', handleOpenFeedback);
        };
    }, []);

    const DropdownLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => (
        <Link to={to} onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            {children}
        </Link>
    );

    return (
        <header className="bg-white shadow-md p-2 flex justify-between items-center z-20">
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center h-14 overflow-visible focus:outline-none focus:ring-2 focus:ring-brand-midBlue focus:ring-offset-2 rounded-xl p-0">
                    <img src="/branding/logos/Horizontal-Lockup-No-Slogan.svg" alt="BlanketSmith" className="h-20 w-auto max-w-none" />
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-30 p-2 space-y-1">
                        <DropdownLink to="/contact">Contact Us</DropdownLink>
                        <DropdownLink to="/partner">Partner With Us</DropdownLink>
                        <button
                            onClick={() => { setIsFeedbackOpen(true); setIsDropdownOpen(false); }}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Report Issue / Feedback
                        </button>
                        <div className="border-t my-1"></div>
                        <div className="flex items-center justify-between p-2">
                            <label htmlFor="sidebar-toggle" className="text-sm font-medium text-gray-700">Show Sidebar</label>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isSidebarVisible}
                                id="sidebar-toggle"
                                onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-midBlue ${isSidebarVisible ? 'bg-brand-midBlue' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isSidebarVisible ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            {state.project && <div className="text-gray-600 font-semibold hidden md:block">{state.project.name}</div>}
            <div className="flex items-center gap-2">
                {state.project && <Button variant="secondary" onClick={saveCurrentProject}><Icon name="save" size="md" /> <span className="hidden md:inline">Save</span></Button>}
                <Button variant="primary" onClick={() => navigate('/projects')}><Icon name="pattern-book" size="md" /> <span className="hidden md:inline">My Pattern Book</span></Button>
            </div>
        </header>
    );
};

const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
    <NavLink to={to} className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'}`}>
        <Icon name={icon} size="xl" className="mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </NavLink>
);

export const Sidebar: React.FC = () => (
    <aside className="bg-brand-midBlue p-2 flex flex-col gap-2 h-full overflow-y-auto">
        <NavItem to="/" icon="pixel-mode" label="Pixel" />
        <NavItem to="/c2c" icon="c2c" label="C2C" />
        <NavItem to="/stripes" icon="stripes" label="Stripes" />
        <NavItem to="/granny" icon="granny" label="Granny" />
    </aside>
);

export const Footer: React.FC<{ zoom: number, onZoomChange: (newZoom: number) => void, isZoomLocked?: boolean, onToggleZoomLock?: () => void }> = ({ zoom, onZoomChange, isZoomLocked, onToggleZoomLock }) => {
    const { state, dispatch } = useProject();
    const { hasFloatingSelection, performUndo, performRedo } = useFloatingSelection();

    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    const handleUndo = () => {
        if (hasFloatingSelection) {
            performUndo();
        } else {
            dispatch({ type: 'UNDO' });
        }
    };

    const handleRedo = () => {
        if (hasFloatingSelection) {
            performRedo();
        } else {
            dispatch({ type: 'REDO' });
        }
    };

    const handleZoomIn = () => onZoomChange(Math.min(zoom * 1.25, MAX_ZOOM));
    const handleZoomOut = () => onZoomChange(Math.max(zoom / 1.25, MIN_ZOOM));
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => { onZoomChange(Number(e.target.value) / 100); };

    return (
        <footer className="bg-gray-100 p-2 flex justify-between items-center z-20 border-t">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleUndo} disabled={!canUndo && !hasFloatingSelection}><Icon name="undo" size="md" /> <span className="hidden md:inline">Undo</span></Button>
                <Button variant="secondary" onClick={handleRedo} disabled={!canRedo && !hasFloatingSelection}><Icon name="redo" size="md" /> <span className="hidden md:inline">Redo</span></Button>
            </div>
            <div className="flex items-center gap-2">

                <Button variant="secondary" onClick={handleZoomOut} className="p-2"><Icon name="zoom-out" size="md" /></Button>
                <input type="range" min={MIN_ZOOM * 100} max={MAX_ZOOM * 100} value={zoom * 100} onChange={handleSliderChange} className="w-24 md:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                <Button variant="secondary" onClick={handleZoomIn} className="p-2"><Icon name="zoom-in" size="md" /></Button>
                <span className="text-sm font-mono text-gray-600 w-20 flex-shrink-0 text-center hidden md:inline">{Math.round(zoom * 100)}%</span>
            </div>
        </footer>
    );
};
