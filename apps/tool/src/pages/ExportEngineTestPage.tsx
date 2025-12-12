import React, { useState } from 'react';
import { exportPixelGridToPDF } from '../services/exportService';
import { ExportOptions, PixelGridData, YarnColor } from '../types';

// Dev-only guard
const IS_DEV = import.meta.env.DEV || process.env.NODE_ENV === 'development';

if (!IS_DEV) {
    // If somehow reached in prod, render nothing or redirect
}

// --- 1. CANONICAL DEFAULTS ---

function getDefaultPatternPackOptions(): ExportOptions {
    return {
        exportType: 'pattern-pack',
        includeCoverPage: true,
        includeOverviewPage: false,
        includeYarnRequirements: true,
        includeStitchLegend: true,
        includeColorChart: true,
        includeStitchChart: true,
        chartVisual: {
            showCellSymbols: true,
            showCellBackgrounds: true,
            symbolMode: 'color-index'
        },
        branding: {
            designerName: 'QA Tester',
            website: 'www.qa-harness.com',
            copyrightLine: '© 2025 QA Harness'
        }
    };
}

function getDefaultChartOnlyOptions(): ExportOptions {
    return {
        exportType: 'chart-only',
        chartMode: 'color',
        includeCoverPage: false,
        includeYarnRequirements: false, // Default off for chart-only
        includeStitchLegend: false,
        chartVisual: {
            showCellSymbols: true,
            showCellBackgrounds: true,
            symbolMode: 'color-index'
        },
        branding: {
            designerName: 'QA Tester',
            website: 'www.qa-harness.com',
            copyrightLine: '© 2025 QA Harness'
        }
    };
}


// --- 2. MOCK DATA HELPERS ---

