import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { FloatingSelectionProvider } from './context/FloatingSelectionContext';
import { Header, Sidebar, Footer } from './components/layout/Layout';
import { PatternBookPage } from './pages/PatternBookPage';
import { PixelGraphPage } from './pages/PixelGraphPage';
import { ExportEngineTestPage } from './pages/ExportEngineTestPage';

// --- STATIC PAGES ---
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500">This tool is under construction.</p>
    </div>
);
const ContactPage: React.FC = () => (
    <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h2>
        <p className="text-gray-600 mb-6">Email: contact@blanketsmith.com</p>
    </div>
);
const PartnerPage: React.FC = () => (
    <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Partner With Us</h2>
        <p className="text-gray-600 mb-6">Email: partners@blanketsmith.com</p>
    </div>
);

const App: React.FC = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(() => localStorage.getItem('app_isSidebarVisible') !== 'false'); // Default true
    const [isLeftHanded, setIsLeftHanded] = useState(() => localStorage.getItem('app_isLeftHanded') === 'true'); // Default false
    const [zoom, setZoom] = useState(1);

    useEffect(() => { localStorage.setItem('app_isSidebarVisible', String(isSidebarVisible)); }, [isSidebarVisible]);
    useEffect(() => { localStorage.setItem('app_isLeftHanded', String(isLeftHanded)); }, [isLeftHanded]);

    // Update slider fill for cross-browser support (Required for custom gray track + blue fill)
    useEffect(() => {
        const updateSlider = (slider: HTMLInputElement) => {
            const percent = ((+slider.value - +slider.min) / (+slider.max - +slider.min)) * 100;
            slider.style.setProperty('--slider-fill', `${percent}%`);
        };

        const handleInput = (e: Event) => updateSlider(e.target as HTMLInputElement);

        const observer = new MutationObserver(() => {
            document.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(slider => {
                updateSlider(slider);
                slider.removeEventListener('input', handleInput);
                slider.addEventListener('input', handleInput);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            document.querySelectorAll('input[type="range"]').forEach(s =>
                s.removeEventListener('input', handleInput)
            );
        };
    }, []);



    return (
        <ProjectProvider>
            <FloatingSelectionProvider>
                <HashRouter>
                    <div className="flex flex-col h-screen bg-gray-100">
                        <Header
                            isSidebarVisible={isSidebarVisible}
                            onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
                        />

                        <div className="flex flex-1 overflow-hidden">
                            <div className={`transition-all duration-300 ${isSidebarVisible ? 'w-20' : 'w-0 overflow-hidden'}`}>
                                <Sidebar />
                            </div>

                            <Routes>
                                <Route path="/" element={<PixelGraphPage zoom={zoom} onZoomChange={setZoom} isLeftHanded={isLeftHanded} onToggleLeftHanded={() => setIsLeftHanded(!isLeftHanded)} />} />
                                <Route path="/projects" element={<PatternBookPage />} />
                                <Route path="/c2c" element={<PlaceholderPage title="C2C Crochet" />} />
                                <Route path="/stripes" element={<PlaceholderPage title="Stripe Generator" />} />
                                <Route path="/granny" element={<PlaceholderPage title="Granny Square Planner" />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/partner" element={<PartnerPage />} />
                                {/* Dev Only Routes */}
                                {(import.meta.env.DEV || process.env.NODE_ENV === 'development') && (
                                    <Route path="/qa-export" element={<ExportEngineTestPage />} />
                                )}
                            </Routes>
                        </div>

                        <Footer zoom={zoom} onZoomChange={setZoom} />
                    </div>
                </HashRouter>
            </FloatingSelectionProvider>
        </ProjectProvider>
    );
};

export default App;