const MOCK_PALETTE: YarnColor[] = [
    { id: 'y1', name: 'Royal Blue', hex: '#002366', rgb: [0, 35, 102], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
    { id: 'y2', name: 'Matador', hex: '#E31837', rgb: [227, 24, 55], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
    { id: 'y3', name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
    { id: 'y4', name: 'Black', hex: '#000000', rgb: [0, 0, 0], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
];

interface MockGridConfig {
    width: number;
    height: number;
    patternType?: 'solid' | 'checker' | 'stripes';
    includeStitches?: boolean;
}

const createMockGrid = ({ width, height, patternType = 'checker', includeStitches = false }: MockGridConfig): PixelGridData => {
    const grid = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let colorId = 'y3';
            let stitchId: string | undefined = undefined;

            if (patternType === 'checker') {
                if ((x + y) % 2 === 0) colorId = 'y1';
            } else if (patternType === 'stripes') {
                if (y % 2 === 0) colorId = 'y2';
            } else {
                // solid
                colorId = 'y4';
            }

            if (includeStitches) {
                // Add some stitches for stitch mode tests
                if (x % 5 === 0) stitchId = 'sc';
                if (x % 5 === 1) stitchId = 'dc';
            }

            grid.push({ colorId, stitchId });
        }
    }
    return { width, height, grid, palette: MOCK_PALETTE.map(p => p.id) };
};

const createMockUsage = (gridData: PixelGridData): Map<string, number> => {
    const usage = new Map<string, number>();
    gridData.grid.forEach(cell => {
        if (cell.colorId) {
            usage.set(cell.colorId, (usage.get(cell.colorId) || 0) + 1);
        }
    });
    return usage;
};

// --- 3. SCENARIOS ---

interface Scenario {
    id: string;
    name: string;
    description: string;
    expected: string;
    gridConfig: MockGridConfig;
    // Overrides for defaults
    baseType: 'pattern-pack' | 'chart-only';
    overrides?: Partial<ExportOptions>;
}

// Helper to deep merge options
function buildOptions(baseType: 'pattern-pack' | 'chart-only', overrides: Partial<ExportOptions> = {}): ExportOptions {
    const defaults = baseType === 'pattern-pack' ? getDefaultPatternPackOptions() : getDefaultChartOnlyOptions();

    return {
        ...defaults,
        ...overrides,
        // Deep merge sub-objects if present in overrides
        chartVisual: {
            ...defaults.chartVisual,
            ...(overrides.chartVisual || {})
        },
        branding: {
            ...defaults.branding,
            ...(overrides.branding || {})
        }
    };
}

const SCENARIOS: Scenario[] = [
    // --- Standard V2 Scenarios ---
    {
        id: 'pp_small_default',
        name: 'PP Small Default',
        description: 'Standard Pattern Pack, 20x20 w/ Stitches',
        expected: 'Cover -> Yarn -> Color Chart -> Stitch Chart -> Stitch Legend. All fit comfortably.',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: {}
    },
    {
        id: 'pp_small_no_cover',
        name: 'PP Small No Cover',
        description: 'Pattern Pack, No Cover',
        expected: 'Page 1: Header -> Yarn -> Color Chart -> Stitch Chart -> Legend. Compact flow.',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: { includeCoverPage: false }
    },
    {
        id: 'pp_small_hybrid_color',
        name: 'PP Small Hybrid',
        description: 'Pattern Pack using Hybrid Color Chart',
        expected: 'Color Chart should have Symbols inside cells. Stitch Chart also present.',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: {
            chartVisual: { showCellSymbols: true, showCellBackgrounds: true, symbolMode: 'stitch-symbol' }
        }
    },
    {
        id: 'co_color_default',
        name: 'CO Color Default',
        description: 'Chart Only, Color Mode',
        expected: 'Single page (if fits) or multi-page. Just color chart. No Yarn/Legend.',
        baseType: 'chart-only',
        gridConfig: { width: 25, height: 25, patternType: 'stripes' },
        overrides: { chartMode: 'color' }
    },
    {
        id: 'co_color_cover_yarn',
        name: 'CO Color + Cover + Yarn',
        description: 'Chart Only but with extras enabled',
        expected: 'Cover Page -> Yarn Req -> Color Chart.',
        baseType: 'chart-only',
        gridConfig: { width: 25, height: 25 },
        overrides: { includeCoverPage: true, includeYarnRequirements: true }
    },
    {
        id: 'co_stitch_default',
        name: 'CO Stitch Default',
        description: 'Chart Only, Stitch Mode',
        expected: 'Black/White stitch symbols only.',
        baseType: 'chart-only',
        gridConfig: { width: 15, height: 15, patternType: 'solid', includeStitches: true },
        overrides: { chartMode: 'stitch' }
    },

    // --- Edge Cases / New Tests ---

    {
        id: 'edge_pp_no_stitches_force_legend',
        name: 'Edge: PP No Stitches + Legend ON',
        description: 'Pattern Pack, Grid has NO stitches, but includeStitchLegend is TRUE',
        expected: 'Stitch Legend should be OMITTED because no stitches are used.',
        baseType: 'pattern-pack',
        gridConfig: { width: 15, height: 15, includeStitches: false },
        overrides: { includeStitchLegend: true }
    },
    {
        id: 'edge_pp_stitches_match_legend',
        name: 'Edge: PP With Stitches + Legend',
        description: 'Standard PP with stitches',
        expected: 'Stitch Legend MUST be present and show symbols for used stitches.',
        baseType: 'pattern-pack',
        gridConfig: { width: 15, height: 15, includeStitches: true },
        overrides: { includeStitchLegend: true }
    },
    {
        id: 'edge_co_tall_flow',
        name: 'Edge: CO Tall + Yarn',
        description: 'Tall chart (20x60) + Yarn Req enabled',
        expected: 'Yarn Req on P1. Chart might start on P1 or push to P2. Should not clip.',
        baseType: 'chart-only',
        gridConfig: { width: 20, height: 60, patternType: 'stripes' },
        overrides: { includeYarnRequirements: true, chartMode: 'color' }
    },
    {
        id: 'edge_co_hybrid_no_bg',
        name: 'Edge: CO Hybrid No Checkers',
        description: 'Chart Only, Hybrid, Show Backgrounds FALSE',
        expected: 'Symbols visible, but cell backgrounds should be white/plain.',
        baseType: 'chart-only',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: {
            chartMode: 'hybrid',
            chartVisual: { showCellSymbols: true, showCellBackgrounds: false, symbolMode: 'stitch-symbol' }
        }
    },
    {
        id: 'edge_pp_color_no_bg',
        name: 'Edge: PP Color No BG',
        description: 'Pattern Pack, Color Chart, No Backgrounds',
        expected: 'Should look like a grid of empty squares (or numbers if symbol index used).',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20 },
        overrides: {
            chartVisual: { showCellSymbols: true, showCellBackgrounds: false, symbolMode: 'color-index' }
        }
    },

    // --- Stress Tests ---
    {
        id: 'stress_pp_large_color',
        name: 'Stress: Large Color Atlas',
        description: '60x60 Color Grid',
        expected: 'Should generate multiple pages (Atlas) for Color Chart.',
        baseType: 'pattern-pack',
        gridConfig: { width: 60, height: 60 },
        overrides: { includeStitchChart: false }
    },
    {
        id: 'stress_pp_large_stitch',
        name: 'Stress: Large Stitch Atlas',
        description: '60x60 Stitch Grid',
        expected: 'Should generate multiple pages for Stitch Chart.',
        baseType: 'pattern-pack',
        gridConfig: { width: 60, height: 60, includeStitches: true },
        overrides: { includeColorChart: false, includeStitchChart: true }
    }
];


// --- COMPONENT ---

export const ExportEngineTestPage: React.FC = () => {
    // State to store results
    const [results, setResults] = useState<Record<string, { status: 'pending' | 'success' | 'error', url?: string, error?: string }>>({});
    // State to toggle details
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    if (!IS_DEV) {
        return <div className="p-10 text-red-600">This page is for Development/QA only.</div>;
    }

    const resetHarness = () => {
        setResults({});
        setExpanded({});
    };

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const runScenario = async (scenario: Scenario) => {
        setResults(prev => ({ ...prev, [scenario.id]: { status: 'pending' } }));

        try {
            const gridData = createMockGrid(scenario.gridConfig);
            const usage = createMockUsage(gridData);
            const finalOptions = buildOptions(scenario.baseType, scenario.overrides);

            // Safe Capture of Blob URL
            const originalOpen = window.open;
            let capturedUrl = '';

            try {
                window.open = (url: string | URL | undefined, target?: string | undefined, features?: string | undefined) => {
                    if (url) capturedUrl = url.toString();
                    return null; // Block actual popup
                };

                await exportPixelGridToPDF(
                    `QA_${scenario.id}`,
                    gridData,
                    MOCK_PALETTE,
                    usage,
                    { ...finalOptions, preview: true }, // Force preview
                    { yarnPerStitch: 1 },
                    false
                );
            } finally {
                // ALWAYS restore window.open
                window.open = originalOpen;
            }

            if (capturedUrl) {
                setResults(prev => ({ ...prev, [scenario.id]: { status: 'success', url: capturedUrl } }));
            } else {
                setResults(prev => ({ ...prev, [scenario.id]: { status: 'error', error: 'Could not capture Blob URL' } }));
            }

        } catch (e: any) {
            console.error(e);
            setResults(prev => ({ ...prev, [scenario.id]: { status: 'error', error: e.message } }));
        }
    };

    const runAll = async () => {
        for (const s of SCENARIOS) {
            await runScenario(s);
        }
    };

    return (
        <div className="p-8 bg-gray-50 h-full overflow-auto pb-20">
            <h1 className="text-3xl font-bold mb-2">Export Engine QA Harness V2</h1>
            <p className="text-gray-600 mb-6">Internal tool for verification of PDF Export V2 Logic with Canonical Defaults.</p>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={runAll}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Run All Scenarios
                </button>
                <button
                    onClick={resetHarness}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 border border-gray-300"
                >
                    Reset Results
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {SCENARIOS.map(s => {
                            const res = results[s.id];
                            const isExpanded = expanded[s.id];
                            const finalOptions = buildOptions(s.baseType, s.overrides);

                            return (
                                <React.Fragment key={s.id}>
                                    <tr className={isExpanded ? "bg-blue-50" : ""}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleExpand(s.id)}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none font-bold"
                                            >
                                                {isExpanded ? '▼' : '▶'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{s.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => runScenario(s)}
                                                className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                            >
                                                Run
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {!res && <span className="text-gray-400">Idle</span>}
                                            {res?.status === 'pending' && <span className="text-yellow-500 font-medium">Running...</span>}
                                            {res?.status === 'success' && <span className="text-green-600 font-medium">Success</span>}
                                            {res?.status === 'error' && <span className="text-red-600 font-medium">Error</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {res?.status === 'success' && res.url && (
                                                <a
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200"
                                                >
                                                    View PDF
                                                </a>
                                            )}
                                            {res?.status === 'error' && (
                                                <span className="text-red-500 text-xs">{res.error}</span>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="text-sm text-gray-700 space-y-2">
                                                    <div>
                                                        <strong className="block mb-1">Expected Outcome:</strong>
                                                        <p className="bg-white p-2 rounded border border-gray-200">{s.expected}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <strong className="block mb-1">Grid Config:</strong>
                                                            <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs">
                                                                {JSON.stringify(s.gridConfig, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <strong className="block mb-1">Final Export Options:</strong>
                                                            <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                                                                {JSON.stringify(finalOptions, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
